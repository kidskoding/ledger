# Ideas

Broad level overview of the 5 Ideas. You can view the thorough version in the [`docs/`](docs/) directory.

All five ideas come out of the same research: a 30-day sweep of what people are actually saying about AI at work, plus targeted digging per problem. Raw data and every citation live in [`docs/research/`](docs/research/)

They share one thesis. **AI made producing work cheap, and in doing so it broke everything we built on top of production** — comprehension, measurement, apprenticeship, ROI, assessment. Each idea takes one of those.

| | Idea | One line | Doc | Read online |
|---|---|---|---|---|
| 1 | **BLINDSPOT** | Which parts of your codebase nobody actually understands | [`BLINDSPOT.md`](docs/BLINDSPOT.md) | [link](https://claude.ai/code/artifact/4c16a297-ab5f-4006-b0d6-43e2cf715eef) |
| 2 | **LEDGER** | The work AI created that nobody is measuring | [`LEDGER.md`](docs/LEDGER.md) | [link](https://claude.ai/code/artifact/04e20c5f-9943-44ae-a907-be26563902c8) |
| 3 | **RUNGS** | The ladder lost its bottom rungs — this rebuilds them | [`RUNGS.md`](docs/RUNGS.md) | [link](https://claude.ai/code/artifact/533d26a3-9428-47cb-bdc1-6ff3660f75b3) |
| 4 | **DELTA** | Whether your AI rollout actually did anything | [`DELTA.md`](docs/DELTA.md) | [link](https://claude.ai/code/artifact/3375184f-8168-406b-8001-4bcbba43b745) |
| 5 | **SIGNAL** | Who's actually good, when everyone's work looks good | [`SIGNAL.md`](docs/SIGNAL.md) | [link](https://claude.ai/code/artifact/4b8d88cd-b304-4f37-960b-edaf8e263669) |

*Read-online links are private by default — share from each page's share menu.*

---

## 1. BLINDSPOT

[`docs/BLINDSPOT.md`](docs/BLINDSPOT.md) · [read online](https://claude.ai/code/artifact/4c16a297-ab5f-4006-b0d6-43e2cf715eef)

> It tells you which parts of your codebase nobody actually understands.

`git blame` used to be a comprehension record. Now it records who ran the command. Code exists that nobody ever read — prompted, generated, tests passed, merged. When it breaks, there's nobody to ask.

**The clever bit:** risk = fog × blast radius. A dark corner nobody calls is harmless. A dark region everything routes through is a time bomb.

**Strongest evidence:** the most-argued thread of the month is engineers hitting exactly this — 182 upvotes, **195 comments**.

**Weakest point:** we haven't settled how to measure comprehension from repository evidence.

## 2. LEDGER

[`docs/LEDGER.md`](docs/LEDGER.md) · [read online](https://claude.ai/code/artifact/04e20c5f-9943-44ae-a907-be26563902c8)

> It counts the work AI created that nobody is measuring.

Verification is real labor, it lands on your most experienced people, and it appears in no metric. So your most careful engineer looks like your least productive one.

**The clever bit:** it measures what *didn't* happen. Verification work is invisible because its product is an absence — the bug that never shipped. LEDGER counts the negative space, then shows two leaderboards side by side, roughly inverted.

**Strongest evidence:** ~1/3 of the developer day is now AI-related work invisible to metrics. **81%** of engineering leaders say review time went up.

**Weakest point:** the moment prevented-events are counted, some people will perform them. Probably has to be a team diagnostic, not an individual scorecard.

## 3. RUNGS

[`docs/RUNGS.md`](docs/RUNGS.md) · [read online](https://claude.ai/code/artifact/533d26a3-9428-47cb-bdc1-6ff3660f75b3)

> The ladder lost its bottom rungs. This rebuilds them.

Juniors learned by doing the easy work. AI does the easy work now. Juniors fell from a third of new hires to **under 10%**, and it takes 5–9 years to grow a senior — so the juniors not hired in 2025 are the seniors missing in 2031.

**The clever bit:** it intercepts real AI-generated changes with teaching value and routes them to a junior *before* the senior review. Then it compares the two reviews and names the **category** of thing the junior keeps missing — not a score, a pattern.

**Strongest evidence:** Microsoft leadership publicly warning about it. Everyone converged on the same fix — juniors should audit AI output — and nobody built the mechanism.

**Weakest point:** where does ground truth come from, and does routing work to juniors first slow the team down enough that nobody adopts it?

## 4. DELTA

[`docs/DELTA.md`](docs/DELTA.md) · [read online](https://claude.ai/code/artifact/3375184f-8168-406b-8001-4bcbba43b745)

> It tells you whether your AI rollout actually did anything.

Companies measure adoption — seats, prompts, weekly actives — and call it success. Meanwhile **54%** of people bypassed the mandated tools and did the work by hand.

**The clever bit:** it ignores usage entirely and is built to be able to say **no**. Given that 95% of pilots show no P&L impact, the honest answer is usually "this didn't help." A measurement tool that can't return a negative result isn't one.

**Strongest evidence:** MIT, 300 initiatives — **95% delivered no measurable P&L impact**. The named cause is inadequate *measurement*, not inadequate technology.

**Weakest point:** attribution. If cycle time improved, was it the AI or the reorg? We haven't decided how conservative to be about refusing to answer.

**Also:** most IBM-shaped idea on the list. IBM Consulting's business is telling enterprises whether their technology investments worked.

## 5. SIGNAL

[`docs/SIGNAL.md`](docs/SIGNAL.md) · [read online](https://claude.ai/code/artifact/4b8d88cd-b304-4f37-960b-edaf8e263669)

> Everyone's work looks good now. This tells you who's actually good.

**38.5%** of candidates flagged for AI cheating across 19,368 interviews — 48% in technical roles. **61% of them passed anyway.** Take-homes are worse than live interviews, not better.

**The clever bit:** stop detecting cheating — that's an arms race we're losing. Hand them the AI, then interrogate the submission. The strongest question type is defending against a confident *wrong* critique: someone who doesn't understand the code folds; someone who does pushes back.

**Strongest evidence:** the 61%-of-cheaters-passed number, and Forbes covering the resulting hiring crisis nine days ago.

**Weakest point:** can a model tell real understanding from fluent bullshit? Genuinely uncertain, and it's the crux.

**Note:** SIGNAL and BLINDSPOT share one thesis — *authorship stopped being evidence of comprehension, so measure comprehension directly.* One applies it to a codebase, the other to a person.

---

## Decision: LEDGER

**We're building LEDGER.** Reached by elimination from the rubric scores, in three cuts.

### Cut 1 — buildability removes DELTA and RUNGS

Neither can be honestly demoed in five days. DELTA needs before-and-after data from a team that actually adopted AI; RUNGS needs a junior, a senior, and a live review flow. Faking either produces exactly the reverse-engineered demo we spent this whole process avoiding — the kind a judge has seen forty of and correctly distrusts.

This one hurts. **DELTA has the best Real-World Impact score of all five** (5/5 — MIT, 300 initiatives, 95% no P&L impact, enterprise budgets) and it's the most IBM-shaped problem we found. It's the right idea for a month we don't have. Worth revisiting after the deadline.

### Cut 2 — Challenge Fit removes SIGNAL

Three remain: LEDGER 21.5, BLINDSPOT 21, SIGNAL 20.5.

SIGNAL goes because it loses on the criterion that is cheapest for a judge to apply and hardest to argue against. **Assessment sits upstream of work rather than inside it.** The brief emphasizes planning, coordinating, deciding, and executing; a hiring demo doesn't look like any of those, and the recovery ("it evaluates any work product") is a stretch from what's on screen.

Its buildability was the best of the five — we could run it on ourselves — but that is our convenience, not a scored criterion.

### Cut 3 — LEDGER over BLINDSPOT

**1. Challenge Fit 5 vs 3.5 is the largest single gap in the table** — larger than BLINDSPOT's one-point Innovation edge. LEDGER requires zero interpretive distance: measurement, teams, outcomes, decision support for managers. BLINDSPOT has to actively fight the "developer tool" reading in the first fifteen seconds of the video, every single time it's shown.

**2. The inverted leaderboard beats the fog map.** A fog map is a nice picture. Two rankings side by side, roughly inverted, is *an argument* — and it lands with no explanation at all. The three-minute video is what judges actually score, and this is the strongest single image any of the five produces.

**3. LEDGER's weakness is fixable; BLINDSPOT's is structural.** LEDGER loses on Technical Execution (3.5) because it's a data pipeline plus a classifier — that's a scope decision, and we can build our way out of it. BLINDSPOT loses on Real-World Impact (4) because its output is knowledge rather than a fix; it tells you where the fog is and clearing it is still human labor. No amount of good building changes that.

**4. Highest total.** 21.5, and it has no score below 3.5.

### What we're accepting

- **Lower Innovation than BLINDSPOT** (4 vs 5). Engineering productivity metrics is a dense, well-trodden category — DORA, SPACE, DX — and a judge who knows it will pattern-match before hearing the twist. The counter is to lead with the inversion, never with the word "metrics."
- **Lowest Technical Execution of the shortlist** (3.5). Mitigated by building the prevented-event classification properly rather than treating it as a keyword pass.
- **A positioning constraint.** LEDGER has to be a team diagnostic, not an individual scorecard, or people will perform prevented-events for the metric. Stated openly rather than pretended away.

### Reversibility

This decision is cheap to undo for another day or two. **LEDGER and BLINDSPOT share a data pipeline** — both mine git history and review records. BLINDSPOT asks *where is the fog*; LEDGER asks *who is clearing it, and at what cost*. Building one gets most of the way to the other.

The honest caveat: the LEDGER–BLINDSPOT gap is half a point on scores we assigned ourselves, which is noise rather than signal. If conviction pulls toward BLINDSPOT once the Challenge Fit argument has been read and weighed, take BLINDSPOT — a project you can pitch with real conviction beats half a rubric point on camera.

### Open questions carried into the build

1. What counts as a prevented event, and how do we avoid rewarding theater? (Current answer: weight by what followed and by blast radius; ship it as a team-level diagnostic.)
2. Can Granite reliably separate a substantive catch from a naming nitpick? Unvalidated. Needs measuring, not assuming.

---

## Scored against the official rubric

The five judged criteria, verbatim from the challenge page. No weights are published, so treated as equal. Rationale for every cell below the table.

| | Technical Execution | Innovation | Challenge Fit | Feasibility | Real-World Impact | Total |
|---|---|---|---|---|---|---|
| **BLINDSPOT** | 4 | **5** | 3.5 | 4.5 | 4 | **21** |
| **LEDGER** | 3.5 | 4 | **5** | 4.5 | 4.5 | **21.5** |
| **RUNGS** | 4 | 4.5 | 4.5 | 3.5 | 4.5 | **21** |
| **DELTA** | 3.5 | 3.5 | **5** | 4 | **5** | **21** |
| **SIGNAL** | 3.5 | 4.5 | 3.5 | 4.5 | 4.5 | **20.5** |

**They're within a point of each other.** That's the real finding — on the rubric these are equivalent, so the rubric does not pick for us. Something else has to. See "The thing I had wrong" below.

---

### BLINDSPOT — 21

**Technical Execution · 4** — Needs real machinery: AST parsing to attach scores to meaningful units, call-graph construction for the blast-radius axis, git history mining, and the review API. Granite does work a heuristic genuinely can't — distinguishing a well-understood standard pattern from bespoke logic nobody justified. *Loses a point because the comprehension score itself is unvalidated.* We have no ground truth for "did a human understand this," so we can't prove the core number means anything. "How do you know your score is right?" is a fair question we currently can't answer.

**Innovation · 5** — Highest of the five. The comprehension-not-authorship flip is the most genuinely unasked question we found. Across 92 wildcard projects the nearest neighbours are *Beef* and *MergeMasterAI*, both about merge mechanics. Nobody is asking whether anyone understood the code.

**Challenge Fit · 3.5** — The theme is future of work; this reads as a developer tool on first glance. Recoverable with framing — *AI writes the work now, humans verify it, nobody knows where to look* — but the recovery is our job, and if the video's first fifteen seconds slip into "it analyzes codebases," we lose the point.

**Feasibility · 4.5** — Deploys as a read-only GitHub App today. No process change, no data an org doesn't already have. *Loses half a point* because scoring thresholds would need per-org tuning; a repo with a strict review culture and one with none can't share a scale.

**Real-World Impact · 4** — Lowest of the four non-BLINDSPOT scores here, and deliberately. The cited evidence is strong (+59% branches with falling merges, +225% task time). But **the output is knowledge, not a fix.** It tells you where the fog is; it doesn't clear it. The action is "go read this," which is still human labor. Compare DELTA, where the output changes a spending decision.

### LEDGER — 21.5

**Technical Execution · 3.5** — Honestly, it's a data pipeline plus a classifier. Git and review-history parsing, then Granite separating substantive catches from naming nitpicks. No AST, no call graph, less infrastructure than BLINDSPOT or RUNGS. The interesting work is in the definition of a prevented event, not in the engineering.

**Innovation · 4** — Measuring negative space is a genuinely fresh framing, and the inverted leaderboard is the best single demo image any of these five has. *Loses a point* because engineering productivity metrics is a dense, well-trodden category — DORA, SPACE, DX — and a judge who knows it will pattern-match before hearing the twist. *Shadow Ops* (July) is adjacent.

**Challenge Fit · 5** — No framing gymnastics required. Measurement, teams, outcomes, decision support for managers. Every clause of the challenge statement applies literally, which is not true of any other idea except DELTA.

**Feasibility · 4.5** — Read-only against review data that already exists. Genuinely drop-in. *Loses half a point* on the gaming risk: it has to be positioned as a team diagnostic rather than an individual scorecard, and that positioning is a real adoption constraint, not a footnote.

**Real-World Impact · 4.5** — 81% of engineering leaders reporting review time up; a third of the developer day invisible. Directly actionable — a manager changes staffing and promotion decisions on this. *Loses half a point* because the impact is conditional on leadership actually acting on an uncomfortable finding.

### RUNGS — 21

**Technical Execution · 4** — The hardest inference on the list: classifying a diff's *pedagogical* value, comparing two reviews of the same change, and naming the **category** of blind spot rather than the individual miss. That last one is real work and it's exactly what Granite is for. *Loses a point* because ground truth is unsolved — our own open question — and without it the grading layer is guesswork.

**Innovation · 4.5** — Intercepting real work and routing it to a junior *before* senior review is not built anywhere. Everyone converged on "juniors should audit AI output" as advice; nobody turned it into a mechanism. *Loses half a point* because "AI for learning and training" is a crowded adjacent space that invites pattern-matching before the twist lands.

**Challenge Fit · 4.5** — Literally about how humans learn to work alongside AI. *Loses half a point* because it's education-flavored, and the brief leans toward execution, coordination, and decisions rather than skill development.

**Feasibility · 3.5** — Lowest of the five, and this is the criterion where it genuinely loses. It **requires process change** — routing work to a junior before the senior sees it — and process change is the hardest kind of adoption to win. It also needs both roles present, and real teams will object to the added latency on their pipeline. Everything else on this list is drop-in; this one asks a team to work differently.

**Real-World Impact · 4.5** — Enormous in absolute terms: under-10% junior hiring, Microsoft leadership warning publicly, a 5-to-9-year lag that makes 2031 already determined. *Loses half a point* because the payoff is years out, and a judge scoring "meaningful value" may weight present-tense impact higher than a correctly-predicted future one.

### DELTA — 21

**Technical Execution · 3.5** — Matched comparison, significance testing, confounder detection. Doing it *honestly* is hard, but it isn't much machinery — the least code-heavy of the five. Granite classifies work types so like is compared with like, and writes the verdict. The engineering risk here is statistical rigour, not build complexity.

**Innovation · 3.5** — Lowest of the five, and I don't want to inflate it. "AI ROI measurement" is an existing vendor category with products in it. Our novelty is a **stance** — ignore usage entirely, and be willing to return a negative result — not a mechanism. A judge may simply hear "dashboard," and the counterargument requires them to already distrust the existing dashboards.

**Challenge Fit · 5** — "Decision intelligence platforms" is a listed solution area in the brief, verbatim. "How can AI improve decision-making?" is one of the three listed prompts. There is no interpretive distance to cover at all.

**Feasibility · 4** — Deployable in principle, but it needs historical instrumentation most organizations don't have: clean before-and-after work records, consistently categorized. *Loses a full point* for that data prerequisite, which is a real barrier and the same thing that makes it hard for us to demo.

**Real-World Impact · 5** — Highest on the list. MIT across 300 initiatives, 95% delivering no measurable P&L impact, against enterprise budgets. It's also the most IBM-shaped problem we found: IBM Consulting's business is telling enterprises whether their technology investments worked. Nothing else here touches money this directly.

### SIGNAL — 20.5

**Technical Execution · 3.5** — Question generation from a specific submission, verification of live modifications, and comprehension judgment. The judgment layer is the interesting part and it is **unvalidated** — we don't know whether a model can reliably separate real understanding from fluent restatement. Less infrastructure than BLINDSPOT, more model-dependence, and the dependence is on the part we're least sure of.

**Innovation · 4.5** — The flip from detection to comprehension is strong and counterintuitive: stop policing AI use, hand them the AI, then interrogate. The defend-against-a-wrong-critique question is the sharpest single mechanism on this list. *Loses half a point* because it shares its core thesis with BLINDSPOT — if both existed, the second one to be seen is less novel.

**Challenge Fit · 3.5** — Tied lowest with BLINDSPOT. Hiring is future-of-work adjacent, but the brief emphasizes planning, coordinating, deciding, and executing work. **Assessment sits upstream of work rather than inside it.** Recoverable by framing it as evaluating any work product — but that's a stretch from a demo that shows a hiring interview.

**Feasibility · 4.5** — Drop-in replacement for a phone screen; no process change beyond the interview itself. *Loses half a point* on the fairness question — non-native speakers, people anxious under questioning, people who think in code rather than words. Unresolved, and in regulated hiring it's an adoption blocker, not a nitpick.

**Real-World Impact · 4.5** — The hardest evidence we have anywhere: 38.5% flagged across 19,368 interviews, 61% of cheaters passing anyway, Forbes covering the fallout nine days ago. *Loses half a point* because it improves a decision at a single gate rather than changing ongoing work.

---

## The filter these had to clear

Derived by rejecting six earlier candidates. All seven required:

1. Problem needs no setup — a judge nods before you finish the sentence
2. One surprising mechanism, not a feature list
3. Showable, not describable
4. A number that could have come out badly
5. One idea, finished — not three half-features
6. **Survives being retold** — a judge who saw it once has to describe it to one who didn't
7. **Runs on real data** — the row that eliminated everything else

Field check across all 92 wildcard projects from both months: adoption-vs-outcome **0 hits**, skill decay **1** (unrelated), invisible work **1** (*Shadow Ops*, adjacent), review burden **3** (all security assurance), training **3** (none touch apprenticeship). **All five spaces are effectively unoccupied.**

---

> **Best to Build: [LEDGER](docs/LEDGER.md).**
>
> AI made everyone faster at producing work, and quietly created a second job: checking it. That job takes real hours, it needs your most experienced people, and it shows up in no metric anywhere. So the engineer who caught a bad migration on Tuesday shipped nothing on Tuesday, and the one who merged it shipped a feature. The dashboard ranks them in exactly the wrong order.
>
> LEDGER counts what got *prevented* instead of what got produced, then puts the two rankings side by side. They come out roughly inverted, and that single screen is the whole argument — nobody needs it explained.
>
> It's also the one idea here that needs no translating to fit the challenge. Measurement, teams, outcomes, decision support for managers: that's the brief, literally. Every other candidate has to spend its first fifteen seconds arguing it isn't a developer tool or an HR tool. This one doesn't.