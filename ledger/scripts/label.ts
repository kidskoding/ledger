/**
 * Blind labelling tool.
 *
 * Shows one review comment at a time and records a verdict. It never displays
 * what Granite decided — that is the whole point: a label influenced by the
 * classifier cannot be used to score the classifier.
 *
 *   bun scripts/label.ts anirudh
 *   bun scripts/label.ts harshini
 *
 * Each labeller writes their own file, so the two can be compared afterwards.
 * Progress saves after every keystroke, so it is safe to stop and resume.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const who = process.argv[2];
if (!who) {
  console.error("Usage: bun scripts/label.ts <your-name>");
  process.exit(1);
}

const dir = join(import.meta.dirname, "../data");
const source = JSON.parse(readFileSync(join(dir, "labels.json"), "utf8"));
const outPath = join(dir, `labels-${who}.json`);

interface Row {
  id: string;
  repo: string;
  commentBody: string;
  path: string;
  line: number;
  url: string;
  human: boolean | null;
}

const rows: Row[] = existsSync(outPath)
  ? JSON.parse(readFileSync(outPath, "utf8"))
  : source.map((r: Row) => ({ ...r, human: null }));

const save = () => writeFileSync(outPath, JSON.stringify(rows, null, 2));

const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;

console.log(`
${bold("Blind labelling")} — ${who}

For each review comment, decide what it is:

  ${bold("y")}  a real catch      correctness, security, performance, or design
  ${bold("n")}  a style nit       naming, formatting, typo, preference
  ${bold("s")}  skip for now
  ${bold("q")}  quit and save

Judge the comment on its own. Open the link if you genuinely cannot tell.
`);

// Raw mode gives one-keypress answers, but it is unavailable when stdin is
// not a TTY (running through a package-script wrapper, for instance). Fall
// back to reading a line so the tool works either way.
const raw = typeof process.stdin.setRawMode === "function";
if (raw) process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding("utf8");

let index = rows.findIndex((r) => r.human === null);

function show() {
  index = rows.findIndex((r) => r.human === null);
  if (index === -1) {
    const yes = rows.filter((r) => r.human === true).length;
    console.log(`\n${bold("Done.")} ${rows.length} labelled — ${yes} real catches, ${rows.length - yes} nits.`);
    console.log(dim(`Saved to data/labels-${who}.json`));
    process.exit(0);
  }
  const r = rows[index];
  const done = rows.filter((x) => x.human !== null).length;
  console.log(
    `\n${dim("─".repeat(72))}\n${dim(`${done + 1} of ${rows.length}`)}  ${dim(r.repo)}  ${dim(r.path + ":" + r.line)}\n`,
  );
  console.log(r.commentBody.trim().slice(0, 700));
  console.log(`\n${dim(r.url)}`);
  process.stdout.write(
    `\n${bold("catch (y) / nit (n) / skip (s) / quit (q)")}${raw ? "? " : " then Enter: "}`,
  );
}

function handle(k: string): void {
  if (k === "q") {
    save();
    const done = rows.filter((r) => r.human !== null).length;
    console.log(`\n\nSaved ${done} of ${rows.length}. Run the same command to resume.`);
    process.exit(0);
  }
  if (k === "y") rows[index].human = true;
  else if (k === "n") rows[index].human = false;
  else if (k === "s") rows.push(rows.splice(index, 1)[0]);
  else return;
  save();
  show();
}

process.stdin.on("data", (chunk: string) => {
  if (chunk.includes("\u0003")) {
    save();
    process.exit(0);
  }
  // A chunk may carry several answers when input is piped rather than typed.
  for (const ch of chunk.toLowerCase().replace(/[^ynsq]/g, "")) handle(ch);
});

show();
