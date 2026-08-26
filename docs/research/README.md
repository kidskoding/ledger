# Research

Raw data behind the claims in our idea docs. Nothing here is written by us — it's what we pulled from the internet, kept so any number in a writeup can be traced back to its source.

| File | What it is |
|---|---|
| `ai-at-work-frustration-raw.md` | 30-day sweep of what people are actually saying about AI at work |
| `challenge-field-scrape.json` | Every project submitted to this challenge, both months |

---

## `ai-at-work-frustration-raw.md`

Pulled 26 August 2026 via `/last30days`, covering 27 July – 26 August.

**Sources swept:** Reddit (22 threads, 30,882 upvotes, 3,701 comments) · Hacker News (47 stories, 5,260 points, 4,281 comments) · GitHub (21 items) · Digg (45 clusters) · Techmeme (6 headlines) · YouTube. X/Twitter unavailable — no auth configured, so that lane is missing.

Query was reframed before running: people don't post "what I hate about AI at work," they post about AI slop, forced tools, and cleaning up generated code. Searched that vocabulary instead.

**What came out of it:**

- ["New codebase + AI code smells"](https://www.reddit.com/r/ExperiencedDevs/comments/1vvj60z/new_codebase_ai_code_smells/) — r/ExperiencedDevs, 182 upvotes, **195 comments**. Comment-to-upvote ratio that high means arguing, not agreeing. Engineers inheriting a codebase trying to work out which parts a human actually understood. This thread is the origin of BLINDSPOT.
- *"Using AI for something you don't understand is a fantastic clueless-middle-manager simulator"* — r/cscareerquestions, 209 upvotes. The failure mode in one line.
- ["People who got 'drafted' into AI, how are you doing?"](https://www.reddit.com/r/cscareerquestions/comments/1vywb73/people_who_got_drafted_into_ai_how_are_you_doing/) — people reassigned onto AI work they didn't choose.

The file's appendix holds web supplements with the harder numbers — the CircleCI throughput data, the review-burden studies, the mandate-backlash surveys.

### Key figures worth citing

| Figure | Source |
|---|---|
| Feature-branch throughput **+59% YoY** while median-team main-branch throughput **fell** | CircleCI 2026 data, via [Aviator](https://www.aviator.co/blog/the-ai-code-verification-bottleneck-why-faster-code-generation-means-slower-reviews/) |
| Average task time-in-progress **+225%** under high AI adoption | same |
| **38%** of developers say reviewing AI code takes more effort than human code | [DevOpsDigest](https://www.devopsdigest.com/the-invisible-cost-of-ai-generated-code-reviews) |
| **30%+** of senior developers now ship mostly AI-generated code | [Milestone](https://mstone.ai/blog/ai-code-review-bottleneck/) |
| Review burden falls on seniors — juniors lack context to catch what matters | [Faros AI](https://www.faros.ai/blog/ai-code-quality-senior-engineer-review-burden) |
| **62%** rank "using AI output without checking it" the most annoying AI behavior, top of 16 tested | [Business.com](https://www.business.com/articles/annoying-ai-habits-study/) |
| **54%** bypassed mandated AI tools in the last 30 days and did the work manually; **33%** skipped AI entirely | [Metaintro](https://www.metaintro.com/blog/bosses-pushed-workers-use-ai-backfired), n=3,750 |
| **24%** of workers required to use AI got little or no training; **36%** stuck on free tiers | same |
| Academic: "Human Oversight and Overload: Two Hidden and Costly Burdens of AI-Assisted Software Engineering" | [arXiv 2606.05770](https://arxiv.org/pdf/2606.05770) |

---

## `challenge-field-scrape.json`

Every project submitted to the AI Builders Challenge, pulled 24 August from the BeMyApp platform's GraphQL API (`othersProjectList`), filtered per challenge tag and deduplicated by project ID. Re-checked 26 August.

**Field size:**

| Month | Themed | Wildcard | Total |
|---|---|---|---|
| July (final) | 275 | 79 | **354** |
| August (26th) | 40 | 20 | **60** |

Same prize pool each month. August is a fraction of July's field.

**Two findings that shaped our decisions:**

1. **Only 6 of 92 wildcard projects mention watsonx or Granite** — 6.5%. The Technical Execution criterion explicitly reads "effective use of AI *and IBM technologies*."
2. **Nobody in the field proves anything.** No benchmarks, no before/after, no real users across all 92 projects. Everyone claims outcomes; nobody demonstrates one.

**Saturated clusters** (avoid — entering caps Innovation regardless of execution): meeting/knowledge capture (12) · student/career assistants (10) · generic decision-intelligence platforms (10) · unspecified multi-agent orchestrators (10) · governance/audit/compliance (6).

**Nearest neighbours to BLINDSPOT:** *Beef* (finds PRs that pass alone but break together) and *MergeMasterAI* (orchestrates PR workflows). Both about the mechanics of merging. Neither about comprehension.

### Reproducing the scrape

The public listing pages are unreliable — an unfiltered sweep returned 372 of a claimed 802 records with duplicates across pages. Per-tag filtered queries run to exhaustion return complete, consistent results. Ignore the API's `total: 802` field; it's unfiltered.

POST the `GetOthersProjectList` operation to `/graphql/graph/graphql` with `filters.tags = [<tagId>]`:

| Tag | ID |
|---|---|
| July Creative Industries | `6a1f467dc765ca54b71c49db` |
| Wildcard (July) | `6a44179ecce72a17f06c9ace` |
| August Space Exploration | `6a70b67833a12697f185beb8` |
| Wildcard (August) | `6a70b67833a12697f185beb9` |

---

## Web research by idea

Targeted searches run 26 August 2026, one per candidate problem. Figures below are what the idea docs cite.

### LEDGER — the unmeasured verification work

| Figure | Source |
|---|---|
| Developers estimate **~1/3 of the working day** now goes to AI-related work invisible to productivity metrics | [Larridin](https://larridin.com/developer-productivity-hub/developer-productivity-benchmarks-2026) |
| **81%** of engineering leaders say code review time has gone up since deploying AI | [Harness](https://www.harness.io/blog/we-re-measuring-the-gains-and-missing-the-costs) |
| "Your best engineers might look less productive on paper precisely because they're the ones catching problems others miss" | [Harness](https://www.harness.io/blog/we-re-measuring-the-gains-and-missing-the-costs) |
| Traditional metrics (PRs/week, LOC, commits) unreliable — AI inflates volume without value | [Plandek](https://plandek.com/blog/metrics-to-track-in-2026-for-ai-augmented-engineering), [LeadDev](https://leaddev.com/reporting/measuring-engineering-productivity-is-harder-than-ever) |

Note the shape of the coverage: everyone has named the problem, and the proposed fix is always "rethink what productivity means." That's a sentence, not a product.

### RUNGS — the junior pipeline collapse

| Figure | Source |
|---|---|
| Juniors fell from **~1/3 of new hires at large tech firms to under 10%** | [Managed Code](https://www.managed-code.com/blog-post/broken-junior-pipeline) |
| Microsoft's Russinovich and Hanselman publicly warn AI is hollowing out the junior pipeline | [InfoQ](https://www.infoq.com/news/2026/04/junior-developer-pipeline-crisis/) |
| **"AI drag"** — AI boosts seniors but *hurts* early-career devs, who lack judgment to steer and verify output | multiple, incl. [Help Net Security](https://www.helpnetsecurity.com/2026/07/28/genai-junior-developer-pipeline/) |
| **5–9 years** to grow a graduate into a reliable senior. Juniors not hired in 2025 are the seniors missing in 2031. | [ThinkPol](https://thinkpol.ca/2026/03/24/the-junior-developer-pipeline-is-broken-and-nobody-has-a-plan-to-fix-it/) |
| Consensus fix: juniors should audit AI output, evaluate multiple implementations, be measured on learning velocity not tickets | consistent across sources |

That last row is a spec waiting for an implementation — everyone converged on the same answer and nobody built the mechanism.

### DELTA — adoption measured, outcomes not

| Figure | Source |
|---|---|
| **95% of enterprise AI pilots delivered no measurable P&L impact** — 300 initiatives, 150 exec interviews, 350 employee surveys (MIT, "The GenAI Divide") | [Healthcare IT News](https://www.healthcareitnews.com/news/mit-95-enterprise-ai-pilots-fail-deliver-measurable-roi), [Legal.io](https://www.legal.io/blog/5719519/MIT-Report-Finds-95-of-AI-Pilots-Fail-to-Deliver-ROI-Exposing-GenAI-Divide) |
| **42%** of enterprises hit zero ROI due to inadequate *measurement* — success defined as "improved efficiency" with no proof | [SoftwareSeni](https://www.softwareseni.com/why-95-percent-of-enterprise-ai-projects-fail-mit-research-breakdown-and-implementation-reality-check/) |
| **80%+** piloted ChatGPT/Copilot; gains stayed individual, never became enterprise outcomes | MIT, via above |
| Named cause is organizational learning gaps, not the technology | MIT, via above |

⚠️ **Caveat worth carrying:** the MIT 95% figure drew [pushback on its framing](https://www.marketingaiinstitute.com/blog/mit-study-ai-pilots). Cite it as the widely-reported figure it is, not as settled science. The measurement-gap finding is corroborated independently.

### SIGNAL — assessment validity collapse

| Figure | Source |
|---|---|
| **38.5%** of candidates flagged for AI cheating across **19,368 interviews** (Jul 2025–Jan 2026); **48%** in technical roles | [Fabric](https://fabrichq.ai/blogs/state-of-ai-interview-cheating-in-2026-insights-from-19-368-interviews) |
| Rate **tripled in three months** — 9% (Jul 2025) → 45% (Sep) | same |
| **61% of cheaters still scored above the passing threshold** and would have advanced undetected | same |
| Take-homes have *higher* cheat rates than live interviews — unlimited time, total privacy | [Fabric](https://fabrichq.ai/blogs/interview-cheating-in-2026-the-rise-of-ai-tools-like-cluely-and-interview-coder) |
| Tooling: GPU-level overlays rendering beneath the video-capture layer, real-time audio coaching, deepfake video | [Truffle](https://www.hiretruffle.com/blog/ai-interview-cheating) |
| Industry response split: back to in-person, or permit AI and redesign the assessment | [Forbes, 17 Aug 2026](https://www.forbes.com/sites/karadennison/2026/08/17/the-rise-of-ai-cheating-culture-and-the-hiring-crisis-it-left-behind/) |

---

## Field overlap check

Probed all 92 wildcard projects (both months) for each candidate area:

| Area | Hits | What they were |
|---|---|---|
| Adoption vs. outcome / ROI | **0** | — |
| Invisible / unmeasured work | 1 | *Shadow Ops* (July) — adjacent, finds hidden work |
| Expertise / skill decay | 1 | *Nexus AI* — student career coach, unrelated |
| Trust / checking output | 1 | *Corpus* — document search, unrelated |
| Review / verification burden | 3 | All security-assurance (*SENTRY AI*, *Decision Assurance Layer*), not the labor problem |
| Training / juniors | 3 | IELTS tutor, course-scheduling platform, data tool — none touch apprenticeship collapse |

All five candidate spaces are effectively unoccupied.
