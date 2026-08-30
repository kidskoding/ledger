# Bob Log — LEDGER

Every prompt sent to IBM Bob, in order. Each entry records what was asked and
what was produced. This file is the required "How IBM Bob was used" section
for the IBM SkillsBuild submission.

---

## Session 1

### Setup prompts (pre-implementation)

> Bob will write every file in `ledger/lib/ledger/` except `types.ts`, which is the shared contract and is already written.

> Before starting, confirm `ledger/lib/ledger/types.ts` exists — every prompt below tells Bob to read it, and the whole engine is built against it.

**Result:** Confirmed. `types.ts` read in full. All types noted: `Severity`, `Classification`, `ClassifiableCandidate`, `PreventedEvent`, `Contributor`, `CycleBucket`, `Correlation`, `RunResult`, `RunEvent`, `SEVERITY_WEIGHT`.

---

> Commit from Bob's session so the git history records which tool wrote what. Append each prompt verbatim to `bob-log.md` as you go; that file becomes the README's required "How IBM Bob was used" section, and reconstructing it afterwards is slower and less honest than keeping it live.

**Result:** `bob-log.md` created. Live appending in effect from this point.

---

> One amendment to the prompts below, decided after the plan was written: `classify` and `classifyByKeyword` take `ClassifiableCandidate` (exported from `types.ts`) rather than `Candidate`. It is `Pick<PreventedEvent, "commentBody" | "path" | "line">` — the fields a classifier actually reads. `Candidate` satisfies it structurally, so detection call sites are unchanged, and scripts holding only a labelled comment can call a classifier without a cast.

**Result:** Noted. `classify` and `classifyByKeyword` will both accept `ClassifiableCandidate`.

---

### Task A.1: GitHub fetch layer

> Read `ARCHITECTURE.md` and `ledger/lib/ledger/types.ts`.
>
> Create `ledger/lib/ledger/fetch.ts`. It fetches from the GitHub REST API using `process.env.GITHUB_TOKEN`, with no third-party client library — use `fetch`.
>
> Export `fetchPullRequests(repo: string, limit: number)` returning merged pull requests, newest first, capped at `limit`. For each pull request also fetch its review comments (`/pulls/{n}/comments`), its commits (`/pulls/{n}/commits`), and the files each commit touched.
>
> Export interfaces `RawPull`, `RawComment`, `RawCommit` with these fields: [see Task A.1 interfaces block].
>
> Requirements: retry once on HTTP 403 with a `Retry-After` wait; throw a clear error on 404; concurrency limited to 4 in-flight requests; every timestamp kept as an ISO 8601 UTC string.
>
> Write `ledger/lib/ledger/fetch.test.ts` using `node:test` and `node:assert`. Stub `globalThis.fetch`. Cover: a successful fetch mapping into `RawPull`; a 404 producing a clear error; a 403 with `Retry-After` retrying once then succeeding.

**Result:**
- Created `ledger/lib/ledger/fetch.ts` — `fetchPullRequests` with pagination, 4-wide concurrency pool, 403 retry, 404 error.
- Created `ledger/lib/ledger/fetch.test.ts` — 3 tests using `node:test` / `node:assert`, `globalThis.fetch` stubbed.
- `bun test lib/ledger/fetch.test.ts` → **3 pass, 0 fail**.
- Smoke test against `astral-sh/ruff` → **3 PRs returned**.

---

### Task A.2: Prevented-event detector

> Read `ARCHITECTURE.md`, `ledger/lib/ledger/types.ts`, and `ledger/lib/ledger/fetch.ts`.
>
> Create `ledger/lib/ledger/detect.ts` exporting `detectCandidates(pull: RawPull): Candidate[]`, where `Candidate = Omit<PreventedEvent, "severity" | "classification">`.
>
> A candidate exists when all of these hold:
> 1. A review comment is anchored to a specific file and line (`path` and `line` are both present — skip comments where either is null).
> 2. A commit **later than that comment's `createdAt`** modifies the same file.
> 3. That commit's patch for the file touches a line within ±10 lines of the comment's anchor.
>
> Set `linesChanged` to additions plus deletions for that file in that commit. Set `id` to `` `${repo}#${prNumber}:${commentId}` ``. Skip comments authored by the pull request author — self-review is not prevention. Skip comments from accounts whose login ends in `[bot]`.
>
> Parse the unified-diff patch to get changed line numbers. Do not use a regex over the whole patch; walk the hunk headers.
>
> Write `ledger/lib/ledger/detect.test.ts` with `node:test`. Cover: a comment followed by a commit touching the same lines yields one candidate; a commit **before** the comment yields none; a commit touching a different file yields none; a comment by the PR author yields none; a `[bot]` comment yields none; a commit touching the same file 200 lines away yields none.

**Result:**
- Created `ledger/lib/ledger/detect.ts` — `detectCandidates` + `changedLines` patch parser (walks hunk headers).
- Created `ledger/lib/ledger/detect.test.ts` — 8 tests (6 `detectCandidates` cases + 2 `changedLines` unit tests).
- `bun test lib/ledger/detect.test.ts` → **8 pass, 0 fail**.

---

### Task A.3: Granite classifier

> Read `ARCHITECTURE.md` and `ledger/lib/ledger/types.ts`.
>
> Create `ledger/lib/ledger/granite.ts` exporting `classify(candidate: Candidate): Promise<Classification>`.
>
> It calls IBM watsonx.ai text generation with an IBM Granite model. Exchange `WATSONX_API_KEY` for an IAM token at `https://iam.cloud.ibm.com/identity/token` (grant type `urn:ibm:params:oauth:grant-type:apikey`) and cache that token in module scope until 60 seconds before it expires. Then POST to `${WATSONX_URL}/ml/v1/text/generation?version=2023-05-29` with `project_id` from `WATSONX_PROJECT_ID`.
>
> The prompt gives the model the review comment, the file path, and the diff hunk it was anchored to, and asks for strict JSON: `{"substantive": boolean, "summary": string}` where `substantive` is true only when the comment identifies a correctness, security, performance, or design problem — and false for naming, formatting, typos, and style preferences. `summary` is one sentence starting with a verb describing what was caught, or an empty string when `substantive` is false.
>
> Parse the response defensively: the model may wrap JSON in prose or a code fence. Extract the first balanced JSON object. On a parse failure or an HTTP error, return `{ substantive: false, summary: "", classifier: "granite" }` and log a warning — never throw, because one bad classification must not kill a 50-PR run.
>
> Set `temperature` to 0 and `max_new_tokens` to 200.
>
> Write `ledger/lib/ledger/granite.test.ts` with `node:test`, stubbing `globalThis.fetch`. Cover: clean JSON parses; JSON inside a ```json fence parses; JSON with prose before it parses; malformed output returns the non-substantive fallback rather than throwing; an HTTP 500 returns the fallback; the IAM token is fetched once across two `classify` calls.

**Result:**
- Created `ledger/lib/ledger/granite.ts` — `classify`, `getIamToken` (module-scope cache, expires −60 s), `extractJson` (balanced-brace walker), `_resetIamCache` (test helper).
- Created `ledger/lib/ledger/granite.test.ts` — 10 tests (4 `extractJson` + 6 `classify` cases).
- `bun test lib/ledger/granite.test.ts` → **10 pass, 0 fail**.
- Smoke test: credentials not yet in environment — all unit paths verified via stubs.

---

### Task A.4: Baseline classifier, severity, and cycles

> Read `ARCHITECTURE.md` and `ledger/lib/ledger/types.ts`.
>
> Create three files.
>
> `ledger/lib/ledger/baseline.ts` exports `classifyByKeyword(candidate: Candidate): Classification`. Substantive when the comment body matches any of: `bug`, `race`, `null`, `undefined`, `panic`, `leak`, `security`, `injection`, `overflow`, `deadlock`, `crash`, `regression`. Not substantive when it matches any of: `nit`, `typo`, `style`, `formatting`, `naming`, `rename`, `whitespace`. Negative markers win over positive ones. Case-insensitive, word-boundary matched so `nullable` does not match `null`. `summary` is always an empty string. `classifier` is `"baseline"`.
>
> `ledger/lib/ledger/severity.ts` exports `severityForPath(path: string): Severity`. High when the path contains any of `auth`, `payment`, `billing`, `security`, `crypto`, `migration`, `session`, `permission`. Low when the path contains any of `test`, `spec`, `fixture`, `mock`, `docs`, `example`, `snapshot`, or ends in `.md`. Medium otherwise. Low wins over high when both match, because a test file about auth is still a test file.
>
> `ledger/lib/ledger/cycles.ts` exports `cycleBuckets(pulls: RawPull[]): CycleBucket[]`. A review cycle is one round of review followed by at least one commit. Count, per pull request, how many times a review comment is followed by a later commit — that is its cycle count, minimum 1. Bucket pull requests by the calendar quarter of `mergedAt` (format `"2025-Q1"`), report the median cycle count and the pull request count per bucket, sorted oldest first. Drop buckets with fewer than 5 pull requests — a median over 3 items is noise.
>
> Write `ledger/lib/ledger/engine.test.ts` with `node:test`. Cover, for baseline: a comment saying "this has a race condition" is substantive; "nit: rename this" is not; "nit: this null check is missing" is not, because negative markers win; "nullable field" does not match `null`. For severity: `src/auth/token.ts` is high; `tests/auth/token.test.ts` is low; `src/parser.ts` is medium; `README.md` is low. For cycles: a PR with two comment-then-commit rounds counts 2; a PR with no comments counts 1; a quarter with 4 pull requests is dropped; buckets sort oldest first.

**Result:**
- Created `ledger/lib/ledger/baseline.ts` — word-boundary regex matching, negative markers win.
- Created `ledger/lib/ledger/severity.ts` — low wins over high when both match.
- Created `ledger/lib/ledger/cycles.ts` — per-PR cycle count, median per quarter bucket, ≥5 PR minimum.
- Created `ledger/lib/ledger/engine.test.ts` — 12 tests across all three modules.
- `bun test lib/ledger/engine.test.ts` → **12 pass, 0 fail**.
