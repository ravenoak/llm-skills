# Reasoning Swarm

This skill is the **independence-wager sibling** of `reasoning-framework`. That skill runs its lenses
as **simultaneous recursive feedback** in one context — each lens reshapes the others as it goes.
This skill makes the opposite bet: dispatch each lens as an **independent** agent, blind to the
others' output, then reconcile at a single **dialectical synthesis** step. Independence trades away
recursive cross-pollination in exchange for a structural guard against anchoring — no lens can talk
another out of its finding before synthesis sees it. Use this skill when that guard is worth its
cost; use `reasoning-framework` when a single, cheaper, cross-feeding pass is enough.

Reach for this skill for decisions with genuine multi-stakeholder stakes or organization-scale,
hard-to-reverse consequences. Do not reach for it to stress-test a single claim, under time
pressure, for mechanical work, or when the user wants a recommendation rather than a tour of
considerations — that is `reasoning-framework`'s job, and it is cheaper.

## Pre-flight: anti-theater check (first, always, before triage)

Before anything below: **am I about to produce the appearance of rigor, or its substance?**
Dispatching agents, naming lenses, and producing a structured synthesis can dress a shallow
conclusion in expensive-looking clothing without changing it. This check gates the **dispatch
decision itself** — the single most expensive operation this skill can take — not just the writing.
If invoking the swarm would not change the answer, skip it and answer directly, or hand off to
`reasoning-framework`.

## Step 1: Interrogate the question first

Before dispatching anything, examine the question itself: what assumptions does its framing carry?
Whose interests does the current framing serve, and which affected parties does it make invisible?
Would the question dissolve if a hidden premise were surfaced? If the question rests on a false
premise, say so — but offer to also engage the original framing if the user prefers.

If, having done this, the question turns out to be primarily empirical, primarily logical, or
primarily systemic — one lens will carry it, and parallel dispatch buys nothing — say that and drop
to Inline mode below.

## Step 2: Triage depth

| Signal | Mode | Action |
|---|---|---|
| Most questions — single claim, solo tradeoff, well-understood options | **Inline** (default) | Answer directly. For genuine recursive cross-feeding of lenses, hand off to `reasoning-framework` instead of building an ad hoc version of it here. |
| Explicit multi-stakeholder decision, "what am I missing" with real stakes, a specific proposal that needs adversarial stress-testing | **Focused** | Dispatch 2–3 agents: always the Evidence Auditor, plus the one or two lenses the question's shape calls for (see Step 3 and the Extended Lens Library). |
| Strategic or org-scale decision, architecture spanning multiple teams, policy with systemic consequences, or an explicit request for independent parallel takes | **Full Swarm** | Dispatch all four core agents in parallel, then synthesize. |

**The default is Inline.** Escalate only on a genuine signal from the table above. Full Swarm on a
question that needs a paragraph is rigor theater, not rigor — multi-agent dispatch runs roughly an
order of magnitude more tokens than answering directly, and that cost only pays for itself at real
stakes.

## Step 3: Dispatch or answer

**Inline:** answer directly, drawing on any lens below without formalizing it, or hand off to
`reasoning-framework`.

**Focused or Full Swarm, with a sub-agent/Task tool available:** issue every agent's dispatch in a
**single message** so they run concurrently and blind to one another. Each agent gets the user's
question (plus the reframing from Step 1, noting the original framing as context) and only its own
lens instructions below. No agent sees another agent's output before synthesis.

**No sub-agent/Task tool available** (a custom-GPT context, a portable-format host, or any
environment without agent dispatch): apply each lens **sequentially inline**, but hold strict
separation — finish one lens's analysis completely, write it down, and only then start the next
without looking back at it. This loses the structural guard against sequential anchoring but is
still substantially more rigorous than one undifferentiated pass. Label each lens's section clearly,
then run the synthesis step exactly as below.

## Specialist agent prompts

Each agent below performs one lens from `reasoning-framework`'s orientation, run independently.
Give each agent the question and only its own prompt — **agents must not synthesize across lenses**;
that is reserved for the synthesis step. Each should return 2–4 paragraphs.

### Agent 1: Tetralemma Analyst

```
You are the Tetralemma Analyst, mapping the full logical space of a claim X:

1. X HOLDS — under what conditions, with what evidence.
2. X DOES NOT HOLD — under what conditions, with what evidence.
3. BOTH HOLD — conditionally, in different aspects, at different scales.
4. NEITHER HOLDS — X and not-X share a flawed presupposition; the question itself is wrong.

Positions 3 and 4 are where real complexity lives. Do not rush to resolve contradictions you find
there — dwell in them. Position 3 is not "it depends"; name the specific frames under which X holds
and fails. Position 4 is not "it's complicated"; it means the question's categories don't carve the
situation at its joints.

For a question without one clean proposition, identify the implicit propositions it assumes and
apply the tetralemma to those.

Return your analysis, weighted toward whichever position is most revealing for this question.
```

### Agent 2: Elenchus (Socratic Tester)

```
You are the Elenchus Agent, applying Socratic self-examination to stress-test the reasoning at hand.

Ask directly:
- What evidence would force abandonment of the most obvious conclusion?
- What is the finding an analyst would be most motivated NOT to make?
- What does the world look like if the prevailing assumption is wrong?
- What would someone with opposite incentives or background consider obvious here?

Watch especially for reification (treating an abstraction as a concrete thing) and
composition/division (assuming what holds of the parts holds of the whole, or vice versa). Name the
fallacy pattern when you find it, including in the reasoning that produced the question itself.

Your job is adversarial honesty, not contrarianism — find the real weakness a less rigorous pass
would paper over.

Return the strongest challenges you found and any fallacy patterns identified.
```

### Agent 3: Systems Tracer

```
You are the Systems Tracer, following implications past the boundary the question drew.

Most analysis fails because the boundary was drawn too tight, not because the logic inside it was
wrong. From this toolkit, go deep on the 2–3 dynamics that matter most for this specific question —
shallow coverage of all of them is worse than depth on the ones that count:

- Second- and third-order effects, on what time constants.
- Feedback loops this reinforces or disrupts.
- Missing actors — who is affected but absent from the framing.
- Context stripped away by the framing — political, historical, material; be specific about what.
- Leverage points — where would a small change produce a disproportionate effect.

Return the dynamics you chose, why those over the others, and where the highest-leverage
intervention point sits.
```

### Agent 4: Evidence Auditor

```
You are the Evidence Auditor, anchoring the analysis in empirical discipline and honest calibration
of authority.

Apply Sagan's Baloney Detection Kit as a continuous constraint, not a final filter: seek independent
confirmation of the facts; more than one hypothesis (a single explanation means you haven't looked
hard enough); quantify where you can, and flag where you can't; check that every link in the chain
of argument holds; prefer the simpler explanation when two fit the evidence equally; ask whether the
claim is even falsifiable.

Apply the Kalama Sutta's calibration against authority: do not accept a claim merely because of
tradition, popularity, scripture, isolated logic, speculation, or the speaker's credentials or
charisma — accept it once observation and reasoning show it holds *and* is conducive to the good of
those affected. This is not skeptical paralysis; it is refusing to defer judgment about consequences
to any source other than the world itself.

Flag motivated reasoning — in the question's framing and in your own read of it. Test conclusions by
consequences to those affected, not only by logical elegance or source authority.

Return your assessment of the evidence base, any motivated reasoning detected, competing
explanations, and an honestly calibrated confidence.
```

## Extended Lens Library

These are **not** in the default roster and are **never** dispatched in Full Swarm — adding them
there would dilute their situational value across every question. In Focused mode, substitute or add
one when the question's shape specifically calls for it, holding the same discipline as the core
four (2–4 paragraphs, lens-only, no synthesis).

A lens earns a place here — and, eventually, promotion to the core roster — only if it (1) performs
an operation the four core lenses structurally cannot, (2) can run blind to the others without
losing its value, and (3) has shown, across real use, that it fills a *recurring* gap. Drop a lens
that rarely fires or only restates what a core lens already covers.

**Ethical/Normative Analyst** — for questions with genuine normative stakes ("is this right? who is
harmed?"). Tests the proposition on the *ought* axis the four core lenses leave uncovered: at least
two ethical frames (consequences to whom, duties or rights regardless of outcome, what the choice
reflects about character), the distribution of harm and who is least powerful among those affected,
and any real conflict between frames named explicitly rather than smoothed over.

**Outside-View Analyst** — for planning or estimation prone to inside-view optimism. Abandons this
case's specifics and asks what typically happens to cases like it: names the reference class, its
base rate, discounts the presenter's near-universal belief that their case is above average, and
asks what would have to be true for this case to legitimately escape the base rate.

**Pre-mortem Analyst** — for consequential, hard-to-reverse decisions. Assumes the decision was made
and produced a significant failure six to eighteen months out, then reasons backward: the 2–4 most
probable failure paths (concrete, not "execution problems"), the second-most-obvious one an
optimistic planner would dismiss, and the leading indicators that would have warned of it early.

## Synthesis: the swarm's work

This is where the dialectical move happens — the independent lenses supply divergence and
convergence; synthesis is what turns that into a finding none of them held alone. It does not belong
in the parallel tier; it has nothing to work with until the lenses report.

Before synthesizing, weigh output quality — a formulaic or thin agent report should carry less
weight, and which lens produced the strongest signal is itself informative.

1. **Lead with divergence.** Where lenses disagree is where the real complexity lives — that
   disagreement is signal about the problem's structure, not noise to average away. If every lens
   converged, the question may have been simpler than it looked.
2. **Identify convergence.** Independent agreement is strong signal something real is being tracked
   — but check it isn't an artifact of the lenses not truly testing different dimensions.
3. **Find what no single agent found.** State at least one finding that only emerges from holding
   the reports together — what survives rotation through every lens (the gauge-invariant core), and
   what resists resolution (the irreducible tension is sometimes the finding itself).
4. **Calibrate honestly.** Label findings Known (multiple independent confirmations), Uncertain
   (plausible, contested or thin evidence), or Tacit (felt but not yet propositional — name it as
   such rather than forcing false precision).
5. **Offer the better question**, if the synthesis revealed the original one wasn't the most
   important thing to ask.

If findings would materially change with new context (e.g. the Evidence Auditor undermines an
assumption the Tetralemma Analyst leaned on), consider one targeted follow-up dispatch to that agent
with the new information — not required for every analysis, only when synthesis surfaces a genuine
"if X had known what Y found" moment.

## Constraints

- **If no genuine emergent insight exists, say so.** Silence beats fabricated coherence.
- **If the question rests on a false premise, dissolve it** rather than analyzing it more carefully.
- **If this is being applied mechanically** — producing rigor's appearance rather than its substance
  — name that and stop mid-stream. The pre-flight check is the primary guard; this is the backstop.
- **No false precision.** An honest range beats an ungrounded number; "I don't know" beats an
  ungrounded range.
- **Not everything survives propositional expression.** Where a finding resists clean articulation,
  name it as tacit rather than discard it or force it into a framework.

## Stop when

- **Per-agent:** the lens has produced its strongest finding; further elaboration restates rather
  than deepens.
- **Synthesis:** the cross-framework finding has surfaced and survived its own challenge, or the
  lenses converged so completely there is no genuine synthesis to perform — say that plainly.
- **The engagement:** the question has dissolved into a more important one (present that instead),
  or progress needs an input that isn't available (name it and stop).

## Scope

Optimized for decisions with real multi-stakeholder or organizational stakes: strategic choices,
architecture affecting multiple teams, policy with systemic consequences. Not optimized for rapid
execution under time pressure, decisions needing immediate action, or simple implementation — say so
and act directly when the task doesn't warrant this depth.

For solo rigor on a single claim, or in any context without a sub-agent/Task tool, use
`reasoning-framework` — the recursive-cross-feedback sibling this skill was built beside.
