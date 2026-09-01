/**
 * Combines the labellers' files into the single labels.json the validation
 * harness reads, and reports how often they disagreed.
 *
 *   bun scripts/merge-labels.ts anirudh harshini
 *
 * The disagreement rate is not bookkeeping. Two people who disagree on 12% of
 * threads have set a ceiling: no classifier can be judged against a standard
 * the humans themselves do not share, so ~88% is the realistic maximum score,
 * not 100%. Reporting a classifier's accuracy without it overstates what the
 * number means.
 *
 * Rows where the two disagree are dropped rather than guessed at. A contested
 * label makes a worse ruler than no label.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const names = process.argv.slice(2);
if (names.length < 1) {
  console.error("Usage: bun scripts/merge-labels.ts <name> [name2]");
  process.exit(1);
}

const dir = join(import.meta.dirname, "../data");
const sets = names.map((n) => ({
  name: n,
  rows: JSON.parse(readFileSync(join(dir, `labels-${n}.json`), "utf8")) as {
    id: string;
    human: boolean | null;
    [k: string]: unknown;
  }[],
}));

const base = sets[0].rows;

if (sets.length === 1) {
  const labelled = base.filter((r) => r.human !== null);
  writeFileSync(join(dir, "labels.json"), JSON.stringify(labelled, null, 2));
  console.log(`${labelled.length} labels from ${names[0]} alone.`);
  console.log("No second labeller, so there is no agreement ceiling to report.");
  process.exit(0);
}

const byId = new Map(sets[1].rows.map((r) => [r.id, r.human]));

let agree = 0;
let disagree = 0;
const merged: unknown[] = [];

for (const row of base) {
  const other = byId.get(row.id);
  if (row.human === null || other === null || other === undefined) continue;
  if (row.human === other) {
    agree++;
    merged.push(row);
  } else {
    disagree++;
  }
}

const total = agree + disagree;
writeFileSync(join(dir, "labels.json"), JSON.stringify(merged, null, 2));

const ceiling = total > 0 ? agree / total : 0;
const yes = merged.filter((r) => (r as { human: boolean }).human).length;

console.log(`
Both labelled ${total} of the same threads.
  agreed     ${agree}
  disagreed  ${disagree}

Human agreement: ${(ceiling * 100).toFixed(0)}%. That is the ceiling — no
classifier should be expected to beat the humans it is scored against.

Wrote ${merged.length} agreed labels to data/labels.json
  ${yes} real catches, ${merged.length - yes} nits.
`);

writeFileSync(
  join(dir, "label-agreement.json"),
  JSON.stringify({ labellers: names, agreed: agree, disagreed: disagree, ceiling }, null, 2),
);
