# SIGNAL

> Everyone's work looks good now. This tells you who's actually good.

---

## The problem

Hiring runs on artifacts: a resume, a take-home, a portfolio, a whiteboard session. Every one of those was a proxy for ability, and every one of those proxies just broke.

An analysis of **19,368 interviews** between July 2025 and January 2026 found **38.5% of candidates flagged for AI-assisted cheating — 48% in technical roles** ([Fabric](https://fabrichq.ai/blogs/state-of-ai-interview-cheating-in-2026-insights-from-19-368-interviews)). The rate tripled in three months, from 9% in July 2025 to 45% by September.

The number that actually matters:

> **61% of candidates who cheated still scored above the passing threshold and would have advanced with no detection at all.**

The tooling is past the point of arms-race parity — GPU-level overlays that render answers beneath the layer video conferencing captures, real-time audio coaching through earpieces, deepfake video ([Truffle](https://www.hiretruffle.com/blog/ai-interview-cheating)). Take-homes are *worse*, not better: unlimited time and total privacy ([Fabric](https://fabrichq.ai/blogs/interview-cheating-in-2026-the-rise-of-ai-tools-like-cluely-and-interview-coder)).

### It isn't really about cheating

Frame it as cheating and it sounds like a policing problem. It isn't.

**A strong take-home and a polished resume are no longer evidence of anything**, whether or not the candidate did something wrong. A perfectly honest candidate who used AI the way their future job will require produces the same artifact as someone who understood nothing. The signal didn't get stolen — it evaporated.

Meanwhile the pipeline it feeds is already collapsing at the entry level: juniors dropped from roughly a third of new hires to under 10% ([Managed Code](https://www.managed-code.com/blog-post/broken-junior-pipeline)). Companies can't tell who's good, so they hire nobody unproven.

### What breaks

| Failure | What happens |
|---|---|
| **Assessment validity** | The artifact no longer correlates with ability. |
| **The security theater response** | Proctoring, lockdowns, back-to-in-person. Costly, hostile, and losing. |
| **Good candidates punished** | Someone who uses AI well — the actual job requirement — looks identical to a fraud. |
| **Juniors frozen out** | Unable to verify ability, companies stop taking the risk entirely. |
| **Bad hires** | 61% of cheaters clear the bar. Those become someone's teammates. |

### The distinction that makes this work

The obvious bad version: **AI cheating detection.** It's a crowded market, it's an arms race the detectors are losing, and it's the wrong question.

The right question is the same one behind [BLINDSPOT](BLINDSPOT.md): **not who produced it — whether they understand it.**

You cannot reliably detect whether AI wrote a submission. You *can* find out, cheaply and reliably, whether the person can explain it, defend it, and change it.

So: **stop banning the AI. Hand them the AI. Then interrogate the result.**

That flips the whole problem. Detection is adversarial and losing. Comprehension is cooperative and robust — because the only way to pass is to actually understand, which is the thing you were trying to measure in the first place.

---

## What it does

### 1. Open-tool assessment

The candidate gets a task and full AI access. Encouraged, not tolerated. They work how they'd actually work.

The submission is not the assessment. It's the **material** for it.

### 2. The interrogation

Granite reads the submission and generates questions that can only be answered by someone who understood what they submitted:

- **Justify a specific choice.** *"Line 34 retries three times. Why three?"*
- **Predict a consequence.** *"What happens here if the input array is empty?"*
- **Change it under a new constraint.** *"This now needs to handle 10x volume. What breaks first?"*
- **Defend against a wrong critique.** *"A reviewer says this cache is unnecessary. Are they right?"*

That last one is the strongest question type, because AI is agreeable. Presented with a confident false critique, someone who doesn't understand the code folds. Someone who does pushes back and explains why the reviewer is wrong.

Questions are generated from **their specific submission**, so they can't be prepared for, and the modification tasks are live — you can watch whether they know where to start.

### 3. A profile, not a score

The output isn't pass/fail or a cheating probability. It's a picture of what this person actually understands:

> **Deep:** data modeling, error handling — justified choices unprompted, correctly predicted three edge cases
> **Shallow:** concurrency — could not explain why their own lock exists
> **Absent:** operational cost — no awareness of what this does under load
>
> Used AI heavily and effectively. Understood what it produced except in the concurrency section.

That last line is the honest verdict a hiring manager actually needs, and no current process produces it.

### Why the split matters

Deterministic code parses the submission into claims, decisions, and modifiable regions, and checks whether live modifications actually work.

Granite does the part nothing else can: generating questions targeted at *this* submission, and — harder — judging whether an answer demonstrates real understanding or fluent restatement. Those look similar on the surface and differ completely underneath. Distinguishing them is exactly what a good interviewer does and exactly what a keyword check can't.

---

## The open questions

**Can a model reliably tell understanding from fluent bullshit?** This is the crux, and it's genuinely uncertain. A candidate who used AI can also use AI to sound plausible about their answer. The mitigations — live modification tasks with verifiable outcomes, defend-against-a-wrong-critique questions, and requiring prediction before running code — all shift toward things where you're either right or wrong. But we haven't proven the judgment layer works, and we'd have to measure it rather than assume it.

**Is it fair?** Any assessment that leans on verbal explanation risks penalizing non-native speakers, people who are anxious under questioning, or people who think in code rather than words. Real risk. Partial answer: weight the modification tasks (verifiable, non-verbal) above the explanation tasks. Not fully solved.

**Does it scale?** This is heavier per candidate than a scored take-home. Probably fine as a replacement for a phone screen, not for top-of-funnel.

---

## Why it holds up

**The evidence is unusually hard.** 19,368 interviews analyzed; **38.5%** flagged, **48%** in technical roles; rate tripled in three months ([Fabric](https://fabrichq.ai/blogs/state-of-ai-interview-cheating-in-2026-insights-from-19-368-interviews)). **61% of cheaters cleared the bar undetected.** [Forbes covered the resulting hiring crisis on 17 August 2026](https://www.forbes.com/sites/karadennison/2026/08/17/the-rise-of-ai-cheating-culture-and-the-hiring-crisis-it-left-behind/) — nine days ago.

**The industry's current response is visibly failing.** Two paths: return to in-person, or permit AI and redesign the assessment. Everyone agrees redesign is right; almost nobody has specified what the redesign *is*. That's the gap.

**Take-homes being worse than live interviews is counterintuitive and quotable** — unlimited time, total privacy.

**Every judge in the room has this problem.** They hire. They have sat across from a candidate whose take-home didn't match the conversation. This needs zero setup.

**The field is empty.** Of 92 wildcard projects, the nearest is *Whiteboard AI* (August) — a coach that gives candidates feedback on process and communication. That's the candidate's side. Nothing addresses assessment validity.

**It runs on real data.** We can test it on ourselves — submit work, get interrogated, see whether it correctly identifies what we do and don't understand. Honest, available, and slightly uncomfortable, which is what makes it convincing.

---

## Framing

Don't open with cheating — it makes this sound like proctoring software, which is the crowded, unlikeable version.

Open with the evaporation:

> **Everyone's take-home is excellent now. 61% of the people who cheated passed anyway. The test stopped measuring anything.**

Then the flip: we're not trying to stop people using AI. We hand them the AI. Then we ask them to explain what they submitted, and that question has never been easier to fail.

The general version: this isn't only hiring. Every place we assessed people by looking at what they produced — school, certification, performance review — has the same hole. Hiring is where the money makes it urgent first.

**Note the family resemblance:** SIGNAL and [BLINDSPOT](BLINDSPOT.md) share one thesis — *authorship stopped being evidence of comprehension, so measure comprehension directly*. BLINDSPOT applies it to a codebase, SIGNAL to a person. If we build both, that's a coherent position rather than two unrelated tools. If we build one, the other is the natural follow-up.

---

## Scope

One assessment. One candidate. One interrogation. One comprehension profile.
