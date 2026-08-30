/**
 * Review-cycle counter.
 *
 * A "review cycle" is one round of review (a comment) followed by at least
 * one commit. We count how many such rounds occurred in a pull request, then
 * bucket by the quarter of merge and report the median.
 *
 * Buckets with fewer than 5 PRs are dropped — a median over 3 items is noise.
 */

import type { CycleBucket } from "./types.ts";
import type { RawPull } from "./fetch.ts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Count review cycles for one pull request.
 *
 * Algorithm: walk review comments and commits in chronological order. Each
 * time we see a comment followed by at least one later commit, that is one
 * cycle. Minimum 1 — a PR that was merged has at least one implicit round.
 */
function countCycles(pull: RawPull): number {
  if (pull.reviewComments.length === 0) return 1;

  // Sort commits ascending by date
  const commits = [...pull.commits].sort(
    (a, b) => new Date(a.committedAt).getTime() - new Date(b.committedAt).getTime(),
  );

  let cycles = 0;
  for (const comment of pull.reviewComments) {
    const commentTime = new Date(comment.createdAt).getTime();
    const hasLaterCommit = commits.some(
      (c) => new Date(c.committedAt).getTime() > commentTime,
    );
    if (hasLaterCommit) cycles++;
  }

  // Each comment that triggered a commit is one cycle; minimum 1
  return Math.max(1, cycles);
}

/**
 * Convert an ISO date string to a quarter label, e.g. `"2025-Q1"`.
 */
function toQuarter(isoDate: string): string {
  const d = new Date(isoDate);
  const year = d.getUTCFullYear();
  const quarter = Math.floor(d.getUTCMonth() / 3) + 1;
  return `${year}-Q${quarter}`;
}

/**
 * Compute the median of a numeric array. Returns 0 for an empty array.
 */
function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Bucket pull requests by the quarter of `mergedAt` and return the median
 * review-cycle count per bucket, sorted oldest-first.
 *
 * Buckets with fewer than 5 pull requests are dropped.
 */
export function cycleBuckets(pulls: RawPull[]): CycleBucket[] {
  // Group cycle counts by quarter
  const bucketMap = new Map<string, number[]>();

  for (const pull of pulls) {
    if (!pull.mergedAt) continue;
    const period = toQuarter(pull.mergedAt);
    const cycles = countCycles(pull);
    const existing = bucketMap.get(period) ?? [];
    existing.push(cycles);
    bucketMap.set(period, existing);
  }

  // Build result, filtering out small buckets, sorted oldest-first
  return [...bucketMap.entries()]
    .filter(([, counts]) => counts.length >= 5)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, counts]) => ({
      period,
      medianCycles: median(counts),
      prCount: counts.length,
    }));
}
