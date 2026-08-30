import type { RunResult } from "./types";

/**
 * Hand-written sample shaped exactly like a real run. Used to build and
 * review the UI while the engine is under construction, and by the UI
 * tests. Never shipped as a result — the app only ever renders real data.
 */
export const FIXTURE: RunResult = {
  repo: "astral-sh/ruff",
  generatedAt: "2026-08-30T00:00:00Z",
  prsAnalyzed: 50,
  events: [
    {
      id: "astral-sh/ruff#9001:1111",
      repo: "astral-sh/ruff",
      prNumber: 9001,
      prTitle: "Add fix for unused-import in __init__.py",
      reviewer: "reviewer-one",
      author: "author-one",
      commentId: 1111,
      commentUrl: "https://github.com/astral-sh/ruff/pull/9001#discussion_r1111",
      commentBody:
        "This retries three times with no jitter. Under load every caller wakes at the same moment and hammers the endpoint.",
      path: "crates/ruff_server/src/session.rs",
      line: 142,
      fixCommitSha: "a1b2c3d4e5f60718293a4b5c6d7e8f9012345678",
      fixCommitUrl:
        "https://github.com/astral-sh/ruff/commit/a1b2c3d4e5f60718293a4b5c6d7e8f9012345678",
      linesChanged: 34,
      severity: "high",
      classification: {
        substantive: true,
        summary: "Caught a retry loop with no jitter that would synchronize callers",
        classifier: "granite",
      },
      createdAt: "2026-06-14T09:12:00Z",
    },
    {
      id: "astral-sh/ruff#9014:2222",
      repo: "astral-sh/ruff",
      prNumber: 9014,
      prTitle: "Support pyproject.toml overrides",
      reviewer: "reviewer-two",
      author: "author-one",
      commentId: 2222,
      commentUrl: "https://github.com/astral-sh/ruff/pull/9014#discussion_r2222",
      commentBody:
        "If the config file is absent this unwraps a None and panics rather than falling back to defaults.",
      path: "crates/ruff_workspace/src/resolver.rs",
      line: 87,
      fixCommitSha: "b2c3d4e5f60718293a4b5c6d7e8f901234567890",
      fixCommitUrl:
        "https://github.com/astral-sh/ruff/commit/b2c3d4e5f60718293a4b5c6d7e8f901234567890",
      linesChanged: 12,
      severity: "medium",
      classification: {
        substantive: true,
        summary: "Caught a panic on missing config instead of a default fallback",
        classifier: "granite",
      },
      createdAt: "2026-06-21T15:40:00Z",
    },
    {
      id: "astral-sh/ruff#9033:3333",
      repo: "astral-sh/ruff",
      prNumber: 9033,
      prTitle: "Update snapshot tests for new rule",
      reviewer: "reviewer-one",
      author: "author-two",
      commentId: 3333,
      commentUrl: "https://github.com/astral-sh/ruff/pull/9033#discussion_r3333",
      commentBody:
        "This snapshot was regenerated against the old fixture, so the assertion passes for the wrong reason.",
      path: "crates/ruff_linter/src/rules/pyflakes/mod.rs",
      line: 210,
      fixCommitSha: "c3d4e5f60718293a4b5c6d7e8f90123456789012",
      fixCommitUrl:
        "https://github.com/astral-sh/ruff/commit/c3d4e5f60718293a4b5c6d7e8f90123456789012",
      linesChanged: 6,
      severity: "low",
      classification: {
        substantive: true,
        summary: "Caught a snapshot regenerated against a stale fixture",
        classifier: "granite",
      },
      createdAt: "2026-07-02T11:05:00Z",
    },
  ],
  contributors: [
    {
      login: "author-one",
      prsMerged: 41,
      commits: 189,
      linesAdded: 7420,
      preventedEvents: 0,
      preventedWeighted: 0,
    },
    {
      login: "author-two",
      prsMerged: 28,
      commits: 121,
      linesAdded: 4310,
      preventedEvents: 0,
      preventedWeighted: 0,
    },
    {
      login: "reviewer-one",
      prsMerged: 6,
      commits: 22,
      linesAdded: 480,
      preventedEvents: 2,
      preventedWeighted: 4,
    },
    {
      login: "reviewer-two",
      prsMerged: 3,
      commits: 11,
      linesAdded: 190,
      preventedEvents: 1,
      preventedWeighted: 2,
    },
  ],
  cycles: [
    { period: "2024-Q3", medianCycles: 1.2, prCount: 210 },
    { period: "2024-Q4", medianCycles: 1.4, prCount: 245 },
    { period: "2025-Q1", medianCycles: 1.8, prCount: 268 },
    { period: "2025-Q2", medianCycles: 2.1, prCount: 291 },
    { period: "2025-Q3", medianCycles: 2.3, prCount: 302 },
    { period: "2025-Q4", medianCycles: 2.4, prCount: 315 },
  ],
  correlation: { rho: -0.74, n: 4 },
};
