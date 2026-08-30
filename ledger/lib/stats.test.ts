import { test } from "node:test";
import assert from "node:assert/strict";
import { spearman, rankOf } from "./stats";

test("perfect positive correlation is 1", () => {
  assert.equal(spearman([1, 2, 3, 4], [10, 20, 30, 40]), 1);
});

test("perfect inversion is -1", () => {
  assert.equal(spearman([1, 2, 3, 4], [40, 30, 20, 10]), -1);
});

test("ties share the average rank", () => {
  assert.deepEqual(rankOf([10, 20, 20, 30]), [1, 2.5, 2.5, 4]);
});

test("fewer than two points is not a correlation", () => {
  assert.equal(spearman([1], [1]), 0);
});

test("mismatched lengths throw", () => {
  assert.throws(() => spearman([1, 2], [1]));
});

test("ties are corrected, not approximated by the shortcut formula", () => {
  // rankOf([1, 1, 1, 2]) = [2, 2, 2, 4];  rankOf([1, 2, 3, 4]) = [1, 2, 3, 4]
  // Pearson on those ranks = 3 / sqrt(3 * 5) = 0.7745966692414834
  // The tie-uncorrected shortcut 1 - 6*Sum(d^2)/(n*(n^2-1)) would give 0.8
  const rho = spearman([1, 1, 1, 2], [1, 2, 3, 4]);
  assert.ok(Math.abs(rho - 0.7745966692414834) < 1e-12, `expected ~0.7745966692414834, got ${rho}`);
});

test("zero variance returns 0", () => {
  // rankOf([5, 5, 5]) = [2, 2, 2] (no variance)
  // rankOf([1, 2, 3]) = [1, 2, 3] (has variance)
  // Pearson correlation with zero variance is 0
  assert.equal(spearman([5, 5, 5], [1, 2, 3]), 0);
});
