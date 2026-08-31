import type { APIRoute } from "astro";
import type { RunResult } from "../../../lib/ledger/types";

/**
 * Loaded by glob rather than by three named imports: a named import for a
 * study repo that has not been generated yet takes down the whole endpoint,
 * including the repos that do have data. With a glob, a missing file is just
 * a slug that 404s.
 */
const files = import.meta.glob<{ default: RunResult }>("../../../data/*.json", {
  eager: true,
});

const CACHED: Record<string, RunResult> = {};
for (const [path, mod] of Object.entries(files)) {
  const slug = path.split("/").pop()?.replace(/\.json$/, "");
  // labels.json and validation.json live alongside the study repos but are
  // not run results.
  if (!slug || slug === "labels" || slug === "validation") continue;
  CACHED[slug] = mod.default;
}

export const prerender = false;

export const GET: APIRoute = ({ url }) => {
  const slug = url.searchParams.get("repo") ?? "";
  const result = CACHED[slug];

  if (!result) {
    return new Response(
      JSON.stringify({
        error: `No cached result for "${slug}".`,
        available: Object.keys(CACHED),
      }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }

  return new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
      // Short, deliberately: study-repo data is regenerated during the build,
      // and a long cache could pin an empty placeholder in a viewer's browser
      // with no way to invalidate it.
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    },
  });
};
