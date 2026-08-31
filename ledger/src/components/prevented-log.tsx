
import { useState, type CSSProperties } from "react";

import { SEVERITY_WEIGHT } from "@/lib/ledger/types";
import type { PreventedEvent, Severity } from "@/lib/ledger/types";
import { linesChangedByReview } from "@/lib/ledger/summary";

/**
 * A real repository produces well over a hundred events. Rendering them all
 * buries the two charts below thousands of pixels down, so the log shows the
 * highest-blast-radius ones first and keeps the rest one click away.
 */
const VISIBLE_BY_DEFAULT = 15;

/** Fixed track widths so the header captions and every data row line up. */
/* The reviewer track is sized for a real GitHub login, not a short one:
   `jorisvandenbossch` is seventeen characters and used to run straight
   through the date beside it. */
const COLUMNS = "5.5rem minmax(220px,1.4fr) minmax(170px,1fr) 11.5rem 7rem";

/**
 * Full repository paths run long enough to collide with the columns beside
 * them. The tail is the part that identifies the code, so keep that and let
 * the link's title carry the whole path.
 */
/* Roughly what the `Where` track fits before the cell ellipsis starts
   eating the line number off the end. */
const PATH_BUDGET = 26;

function shortenPath(path: string): string {
  const parts = path.split("/");
  if (parts.length <= 2) return path;

  const twoDeep = `\u2026/${parts.slice(-2).join("/")}`;
  // The line number is the part that makes the reference checkable, and it
  // sits at the end where the ellipsis would cut it. Drop directory depth
  // before letting that happen.
  return twoDeep.length <= PATH_BUDGET ? twoDeep : `\u2026/${parts[parts.length - 1]}`;
}

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
    <div role="row" className="row" style={{ gridTemplateColumns: COLUMNS, padding: 0 }}>
      <span
        role="cell"
        className="caption"
        style={{ ...CELL, color: severityColor(event.severity) }}
      >
        {event.severity}
      </span>

      <span role="cell">
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
      </span>

      <span role="cell">
        <a
          href={event.commentUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="mono"
          title={`${event.path}:${event.line}`}
          style={{
            ...CELL,
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {shortenPath(event.path)}:{event.line}
        </a>
      </span>

      <span role="cell" style={CELL}>{event.reviewer}</span>

      <time role="cell" className="fig" dateTime={event.createdAt} style={CELL}>
        {isoDate(event.createdAt)}
      </time>

      {expanded && (
        <div
          role="presentation"
          id={detailId}
          style={{ gridColumn: "1 / -1", padding: "0 0 1.1rem" }}
        >
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
  // Declared before the empty-run branch below: hook order has to be the
  // same on every render, and this component does go from zero events to
  // some when a repository is swapped underneath it.
  const [showAll, setShowAll] = useState(false);

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
  const linesChanged = linesChangedByReview(events);

  // Severity first, then most recent, so the strongest evidence is on screen
  // without scrolling.
  const ranked = [...events].sort(
    (a, b) =>
      SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity] ||
      b.createdAt.localeCompare(a.createdAt),
  );
  const shown = showAll ? ranked : ranked.slice(0, VISIBLE_BY_DEFAULT);

  return (
    <div className="ruled">
      <p>
        <span className="fig" style={{ color: "var(--accent)" }}>
          {events.length} prevented {pluralize(events.length, "event")}
        </span>{" "}
        across <span className="fig">{prCount}</span> pull{" "}
        {pluralize(prCount, "request")}, which moved{" "}
        <span className="fig">{linesChanged.toLocaleString("en-US")}</span> lines of code. Every row
        below links to the comment and the commit that answered it.
      </p>

      <div className="scroll-x" style={{ marginTop: "1rem" }}>
        <div role="table" style={{ minWidth: "52rem" }}>
          <div role="row" className="row" style={{ gridTemplateColumns: COLUMNS, padding: 0 }}>
            <span role="columnheader" className="caption" style={CELL}>
              Severity
            </span>
            <span role="columnheader" className="caption" style={CELL}>
              What was caught
            </span>
            <span role="columnheader" className="caption" style={CELL}>
              Where
            </span>
            <span role="columnheader" className="caption" style={CELL}>
              Who caught it
            </span>
            <span role="columnheader" className="caption" style={CELL}>
              When
            </span>
          </div>

          <div role="presentation" className="rows">
            {shown.map((event) => (
              <Row key={event.id} event={event} />
            ))}
          </div>
        </div>
      </div>

      {ranked.length > VISIBLE_BY_DEFAULT && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mono"
          style={{
            marginTop: "0.9rem",
            padding: "0.7rem 0",
            minHeight: "44px",
            background: "none",
            border: "none",
            borderTop: "1px solid var(--rule)",
            width: "100%",
            textAlign: "left",
            color: "var(--ink-muted)",
            fontSize: "0.8rem",
            cursor: "pointer",
          }}
        >
          {showAll ? `Show the first ${VISIBLE_BY_DEFAULT}` : `Show all ${ranked.length}`}
        </button>
      )}
    </div>
  );
}
