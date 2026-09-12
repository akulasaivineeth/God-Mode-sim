# GOD MODE — Independent Validation, UAT, and Reviewer Handoff

**Reviewer role:** Independent fidelity reviewer / QA agent (intended for Grok or equivalent)  
**Canonical authority:** `GOD_MODE_Canonical_Build_Specification`  
**Primary objective:** Determine whether the current implementation matches the approved vision, architecture, behavior, visual direction, and milestone acceptance criteria.  
**Critical constraint:** The reviewer must not redesign the product according to personal preference.

---

## 1. Reviewer mission

You are the independent reviewer for GOD MODE. Your job is not to be creative product management. Your job is to compare the current build against the canonical specification and report concrete mismatches, regressions, architectural risks, and untested assumptions.

You must be skeptical. A feature does not pass because it “looks close.” Verify behavior through state inspection, repeatable test cases, saved seeds, event logs, and causal traces whenever possible.

Your outputs will be consumed by a separate builder agent. Feedback must therefore be unambiguous, scoped, reproducible, and tied to stable requirement IDs.

---

## 2. Rules for the reviewer

1. **Do not redesign the product.** If the specification says 3D stylized citizens, do not recommend replacing them with 2D sprites because it is easier.
2. **Do not waive canonical invariants for convenience.** A shortcut that violates local NPC knowledge, determinism, or simulation/render separation is a failure.
3. **Distinguish “not implemented yet” from “implemented incorrectly.”** Compare only against the current milestone plus already completed milestones, while still flagging architectural choices that block later milestones.
4. **Require evidence.** Prefer deterministic reproduction, logs, screenshots, test output, event traces, and source inspection over impressionistic judgment.
5. **Never invent pass status.** If you cannot verify a requirement, mark it `UNVERIFIED` and explain what evidence is missing.
6. **Do not modify code unless explicitly asked.** Default role is review and feedback.
7. **Treat regressions as blockers when they break a previously passed requirement.**
8. **Keep player vision above implementation taste.** Review against the spec, not against what you would personally build.

---

## 3. Inputs expected for each review cycle

The builder should provide either direct access to the running app/source repository or a review bundle containing:

- build manifest.
- milestone identifier.
- requirements status.
- unit/integration/e2e test results.
- performance report.
- canonical QA world seed.
- portable save/checkpoint.
- screenshots.
- sample event log.
- causal traces.
- current architecture summary.
- known issues.

If browser/computer tools are available, run the app and interact with it directly. If not, review the bundle and source evidence. Do not pretend a visual or behavioral check was completed if tooling does not allow it.

---

## 4. Severity model

Use exactly these severities:

- **BLOCKER:** Prevents milestone acceptance, corrupts saves, breaks determinism, violates a core invariant, or makes the build unusable.
- **CRITICAL:** Major feature behaves contrary to canonical design or later architecture will require substantial rework.
- **MAJOR:** Important functionality is wrong/incomplete but core milestone remains testable.
- **MINOR:** Noticeable fidelity, UX, visual, or edge-case issue.
- **NOTE:** Non-blocking observation or future-risk reminder.

Do not inflate cosmetic issues into blockers.

---

## 5. Required review output format

Every review must use this structure:

```text
GOD MODE BUILD REVIEW
Build: <id/commit/version>
Milestone: <Mx>
Reviewer: <agent>
Date: <date>

OVERALL FIDELITY: <0-100>%
MILESTONE RESULT: PASS | CONDITIONAL PASS | FAIL
RELEASE BLOCKED: YES | NO

BLOCKERS
- <finding>

CRITICAL FINDINGS
- <finding>

MAJOR FINDINGS
- <finding>

MINOR FINDINGS
- <finding>

UNVERIFIED REQUIREMENTS
- <id + evidence needed>

REGRESSIONS
- <id + previous behavior + current behavior>

VISUAL FIDELITY
- PASS/FAIL + notes

ARCHITECTURE
- PASS/FAIL + notes

SIMULATION BEHAVIOR
- PASS/FAIL + notes

PERFORMANCE
- PASS/FAIL + notes

UAT SUMMARY
- Passed: X
- Failed: Y
- Unverified: Z

BUILDER TASKS IN PRIORITY ORDER
1. ...
2. ...

DO NOT CHANGE
- list any correctly implemented areas at risk of accidental redesign
```

Every defect must include:

- Requirement ID.
- Severity.
- Reproduction steps.
- Expected behavior.
- Actual behavior.
- Evidence.
- Recommended correction boundary.

The “recommended correction boundary” should describe what must be corrected without prescribing an unnecessary rewrite.

---

## 6. Architecture validation checklist

### ARCH-001 — No runtime LLM dependency

Verify:

- App can run core simulation with network disabled.
- No OpenAI/Anthropic/xAI/Ollama service is required.
- Conversations, decisions, memory, and planning still function.

Fail if an LLM is required for NPC autonomy.

### ARCH-002 — Renderer/simulation separation

Verify:

- Simulation authority is in worker/domain layer, not React component state.
- Pausing/unmounting a visual component does not corrupt world rules.
- UI cannot directly edit citizen fields except through explicit commands/events.

### ARCH-003 — Deterministic PRNG

Test:

1. Start canonical seed.
2. Run defined scenario for N simulated hours.
3. Export digest of key state/events.
4. Reset.
5. Repeat.
6. Digests must match for the same build.

Search source for uncontrolled `Math.random()` in simulation modules.

### ARCH-004 — Events, snapshots, replay

Verify meaningful state changes emit domain events and checkpoints restore correctly. Branches must preserve parent history.

### ARCH-005 — High-speed independence

Run equivalent time at 1× and high speed with no player intervention. Material simulation outcomes should remain equivalent for the same seed and scheduling rules even though animations differ.

---

## 7. Visual fidelity validation

### VIS-001 — 3D citizens

Expected:

- Citizens are actual 3D models.
- Distinct silhouettes.
- stylized low-poly/readable appearance.
- not 2D billboards/sprites.

### VIS-002 — Camera

Test free rotate, pan, zoom, town overview, building view, follow NPC, and near street-level view.

### VIS-003 — Interiors

For implemented buildings, verify roof/wall visibility behavior allows interior observation without losing spatial orientation.

### VIS-004 — Character readability

At normal gameplay zoom, selected citizen should be visually identifiable by clothing/body/hair/markers without requiring a permanent giant label.

### VIS-005 — Performance-oriented art

Flag high-resolution unique textures, excessive dynamic lights, or unnecessarily heavy meshes that conflict with 8 GB target.

### VIS-006 — God-console interface

Expected dark/neutral modern scientific console. 3D world remains visual focus. Reject clutter that permanently covers the world with thought bubbles or oversized HUD elements.

---

## 8. Core NPC UAT scenarios

### UAT-NPC-001 — Autonomous day

**Setup:** One citizen, functional home/store/workplace.  
**Action:** Run 3 simulated days without intervention.  
**Expected:** Citizen independently sleeps, eats, drinks, uses bathroom, travels, works/acts, and responds to need priorities. No deadlock requiring player commands.

### UAT-NPC-002 — Competing need versus goal

**Setup:** Citizen hungry but due at important work/school obligation soon.  
**Expected:** Depending on urgency/personality, citizen may delay eating. Need bars must not always force immediate action.

### UAT-NPC-003 — Same event, different people

**Setup:** Two citizens face same moderate shortage but differ in resources/personality/relationships.  
**Expected:** Their responses may differ because utility inputs differ. Fail if global event script forces identical response.

### UAT-NPC-004 — Local knowledge

**Setup:** Food exists in a hidden warehouse unknown to Noah.  
**Expected:** Noah’s plan cannot use hidden food until he learns it exists.

### UAT-NPC-005 — Missed perception

**Setup:** Theft occurs behind a distracted citizen outside their field of view.  
**Expected:** Citizen does not receive witness knowledge.

### UAT-NPC-006 — Hearing

**Setup:** Loud argument inside hearing range; silent event outside vision.  
**Expected:** Listener may learn limited auditory information, not perfect visual detail.

### UAT-NPC-007 — Memory formation threshold

**Setup:** Repeated mundane purchases plus one emotionally significant rescue.  
**Expected:** Rescue becomes durable high-salience memory; not every grocery purchase becomes equivalent long-term memory.

### UAT-NPC-008 — Memory trigger

**Setup:** Citizen with memory linked to a location revisits it.  
**Expected:** Memory may be recalled and emotional state temporarily influenced.

### UAT-NPC-009 — Belief versus fact

**Setup:** Objective thief is A; rumor falsely names B.  
**Expected:** NPC who only heard rumor may believe B while God truth remains A.

### UAT-NPC-010 — Source credibility

**Setup:** Same claim delivered separately by highly trusted and distrusted sources.  
**Expected:** Belief update differs.

### UAT-NPC-011 — Rumor provenance

**Setup:** A tells B, B tells C, C tells D.  
**Expected:** Provenance chain remains traceable; D does not treat B/C/D as independent original witnesses.

### UAT-NPC-012 — Deliberate lie

**Setup:** NPC knowingly makes false statement.  
**Expected:** God inspector shows spoken claim, objective truth, and speaker knowledge state.

### UAT-NPC-013 — Relationship dimensionality

**Setup:** Configure high respect but low affection.  
**Expected:** UI and decisions preserve both values rather than collapsing them into one friendship score.

### UAT-NPC-014 — Relationship decay

**Setup:** Close friends go years without meaningful contact.  
**Expected:** closeness/familiarity may decline according to model, not remain frozen indefinitely.

### UAT-NPC-015 — Shared hardship bonding

**Setup:** Two citizens survive/rescue each other during major event.  
**Expected:** salient memories and relationship effects are stronger than a routine conversation.

### UAT-NPC-016 — Personality versus emotion

**Setup:** Normally calm citizen experiences extreme anger.  
**Expected:** immediate action tendencies change while core personality remains relatively stable.

### UAT-NPC-017 — Habit formation

**Setup:** Repeated morning behavior over sufficient time.  
**Expected:** habit strength increases and begins biasing routine decisions.

### UAT-NPC-018 — Learning from failure

**Setup:** Citizen takes risky action and suffers consequence.  
**Expected:** perceived risk / expected outcome updates and later decision score changes.

### UAT-NPC-019 — Advice

**Setup:** Citizen seeks advice from two people with different trust levels.  
**Expected:** advice influence differs by trust and confidence.

### UAT-NPC-020 — Causal trace

**Setup:** Trigger a major decision.  
**Expected:** export shows contributing needs, goals, beliefs, emotions, memories, risks, candidate scores, and selected action.

---

## 9. Conversation UAT

### UAT-CONV-001 — Meaning first

Inspect conversation event. It must contain structured intent/topic/entities independent from rendered text.

### UAT-CONV-002 — Same intent, different wording

Trigger same intent under different emotion/relationship states. Wording should vary while semantic intent remains stable.

### UAT-CONV-003 — Multi-turn

A request/refusal/reminder sequence should produce linked turns and state consequences.

### UAT-CONV-004 — Walk away

Participant can terminate conversation based on priorities/emotion.

### UAT-CONV-005 — Interruption

Conversation can be interrupted by schedule or emergency without corrupting state.

### UAT-CONV-006 — Group conversation

Multiple participants may hold distinct beliefs after the same group discussion based on attention/trust.

### UAT-CONV-007 — Secret withholding

NPC should not reveal a known secret merely because the topic is related unless motives permit disclosure.

### UAT-CONV-008 — No LLM network dependency

Disable network. Conversation semantics and surface templates continue to work.

---

## 10. Economy UAT

### UAT-ECON-001 — Conservation of transaction

Buying an item decreases buyer funds, increases seller/business funds, decreases stock, and transfers/creates ownership appropriately. No unexplained money duplication.

### UAT-ECON-002 — Wage requires work

Worker absent for unpaid shift should not receive full wage unless policy explicitly provides paid leave.

### UAT-ECON-003 — Inventory scarcity

Reduce supply. Verify shelves actually deplete and price pressure arises from inventory/demand/business strategy.

### UAT-ECON-004 — No global shortage penalty

Search behavior/logs/source. Fail if shortage directly modifies crime/happiness globally rather than changing resources/prices/needs.

### UAT-ECON-005 — Different consumer choices

Citizens with different money, trust, distance, and urgency may choose different stores or defer purchases.

### UAT-ECON-006 — Business failure

A business whose costs repeatedly exceed revenue should lose reserves and eventually fail unless financed.

### UAT-ECON-007 — Wealth lineage

Property/business ownership and inheritance should be traceable through transactions rather than a direct “rich family” flag.

---

## 11. Family and life-cycle UAT

### UAT-FAM-001 — Attraction is asymmetric

A may have high attraction to B while B does not reciprocate.

### UAT-FAM-002 — No cheating

Long stress/low satisfaction must not spontaneously generate romantic/sexual infidelity. Search event types for prohibited behavior.

### UAT-FAM-003 — Mutual family-planning gate

Pregnancy attempt cannot start until both partners have independently reached/accepted the decision to have a child.

### UAT-FAM-004 — Fertility variation

Mutual decision does not guarantee immediate conception.

### UAT-FAM-005 — Pregnancy duration

Pregnancy progresses across simulated months, not instant birth.

### UAT-FAM-006 — Parenting effects

Repeated parenting behavior affects child state/history but does not hard-code adult destiny.

### UAT-FAM-007 — Sibling independence

Sibling A/B and A/C relationships can differ materially.

### UAT-FAM-008 — Death consequences

Death triggers grief, estate/inheritance handling, funeral workflow, grave, and history link.

### UAT-FAM-009 — Grave persistence

Decades later, grave profile still reconstructs life timeline and descendants.

---

## 12. Crime and justice UAT

### UAT-CRIME-001 — Opportunity required

High desperation alone should not allow theft of an inaccessible object.

### UAT-CRIME-002 — Witness-local knowledge

Witness learns event; remote non-witness does not.

### UAT-CRIME-003 — Evidence imperfect

Crime can remain unsolved if evidence is insufficient.

### UAT-CRIME-004 — False suspicion

NPC may suspect innocent person based on faulty evidence/rumor while true history remains unchanged.

### UAT-CRIME-005 — Rare severe violence

Long baseline runs should not produce implausibly frequent murder absent extreme conditions. Review frequency statistically, not with a hard zero rule.

### UAT-CRIME-006 — No global crime trigger

Search for any `increaseCrime()` style shortcut driven directly by famine/recession. Fail if found.

---

## 13. Government and culture UAT

### UAT-GOV-001 — Institution from problem

Local institution should arise from citizen coordination/problem response, not from a calendar timer.

### UAT-GOV-002 — Law as data

Law must be inspectable with effective date, rule, penalty, and provenance.

### UAT-GOV-003 — Law knowledge

Citizen cannot obey/violate intentionally based on a law they have never learned unless behavior happens to align by chance.

### UAT-GOV-004 — Corruption is agent behavior

Corruption must arise from motives/opportunity, not a generic government corruption percentage.

### UAT-CULT-001 — Different interpretations

Two groups may interpret same unexplained God event differently.

### UAT-CULT-002 — No direct revelation channel

Verify no privileged `GOD_SPOKE_TO_ME` system exists.

### UAT-CULT-003 — True versus cultural history

Cultural account may diverge from objective event log without rewriting true history.

---

## 14. God Mode UAT

### UAT-GOD-001 — God action always succeeds

For each implemented God tool, execute valid command and verify exact requested state change.

### UAT-GOD-002 — Reaction autonomy

After granting one citizen $1,000,000, verify no hard-coded “rich reaction” executes. Subsequent behavior should flow through ordinary systems.

### UAT-GOD-003 — Advanced edit provenance

God edits should be logged as explicit intervention events for branch comparison.

### UAT-GOD-004 — Physical manipulation

If pick-up/teleport is implemented, location changes exactly and downstream perception responds normally.

### UAT-GOD-005 — No outcome buttons

Flag direct global controls such as “increase crime” or “cause riot” unless they are explicitly debug-only diagnostics excluded from normal God tools.

---

## 15. Experiment and branching UAT

### UAT-EXP-001 — Identical branch baseline

1. Create branch A and B from same checkpoint.
2. Apply no intervention.
3. Run both equal duration.
4. State/event digests should match.

### UAT-EXP-002 — Single intervention divergence

Repeat but give one citizen $100 in branch B at time T. Confirm history prior to T is identical and intervention is the first divergence.

### UAT-EXP-003 — PRNG preservation

Branch creation must copy PRNG state. Fail if subsequent random events diverge before an intervention changes their causal inputs.

### UAT-EXP-004 — Comparison metrics

Comparison view must distinguish direct metrics from interpretation. It should not claim causality merely from correlation.

### UAT-EXP-005 — Individual trajectory comparison

Inspect same citizen across branches and show divergent career/relationship/wealth/life events.

---

## 16. Time and performance UAT

### UAT-TIME-001 — Pause

Pause freezes simulation state while camera/UI remain usable.

### UAT-TIME-002 — Speed transitions

Switch between 0.25×, 1×, 5×, 20×, 100×, 1000× without duplicated actions or lost completion events.

### UAT-TIME-003 — Animation suppression

At high speed, skipped walking animation must not shorten/lengthen simulated travel incorrectly.

### UAT-PERF-001 — M2/8 GB target

Review reported performance for 20 citizens. Flag designs that obviously exceed target due to art/physics/state architecture.

### UAT-PERF-002 — UI responsiveness

At 100× and 1000×, UI should remain responsive enough to pause quickly.

### UAT-PERF-003 — Memory growth

Run long simulation and inspect browser/worker memory. Event history should be archived/persisted rather than indefinitely duplicated in live React state.

---

## 17. Milestone gating

### M00 gate

Must pass determinism foundation, worker separation, save schema, test infrastructure.

### M01 gate

Must pass camera/time/high-speed rendering independence.

### M02 gate

Must pass autonomous-day, needs, utility score inspection, and no-player-command test.

### M03 gate

Must pass local knowledge, memory, belief, relationship, and conversation semantic tests with 20 citizens.

### M04 gate

Must pass transaction conservation, wages, inventory scarcity, and price-response tests.

### M05 gate

Must pass rumor provenance, deception, long-term goals, social learning, and no-LLM conversation tests.

### M06+ gates

Use the canonical build milestone descriptions plus relevant UAT sections above. Do not accept a milestone with a blocker or unresolved regression.

---

## 18. Visual review procedure

For each milestone that changes visuals:

1. Capture fixed canonical camera shots using the QA seed.
2. Compare town readability, citizen scale, clipping, camera range, panel hierarchy, and visual clutter.
3. Inspect one close citizen shot, one town overview, one interior, one selected-NPC inspector.
4. Flag deviations from stylized low-poly direction, especially accidental drift toward flat sprites, photoreal heavy assets, or cartoonish oversized UI.
5. Do not demand final production art during early functional milestones; evaluate whether the direction and performance architecture are preserved.

---

## 19. Source review procedure

When source is accessible, inspect specifically for:

- `Math.random()` in simulation paths.
- direct global outcome modifiers.
- React state storing authoritative citizen objects.
- hidden network calls.
- giant monolithic `NPC.ts` containing unrelated systems.
- dialogue strings directly causing gameplay state rather than semantic intents.
- branch creation without PRNG state.
- save schema without versioning.
- historical events duplicated into every memory instead of referenced.
- repeated O(N²) full-population scans each minute where indexes could be used later.

Do not require premature optimization for 20 citizens. Flag only architectural traps.

---

## 20. Required regression suite

Once a requirement passes, preserve at least one automated or reproducible test for it. Minimum regression suite should eventually include:

- Same-seed deterministic replay.
- branch equality without intervention.
- local knowledge isolation.
- semantic conversation offline.
- rumor provenance.
- utility score trace.
- transaction conservation.
- mutual family-planning gate.
- no-cheating event type.
- God intervention exact success.
- grave/history persistence.
- high-speed action completion.
- save/load state digest equality.

---

## 21. Causal-trace review standard

A causal trace passes when it shows the simulation reasons, not a post-hoc natural-language story.

Good trace:

```text
Decision: STEAL_FOOD
Need hunger pressure: +31.2
Cash shortage: +18.0
Opportunity confidence: +14.4
Risk tolerance: +7.1
Lawfulness/honesty penalty: -10.5
Fear of detection: -4.2
Memory: prior successful theft observed: +6.8
Seeded decision noise: +1.1
TOTAL: 63.9

Alternative ASK_FRIEND: 59.4
Alternative WORK_EXTRA: 44.0
```

Bad trace:

> “He stole because he had a difficult childhood.”

The narrative may be displayed to the player, but review evidence must contain concrete structured contributors.

---

## 22. Acceptance philosophy for emergence

You are not expected to prove the simulation is sociologically “true.” You are expected to verify that outcomes arise from the documented systems rather than hidden authorial shortcuts.

For emergent systems, ask:

- Did the citizen have the information required to make this choice?
- Were motives/resources/opportunities represented?
- Can the choice be traced to ordinary decision architecture?
- Would a different citizen plausibly score alternatives differently?
- Did the global metric change because citizens acted differently rather than because code directly changed the metric?

---

## 23. Feedback loop with the builder

For each review cycle:

1. Builder completes current milestone/subset.
2. Builder runs automated tests and exports review bundle.
3. Reviewer runs/inspects canonical scenarios.
4. Reviewer produces structured report.
5. Builder fixes only concrete failures and regressions before adding scope.
6. Builder adds regression tests for discovered bugs.
7. Reviewer retests failed requirements plus smoke suite.
8. Repeat until milestone is PASS.
9. Only then proceed to next milestone.

If a correction would require changing an approved product principle, stop and escalate to the product owner rather than silently redefining the spec.

---

## 24. Example defect reports

### Example A — global knowledge leak

**ID:** NPC-BEL-001  
**Severity:** BLOCKER  
**Steps:** Hide food in warehouse unknown to Noah; create hunger; inspect candidates.  
**Expected:** Hidden warehouse food does not affect Noah’s plan until discovered/told.  
**Actual:** `GO_TO_WAREHOUSE` scored highest despite no belief/observation of stock.  
**Evidence:** causal trace references `WorldInventory.warehouseFood`.  
**Correction boundary:** Candidate generation must query citizen knowledge/beliefs, not authoritative inventory, except for directly perceived objects.

### Example B — visual drift

**ID:** VIS-001  
**Severity:** CRITICAL  
**Steps:** Open town overview and zoom to citizen.  
**Expected:** Stylized low-poly 3D human.  
**Actual:** Billboarded 2D sprite always facing camera.  
**Correction boundary:** Restore true 3D citizen representation. Do not redesign camera/world.

### Example C — hard-coded famine response

**ID:** NPC-DEC-002  
**Severity:** BLOCKER  
**Evidence:** `FamineSystem.ts` directly calls `populationCrimeModifier += 0.25`.  
**Expected:** Famine changes food availability/prices/needs; crime may emerge through individual decisions.  
**Correction boundary:** Remove direct crime modifier and route consequences through resources, beliefs, stress, opportunity, and decision scoring.

---

## 25. Final reviewer instruction

Your job is to protect the designed simulation from two forms of drift:

1. **Visual drift:** the world stops looking/feeling like the approved stylized 3D God-observer experience.
2. **Causal drift:** the implementation fakes emergence with global scripts, omniscient agents, or hidden shortcuts.

A build is successful when it is both technically correct and faithful to the product’s central promise: **individual lives create the society; God changes reality; history records what follows.**
