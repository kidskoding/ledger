# DELTA

> It tells you whether your AI rollout actually did anything.

---

## The problem

Companies bought AI. Then they mandated it. Meta, Amazon, Microsoft and Accenture now bake "AI-driven impact" into performance reviews.

Then they measured **adoption** — seats filled, prompts sent, weekly active users — and declared it a success.

Adoption is not an outcome. It's the easiest thing to count and the least useful thing to know.

The gap is enormous. MIT studied 300 public AI initiatives, interviewed 150 executives and surveyed 350 employees, and found **95% of pilots delivered no measurable P&L impact** ([Healthcare IT News](https://www.healthcareitnews.com/news/mit-95-enterprise-ai-pilots-fail-deliver-measurable-roi)). They named it the **"GenAI Divide"**: over 80% of organizations piloted tools like ChatGPT or Copilot, and the result was individual-level productivity that never became an enterprise outcome.

The stated cause isn't the technology. It's that success was defined in terms like *"improved efficiency"* with no quantifiable proof — **42% of enterprises land in the zero-ROI bucket because of inadequate measurement**, not inadequate tooling.

### And the adoption number is a lie anyway

Under mandate, people comply on paper. In a survey of 3,750 executives and employees, **54% bypassed AI tools in the last 30 days and did the work manually**, and another **33% skipped AI entirely** ([Metaintro](https://www.metaintro.com/blog/bosses-pushed-workers-use-ai-backfired)). [Aftermath](https://aftermath.site/ai-resistance-tips-workforce-llm-workers/) documents workers actively dodging and sabotaging mandates.

So the dashboard shows adoption climbing. The dashboard is measuring compliance theater.

### What breaks

| Failure | What happens |
|---|---|
| **Spending without evidence** | Renewals get approved on usage charts. Nobody knows if the work improved. |
| **Mandates that backfire** | You enforce harder, people comply more visibly and work around it more, and the number looks better while nothing improves. |
| **Costs stay invisible** | Verification and rework land somewhere nobody counts, so ROI is computed on half the ledger. |
| **The wrong things get cut** | Where AI genuinely helps and where it hurts are indistinguishable in the data. |
| **Nobody can say "stop"** | With no counterfactual, there's no evidence a rollout failed. It just continues. |

### The distinction that makes this work

The obvious bad version: **an AI ROI dashboard.** Vendors already sell those. They are built to show adoption climbing and savings accruing, because that's what renews the contract. Everyone knows it and nobody trusts it.

DELTA does the opposite in two ways.

**It ignores usage entirely.** Not seats, not prompts, not weekly actives. Only whether the *work* changed — cycle time, rework rate, defect escape, time-to-resolution — measured against what the same work looked like before.

**It is built to be able to say no.** The honest expected result, given that 95% of pilots show no P&L impact, is often *"this didn't help."* A measurement tool that can't return a negative result isn't a measurement tool. That willingness is the entire credibility of the thing.

---

## What it does

### 1. Outcome metrics, not usage metrics

It picks up the signals that describe whether work actually improved:

| Measured | Not measured |
|---|---|
| Cycle time, request → delivered | Seats provisioned |
| Rework rate — how often work gets redone | Prompts sent |
| Defect escape — problems reaching production | Weekly active users |
| Time-to-resolution on incidents | Lines generated |
| Review burden per unit of work | "Time saved" self-reports |

The right column is what every existing dashboard shows. The left column is what anyone actually cares about.

### 2. A defensible comparison

The hard part of any before/after is that everything else changed too — team size, product phase, seasonality.

DELTA builds the comparison honestly: same team, matched work types, before-period against after-period, with a stated confidence and named confounders. Where a clean comparison isn't available, it says so instead of producing a number.

> Cycle time on bug-fix work: **−18%** (p=0.03, n=340)
> Rework rate on feature work: **+31%** — worse
> Defect escape: **unchanged**, but variance widened
> ⚠️ Team grew by 2 during the after-period. Treat feature-work numbers with caution.

That warning line matters as much as the numbers. It's what separates this from vendor marketing.

### 3. The segmented verdict

The finding that's actually useful is never "AI helped" or "AI didn't." It's **where**.

> **Working:** bug triage, test generation, boilerplate migration
> **Not working:** anything touching the payments module — rework there is up 31%
> **Unclear:** new feature work, too confounded to call

That's an actionable answer: expand here, pull back there, instrument the third. Nobody currently has this, and it's what a leader deciding on a renewal genuinely needs.

Granite does the attribution reasoning and writes the plain-language verdict — including the honest "we can't tell" — while the statistics stay deterministic.

### Why the split matters

The comparison, significance testing, and confounder detection are ordinary code. They have to be: the entire value is that the number is trustworthy, and a model can't guarantee that.

Granite does what statistics can't — reading the work items to classify what *kind* of work each was, so like is compared with like, and turning a table of deltas into an explanation a VP can act on. A t-test can tell you rework went up 31%. A model can look at those specific work items and notice they all touch a module with no test coverage.

---

## The open question

**Attribution is genuinely hard, and we should not pretend otherwise.**

If cycle time improved, was it the AI? Or the new CI pipeline, the reorg, the fact that Q3 work is always easier than Q2? Correlation is cheap here and causation is expensive.

Honest options:
- **Matched comparison** — compare like work to like work, control what we can, report confidence. Weakest form, most available.
- **Natural experiments** — teams that adopted at different times, or work types where AI genuinely can't be used, as a control group. Much stronger when it exists.
- **Refuse to answer** — where confounders dominate, return "insufficient evidence" rather than a number.

The third one is probably the most valuable feature and the least likely to be built by anyone selling this. **We haven't decided how conservative to be.** Too conservative and it returns "unclear" for everything and is useless; too loose and it's the vendor dashboard we're criticizing.

---

## Why it holds up

**The headline stat is one of the strongest available anywhere.** MIT: **95% of enterprise AI pilots deliver no measurable P&L impact**, across 300 initiatives, 150 executive interviews, 350 employee surveys ([Healthcare IT News](https://www.healthcareitnews.com/news/mit-95-enterprise-ai-pilots-fail-deliver-measurable-roi), [Legal.io](https://www.legal.io/blog/5719519/MIT-Report-Finds-95-of-AI-Pilots-Fail-to-Deliver-ROI-Exposing-GenAI-Divide)). Worth noting the study drew [pushback on its framing](https://www.marketingaiinstitute.com/blog/mit-study-ai-pilots) — cite it as the widely-reported figure it is, not as settled science. The measurement gap it describes is corroborated elsewhere regardless.

**The diagnosis points straight at us.** The named cause is inadequate measurement — success defined as "improved efficiency" with no proof — not inadequate technology. **42%** of enterprises hit zero ROI for that reason.

**The adoption metric is provably fake.** 54% manually bypassing mandated tools, 33% not using them at all ([Metaintro](https://www.metaintro.com/blog/bosses-pushed-workers-use-ai-backfired)). [CNBC covered the counterproductivity of AI mandates on 26 August 2026](https://www.cnbc.com/2026/08/26/forcing-workers-to-use-ai-can-be-counterproductive-expert-tips-for-better-approach.html) — this is a live argument, not a settled one.

**Half the cost is missing from every existing ROI calculation.** A third of the developer day goes to invisible AI-related work ([Larridin](https://larridin.com/developer-productivity-hub/developer-productivity-benchmarks-2026)); 81% of engineering leaders report review time up ([Harness](https://www.harness.io/blog/we-re-measuring-the-gains-and-missing-the-costs)).

**The field is completely empty.** Probing all 92 wildcard projects for adoption-versus-outcome measurement returns **zero hits**. Not one.

**It's the most IBM-shaped idea on our list.** IBM Consulting's business is telling enterprises whether their technology investments worked. This is that question, for the technology IBM is currently selling.

---

## Framing

Don't open with ROI — that word makes engineers stop listening and executives assume vendor pitch.

Open with the contradiction:

> **Your AI adoption is up 300%. Also, 54% of your people did the work by hand last month. Both of those are true, and only one is on the dashboard.**

Then the pivot: we don't measure whether people used it. We measure whether the work got better — and we're willing to tell you it didn't.

---

## Scope

One team. One before-period, one after-period. Three outcome metrics. One honest verdict, including "we can't tell."
