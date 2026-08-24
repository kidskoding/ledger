# End-to-End Walkthroughs

Complete functional descriptions of each candidate project: who uses it, what data it holds, every step of the flow, what runs deterministically versus what runs on Granite, and how each one gets measured.

**Companion docs:** `00-competitive-landscape.md` (why these ideas and not others) · `01-idea-slate.md` (rationale and ranking)

---

## A note on the architecture pattern shared by all four

Every application below splits work the same way, and the split is deliberate:

| Layer | Responsibility | Why |
|---|---|---|
| **Deterministic core** | Anything that must be *correct* — constraint solving, feasibility checks, disclosure filtering, statistical significance | These are guarantees. A language model cannot provide a guarantee, only a likelihood. |
| **Granite (watsonx)** | Anything that must be *understood or expressed* — parsing free text into structure, generating rationale, writing briefs, judging subjective quality | This is what models are actually good at. |
| **Hard gate between them** | Model output is validated against the deterministic layer before it reaches a user | "We instructed the model not to" is not a property. Enforcement in code is. |

This is worth stating explicitly in the README and the video. In a field where most entries are a model call behind a UI, showing that you know which half of your system is trustworthy is a direct Technical Execution argument.

---

# 1. BENCH

**Staffing conflict resolved as multi-party negotiation with enforced information asymmetry.**

## What it is, in one paragraph

Two project leads both need the same specialist during the same weeks. Each has real deadlines and each has hidden slack they will never volunteer, because that slack is their negotiating leverage. BENCH collects each party's constraints privately, searches for reallocations that make everyone better off, and presents each party only the facts they need to evaluate the proposal — provably never revealing what it wasn't authorized to share. When no acceptable trade exists, it escalates with a complete brief instead of forcing a bad answer.

## Who uses it

| Role | What they do |
|---|---|
| **Resource Manager** | Operates the system. Sees the full picture. Runs the weekly staffing call. |
| **Engagement Lead** (2+ per conflict) | States their needs privately. Receives proposals. Accepts, counters, or rejects. |
| **Practitioner** | The person being allocated. States growth interests and hard personal constraints. |
| **Practice Leader** | Receives escalations when no valid trade exists. Has broader disclosure authorization. |

## Data model

```
Person          id · skills[{name, proficiency}] · allocations[{engagement, weeks, fraction}]
                growth_interests[] · location · timezone · cost_rate

Engagement      id · client · priority_tier · revenue_at_risk
                workstreams[{required_skills, weeks, criticality}]
                hard_deadline · float_weeks (PRIVATE)

Constraint      id · owner · type(hard|soft) · weight
                visibility(private | shareable | shared)
                source_text · parsed_form

Conflict        id · person · contended_weeks · engagements[] · revenue_at_risk

Proposal        id · conflict · allocation_changes[] · joint_utility
                per_party_view[{party, deltas, rationale, disclosures[]}]

Disclosure      constraint_id · revealed_to · authorization_basis · timestamp
```

The `visibility` field on Constraint and the `Disclosure` ledger are the heart of the system. Everything else is ordinary scheduling data.

## End-to-end flow

```mermaid
flowchart TD
    A[Load roster + engagement book] --> B[Build allocation calendar]
    B --> C{Detect contention:<br/>person over 100% in any week}
    C -->|conflicts found| D[Conflict queue<br/>ranked by revenue at risk]
    D --> E[Private constraint elicitation<br/>per party — Granite]
    E --> F[Practitioner preferences]
    F --> G[Trade search — deterministic solver<br/>returns Pareto frontier]
    G --> H{Any feasible trade?}
    H -->|yes| I[Disclosure minimization<br/>per proposal, per party]
    I --> J[Granite drafts rationale]
    J --> K[Deterministic disclosure filter<br/>HARD GATE]
    K --> L[Per-party proposal views]
    L --> M{All parties accept?}
    M -->|yes| N[Commit to calendar<br/>close conflict]
    M -->|counter| E
    H -->|no| O[Escalate to Practice Leader<br/>with full brief]
    M -->|rejected| O
    N --> P[Disclosure ledger / withholding panel]
    O --> P
```

### Step 1 — Ingest and contention detection

Load a roster and engagement book (seeded CSV/JSON). The system materializes a week-granular allocation calendar for every person. Contention detection is trivial and deterministic: any person allocated above 100% in any week is a conflict. Conflicts are grouped by person and overlapping window.

**Screen:** Conflict queue. A ranked list — *"Priya Raman · weeks 34–37 · Meridian Bank vs. Halcyon Health · $340k at risk."* Sorted by revenue at risk. The Resource Manager opens one.

### Step 2 — Private constraint elicitation

Each engagement lead gets a private intake conversation. They type naturally: *"We need Priya weeks 1 through 4, the client demo is on the 15th and she's the only one who knows their data model."*

Granite does two jobs here:

**Parse** free text into typed constraints — `requires(Priya, weeks 34-37)`, `deadline(client_demo, 2026-09-15)`, `justification(unique_knowledge, client_data_model)`.

**Probe for flexibility.** This is the part that makes the whole system work, and it's why an LLM is genuinely necessary rather than decorative. The system asks follow-ups a form never would:

> *"Is the 15th a contractual date or an internal target?"*
> *"If Priya were available weeks 36–37 only, what specifically breaks?"*
> *"Is there anyone who could shadow her on the data model in week 34?"*

Answers surface the float that would otherwise stay hidden. Each elicited constraint is recorded **private by default**. The lead sees exactly what was captured and sets visibility per item — private, shareable, or already shared. Nothing is revealed without an explicit authorization on the record.

**Screen:** Split view. Left, the conversation. Right, the live list of captured constraints with a visibility toggle on each. The lead watches their own private information being catalogued and controls it.

### Step 3 — Practitioner input

Priya states her own constraints: growth interests (*"I want more time on regulated-industry work"*), hard personal constraints (*"no travel weeks 36–37"*), and preferences. Same privacy model.

This matters beyond fairness — growth alignment is a term in the objective function, so the system optimizes for retention, not just utilization. That's a real, defensible business argument.

### Step 4 — Trade search (fully deterministic)

The solver enumerates feasible reallocations across the joint constraint set. The move set:

- **Substitution** — replace Priya with a bench resource, scored by skill adjacency
- **Partial allocation** — split her across both engagements at reduced fraction
- **Time shift** — move a workstream into declared float
- **Sequencing** — reorder workstreams within an engagement
- **Composite** — combinations of the above

Objective function is a weighted sum: deadline satisfaction, skill fit, growth alignment, utilization, and cost. The solver returns the **Pareto frontier**, not a single answer — several non-dominated options for the Resource Manager to weigh.

This is plain Python. It has to be: the entire trust argument rests on the trade being *actually feasible*, and that's a claim a language model cannot make.

### Step 5 — Disclosure minimization

**This is the novel component.** For each candidate proposal and each party, compute the minimum set of facts that party must learn to evaluate it.

The procedure:

1. The proposal changes party P's allocation. P must see their own delta — always authorized, it's their own data.
2. P needs enough justification to accept. Candidate justifications are drawn from the constraint set.
3. Filter candidates to those P is authorized to see (either P owns them, or the owner marked them shareable).
4. Select the **minimum subset** sufficient to justify the change.
5. Granite drafts human-readable rationale from that subset only.
6. **Hard gate:** a deterministic filter parses the drafted rationale and checks every factual claim against the authorized subset. Any sentence citing or implying a private constraint is rejected and regenerated. If regeneration fails twice, the proposal is presented without rationale rather than with a leaky one.

Step 6 is why this is a security property and not a prompt. Say that out loud in the video.

### Step 6 — Proposal presentation

Each party sees **their own view only**:

> **Meridian Bank engagement lead sees:**
> Priya moves to 50% weeks 34–35, full time 36–37. Marcus Chen covers the data-model workstream weeks 34–35 — he shipped the equivalent model at Northwind last quarter. Your 15 September demo date is unaffected.
> *Joint utility for this option: +34% over first-come-first-served.*

Note what's absent: no mention that Halcyon disclosed two weeks of float. That fact drove the entire solution and Meridian never learns it.

The Resource Manager sees the full picture and the frontier.

### Step 7 — Accept, counter, or reject

Counters are captured as new constraints and the solver re-runs. Each round is logged.

### Step 8 — The no-valid-trade path

When the Pareto frontier is empty, or every option is rejected, BENCH escalates rather than forcing an answer. The Practice Leader receives:

- The conflict and what's at stake
- The constraint set, respecting privacy (the escalation target has broader authorization, so they see more — but the ledger records exactly what and why)
- Every option tried and the specific reason each failed
- The two least-bad options with explicit tradeoffs
- A recommendation, and an honest statement of what makes it uncertain

This is the RELAY mechanic embedded in BENCH — the system knows the edge of its own competence.

### Step 9 — The withholding panel

An audit view, and the most memorable ten seconds of the demo:

> **Constraints held:** 14 · **Revealed:** 3 · **Unauthorized disclosures:** 0
>
> | Fact | Held from | Would have changed their position | Authorization |
> |---|---|---|---|
> | Halcyon has 2 weeks float | Meridian | Yes — they'd have demanded all 4 weeks | Never-share (owner: Halcyon) |
> | Meridian's demo is internal, not contractual | Halcyon | Yes | Never-share (owner: Meridian) |
> | Priya prefers regulated-industry work | Both | No | Shareable, but not needed |

Every row is a fact the system used to find the trade and deliberately did not say. This is the product.

### Step 10 — Commit

Accepted proposal writes back to the allocation calendar. Conflict closes. Downstream conflicts recompute.

## What Granite does, precisely

1. Free-text → typed constraints
2. Flexibility-probing follow-up questions
3. Proposal rationale drafting (from the authorized subset only)
4. Escalation brief composition

## What is deterministic

1. Contention detection
2. Trade search and Pareto frontier
3. Disclosure authorization filtering (the hard gate)
4. Joint utility computation

## Evaluation harness

Forty seeded conflicts with computed optimal joint utility.

| Metric | Baseline | Target |
|---|---|---|
| Joint utility vs. optimal | FCFS: ~55%<br/>Seniority-wins: ~62% | 85%+ |
| Resolved without escalation | n/a | 70%+ |
| **Unauthorized disclosures** | n/a | **0, asserted in tests** |

The leakage metric is a hard assertion in the test suite, not a measured average. A single leak fails the build. That framing is the difference between a claim and a guarantee.

## Build estimate

| Component | Days |
|---|---|
| Data model + seed generator | 1 |
| Solver + Pareto | 1 |
| Granite elicitation + rationale | 1 |
| Disclosure filter + ledger | 1 |
| UI (queue, intake, proposal, withholding panel) | 2 |
| Eval harness + video | 1 |

---

# 2. RELAY

**Agents that know the edge of their own competence, and hand off well when they reach it.**

## What it is, in one paragraph

An agent works a queue of real tasks. On most it just works. On the ambiguous ones it stops — not because it failed, but because a calibrated confidence estimate says it shouldn't guess. It packages what it tried, what it knows, exactly what it's missing, and the options with tradeoffs, then routes to a human. The human answers in seconds. That answer becomes a durable, scoped rule, so the next task of the same shape resolves automatically.

## Who uses it

| Role | What they do |
|---|---|
| **Ops worker** | Receives escalations, answers the specific question, confirms rule scope |
| **Agent operator** | Configures thresholds, reviews the calibration curve, audits learned rules |

## Demo domain

Customer support ticket resolution under a policy document — concrete, legible in 30 seconds, and genuinely ambiguous in realistic ways (refund thresholds, tenure exceptions, edge cases the policy doesn't cover).

## Data model

```
Task            id · payload · ground_truth (eval only) · ambiguity_label (eval only)

Attempt         task · draft_resolution · self_assessment{
                  missing_facts[] · ambiguous_clauses[] · assumptions_made[]
                  per_dimension_confidence{}
                } · retrieval_coverage

Decision        attempt · calibrated_score · action(escalate|proceed) · threshold_used

Brief           attempt · tried · known[{claim, cited_source}] · needed
                options[{action, consequence}] · recommendation · uncertainty_statement

Resolution      brief · human_answer · human_rationale · seconds_to_resolve

Rule            pattern · policy · scope · provenance(resolution_id) · confirmed_by
```

## End-to-end flow

```mermaid
flowchart TD
    A[Task enters queue] --> B[Granite: draft resolution<br/>+ structured self-assessment]
    B --> C[Calibration layer<br/>DETERMINISTIC]
    C --> D{Calibrated confidence<br/>above threshold?}
    D -->|yes| E[Apply resolution · log]
    D -->|no| F[Granite: compose brief]
    F --> G[Human answers<br/>seconds tracked]
    G --> H[Granite: draft candidate rule<br/>with explicit scope]
    H --> I[Human confirms or narrows scope]
    I --> J[Rule persisted]
    J --> K[Next matching task<br/>auto-resolves, cites rule]
    E --> L[Scoreboard]
    K --> L
```

### Step 1 — Attempt with structured self-assessment

Granite receives the task and the relevant policy context, and produces two things: a draft resolution, and a **structured uncertainty report** — which facts it couldn't find, which policy clauses were ambiguous as applied, which assumptions it had to make, and per-dimension confidence.

Asking for the uncertainty report as structured output rather than a number is deliberate. "Confidence: 0.7" is nearly meaningless. "I could not determine customer tenure, and clause 4.2 doesn't specify behavior for partial refunds" is actionable, and it becomes the raw material for the brief.

### Step 2 — Calibration layer (deterministic)

**The model does not decide whether to escalate.** A calibrated function of its signals decides.

Features: the self-assessment dimensions, retrieval coverage (did we actually find relevant policy?), task-shape features, and historical accuracy on similar tasks. These map to a calibrated probability of correctness via isotonic regression fitted on the labeled set. A threshold on that probability produces the escalate/proceed decision.

This matters for two reasons. Raw model self-confidence is systematically overconfident and unusable as-is. And separating the *signal* from the *decision* means the threshold becomes a tunable business parameter — a bank sets it conservatively, a low-stakes internal tool sets it loose. That's a real deployment story.

### Step 3 — Proceed path

Resolution applied and logged with its confidence score, so post-hoc auditing can check whether the threshold is set correctly.

### Step 4 — The brief

Escalation quality is the whole product. A bad handoff ("I couldn't do this, here's the ticket") destroys the time savings that justified the agent. The brief has a fixed structure:

> **What I tried** — draft resolution, with reasoning
> **What I know** — retrieved facts, each citing its source record
> **What I need** — *one* specific question, not a list of ten
> **Options** — each with its consequence
> **My recommendation** — and an honest statement of what makes me unsure

The single-question constraint is enforced. An agent that asks five questions has moved the work to the human rather than reducing it.

**Screen:** The brief renders as a card. The human's answer is usually one click or one short sentence. Time-to-resolution is tracked and displayed, because it's a headline metric.

### Step 5 — Constraint absorption, with scope confirmation

Granite converts the human's answer and rationale into a candidate rule with an **explicit scope**:

> *"When refund amount > $500 AND customer tenure < 90 days → require manager approval."*
> Derived from your resolution of ticket #4471. **Is this the right scope?**
> `[Confirm] [Narrow] [Just this once]`

The scope confirmation is not a nicety. Over-generalizing from a single human decision is exactly how these systems poison themselves — one answer about one edge case silently becomes policy for a thousand unrelated tasks. Making the human confirm the boundary is the difference between a system that learns and a system that drifts.

### Step 6 — Replay

The next task matching the rule resolves automatically, citing the rule and its provenance. The audit trail runs all the way back to the human decision that created it.

### Step 7 — Scoreboard and calibration curve

Live metrics, plus a **reliability diagram** — predicted confidence against observed accuracy, ideally on the diagonal.

Showing the calibration curve is the strongest single Technical Execution move available in this project. It demonstrates you understand that a confidence number is a claim requiring validation, and it preempts the sharpest question a judge can ask.

## Evaluation harness

Sixty tasks, twenty genuinely ambiguous. Baseline is the same Granite agent with escalation disabled.

| Metric | Baseline | Target |
|---|---|---|
| **Confidently-wrong rate** | ~23% | <5% |
| Escalation precision | n/a | >80% |
| Escalation recall | n/a | >85% |
| Mean human seconds per escalation | n/a | <15s |
| Repeat-ambiguity auto-resolution | 0% | >70% |

Precision matters as much as recall. Escalating everything trivially achieves zero confidently-wrong answers and is completely useless — reporting both proves the system isn't cheating.

## Build estimate

| Component | Days |
|---|---|
| Labeled task set (the real work — do it honestly) | 1.5 |
| Granite attempt + self-assessment | 0.5 |
| Calibration layer + curve | 1 |
| Brief generation + resolution UI | 1.5 |
| Rule absorption + replay | 1 |
| Scoreboard + video | 1 |

---

# 3. SPINE

**An AI coworker that refuses work it can prove shouldn't be done.**

## What it is, in one paragraph

Work requests arrive. SPINE checks each one against what the organization has already built, already decided, and already committed to. When a request duplicates shipped work nobody uses, contradicts a logged decision, exceeds the team's actual capacity, or has no plausible consumer, SPINE declines — with citations to the specific records that justify the refusal, and a proposal for the better version of the request. When a request is fine, it approves immediately and gets to work.

## Data model

```
Request         text · requester · target_team · requested_window

OrgCorpus       decisions[{text, date, owner, scope}]
                artifacts[{name, shipped_date, access_log[]}]
                commitments[{team, work, weeks, capacity}]

Finding         category(duplicate | contradicts_decision | infeasible_load | no_consumer)
                evidence[record_ids]  ← REQUIRED, enforced
                confidence

Response        approve | pushback{findings[], redirect_proposal} | escalate
Override        request · requester_reason · timestamp
```

## End-to-end flow

```mermaid
flowchart TD
    A[Request submitted] --> B[Hybrid retrieval over org corpus<br/>BM25 + embeddings]
    B --> C1[Duplicate check<br/>similarity + access log]
    B --> C2[Contradiction check<br/>Granite over decisions]
    B --> C3[Load feasibility<br/>DETERMINISTIC]
    B --> C4[No-consumer check<br/>access log analysis]
    C1 --> D[Evidence gate:<br/>drop any finding<br/>without cited record IDs]
    C2 --> D
    C3 --> D
    C4 --> D
    D --> E{Findings remain?}
    E -->|no| F[Approve · proceed with work]
    E -->|yes| G[Granite: compose pushback<br/>+ redirect proposal]
    G --> H[Requester: accept redirect<br/>or override with reason]
    H --> I[Log outcome · feed calibration]
```

### The four checks

**Duplicate.** Semantic similarity against shipped artifacts, *combined with* the access log. The combination is what makes it sharp: "this already exists" is mildly useful; "this already exists and has been opened four times in sixty days" reframes the entire request.

**Contradiction.** Granite reasons over the decision log. *"This request assumes a shared Postgres instance. The 12 August architecture decision moved this service to isolated storage."*

**Infeasible load.** Purely deterministic. The requesting team's committed work versus capacity in the requested window. No model needed, and no model wanted — this is arithmetic.

**No consumer.** Are there similar artifacts with near-zero access? Pattern evidence that this class of output doesn't get used.

### The evidence gate

**Every finding must cite specific record IDs. A finding without a citation is dropped in code.**

This single constraint is what separates SPINE from a language model being contrarian. It cannot refuse because the request "seems redundant" — it must point at the artifact, the access count, the decision, the capacity number. Refusals are auditable and arguable.

### Response composition

Pushback always carries a **redirect** — the better version of the request:

> *"This duplicates the retention dashboard shipped 14 March. Its access log shows 4 views in 60 days, all from the author. The underlying question here looks like 'which cohorts are churning fastest' — that's answerable from the existing dataset in about an hour. Want that instead?"*

Never a bare refusal. The redirect is what makes it a collaborator rather than an obstacle.

### Override

The requester can override with a reason. Overrides are logged and feed calibration — persistent overrides in a category mean the check is miscalibrated, and that shows up in the operator view.

## Evaluation harness

Forty seeded requests. Fifteen genuinely bad, each bad for a different reason across the four categories. Twenty-five legitimate.

| Metric | Target |
|---|---|
| Pushback recall (bad requests caught) | >85% |
| Pushback precision, by category | >90% |
| **False-pushback rate on the 25 good requests** | **<5%** |
| Estimated hours saved | reported |

The false-pushback rate is the credibility number. An agent that refuses everything scores perfectly on recall and is worthless. Leading with the false-positive rate signals that you know that.

## Build estimate

| Component | Days |
|---|---|
| Org corpus seed (decisions, artifacts, access logs, commitments) | 2 |
| Retrieval + four checks | 1.5 |
| Evidence gate + pushback composition | 1 |
| UI | 1.5 |
| Eval + video | 1 |

---

# 4. WARD

**Continuous regression testing for agents already running in production.**

## What it is, in one paragraph

Deployed agents get modified constantly — prompt edits, model version bumps, retrieval index rebuilds. Each of those is an untested production deploy. WARD fingerprints an agent's configuration, runs a golden task set whenever the fingerprint changes, grades the results against reference outputs using deterministic assertions plus a calibrated rubric, and applies statistical significance testing to distinguish a genuine regression from ordinary stochastic variance. When a real regression appears it alerts, isolates which task class broke, and offers rollback.

## Data model

```
Agent           id · fingerprint{prompt_hash, model_version, tool_set, index_version}

GoldenTask      id · input · reference_output · task_class
                assertions[]   ← machine-checkable where possible

Run             agent_fingerprint · task · samples[] (N per task — agents are stochastic)
                assertion_results · rubric_score

Scorecard       run · aggregate_score · per_class_breakdown · variance

Alert           scorecard · severity · affected_class · significance_p · diff
```

## End-to-end flow

```mermaid
flowchart TD
    A[Register agent · fingerprint config] --> B[Author golden set:<br/>inputs + reference outputs + assertions]
    B --> C[Baseline run · N samples per task<br/>establish per-class distribution]
    C --> D[Monitor fingerprint]
    D --> E{Config changed?}
    E -->|yes| F[Auto-trigger run]
    F --> G[Deterministic assertions first<br/>free · exact]
    G --> H[Granite rubric grader<br/>for subjective remainder]
    H --> I[Significance test vs baseline<br/>bootstrap / Welch]
    I --> J{Significant drop?}
    J -->|no| K[Record · update trend]
    J -->|yes| L[Alert: severity + affected class]
    L --> M[Drill-down: which tasks flipped<br/>old vs new output diff]
    M --> N[One-click rollback to last green]
```

### Why multiple samples per task

Agents are stochastic. A single run before and after a change produces a diff that is mostly noise. WARD runs N samples per task to establish a *distribution*, then tests whether the post-change distribution is genuinely lower.

This is the technical heart of the project and the reason it isn't trivial. Without it you have a diff tool with a false alarm rate high enough to be ignored within a week — which is exactly how real monitoring dies.

### Grading strategy

**Deterministic assertions first.** Wherever the output is machine-checkable — valid JSON, required field present, correct tool invoked, numeric match within tolerance — assert it. Free, exact, no model involved.

**Granite rubric grader for the remainder.** The genuinely subjective portion — tone, completeness, reasoning quality. The rubric is versioned, and the grader itself is validated against human labels on a held-out set so its agreement rate is a known quantity.

Being explicit that the LLM judge is validated rather than assumed is a strong differentiator. Most systems that use a model as grader never check whether the grader is any good.

### Significance testing

Bootstrap resampling or Welch's t-test per task class, comparing post-change samples against the baseline distribution. Only statistically significant drops raise alerts, and the p-value is shown in the alert.

### Drill-down and rollback

An alert names the affected task class, lists the specific tasks that flipped, and shows old-versus-new output side by side. Rollback reverts to the last green fingerprint.

## Evaluation harness

Inject known regressions of controlled severity, and — critically — run repeatedly with *no* change to measure false alarms.

| Metric | Target |
|---|---|
| Detection rate, 15% regression | >95% |
| Detection rate, 5% regression | >80% |
| Detection rate, 2% regression | >50% (report honestly) |
| **False alarm rate (no change)** | **<5%** |
| Time to detection | ~4 min vs. weeks for downstream discovery |

Reporting the 2% detection rate honestly, including that it's the hard case, is more persuasive than claiming perfection. Judges have seen enough demos to distrust a clean sweep.

## Build estimate

| Component | Days |
|---|---|
| Golden set + assertions | 1.5 |
| Run harness + sampling | 1 |
| Rubric grader + validation | 1 |
| Statistical layer | 1 |
| Dashboard + drill-down + rollback | 1.5 |
| Eval + video | 1 |

---

# Tier 2 — abbreviated

## KEEL — tacit knowledge extraction from legacy systems

Ingests a legacy codebase alongside whatever institutional history exists (commit messages, ticket references, code comments, change records). For each non-obvious construct — an odd validation, a hardcoded exception, a defensive branch — it reconstructs a *why* hypothesis with cited evidence, flags what it cannot explain, and generates targeted interview questions for the people who still know. Output is a living document that gets more complete as those questions are answered.

The interesting inversion: its most valuable output is not the answers, it's the **ranked list of things nobody can explain any more** — a prioritized map of institutional knowledge already lost.

**Strongest IBM tie on the slate** — mainframe and COBOL modernization is a major IBM business line facing exactly this attrition problem. **Tier 2 only because** a credible demo needs a real legacy system with real institutional history; synthesizing both convincingly in seven days is a stretch, and an unconvincing one undermines the premise. Promote it immediately if you have real access.

## TWIN — simulate the process change before making it

Models a business process as a graph of steps, actors, queues, and handoffs, fitted to historical data. Proposed changes are simulated by running agents through the modified process against replayed history, surfacing where work queues, where it breaks, and where cost increases. Output is a distribution of outcomes with named failure modes, not a point estimate.

Highest technical ceiling on the slate. **Tier 2 because it is comfortably a three-week build** — a seven-day version is shallow enough to read as a toy, which is worse than a deep version of something smaller. Viable only with 4–5 people who can genuinely parallelize.

---

# Comparison

| | BENCH | RELAY | SPINE | WARD |
|---|---|---|---|---|
| Whitespace | Total — no multi-party tools in field | Total — nothing treats handoff as product | Strong — inverts field premise | Strong — nobody measures anything |
| Business problem | Utilization + attrition, dollar-denominated | Blocks enterprise agent deployment | Waste at the request layer | Silent quality decay |
| IBM tie | Very strong (Consulting scale) | Very strong (regulated-industry adoption) | Generic large-org | Strong (must complement watsonx.governance) |
| Demo legibility | **Excellent** — human conflict | Good — somewhat abstract | **Excellent** — memorable refusal | Fair — infrastructure is cold |
| Headline metric | +34% joint utility, **0 leaks** | Confidently-wrong 23% → 4% | 13/15 caught, 1 false positive | 4 minutes vs 3 weeks |
| Hardest part | Disclosure filter | Calibration | Corpus authoring | Statistics |
| 7-day risk | Low | Medium (calibration) | Medium (corpus) | Medium-high (statistics) |

**Recommendation: BENCH**, with RELAY's escalation as its no-valid-trade path and SPINE's evidence-citation discipline as its constraint-rejection rule. Fallback to RELAY if the team is smaller than three.
