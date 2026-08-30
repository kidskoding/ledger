import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { b as createAstro, d as maybeRenderHead, f as renderHead, i as renderComponent, p as addAttribute, s as renderSlot, u as renderTemplate } from "./server_Cijvxr2X.mjs";
import { t as createComponent } from "./compiler_BQ-RgaRR.mjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/layouts/Base.astro
createAstro("https://astro.build");
var $$Base = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Base;
	const { title, description } = Astro.props;
	return renderTemplate`<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title><meta name="description"${addAttribute(description, "content")}><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500&family=IBM+Plex+Serif:wght@400;500;600&display=swap">${renderHead($$result)}</head><body>${renderSlot($$result, $$slots["default"])}</body></html>`;
}, "/Users/anirudh/UIUC/hackathons/ibm-skillsbuild-august/ledger/src/layouts/Base.astro", void 0);
//#endregion
//#region components/prevented-log.tsx
/** Fixed track widths so the header captions and every data row line up. */
var COLUMNS = "6rem minmax(220px,1.4fr) minmax(180px,1fr) 8rem 7rem";
/** Every interactive/text cell shares this padding so baselines line up
* and the button/link cells get a full-height tap target (>=44px). */
var CELL = { padding: "0.85rem 0" };
function severityColor(severity) {
	if (severity === "high") return "var(--accent)";
	if (severity === "medium") return "var(--ink-muted)";
	return "var(--ink-faint)";
}
function isoDate(iso) {
	return iso.slice(0, 10);
}
function pluralize(count, noun) {
	return `${noun}${count === 1 ? "" : "s"}`;
}
function Row({ event }) {
	const [expanded, setExpanded] = useState(false);
	const detailId = `prevented-detail-${event.id}`;
	return /* @__PURE__ */ jsxs("div", {
		role: "row",
		className: "row",
		style: {
			gridTemplateColumns: COLUMNS,
			padding: 0
		},
		children: [
			/* @__PURE__ */ jsx("span", {
				role: "cell",
				className: "caption",
				style: {
					...CELL,
					color: severityColor(event.severity)
				},
				children: event.severity
			}),
			/* @__PURE__ */ jsx("span", {
				role: "cell",
				children: /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => setExpanded((v) => !v),
					"aria-expanded": expanded,
					"aria-controls": detailId,
					style: {
						...CELL,
						background: "none",
						border: 0,
						font: "inherit",
						color: "inherit",
						textAlign: "left",
						cursor: "pointer",
						width: "100%"
					},
					children: event.classification.summary || event.prTitle
				})
			}),
			/* @__PURE__ */ jsx("span", {
				role: "cell",
				children: /* @__PURE__ */ jsxs("a", {
					href: event.commentUrl,
					target: "_blank",
					rel: "noreferrer noopener",
					className: "mono",
					style: {
						...CELL,
						display: "block"
					},
					children: [
						event.path,
						":",
						event.line
					]
				})
			}),
			/* @__PURE__ */ jsx("span", {
				role: "cell",
				style: CELL,
				children: event.reviewer
			}),
			/* @__PURE__ */ jsx("time", {
				role: "cell",
				className: "fig",
				dateTime: event.createdAt,
				style: CELL,
				children: isoDate(event.createdAt)
			}),
			expanded && /* @__PURE__ */ jsxs("div", {
				role: "presentation",
				id: detailId,
				style: {
					gridColumn: "1 / -1",
					padding: "0 0 1.1rem"
				},
				children: [/* @__PURE__ */ jsx("p", {
					style: { marginBottom: "0.6rem" },
					children: event.commentBody
				}), /* @__PURE__ */ jsxs("a", {
					href: event.fixCommitUrl,
					target: "_blank",
					rel: "noreferrer noopener",
					className: "mono",
					children: [
						"fixed in ",
						event.fixCommitSha.slice(0, 7),
						" (+",
						event.linesChanged,
						")"
					]
				})]
			})
		]
	});
}
function PreventedLog({ events }) {
	if (events.length === 0) return /* @__PURE__ */ jsx("div", {
		className: "ruled",
		children: /* @__PURE__ */ jsx("p", {
			className: "mono",
			style: { color: "var(--ink-faint)" },
			children: "No prevented events found in this sample."
		})
	});
	const prCount = new Set(events.map((e) => `${e.repo}#${e.prNumber}`)).size;
	const highCount = events.filter((e) => e.severity === "high").length;
	return /* @__PURE__ */ jsxs("div", {
		className: "ruled",
		children: [/* @__PURE__ */ jsxs("p", { children: [
			/* @__PURE__ */ jsxs("span", {
				className: "fig",
				style: { color: "var(--accent)" },
				children: [
					events.length,
					" prevented ",
					pluralize(events.length, "event")
				]
			}),
			" ",
			"across ",
			/* @__PURE__ */ jsx("span", {
				className: "fig",
				children: prCount
			}),
			" pull",
			" ",
			pluralize(prCount, "request"),
			".",
			" ",
			/* @__PURE__ */ jsx("span", {
				className: "fig",
				children: highCount
			}),
			" in high-blast-radius paths."
		] }), /* @__PURE__ */ jsx("div", {
			className: "scroll-x",
			style: { marginTop: "1rem" },
			children: /* @__PURE__ */ jsxs("div", {
				role: "table",
				style: { minWidth: "48rem" },
				children: [/* @__PURE__ */ jsxs("div", {
					role: "row",
					className: "row",
					style: {
						gridTemplateColumns: COLUMNS,
						padding: 0
					},
					children: [
						/* @__PURE__ */ jsx("span", {
							role: "columnheader",
							className: "caption",
							style: CELL,
							children: "Severity"
						}),
						/* @__PURE__ */ jsx("span", {
							role: "columnheader",
							className: "caption",
							style: CELL,
							children: "What was caught"
						}),
						/* @__PURE__ */ jsx("span", {
							role: "columnheader",
							className: "caption",
							style: CELL,
							children: "Where"
						}),
						/* @__PURE__ */ jsx("span", {
							role: "columnheader",
							className: "caption",
							style: CELL,
							children: "Who caught it"
						}),
						/* @__PURE__ */ jsx("span", {
							role: "columnheader",
							className: "caption",
							style: CELL,
							children: "When"
						})
					]
				}), /* @__PURE__ */ jsx("div", {
					role: "presentation",
					className: "rows",
					children: events.map((event) => /* @__PURE__ */ jsx(Row, { event }, event.id))
				})]
			})
		})]
	});
}
//#endregion
//#region components/correlation.tsx
var VIEW_W$1 = 420;
var VIEW_H$1 = 320;
var PAD$1 = {
	top: 18,
	right: 18,
	bottom: 42,
	left: 34
};
var INNER_W$1 = VIEW_W$1 - PAD$1.left - PAD$1.right;
var INNER_H$1 = VIEW_H$1 - PAD$1.top - PAD$1.bottom;
var DOT_RADIUS = 4;
var LABEL_COUNT = 3;
var RHO_FLAT_THRESHOLD = -.2;
var LABEL_OFFSET = 20;
var LABEL_CHAR_WIDTH = 7.2;
var LABEL_HALF_HEIGHT = 6.5;
var DOT_CLEARANCE = 10;
var EDGE_MARGIN = 2;
var DIAG = Math.SQRT1_2;
var CANDIDATE_DIRECTIONS = [
	{
		dx: 0,
		dy: -1
	},
	{
		dx: 0,
		dy: 1
	},
	{
		dx: DIAG,
		dy: -DIAG
	},
	{
		dx: DIAG,
		dy: DIAG
	},
	{
		dx: -DIAG,
		dy: -DIAG
	},
	{
		dx: -DIAG,
		dy: DIAG
	},
	{
		dx: 1,
		dy: 0
	},
	{
		dx: -1,
		dy: 0
	}
];
function boxesOverlap(a, b) {
	return a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
}
function outOfBounds(box) {
	return box.x0 < EDGE_MARGIN || box.x1 > 418 || box.y0 < EDGE_MARGIN || box.y1 > 318;
}
function candidateBox(cx, cy, dx, dy, textWidth) {
	const anchorX = cx + dx * LABEL_OFFSET;
	const anchorY = cy + dy * LABEL_OFFSET;
	return {
		box: dx > .3 ? {
			x0: anchorX,
			x1: anchorX + textWidth,
			y0: anchorY - LABEL_HALF_HEIGHT,
			y1: anchorY + LABEL_HALF_HEIGHT
		} : dx < -.3 ? {
			x0: anchorX - textWidth,
			x1: anchorX,
			y0: anchorY - LABEL_HALF_HEIGHT,
			y1: anchorY + LABEL_HALF_HEIGHT
		} : {
			x0: anchorX - textWidth / 2,
			x1: anchorX + textWidth / 2,
			y0: anchorY - LABEL_HALF_HEIGHT,
			y1: anchorY + LABEL_HALF_HEIGHT
		},
		anchorX,
		anchorY
	};
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
function placeLabels(points, labeledLogins) {
	const dotBoxes = points.map((p) => ({
		login: p.login,
		box: {
			x0: p.cx - DOT_CLEARANCE,
			x1: p.cx + DOT_CLEARANCE,
			y0: p.cy - DOT_CLEARANCE,
			y1: p.cy + DOT_CLEARANCE
		}
	}));
	const placedBoxes = [];
	const result = /* @__PURE__ */ new Map();
	for (const point of points) {
		if (!labeledLogins.has(point.login)) continue;
		const textWidth = point.login.length * LABEL_CHAR_WIDTH;
		const otherDots = dotBoxes.filter((d) => d.login !== point.login).map((d) => d.box);
		let best = null;
		let fallback = null;
		for (const { dx, dy } of CANDIDATE_DIRECTIONS) {
			const { box, anchorX, anchorY } = candidateBox(point.cx, point.cy, dx, dy, textWidth);
			if (!(outOfBounds(box) || otherDots.some((b) => boxesOverlap(box, b)) || placedBoxes.some((b) => boxesOverlap(box, b)))) {
				best = {
					box,
					anchorX,
					anchorY,
					dx,
					dy
				};
				break;
			}
			const penalty = (outOfBounds(box) ? 100 : 0) + otherDots.filter((b) => boxesOverlap(box, b)).length + placedBoxes.filter((b) => boxesOverlap(box, b)).length;
			if (!fallback || penalty < fallback.penalty) fallback = {
				box,
				anchorX,
				anchorY,
				dx,
				dy,
				penalty
			};
		}
		const chosen = best ?? fallback;
		placedBoxes.push(chosen.box);
		const anchor = chosen.dx > .3 ? "start" : chosen.dx < -.3 ? "end" : "middle";
		const baseline = chosen.dy > .3 ? "hanging" : chosen.dy < -.3 ? "auto" : "middle";
		result.set(point.login, {
			x: Math.min(Math.max(chosen.anchorX, EDGE_MARGIN), 418),
			y: Math.min(Math.max(chosen.anchorY, EDGE_MARGIN), 318),
			anchor,
			baseline
		});
	}
	return result;
}
/** Descending rank (1 = highest value). Ties share the average rank. */
function rankDescending(values) {
	const order = values.map((_, i) => i).sort((a, b) => values[b] - values[a]);
	const ranks = new Array(values.length);
	let i = 0;
	while (i < order.length) {
		let j = i;
		while (j + 1 < order.length && values[order[j + 1]] === values[order[i]]) j++;
		const averageRank = (i + 1 + (j + 1)) / 2;
		for (let k = i; k <= j; k++) ranks[order[k]] = averageRank;
		i = j + 1;
	}
	return ranks;
}
function scalePosition(rank, n, start, span) {
	if (n <= 1) return start + span / 2;
	return start + (rank - 1) / (n - 1) * span;
}
/** Rank 1..n as ticks when the axis is short; a sparse, deduplicated set otherwise. */
function pickTicks(n) {
	if (n <= 8) return Array.from({ length: n }, (_, i) => i + 1);
	const ticks = /* @__PURE__ */ new Set([1, n]);
	for (let i = 1; i <= 4; i++) ticks.add(Math.round(n * i / 5));
	return Array.from(ticks).sort((a, b) => a - b);
}
/** Never rounds — only swaps the ASCII hyphen for a typographic minus. */
function formatRho(rho) {
	const text = String(rho);
	return text.startsWith("-") ? `−${text.slice(1)}` : text;
}
function CorrelationView({ contributors, correlation }) {
	const n = contributors.length;
	const outputRanks = rankDescending(contributors.map((c) => c.prsMerged));
	const preventedRanks = rankDescending(contributors.map((c) => c.preventedWeighted));
	const points = contributors.map((contributor, i) => ({
		login: contributor.login,
		cx: scalePosition(outputRanks[i], n, PAD$1.left, INNER_W$1),
		cy: scalePosition(preventedRanks[i], n, PAD$1.top, INNER_H$1),
		spread: Math.abs(outputRanks[i] - preventedRanks[i])
	}));
	const labelPlacements = placeLabels(points, new Set([...points].sort((a, b) => b.spread - a.spread).slice(0, Math.min(LABEL_COUNT, n)).map((p) => p.login)));
	const ticks = pickTicks(n);
	const axisX1 = scalePosition(1, n, PAD$1.left, INNER_W$1);
	const axisY1 = scalePosition(1, n, PAD$1.top, INNER_H$1);
	const axisXn = scalePosition(n, n, PAD$1.left, INNER_W$1);
	const axisYn = scalePosition(n, n, PAD$1.top, INNER_H$1);
	const finding = correlation.rho > RHO_FLAT_THRESHOLD ? "Output rank tells you nothing about who prevents problems." : "The people shipping most are not the people catching most.";
	return /* @__PURE__ */ jsxs("section", {
		className: "stack",
		style: { gap: "1rem" },
		children: [/* @__PURE__ */ jsxs("p", { children: [
			"Spearman",
			" ",
			/* @__PURE__ */ jsxs("span", {
				className: "fig",
				style: {
					color: "var(--accent)",
					fontWeight: 600
				},
				children: ["ρ = ", formatRho(correlation.rho)]
			}),
			" ",
			"across ",
			/* @__PURE__ */ jsx("span", {
				className: "fig",
				children: correlation.n
			}),
			" contributors. ",
			finding
		] }), /* @__PURE__ */ jsxs("svg", {
			viewBox: `0 0 ${VIEW_W$1} ${VIEW_H$1}`,
			preserveAspectRatio: "xMidYMid meet",
			width: "100%",
			role: "img",
			focusable: "false",
			"aria-label": `Scatter chart plotting each contributor's rank by pull requests merged against their rank by prevented events, with a diagonal line marking where the two rankings would agree perfectly.`,
			style: { display: "block" },
			children: [
				/* @__PURE__ */ jsx("line", {
					x1: axisX1,
					y1: axisY1,
					x2: axisXn,
					y2: axisYn,
					stroke: "var(--rule)",
					strokeWidth: 1,
					vectorEffect: "non-scaling-stroke"
				}),
				/* @__PURE__ */ jsx("line", {
					x1: PAD$1.left,
					y1: PAD$1.top,
					x2: PAD$1.left,
					y2: VIEW_H$1 - PAD$1.bottom,
					stroke: "var(--rule)",
					strokeWidth: 1,
					vectorEffect: "non-scaling-stroke"
				}),
				/* @__PURE__ */ jsx("line", {
					x1: PAD$1.left,
					y1: VIEW_H$1 - PAD$1.bottom,
					x2: VIEW_W$1 - PAD$1.right,
					y2: VIEW_H$1 - PAD$1.bottom,
					stroke: "var(--rule)",
					strokeWidth: 1,
					vectorEffect: "non-scaling-stroke"
				}),
				ticks.map((tick) => /* @__PURE__ */ jsx("text", {
					className: "mono",
					x: scalePosition(tick, n, PAD$1.left, INNER_W$1),
					y: VIEW_H$1 - PAD$1.bottom + 14,
					textAnchor: "middle",
					style: {
						fontSize: "0.7rem",
						fill: "var(--ink-faint)"
					},
					children: tick
				}, `x-${tick}`)),
				ticks.map((tick) => /* @__PURE__ */ jsx("text", {
					className: "mono",
					x: PAD$1.left - 6,
					y: scalePosition(tick, n, PAD$1.top, INNER_H$1) + 3,
					textAnchor: "end",
					style: {
						fontSize: "0.7rem",
						fill: "var(--ink-faint)"
					},
					children: tick
				}, `y-${tick}`)),
				/* @__PURE__ */ jsx("text", {
					className: "caption",
					x: PAD$1.left + INNER_W$1 / 2,
					y: 314,
					textAnchor: "middle",
					children: "OUTPUT RANK, PRS MERGED"
				}),
				/* @__PURE__ */ jsx("text", {
					className: "caption",
					x: 0,
					y: 0,
					textAnchor: "middle",
					transform: `translate(10, ${PAD$1.top + INNER_H$1 / 2}) rotate(-90)`,
					children: "PREVENTED RANK"
				}),
				points.map((point) => {
					const label = labelPlacements.get(point.login);
					return /* @__PURE__ */ jsxs("g", { children: [/* @__PURE__ */ jsx("circle", {
						cx: point.cx,
						cy: point.cy,
						r: DOT_RADIUS,
						fill: "var(--accent)"
					}), label && /* @__PURE__ */ jsx("text", {
						className: "mono",
						x: label.x,
						y: label.y,
						textAnchor: label.anchor,
						dominantBaseline: label.baseline,
						style: {
							fontSize: "0.75rem",
							fill: "var(--ink-muted)"
						},
						children: point.login
					})] }, point.login);
				})
			]
		})]
	});
}
//#endregion
//#region components/cycle-trend.tsx
var VIEW_W = 400;
var VIEW_H = 140;
var PAD = {
	top: 14,
	bottom: 14,
	left: 28,
	right: 44
};
var INNER_W = VIEW_W - PAD.left - PAD.right;
var INNER_H = VIEW_H - PAD.top - PAD.bottom;
function niceMax(max) {
	const step = max <= 5 ? .5 : max <= 20 ? 2 : 5;
	return Math.ceil((max + step * .5) / step) * step;
}
function CycleTrend({ cycles }) {
	if (cycles.length < 2) return /* @__PURE__ */ jsxs("div", {
		className: "ruled stack",
		style: { gap: "0.5rem" },
		children: [/* @__PURE__ */ jsx("p", {
			className: "caption",
			children: "Review cycles"
		}), /* @__PURE__ */ jsx("p", {
			className: "mono",
			style: {
				color: "var(--ink-muted)",
				fontSize: "0.85rem"
			},
			children: "Not enough quarters of data yet to show a trend."
		})]
	});
	const first = cycles[0];
	const last = cycles[cycles.length - 1];
	const values = cycles.map((c) => c.medianCycles);
	const domainMax = niceMax(Math.max(...values));
	const yTicks = [
		0,
		domainMax / 2,
		domainMax
	];
	const x = (i) => PAD.left + i / (cycles.length - 1) * INNER_W;
	const y = (v) => PAD.top + (1 - v / domainMax) * INNER_H;
	const pathD = cycles.map((c, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(2)},${y(c.medianCycles).toFixed(2)}`).join(" ");
	const endX = x(cycles.length - 1);
	const endY = y(last.medianCycles);
	return /* @__PURE__ */ jsxs("div", {
		className: "stack",
		style: { gap: "1.25rem" },
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "stack",
				style: { gap: "0.35rem" },
				children: [/* @__PURE__ */ jsxs("p", {
					style: { maxWidth: "var(--measure)" },
					children: [
						"Median review rounds per pull request:",
						" ",
						/* @__PURE__ */ jsxs("strong", {
							className: "mono",
							children: [
								first.medianCycles.toFixed(1),
								" → ",
								last.medianCycles.toFixed(1)
							]
						}),
						" ",
						"since ",
						first.period,
						"."
					]
				}), /* @__PURE__ */ jsx("p", {
					className: "mono",
					style: {
						color: "var(--ink-muted)",
						fontSize: "0.85rem"
					},
					children: "Each additional round is a second pass by a reviewer on the same pull request."
				})]
			}),
			/* @__PURE__ */ jsxs("svg", {
				viewBox: `0 0 ${VIEW_W} ${VIEW_H}`,
				width: "100%",
				role: "img",
				"aria-label": `Line chart of median review rounds per pull request by quarter, rising from ${first.medianCycles.toFixed(1)} in ${first.period} to ${last.medianCycles.toFixed(1)} in ${last.period}.`,
				children: [
					yTicks.map((t) => /* @__PURE__ */ jsx("text", {
						x: PAD.left - 6,
						y: y(t),
						dominantBaseline: "middle",
						textAnchor: "end",
						className: "mono",
						fontSize: 11,
						fill: "var(--ink-faint)",
						children: Number.isInteger(t) ? t : t.toFixed(1)
					}, t)),
					/* @__PURE__ */ jsx("path", {
						d: pathD,
						fill: "none",
						stroke: "var(--accent)",
						strokeWidth: 1.5,
						strokeLinejoin: "round",
						strokeLinecap: "round"
					}),
					/* @__PURE__ */ jsx("circle", {
						cx: endX,
						cy: endY,
						r: 4,
						fill: "var(--accent)"
					}),
					/* @__PURE__ */ jsx("text", {
						x: endX + 8,
						y: endY,
						dominantBaseline: "middle",
						textAnchor: "start",
						className: "mono",
						fontSize: 11,
						fill: "var(--ink)",
						children: last.medianCycles.toFixed(1)
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "ruled",
				style: {
					display: "flex",
					justifyContent: "space-between",
					gap: "0.4rem",
					paddingTop: "0.5rem"
				},
				children: cycles.map((c, i) => {
					const keep = i === 0 || i === cycles.length - 1 || i % 2 === 0;
					return /* @__PURE__ */ jsxs("div", {
						className: keep ? "stack" : "stack ledger-cycle-trend-thin",
						style: {
							gap: "0.15rem",
							alignItems: i === 0 ? "flex-start" : i === cycles.length - 1 ? "flex-end" : "center"
						},
						children: [/* @__PURE__ */ jsx("span", {
							className: "mono",
							style: {
								fontSize: "0.72rem",
								color: "var(--ink-faint)"
							},
							children: c.period
						}), /* @__PURE__ */ jsx("span", {
							className: "mono",
							style: {
								fontSize: "0.78rem",
								color: "var(--ink-muted)"
							},
							children: c.prCount
						})]
					}, c.period);
				})
			}),
			/* @__PURE__ */ jsx("style", { children: `
        @media (max-width: 600px) {
          .ledger-cycle-trend-thin { display: none; }
        }
      ` })
		]
	});
}
//#endregion
//#region components/run-client.tsx
/** Slug matches the key `/api/cached` expects; repo is the full owner/name shown to the reader. */
var STUDY_REPOS = [
	{
		slug: "pandas",
		repo: "pandas-dev/pandas"
	},
	{
		slug: "ruff",
		repo: "astral-sh/ruff"
	},
	{
		slug: "next",
		repo: "vercel/next.js"
	}
];
var BUTTON = {
	minHeight: 44,
	padding: "0.5rem 1rem",
	border: "1px solid var(--rule-strong)",
	background: "transparent",
	color: "var(--ink)",
	cursor: "pointer"
};
function isValidRepo(value) {
	return /^[^\s/]+\/[^\s/]+$/.test(value.trim());
}
function placeholderText(status) {
	if (status.kind === "loading") return "Loading…";
	if (status.kind === "streaming") return "Waiting for the run to finish.";
	if (status.kind === "error") return status.message;
	return "No repository opened.";
}
function placeholderColor(status) {
	return status.kind === "error" ? "var(--accent)" : "var(--ink-faint)";
}
function Section({ n, title, note, children }) {
	return /* @__PURE__ */ jsxs("section", {
		className: "ruled stack",
		style: { gap: "0.65rem" },
		children: [
			/* @__PURE__ */ jsxs("div", {
				style: {
					display: "flex",
					gap: "1rem",
					alignItems: "baseline"
				},
				children: [/* @__PURE__ */ jsx("span", {
					className: "caption",
					children: n
				}), /* @__PURE__ */ jsx("h2", { children: title })]
			}),
			/* @__PURE__ */ jsx("p", {
				style: {
					color: "var(--ink-muted)",
					fontSize: "0.95rem"
				},
				children: note
			}),
			children
		]
	});
}
function RunClient() {
	const [result, setResult] = useState(null);
	const [liveEvents, setLiveEvents] = useState([]);
	const [status, setStatus] = useState({ kind: "idle" });
	const [liveRepo, setLiveRepo] = useState("");
	const abortRef = useRef(null);
	const stopLiveRun = useCallback(() => {
		abortRef.current?.abort();
		abortRef.current = null;
	}, []);
	useEffect(() => stopLiveRun, [stopLiveRun]);
	async function loadCached(slug) {
		stopLiveRun();
		setResult(null);
		setLiveEvents([]);
		setStatus({ kind: "loading" });
		try {
			const res = await fetch(`/api/cached?repo=${slug}`);
			const body = await res.json();
			if (!res.ok) throw new Error(body?.error ?? `Request failed (${res.status}).`);
			setResult(body);
			setStatus({ kind: "idle" });
		} catch (err) {
			setStatus({
				kind: "error",
				message: err instanceof Error ? err.message : "Failed to load."
			});
		}
	}
	function applyEvent(payload) {
		switch (payload.type) {
			case "start":
				setStatus({
					kind: "streaming",
					repo: payload.repo,
					prsTotal: payload.prsToAnalyze,
					prsDone: 0
				});
				break;
			case "progress":
				setStatus((prev) => prev.kind === "streaming" ? {
					...prev,
					prsDone: payload.prsDone,
					prsTotal: payload.prsTotal
				} : prev);
				break;
			case "event":
				setLiveEvents((prev) => [...prev, payload.event]);
				break;
			case "done":
				setResult(payload.result);
				setStatus({ kind: "idle" });
				break;
			case "error": setStatus({
				kind: "error",
				message: payload.message
			});
		}
	}
	async function startLiveRun(repo) {
		stopLiveRun();
		setResult(null);
		setLiveEvents([]);
		const controller = new AbortController();
		abortRef.current = controller;
		setStatus({
			kind: "streaming",
			repo,
			prsTotal: 0,
			prsDone: 0
		});
		try {
			const res = await fetch(`/api/run?repo=${encodeURIComponent(repo)}`, { signal: controller.signal });
			if (!res.ok || !res.body) throw new Error(`Could not start a run for "${repo}" (${res.status}).`);
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
					applyEvent(JSON.parse(dataLine.slice(5).trim()));
				}
			}
		} catch (err) {
			if (controller.signal.aborted) return;
			setStatus({
				kind: "error",
				message: err instanceof Error ? err.message : "Live run failed."
			});
		} finally {
			if (abortRef.current === controller) abortRef.current = null;
		}
	}
	const isStreaming = status.kind === "streaming";
	return /* @__PURE__ */ jsxs("div", {
		className: "stack",
		style: { gap: "3rem" },
		children: [
			/* @__PURE__ */ jsxs("section", {
				className: "ruled stack",
				style: {
					gap: "1rem",
					marginBottom: "1rem"
				},
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "caption",
						children: "Open a repository"
					}),
					/* @__PURE__ */ jsx("div", {
						style: {
							display: "flex",
							flexWrap: "wrap",
							gap: "0.6rem"
						},
						children: STUDY_REPOS.map(({ slug, repo }) => /* @__PURE__ */ jsx("button", {
							type: "button",
							className: "mono",
							style: BUTTON,
							onClick: () => loadCached(slug),
							children: repo
						}, slug))
					}),
					/* @__PURE__ */ jsxs("form", {
						className: "stack",
						style: {
							flexDirection: "row",
							flexWrap: "wrap",
							gap: "0.6rem"
						},
						onSubmit: (e) => {
							e.preventDefault();
							if (isValidRepo(liveRepo)) startLiveRun(liveRepo.trim());
						},
						children: [
							/* @__PURE__ */ jsx("input", {
								type: "text",
								className: "mono",
								placeholder: "owner/name — run live",
								value: liveRepo,
								onChange: (e) => setLiveRepo(e.target.value),
								style: {
									minHeight: 44,
									padding: "0 0.75rem",
									border: "1px solid var(--rule-strong)",
									background: "var(--paper)",
									color: "var(--ink)",
									flex: "1 1 220px"
								}
							}),
							/* @__PURE__ */ jsx("button", {
								type: "submit",
								className: "mono",
								style: BUTTON,
								disabled: !isValidRepo(liveRepo),
								children: "Run live"
							}),
							isStreaming && /* @__PURE__ */ jsx("button", {
								type: "button",
								className: "mono",
								style: BUTTON,
								onClick: stopLiveRun,
								children: "Stop"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ jsx(Section, {
				n: "I",
				title: "Prevented events",
				note: "Review comments anchored to lines that a later commit changed, classified by IBM Granite as a substantive catch rather than a style nit.",
				children: status.kind === "streaming" ? /* @__PURE__ */ jsxs("div", {
					className: "stack",
					style: { gap: "0.75rem" },
					children: [/* @__PURE__ */ jsx("p", {
						className: "mono",
						style: {
							color: "var(--ink-muted)",
							fontSize: "0.85rem"
						},
						children: status.prsTotal > 0 ? `${status.prsDone} / ${status.prsTotal} pull requests` : `Starting run for ${status.repo}…`
					}), /* @__PURE__ */ jsx(PreventedLog, { events: liveEvents })]
				}) : result ? /* @__PURE__ */ jsx(PreventedLog, { events: result.events }) : /* @__PURE__ */ jsx("p", {
					className: "mono",
					style: { color: placeholderColor(status) },
					children: placeholderText(status)
				})
			}),
			/* @__PURE__ */ jsx(Section, {
				n: "II",
				title: "Output against prevention",
				note: "Conventional productivity metrics per contributor, against prevented events. The rank correlation is reported at whatever value it comes out to.",
				children: result ? /* @__PURE__ */ jsx(CorrelationView, {
					contributors: result.contributors,
					correlation: result.correlation
				}) : /* @__PURE__ */ jsx("p", {
					className: "mono",
					style: { color: placeholderColor(status) },
					children: placeholderText(status)
				})
			}),
			/* @__PURE__ */ jsx(Section, {
				n: "III",
				title: "Review cycles",
				note: "Review rounds per pull request over time. Counted, never estimated.",
				children: result ? /* @__PURE__ */ jsx(CycleTrend, { cycles: result.cycles }) : /* @__PURE__ */ jsx("p", {
					className: "mono",
					style: { color: placeholderColor(status) },
					children: placeholderText(status)
				})
			})
		]
	});
}
//#endregion
//#region src/pages/index.astro
var pages_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => ""
});
var $$Index = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "Base", $$Base, {
		"title": "LEDGER",
		"description": "Counts the verification work AI created and no dashboard records."
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<main class="wrap" style="padding-block: 5rem 6rem"><header class="stack" style="gap: 1.4rem; margin-bottom: 3.5rem"><p class="caption">The ledger nobody kept</p><h1 style="max-width: 20ch">Your most careful engineer looks like your least productive one.</h1><p style="color: var(--ink-muted)">Reviewing, correcting, and rejecting is real labor, it takes your most experienced people, and it appears in no metric anywhere. LEDGER reads a repository&rsquo;s review history and counts it. Every figure here traces to a review comment and the diff it changed.</p></header>${renderComponent($$result, "RunClient", RunClient, {
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "@/components/run-client",
		"client:component-export": "RunClient"
	})}</main>` })}`;
}, "/Users/anirudh/UIUC/hackathons/ibm-skillsbuild-august/ledger/src/pages/index.astro", void 0);
var $$file = "/Users/anirudh/UIUC/hackathons/ibm-skillsbuild-august/ledger/src/pages/index.astro";
//#endregion
//#region \0virtual:astro:page:src/pages/index@_@astro
var page = () => pages_exports;
//#endregion
export { page };
