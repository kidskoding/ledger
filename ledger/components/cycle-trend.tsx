import type { CycleBucket } from "@/lib/ledger/types";

/* Coordinate space the chart is authored in. viewBox scales the SVG to any
   container width, so this is chosen close to the narrowest supported
   width (375px) rather than a wide desktop canvas — scaling a chart up
   keeps it legible, scaling one down does not. */
const VIEW_W = 400;
const VIEW_H = 140;
const PAD = { top: 14, bottom: 14, left: 4, right: 44 };
const INNER_W = VIEW_W - PAD.left - PAD.right;
const INNER_H = VIEW_H - PAD.top - PAD.bottom;

export function CycleTrend({ cycles }: { cycles: CycleBucket[] }) {
  if (cycles.length < 2) {
    return (
      <div className="ruled stack" style={{ gap: "0.5rem" }}>
        <p className="caption">Review cycles</p>
        <p className="mono" style={{ color: "var(--ink-muted)", fontSize: "0.85rem" }}>
          Not enough quarters of data yet to show a trend.
        </p>
      </div>
    );
  }

  const first = cycles[0];
  const last = cycles[cycles.length - 1];
  const values = cycles.map((c) => c.medianCycles);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const x = (i: number) => PAD.left + (i / (cycles.length - 1)) * INNER_W;
  const y = (v: number) => PAD.top + (1 - (v - min) / range) * INNER_H;

  const pathD = cycles
    .map((c, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(2)},${y(c.medianCycles).toFixed(2)}`)
    .join(" ");

  const endX = x(cycles.length - 1);
  const endY = y(last.medianCycles);

  return (
    <div className="stack" style={{ gap: "1.25rem" }}>
      <div className="stack" style={{ gap: "0.35rem" }}>
        <p style={{ maxWidth: "var(--measure)" }}>
          Median review rounds per pull request:{" "}
          <strong className="mono">
            {first.medianCycles.toFixed(1)} &rarr; {last.medianCycles.toFixed(1)}
          </strong>{" "}
          since {first.period}.
        </p>
        <p className="mono" style={{ color: "var(--ink-muted)", fontSize: "0.85rem" }}>
          Each additional round is a second pass by a reviewer on the same pull request.
        </p>
      </div>

      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width="100%"
        role="img"
        aria-label={`Line chart of median review rounds per pull request by quarter, rising from ${first.medianCycles.toFixed(1)} in ${first.period} to ${last.medianCycles.toFixed(1)} in ${last.period}.`}
      >
        <path d={pathD} fill="none" stroke="var(--accent)" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={endX} cy={endY} r={4} fill="var(--accent)" />
        <text
          x={endX + 8}
          y={endY}
          dominantBaseline="middle"
          textAnchor="start"
          className="mono"
          fontSize={11}
          fill="var(--ink)"
        >
          {last.medianCycles.toFixed(1)}
        </text>
      </svg>

      <div
        className="ruled"
        style={{ display: "flex", justifyContent: "space-between", gap: "0.4rem", paddingTop: "0.5rem" }}
      >
        {cycles.map((c, i) => {
          const keep = i === 0 || i === cycles.length - 1 || i % 2 === 0;
          return (
            <div
              key={c.period}
              className={keep ? "stack" : "stack ledger-cycle-trend-thin"}
              style={{
                gap: "0.15rem",
                alignItems: i === 0 ? "flex-start" : i === cycles.length - 1 ? "flex-end" : "center",
              }}
            >
              <span className="mono" style={{ fontSize: "0.72rem", color: "var(--ink-faint)" }}>
                {c.period}
              </span>
              <span className="mono" style={{ fontSize: "0.78rem", color: "var(--ink-muted)" }}>
                {c.prCount}
              </span>
            </div>
          );
        })}
      </div>
      <style>{`
        @media (max-width: 600px) {
          .ledger-cycle-trend-thin { display: none; }
        }
      `}</style>
    </div>
  );
}
