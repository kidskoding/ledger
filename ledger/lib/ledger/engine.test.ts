import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { classifyByKeyword } from "./baseline.ts";
import { severityForPath } from "./severity.ts";
import { cycleBuckets } from "./cycles.ts";
import type { RawPull } from "./fetch.ts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeComment(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    body: "looks good",
    path: "src/parser.ts",
    line: 10,
    user: "reviewer",
    createdAt: "2025-01-10T09:00:00Z",
    htmlUrl: "https://github.com/o/r/pull/1#discussion_r1",
    diffHunk: "",
    ...overrides,
  };
}

function makeCommit(committedAt: string, path = "src/parser.ts") {
  return {
    sha: `sha-${committedAt}`,
    htmlUrl: `https://github.com/o/r/commit/sha-${committedAt}`,
    committedAt,
    files: [{ path, additions: 1, deletions: 0 }],
  };
}

function makePull(
  mergedAt: string,
  comments: ReturnType<typeof makeComment>[] = [],
  commits: ReturnType<typeof makeCommit>[] = [],
): RawPull {
  return {
    number: 1,
    title: "PR",
    author: "author",
    mergedAt,
    reviewComments: comments,
    commits,
    files: [],
  };
}

// ---------------------------------------------------------------------------
// baseline classifier
// ---------------------------------------------------------------------------

describe("classifyByKeyword", () => {
  it("a comment saying 'this has a race condition' is substantive", () => {
    const result = classifyByKeyword({ commentBody: "this has a race condition", path: "src/a.ts", line: 1 });
    assert.equal(result.substantive, true);
    assert.equal(result.classifier, "baseline");
    assert.equal(result.summary, "");
  });

  it("'nit: rename this' is not substantive", () => {
    const result = classifyByKeyword({ commentBody: "nit: rename this variable", path: "src/a.ts", line: 1 });
    assert.equal(result.substantive, false);
  });

  it("'nit: this null check is missing' is not substantive — negative markers win", () => {
    const result = classifyByKeyword({ commentBody: "nit: this null check is missing", path: "src/a.ts", line: 1 });
    assert.equal(result.substantive, false);
  });

  it("'nullable field' does not match the 'null' keyword", () => {
    const result = classifyByKeyword({ commentBody: "this is a nullable field", path: "src/a.ts", line: 1 });
    assert.equal(result.substantive, false);
  });
});

// ---------------------------------------------------------------------------
// severity scorer
// ---------------------------------------------------------------------------

describe("severityForPath", () => {
  it("src/auth/token.ts is high", () => {
    assert.equal(severityForPath("src/auth/token.ts"), "high");
  });

  it("tests/auth/token.test.ts is low — test wins over auth", () => {
    assert.equal(severityForPath("tests/auth/token.test.ts"), "low");
  });

  it("src/parser.ts is medium", () => {
    assert.equal(severityForPath("src/parser.ts"), "medium");
  });

  it("README.md is low", () => {
    assert.equal(severityForPath("README.md"), "low");
  });
});

// ---------------------------------------------------------------------------
// cycle buckets
// ---------------------------------------------------------------------------

describe("cycleBuckets", () => {
  it("a PR with two comment-then-commit rounds counts 2 cycles", () => {
    // Comment at 09:00, commit at 10:00 → cycle 1
    // Comment at 11:00, commit at 12:00 → cycle 2
    const pull = makePull(
      "2025-01-31T12:00:00Z",
      [
        makeComment({ createdAt: "2025-01-10T09:00:00Z" }),
        makeComment({ id: 2, createdAt: "2025-01-10T11:00:00Z" }),
      ],
      [
        makeCommit("2025-01-10T10:00:00Z"),
        makeCommit("2025-01-10T12:00:00Z"),
      ],
    );

    // Need 5 PRs minimum for a bucket — pad with no-comment PRs (cycles=1)
    const pads = Array.from({ length: 4 }, (_, i) =>
      makePull("2025-01-15T00:00:00Z"),
    );

    const buckets = cycleBuckets([pull, ...pads]);
    assert.equal(buckets.length, 1);
    assert.equal(buckets[0].period, "2025-Q1");
    // median of [2, 1, 1, 1, 1] = 1
    assert.equal(buckets[0].medianCycles, 1);
    assert.equal(buckets[0].prCount, 5);
  });

  it("a PR with no comments counts 1 cycle", () => {
    const pulls = Array.from({ length: 5 }, () =>
      makePull("2025-04-30T00:00:00Z"),
    );
    const buckets = cycleBuckets(pulls);
    assert.equal(buckets.length, 1);
    assert.equal(buckets[0].medianCycles, 1);
  });

  it("a quarter with 4 pull requests is dropped", () => {
    const pulls = Array.from({ length: 4 }, () =>
      makePull("2025-07-15T00:00:00Z"),
    );
    const buckets = cycleBuckets(pulls);
    assert.equal(buckets.length, 0);
  });

  it("buckets sort oldest first", () => {
    const q2pulls = Array.from({ length: 5 }, () => makePull("2025-04-15T00:00:00Z"));
    const q1pulls = Array.from({ length: 5 }, () => makePull("2025-01-15T00:00:00Z"));
    // Pass q2 first, expect q1 to come out first
    const buckets = cycleBuckets([...q2pulls, ...q1pulls]);
    assert.equal(buckets.length, 2);
    assert.equal(buckets[0].period, "2025-Q1");
    assert.equal(buckets[1].period, "2025-Q2");
  });
});
