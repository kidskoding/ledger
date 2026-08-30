/** Blast radius, derived from the file path a comment anchored to. */
export type Severity = "high" | "medium" | "low";

/** Which classifier produced a verdict. Both run during validation. */
export type ClassifierName = "granite" | "baseline";

export interface Classification {
  /** True when this is a real catch rather than a style nit. */
  substantive: boolean;
  /** One line: what was caught. Empty string when not substantive. */
  summary: string;
  classifier: ClassifierName;
}

/**
 * The fields a classifier actually reads. `Candidate` satisfies this
 * structurally, so detection call sites are unaffected, and scripts that
 * hold only a labelled comment can call a classifier without a cast.
 */
export interface ClassifiableCandidate {
  commentBody: string;
  path: string;
  line: number;
}

/**
 * A review comment anchored to specific lines, where a later commit
 * modified those same lines before merge, classified as substantive.
 */
export interface PreventedEvent {
  /** `${repo}#${prNumber}:${commentId}` */
  id: string;
  repo: string;
  prNumber: number;
  prTitle: string;
  /** Login of whoever left the comment. */
  reviewer: string;
  /** Login of the pull request author. */
  author: string;
  commentId: number;
  commentUrl: string;
  commentBody: string;
  /** File the comment anchored to. */
  path: string;
  /** Line in the diff the comment anchored to. */
  line: number;
  /** Commit that subsequently modified those lines. */
  fixCommitSha: string;
  fixCommitUrl: string;
  /** Lines added plus deleted in that commit, for the file above. */
  linesChanged: number;
  severity: Severity;
  classification: Classification;
  /** ISO 8601, UTC. */
  createdAt: string;
}

/** One row on each side of the output-vs-prevention comparison. */
export interface Contributor {
  login: string;
  prsMerged: number;
  commits: number;
  linesAdded: number;
  preventedEvents: number;
  /** Severity-weighted: high = 3, medium = 2, low = 1. */
  preventedWeighted: number;
}

/** Review rounds per PR, bucketed by quarter. */
export interface CycleBucket {
  /** e.g. "2024-Q1" */
  period: string;
  medianCycles: number;
  prCount: number;
}

export interface Correlation {
  /** Spearman rho between output rank and prevented rank. */
  rho: number;
  /** Contributors included (those with at least one merged PR). */
  n: number;
}

export interface RunResult {
  repo: string;
  /** ISO 8601, UTC. */
  generatedAt: string;
  prsAnalyzed: number;
  events: PreventedEvent[];
  contributors: Contributor[];
  cycles: CycleBucket[];
  correlation: Correlation;
}

/** Events streamed over SSE during a live run. */
export type RunEvent =
  | { type: "start"; repo: string; prsToAnalyze: number }
  | { type: "progress"; prsDone: number; prsTotal: number }
  | { type: "event"; event: PreventedEvent }
  | { type: "done"; result: RunResult }
  | { type: "error"; message: string };

export const SEVERITY_WEIGHT: Record<Severity, number> = {
  high: 3,
  medium: 2,
  low: 1,
};
