/**
 * Keyword baseline classifier.
 *
 * Synchronous fallback classifier used for Granite validation. Determines
 * whether a review comment is substantive purely by keyword matching.
 *
 * Negative markers (nit/style/etc.) win over positive ones so that a comment
 * like "nit: this null check is missing" is not treated as a bug catch.
 */

import type { Classification, ClassifiableCandidate } from "./types.ts";

// ---------------------------------------------------------------------------
// Word-boundary keyword lists
// ---------------------------------------------------------------------------

const SUBSTANTIVE_WORDS = [
  "bug",
  "race",
  "null",
  "undefined",
  "panic",
  "leak",
  "security",
  "injection",
  "overflow",
  "deadlock",
  "crash",
  "regression",
];

const STYLE_WORDS = [
  "nit",
  "typo",
  "style",
  "formatting",
  "naming",
  "rename",
  "whitespace",
];

/** Build a word-boundary RegExp for each keyword, case-insensitive. */
function toWordBoundaryRe(word: string): RegExp {
  return new RegExp(`\\b${word}\\b`, "i");
}

const SUBSTANTIVE_RES = SUBSTANTIVE_WORDS.map(toWordBoundaryRe);
const STYLE_RES = STYLE_WORDS.map(toWordBoundaryRe);

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Classify a candidate by keyword matching.
 *
 * Returns `substantive: true` when the comment body matches a substantive
 * keyword and does NOT match any style/nit keyword. Negative markers win.
 * `summary` is always an empty string. `classifier` is `"baseline"`.
 */
export function classifyByKeyword(candidate: ClassifiableCandidate): Classification {
  const body = candidate.commentBody;

  const hasStyle = STYLE_RES.some((re) => re.test(body));
  if (hasStyle) {
    return { substantive: false, summary: "", classifier: "baseline" };
  }

  const hasSubstantive = SUBSTANTIVE_RES.some((re) => re.test(body));
  return {
    substantive: hasSubstantive,
    summary: "",
    classifier: "baseline",
  };
}
