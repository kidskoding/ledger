import type { APIRoute } from "astro";
import { allowRun, getCachedRun, putCachedRun } from "../../lib/ratelimit";
import { fetchPullRequests } from "../../../lib/ledger/fetch";
import { detectCandidates } from "../../../lib/ledger/detect";
import { classify } from "../../../lib/ledger/granite";
import { severityForPath } from "../../../lib/ledger/severity";
import { cycleBuckets } from "../../../lib/ledger/cycles";
import { spearman } from "../../../lib/stats";
import { SEVERITY_WEIGHT } from "../../../lib/ledger/types";
import type {
  PreventedEvent,
  Contributor,
  RunResult,
  RunEvent,
} from "../../../lib/ledger/types";

const PR_LIMIT = 50;
const REPO_PATTERN = /^[\w.-]+\/[\w.-]+$/;

export const prerender = false;

export const GET: APIRoute = ({ url, request }) => {
  const repo = url.searchParams.get("repo")?.trim() ?? "";
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: RunEvent) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));

      try {
        if (!REPO_PATTERN.test(repo)) {
          send({ type: "error", message: "Expected a repository as owner/name." });
          return;
        }

        if (!(await allowRun(ip))) {
          send({
            type: "error",
            message:
              "Five runs an hour. Try one of the study repositories meanwhile.",
          });
          return;
        }

        // A repeat run on the same repository costs no model calls.
        const cached = await getCachedRun<RunResult>(repo);
        if (cached) {
          send({ type: "done", result: cached });
          return;
        }

        const pulls = await fetchPullRequests(repo, PR_LIMIT);
        send({ type: "start", repo, prsToAnalyze: pulls.length });

        const events: PreventedEvent[] = [];
        let done = 0;

        for (const pull of pulls) {
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
              send({ type: "event", event });
            }
          } catch (error) {
            // One malformed pull request must not cost the whole run.
            console.warn(`skipped ${repo}#${pull.number}`, error);
          }
          send({ type: "progress", prsDone: ++done, prsTotal: pulls.length });
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

        // Every contributor is ranked, including those who never merged a pull
        // request. A reviewer who ships nothing and catches everything is the
        // finding, not an outlier to filter away.
        const contributors = [...byLogin.values()].sort(
          (a, b) => b.preventedWeighted - a.preventedWeighted,
        );

        const result: RunResult = {
          repo,
          generatedAt: new Date().toISOString(),
          prsAnalyzed: pulls.length,
          events,
          contributors,
          cycles: cycleBuckets(pulls),
          correlation: {
            rho: spearman(
              contributors.map((c) => c.prsMerged),
              contributors.map((c) => c.preventedWeighted),
            ),
            n: contributors.length,
          },
        };

        await putCachedRun(repo, result);
        send({ type: "done", result });
      } catch (error) {
        send({
          type: "error",
          message: error instanceof Error ? error.message : "Run failed.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
};
