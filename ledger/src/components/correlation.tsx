import { useState } from "react";
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

/* Label placement geometry. Most real repos have a pile of contributors
   tied at zero prevented events — a dense horizontal row of dots — so an
   offset that assumes empty space around a point is not safe. Instead each
   label tries a ring of candidate positions around its dot and takes the
   first one whose bounding box clears every other dot, every label already
   placed, and the viewBox edge. */
/* LABEL_OFFSET is deliberately bigger than DOT_CLEARANCE, and bigger than
   DOT_CLEARANCE + LABEL_HALF_HEIGHT: that inequality is what makes the N/S
   and E/W candidates immune to a whole row or column of tied dots, not just
   the labeled dot's own neighbours — the two bands stop overlapping by
   construction, for any x (or y) at all. */
const LABEL_OFFSET = 20; // distance from dot center to label anchor point
/* A second, further ring. With several labeled dots sitting in the same row
   of ties, the nearest N slot is taken by whichever label was placed first
   and every remaining direction collides — so the later labels fall back to
   a known overlap. Trying the same directions further out first gives them
   somewhere clean to go. */
const LABEL_OFFSET_RINGS = [LABEL_OFFSET, LABEL_OFFSET * 2.1];
const LABEL_CHAR_WIDTH = 7.2; // approx glyph width, mono at 0.75rem (~12px), no text-measurement API server-side
const LABEL_HALF_HEIGHT = 6.5; // approx half-height of one line of label text
const DOT_CLEARANCE = 10; // half-width of the square kept clear around every dot (covers r=4 plus buffer)
const EDGE_MARGIN = 2;
const DIAG = Math.SQRT1_2;
const CANDIDATE_DIRECTIONS: { dx: number; dy: number }[] = [
  { dx: 0, dy: -1 }, // N  — tried first: clears a horizontal row of tied dots
  { dx: 0, dy: 1 }, // S
  { dx: DIAG, dy: -DIAG }, // NE
  { dx: DIAG, dy: DIAG }, // SE
  { dx: -DIAG, dy: -DIAG }, // NW
  { dx: -DIAG, dy: DIAG }, // SW
  { dx: 1, dy: 0 }, // E
  { dx: -1, dy: 0 }, // W
];

interface Box {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

function boxesOverlap(a: Box, b: Box): boolean {
  return a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
}

function outOfBounds(box: Box): boolean {
  return box.x0 < EDGE_MARGIN || box.x1 > VIEW_W - EDGE_MARGIN || box.y0 < EDGE_MARGIN || box.y1 > VIEW_H - EDGE_MARGIN;
}

function candidateBox(cx: number, cy: number, dx: number, dy: number, textWidth: number, offset: number) {
  const anchorX = cx + dx * offset;
  const anchorY = cy + dy * offset;
  const box: Box =
    dx > 0.3
      ? { x0: anchorX, x1: anchorX + textWidth, y0: anchorY - LABEL_HALF_HEIGHT, y1: anchorY + LABEL_HALF_HEIGHT }
      : dx < -0.3
        ? { x0: anchorX - textWidth, x1: anchorX, y0: anchorY - LABEL_HALF_HEIGHT, y1: anchorY + LABEL_HALF_HEIGHT }
        : {
            x0: anchorX - textWidth / 2,
            x1: anchorX + textWidth / 2,
            y0: anchorY - LABEL_HALF_HEIGHT,
            y1: anchorY + LABEL_HALF_HEIGHT,
          };
  return { box, anchorX, anchorY };
}

/**
 * Places at most a handful of labels with an explicit collision guarantee,
 * not a hope: each label tests every candidate direction against every
 * other dot, every label already placed, and the viewBox edge, and keeps
 * the first that clears all three. If none do (labels crammed into a
 * corner with no free direction at all), it falls back to the candidate
 * with the least overlap and clamps it into the viewBox — a bounded,
 * deterministic degrade rather than an unguarded collision.
 */
function placeLabels(
  points: { login: string; cx: number; cy: number }[],
  labeledLogins: Set<string>
): Map<string, { x: number; y: number; anchor: "start" | "middle" | "end"; baseline: "hanging" | "middle" | "auto" }> {
  const dotBoxes = points.map((p) => ({
    login: p.login,
    box: { x0: p.cx - DOT_CLEARANCE, x1: p.cx + DOT_CLEARANCE, y0: p.cy - DOT_CLEARANCE, y1: p.cy + DOT_CLEARANCE },
  }));
  const placedBoxes: Box[] = [];
  const result = new Map<
    string,
    { x: number; y: number; anchor: "start" | "middle" | "end"; baseline: "hanging" | "middle" | "auto" }
  >();

  for (const point of points) {
    if (!labeledLogins.has(point.login)) continue;

    const textWidth = point.login.length * LABEL_CHAR_WIDTH;
    const otherDots = dotBoxes.filter((d) => d.login !== point.login).map((d) => d.box);

    type Placement = { box: Box; anchorX: number; anchorY: number; dx: number; dy: number };
    let best: Placement | null = null;
    let fallback: (Placement & { penalty: number }) | null = null;

    for (const offset of LABEL_OFFSET_RINGS) {
      for (const { dx, dy } of CANDIDATE_DIRECTIONS) {
        const { box, anchorX, anchorY } = candidateBox(point.cx, point.cy, dx, dy, textWidth, offset);
        const collides = outOfBounds(box) || otherDots.some((b) => boxesOverlap(box, b)) || placedBoxes.some((b) => boxesOverlap(box, b));
        if (!collides) {
          best = { box, anchorX, anchorY, dx, dy };
          break;
        }
        const penalty =
          (outOfBounds(box) ? 100 : 0) +
          otherDots.filter((b) => boxesOverlap(box, b)).length +
          placedBoxes.filter((b) => boxesOverlap(box, b)).length;
        if (!fallback || penalty < fallback.penalty) {
          fallback = { box, anchorX, anchorY, dx, dy, penalty };
        }
      }
      if (best) break;
    }

    const chosen = best ?? fallback!;
    placedBoxes.push(chosen.box);

    const anchor = chosen.dx > 0.3 ? "start" : chosen.dx < -0.3 ? "end" : "middle";
    const baseline = chosen.dy > 0.3 ? "hanging" : chosen.dy < -0.3 ? "auto" : "middle";
    result.set(point.login, {
      x: Math.min(Math.max(chosen.anchorX, EDGE_MARGIN), VIEW_W - EDGE_MARGIN),
      y: Math.min(Math.max(chosen.anchorY, EDGE_MARGIN), VIEW_H - EDGE_MARGIN),
      anchor,
      baseline,
    });
  }

  return result;
}

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

/** Two decimals, with a typographic minus rather than an ASCII hyphen. */
function formatRho(rho: number): string {
  const text = rho.toFixed(2);
  return text.startsWith("-") ? `\u2212${text.slice(1)}` : text;
}

export function CorrelationView({
  contributors,
  correlation,
}: {
  contributors: Contributor[];
  correlation: Correlation;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const n = contributors.length;
  const outputRanks = rankDescending(contributors.map((c) => c.prsMerged));
  const preventedRanks = rankDescending(contributors.map((c) => c.preventedWeighted));

  const points = contributors.map((contributor, i) => ({
    login: contributor.login,
    prsMerged: contributor.prsMerged,
    preventedEvents: contributor.preventedEvents,
    outputRank: outputRanks[i],
    preventedRank: preventedRanks[i],
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

  const labelPlacements = placeLabels(points, labeled);
  const ticks = pickTicks(n);
  const axisX1 = scalePosition(1, n, PAD.left, INNER_W);
  const axisY1 = scalePosition(1, n, PAD.top, INNER_H);
  const axisXn = scalePosition(n, n, PAD.left, INNER_W);
  const axisYn = scalePosition(n, n, PAD.top, INNER_H);

  // Three readings, because the data can land in three places and each one
  // is a finding. Reporting the flat sentence over a positive result would
  // state a conclusion the number does not support.
  const finding =
    correlation.rho <= RHO_FLAT_THRESHOLD
      ? "The people shipping most are not the people catching most."
      : correlation.rho < -RHO_FLAT_THRESHOLD
        ? "Output rank tells you nothing about who prevents problems."
        : "The people shipping most are also the people catching most \u2014 the same hands do both, and only the shipping half is counted.";

  return (
    <section className="stack" style={{ gap: "1rem" }}>
      <p>
        Spearman{" "}
        <span className="fig" style={{ color: "var(--accent)", fontWeight: 600 }}>
          &rho; = {formatRho(correlation.rho)}
        </span>{" "}
        across <span className="fig">{correlation.n}</span> contributors. {finding}
      </p>

      {/* The chart is authored in a 420-unit coordinate space, so letting it
          stretch to a full desktop column scales every glyph inside it by
          two and a half. Cap the rendered width near the authored one and
          the type stays the size it was designed at. */}
      <div style={{ width: "100%", maxWidth: `${VIEW_W * 1.35}px` }}>
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
          OUTPUT RANK: 1 SHIPS THE MOST
        </text>
        <text
          className="caption"
          x={0}
          y={0}
          textAnchor="middle"
          transform={`translate(10, ${PAD.top + INNER_H / 2}) rotate(-90)`}
        >
          PREVENTED RANK: 1 CATCHES THE MOST
        </text>

        {points.map((point) => {
          const label = labelPlacements.get(point.login);
          const active = hovered === point.login;
          return (
            <g
              key={point.login}
              tabIndex={0}
              role="button"
              aria-label={`${point.login}: output rank ${point.outputRank} of ${n}, prevented rank ${point.preventedRank} of ${n}`}
              onMouseEnter={() => setHovered(point.login)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(point.login)}
              onBlur={() => setHovered(null)}
              style={{ cursor: "pointer", outline: "none" }}
            >
              <title>{`${point.login}: ${point.prsMerged} PRs merged, ${point.preventedEvents} prevented`}</title>
              {/* Generous invisible target: a 4px dot is hard to hit. */}
              <circle cx={point.cx} cy={point.cy} r={14} fill="transparent" />
              {/* Contributors tie on both ranks often enough that dots land
                  exactly on top of each other. Partial opacity makes a stack
                  read darker than a single dot, so a chart of 31 people does
                  not look like a chart of 14. */}
              <circle
                cx={point.cx}
                cy={point.cy}
                r={active ? DOT_RADIUS + 2.5 : DOT_RADIUS}
                fill="var(--accent)"
                fillOpacity={active ? 1 : 0.55}
              />
              {label && (
                <text
                  className="mono"
                  x={label.x}
                  y={label.y}
                  textAnchor={label.anchor}
                  dominantBaseline={label.baseline}
                  style={{ fontSize: "0.75rem", fill: "var(--ink-muted)" }}
                >
                  {point.login}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      </div>

      {/* Reserves its line whether or not anything is hovered, so the chart
          does not jump as the pointer moves across it. */}
      <p
        className="mono"
        aria-live="polite"
        style={{ fontSize: "0.8rem", color: "var(--ink-muted)", minHeight: "1.4em" }}
      >
        {(() => {
          const p = points.find((x) => x.login === hovered);
          if (!p) return "Hover a point for that contributor's numbers.";
          return `${p.login}: ${p.prsMerged} pull ${p.prsMerged === 1 ? "request" : "requests"} merged, ${p.preventedEvents} prevented \u00b7 output rank ${p.outputRank} of ${n}, prevented rank ${p.preventedRank} of ${n}`;
        })()}
      </p>
    </section>
  );
}
