/**
 * Prevented-event detector.
 *
 * Inspects a single merged pull request and returns every review comment that
 * is deterministically linked to a later code change — i.e., a comment
 * anchored to a file+line that a subsequent commit modified within ±10 lines.
 *
 * Granite never runs here. This module is pure logic over already-fetched data.
 */

import type { PreventedEvent } from "./types.ts";
import type { RawPull, RawCommit } from "./fetch.ts";

/** A detected intervention, not yet classified or severity-ranked. */
export type Candidate = Omit<PreventedEvent, "severity" | "classification">;

// ---------------------------------------------------------------------------
// Patch parser — walks hunk headers, never regexes the whole patch
// ---------------------------------------------------------------------------

/**
 * Parse a unified-diff patch string and return the set of post-image line
 * numbers that were touched (added or changed) in the diff.
 *
 * Hunk header format: `@@ -old_start[,old_count] +new_start[,new_count] @@`
 *
 * We track the current position in the *new* file and emit every line that is
 * an addition (`+`) or a context line that immediately follows a deletion
 * (within the same hunk). The simpler and more conservative approach is to
 * emit the new-file line number for every `+` line and note the new-file
 * position of every `-` line (the surrounding context gives us proximity).
 *
 * For the ±10 proximity check, we only need to know which new-file line
 * numbers were modified; returning the set of all `+` lines and recording the
 * neighbourhood of `-` lines is sufficient.
 */
export function changedLines(patch: string): Set<number> {
  const result = new Set<number>();
  let newLine = 0;

  for (const raw of patch.split("\n")) {
    // Hunk header — reset current position
    if (raw.startsWith("@@")) {
      // Extract +new_start from `@@ -a[,b] +c[,d] @@`
      const m = raw.match(/\+(\d+)(?:,\d+)?/);
      if (m) newLine = parseInt(m[1], 10) - 1; // will be incremented on first non-meta line
      continue;
    }

    if (raw.startsWith("+")) {
      newLine++;
      result.add(newLine);
    } else if (raw.startsWith("-")) {
      // Deleted lines don't advance new-file counter but we record the
      // surrounding new-file position so proximity works for deletions too.
      // We add the current newLine (the line *before* the deleted block)
      // and newLine+1 (the line *after*). The ±10 window covers the rest.
      result.add(newLine);
      result.add(newLine + 1);
      // Do NOT increment newLine — deleted lines have no new-file position.
    } else if (raw.startsWith(" ")) {
      // Context line — just advance the counter
      newLine++;
    }
    // Lines starting with `\` (no newline at EOF) are ignored
  }

  return result;
}

/**
 * Return true when any line in `changed` is within ±10 of `anchor`.
 */
function isNear(changed: Set<number>, anchor: number): boolean {
  for (let delta = -10; delta <= 10; delta++) {
    if (changed.has(anchor + delta)) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Detect review comments in `pull` that were followed by a commit touching
 * the same file and line region. Returns one `Candidate` per such comment.
 *
 * Skips:
 *  - Comments authored by the PR author (self-review is not prevention).
 *  - Comments from bot accounts (login ending in `[bot]`).
 *  - Comments with no line anchor.
 *  - Commits that pre-date the comment.
 *  - Commits that touch a different file.
 *  - Commits whose patch doesn't reach within ±10 lines of the anchor.
 */
export function detectCandidates(pull: RawPull, repo: string): Candidate[] {
  const candidates: Candidate[] = [];
  // Use a set so the same comment can only produce one candidate even if
  // multiple commits satisfy the criteria — first match wins.
  const seen = new Set<number>();

  for (const comment of pull.reviewComments) {
    // Guard: skip nullish anchors (fetch.ts already filters these, but be safe)
    if (!comment.path || !comment.line) continue;

    // Skip self-review and bots
    if (comment.user === pull.author) continue;
    if (comment.user.endsWith("[bot]")) continue;

    // Skip if already matched by a previous commit
    if (seen.has(comment.id)) continue;

    const commentTime = new Date(comment.createdAt).getTime();

    for (const commit of pull.commits) {
      // Commit must be later than the comment
      if (new Date(commit.committedAt).getTime() <= commentTime) continue;

      // Find the file entry for the comment's path
      const file = commit.files.find((f) => f.path === comment.path);
      if (!file) continue;

      // No patch → can't check line proximity; skip
      if (!file.patch) continue;

      const changed = changedLines(file.patch);
      if (!isNear(changed, comment.line)) continue;

      // Match found — build the candidate
      candidates.push({
        id: `${repo}#${pull.number}:${comment.id}`,
        repo,
        prNumber: pull.number,
        prTitle: pull.title,
        reviewer: comment.user,
        author: pull.author,
        commentId: comment.id,
        commentUrl: comment.htmlUrl,
        commentBody: comment.body,
        path: comment.path,
        line: comment.line,
        fixCommitSha: commit.sha,
        fixCommitUrl: commit.htmlUrl,
        linesChanged: file.additions + file.deletions,
        createdAt: comment.createdAt,
      });

      seen.add(comment.id);
      break; // first matching commit is sufficient
    }
  }

  return candidates;
}
