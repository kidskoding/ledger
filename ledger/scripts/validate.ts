import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { classify } from "../lib/ledger/granite";
import { classifyByKeyword } from "../lib/ledger/baseline";

interface Labelled {
  id: string;
  commentBody: string;
  path: string;
  line: number;
  /** The human verdict. Set by hand, blind to both classifiers. */
  human: boolean;
}

async function main() {
  const path = join(import.meta.dirname, "../data/labels.json");
  const labels: Labelled[] = JSON.parse(readFileSync(path, "utf8"));
  if (labels.length === 0) throw new Error("data/labels.json is empty");

  let granite = 0;
  let baseline = 0;
  let graniteOnly = 0;
  let baselineOnly = 0;
  let bothWrong = 0;

  for (const row of labels) {
    const g = (await classify(row)).substantive === row.human;
    const b = classifyByKeyword(row).substantive === row.human;
    if (g) granite++;
    if (b) baseline++;
    if (g && !b) graniteOnly++;
    if (b && !g) baselineOnly++;
    if (!g && !b) bothWrong++;
    process.stderr.write(g ? "." : "x");
  }

  const n = labels.length;
  const out = {
    n,
    graniteAgreement: granite / n,
    baselineAgreement: baseline / n,
    graniteOnly,
    baselineOnly,
    bothWrong,
  };
  writeFileSync(
    join(import.meta.dirname, "../data/validation.json"),
    JSON.stringify(out, null, 2),
  );
  console.error(
    `\nGranite ${granite}/${n}  ·  keyword baseline ${baseline}/${n}` +
      `\nGranite alone was right on ${graniteOnly}; the baseline alone on ${baselineOnly}; both wrong on ${bothWrong}.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
