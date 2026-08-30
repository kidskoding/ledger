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
