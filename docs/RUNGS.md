# RUNGS

> The ladder lost its bottom rungs. This rebuilds them.

---

## The problem

Juniors used to learn by doing the easy work. Boilerplate, simple fixes, small features, the unglamorous plumbing. It looked like grunt work. It was actually the curriculum — you built judgment by making small decisions, being wrong, and getting corrected.

**AI does all of that now.** The easy work is gone, and it took the training ground with it.

So companies stopped hiring juniors. Entry-level tech postings collapsed; juniors fell from roughly a third of new hires at large tech firms to **under 10%** ([Managed Code](https://www.managed-code.com/blog-post/broken-junior-pipeline)). Microsoft's Mark Russinovich and Scott Hanselman have publicly warned that AI is hollowing out the junior pipeline ([InfoQ](https://www.infoq.com/news/2026/04/junior-developer-pipeline-crisis/)).

And the juniors who *do* get hired hit a second problem: AI gives seniors a large productivity boost while imposing what researchers call an **"AI drag"** on early-career developers — because steering, verifying, and integrating AI output requires exactly the judgment they haven't built yet. The tool that helps experts hurts novices.

### The part that makes this urgent

It takes **5 to 9 years** to grow a new graduate into a reliable senior engineer.

> The juniors not hired in 2025 are the mid-levels who won't exist in 2028, and the seniors who won't exist in 2031.

This is a slow-motion, entirely predictable shortage. The bill arrives years after the decision, which is exactly why nobody's acting on it. And it compounds with everything else: verification work already concentrates on seniors because juniors lack the context to catch what matters ([Faros AI](https://www.faros.ai/blog/ai-code-quality-senior-engineer-review-burden)). Fewer seniors, more to verify.

### What breaks

| Failure | What happens |
|---|---|
| **The learning loop** | Juniors ship AI output they don't understand. No correction, no judgment built. |
| **Feedback disappears** | Being wrong in a small way and getting corrected was the mechanism. It's gone. |
| **Senior time** | The only people who can teach are the ones already drowning in review. |
| **No visibility** | Nobody can tell whether a junior is actually progressing or just prompting well. |
| **Demographic time bomb** | Fully predictable, arrives in 2031, nobody's tracking it. |

### The distinction that makes this work

The obvious bad version: **an AI tutor that teaches programming.** Enormously crowded, and it misses the point entirely. Juniors don't need another course. They need the thing courses can't provide — **judgment built from real consequences on real work.**

The insight everyone converges on but nobody has built: the redesigned junior role isn't writing boilerplate, it's **auditing AI output**. Evaluating multiple implementations instead of producing one. Understanding a system before prompting it.

That's the right answer. It's also a job description, not a mechanism. **How does a junior get good at auditing AI output when the only people who can grade them are seniors with no time?**

That gap is RUNGS.

---

## What it does

### 1. It intercepts teachable work

RUNGS watches AI-generated changes flowing through the team's real pipeline and flags the pedagogically valuable ones — a PR with a subtle correctness bug, two plausible implementations with a real tradeoff, a change that looks fine but violates something the codebase decided two years ago.

Those get routed to a junior **first**, before the senior review. Real work, real stakes, with a safety net behind it.

Nothing is simulated. This is the team's actual backlog, filtered for teaching value.

### 2. It grades the audit, not the answer

The junior reviews the change and says what they think is wrong. Then RUNGS compares their assessment against what the senior review actually found.

> You flagged the missing null check. ✓ Senior found it too.
> You missed that this retry has no jitter — under load, 34 callers will synchronize and hammer the endpoint. **This is the class of thing you've missed 4 times now.**

**That last line is the product.** Not a score — a pattern. It knows what you keep failing to see.

Granite does this: reading two reviews of the same diff, finding the delta, and naming the *category* of blind spot rather than the individual miss.

### 3. Learning velocity, not ticket count

The measure that matters isn't how much a junior shipped. It's **how fast they're progressing to harder problems** — and how their blind-spot categories are closing over time.

> Concurrency issues: caught 1/6 in June → 5/7 in August.
> Error handling: still 2/9. Not improving. Recommend pairing.

For a manager, this is the first honest answer to "is this person actually getting better, or just getting better at prompting?" — which right now is genuinely unanswerable.

### Why the split matters

Deterministic code finds candidate teaching moments — diffs where the senior review produced substantive change requests, where two approaches were debated, where a fix followed a merge.

Granite does the part a heuristic can't: judging whether a diff is *pedagogically* valuable (does it contain a learnable mistake, or is it just tedious?), and comparing a junior's review against a senior's to name the conceptual gap between them. A heuristic sees two review threads. A model sees that one person is reasoning about failure modes and the other is reasoning about syntax.

---

## The open question

**Where does the ground truth come from?**

The whole thing rests on comparing a junior's audit against a correct one. Options, each with a problem:

- **The senior's real review.** Most authentic, but seniors miss things too, and it means waiting for their review before the junior gets feedback — slow loop.
- **Known-outcome history.** Use PRs where we know what happened — the bug that shipped, the incident that followed. Real ground truth, but rare, and it's backward-looking.
- **Deliberately seeded flaws.** Fast, plentiful, gradeable. But it's simulation, and juniors will learn to spot *seeded* bugs rather than real ones.

Probably some combination, weighted toward real reviews with seeded work filling gaps. **Not solved.**

Second open question: does routing work to a junior first actually slow the team down? If it does, nobody will adopt it regardless of how good the pedagogy is. There may be an answer in only intercepting non-urgent changes — but that's a guess.

---

## Why it holds up

**The problem is named and quantified.** Juniors down from a third of new hires to **under 10%** ([Managed Code](https://www.managed-code.com/blog-post/broken-junior-pipeline)). Microsoft leadership publicly warning about it ([InfoQ](https://www.infoq.com/news/2026/04/junior-developer-pipeline-crisis/)). Coverage across [Help Net Security](https://www.helpnetsecurity.com/2026/07/28/genai-junior-developer-pipeline/), [ThinkPol](https://thinkpol.ca/2026/03/24/the-junior-developer-pipeline-is-broken-and-nobody-has-a-plan-to-fix-it/), and others — one of which is literally titled *"and nobody has a plan to fix it."*

**"AI drag" on early-career developers is a documented, counterintuitive finding** — the tool helps experts and hurts novices, because using it well requires the judgment novices are still building.

**The 5-to-9 year lag makes it a genuinely important problem**, not just a topical one. The consequence is locked in years before it's felt.

**Everyone has converged on the same fix and nobody has built the mechanism.** The recommendations are consistent across sources: juniors should audit AI output, evaluate multiple implementations, be measured on learning velocity rather than tickets, and pair with seniors on AI review. That's a spec waiting for an implementation.

**The field is empty.** Of 92 wildcard projects, the training-adjacent ones are *AI Mentor for IELTS*, *Training Management System*, and *DataMine AI* — a language tutor, a course-scheduling platform, and a data tool. Nothing touches the apprenticeship collapse.

**It runs on real data.** Any repository with review history contains the teaching moments already.

---

## Framing

Don't open with education — "AI tutor" is the crowded, dismissible read.

Open with the demographic fact:

> **We stopped hiring juniors because AI does what juniors used to do. In 2031 there will be no seniors. Nobody is doing anything about this.**

Then the mechanism: the work that taught people is gone, so we have to build a new one out of the work that's left — auditing what the AI produced.

The general version: this isn't only software. Anywhere expertise was built by doing simple cases first — law, medicine, accounting, trades — AI just took the simple cases. Software is where it's measurable first, and where it's furthest along.

---

## Scope

One repository. One junior. One blind-spot profile. One velocity curve.
