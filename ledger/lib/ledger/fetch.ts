/**
 * GitHub fetch layer.
 *
 * Fetches pull requests (merged, newest-first) for a given repo, together
 * with their review comments, commits, and per-commit file diffs.
 *
 * Uses the GitHub REST API via native `fetch`. No third-party client.
 */

export interface RawComment {
  id: number;
  body: string;
  path: string;
  line: number;
  user: string;
  createdAt: string;
  htmlUrl: string;
  diffHunk: string;
}

export interface RawCommit {
  sha: string;
  htmlUrl: string;
  committedAt: string;
  files: {
    path: string;
    additions: number;
    deletions: number;
    patch?: string;
  }[];
}

export interface RawPull {
  number: number;
  title: string;
  author: string;
  mergedAt: string;
  reviewComments: RawComment[];
  commits: RawCommit[];
  files: { path: string; additions: number; deletions: number; patch?: string }[];
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const BASE = "https://api.github.com";

function authHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/** Sleep for `ms` milliseconds. */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch a GitHub REST URL with one retry on 403 (respects `Retry-After`).
 * Throws a clear error on 404. Throws on any other non-2xx after the retry.
 */
async function ghFetch(url: string): Promise<unknown> {
  const doFetch = () =>
    globalThis.fetch(url, { headers: authHeaders() });

  let res = await doFetch();

  if (res.status === 403) {
    const retryAfter = res.headers.get("Retry-After");
    const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : 60_000;
    await sleep(waitMs);
    res = await doFetch();
  }

  if (res.status === 404) {
    throw new Error(`GitHub API 404: repository or resource not found — ${url}`);
  }

  if (!res.ok) {
    throw new Error(`GitHub API error ${res.status} ${res.statusText} — ${url}`);
  }

  return res.json();
}

/**
 * Paginate a GitHub REST list endpoint, yielding all items.
 * Stops when a page returns fewer than `perPage` items.
 */
async function* paginate<T>(
  path: string,
  perPage = 100,
): AsyncGenerator<T> {
  let page = 1;
  while (true) {
    const sep = path.includes("?") ? "&" : "?";
    const url = `${BASE}${path}${sep}per_page=${perPage}&page=${page}`;
    const items = (await ghFetch(url)) as T[];
    for (const item of items) yield item;
    if (items.length < perPage) break;
    page++;
  }
}

/** Limit concurrency to `max` in-flight promises at a time. */
async function pooled<T, R>(
  items: T[],
  max: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  }

  const workers = Array.from({ length: Math.min(max, items.length) }, worker);
  await Promise.all(workers);
  return results;
}

// ---------------------------------------------------------------------------
// Per-PR detail fetchers
// ---------------------------------------------------------------------------

async function fetchReviewComments(repo: string, prNumber: number): Promise<RawComment[]> {
  const comments: RawComment[] = [];
  for await (const c of paginate<any>(`/repos/${repo}/pulls/${prNumber}/comments`)) {
    // line may be null for outdated comments — skip those
    const line: number | null = c.line ?? c.original_line ?? null;
    if (line === null) continue;
    comments.push({
      id: c.id,
      body: c.body,
      path: c.path,
      line,
      user: c.user?.login ?? "",
      createdAt: c.created_at,
      htmlUrl: c.html_url,
      diffHunk: c.diff_hunk ?? "",
    });
  }
  return comments;
}

async function fetchCommitDetail(sha: string, repo: string): Promise<RawCommit> {
  const c = (await ghFetch(`${BASE}/repos/${repo}/commits/${sha}`)) as any;
  return {
    sha: c.sha,
    htmlUrl: c.html_url,
    committedAt: c.commit?.committer?.date ?? c.commit?.author?.date ?? "",
    files: (c.files ?? []).map((f: any) => ({
      path: f.filename,
      additions: f.additions,
      deletions: f.deletions,
      patch: f.patch,
    })),
  };
}

async function fetchPRCommits(repo: string, prNumber: number): Promise<RawCommit[]> {
  const shas: string[] = [];
  for await (const c of paginate<any>(`/repos/${repo}/pulls/${prNumber}/commits`)) {
    shas.push(c.sha);
  }
  return pooled(shas, 4, (sha) => fetchCommitDetail(sha, repo));
}

async function fetchPRFiles(
  repo: string,
  prNumber: number,
): Promise<{ path: string; additions: number; deletions: number; patch?: string }[]> {
  const files: any[] = [];
  for await (const f of paginate<any>(`/repos/${repo}/pulls/${prNumber}/files`)) {
    files.push({ path: f.filename, additions: f.additions, deletions: f.deletions, patch: f.patch });
  }
  return files;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch the most-recently-merged pull requests for `repo`, up to `limit`.
 * Enriches each PR with review comments, commit details, and file diffs.
 */
export async function fetchPullRequests(repo: string, limit: number): Promise<RawPull[]> {
  const rawPulls: any[] = [];
  outer: for await (const pr of paginate<any>(`/repos/${repo}/pulls?state=closed&sort=updated&direction=desc`)) {
    if (!pr.merged_at) continue;
    rawPulls.push(pr);
    if (rawPulls.length >= limit) break outer;
  }

  return pooled(rawPulls, 4, async (pr) => {
    const [reviewComments, commits, files] = await Promise.all([
      fetchReviewComments(repo, pr.number),
      fetchPRCommits(repo, pr.number),
      fetchPRFiles(repo, pr.number),
    ]);

    return {
      number: pr.number,
      title: pr.title,
      author: pr.user?.login ?? "",
      mergedAt: pr.merged_at,
      reviewComments,
      commits,
      files,
    } satisfies RawPull;
  });
}
