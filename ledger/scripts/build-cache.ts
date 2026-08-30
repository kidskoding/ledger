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

async function analyze(repo: string, limit: number): Promise<RunResult> {
  const pulls = await fetchPullRequests(repo, limit);
  const events: PreventedEvent[] = [];

  for (const pull of pulls) {
    for (const candidate of detectCandidates(pull)) {
      const classification = await classify(candidate);
      if (!classification.substantive) continue;
      events.push({
        ...candidate,
        severity: severityForPath(candidate.path),
        classification,
      });
    }
    process.stderr.write(".");
  }

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

  for (const pull of pulls) {
    const row = ensure(pull.author);
    row.prsMerged += 1;
    row.commits += pull.commits.length;
    for (const commit of pull.commits) {
      for (const file of commit.files) row.linesAdded += file.additions;
    }
  }

  for (const event of events) {
    const row = ensure(event.reviewer);
    row.preventedEvents += 1;
    row.preventedWeighted += SEVERITY_WEIGHT[event.severity];
  }

  // Only contributors who actually shipped can be ranked on output.
  const ranked = [...byLogin.values()].filter((c) => c.prsMerged > 0);

  return {
    repo,
    generatedAt: new Date().toISOString(),
    prsAnalyzed: pulls.length,
    events,
    contributors: [...byLogin.values()].sort(
      (a, b) => b.preventedWeighted - a.preventedWeighted,
    ),
    cycles: cycleBuckets(pulls),
    correlation: {
      rho: spearman(
        ranked.map((c) => c.prsMerged),
        ranked.map((c) => c.preventedWeighted),
      ),
      n: ranked.length,
    },
  };
}

async function main() {
  const only = process.argv[2];
  const targets = only ? { [only]: STUDY_REPOS[only] } : STUDY_REPOS;
  mkdirSync(join(import.meta.dirname, "../data"), { recursive: true });

  for (const [slug, repo] of Object.entries(targets)) {
    if (!repo) throw new Error(`unknown study repo: ${slug}`);
    console.error(`\n${repo} ...`);
    const result = await analyze(repo, PR_LIMIT);
    const out = join(import.meta.dirname, `../data/${slug}.json`);
    writeFileSync(out, JSON.stringify(result, null, 2));
    console.error(
      `\n  ${result.events.length} events, rho ${result.correlation.rho.toFixed(2)} -> ${out}`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
