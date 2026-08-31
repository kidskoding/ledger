/**
 * Summary figures derived from a finished run.
 *
 * These are the numbers the page leads with, so they are computed here
 * rather than in a component: one definition, covered by tests, shared by
 * the verdict band and the reviewer breakdown.
 */

import type { PreventedEvent, RunResult } from "./types.ts";

export interface ReviewerTally {
  reviewer: string;
  count: number;
  /** Fraction of all prevented events, 0..1. */
  share: number;
}

/**
 * Prevented events per reviewer, most first. Ties break alphabetically so
 * the order is stable across runs rather than dependent on event order.
 */
export function reviewerTally(events: PreventedEvent[]): ReviewerTally[] {
  const counts = new Map<string, number>();
  for (const event of events) {
    counts.set(event.reviewer, (counts.get(event.reviewer) ?? 0) + 1);
  }

  const total = events.length;
  return [...counts.entries()]
    .map(([reviewer, count]) => ({
      reviewer,
      count,
      share: total === 0 ? 0 : count / total,
    }))
    .sort((a, b) => b.count - a.count || a.reviewer.localeCompare(b.reviewer));
}

/**
 * Lines the review changed: every prevented event carries the size of the
 * commit that answered it, so the sum is code that shipped differently
 * because someone said something.
 */
export function linesChangedByReview(events: PreventedEvent[]): number {
  return events.reduce((sum, event) => sum + event.linesChanged, 0);
}

export interface Verdict {
  events: number;
  linesChanged: number;
  reviewers: number;
  prsAnalyzed: number;
  contributors: number;
  /** Share of events from the top `n` reviewers, 0..1. */
  topShare: number;
  topN: number;
}

/** How many reviewers the concentration sentence quotes. */
const TOP_N = 3;

export function verdict(result: RunResult): Verdict {
  const tally = reviewerTally(result.events);
  const topN = Math.min(TOP_N, tally.length);
  const topShare = tally.slice(0, topN).reduce((sum, row) => sum + row.share, 0);

  return {
    events: result.events.length,
    linesChanged: linesChangedByReview(result.events),
    reviewers: tally.length,
    prsAnalyzed: result.prsAnalyzed,
    contributors: result.contributors.length,
    topShare,
    topN,
  };
}
