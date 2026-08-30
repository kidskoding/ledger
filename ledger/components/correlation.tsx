import type { Contributor, Correlation } from "@/lib/ledger/types";

/* Coordinate space the chart is authored in, chosen close to the narrowest
   supported width (375px) rather than a wide desktop canvas — scaling a
   chart up keeps it legible, scaling one down does not. */
const VIEW_W = 420;
const VIEW_H = 320;
const PAD = { top: 18, right: 18, bottom: 42, left: 34 };
const INNER_W = VIEW_W - PAD.left - PAD.right;
const INNER_H = VIEW_H - PAD.top - PAD.bottom;
const DOT_RADIUS = 4;
const LABEL_COUNT = 3;
/* A flat or positive reading is a finding, not a failure — this is the line
   between "output predicts prevention" and "it doesn't." */
const RHO_FLAT_THRESHOLD = -0.2;

/** Descending rank (1 = highest value). Ties share the average rank. */
function rankDescending(values: number[]): number[] {
  const order = values.map((_, i) => i).sort((a, b) => values[b] - values[a]);
  const ranks = new Array<number>(values.length);
  let i = 0;
  while (i < order.length) {
    let j = i;
    while (j + 1 < order.length && values[order[j + 1]] === values[order[i]]) {
      j++;
    }
    const averageRank = (i + 1 + (j + 1)) / 2;
    for (let k = i; k <= j; k++) {
      ranks[order[k]] = averageRank;
    }
    i = j + 1;
  }
  return ranks;
}

function scalePosition(rank: number, n: number, start: number, span: number): number {
  if (n <= 1) {
    return start + span / 2;
  }
  return start + ((rank - 1) / (n - 1)) * span;
}

/** Rank 1..n as ticks when the axis is short; a sparse, deduplicated set otherwise. */
function pickTicks(n: number): number[] {
  if (n <= 8) {
    return Array.from({ length: n }, (_, i) => i + 1);
  }
  const ticks = new Set<number>([1, n]);
  for (let i = 1; i <= 4; i++) {
    ticks.add(Math.round((n * i) / 5));
  }
  return Array.from(ticks).sort((a, b) => a - b);
}

/** Never rounds — only swaps the ASCII hyphen for a typographic minus. */
function formatRho(rho: number): string {
  const text = String(rho);
  return text.startsWith("-") ? `−${text.slice(1)}` : text;
}

export function CorrelationView({
  contributors,
  correlation,
}: {
  contributors: Contributor[];
  correlation: Correlation;
}) {
  const n = contributors.length;
  const outputRanks = rankDescending(contributors.map((c) => c.prsMerged));
  const preventedRanks = rankDescending(contributors.map((c) => c.preventedWeighted));

  const points = contributors.map((contributor, i) => ({
    login: contributor.login,
    cx: scalePosition(outputRanks[i], n, PAD.left, INNER_W),
    cy: scalePosition(preventedRanks[i], n, PAD.top, INNER_H),
    spread: Math.abs(outputRanks[i] - preventedRanks[i]),
  }));

  // ponytail: picks the top-N by rank spread with a plain sort, fine at
  // fixture/live-run scale (<=50 contributors); revisit if that cap lifts.
  const labeled = new Set(
    [...points]
      .sort((a, b) => b.spread - a.spread)
      .slice(0, Math.min(LABEL_COUNT, n))
      .map((p) => p.login)
  );

  const centerX = PAD.left + INNER_W / 2;
  const centerY = PAD.top + INNER_H / 2;
  const ticks = pickTicks(n);
  const axisX1 = scalePosition(1, n, PAD.left, INNER_W);
  const axisY1 = scalePosition(1, n, PAD.top, INNER_H);
  const axisXn = scalePosition(n, n, PAD.left, INNER_W);
  const axisYn = scalePosition(n, n, PAD.top, INNER_H);

  const isFlat = correlation.rho > RHO_FLAT_THRESHOLD;
  const finding = isFlat
    ? "Output rank tells you nothing about who prevents problems."
    : "The people shipping most are not the people catching most.";

  return (
    <section className="stack" style={{ gap: "1rem" }}>
      <p>
        Spearman{" "}
        <span className="fig" style={{ color: "var(--accent)", fontWeight: 600 }}>
          &rho; = {formatRho(correlation.rho)}
        </span>{" "}
        across <span className="fig">{correlation.n}</span> contributors. {finding}
      </p>

      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        role="img"
        focusable="false"
        aria-label={`Scatter chart plotting each contributor's rank by pull requests merged against their rank by prevented events, with a diagonal line marking where the two rankings would agree perfectly.`}
        style={{ display: "block" }}
      >
        <line
          x1={axisX1}
          y1={axisY1}
          x2={axisXn}
          y2={axisYn}
          stroke="var(--rule)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />

        <line
          x1={PAD.left}
          y1={PAD.top}
          x2={PAD.left}
          y2={VIEW_H - PAD.bottom}
          stroke="var(--rule)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1={PAD.left}
          y1={VIEW_H - PAD.bottom}
          x2={VIEW_W - PAD.right}
          y2={VIEW_H - PAD.bottom}
          stroke="var(--rule)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />

        {ticks.map((tick) => (
          <text
            key={`x-${tick}`}
            className="mono"
            x={scalePosition(tick, n, PAD.left, INNER_W)}
            y={VIEW_H - PAD.bottom + 14}
            textAnchor="middle"
            style={{ fontSize: "0.7rem", fill: "var(--ink-faint)" }}
          >
            {tick}
          </text>
        ))}
        {ticks.map((tick) => (
          <text
            key={`y-${tick}`}
            className="mono"
            x={PAD.left - 6}
            y={scalePosition(tick, n, PAD.top, INNER_H) + 3}
            textAnchor="end"
            style={{ fontSize: "0.7rem", fill: "var(--ink-faint)" }}
          >
            {tick}
          </text>
        ))}

        <text
          className="caption"
          x={PAD.left + INNER_W / 2}
          y={VIEW_H - 6}
          textAnchor="middle"
        >
          OUTPUT RANK, PRS MERGED
        </text>
        <text
          className="caption"
          x={0}
          y={0}
          textAnchor="middle"
          transform={`translate(10, ${PAD.top + INNER_H / 2}) rotate(-90)`}
        >
          PREVENTED RANK
        </text>

        {points.map((point) => {
          const dx = point.cx <= centerX ? 8 : -8;
          const anchor = point.cx <= centerX ? "start" : "end";
          const dy = point.cy <= centerY ? 14 : -8;
          return (
            <g key={point.login}>
              <circle cx={point.cx} cy={point.cy} r={DOT_RADIUS} fill="var(--accent)" />
              {labeled.has(point.login) && (
                <text
                  className="mono"
                  x={point.cx + dx}
                  y={point.cy + dy}
                  textAnchor={anchor}
                  style={{ fontSize: "0.75rem", fill: "var(--ink-muted)" }}
                >
                  {point.login}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </section>
  );
}
