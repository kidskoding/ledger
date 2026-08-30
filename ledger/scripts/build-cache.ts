import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fetchPullRequests } from "../lib/ledger/fetch";
import { detectCandidates } from "../lib/ledger/detect";
import { classify } from "../lib/ledger/granite";
import { severityForPath } from "../lib/ledger/severity";
import { cycleBuckets } from "../lib/ledger/cycles";
import { spearman } from "../lib/stats";
import { SEVERITY_WEIGHT } from "../lib/ledger/types";
import type { PreventedEvent, Contributor, RunResult } from "../lib/ledger/types";

const STUDY_REPOS: Record<string, string> = {
  pandas: "pandas-dev/pandas",
  ruff: "astral-sh/ruff",
  next: "vercel/next.js",
};

const PR_LIMIT = 150;
// Bounds worst-case loss on a mid-run failure to ~10 PRs of classify calls
// (a few minutes) without paying for a disk write on every single PR.
const CHECKPOINT_EVERY = 10;

async function analyze(repo: string, limit: number, out: string): Promise<RunResult> {
  const pulls = await fetchPullRequests(repo, limit);
  const events: PreventedEvent[] = [];

  const byLogin = new Map<string, Contributor>();
  const ensure = (login: string): Contributor => {
    let row = byLogin.get(login);
    if (!row) {
      row = {
        login,
        prsMerged: 0,
        commits: 0,
        linesAdded: 0,
        preventedEvents: 0,
        preventedWeighted: 0,
      };
      byLogin.set(login, row);
    }
    return row;
  };

  // Every contributor in the map is a rankable data point -- prsMerged === 0
  // is a real last-place rank, not a missing value, and it's exactly the
  // reviewer-who-never-ships case the whole comparison is about. Correlate
  // and count over the full population, not a filtered subset.
  const snapshot = (prsAnalyzed: number): RunResult => {
    const contributors = [...byLogin.values()];
    return {
      repo,
      generatedAt: new Date().toISOString(),
      prsAnalyzed,
      events,
      contributors: [...contributors].sort(
        (a, b) => b.preventedWeighted - a.preventedWeighted,
      ),
      cycles: cycleBuckets(pulls),
      correlation: {
        rho: spearman(
          contributors.map((c) => c.prsMerged),
          contributors.map((c) => c.preventedWeighted),
        ),
        n: contributors.length,
      },
    };
  };

  for (let i = 0; i < pulls.length; i++) {
    const pull = pulls[i];
    try {
      for (const candidate of detectCandidates(pull, repo)) {
        const classification = await classify(candidate);
        if (!classification.substantive) continue;
        const event: PreventedEvent = {
          ...candidate,
          severity: severityForPath(candidate.path),
          classification,
        };
        events.push(event);
        const reviewerRow = ensure(event.reviewer);
        reviewerRow.preventedEvents += 1;
        reviewerRow.preventedWeighted += SEVERITY_WEIGHT[event.severity];
      }

      const authorRow = ensure(pull.author);
      authorRow.prsMerged += 1;
      authorRow.commits += pull.commits.length;
      for (const commit of pull.commits) {
        for (const file of commit.files) authorRow.linesAdded += file.additions;
      }
    } catch (error) {
      // ponytail: one bad PR doesn't roll back partial events/tallies already
      // recorded for it -- acceptable, the run continuing is what matters.
      console.error(
        `\n  warning: ${repo}#${pull.number} failed, skipping: ${(error as Error).message}`,
      );
    }
    process.stderr.write(".");

    if ((i + 1) % CHECKPOINT_EVERY === 0) {
      writeFileSync(out, JSON.stringify(snapshot(i + 1), null, 2));
    }
  }

  const result = snapshot(pulls.length);
  writeFileSync(out, JSON.stringify(result, null, 2));
  return result;
}

async function main() {
  const only = process.argv[2];
  const targets = only ? { [only]: STUDY_REPOS[only] } : STUDY_REPOS;
  mkdirSync(join(import.meta.dirname, "../data"), { recursive: true });

  for (const [slug, repo] of Object.entries(targets)) {
    if (!repo) throw new Error(`unknown study repo: ${slug}`);
    console.error(`\n${repo} ...`);
    const out = join(import.meta.dirname, `../data/${slug}.json`);
    const result = await analyze(repo, PR_LIMIT, out);
    console.error(
      `\n  ${result.events.length} events, rho ${result.correlation.rho.toFixed(2)} -> ${out}`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
