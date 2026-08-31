/**
 * Granite classifier.
 *
 * Calls IBM watsonx.ai text generation (IBM Granite model) to classify a
 * review comment as a substantive catch or a style nit.
 *
 * Never throws — a failed classification returns the non-substantive fallback
 * so a single bad call cannot abort a 50-PR run.
 */

import type { Classification, ClassifiableCandidate } from "./types.ts";

// ---------------------------------------------------------------------------
// IAM token cache
// ---------------------------------------------------------------------------

interface IamTokenCache {
  token: string;
  /** Epoch ms at which we consider the token expired (actual expiry − 60 s). */
  expiresAt: number;
}

let iamCache: IamTokenCache | null = null;

/**
 * Exchange `WATSONX_API_KEY` for an IBM IAM bearer token.
 * The result is cached in module scope until 60 seconds before expiry.
 */
export async function getIamToken(): Promise<string> {
  const now = Date.now();
  if (iamCache && now < iamCache.expiresAt) {
    return iamCache.token;
  }

  const apiKey = process.env.WATSONX_API_KEY;
  if (!apiKey) throw new Error("WATSONX_API_KEY is not set");

  const res = await globalThis.fetch("https://iam.cloud.ibm.com/identity/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ibm:params:oauth:grant-type:apikey",
      apikey: apiKey,
    }),
  });

  if (!res.ok) {
    throw new Error(`IAM token exchange failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  // expires_in is in seconds; we back off 60 s to refresh before actual expiry
  iamCache = {
    token: data.access_token,
    expiresAt: now + (data.expires_in - 60) * 1000,
  };

  return iamCache.token;
}

/** Exposed only for tests to reset the cache between cases. */
export function _resetIamCache(): void {
  iamCache = null;
}

// ---------------------------------------------------------------------------
// JSON extraction from model output
// ---------------------------------------------------------------------------

/**
 * Extract the first balanced JSON object from arbitrary text.
 * Handles output wrapped in prose, markdown code fences, or raw JSON.
 */
export function extractJson(text: string): unknown {
  // Strip a leading ```json ... ``` fence if present
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenceMatch ? fenceMatch[1].trim() : text;

  // Find the first `{` and walk forward balancing braces
  const start = candidate.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  for (let i = start; i < candidate.length; i++) {
    if (candidate[i] === "{") depth++;
    else if (candidate[i] === "}") {
      depth--;
      if (depth === 0) {
        return JSON.parse(candidate.slice(start, i + 1));
      }
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

function buildPrompt(candidate: ClassifiableCandidate): string {
  return `You are a code-review classifier. Respond with ONLY a JSON object — no prose, no fences.

Schema: {"substantive": boolean, "summary": string}

Rules:
- "substantive" is true when the comment identifies a correctness, security, performance, or design problem.
- "substantive" is false for naming, formatting, typos, whitespace, and style preferences.
- "summary" is one sentence starting with a verb describing what was caught (e.g. "Prevents a retry storm under load."). Empty string when not substantive.

Review comment:
${candidate.commentBody}

File: ${candidate.path}, line ${candidate.line}

Respond with JSON only.`;
}

// ---------------------------------------------------------------------------
// Fallback value
// ---------------------------------------------------------------------------

const FALLBACK: Classification = {
  substantive: false,
  summary: "",
  classifier: "granite",
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Classify a review comment candidate using IBM Granite on watsonx.ai.
 *
 * On any error (network, parse, HTTP) returns the non-substantive fallback
 * and logs a warning — never throws.
 */
export async function classify(candidate: ClassifiableCandidate): Promise<Classification> {
  const watsonxUrl = process.env.WATSONX_URL;
  const projectId = process.env.WATSONX_PROJECT_ID;
  const model = process.env.WATSONX_MODEL ?? "ibm/granite-4-h-small";

  if (!watsonxUrl || !projectId) {
    console.warn("[granite] WATSONX_URL or WATSONX_PROJECT_ID not set — returning fallback");
    return FALLBACK;
  }

  let token: string;
  try {
    token = await getIamToken();
  } catch (err) {
    console.warn("[granite] IAM token error:", err);
    return FALLBACK;
  }

  const endpoint = `${watsonxUrl}/ml/v1/text/chat?version=2023-05-29`;

  let res: Response;
  try {
    res = await globalThis.fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        model_id: model,
        project_id: projectId,
        messages: [{ role: "user", content: buildPrompt(candidate) }],
        max_tokens: 200,
        temperature: 0,
      }),
    });
  } catch (err) {
    console.warn("[granite] fetch error:", err);
    return FALLBACK;
  }

  if (!res.ok) {
    console.warn(`[granite] HTTP ${res.status} from watsonx`);
    return FALLBACK;
  }

  let body: unknown;
  try {
    body = await res.json();
  } catch (err) {
    console.warn("[granite] JSON parse error on response body:", err);
    return FALLBACK;
  }

  // watsonx chat response shape:
  // { choices: [{ message: { content: string } }] }
  const generated =
    (body as any)?.choices?.[0]?.message?.content ?? "";

  let parsed: unknown;
  try {
    parsed = extractJson(generated);
  } catch {
    parsed = null;
  }

  if (
    parsed === null ||
    typeof (parsed as any)?.substantive !== "boolean"
  ) {
    console.warn("[granite] could not extract valid JSON from model output:", generated);
    return FALLBACK;
  }

  const result = parsed as { substantive: boolean; summary?: string };
  return {
    substantive: result.substantive,
    summary: typeof result.summary === "string" ? result.summary : "",
    classifier: "granite",
  };
}
