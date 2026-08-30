import { NextResponse } from "next/server";
import type { RunResult } from "@/lib/ledger/types";

import pandas from "@/data/pandas.json";
import ruff from "@/data/ruff.json";
import next from "@/data/next.json";

const CACHED: Record<string, RunResult> = {
  pandas: pandas as RunResult,
  ruff: ruff as RunResult,
  next: next as RunResult,
};

export function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("repo") ?? "";
  const result = CACHED[slug];
  if (!result) {
    return NextResponse.json(
      { error: `No cached result for "${slug}".` },
      { status: 404 },
    );
  }
  return NextResponse.json(result);
}
