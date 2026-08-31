import type { RunResult } from "@/lib/ledger/types";
import { reviewerTally, verdict } from "@/lib/ledger/summary";

/** Thousands separators, so a five-figure line count reads at a glance. */
function group(n: number): string {
  return n.toLocaleString("en-US");
}

function percent(fraction: number): string {
  return `${Math.round(fraction * 100)}%`;
}

function plural(count: number, noun: string): string {
  return `${noun}${count === 1 ? "" : "s"}`;
}

function Figure({ value, label }: { value: string; label: string }) {
  return (
    <div className="stack" style={{ gap: "0.3rem" }}>
      <span
        className="fig"
        style={{ fontSize: "clamp(1.7rem, 4.5vw, 2.6rem)", lineHeight: 1, letterSpacing: "-0.02em" }}
      >
        {value}
      </span>
      <span className="caption" style={{ lineHeight: 1.35 }}>
        {label}
      </span>
    </div>
  );
}

/**
 * The four figures the whole argument rests on, above the evidence that
 * produces them. Every one is a count, never an estimate.
 */
export function VerdictBand({ result }: { result: RunResult }) {
  const v = verdict(result);

  return (
    <div
      style={{
        borderTop: "1px solid var(--rule-strong)",
        borderBottom: "1px solid var(--rule-strong)",
        padding: "1.5rem 0",
      }}
    >
      <div
        style={{
          display: "grid",
          /* 130px rather than 150: at 375px the four figures fold to a
             two-by-two block instead of a single tall column. */
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "1.6rem 1.25rem",
        }}
      >
        <Figure value={group(v.events)} label="Prevented events" />
        <Figure value={group(v.linesChanged)} label="Lines changed by review" />
        <Figure value={group(v.reviewers)} label={`${plural(v.reviewers, "Reviewer")} caught all of it`} />
        <Figure value={group(v.prsAnalyzed)} label="Pull requests read" />
      </div>
    </div>
  );
}

/**
 * Who did the catching, ranked. This is the finding that holds in every
 * repository measured: a handful of people account for nearly all of it,
 * and none of that shows up in what gets counted.
 */
export function WhoCaught({ result }: { result: RunResult }) {
  const tally = reviewerTally(result.events);
  const v = verdict(result);

  if (tally.length === 0) {
    return (
      <p className="mono" style={{ color: "var(--ink-faint)" }}>
        No prevented events, so nobody to rank.
      </p>
    );
  }

  const max = tally[0].count;

  return (
    <div className="stack" style={{ gap: "1.1rem" }}>
      <p>
        <span className="fig" style={{ color: "var(--accent)" }}>
          {v.reviewers}
        </span>{" "}
        of <span className="fig">{v.contributors}</span> contributors left a catch that changed the code.
        The top <span className="fig">{v.topN}</span> account for{" "}
        <span className="fig" style={{ color: "var(--accent)" }}>
          {percent(v.topShare)}
        </span>{" "}
        of every prevented event here.
      </p>

      <div className="rows">
        {tally.map((row) => (
          <div
            key={row.reviewer}
            className="row"
            style={{ gridTemplateColumns: "minmax(120px, 12rem) 1fr 7rem", alignItems: "center" }}
          >
            <span className="mono" style={{ fontSize: "0.9rem" }}>
              {row.reviewer}
            </span>

            {/* Bar length is share of the top reviewer, so the leader fills
                the track and everyone else reads against them. */}
            <span
              aria-hidden="true"
              style={{
                display: "block",
                height: "0.5rem",
                background: "var(--accent-sunk)",
                position: "relative",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  inset: "0 auto 0 0",
                  width: `${(row.count / max) * 100}%`,
                  background: "var(--accent)",
                }}
              />
            </span>

            <span className="fig" style={{ fontSize: "0.85rem", textAlign: "right", color: "var(--ink-muted)" }}>
              {row.count} · {percent(row.share)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
