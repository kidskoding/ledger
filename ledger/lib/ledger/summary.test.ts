import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { linesChangedByReview, reviewerTally, verdict } from "./summary.ts";
import type { PreventedEvent, RunResult } from "./types.ts";

function makeEvent(reviewer: string, linesChanged = 10): PreventedEvent {
  return {
    id: `owner/repo#1:${reviewer}-${linesChanged}-${Math.random()}`,
    repo: "owner/repo",
    prNumber: 1,
    prTitle: "Fix retry jitter",
    reviewer,
    author: "author-one",
    commentId: 1,
    commentUrl: "https://example.invalid/c",
    commentBody: "This has no jitter.",
    path: "src/retry.ts",
    line: 88,
    fixCommitSha: "abc1234",
    fixCommitUrl: "https://example.invalid/s",
    linesChanged,
    severity: "medium",
    classification: { substantive: true, summary: "Adds jitter.", classifier: "granite" },
    createdAt: "2026-06-14T09:00:00Z",
  };
}

describe("reviewerTally", () => {
  it("counts per reviewer, most first", () => {
    const tally = reviewerTally([makeEvent("ana"), makeEvent("bo"), makeEvent("ana")]);
    assert.deepEqual(
      tally.map((r) => [r.reviewer, r.count]),
      [
        ["ana", 2],
        ["bo", 1],
      ],
    );
  });

  it("breaks ties alphabetically so the order is stable", () => {
    const tally = reviewerTally([makeEvent("zoe"), makeEvent("ana")]);
    assert.deepEqual(
      tally.map((r) => r.reviewer),
      ["ana", "zoe"],
    );
  });

  it("reports share as a fraction of all events", () => {
    const tally = reviewerTally([makeEvent("ana"), makeEvent("ana"), makeEvent("bo"), makeEvent("cy")]);
    assert.equal(tally[0].share, 0.5);
  });

  it("returns nothing for an empty run rather than dividing by zero", () => {
    assert.deepEqual(reviewerTally([]), []);
  });
});

describe("linesChangedByReview", () => {
  it("sums the commits that answered each comment", () => {
    assert.equal(linesChangedByReview([makeEvent("ana", 30), makeEvent("bo", 12)]), 42);
  });

  it("is zero with no events", () => {
    assert.equal(linesChangedByReview([]), 0);
  });
});

describe("verdict", () => {
  const result: RunResult = {
    repo: "owner/repo",
    generatedAt: "2026-08-31T00:00:00Z",
    prsAnalyzed: 150,
    events: [makeEvent("ana", 5), makeEvent("ana", 5), makeEvent("bo", 5), makeEvent("cy", 5)],
    contributors: [],
    cycles: [],
    correlation: { rho: 0.5, n: 3 },
  };

  it("reports the figures the verdict band prints", () => {
    const v = verdict(result);
    assert.equal(v.events, 4);
    assert.equal(v.linesChanged, 20);
    assert.equal(v.reviewers, 3);
    assert.equal(v.prsAnalyzed, 150);
  });

  it("quotes at most three reviewers, and never more than exist", () => {
    const v = verdict(result);
    assert.equal(v.topN, 3);
    assert.equal(v.topShare, 1);

    const thin = verdict({ ...result, events: [makeEvent("ana")] });
    assert.equal(thin.topN, 1);
  });

  it("survives a run with no events", () => {
    const v = verdict({ ...result, events: [] });
    assert.equal(v.events, 0);
    assert.equal(v.topShare, 0);
    assert.equal(v.topN, 0);
  });
});
