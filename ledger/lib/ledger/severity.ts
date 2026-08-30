/**
 * Severity scorer.
 *
 * Derives blast-radius severity from the file path a comment anchored to.
 * Observable from the diff; doubles as an anti-gaming weight.
 *
 * Low wins over High when both match — a test file about auth is still a test.
 */

import type { Severity } from "./types.ts";

// ---------------------------------------------------------------------------
// Path keyword lists
// ---------------------------------------------------------------------------

const HIGH_SEGMENTS = [
  "auth",
  "payment",
  "billing",
  "security",
  "crypto",
  "migration",
  "session",
  "permission",
];

const LOW_SEGMENTS = ["test", "spec", "fixture", "mock", "docs", "example", "snapshot"];

const LOW_EXTENSIONS = [".md"];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Return the severity for a file path.
 *
 * - **High** — path contains an auth/payment/security/etc. segment.
 * - **Low** — path contains a test/spec/docs/etc. segment, or ends with `.md`.
 * - **Medium** — everything else.
 *
 * Low wins when both high and low patterns match.
 */
export function severityForPath(path: string): Severity {
  const lower = path.toLowerCase();

  const isLow =
    LOW_SEGMENTS.some((s) => lower.includes(s)) ||
    LOW_EXTENSIONS.some((ext) => lower.endsWith(ext));

  if (isLow) return "low";

  const isHigh = HIGH_SEGMENTS.some((s) => lower.includes(s));
  if (isHigh) return "high";

  return "medium";
}
