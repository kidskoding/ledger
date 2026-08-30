# Track A — Bob prompts

Paste these into IBM Bob in VS Code, in order. Bob writes every file in
`ledger/lib/ledger/` except `types.ts`, which is the shared contract and is
already written.

Before starting, confirm `ledger/lib/ledger/types.ts` exists — every prompt
below tells Bob to read it, and the whole engine is built against it.

Commit from Bob's session so the git history records which tool wrote what.
Append each prompt verbatim to `bob-log.md` as you go; that file becomes the
README's required "How IBM Bob was used" section, and reconstructing it
afterwards is slower and less honest than keeping it live.

One amendment to the prompts below, decided after the plan was written:
`classify` and `classifyByKeyword` take `ClassifiableCandidate` (exported
from `types.ts`) rather than `Candidate`. It is `Pick<PreventedEvent,
"commentBody" | "path" | "line">` — the fields a classifier actually reads.
`Candidate` satisfies it structurally, so detection call sites are
unchanged, and scripts holding only a labelled comment can call a classifier
without a cast.

---

### Task A.1: GitHub fetch layer

**Files:**
- Create: `ledger/lib/ledger/fetch.ts`
- Test: `ledger/lib/ledger/fetch.test.ts`

**Interfaces:**
- Consumes: `types.ts`.
- Produces:
  - `fetchPullRequests(repo: string, limit: number): Promise<RawPull[]>`
  - `RawPull` — exported interface carrying `number`, `title`, `author`, `mergedAt`, `reviewComments`, `commits`, `files`.
  - `RawComment` — `id`, `body`, `path`, `line`, `user`, `createdAt`, `htmlUrl`, `diffHunk`.
  - `RawCommit` — `sha`, `htmlUrl`, `committedAt`, `files: { path: string; additions: number; deletions: number; patch?: string }[]`.

- [ ] **Step 1: Prompt Bob**

> Read `ARCHITECTURE.md` and `ledger/lib/ledger/types.ts`.
>
> Create `ledger/lib/ledger/fetch.ts`. It fetches from the GitHub REST API using `process.env.GITHUB_TOKEN`, with no third-party client library — use `fetch`.
>
> Export `fetchPullRequests(repo: string, limit: number)` returning merged pull requests, newest first, capped at `limit`. For each pull request also fetch its review comments (`/pulls/{n}/comments`), its commits (`/pulls/{n}/commits`), and the files each commit touched.
>
> Export interfaces `RawPull`, `RawComment`, `RawCommit` with these fields: [paste the Interfaces block above].
>
> Requirements: retry once on HTTP 403 with a `Retry-After` wait; throw a clear error on 404; concurrency limited to 4 in-flight requests; every timestamp kept as an ISO 8601 UTC string.

- [ ] **Step 2: Ask Bob for the test**

> Write `ledger/lib/ledger/fetch.test.ts` using `node:test` and `node:assert`. Stub `globalThis.fetch`. Cover: a successful fetch mapping into `RawPull`; a 404 producing a clear error; a 403 with `Retry-After` retrying once then succeeding.

- [ ] **Step 3: Run the tests**

Run: `cd ledger && bun test lib/ledger/fetch.test.ts`
Expected: PASS.

- [ ] **Step 4: Smoke test against a real repo**

```bash
cd ledger
bun -e "import('./lib/ledger/fetch.ts').then(async m => {
  const prs = await m.fetchPullRequests('astral-sh/ruff', 3);
  console.log(prs.length, prs[0]?.number, prs[0]?.reviewComments.length);
})"
```
Expected: three PR numbers and a comment count print.

- [ ] **Step 5: Commit from Bob's session**

```bash
git add ledger/lib/ledger/fetch.ts ledger/lib/ledger/fetch.test.ts
git commit -m "feat(ledger): add GitHub fetch layer

Built with IBM Bob."
```

- [ ] **Step 6: Append the prompt to `bob-log.md`**

---


### Task A.2: Prevented-event detector

**Files:**
- Create: `ledger/lib/ledger/detect.ts`
- Test: `ledger/lib/ledger/detect.test.ts`

**Interfaces:**
- Consumes: `RawPull`, `RawComment`, `RawCommit` from `fetch.ts`; `types.ts`.
- Produces: `detectCandidates(pull: RawPull): Candidate[]` where `Candidate` is `Omit<PreventedEvent, "severity" | "classification">`.

- [ ] **Step 1: Prompt Bob**

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

- [ ] **Step 2: Ask Bob for the test**

> Write `ledger/lib/ledger/detect.test.ts` with `node:test`. Cover: a comment followed by a commit touching the same lines yields one candidate; a commit **before** the comment yields none; a commit touching a different file yields none; a comment by the PR author yields none; a `[bot]` comment yields none; a commit touching the same file 200 lines away yields none.

- [ ] **Step 3: Run the tests**

Run: `cd ledger && bun test lib/ledger/detect.test.ts`
Expected: PASS, all six cases.

- [ ] **Step 4: Commit and log the prompt**

```bash
git add ledger/lib/ledger/detect.ts ledger/lib/ledger/detect.test.ts
git commit -m "feat(ledger): detect review comments that caused code changes

Built with IBM Bob."
```

---


### Task A.3: Granite classifier

**Files:**
- Create: `ledger/lib/ledger/granite.ts`
- Test: `ledger/lib/ledger/granite.test.ts`

**Interfaces:**
- Consumes: `Candidate` from `detect.ts`; `Classification` from `types.ts`.
- Produces: `classify(candidate: Candidate): Promise<Classification>`, and `getIamToken(): Promise<string>` (cached until 60s before expiry).

- [ ] **Step 1: Prompt Bob**

> Read `ARCHITECTURE.md` and `ledger/lib/ledger/types.ts`.
>
> Create `ledger/lib/ledger/granite.ts` exporting `classify(candidate: Candidate): Promise<Classification>`.
>
> It calls IBM watsonx.ai text generation with an IBM Granite model. Exchange `WATSONX_API_KEY` for an IAM token at `https://iam.cloud.ibm.com/identity/token` (grant type `urn:ibm:params:oauth:grant-type:apikey`) and cache that token in module scope until 60 seconds before it expires. Then POST to `${WATSONX_URL}/ml/v1/text/generation?version=2023-05-29` with `project_id` from `WATSONX_PROJECT_ID`.
>
> The prompt gives the model the review comment, the file path, and the diff hunk it was anchored to, and asks for strict JSON:
> `{"substantive": boolean, "summary": string}`
> where `substantive` is true only when the comment identifies a correctness, security, performance, or design problem — and false for naming, formatting, typos, and style preferences. `summary` is one sentence starting with a verb describing what was caught, or an empty string when `substantive` is false.
>
> Parse the response defensively: the model may wrap JSON in prose or a code fence. Extract the first balanced JSON object. On a parse failure or an HTTP error, return `{ substantive: false, summary: "", classifier: "granite" }` and log a warning — never throw, because one bad classification must not kill a 50-PR run.
>
> Set `temperature` to 0 and `max_new_tokens` to 200.

- [ ] **Step 2: Ask Bob for the test**

> Write `ledger/lib/ledger/granite.test.ts` with `node:test`, stubbing `globalThis.fetch`. Cover: clean JSON parses; JSON inside a ```json fence parses; JSON with prose before it parses; malformed output returns the non-substantive fallback rather than throwing; an HTTP 500 returns the fallback; the IAM token is fetched once across two `classify` calls.

- [ ] **Step 3: Run the tests**

Run: `cd ledger && bun test lib/ledger/granite.test.ts`
Expected: PASS, all six cases.

- [ ] **Step 4: Smoke test against real watsonx**

```bash
cd ledger
bun -e "import('./lib/ledger/granite.ts').then(async m => {
  console.log(await m.classify({
    commentBody: 'This retries three times with no jitter, so under load every caller wakes together.',
    path: 'src/client.ts', line: 42,
  }));
})"
```
Expected: `substantive: true` with a one-line summary. **If this fails, stop and fix — Phase 3 depends on it.**

- [ ] **Step 5: Commit and log the prompt**

```bash
git add ledger/lib/ledger/granite.ts ledger/lib/ledger/granite.test.ts
git commit -m "feat(ledger): classify catches with IBM Granite on watsonx

Built with IBM Bob."
```

---


### Task A.4: Baseline classifier, severity, and cycles

Three small pure functions. One task because they share a test run and none is independently rejectable.

**Files:**
- Create: `ledger/lib/ledger/baseline.ts`, `ledger/lib/ledger/severity.ts`, `ledger/lib/ledger/cycles.ts`
- Test: `ledger/lib/ledger/engine.test.ts`

**Interfaces:**
- Produces:
  - `classifyByKeyword(candidate: Candidate): Classification` — synchronous, `classifier: "baseline"`.
  - `severityForPath(path: string): Severity`
  - `cycleBuckets(pulls: RawPull[]): CycleBucket[]`

- [ ] **Step 1: Prompt Bob**

> Read `ARCHITECTURE.md` and `ledger/lib/ledger/types.ts`.
>
> Create three files.
>
> `ledger/lib/ledger/baseline.ts` exports `classifyByKeyword(candidate: Candidate): Classification`. Substantive when the comment body matches any of: `bug`, `race`, `null`, `undefined`, `panic`, `leak`, `security`, `injection`, `overflow`, `deadlock`, `crash`, `regression`. Not substantive when it matches any of: `nit`, `typo`, `style`, `formatting`, `naming`, `rename`, `whitespace`. Negative markers win over positive ones. Case-insensitive, word-boundary matched so `nullable` does not match `null`. `summary` is always an empty string. `classifier` is `"baseline"`.
>
> `ledger/lib/ledger/severity.ts` exports `severityForPath(path: string): Severity`. High when the path contains any of `auth`, `payment`, `billing`, `security`, `crypto`, `migration`, `session`, `permission`. Low when the path contains any of `test`, `spec`, `fixture`, `mock`, `docs`, `example`, `snapshot`, or ends in `.md`. Medium otherwise. Low wins over high when both match, because a test file about auth is still a test file.
>
> `ledger/lib/ledger/cycles.ts` exports `cycleBuckets(pulls: RawPull[]): CycleBucket[]`. A review cycle is one round of review followed by at least one commit. Count, per pull request, how many times a review comment is followed by a later commit — that is its cycle count, minimum 1. Bucket pull requests by the calendar quarter of `mergedAt` (format `"2025-Q1"`), report the median cycle count and the pull request count per bucket, sorted oldest first. Drop buckets with fewer than 5 pull requests — a median over 3 items is noise.

- [ ] **Step 2: Ask Bob for the tests**

> Write `ledger/lib/ledger/engine.test.ts` with `node:test`. Cover, for baseline: a comment saying "this has a race condition" is substantive; "nit: rename this" is not; "nit: this null check is missing" is not, because negative markers win; "nullable field" does not match `null`. For severity: `src/auth/token.ts` is high; `tests/auth/token.test.ts` is low; `src/parser.ts` is medium; `README.md` is low. For cycles: a PR with two comment-then-commit rounds counts 2; a PR with no comments counts 1; a quarter with 4 pull requests is dropped; buckets sort oldest first.

- [ ] **Step 3: Run the tests**

Run: `cd ledger && bun test lib/ledger/engine.test.ts`
Expected: PASS.

- [ ] **Step 4: Commit and log the prompt**

```bash
git add ledger/lib/ledger/baseline.ts ledger/lib/ledger/severity.ts ledger/lib/ledger/cycles.ts ledger/lib/ledger/engine.test.ts
git commit -m "feat(ledger): add keyword baseline, severity, and cycle counting

Built with IBM Bob."
```

---

