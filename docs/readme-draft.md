# README draft

Draft content for the five sections the challenge requires in `README.md`.
`README.md` is yours — this file is a handover, not an edit. Copy what works,
rewrite what does not.

Required by the challenge submission page: problem statement · solution
description · AI approach and architecture · selected challenge theme · how
IBM Bob was used.

Section 5 is left for you to write, because only you know what Bob actually
did. What it needs is described at the bottom.

---

## 1. Problem statement

AI made everyone faster at producing code. It also created a second job:
checking, correcting, and rejecting what the AI produced.

That second job is real labour. It takes hours, it falls on the most
experienced people on a team, and it appears in no metric anywhere.

So the dashboards say something absurd. Developers estimate roughly a third
of the working day now goes to AI-related work invisible to productivity
tooling. 81% of engineering leaders report that code review time has gone up
since deploying AI. Feature-branch throughput rose 59% year over year while
median-team main-branch throughput *fell*, and task time-in-progress rose
225%. Meanwhile the dashboard counts more commits and more pull requests, and
concludes that everything improved.

The consequence is an inverted incentive. The engineer who rejected a bad
migration on Tuesday shipped nothing on Tuesday. The engineer who merged it
shipped a feature. One of them prevented an incident and one of them caused
it, and every standard productivity metric ranks them in exactly the wrong
order.

Verification work is invisible because its product is an absence — the bug
that never shipped, the bad merge that never happened. There is nothing to
point at, so nothing gets counted.

## 2. Solution description

LEDGER counts the absence.

Point it at a public GitHub repository and it reads the review history,
finding **prevented events**: places where a reviewer left a comment anchored
to specific lines, and a later commit changed those exact lines before merge.
The line anchor is what makes it evidence rather than correlation — not
"someone commented and later something changed," but "someone pointed here,
and here changed."

It reports three things:

1. **A prevented-events log.** Every intervention, ranked by blast radius,
   each row linking out to the actual review comment and the actual commit
   that changed the lines it pointed at.
2. **Output against prevention.** Each contributor's shipping rank plotted
   against their prevented-events rank, with the Spearman rank correlation
   stated as a number.
3. **Review cycles over time.** Median review rounds per pull request per
   quarter — the verification burden, counted rather than estimated.

Three study repositories load instantly from precomputed results. Any other
public repository can be analysed live, streaming each prevented event as the
model classifies it.

**Every figure on screen traces to a diff you can open.** That is the design
constraint the whole project is built around, and it is why three more
dramatic claims were deliberately cut — see section 3.

## 3. AI approach and architecture

**The split: deterministic code proves what happened, IBM Granite judges what
kind of thing it was.**

Detection is ordinary code, and has to be — the entire value of the number is
that it is trustworthy, and a language model cannot guarantee that. Parsing
unified diffs, matching a comment's line anchor against the lines a later
commit modified, counting review rounds, computing rank correlation: all
deterministic, all checkable.

Granite does the part no heuristic can. Given a review comment, the code it
pointed at, and the diff that followed, it decides: substantive catch, or
style nit? A heuristic sees a change request. A model reads the thread and
sees that someone noticed a retry loop with no jitter would synchronise every
caller against a rate-limited endpoint.

**We measured whether that judgment is any good, rather than assuming it.**
50 review threads were hand-labelled blind by the team, then scored against
both Granite and a keyword-only classifier. All three numbers are reported in
the app — including the case where the baseline wins.

```
Browser
  ├── cached study repos ──→ /api/cached ──→ precomputed JSON
  └── any repo, live ──────→ /api/run (SSE)
                                 │
                                 ├─ fetch    GitHub REST: PRs, review comments, commits
                                 ├─ detect   line-anchored comment → lines later modified
                                 ├─ granite  watsonx: substantive catch or style nit
                                 ├─ severity blast radius from file path
                                 └─ cycles   review rounds per PR, by quarter
```

Next.js 16 and TypeScript on Vercel. The live path streams over
`text/event-stream`, emitting one event per classification, which removes the
serverless timeout ceiling and makes the filling log part of the demo. No
database: static JSON for the study repos, Vercel KV for rate limiting and
run caching.

### What LEDGER refuses to claim

Three claims were cut during design because the data cannot support them.
They are listed here because the omissions are deliberate, and because each
one had a more impressive version we chose not to ship:

- **That a given pull request was AI-generated.** Authorship detection is
  unreliable. LEDGER measures verification labour and its trend; it never
  labels a pull request's author.
- **What a prevented bug would have done.** The bug did not ship, so no
  evidence exists about its consequences. Severity is reported as observable
  blast radius — the file path it landed in — instead.
- **Engineer-hours spent reviewing.** GitHub records timestamps, not effort,
  and the gap between opening and merging is mostly people sleeping. Review
  *rounds* are counted instead: a discrete thing that happened, which you can
  point at.

## 4. Selected challenge theme

**Wildcard Challenge — Build Intelligent Systems for the Future of Work.**

The theme asks for systems that help teams achieve better outcomes through
intelligent automation and decision support. LEDGER is decision support for a
decision leaders are currently making blind: whether an AI rollout is working,
and who on the team is actually protecting it.

It fits the "future of work" framing directly. AI changed what work *is* — it
converted a large share of engineering from producing to verifying — and the
measurement systems did not follow. LEDGER is the missing instrument.

## 5. How IBM Bob was used

*Yours to write. `bob-log.md` holds the raw material; this section is its
condensed form.*

What it needs to cover:

- **What Bob built.** The analysis engine in `ledger/lib/ledger/` — the
  GitHub fetch layer, the prevented-event detector, the watsonx Granite
  integration, the keyword baseline, severity scoring, and cycle counting.
  That is the AI core of the project, not its periphery.
- **How you worked with it.** The pattern was context first (Bob reads
  `ARCHITECTURE.md` and the type contract before writing), then
  implementation, then tests — which mirrors the framing IBM uses for Bob
  itself: understand the problem, design the solution, build the software.
- **Something specific Bob got right, and something you had to correct.** A
  section that only praises reads as marketing. One concrete example of each
  is worth more than a page of adjectives, and it is the part a judge will
  believe.
- **The division of labour, stated plainly.** Bob built the engine; the
  interface and deployment were built separately. Say so directly — the git
  history shows it either way, and a README that matches the history is
  worth more than one that overstates.
