import type { APIRoute } from "astro";
import type { RunResult } from "../../../lib/ledger/types";

import pandas from "../../../data/pandas.json";
import ruff from "../../../data/ruff.json";
import next from "../../../data/next.json";

const CACHED: Record<string, RunResult> = {
  pandas: pandas as RunResult,
  ruff: ruff as RunResult,
  next: next as RunResult,
};

export const prerender = false;

export const GET: APIRoute = ({ url }) => {
  const slug = url.searchParams.get("repo") ?? "";
  const result = CACHED[slug];

  if (!result) {
    return new Response(
      JSON.stringify({ error: `No cached result for "${slug}".` }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }

  return new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
      // Short, deliberately: the study-repo data is regenerated during the
      // build, and a long cache could pin an empty placeholder in a viewer's
      // browser with no way to invalidate it.
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    },
  });
};
