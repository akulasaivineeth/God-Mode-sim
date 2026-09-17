# WF02 Plan Revision 15.3 — Framing & Footprint Strategy Decision Plan

**State:** WAITING_FOR_CHATGPT_PLAN_APPROVAL  
**Supersedes:** Plan revision 15.2 Candidate C Phase 0 @ `cee6f3b848bff852c862be4337864e929f29e4aa` — **CANDIDATE_C_PHASE_0_FAIL (MAE gate)**  
**Senior arbitration:** `[GOD-MODE:CHATGPT-DECISION]` @ `cee6f3b` — **FIX_REQUIRED — STRATEGY CHANGE REQUIRED**  
**Investigation base SHA:** `cee6f3b848bff852c862be4337864e929f29e4aa`  
**Implementation SHA (Candidate C):** `85ded0397eb4945b1b36d69cf6dcc4f6e50a7268`  
**Branch:** `cursor/wf02-scale-calibration-754a`  
**Scope:** PLAN ONLY — no Candidate D/E Phase 0 build, production wiring, merge, Grok review, new asset family, or M03 until `[GOD-MODE:CHATGPT-PLAN-DECISION] Decision: APPROVED_TO_BUILD`

---

## 1. Work item

WF02 — North-Star Scale & Aesthetic Calibration.

R15 has now run **three disciplined composition falsification experiments** at the **same frozen Overview framing**. All pass changed-pixel breadth; all fail the precommitted **whole-frame MAE magnitude gate**. Candidate C additionally proves **local hierarchy can change materially** while the **town-scale frame gate** still fails.

| Experiment | SHA | Changed % | MAE | ROI MAE* | Hero DC | Verdict |
|---|---|---:|---:|---:|---:|---|
| **Path A** — runtime envelopes | `c3d0739` | 20.09% | 5.31 | — | 87† | **FAIL** |
| **Path B B1** — additive chunks + shells | `babd0fe` | 15.79% | 4.59 | — | 206 | **FAIL** |
| **Candidate C** — replacement assemblies | `85ded03` | 19.16% | **6.19** | **14.20** | 8 | **FAIL** |
| R14 baseline | `3b0aa0c` | ~4.2% | 3.11 | — | ~90 | stagnation |

\*Candidate C learning diagnostic only — **not** a gate substitute.  
†Path A total scene DC; hero-block not separately tracked.

**Senior signal @ `cee6f3b`:** Candidate C is **falsified under its precommitted gate**. Do **not** tune Candidate C. Do **not** relax or reinterpret MAE ≥8.0 / changed ≥15%. This is a **repeated root-strategy failure** requiring a **genuine composition/framing strategy change** — not a fourth hero-block dressing iteration.

R15.3 is a **decision plan**, not code.

---

## 2. Decision context

| Review / experiment | SHA | Gate | Lesson |
|---|---|---|---|
| WF02-R4.1 | `6dbd8b5` | BLOCKED | Scatter/tint insufficient |
| WF02-R14-SENIOR | `3b0aa0c` | FIX_REQUIRED | Shell re-anchor ≠ neighborhood composition |
| R15 Path A | `c3d0739` | **FAIL** | Breadth without MAE magnitude |
| R15 Path B | `babd0fe` | **FAIL** | Additive chunks; MAE worse; 206 DC |
| **R15 Candidate C** | `85ded03` | **FAIL** | Replacement works locally; whole-frame gate fails |
| WF02 milestone | — | **OPEN** | Framing/footprint strategy change required |

**Preserved (must not regress):**

| Asset / system | Status |
|---|---|
| R13/R14 shell GLBs + registry + door bindings ≤0.3 m | Frozen vocabulary / rollback |
| M02 semantic entrances/routes; `facilityPoints.ts`; `simulation/**` | Frozen sim truth |
| WF01 roads/river/terrain truth | Frozen |
| Deterministic worker authority; save/snapshot architecture | Frozen |
| Kenney/Quaternius provenance discipline | Frozen |
| A/B/C disposable proof branches (diagnostic record) | Preserve — do not production-wire |
| Performance headroom (Overview ≤140 DC, Street ≤100, <150k tris) | Preserve M03 LOD headroom |
| M03 | **HOLD** |

**Forbidden without new plan gate:**

| Action | Reason |
|---|---|
| Tune Candidate C assemblies/placement | Senior explicit prohibition |
| Relax MAE ≥8 / changed ≥15% gates retroactively | Senior explicit prohibition |
| ROI MAE as substitute gate for A/B/C | Senior explicit prohibition |
| Production-wire falsified A/B/C proof layers | All FAIL |
| New asset family / external dependency | Not authorized in R15.3 |
| Merge PR #12 / M03 / Grok review | Separate authorization |

---

## 3. Locked falsification record (A/B/C — do not re-score)

### 3.1 Path A — runtime declarative envelopes @ `c3d0739`

| Metric | Value |
|---|---|
| Changed pixels | 20.09% ✅ |
| MAE | 5.31 ❌ |
| Proof DC | 87 |

**Why it failed:** Runtime scatter increased pixel **breadth** with low-amplitude dressing around unchanged R14 shell hierarchy. Dominant roofline/block silhouette unchanged.

**Artifacts:** `r15_phase0_proof_manifest.json`, `r15_phase0_proof_overview.png`, `heroBlockProof/*`

### 3.2 Path B B1 — additive offline chunks + shells @ `babd0fe`

| Metric | Value |
|---|---|
| Changed pixels | 15.79% ✅ |
| MAE | 4.59 ❌ |
| Proof DC | 206 (82+58 chunk meshes) |

**Why it failed:** Offline mass **surrounded** retained shells instead of replacing macro hierarchy. Draw multiplication proved production-incompatible even at low triangle count.

**Artifacts:** `r15_pathb_phase0_proof_manifest.json`, `block-chunks/*.glb`, `blockChunkProof/*`

### 3.3 Candidate C — replacement assemblies @ `85ded03`

| Metric | Value |
|---|---|
| Changed pixels | 19.16% ✅ |
| MAE | 6.19 ❌ |
| ROI MAE (learning) | **14.20** |
| High-contrast changed (learning) | 15.97% |
| Hero-block draw estimate | 8 ✅ (hard stop 12) |
| Door/socket audit | ✅ ≤0.3 m |
| Asset/network errors | 0 |

**Why it failed:** Replacement **did** shift hero-region hierarchy (ROI MAE 14.20 — would pass MAE gate locally). Whole-frame MAE remains 6.19 because the changed hero region occupies **too little of the frozen Overview composition** (~19% changed pixels; ~80% frame still reads as R14 meadow/road/periphery). Town-scale north-star transformation requires **frame-weighted** change, not localized hero-block delta alone.

**Artifacts:** `r15_replacement_phase0_proof_manifest.json`, `r15_replacement_assembly_provenance.json`, `hero-assemblies/*.glb`, `replacementProof/*`

**Disposition:** All three proof branches remain **diagnostic-only**. None are production candidates.

---

## 4. Root-cause diagnosis (post A/B/C)

### 4.1 Symptom progression

| Stage | Observation |
|---|---|
| R4.1/R14 | ~4% changed — ordinary viewer sees stagnation |
| Path A | 20% changed — still low MAE (5.31) |
| Path B | 15% changed — MAE worse (4.59) + DC blowout |
| Candidate C | 19% changed — best MAE (6.19) but still FAIL; **ROI MAE 14.20** |

**Pattern:** Changed-pixel gate is **necessary but not sufficient**. It rewards distributed or localized delta. Whole-frame MAE gate detects **aggregate town-scale energy**. Candidate C proves these gates diverge when hero change is real but **frame-underweighted**.

### 4.2 Mechanism — frame occupancy vs composition technique

```
Frozen Overview [0,46,36] → [0,0,4] @ 1440×900
        │
        ├── ~80% pixels: roads, meadow, periphery, sky — largely unchanged across A/B/C
        │
        └── ~20% pixels: hero neighborhood — Candidate C materially different (ROI MAE 14.20)
                    │
                    └── diluted into whole-frame MAE 6.19 (< 8.0 gate)
```

**Conclusion:** The repeated failure is no longer "wrong dressing technique alone." It is **composition technique insufficient at this framing weight** — hero block changes cannot establish town-scale north-star read while occupying ~20% of the evidence frame.

### 4.3 What Candidate C proved useful (carry forward)

- Replacement (not additive) can shift local hierarchy ✅
- Flattened assemblies achieve hero-block DC ≤12 ✅
- Door socket separation preserves M02 authority ✅
- ROI diagnostic validates **where** change happens — informs D/E strategy

### 4.4 What Candidate C proved insufficient (stop line)

- Whole-frame MAE ≥8 at frozen framing ❌
- Qualitative town-scale north-star transformation at Overview ❌ (independently required at review)

---

## 5. Strategy comparison (mandatory — choose path for next authorized work)

**Artifact:** [`r15_framing_footprint_audit_plan.json`](r15_framing_footprint_audit_plan.json)  
**Script:** `npm run audit:wf02-r15-framing-footprint`

### 5.1 Rejected — locked falsification (do not revisit without new gate)

| ID | Strategy | Verdict | MAE | Changed % |
|---|---|---|---:|---:|
| A | Runtime declarative envelopes | **REJECT** | 5.31 | 20.09% |
| B1 | Additive offline chunks + shells | **REJECT** | 4.59 | 15.79% |
| C | Replacement hero assemblies | **REJECT** | 6.19 | 19.16% |
| C-tune | Any Candidate C parameter tuning | **FORBIDDEN** | — | — |

### 5.2 Candidate D — Bounded Overview framing correction (RECOMMEND primary)

| Attribute | Assessment |
|---|---|
| **Method** | Analytical Phase 0 measuring hero-block **frame occupancy** and frustum coverage at frozen Overview; propose **bounded** adjustment to `HERO_NEIGHBORHOOD_DEFINITION.cameras.overview` (position/target/distance) so hero neighborhood occupies sufficient central Overview weight for town-scale read |
| **Ownership** | `src/world/worldLab/heroNeighborhood.ts` → `cameras.overview`; evidence preset registry if split from gameplay default |
| **Simulation impact** | **None** — camera is presentation/evidence path; `facilityPoints`, `HERO_NAV`, entrances unchanged |
| **Visual hypothesis** | Candidate C ROI MAE 14.20 implies changed mass exists; reframing may convert local delta into whole-frame MAE ≥8 **if** north-star read improves for ordinary viewers |
| **Constraint** | Must improve **default gameplay readability** (dawn Overview, Street preset, M02 door approach) — **not** metric gaming via crop-only evidence |
| **Bounded change envelope (plan proposal)** | Max ±15% position delta magnitude; max ±10% target delta; altitude reduction preferred over lateral crop; Angled/Street presets adjusted consistently if Overview changes |
| **Abort** | MAE improves but north-star qualitative FAIL; Street/M02 portal proofs degrade; change requires crop-only capture path |

**Candidate D is analytical-first:** Phase 0a = measurement report + bounded proposal. Phase 0b (post-approval) = disposable proof capture at proposed framing with same gate suite.

### 5.3 Candidate E — Presentation footprint recomposition (RECOMMEND secondary)

| Attribute | Assessment |
|---|---|
| **Method** | Re-author **presentation cluster layout** within frozen hero bounds `{ minX:-32, maxX:32, minZ:-24, maxZ:30 }` so buildings/mass occupy central Overview silhouette — **presentation-only transforms** on shell origins, assembly anchors, and World Lab module placement; **not** `facilityPoints` / sim center edits |
| **Ownership** | `prototypeShellManifest.json` origins (presentation); `WorldLabCompositionLayer` placement spec; optional presentation offset layer — **never** simulation truth |
| **Simulation impact** | **None** — sim anchors frozen; visual reposition only; door sockets revalidated ≤0.3 m to frozen entrances |
| **Visual hypothesis** | Town-scale north-star read requires hero block to **dominate default Overview silhouette**, not edge-distributed delta on ~20% of pixels |
| **Risk** | Presentation reposition without framing change may recreate A/B/C pattern if periphery still dominates frame |
| **Abort** | Door visual honesty breaks; whole-frame MAE still <8 after footprint shift; ordinary viewer sees R14-equivalent hierarchy |

**Candidate E requires explicit separation:**

```
facilityPoints.ts / HERO_NAV (frozen sim)
        │
        └── presentation offset layer (visual only)
                    │
                    └── shell origins / assembly anchors / WorldLab module transforms
```

### 5.4 Combined path D+E (conditional)

If analytical Phase D shows framing alone cannot achieve whole-frame gate **without** gameplay harm, approved build may combine **bounded framing (D)** + **presentation footprint shift (E)** — but R15.3 plan gate authorizes **D analytical first**, then explicit approval for E Phase 0. No combined implementation without second plan decision.

### 5.5 Recommendation matrix

| Priority | Candidate | Next authorized work (post R15.3 approval) |
|---|---|---|
| **1** | **D — Bounded framing** | Analytical audit + bounded proposal (`r15_framing_feasibility_audit.md`) |
| **2** | **E — Presentation footprint** | Phase 0 disposable proof only if D analytical insufficient |
| — | B2 monolithic | Hold |
| — | Path C external import | Hold |
| **Reject** | A, B1, C, C-tune | Locked falsification |

---

## 6. Camera / world-layout ownership map

### 6.1 Authority table

| Concern | Owner file / module | R15.3 touch policy |
|---|---|---|
| Overview camera constants | `heroNeighborhood.ts` → `cameras.overview` | **Candidate D** — bounded adjustment allowed post-approval |
| Angled / Street / M02 presets | `heroNeighborhood.ts` → `cameras.*` | Adjust only if Overview change requires consistency; must pass portal proofs |
| Hero bounds (64×54 m) | `HERO_NEIGHBORHOOD_DEFINITION.bounds` | Frozen unless explicit Product Owner sim expansion (not authorized) |
| Sim facility centers/entrances | `facilityPoints.ts`, `HERO_NAV` | **Never touch** |
| Shell presentation origins | `prototypeShellManifest.json` | **Candidate E** — presentation offset only post-approval |
| World Lab module placement | `WorldLabCompositionLayer` + module specs | **Candidate E** — presentation offset only |
| Replacement assembly anchors | `replacementPhase0ProofManifest.json` | Diagnostic — no production path |
| Evidence capture preset | `__GODMODE_EVIDENCE__.applyPreset('overview')` | Must track gameplay default vs evidence override if split |
| Terrain / roads / river | WF01 truth | **Never touch** |

### 6.2 Frozen Overview reference (A/B/C baseline)

| Parameter | Value |
|---|---|
| Viewport | 1440 × 900 |
| Position | `[0, 46, 36]` |
| Target | `[0, 0, 4]` |
| Sim minute | 0 (dawn) |
| Baseline PNG | `Docs/milestones/WF02/01_r14_overview_dawn.png` |

All A/B/C manifests computed delta vs this baseline at this framing. Future experiments must declare framing explicitly in manifest.

---

## 7. Visual gates (anti-gaming — mandatory for next Phase 0)

### 7.1 Locked comparison gates (A/B/C baseline — unchanged)

Until explicitly superseded in a future `[GOD-MODE:CHATGPT-PLAN-DECISION]`:

| Gate | Threshold | Hard fail |
|---|---:|---|
| Whole-frame MAE vs R14 | **≥8.0** | <8.0 |
| Materially changed pixels (threshold 5) | **≥15%** | <15% |

**Do not retroactively re-score A/B/C.** ROI MAE recorded for learning — **cannot substitute** whole-frame MAE.

### 7.2 Anti-gaming rules (next experiment)

| Rule | Rationale |
|---|---|
| No crop-only evidence path | Would pass ROI-like metrics without town-scale truth |
| No opacity/tint/overlay as primary delta | R4.1/R15 dressing pattern |
| No evidence-param URL that diverges from gameplay default without documented split | Prevents hidden metric gaming |
| Framing change must pass Street + M02 door proofs | Gameplay readability guard |
| Qualitative north-star checklist required | Metrics necessary, not sufficient |
| Silhouette/occupancy diagnostic recorded | Detect hierarchy shift independent of color wash |

### 7.3 Qualitative gates (ordinary viewer — independently required)

| Criterion | Required at next Phase 0 |
|---|---|
| Town-scale read vs R14 | Not mistakable for sparse R14 meadow + four islands |
| North-star direction | Warmth, density, district character improving |
| Block silhouette dominance | Hero neighborhood occupies central Overview weight |
| Civic / commercial / residential hierarchy | Readable at Overview without closeups |
| M02 door/path honesty | Street preset ≤0.3 m |

### 7.4 Objective abort criteria (pre-declared)

| Condition | Action |
|---|---|
| Whole-frame MAE <8 OR changed <15% | **STOP — FAIL** |
| Qualitative hierarchy unchanged | **STOP — FAIL** even if metrics pass |
| Street/M02 portal proofs degrade | **STOP — FAIL** |
| Evidence requires crop-only path | **STOP — FAIL** |
| Asset/network errors >0 | **STOP — FAIL** |

---

## 8. Fixed evidence protocol (next authorized Phase 0)

### 8.1 Capture suite

| ID | Capture | Camera | Purpose |
|---|---|---|---|
| E1 | Overview dawn | Approved Overview preset @ 1440×900 | Primary gate vs R14 baseline |
| E2 | Compare strip | R14 → candidate → north-star ref | Ordinary-viewer delta |
| E3 | Street M02 | `store-workshop` or Street preset | Door/road/sidewalk honesty |
| E4 | Hero-block crop | Central 60% (diagnostic only) | ROI MAE learning — not gate |
| E5 | Diagnostics | Live GL DC/tris | Budget headroom |

### 8.2 Manifest requirements (exact-SHA handoff)

Each Phase 0 manifest must include:

- `sha`, `planRevision`, `authorization`, `integrationMode`
- Framing constants (position, target, viewport) — explicit
- `pixelDelta` (whole-frame) + `learningDiagnostics` (ROI/high-contrast — non-gating)
- `gates.pass` boolean
- `abortCriteria` checklist with explicit PASS/FAIL per row
- Provenance / audit results
- `diagnostics` (DC/tris)
- `consoleErrors`, `networkAssetErrors`
- PNG + manifest SHA256 hashes

### 8.3 Baseline continuity

- Primary delta baseline remains `01_r14_overview_dawn.png` **at original frozen framing** until Product Owner authorizes baseline migration.
- If Candidate D changes Overview, manifest must capture **both** delta vs R14@old-framing (continuity) and delta vs approved new baseline (forward).

---

## 9. Performance budget (preserved)

| Line | Hard cap | Notes |
|---|---:|---|
| Overview DC | ≤140 | Unchanged |
| Street DC | ≤100 | Unchanged |
| Overview tris | <150k | Unchanged |
| M03 headroom | ≥5 DC / ≥8k tris | LOD strategy required |

Candidate D framing-only: **no expected DC change**. Candidate E footprint: measure after Phase 0; prefer flattened assemblies (C pipeline) if geometry added.

---

## 10. Migration / rollback

| Flag / mode | Presentation |
|---|---|
| Default production | R14 `PrototypeShellLayer` + World Lab modules (unchanged) |
| `?r15Phase0Proof=1` | Path A diagnostic (frozen) |
| `?r15PathBPhase0Proof=1` | Path B diagnostic (frozen) |
| `?r15ReplacementPhase0Proof=1` | Candidate C diagnostic (frozen) |
| `?r15FramingPhase0Proof=1` | Candidate D proof (post-approval — plan-only name) |
| `?r15FootprintPhase0Proof=1` | Candidate E proof (post-approval — plan-only name) |
| Sim / worker / save | Unchanged all modes |

**Rollback rule:** Any approved framing/footprint change must revert via camera constant rollback or presentation-offset flag without touching `simulation/**`.

---

## 11. File map (post-approval touch list — plan only)

| Action | Paths |
|---|---|
| **Create (D analytical)** | `scripts/wf02-r15-framing-feasibility-audit.mjs`, `Docs/milestones/WF02/r15_framing_feasibility_audit.md` |
| **Create (D Phase 0)** | `scripts/wf02-r15-framing-phase0-proof.mjs`, `src/rendering/framingProof/*` (disposable) |
| **Create (E Phase 0)** | `scripts/wf02-r15-footprint-phase0-proof.mjs`, presentation offset spec + proof layer |
| **Modify (D — bounded)** | `src/world/worldLab/heroNeighborhood.ts` (`cameras.overview` only) |
| **Modify (E — presentation)** | `prototypeShellManifest.json` origins OR presentation offset layer — **not** `facilityPoints.ts` |
| **Preserve diagnostic** | `heroBlockProof/*`, `blockChunkProof/*`, `replacementProof/*`, all A/B/C manifests/PNGs |
| **Do NOT touch** | `simulation/**`, `facilityPoints.ts`, worker/save/schema, WF01 terrain/roads/river truth |

---

## 12. Tests and audits

```bash
npm run audit:wf02-r15-framing-footprint          # this plan revision
npm run audit:wf02-r15-composition-reset          # R15.2 record
npm run audit:wf02-r15-replacement                # Candidate C record
npm run proof:wf02-r15-replacement-phase0         # Candidate C capture (frozen)
npm run audit:wf02-r14-shell-rollout              # door binding baseline
npm run test:all
```

Post-approval additions: framing occupancy unit tests, Street portal e2e regression after any camera change.

---

## 13. Explicit non-goals

| Non-goal | Reason |
|---|---|
| Tune Candidate C | Senior prohibited @ `cee6f3b` |
| Relax MAE / changed-pixel gates | Senior prohibited |
| ROI MAE as substitute gate | Senior prohibited |
| Production-wire A/B/C proof layers | All falsified |
| New asset family | Not authorized |
| Candidate D implementation in R15.3 plan gate | Plan only |
| Merge PR #12 / M03 / Grok | Separate authorization |
| Sim expansion / `facilityPoints` edits | Frozen |

---

## 14. Definition of done (R15.3 — plan gate only)

| Criterion | Required |
|---|---|
| A/B/C falsification locked with failure analysis | **Yes** |
| Candidate C ROI signal interpreted (frame occupancy) | **Yes** |
| Candidate D vs E compared with ownership boundaries | **Yes** |
| Camera/world-layout ownership map | **Yes** |
| Anti-gaming visual gates + fixed evidence protocol | **Yes** |
| Migration/rollback + performance preservation | **Yes** |
| File map + audit artifact | **Yes** |
| `npm run audit:wf02-r15-framing-footprint` | **Yes** |

**No implementation, new assets, Grok review, merge, or M03 in R15.3 plan gate.**

---

## 15. Requirement IDs protected

| ID | R15.3 contribution |
|---|---|
| WF02-VISUAL-HARD-GATE | Framing/footprint strategy after triple falsification |
| WF02-PRESERVE-SIM | Explicit sim vs presentation boundary |
| WF02-PRESERVE-M02 | Door/portal proof requirements for framing changes |
| WF02-RENDER-BUDGET | Budget preserved through D/E |
| WF02-EVIDENCE-INTEGRITY | Fixed protocol; anti-crop/anti-tint rules |
| WF02-DETERMINISM | No worker/sim changes |

---

**STOP.** Awaiting `[GOD-MODE:CHATGPT-PLAN-DECISION] Decision: APPROVED_TO_BUILD` before Candidate D analytical audit, Candidate E Phase 0, production wiring, merge, or M03.
