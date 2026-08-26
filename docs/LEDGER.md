# LEDGER

> It counts the work AI created that nobody is measuring.

---

## The problem

AI made everyone faster at producing things. It also created an enormous amount of new work: checking, correcting, rejecting, and rewriting what the AI produced.

That second job is real labor. It takes hours. It requires the most experienced people you have. **And it appears in no metric anywhere.**

So the numbers say something absurd. Developers estimate roughly **a third of their day** now goes to AI-related work that is invisible to productivity dashboards ([Larridin](https://larridin.com/developer-productivity-hub/developer-productivity-benchmarks-2026)). **81% of engineering leaders** say code review time has gone up since deploying AI ([Harness](https://www.harness.io/blog/we-re-measuring-the-gains-and-missing-the-costs)). Meanwhile the dashboard shows more commits and more pull requests, so it reports that everything got better.

### The inversion

Here's the part that should be alarming:

> **Your best engineers now look like your least productive ones — precisely because they're the ones catching problems everyone else misses.**

The person who rejected a bad AI-generated migration on Tuesday shipped nothing on Tuesday. The person who merged it shipped a feature. One of them protected the company and one of them created an incident, and the dashboard ranks them in exactly the wrong order.

This is not a measurement inconvenience. It's an incentive structure that actively punishes the behavior you need most, at the exact moment you need it most.

### What breaks

| Failure | What happens |
|---|---|
| **Promotion and review** | Careful people get worse performance reviews. The behavior gets trained out of the org. |
| **Staffing** | You can't argue for headcount to do work that officially doesn't exist. |
| **Burnout, unseen** | The verification load concentrated on seniors, whose hours didn't increase ([Faros AI](https://www.faros.ai/blog/ai-code-quality-senior-engineer-review-burden)). Nobody can see it building. |
| **False ROI** | Leadership sees output up and concludes the AI rollout worked. The costs are real but unrecorded. |
| **Wrong decisions** | You optimize the thing you measure. You're measuring the wrong thing. |

### The distinction that makes this work

The obvious bad version: **another engineering productivity dashboard.** That market is saturated and universally disliked. DORA metrics, PR counts, velocity — engineers hate these because they measure output and get used against them.

LEDGER measures the opposite thing. Not what you produced — **what you prevented.**

Verification work is invisible because its product is an *absence*. The bug that never shipped. The bad merge that didn't happen. The migration that got stopped. Nothing to point at, so nothing gets counted.

**LEDGER counts the negative space.**

---

## What it does

### 1. The prevented-events log

It watches the review pipeline and identifies interventions that changed an outcome — a change request that caught a real defect, a rejected AI-generated PR, a comment that led to a substantive rewrite.

Not "you left 40 comments." Comment counts are gameable and meaningless. It's:

> **You prevented 14 things this month.**
> Three would have reached production. One touched billing.

Granite does the judgment — separating a substantive catch from a nitpick about naming, and writing the one-line summary of what each intervention actually prevented.

### 2. The inverted leaderboard

The demo moment, and the whole argument in one screen.

Two rankings, side by side. **Standard productivity metrics** on the left — PRs merged, commits, lines. **Prevented events** on the right.

They're roughly inverted. The person at the bottom of the left is at the top of the right.

Nobody needs this explained. That single image is the pitch.

### 3. The real cost of the AI rollout

Aggregate view: hours spent verifying AI output, rejection rate by source, and the trend line.

> This quarter: 340 engineer-hours spent verifying AI-generated work.
> 22% of AI-generated PRs required substantive rework before merge.
> Review time per PR is up 40% since March.

This is the number nobody has and every engineering leader needs, because right now the AI rollout looks free. It isn't — the cost just landed somewhere nobody's counting.

### Why the split matters

Deterministic code identifies candidate interventions from git and review history — where a change request preceded a substantive diff, where a PR was closed unmerged, where review latency spiked.

Granite makes the call that a heuristic can't: was this a real catch or a style nit? What would have happened if it had merged? A heuristic sees a change request. A model reads the thread and sees that someone noticed the retry would hammer a rate-limited endpoint.

---

## The open question

**What counts as a prevented event, and how do you avoid rewarding theater?**

The failure mode is obvious: the moment people know prevented-events are counted, some will start leaving performative change requests. Any metric becomes a target.

Partial answers, none complete:
- Weight by what followed. A change request that produced a 200-line rewrite is worth more than one that produced a typo fix.
- Weight by blast radius. Catching something in the auth path is not the same as catching something in a test fixture.
- Report it as a team-level signal for staffing and burnout, not an individual performance metric. The moment it goes in a performance review it gets gamed.

That last one might be the honest answer: **LEDGER is a diagnostic, not a scorecard.** Which is a constraint worth stating out loud rather than pretending we solved it.

---

## Why it holds up

**The numbers are unusually good.** A third of the working day, invisible ([Larridin](https://larridin.com/developer-productivity-hub/developer-productivity-benchmarks-2026)). 81% of engineering leaders reporting review time up ([Harness](https://www.harness.io/blog/we-re-measuring-the-gains-and-missing-the-costs)). Feature-branch throughput **+59% YoY** while median-team main-branch throughput **fell**, and task time-in-progress **+225%** ([Aviator](https://www.aviator.co/blog/the-ai-code-verification-bottleneck-why-faster-code-generation-means-slower-reviews/)). **38%** of developers say AI code takes more effort to review than human code ([DevOpsDigest](https://www.devopsdigest.com/the-invisible-cost-of-ai-generated-code-reviews)).

**The trade press has already named the problem but nobody's built the tool.** [LeadDev](https://leaddev.com/reporting/measuring-engineering-productivity-is-harder-than-ever) — "measuring engineering productivity is harder than ever." [Harness](https://www.harness.io/blog/we-re-measuring-the-gains-and-missing-the-costs) — "we're measuring the gains and missing the costs." Everyone agrees traditional metrics broke. The proposed fix is always "rethink what productivity means," which is a sentence, not a product.

**It's a business problem, not just an engineering one.** MIT's study of 300 AI initiatives found **95% delivered no measurable P&L impact** ([Healthcare IT News](https://www.healthcareitnews.com/news/mit-95-enterprise-ai-pilots-fail-deliver-measurable-roi)). One reason: the costs were never counted, so nobody could compute the actual return.

**The field is empty.** Across all 92 wildcard projects in this challenge, exactly one is adjacent — *Shadow Ops* (July), which finds hidden work and measures wasted effort. Nothing measures verification labor. Nothing in the August field is close.

**It runs on real data.** Any repository with review history. Ours, or any public repo.

---

## Framing

Don't open with metrics — dashboards are a hostile opening and engineers have been burned by them.

Open with the inversion:

> **Your most careful engineer looks like your least productive one. AI did that, and nobody's measuring it.**

The general version, worth saying: this isn't a coding problem. Everywhere AI produces work, somebody now checks it, and that checking is unpaid, unmeasured, and concentrated on your most experienced people. Code is just where it's measurable, because review leaves a record.

---

## Scope

One repository. One review history. Two leaderboards. One cost number.
