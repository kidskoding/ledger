"use client";

import { useState, type CSSProperties } from "react";
import type { PreventedEvent, Severity } from "@/lib/ledger/types";

/** Fixed track widths so the header captions and every data row line up. */
const COLUMNS = "6rem minmax(220px,1.4fr) minmax(180px,1fr) 8rem 7rem";

/** Every interactive/text cell shares this padding so baselines line up
 * and the button/link cells get a full-height tap target (>=44px). */
const CELL: CSSProperties = { padding: "0.85rem 0" };

function severityColor(severity: Severity): string {
  if (severity === "high") return "var(--accent)";
  if (severity === "medium") return "var(--ink-muted)";
  return "var(--ink-faint)";
}

function isoDate(iso: string): string {
  return iso.slice(0, 10);
}

function pluralize(count: number, noun: string): string {
  return `${noun}${count === 1 ? "" : "s"}`;
}

function Row({ event }: { event: PreventedEvent }) {
  const [expanded, setExpanded] = useState(false);
  const detailId = `prevented-detail-${event.id}`;

  return (
    <div className="row" style={{ gridTemplateColumns: COLUMNS, padding: 0 }}>
      <span
        className="caption"
        style={{ ...CELL, color: severityColor(event.severity) }}
      >
        {event.severity}
      </span>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={detailId}
        style={{
          ...CELL,
          background: "none",
          border: 0,
          font: "inherit",
          color: "inherit",
          textAlign: "left",
          cursor: "pointer",
          width: "100%",
        }}
      >
        {event.classification.summary || event.prTitle}
      </button>

      <a
        href={event.commentUrl}
        target="_blank"
        rel="noreferrer noopener"
        className="mono"
        style={CELL}
      >
        {event.path}:{event.line}
      </a>

      <span style={CELL}>{event.reviewer}</span>

      <time className="fig" dateTime={event.createdAt} style={CELL}>
        {isoDate(event.createdAt)}
      </time>

      {expanded && (
        <div id={detailId} style={{ gridColumn: "1 / -1", padding: "0 0 1.1rem" }}>
          <p style={{ marginBottom: "0.6rem" }}>{event.commentBody}</p>
          <a
            href={event.fixCommitUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="mono"
          >
            fixed in {event.fixCommitSha.slice(0, 7)} (+{event.linesChanged})
          </a>
        </div>
      )}
    </div>
  );
}

export function PreventedLog({ events }: { events: PreventedEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="ruled">
        <p className="mono" style={{ color: "var(--ink-faint)" }}>
          No prevented events found in this sample.
        </p>
      </div>
    );
  }

  const prCount = new Set(events.map((e) => `${e.repo}#${e.prNumber}`)).size;
  const highCount = events.filter((e) => e.severity === "high").length;

  return (
    <div className="ruled">
      <p>
        <span className="fig" style={{ color: "var(--accent)" }}>
          {events.length} prevented {pluralize(events.length, "event")}
        </span>{" "}
        across <span className="fig">{prCount}</span> pull{" "}
        {pluralize(prCount, "request")}.{" "}
        <span className="fig">{highCount}</span> in high-blast-radius paths.
      </p>

      <div className="scroll-x" style={{ marginTop: "1rem" }}>
        <div style={{ minWidth: "48rem" }}>
          <div className="row" style={{ gridTemplateColumns: COLUMNS, padding: 0 }}>
            <span className="caption" style={CELL}>
              Severity
            </span>
            <span className="caption" style={CELL}>
              What was caught
            </span>
            <span className="caption" style={CELL}>
              Where
            </span>
            <span className="caption" style={CELL}>
              Who caught it
            </span>
            <span className="caption" style={CELL}>
              When
            </span>
          </div>

          <div className="rows">
            {events.map((event) => (
              <Row key={event.id} event={event} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
