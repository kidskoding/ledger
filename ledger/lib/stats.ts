/** Ranks ascending, ties sharing their average rank. */
export function rankOf(values: number[]): number[] {
  const order = values
    .map((value, index) => ({ value, index }))
    .sort((x, y) => x.value - y.value);

  const ranks = new Array<number>(values.length);
  let i = 0;
  while (i < order.length) {
    let j = i;
    while (j + 1 < order.length && order[j + 1].value === order[i].value) j++;
    const shared = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) ranks[order[k].index] = shared;
    i = j + 1;
  }
  return ranks;
}

/**
 * Spearman's rho: Pearson correlation of the ranks. Returns 0 for inputs
 * too small to correlate, or where one side has no variance at all.
 */
export function spearman(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`spearman: length mismatch, ${a.length} vs ${b.length}`);
  }
  if (a.length < 2) return 0;

  const ra = rankOf(a);
  const rb = rankOf(b);
  const n = ra.length;
  const meanA = ra.reduce((s, v) => s + v, 0) / n;
  const meanB = rb.reduce((s, v) => s + v, 0) / n;

  let num = 0;
  let devA = 0;
  let devB = 0;
  for (let i = 0; i < n; i++) {
    const da = ra[i] - meanA;
    const db = rb[i] - meanB;
    num += da * db;
    devA += da * da;
    devB += db * db;
  }

  const denom = Math.sqrt(devA * devB);
  return denom === 0 ? 0 : num / denom;
}
