import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import type { RawPull } from "./fetch.ts";

// ---------------------------------------------------------------------------
// Minimal GitHub API stubs
// ---------------------------------------------------------------------------

/** Shape of one item returned by /repos/:repo/pulls */
const STUB_PR = {
  number: 42,
  title: "Fix retry jitter",
  user: { login: "author-one" },
  merged_at: "2026-06-14T09:00:00Z",
};

/** Shape of one review comment */
const STUB_COMMENT = {
  id: 1111,
  body: "This has no jitter.",
  path: "src/retry.ts",
  line: 88,
  original_line: 88,
  user: { login: "reviewer-one" },
  created_at: "2026-06-14T09:12:00Z",
  html_url: "https://github.com/owner/repo/pull/42#discussion_r1111",
  diff_hunk: "@@ -85,6 +85,9 @@",
};

/** Shape of one commit list item */
const STUB_COMMIT_LIST = { sha: "abc123" };

/** Shape of a commit detail response */
const STUB_COMMIT_DETAIL = {
  sha: "abc123",
  html_url: "https://github.com/owner/repo/commit/abc123",
  commit: { committer: { date: "2026-06-14T09:20:00Z" } },
  files: [
    { filename: "src/retry.ts", additions: 5, deletions: 2, patch: "@@ -85 +85 @@" },
  ],
};

/** Shape of a PR files response */
const STUB_PR_FILE = {
  filename: "src/retry.ts",
  additions: 5,
  deletions: 2,
  patch: "@@ -85 +85 @@",
};

// ---------------------------------------------------------------------------
// URL-keyed stub dispatcher
// ---------------------------------------------------------------------------

type StubRoute = { pattern: RegExp | string; response: unknown; status?: number; headers?: Record<string, string> };

let routes: StubRoute[] = [];

function stubFetch(url: string): Promise<Response> {
  for (const route of routes) {
    const matched =
      typeof route.pattern === "string" ? url.includes(route.pattern) : route.pattern.test(url);
    if (matched) {
      const status = route.status ?? 200;
      const body = JSON.stringify(route.response);
      const headers = new Headers({ "content-type": "application/json", ...(route.headers ?? {}) });
      return Promise.resolve(new Response(body, { status, headers }));
    }
  }
  throw new Error(`No stub matched URL: ${url}`);
}

// ---------------------------------------------------------------------------
// Test suites
// ---------------------------------------------------------------------------

describe("fetchPullRequests", () => {
  let originalFetch: typeof globalThis.fetch;

  before(() => {
    originalFetch = globalThis.fetch;
    (globalThis as any).fetch = stubFetch;
  });

  after(() => {
    globalThis.fetch = originalFetch;
  });

  it("maps a successful response into RawPull shape", async () => {
    routes = [
      // PR list
      { pattern: /pulls\?state=closed/, response: [STUB_PR] },
      // review comments (first page full → second page empty)
      { pattern: /pulls\/42\/comments/, response: [STUB_COMMENT] },
      // commit list
      { pattern: /pulls\/42\/commits/, response: [STUB_COMMIT_LIST] },
      // commit detail
      { pattern: /commits\/abc123/, response: STUB_COMMIT_DETAIL },
      // PR files
      { pattern: /pulls\/42\/files/, response: [STUB_PR_FILE] },
    ];

    const { fetchPullRequests } = await import("./fetch.ts");
    const prs: RawPull[] = await fetchPullRequests("owner/repo", 1);

    assert.equal(prs.length, 1);
    const pr = prs[0];

    assert.equal(pr.number, 42);
    assert.equal(pr.title, "Fix retry jitter");
    assert.equal(pr.author, "author-one");
    assert.equal(pr.mergedAt, "2026-06-14T09:00:00Z");

    // review comment
    assert.equal(pr.reviewComments.length, 1);
    const c = pr.reviewComments[0];
    assert.equal(c.id, 1111);
    assert.equal(c.body, "This has no jitter.");
    assert.equal(c.path, "src/retry.ts");
    assert.equal(c.line, 88);
    assert.equal(c.user, "reviewer-one");
    assert.equal(c.htmlUrl, "https://github.com/owner/repo/pull/42#discussion_r1111");

    // commit
    assert.equal(pr.commits.length, 1);
    const commit = pr.commits[0];
    assert.equal(commit.sha, "abc123");
    assert.equal(commit.committedAt, "2026-06-14T09:20:00Z");
    assert.equal(commit.files.length, 1);
    assert.equal(commit.files[0].path, "src/retry.ts");

    // files
    assert.equal(pr.files.length, 1);
    assert.equal(pr.files[0].path, "src/retry.ts");
  });

  it("throws a clear error on 404", async () => {
    routes = [
      { pattern: /pulls\?state=closed/, response: { message: "Not Found" }, status: 404 },
    ];

    const { fetchPullRequests } = await import("./fetch.ts");
    await assert.rejects(
      () => fetchPullRequests("no-such/repo", 1),
      (err: Error) => {
        assert.match(err.message, /404/);
        assert.match(err.message, /not found/i);
        return true;
      },
    );
  });

  it("retries once on 403 with Retry-After then succeeds", async () => {
    let callCount = 0;

    (globalThis as any).fetch = (url: string): Promise<Response> => {
      // Only intercept the PR list endpoint for the 403 test
      if (/pulls\?state=closed/.test(url)) {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve(
            new Response(JSON.stringify({ message: "rate limited" }), {
              status: 403,
              headers: new Headers({ "Retry-After": "0" }), // 0s so the test is fast
            }),
          );
        }
        // Second call succeeds but returns empty list so we stop quickly
        return Promise.resolve(
          new Response(JSON.stringify([STUB_PR]), {
            status: 200,
            headers: new Headers({ "content-type": "application/json" }),
          }),
        );
      }

      // For all other endpoints (comments, commits, files) return empty lists
      return Promise.resolve(
        new Response(JSON.stringify([]), {
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
        }),
      );
    };

    const { fetchPullRequests } = await import("./fetch.ts");
    const prs = await fetchPullRequests("owner/repo", 1);

    assert.equal(callCount, 2, "should have called the PR list endpoint twice");
    // STUB_PR has no commits/comments so the PR still maps but with empty arrays
    assert.equal(prs.length, 1);
    assert.equal(prs[0].number, 42);
  });
});
