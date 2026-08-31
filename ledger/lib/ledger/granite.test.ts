import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { classify, getIamToken, _resetIamCache, extractJson } from "./granite.ts";
import type { ClassifiableCandidate } from "./types.ts";

// ---------------------------------------------------------------------------
// Test candidate fixture
// ---------------------------------------------------------------------------

const CANDIDATE: ClassifiableCandidate = {
  commentBody: "This retries three times with no jitter, so under load every caller wakes together.",
  path: "src/client.ts",
  line: 42,
};

// ---------------------------------------------------------------------------
// Stub helpers
// ---------------------------------------------------------------------------

const IAM_RESPONSE = {
  access_token: "test-token-abc",
  expires_in: 3600,
};

function makeWatsonxResponse(content: string, status = 200) {
  return new Response(
    JSON.stringify({ choices: [{ message: { content } }] }),
    {
      status,
      headers: { "content-type": "application/json" },
    },
  );
}

function makeIamResponse() {
  return new Response(JSON.stringify(IAM_RESPONSE), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// Environment setup
// ---------------------------------------------------------------------------

const ORIG_ENV = { ...process.env };

function setEnv() {
  process.env.WATSONX_API_KEY = "test-api-key";
  process.env.WATSONX_URL = "https://us-south.ml.cloud.ibm.com";
  process.env.WATSONX_PROJECT_ID = "test-project-id";
}

function restoreEnv() {
  Object.assign(process.env, ORIG_ENV);
}

// ---------------------------------------------------------------------------
// extractJson unit tests
// ---------------------------------------------------------------------------

describe("extractJson", () => {
  it("parses bare JSON object", () => {
    const result = extractJson('{"substantive": true, "summary": "Fixes a race."}');
    assert.deepEqual(result, { substantive: true, summary: "Fixes a race." });
  });

  it("parses JSON inside a ```json fence", () => {
    const result = extractJson('```json\n{"substantive": true, "summary": "Found a bug."}\n```');
    assert.deepEqual(result, { substantive: true, summary: "Found a bug." });
  });

  it("parses JSON with prose before it", () => {
    const result = extractJson('Sure, here you go: {"substantive": false, "summary": ""}');
    assert.deepEqual(result, { substantive: false, summary: "" });
  });

  it("returns null on malformed input", () => {
    const result = extractJson("not json at all");
    assert.equal(result, null);
  });
});

// ---------------------------------------------------------------------------
// classify integration tests (fetch stubbed)
// ---------------------------------------------------------------------------

describe("classify", () => {
  let originalFetch: typeof globalThis.fetch;
  let iamCallCount: number;
  let watsonxCallCount: number;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    iamCallCount = 0;
    watsonxCallCount = 0;
    _resetIamCache();
    setEnv();
  });

  function restoreFetch() {
    globalThis.fetch = originalFetch;
    restoreEnv();
  }

  it("clean JSON response parses to substantive classification", async () => {
    (globalThis as any).fetch = (url: string) => {
      if (url.includes("iam.cloud.ibm.com")) return Promise.resolve(makeIamResponse());
      watsonxCallCount++;
      return Promise.resolve(makeWatsonxResponse('{"substantive": true, "summary": "Prevents a retry storm under load."}'));
    };

    const result = await classify(CANDIDATE);
    assert.equal(result.substantive, true);
    assert.equal(result.summary, "Prevents a retry storm under load.");
    assert.equal(result.classifier, "granite");
    restoreFetch();
  });

  it("JSON inside a ```json fence parses correctly", async () => {
    (globalThis as any).fetch = (url: string) => {
      if (url.includes("iam.cloud.ibm.com")) return Promise.resolve(makeIamResponse());
      return Promise.resolve(
        makeWatsonxResponse('```json\n{"substantive": true, "summary": "Catches a null dereference."}\n```'),
      );
    };

    const result = await classify(CANDIDATE);
    assert.equal(result.substantive, true);
    assert.equal(result.summary, "Catches a null dereference.");
    restoreFetch();
  });

  it("JSON with prose before it parses correctly", async () => {
    (globalThis as any).fetch = (url: string) => {
      if (url.includes("iam.cloud.ibm.com")) return Promise.resolve(makeIamResponse());
      return Promise.resolve(
        makeWatsonxResponse('Here is my classification: {"substantive": false, "summary": ""}'),
      );
    };

    const result = await classify(CANDIDATE);
    assert.equal(result.substantive, false);
    assert.equal(result.summary, "");
    restoreFetch();
  });

  it("malformed model output returns non-substantive fallback without throwing", async () => {
    (globalThis as any).fetch = (url: string) => {
      if (url.includes("iam.cloud.ibm.com")) return Promise.resolve(makeIamResponse());
      return Promise.resolve(makeWatsonxResponse("I cannot classify this."));
    };

    const result = await classify(CANDIDATE);
    assert.equal(result.substantive, false);
    assert.equal(result.summary, "");
    assert.equal(result.classifier, "granite");
    restoreFetch();
  });

  it("HTTP 500 from watsonx returns fallback after retries are exhausted", async () => {
    let attempts = 0;
    (globalThis as any).fetch = (url: string) => {
      if (url.includes("iam.cloud.ibm.com")) return Promise.resolve(makeIamResponse());
      attempts++;
      return Promise.resolve(
        new Response(JSON.stringify({ error: "internal" }), {
          status: 500,
          headers: new Headers({ "content-type": "application/json", "Retry-After": "0" }),
        }),
      );
    };

    const result = await classify(CANDIDATE);
    assert.equal(result.substantive, false);
    assert.equal(result.classifier, "granite");
    assert.equal(attempts, 4, "should attempt 4 times before giving up");
    restoreFetch();
  });

  it("HTTP 429 retries and succeeds on the second attempt", async () => {
    let attempts = 0;
    (globalThis as any).fetch = (url: string) => {
      if (url.includes("iam.cloud.ibm.com")) return Promise.resolve(makeIamResponse());
      attempts++;
      if (attempts === 1) {
        return Promise.resolve(
          new Response(JSON.stringify({ error: "rate limited" }), {
            status: 429,
            headers: new Headers({ "content-type": "application/json", "Retry-After": "0" }),
          }),
        );
      }
      return Promise.resolve(makeWatsonxResponse('{"substantive": true, "summary": "Caught a bug."}'));
    };

    const result = await classify(CANDIDATE);
    assert.equal(result.substantive, true);
    assert.equal(result.summary, "Caught a bug.");
    assert.equal(attempts, 2, "should succeed on second attempt");
    restoreFetch();
  });

  it("non-429 4xx falls through immediately without retry", async () => {
    let attempts = 0;
    (globalThis as any).fetch = (url: string) => {
      if (url.includes("iam.cloud.ibm.com")) return Promise.resolve(makeIamResponse());
      attempts++;
      return Promise.resolve(
        new Response(JSON.stringify({ error: "bad request" }), {
          status: 400,
          headers: new Headers({ "content-type": "application/json" }),
        }),
      );
    };

    const result = await classify(CANDIDATE);
    assert.equal(result.substantive, false);
    assert.equal(attempts, 1, "should not retry on 400");
    restoreFetch();
  });

  it("IAM token is fetched once across two classify calls", async () => {
    (globalThis as any).fetch = (url: string) => {
      if (url.includes("iam.cloud.ibm.com")) {
        iamCallCount++;
        return Promise.resolve(makeIamResponse());
      }
      watsonxCallCount++;
      return Promise.resolve(makeWatsonxResponse('{"substantive": true, "summary": "Found a bug."}'));
    };

    await classify(CANDIDATE);
    await classify(CANDIDATE);

    assert.equal(iamCallCount, 1, "IAM should be called only once");
    assert.equal(watsonxCallCount, 2, "watsonx should be called twice");
    restoreFetch();
  });
});
