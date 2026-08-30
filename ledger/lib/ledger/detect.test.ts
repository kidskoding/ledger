import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { detectCandidates, changedLines } from "./detect.ts";
import type { RawPull } from "./fetch.ts";

// ---------------------------------------------------------------------------
// Helpers to build minimal RawPull fixtures
// ---------------------------------------------------------------------------

const REPO = "owner/repo";

function makePull(overrides: Partial<RawPull> = {}): RawPull {
  return {
    number: 1,
    title: "Fix retry jitter",
    author: "author-one",
    mergedAt: "2026-06-14T10:00:00Z",
    reviewComments: [],
    commits: [],
    files: [],
    ...overrides,
  };
}

function makeComment(overrides: Record<string, unknown> = {}) {
  return {
    id: 1111,
    body: "This has no jitter.",
    path: "src/retry.ts",
    line: 88,
    user: "reviewer-one",
    createdAt: "2026-06-14T09:00:00Z",
    htmlUrl: "https://github.com/owner/repo/pull/1#discussion_r1111",
    diffHunk: "@@ -85,6 +85,9 @@",
    ...overrides,
  };
}

function makeCommit(overrides: Record<string, unknown> = {}) {
  return {
    sha: "abc123",
    htmlUrl: "https://github.com/owner/repo/commit/abc123",
    // Default: after the comment
    committedAt: "2026-06-14T09:30:00Z",
    files: [
      {
        path: "src/retry.ts",
        additions: 5,
        deletions: 2,
        // Patch that touches line 88 (hunk starts at 85, +line 88 = line 4 of hunk)
        patch: "@@ -85,10 +85,13 @@\n context\n context\n context\n+added line at 88\n context",
      },
    ],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Unit tests for changedLines (patch parser)
// ---------------------------------------------------------------------------

describe("changedLines", () => {
  it("returns added line numbers from a simple patch", () => {
    const patch = "@@ -1,3 +1,4 @@\n context\n+new line\n context\n context";
    const lines = changedLines(patch);
    assert.ok(lines.has(2), "line 2 should be in changed set");
  });

  it("handles multiple hunks", () => {
    const patch =
      "@@ -1,3 +1,4 @@\n context\n+added at 2\n context\n@@ -50,3 +51,4 @@\n ctx\n+added at 52\n ctx";
    const lines = changedLines(patch);
    assert.ok(lines.has(2));
    assert.ok(lines.has(52));
  });
});

// ---------------------------------------------------------------------------
// detectCandidates — the six required cases
// ---------------------------------------------------------------------------

describe("detectCandidates", () => {
  it("yields one candidate when a later commit touches the same file and line", () => {
    const pull = makePull({
      reviewComments: [makeComment()],
      commits: [makeCommit()],
    });

    const candidates = detectCandidates(pull, REPO);
    assert.equal(candidates.length, 1);

    const c = candidates[0];
    assert.equal(c.id, `${REPO}#1:1111`);
    assert.equal(c.prNumber, 1);
    assert.equal(c.reviewer, "reviewer-one");
    assert.equal(c.author, "author-one");
    assert.equal(c.path, "src/retry.ts");
    assert.equal(c.line, 88);
    assert.equal(c.fixCommitSha, "abc123");
    assert.equal(c.linesChanged, 7); // 5 additions + 2 deletions
  });

  it("yields no candidates when the commit is before the comment", () => {
    const pull = makePull({
      reviewComments: [makeComment({ createdAt: "2026-06-14T09:00:00Z" })],
      commits: [
        makeCommit({ committedAt: "2026-06-14T08:59:59Z" }), // before comment
      ],
    });

    const candidates = detectCandidates(pull, REPO);
    assert.equal(candidates.length, 0);
  });

  it("yields no candidates when the commit touches a different file", () => {
    const pull = makePull({
      reviewComments: [makeComment({ path: "src/retry.ts" })],
      commits: [
        makeCommit({
          files: [
            {
              path: "src/other.ts", // different file
              additions: 3,
              deletions: 1,
              patch: "@@ -85,3 +85,6 @@\n context\n+added line\n context",
            },
          ],
        }),
      ],
    });

    const candidates = detectCandidates(pull, REPO);
    assert.equal(candidates.length, 0);
  });

  it("yields no candidates when the comment is authored by the PR author", () => {
    const pull = makePull({
      author: "author-one",
      reviewComments: [makeComment({ user: "author-one" })], // same as PR author
      commits: [makeCommit()],
    });

    const candidates = detectCandidates(pull, REPO);
    assert.equal(candidates.length, 0);
  });

  it("yields no candidates for comments from bot accounts", () => {
    const pull = makePull({
      reviewComments: [makeComment({ user: "renovate[bot]" })],
      commits: [makeCommit()],
    });

    const candidates = detectCandidates(pull, REPO);
    assert.equal(candidates.length, 0);
  });

  it("yields no candidates when the commit touches the same file but 200 lines away", () => {
    // Comment is at line 88; patch starts at line 300 — well outside ±10
    const farPatch = "@@ -295,5 +295,8 @@\n ctx\n+added at 296\n+added at 297\n ctx\n ctx";

    const pull = makePull({
      reviewComments: [makeComment({ line: 88 })],
      commits: [
        makeCommit({
          files: [
            {
              path: "src/retry.ts",
              additions: 3,
              deletions: 0,
              patch: farPatch,
            },
          ],
        }),
      ],
    });

    const candidates = detectCandidates(pull, REPO);
    assert.equal(candidates.length, 0);
  });
});
