# BLINDSPOT

> It tells you which parts of your codebase nobody actually understands.

---

## The problem

For fifty years, code in a repository meant **someone understood it**. A person sat down, made decisions, and could explain them. `git blame` told you who to ask.

That broke.

Code now exists that nobody ever comprehended. Someone prompted, a model generated, tests passed, it merged. `git blame` says Sarah — but Sarah never read lines 200–400. Ask her why the retry backs off at three attempts and she doesn't know. Nobody does. **That understanding never existed anywhere.**

`git blame` used to be a comprehension record. Now it records who ran the command.

### What breaks

| Failure | What happens |
|---|---|
| **Debugging** | Production bug at 2am. Normally you find the author and ask. Now the author can't help. Archaeology on code with no archaeologist. |
| **Changing it** | "Why is this here?" Nobody knows. So you leave it — accumulating code you're afraid to touch — or delete it and find out in prod. |
| **Onboarding** | New hire asks how something works. Nobody can explain it. |
| **Invisible risk** | You don't know *which* parts are load-bearing and unexamined. No map. You find out when it breaks. |
| **Compounding** | The AI generates new code on top of code nobody understood, inheriting assumptions nobody checked. Layer on layer. |

### The distinction that makes this work

There's an obvious version of this idea that's bad: **detect which code was AI-written.**

That's a trap. Detectors are unreliable, the space is crowded, and it asks the wrong question. AI-written code that a senior engineer read carefully is fine. Human-written code pasted from Stack Overflow at 2am is not.

The variable isn't **who typed it**. It's **whether anyone understood it**.

Nobody appears to be asking that question.

---

## What it does

Point it at a repository. It produces three things.

### 1. A comprehension map

Every region of the codebase scored on one axis: **how much evidence is there that a human understood this?**

Rendered as a treemap of the repo — files sized by weight, shaded by comprehension. Well-understood code is bright. Code nobody read is dark. **You see the fog.**

The first time you look at your own project, the shape of it is the product. There's no explanation needed.

### 2. Risk = fog × blast radius

This is the part that makes it useful rather than just alarming.

**Fog alone isn't risk.** A dark corner nobody calls is harmless — it can stay un-understood forever and never hurt you. A dark region that everything routes through is a time bomb.

So the second axis is dependency weight: how much of the system leans on this code. Multiply them, and you get a ranked list of what actually matters:

> **Top risks**
> 1. `auth/session.py:refresh()` — high fog, 34 call sites
> 2. `billing/proration.ts` — high fog, touches money
> 3. `api/retry.go` — high fog, wraps every outbound call

Everything else can stay foggy. These five can't.

### 3. The evidence, and what to do about it

Click a dark region and it shows you why it's dark — not a score, the actual receipts:

> Merged in 4 minutes · 847 lines · zero review comments · author never returned to this file · no accompanying tests · one human has ever touched it

Then Granite explains what's actually unexplained:

> *This implements a custom retry with exponential backoff. The parameters — 3 attempts, 2s base — appear nowhere else in the codebase and no commit message or comment explains the choice. Thirty-four call sites depend on this behavior. If these values are load-bearing, nobody currently knows why.*

And it ends on an action, not a warning: **these five regions deserve an hour of someone reading them.** That's the decision it supports — where to spend the limited human understanding you have.

### Why the split matters

Ordinary code computes the signals — review latency, diff size, churn, call graph. Those have to be exact, and they're not a language model's job.

Granite does the part only a model can: look at a function and tell a well-understood standard pattern from bespoke logic nobody has ever explained. A heuristic sees 847 unreviewed lines. A model sees that 800 of them are boilerplate and 47 are a hand-rolled cache invalidation nobody has justified.

---

## The open question

**We haven't solved this, and it's the crux.**

How do you measure whether a human understood a piece of code? You can't ask them. You infer it from evidence the repository already contains.

Candidates, ranked by how much I'd trust them:

| Signal | Reasoning |
|---|---|
| **Review latency vs. diff size** | 900 lines approved in 4 minutes with "LGTM" is unread. Probably the strongest single signal. |
| **Review comment substance** | Questions and change-requests are evidence of engagement. Zero comments on a large diff is evidence of absence. |
| **Return visits** | Did the author ever touch the file again? Understanding leaves a trail of later edits. |
| **Commit granularity** | 800 lines in one commit at 11pm reads differently than eight focused commits over two days. |
| **Failed-fix churn** | Repeated small edits to the same block — someone trying things without knowing why it's broken. The opposite of understanding. |
| **Bus factor** | How many distinct humans have ever meaningfully touched it. |
| **Commit message specificity** | "fix bug" vs. an actual explanation of the mechanism. |
| **Test authorship** | Tests written alongside are weak evidence someone reasoned about behavior. |

These are candidates, not conclusions. **The instinct question is still open: handed an unfamiliar codebase, what would you look at to guess which parts nobody understood?** Whatever you'd naturally check is probably better than this list.

The architecture follows from that answer.

---

## Why it holds up

**It's a real problem, and it's peaking right now.** The most-argued thread of the month is [engineers hitting exactly this](https://www.reddit.com/r/ExperiencedDevs/comments/1vvj60z/new_codebase_ai_code_smells/) — 182 upvotes, **195 comments**, a ratio that means arguing rather than agreeing. They're inheriting codebases and trying to work out which parts a human actually understood, with no vocabulary for it yet.

**The effects are measured.** CircleCI's 2026 data: feature-branch throughput **up 59% year over year** while median-team main-branch throughput **fell** ([Aviator](https://www.aviator.co/blog/the-ai-code-verification-bottleneck-why-faster-code-generation-means-slower-reviews/)). More code written, less merged — the constraint moved from producing to verifying. Task time-in-progress **up 225%**. **38%** of developers say AI code is harder to review than human code ([DevOpsDigest](https://www.devopsdigest.com/the-invisible-cost-of-ai-generated-code-reviews)). Over **30%** of senior developers now ship mostly AI-generated code. There's an arXiv paper this month titled ["Human Oversight and Overload"](https://arxiv.org/pdf/2606.05770).

**The burden landed on exactly the people who can't absorb it.** Juniors can't review AI code — they lack context to catch what matters — so it falls to seniors whose available hours didn't increase ([Faros AI](https://www.faros.ai/blog/ai-code-quality-senior-engineer-review-burden)).

**And there's a social mirror.** The most-hated AI behavior at work is passing along output you didn't check — **62%**, the top score of sixteen behaviors tested ([Business.com](https://www.business.com/articles/annoying-ai-habits-study/)). A codebase full of un-comprehended code is what that behavior leaves behind.

**Nothing else is in this space.** Across all 92 wildcard projects in this challenge, the nearest neighbours are *Beef* (finds PRs that pass alone but break together) and *MergeMasterAI* (orchestrates PR workflows). Both are about the mechanics of merging. Neither is about comprehension.

**It runs on real data.** Any public GitHub repo, or ours. Not an invented company with data reverse-engineered to make the demo work.

---

## Framing

The trap is opening with "it analyzes codebases" — that sounds like a developer tool, and the challenge is about the future of work.

Open with the work problem instead:

> **AI writes the work now. Humans have to verify it. Nobody knows where to look.**

Codebases are just where it's *measurable* — a repository is the only place comprehension leaves a paper trail. The problem is general: the same thing is happening to financial models, legal review, reports, analysis. Anywhere someone passes along output they didn't check.

The decision BLINDSPOT supports is the one that actually matters now: **where do you spend the limited human understanding you have?**

---

## Scope

One language. One repository. One map. One number.
