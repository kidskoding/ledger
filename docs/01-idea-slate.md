# Idea Slate — August Wildcard

**Track:** Wildcard Challenge (August) — *Build Intelligent Systems for the Future of Work*
**Deadline:** 31 August 2026, 11:59 PM ET · **Build window:** 7 days
**Grounded in:** `00-competitive-landscape.md` (92 wildcard entries analyzed)

---

## Selection filter

Every idea below had to clear five gates. These come directly from the landscape analysis, not from taste.

| Gate | Why |
|---|---|
| **Real business problem, with a cost** | "Real-World Impact" is a scored criterion. A problem with a dollar figure attached beats a problem with a persona attached. |
| **IBM has this problem** | The judging panel is IBM employees. A pain they personally feel converts an abstract score into recognition. Weighted, not required. |
| **Unoccupied in the field** | 4 clusters are saturated (see landscape §3). Entering one caps Innovation regardless of execution. |
| **Narrow and falsifiable** | The sharp entries are one-sentence problems (Beef, Project Naur). Broad platforms are indistinguishable in a 3-minute video. |
| **Measurable in 7 days** | Nobody in the field proves anything (landscape §5). One honest number is the cheapest available edge. |

Two things apply to **every** idea here and are not repeated below: Granite on watsonx as the reasoning layer (~6% of the field does this), and `docs/bob-log.md` treated as a scored deliverable.

---

# TIER 1

## 1. BENCH — staffing conflict as multi-party negotiation

> Two engagements need the same person. Both have real deadlines. Both have hidden flexibility neither will volunteer. BENCH finds the trade.

### The business problem

Professional-services firms live or die on utilization. Every consultancy runs some version of a weekly staffing call where partners argue over the same scarce specialists, and the outcome is decided by whoever escalates hardest — not by what's globally optimal. The losses are real and quantifiable: bench time on one side, delivery slip on the other, and attrition when people are repeatedly assigned against their stated growth interests.

The structural reason this stays broken: **the information needed to find a good trade is private and nobody is incentivized to reveal it.** Engagement A won't admit its deadline has two weeks of float, because that float is its negotiating leverage. So the trade that would have made both sides better off never surfaces.

### Why IBM specifically

IBM Consulting is one of the largest professional-services organizations on earth — on the order of 160,000 practitioners matched to engagements continuously. Skills-to-demand matching at that scale is not a hypothetical IBM problem; it is a core operational constraint of a major IBM business unit. A judge from IBM Consulting will recognize this within ten seconds of the demo.

It also generalizes cleanly — every agency, hospital scheduling office, and university course-assignment committee has the same shape.

### Why this wins — rationale

**Whitespace.** Across all 92 wildcard entries, *every single one is a single-user tool.* Not one mediates between multiple people with genuinely conflicting interests. This is the largest unoccupied territory in the field, and it is the most literal possible reading of the challenge statement's "help **teams** achieve outcomes faster."

**The innovation is the privacy model, not the matching.** Constraint solvers are old. What's new: BENCH holds each party's private constraints, computes trades using information *neither party can see*, and discloses only the minimum needed to make the trade acceptable. It is a mediator that knows more than either side and is trusted precisely because it demonstrably withholds. That's a genuinely novel framing for an "AI coworker" and it's defensible under judge questioning.

**It demos better than anything else on this slate.** Human conflict, visible stakes, a resolution nobody at the table had spotted. Three minutes is plenty.

**It contains the escalation mechanic** from idea #2 for free: when no Pareto-improving trade exists, BENCH escalates with a full brief instead of forcing a bad answer.

### What gets measured

Seed a realistic conflict set (~40 staffing conflicts with known-optimal solutions).

- **Joint utility gain** vs. first-come-first-served baseline — the headline number
- **Resolution rate without human escalation**
- **Information leakage audit: zero unauthorized disclosures**, mechanically verified

That third one is the killer. A live panel showing *what the system knew and deliberately did not say* is the most memorable ten seconds available in this entire field.

### Demo beat (3 min)

1. Three-way conflict on screen. Two engagement leads, one specialist, both deadlines real.
2. Each party privately states constraints, including flexibility they'd never say out loud.
3. BENCH proposes a trade — swap the specialist for weeks 1–2, backfill with a named alternate, engagement B slips a non-critical workstream into its float.
4. Both accept. Joint utility up 34% over baseline.
5. **The withholding panel:** here is what BENCH knew about each side and never revealed.
6. Fourth conflict has no valid trade → escalates with a complete brief rather than forcing it.

### Architecture

Deterministic constraint solver proposes candidate trades (plain Python — this must be provably correct, not vibes). Granite handles constraint elicitation from natural language, trade rationale generation, and the disclosure-minimization judgment. Next.js front end. The split matters: the solver guarantees correctness, Granite provides the human interface, and you can say that out loud as an engineering decision.

### Feasibility: **High.** Solver is a day. Elicitation and rationale are Granite calls. The UI is the bulk of it.

### Risks

Scope creep toward "a full staffing platform." Resist — one conflict type, three parties, done. If the constraint model gets too rich the solver stops being explainable, which kills the whole trust argument.

---

## 2. RELAY — escalation as a first-class primitive

> Agents don't fail because they're weak. They fail because they don't know when to stop.

### The business problem

The blocker to deploying AI agents on real work isn't capability — it's that a competent-95%-of-the-time agent that is *confidently wrong* the other 5% is worse than useless in any process with consequences. Current systems either guess (silent errors that surface downstream, expensively) or dump the whole task on a human with no context (which destroys the time savings that justified the agent).

Both failure modes have the same root cause: **the handoff is not a designed object.** Escalation is an afterthought — a fallback branch, not a product surface.

### Why IBM specifically

IBM's entire enterprise AI positioning is trustworthy AI in regulated industries — finance, healthcare, government. In exactly those industries, "the agent guessed" is not a bug report, it's a compliance incident. The unsolved problem standing between watsonx agents and production deployment in a bank is precisely this one. An IBM judge selling into regulated accounts has heard this objection from every client.

### Why this wins — rationale

**Clean whitespace, verified.** Zero of 92 entries treat handoff as the product. The nearest neighbor is *Mandate* ("policy-to-permission control plane"), which governs what an agent is *allowed* to do — an authorization question. RELAY governs what an agent is *competent* to do, which is an epistemics question. Different axis, and the distinction is easy to articulate when a judge asks how you differ.

**It answers the challenge statement's exact language.** "AI is evolving from a productivity tool into a true collaborator." A collaborator's defining trait is knowing the edge of their own competence. This is the most rigorous available interpretation of that sentence, and Challenge Fit is a scored criterion.

**The metric is unusually strong.** "Confidently wrong rate: baseline 23% → RELAY 4%" is a real number, adversarially checkable, and *nobody else in the field will have one like it.*

**Learning loop closes it.** A human's resolution is captured as a durable constraint, so the same class of ambiguity resolves automatically next time. That converts a one-shot tool into a system that improves — a much stronger Feasibility story.

### What gets measured

Labeled task set (~60 tasks, ~20 genuinely ambiguous).

- **Confidently-wrong rate** — baseline agent vs. RELAY. Headline.
- **Escalation precision/recall** — does it escalate the right things, or panic-escalate everything? (The trivial cheat is escalating always; measuring precision proves you didn't.)
- **Human seconds per escalation** — proof the context brief actually works
- **Repeat-ambiguity auto-resolution rate** — proof the learning loop closes

### Demo beat (3 min)

1. Agent works a queue of ops tasks. Fast, clean, unremarkable.
2. Task 7 is ambiguous. Baseline agent guesses — wrong, and shows the downstream damage.
3. RELAY on the same task: stops, packages a brief (what I tried · what I know · what I need · two options with tradeoffs · my recommendation).
4. Human answers in 8 seconds.
5. Task 12 is the same class of ambiguity → auto-resolved from the learned constraint.
6. Scoreboard: confidently-wrong 23% → 4%.

### Architecture

Granite generates the task attempt *and* a structured self-assessment of what it's uncertain about. A calibration layer (deterministic, tuned on the labeled set) converts that into an escalate/proceed decision — do not let the model grade its own homework unsupervised, and say so. Brief generation and constraint absorption are Granite. Constraints persist as retrievable rules.

### Feasibility: **High.** The labeled task set is the real work — budget a full day to build it honestly. Everything else is straightforward.

### Risks

Calibration is genuinely hard; an uncalibrated confidence score makes the headline metric meaningless. Mitigate by tuning against the labeled set and *reporting the calibration curve* — showing the curve turns a weakness into a Technical Execution point.

---

## 3. SPINE — the AI coworker that pushes back

> Every entry in this hackathon builds an agent that says yes. Collaborators say no.

### The business problem

Organizational waste is overwhelmingly generated at the *request* layer, not the execution layer. Work gets commissioned that duplicates work already done, that contradicts a decision made three weeks ago, that is infeasible given the requester's own committed load, or that nobody will ever read. Compliant tooling — including every AI assistant currently shipping — accelerates all of it. Making bad work faster is negative value, and it's the default outcome of deploying an eager assistant into a dysfunctional process.

The human who would catch these is a senior person with full context and enough standing to push back. Most organizations have too few of them, and they're the bottleneck.

### Why IBM specifically

Weaker direct tie than #1 or #2 — this is an every-large-organization problem rather than a distinctively IBM one. It applies to IBM at 270,000+ employees as much as anywhere. Include it for its Innovation ceiling, not its IBM alignment.

### Why this wins — rationale

**It inverts the premise the entire field shares.** All 92 entries assume the AI's job is to do more. SPINE's job is to refuse. A judge scoring their fortieth submission of the day will remember exactly one thing about the wildcard track, and it will be the one that said no.

**It's honest about a real failure mode of this whole product category** — which reads as maturity rather than cynicism, and gives you a strong answer to "what are the limitations of your approach?"

**Sharp, symmetric metric.** Pushback precision *and* false-pushback rate. The false-pushback number is what makes it credible: an agent that refuses everything is trivially "safe" and completely useless, and measuring both proves you understand that.

### What gets measured

Seeded request set (~40 requests, 15 of which are genuinely bad, each bad one bad for a *different* reason: duplicate, contradicts prior decision, infeasible load, no consumer).

- **Pushback precision / recall** by failure category
- **False-pushback rate** — the credibility number
- **Estimated hours saved** from prevented work

### Demo beat (3 min)

1. Request comes in: "Build a weekly churn dashboard for the retention team."
2. Baseline assistant: enthusiastically starts building.
3. SPINE: *"This duplicates the retention dashboard shipped in March — here it is, and its access log shows 4 views in 60 days. The underlying question looks like [X]. Want that instead?"*
4. Second request — SPINE approves it immediately and gets to work. **This beat is essential:** it proves the system isn't a blanket refuser.
5. Third: *"This contradicts the 12 August architecture decision. Escalating to the decision owner rather than proceeding."*
6. Scoreboard: 13/15 bad requests caught, 1 false pushback out of 25 good ones.

### Architecture

Retrieval over an org corpus (prior decisions, shipped artifacts, access logs, current commitments). Granite performs the four-category conflict classification with mandatory evidence citation — **every pushback must cite the specific record that justifies it**, which is what separates this from an LLM being contrarian. Deterministic checks handle load feasibility.

### Feasibility: **Medium-high.** The seeded corpus is the work; the logic is comparatively simple.

### Risks

Tonally, this can read as obnoxious. The demo must show it being *helpful* while refusing — always redirect to the better version of the request, never just decline. Beat 4 is not optional.

---

## 4. WARD — regression detection for deployed AI coworkers

> You changed a prompt. Something got 14% worse. Nobody will notice for three weeks.

### The business problem

Organizations are deploying agents into real workflows right now. Those agents get modified constantly — prompt edits, model version bumps, tool changes, retrieval index updates. Every one of those is an untested deploy to production.

Traditional software has a hundred years of accumulated practice for this: tests, CI, canaries, rollback. Agent deployments have essentially none. Quality degrades silently and is discovered through downstream business damage, which is the most expensive possible detection mechanism.

### Why IBM specifically

IBM sells agent platforms to enterprises and runs them internally. Every client deploying watsonx agents will hit this within two quarters. Note the adjacency risk honestly: **watsonx.governance** already covers policy compliance, audit trails, and drift monitoring. WARD must be positioned as the *functional-quality* layer — "did the agent do the job correctly," a testing concern — not the governance layer. Framed as complementary this is strong; framed carelessly it looks like a worse version of a shipping IBM product.

### Why this wins — rationale

**Directly exploits the field's blind spot.** Landscape §5: nobody measures anything. WARD's entire product *is* measurement, which makes the Technical Execution case almost self-proving.

**Meta-resonance with the judges.** IBM engineers ship AI systems for a living. This is a problem they have personally been bitten by, which is worth more than any framing exercise.

**Unambiguously demonstrable.** Inject a known regression, show it caught, show the diff identifying which task class broke. There is no hand-waving available — it either catches it or it doesn't.

**Nearest neighbor is authoring-time, not runtime.** *MetaForge* (August) scopes and tests prompts at design time. WARD watches deployed agents over time. Adjacent, clearly distinct.

### What gets measured

- **Regression detection rate** at varying severities (2%, 5%, 15% quality drops)
- **False alarm rate** under normal output variance — the hard part, and the credibility number
- **Time-to-detection** vs. a downstream-damage baseline

### Demo beat (3 min)

1. Three agents in production, quality scorecards green.
2. Engineer makes a harmless-looking prompt edit.
3. WARD runs the golden set. Overall quality −14%, alert fires.
4. Drill down: the regression is isolated to one task class — multi-step refunds.
5. One-click rollback, scorecard green.
6. Detection: 4 minutes. Baseline (customer complaints): 3 weeks.

### Architecture

Golden task sets with reference outputs. Granite as grader with a **calibrated rubric**, cross-checked against deterministic assertions wherever the output is checkable — never let an ungrounded LLM judge be the only signal, and say so explicitly. Statistical significance testing to separate real regressions from noise (this is what makes the false-alarm rate defensible).

### Feasibility: **Medium.** Statistical layer needs care. Heaviest Tier 1 build.

### Risks

Least human of the four — it's infrastructure, and infrastructure demos are cold. Needs a strong narrative frame ("the three weeks nobody noticed") to carry emotionally.

---

# TIER 2 — strong ideas, worse fit for a 7-day window

## 5. KEEL — extracting tacit knowledge from legacy systems

**Problem.** Critical systems are maintained by people who are retiring. The documentation describes what the code does; the irreplaceable knowledge is *why* — why this validation exists, which client demanded it, what breaks if you remove it. That knowledge leaves the building permanently.

**IBM tie: the strongest on this slate.** Mainframe and COBOL modernization is a major IBM business line, and workforce attrition in that estate is a well-documented, openly-discussed industry crisis. IBM ships watsonx Code Assistant for Z specifically into this problem.

**Why it's Tier 2.** A credible demo needs a legacy codebase *and* a plausible institutional history around it. Synthesizing both convincingly in seven days is a stretch, and an unconvincing one undermines the entire premise. Also brushes against *RESONANCE* (August), which occupies the organizational-memory framing.

**Promote it if** you have real access to a legacy system with genuine institutional history. That access would be a decisive unfair advantage.

## 6. TWIN — simulate the process change before you make it

**Problem.** Organizations restructure processes and deploy automation based on argument, not evidence. The failure shows up in production, at full cost. Simulating the change first — agents playing each role against historical data, surfacing where it queues, breaks, or costs more — turns a guess into a test.

**Why it's Tier 2.** Highest technical ceiling on the slate and the strongest possible Technical Execution story, but it is comfortably a three-week build. Attempting it in seven days produces a shallow version that reads as a toy, which is worse than a deep version of a smaller idea.

**Promote it only if** the team is 4–5 people who can genuinely parallelize.

---

# Recommendation

**Build BENCH.** Rationale, in priority order:

1. **Largest verified whitespace.** All 92 entries are single-user tools. Multi-party mediation is unoccupied, and it's the most literal reading of the challenge statement.
2. **Strongest business problem with the strongest IBM tie.** Staffing-to-demand matching is a core operational constraint of IBM Consulting — recognizable to a judge in seconds, and dollar-denominated rather than persona-denominated.
3. **Best three-minute demo on the slate.** Human conflict, visible stakes, a resolution nobody spotted. The withholding panel is the most memorable single beat available in this field.
4. **Highest feasibility in Tier 1.** Deterministic solver plus Granite elicitation. No calibration research required, unlike RELAY and WARD.
5. **It absorbs the other ideas' best mechanics.** RELAY's escalation is BENCH's no-valid-trade path. SPINE's evidence-cited pushback is how BENCH rejects an unreasonable constraint.

**Fallback: RELAY**, if the team is smaller than three. It's cleaner whitespace and a simpler build; it just demos less vividly.

**Do not build:** anything in the four death-zone clusters, regardless of how good the execution would be. Innovation is capped on entry.

---

## Open items

- [ ] Team size and available hours — gates BENCH vs. RELAY
- [ ] Any real-world access (a real staffing process, a real agent deployment, a real legacy system)? Would outweigh every ranking above.
- [ ] Claim IBM Bob — 40 Bobcoins, 30-day clock, starts on activation
- [ ] **Every team member** completes one SkillsBuild Bob activity — hard eligibility gate
- [ ] Register the project page on the platform early; don't discover a submission bug on the 31st
