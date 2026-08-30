"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { PreventedEvent, RunEvent, RunResult } from "@/lib/ledger/types";
import { PreventedLog } from "@/components/prevented-log";
import { CorrelationView } from "@/components/correlation";
import { CycleTrend } from "@/components/cycle-trend";

/** Slug matches the key `/api/cached` expects; repo is the full owner/name shown to the reader. */
const STUDY_REPOS = [
  { slug: "pandas", repo: "pandas-dev/pandas" },
  { slug: "ruff", repo: "astral-sh/ruff" },
  { slug: "next", repo: "vercel/next.js" },
] as const;

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "streaming"; repo: string; prsTotal: number; prsDone: number }
  | { kind: "error"; message: string };

const BUTTON: CSSProperties = {
  minHeight: 44,
  padding: "0.5rem 1rem",
  border: "1px solid var(--rule-strong)",
  background: "transparent",
  color: "var(--ink)",
  cursor: "pointer",
};

function isValidRepo(value: string): boolean {
  return /^[^\s/]+\/[^\s/]+$/.test(value.trim());
}

function placeholderText(status: Status): string {
  if (status.kind === "loading") return "Loading…";
  if (status.kind === "streaming") return "Waiting for the run to finish.";
  if (status.kind === "error") return status.message;
  return "No repository opened.";
}

function placeholderColor(status: Status): string {
  return status.kind === "error" ? "var(--accent)" : "var(--ink-faint)";
}

function Section({ n, title, note, children }: { n: string; title: string; note: string; children: ReactNode }) {
  return (
    <section className="ruled stack" style={{ gap: "0.65rem" }}>
      <div style={{ display: "flex", gap: "1rem", alignItems: "baseline" }}>
        <span className="caption">{n}</span>
        <h2>{title}</h2>
      </div>
      <p style={{ color: "var(--ink-muted)", fontSize: "0.95rem" }}>{note}</p>
      {children}
    </section>
  );
}

export function RunClient() {
  const [result, setResult] = useState<RunResult | null>(null);
  const [liveEvents, setLiveEvents] = useState<PreventedEvent[]>([]);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [liveRepo, setLiveRepo] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const stopLiveRun = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  // Cancel an in-flight run if the reader navigates away mid-stream.
  useEffect(() => stopLiveRun, [stopLiveRun]);

  async function loadCached(slug: string) {
    stopLiveRun();
    setResult(null);
    setLiveEvents([]);
    setStatus({ kind: "loading" });
    try {
      const res = await fetch(`/api/cached?repo=${slug}`);
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body?.error ?? `Request failed (${res.status}).`);
      }
      setResult(body as RunResult);
      setStatus({ kind: "idle" });
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Failed to load." });
    }
  }

  function applyEvent(payload: RunEvent) {
    switch (payload.type) {
      case "start":
        setStatus({ kind: "streaming", repo: payload.repo, prsTotal: payload.prsToAnalyze, prsDone: 0 });
        break;
      case "progress":
        setStatus((prev) =>
          prev.kind === "streaming" ? { ...prev, prsDone: payload.prsDone, prsTotal: payload.prsTotal } : prev,
        );
        break;
      case "event":
        setLiveEvents((prev) => [...prev, payload.event]);
        break;
      case "done":
        setResult(payload.result);
        setStatus({ kind: "idle" });
        break;
      case "error":
        setStatus({ kind: "error", message: payload.message });
        break;
    }
  }

  async function startLiveRun(repo: string) {
    stopLiveRun();
    setResult(null);
    setLiveEvents([]);
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus({ kind: "streaming", repo, prsTotal: 0, prsDone: 0 });

    try {
      const res = await fetch(`/api/run?repo=${encodeURIComponent(repo)}`, { signal: controller.signal });
      if (!res.ok || !res.body) {
        throw new Error(`Could not start a run for "${repo}" (${res.status}).`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const frames = buffer.split("\n\n");
        buffer = frames.pop() ?? "";
        for (const frame of frames) {
          const dataLine = frame.split("\n").find((line) => line.startsWith("data:"));
          if (!dataLine) continue;
          applyEvent(JSON.parse(dataLine.slice(5).trim()) as RunEvent);
        }
      }
    } catch (err) {
      if (controller.signal.aborted) return; // cancelled by the reader, not a failure
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Live run failed." });
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  }

  const isStreaming = status.kind === "streaming";

  return (
    <div className="stack" style={{ gap: "3rem" }}>
      <section className="ruled stack" style={{ gap: "1rem", marginBottom: "1rem" }}>
        <p className="caption">Open a repository</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
          {STUDY_REPOS.map(({ slug, repo }) => (
            <button key={slug} type="button" className="mono" style={BUTTON} onClick={() => loadCached(slug)}>
              {repo}
            </button>
          ))}
        </div>

        <form
          className="stack"
          style={{ flexDirection: "row", flexWrap: "wrap", gap: "0.6rem" }}
          onSubmit={(e) => {
            e.preventDefault();
            if (isValidRepo(liveRepo)) startLiveRun(liveRepo.trim());
          }}
        >
          <input
            type="text"
            className="mono"
            placeholder="owner/name — run live"
            value={liveRepo}
            onChange={(e) => setLiveRepo(e.target.value)}
            style={{
              minHeight: 44,
              padding: "0 0.75rem",
              border: "1px solid var(--rule-strong)",
              background: "var(--paper)",
              color: "var(--ink)",
              flex: "1 1 220px",
            }}
          />
          <button type="submit" className="mono" style={BUTTON} disabled={!isValidRepo(liveRepo)}>
            Run live
          </button>
          {isStreaming && (
            <button type="button" className="mono" style={BUTTON} onClick={stopLiveRun}>
              Stop
            </button>
          )}
        </form>
      </section>

      <Section
        n="I"
        title="Prevented events"
        note="Review comments anchored to lines that a later commit changed, classified by IBM Granite as a substantive catch rather than a style nit."
      >
        {status.kind === "streaming" ? (
          <div className="stack" style={{ gap: "0.75rem" }}>
            <p className="mono" style={{ color: "var(--ink-muted)", fontSize: "0.85rem" }}>
              {status.prsTotal > 0
                ? `${status.prsDone} / ${status.prsTotal} pull requests`
                : `Starting run for ${status.repo}…`}
            </p>
            <PreventedLog events={liveEvents} />
          </div>
        ) : result ? (
          <PreventedLog events={result.events} />
        ) : (
          <p className="mono" style={{ color: placeholderColor(status) }}>
            {placeholderText(status)}
          </p>
        )}
      </Section>

      <Section
        n="II"
        title="Output against prevention"
        note="Conventional productivity metrics per contributor, against prevented events. The rank correlation is reported at whatever value it comes out to."
      >
        {result ? (
          <CorrelationView contributors={result.contributors} correlation={result.correlation} />
        ) : (
          <p className="mono" style={{ color: placeholderColor(status) }}>
            {placeholderText(status)}
          </p>
        )}
      </Section>

      <Section n="III" title="Review cycles" note="Review rounds per pull request over time. Counted, never estimated.">
        {result ? (
          <CycleTrend cycles={result.cycles} />
        ) : (
          <p className="mono" style={{ color: placeholderColor(status) }}>
            {placeholderText(status)}
          </p>
        )}
      </Section>
    </div>
  );
}
