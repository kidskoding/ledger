# Competitive Landscape — AI Builders Challenge with IBM Bob

**Pulled:** 2026-08-24 (day 24 of 31) from the BeMyApp platform GraphQL API (`othersProjectList`), server-side tag filter, deduplicated by project ID. Raw data: `data/wildcard-field-raw.json`.

**Our track:** Wildcard Challenge (August) — *Build Intelligent Systems for the Future of Work*
**Deadline:** 31 August 2026, 11:59 PM ET

---

## 1. Field size — August is dramatically less crowded

| Month | Themed track | Wildcard | Total |
|---|---|---|---|
| July (final) | 275 | 79 | **354** |
| August (as of day 24) | 32 | 13 | **45** |

Prize pool is identical each month: 1st $2,250 · Runner-up $1,250 · Most Innovative $750 · Best Use of Technology $750.

August is currently at **~13% of July's volume**. Even a heavy final-week surge is unlikely to close that gap. Four prizes against a probable field of 40–80 wildcard entries is a materially better bet than July's 79, and far better than July Creative's 275.

**Implication:** August Wildcard is the correct track. August Space (32 entries) is both more crowded than August Wildcard and a domain where credibility is harder to establish in seven days.

---

## 2. Almost nobody uses IBM's own AI

Across all 92 wildcard projects (July + August), **6 mention watsonx or Granite in their pitch — 6.5%.**

The judging criterion reads: *"Technical Execution — quality of implementation and effective use of AI **and IBM technologies**."* This is an IBM-sponsored panel and roughly 93% of the field is quietly calling a non-IBM model.

**Implication:** Granite on watsonx as the reasoning layer, stated explicitly in the video and README, is close to free differentiation — and it is the single clearest path to **Best Use of Technology**, the prize with the smallest effective field.

---

## 3. Crowding map (92 wildcard entries, keyword-clustered)

### Death zones — avoid

| Cluster | Count | Representative entries |
|---|---|---|
| Meeting / knowledge capture | 12 | AncoraAI, Cadence, MindMesh, Atlas, Corpus |
| Student / career assistants | 10 | CareerPlot AI, Nexus AI, Acad-Nav, Student Digital Twin, ClearPath AI, FocusForge |
| Generic "decision intelligence platform" | 10 | Cascade Intelligence, NexusFlow, AI ICF Copilot, AutoSage |
| Multi-agent orchestrator (unspecified) | 10 | Chronos, ARL, OpsFlow, VoxDesk, Intently |

### Getting crowded

| Cluster | Count | Representative entries |
|---|---|---|
| Governance / audit / trust / compliance | 6 | Mandate, SENTRY AI, Decision Assurance Layer, Trace, Catalyst Integrity Desk, vane-guard |
| Offline / local / air-gapped | 5 | Astartis, Netwroxia, MeshNet-AI |

### Known siblings to watch

- **Shadow Ops** (July) — *"AI preflight platform that finds hidden work, measures AI Tax, and designs safer workflows."* Closest existing entry to any "find and eliminate waste work" concept. Not present in the August field, but the framing is no longer novel.
- **Beef** (July) — *"Finds pairs of open PRs that pass every check alone but break each other when merged."* Occupies pairwise-interference detection.
- **Mandate** (July) — *"A policy-to-permission control plane for AI agents."* Occupies agent permissioning (not competence boundaries).
- **MetaForge** (August) — *"Turns rough AI-worker ideas into scoped, testable, exportable system prompts."* Adjacent to agent-quality tooling, but authoring-time rather than runtime.
- **RESONANCE** (August) — *"Turns organizational history into intelligence to recognize patterns before they repeat."* Occupies institutional-memory framing.

---

## 4. What separates the sharp entries

The standouts are **narrow and falsifiable**, not broad platforms:

> **Beef** — "Finds pairs of open pull requests that pass every check alone but break each other when merged."

One sentence. Obviously a real problem. Provably works or doesn't.

> **Project Naur** — "An MCP-driven ontological linter using Bob to enforce a shared mental model before teams code."

Meanwhile 60+ entries reduce to *"AI-powered platform for [broad category]."* Those are indistinguishable inside a three-minute video, and they lose Innovation and Real-World Impact simultaneously.

**Pattern: one weird specific problem, provably solved, beats one big vague problem, plausibly addressed.**

---

## 5. The universal gap — nobody proves anything

Across all 92 entries, essentially none present a benchmark, a measured before/after, a real user, or an evaluation harness. Every entry *claims* outcomes. None *demonstrate* them.

**Implication:** the cheapest available edge is measurement. A golden test set, a stated baseline, and one honest number on screen. In a field of unverified claims, a single verified number is disproportionately persuasive — and it is the only direct evidence a judge can use to score Real-World Impact.

---

## 6. Strategic conclusions

1. **Submit to August Wildcard.** Smallest field, same prize pool, one-shot opportunity (we have not used our wildcard).
2. **Use Granite on watsonx** as the reasoning layer, and say so explicitly. ~6% of the field does this.
3. **Pick a narrow, falsifiable problem.** Avoid the four death zones entirely.
4. **Measure something and put the number in the video.** This is the field's blind spot.
5. **Treat `docs/bob-log.md` as a scored deliverable.** "How IBM Bob was used" is a required README section; most teams will write three sentences for it.
6. **Budget a full day for the video.** Judges score the video, not the repository.

---

## Method note

The projects listing requires no authentication, but its paginated listing is unstable — an unfiltered sweep returned only 372 of a claimed 802 records with duplicates across pages. Counts in this document come from **per-tag filtered queries** run to exhaustion and deduplicated by `_id`, which return consistent, complete results. The platform's `total: 802` field is unfiltered and should be ignored when reading per-tag counts.

Reproduce by POSTing the `GetOthersProjectList` operation to `/graphql/graph/graphql` with `filters.tags = [<tagId>]`. Tag IDs:

| Tag | ID |
|---|---|
| July Creative Industries Challenge | `6a1f467dc765ca54b71c49db` |
| Wildcard Challenge (July) | `6a44179ecce72a17f06c9ace` |
| August Space Exploration Challenge | `6a70b67833a12697f185beb8` |
| Wildcard Challenge (August) | `6a70b67833a12697f185beb9` |
