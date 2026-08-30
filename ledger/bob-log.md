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
