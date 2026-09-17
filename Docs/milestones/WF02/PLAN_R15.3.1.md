# WF02 Plan Revision 15.3.1 — Presentation Footprint Recomposition Strategy

**State:** WAITING_FOR_CHATGPT_PLAN_APPROVAL  
**Supersedes:** Plan revision 15.3 @ `b936779c95ceaeb353cff09b93821692c7a55937` — **PLAN_CHANGES_REQUIRED** (Candidate D primary rejected)  
**Senior arbitration:** `[GOD-MODE:CHATGPT-PLAN-DECISION]` @ `b936779` — **PLAN_CHANGES_REQUIRED**  
**Investigation base SHA:** `b936779c95ceaeb353cff09b93821692c7a55937`  
**Candidate C implementation SHA:** `85ded0397eb4945b1b36d69cf6dcc4f6e50a7268`  
**Branch:** `cursor/wf02-scale-calibration-754a`  
**Scope:** PLAN ONLY — no Candidate E/D Phase 0 build, production wiring, camera tuning, merge, Grok review, new asset family, or M03 until `[GOD-MODE:CHATGPT-PLAN-DECISION] Decision: APPROVED_TO_BUILD`

---

## 1. Work item

WF02 — North-Star Scale & Aesthetic Calibration.

R15 has run **three disciplined composition falsification experiments** at the **same frozen Overview framing**. All pass changed-pixel breadth; all fail the precommitted **whole-frame MAE magnitude gate**. Candidate C additionally proves **local hierarchy can change materially** (ROI MAE 14.20) while the **town-scale frame gate** still fails.

| Experiment | SHA | Changed % | MAE | ROI MAE* | Hero DC | Verdict |
|---|---|---:|---:|---:|---:|---|
| **Path A** — runtime envelopes | `c3d0739` | 20.09% | 5.31 | — | 87† | **FAIL** |
| **Path B B1** — additive chunks + shells | `babd0fe` | 15.79% | 4.59 | — | 206 | **FAIL** |
| **Candidate C** — replacement assemblies | `85ded03` | 19.16% | **6.19** | **14.20** | 8 | **FAIL** |
| R14 baseline | `3b0aa0c` | ~4.2% | 3.11 | — | ~90 | stagnation |

\*Candidate C learning diagnostic only — **not** a gate substitute.  
†Path A total scene DC; hero-block not separately tracked.

**Senior signal @ `b936779`:** R15.3 correctly preserves the A/B/C falsification record and recognizes Candidate C's strong local hierarchy delta. **Candidate D as primary is rejected** — the plan was drifting toward optimizing the evidence camera to make a known local change carry more weight. WF02's product problem is the **live town's composition/readability**, not the score assigned to a crop.

R15.3.1 is a **revised decision plan**, not code.

---

## 2. What R15.3.1 changes vs R15.3

| R15.3 (rejected framing) | R15.3.1 (revised) |
|---|---|
| Candidate **D primary** — bounded camera/framing correction | Candidate **E primary** — presentation footprint recomposition + bounded district massing |
| Candidate E secondary — only if D insufficient | Candidate **D secondary** — camera calibration **only after** composed footprint exists |
| Frame occupancy as rationale for camera-first strategy | Frame occupancy as **descriptive design metric** — not a pass substitute |
| Whole-frame MAE remains primary gate for future experiments | **Multi-part evidence rubric** for future experiments; whole-frame MAE **diagnostic only** |
| D analytical audit first | E footprint audit + composition spec first; D only if footprint complete and readability still insufficient |

**Preserved from R15.3 (do not regress):**

- Locked A/B/C falsification record — no threshold relaxation or re-score
- R13/R14 shell vocabulary, flattened/low-draw replacement learning, ≤0.3 m door honesty
- M02 simulation/routes/worker authority, roads/river/terrain truth, save/snapshot architecture, provenance
- M03 hold; no production wiring of A/B/C proof layers
- Useful finding: **replacement beats additive dressing locally** (Candidate C lesson)

---

## 3. Decision context

| Review / experiment | SHA | Gate | Lesson |
|---|---|---|---|
| WF02-R4.1 | `6dbd8b5` | BLOCKED | Scatter/tint insufficient |
| WF02-R14-SENIOR | `3b0aa0c` | FIX_REQUIRED | Shell re-anchor ≠ neighborhood composition |
| R15 Path A | `c3d0739` | **FAIL** | Breadth without MAE magnitude |
| R15 Path B | `babd0fe` | **FAIL** | Additive chunks; MAE worse; 206 DC |
| **R15 Candidate C** | `85ded03` | **FAIL** | Replacement works locally; whole-frame gate fails |
| Plan R15.3 | `b936779` | **PLAN_CHANGES_REQUIRED** | D-primary rejected — camera exposes sparsity, does not fix it |
| WF02 milestone | — | **OPEN** | Footprint recomposition strategy required |

---

## 4. Observed symptom and root cause

### 4.1 Symptom

Candidate C changes the hero ROI materially but the **default town Overview still allocates most image space to low-information meadow/periphery/roads**. The result does not yet read as a composed north-star miniature town at the **product level**.

### 4.2 Root cause

The authored **presentation footprint** and surrounding **district massing** are under-composed relative to the ~240 m world and default gameplay camera. This is **not primarily a camera-parameter defect**. The camera **exposes** the sparse composition; moving it closer can hide that sparsity without fixing it.

### 4.3 Why A/B/C failed (revised interpretation)

| Attempt | What happened | Why whole-frame gate failed |
|---|---|---|
| Path A | Added secondary mass around unchanged hierarchy | Low-amplitude dressing; dominant silhouette unchanged |
| Path B | Additive offline chunks surrounded retained shells | MAE worse; 206 DC; hierarchy unchanged |
| Candidate C | **Replaced** hierarchy inside bounded hero region | Strong ROI delta (14.20) but **rest of visible town remained visually low-information** |

**Conclusion:** C's strong ROI delta is diluted because the **actual live composition is still sparse outside the hero ROI**, not because MAE is unfair. The next strategy must address **presentation footprint and district massing**, not camera cropping.

### 4.4 Mechanism diagram

```
~240 m world + default Overview [0,46,36] → [0,0,4]
        │
        ├── ~60–70% frame: meadow, periphery, roads, sky — low-information
        │
        └── ~20–30% frame: hero neighborhood — Candidate C materially different locally
                    │
                    └── whole-frame MAE 6.19 (< 8.0) because sparse surround dominates
```

**Fix target:** Recompose presentation footprint so civic/commercial/residential cluster + vegetation framing **occupies central Overview silhouette** — without moving simulation truth.

---

## 5. Locked falsification record (A/B/C — do not re-score)

Historical A/B/C verdicts are **immutable**. Whole-frame MAE ≥8.0 / changed ≥15% gates remain the **recorded outcome** for those experiments. R15.3.1 introduces a **forward-looking multi-part rubric** for future work — it does **not** retroactively alter A/B/C.

### 5.1 Summary table

| ID | Strategy | Changed % | MAE | Verdict | Disposition |
|---|---|---:|---:|---|---|
| A | Runtime envelopes | 20.09% | 5.31 | **FAIL** | Diagnostic only |
| B1 | Additive chunks + shells | 15.79% | 4.59 | **FAIL** | Diagnostic only |
| C | Replacement assemblies | 19.16% | 6.19 | **FAIL** | Diagnostic only — reuse lessons, not wiring |
| C-tune | Parameter tuning | — | — | **FORBIDDEN** | Senior prohibited |

**Candidate C carry-forward (lessons, not production wiring):**

- Flattened Kenney assemblies achieve hero-block DC ≤12 ✅
- Door socket separation preserves M02 authority ≤0.3 m ✅
- Replacement (not additive) shifts local hierarchy ✅
- Import pipeline: `scripts/wf02-r15-replacement-import.mjs` — reusable for E assemblies

---

## 6. Strategy comparison (revised recommendation)

**Artifact:** [`r15_footprint_recomposition_audit_plan.json`](r15_footprint_recomposition_audit_plan.json)  
**Script:** `npm run audit:wf02-r15-footprint-recomposition`

### 6.1 Rejected — locked falsification

| ID | Verdict |
|---|---|
| A, B1, C, C-tune | **REJECT** — locked record |
| D-primary (R15.3 framing) | **REJECT** — evidence-camera optimization drift |

### 6.2 Candidate E — Presentation footprint recomposition (RECOMMEND primary)

| Attribute | Assessment |
|---|---|
| **Method** | Re-author **presentation cluster layout** within frozen hero bounds `{ minX:-32, maxX:32, minZ:-24, maxZ:30 }` plus **bounded district massing** inside existing authored geography. Use proven **replacement/shell approach** to create a coherent civic/commercial/residential visual cluster connected to existing park/river/vegetation framing. |
| **Single authority** | One **presentation-offset/massing spec** consumed by `WorldLabCompositionLayer` and shell registry — not scattered magic transforms |
| **Ownership** | New `presentationFootprintSpec.ts` (plan name) OR consolidated extension of `districtCompositionSpec.ts`; `prototypeShellManifest.json` presentation origins; `WorldLabCompositionLayer` module placement |
| **Simulation impact** | **None** — `facilityPoints.ts`, `HERO_NAV`, entrances, routes frozen; visual reposition only; door sockets revalidated ≤0.3 m to frozen entrances |
| **Visual hypothesis** | Town-scale north-star read requires hero block + district massing to **dominate default Overview silhouette** — not edge-distributed delta on ~20% of pixels |
| **Reuse from C** | Flattened assembly pipeline, door socket discipline, low-DC batching — **not** disposable `?r15ReplacementPhase0Proof=1` wiring |
| **Abort** | Door visual honesty breaks; composition still reads sparse at default camera; requires camera crop to look successful; duplicates A/B additive dressing pattern |

### 6.3 Candidate D — Bounded camera calibration (RECOMMEND secondary only)

| Attribute | Assessment |
|---|---|
| **Method** | Propose bounded adjustment to `HERO_NEIGHBORHOOD_DEFINITION.cameras.overview` **only after** analytically composed footprint exists |
| **Ownership** | `src/world/worldLab/heroNeighborhood.ts` → `cameras.*` — **reference context only in plan; secondary in build** |
| **Constraint** | Must improve **default gameplay readability** independently of any MAE metric. Same camera must be a good default gameplay view even if no MAE existed. |
| **Forbidden** | Evidence-only camera preset whose purpose is to clear MAE; crop-only capture path; camera change before footprint composition |
| **Abort** | Framing improves metrics but not ordinary-viewer north-star read; Street/M02 portal proofs degrade; success requires camera crop to hide sparsity |

### 6.4 Recommendation matrix

| Priority | Candidate | Next authorized work (post R15.3.1 approval) |
|---|---|---|
| **1** | **E — Footprint recomposition** | Analytical footprint audit + presentation spec + Phase 0 disposable proof |
| **2** | **D — Camera calibration** | Bounded proposal **only if** E footprint complete and readability still insufficient |
| — | B2 monolithic | Hold |
| — | Path C external import | Hold |
| **Reject** | A, B1, C, C-tune, D-primary | Locked falsification / rejected framing |

---

## 7. Single presentation-offset authority (Candidate E design)

### 7.1 Problem with current layout

Presentation transforms are scattered across:

- `prototypeShellManifest.json` — per-shell `origin` / `rotY`
- `districtCompositionSpec.ts` — district scatter placements
- Individual World Lab modules — implicit local transforms

R15.3.1 requires **one declarative spec** that all presentation modules consume.

### 7.2 Proposed authority chain

```
facilityPoints.ts / HERO_NAV / simulation/**  (FROZEN — reference only)
        │
        └── presentationFootprintSpec.ts  (NEW — visual-only offsets)
                    │
                    ├── prototypeShellManifest origins (applied at load)
                    ├── WorldLabCompositionLayer module roots
                    ├── VegetationFrame / CivicEnclosure / CommercialFrontage / etc.
                    └── optional flattened assemblies (C pipeline vocabulary)
```

### 7.3 Footprint recomposition targets (plan-level — values finalized at build)

| Cluster | Facilities / modules | Current issue | Proposed direction |
|---|---|---|---|
| **Civic anchor** | community-hall, clinic shells + `CivicEnclosure` | Edge-weighted in frame | Shift presentation cluster toward Overview central weight |
| **Residential pair** | house-1, house-2 + `ResidentialGardens` | Sparse meadow surround | Tighten cluster; connect hedges/gardens to civic spine |
| **Commercial frontage** | store, workshop, cafe + `CommercialFrontage` | Low silhouette dominance | Street-wall rhythm toward frame center; M02 door honesty preserved |
| **Future lots** | `FutureLotFrame` | Empty negative space reads undeveloped | Frame as intentional growth edge, not dominant meadow |
| **Park/river edge** | `VegetationFrame`, river presentation | Under-connected to hero cluster | Vegetation framing links hero cluster to river/park read |
| **District massing** | `WorldLabGroundTint`, canopy scatter | Faint tint wash | Bounded Kenney massing using R13/R14 shell registry vocabulary |

**Bounds constraint:** All presentation offsets remain within `HERO_NEIGHBORHOOD_DEFINITION.bounds` and existing WF01 geography. No sim coordinate edits.

### 7.4 Door-delta proof (mandatory at build)

Each repositioned shell/assembly must record:

- Frozen sim entrance coordinate (from `facilityPoints.ts` / `HERO_ENTRANCES`)
- Presentation door socket world position after offset
- Delta magnitude — **must remain ≤0.3 m** visual honesty

---

## 8. Frame-occupancy analysis (descriptive design metric)

Frame occupancy is a **descriptive design metric** for planning and evidence — **not** a pass substitute for product acceptance.

### 8.1 Categories (1440×900 Overview @ frozen camera until D approved)

| Category | R14 estimate (plan) | E target direction | North-star intent |
|---|---:|---:|---|
| Built mass (shells/assemblies) | ~12–15% | **↑ 22–30%** | Civic/commercial/residential cluster dominates silhouette |
| Vegetation/canopy | ~8–10% | **↑ 15–20%** | Lush framing, orchard/park edge |
| Roads/sidewalks | ~18–22% | **→ 15–18%** | Present but not dominant |
| Meadow/periphery low-info | **~45–50%** | **↓ 25–35%** | Intentional negative space, not empty town |
| River/water | ~5–8% | **→ 6–10%** | Park/river edge readable |
| Sky | ~8–12% | **→ 8–10%** | Stable horizon |

**Measurement method (post-approval analytical):** Screen-space classification pass on R14 baseline + proposed footprint renders — same viewport, same sim minute (dawn). Recorded in footprint audit artifact; supports design rationale, not automated gate.

### 8.2 How occupancy shifts improve north-star hierarchy

| Shift | Hierarchy improvement |
|---|---|
| Built mass ↑ central | Civic anchor + commercial street-wall become Overview focal read |
| Vegetation ↑ framing | Warm miniature-town lushness; connects districts |
| Meadow/periphery ↓ | Town reads **composed**, not sparse meadow with four islands |
| Roads stable | Infrastructure present without consuming hero weight |

---

## 9. Multi-part evidence rubric (future experiments — forward-looking)

R15.3.1 **replaces single whole-frame MAE dependency** for **future** Candidate E/D work. Historical A/B/C verdicts stand unchanged.

### 9.1 Rubric components

| # | Component | Role | Hard fail? |
|---|---|---|---|
| R1 | **Qualitative north-star comparison** | Same-view BEFORE → candidate → north-star; ordinary viewer cannot mistake for R14 sparse meadow | **Yes** |
| R2 | **District silhouette/massing proof** | Civic/commercial/residential cluster occupies central Overview weight; block hierarchy readable | **Yes** |
| R3 | **Street readability** | Street preset: citizen proportion, door/path, road/sidewalk honest | **Yes** |
| R4 | **Gameplay camera honesty** | Default Overview/Angled/Street cameras justified without reference to metrics | **Yes** |
| R5 | **Whole-frame pixel delta** | Changed % vs R14 baseline — **diagnostic** | Record; not sole gate |
| R6 | **Whole-frame MAE** | Magnitude vs R14 — **diagnostic** | Record; not sole gate |
| R7 | **Frame-occupancy analysis** | Built/vegetated/road/river/sky/periphery before→proposed | Descriptive |
| R8 | **Performance budget** | Overview ≤140 DC, Street ≤100, <150k tris | **Yes** |
| R9 | **Simulation invariants** | `facilityPoints` SHA unchanged; zero asset/network errors | **Yes** |

### 9.2 Anti-gaming rules (unchanged spirit, expanded scope)

| Rule | Rationale |
|---|---|
| No evidence-only camera preset | Prevents MAE gaming |
| No crop-only evidence path | Would pass ROI-like metrics without town-scale truth |
| No opacity/tint/overlay as primary delta | R4.1/R15 dressing pattern |
| Camera change only after footprint exists | D secondary constraint |
| Do not production-wire A/B/C proof layers | All falsified |
| ROI/high-contrast MAE recorded but non-gating | Learning only |

---

## 10. Predeclared proof requirements (build gate — post-approval)

R15.3.1 predeclares what Candidate E Phase 0 / production build must deliver:

### 10.1 Presentation footprint before→after

Exact table by facility/cluster with bounded presentation offsets and door-delta proof (≤0.3 m). Sim coordinates unchanged.

### 10.2 District massing/vegetation + rendering path

Which modules change; flattened assembly reuse from C pipeline; instancing/batching path; measured DC/tris impact.

### 10.3 Default camera values

| Preset | Frozen value (until D approved) |
|---|---|
| Overview | position `[0, 46, 36]`, target `[0, 0, 4]` |
| Angled | position `[34, 26, 26]`, target `[0, 0, 2]` |
| Street (`store-workshop`) | position `[-14, 7, 20]`, target `[0, 2, 12]` |

Any proposed camera delta (D) must include independent gameplay-readability justification — not MAE justification.

### 10.4 Frame-occupancy analysis before→proposed

Section 8 categories with measured or analytically projected percentages.

### 10.5 Evidence capture suite

| ID | Capture | Camera | Purpose |
|---|---|---|---|
| E1 | Overview dawn | Default Overview @ 1440×900 | Primary product read |
| E2 | Compare strip | R14 → candidate → north-star | Ordinary-viewer delta |
| E3 | Civic | `cameras.civic` | Anchor massing |
| E4 | Commercial/residential | `cameras.commercial`, `cameras.residential` | District hierarchy |
| E5 | River/park | `cameras.river` | Edge framing |
| E6 | Street M02 | `cameras.store-workshop` | Door/road/sidewalk honesty |
| E7 | Angled | `cameras.angled` | Secondary gameplay read |
| E8 | Diagnostics | Live GL DC/tris | Budget headroom |

### 10.6 Deterministic/simulation invariants

- `facilityPoints.ts` SHA256 identical to WF01 merge baseline
- `git diff` empty on `simulation/**`, `facilityPoints.ts`
- `Math.random` zero in `src/`
- Asset/network errors = 0

### 10.7 Performance budget

| Line | Hard cap |
|---|---:|
| Overview DC | ≤140 |
| Street DC | ≤100 |
| Overview tris | <150k |
| M03 headroom | ≥5 DC / ≥8k tris credible |

### 10.8 Rollback and abort criteria

| Condition | Action |
|---|---|
| Qualitative north-star unchanged — still sparse R14-equivalent | **STOP — FAIL** |
| Success requires camera crop to look composed | **STOP — FAIL** (footprint incomplete) |
| Street/M02 portal proofs degrade | **STOP — FAIL** |
| Door/socket delta >0.3 m | **STOP — FAIL** |
| Asset/network errors >0 | **STOP — FAIL** |
| Overview DC >140 or tris ≥150k | **STOP — FAIL** |

**Rollback:** Revert via presentation-offset flag or spec rollback — no `simulation/**` touch.

---

## 11. Camera / world-layout ownership map

| Concern | Owner | R15.3.1 touch policy |
|---|---|---|
| Overview/Angled/Street cameras | `heroNeighborhood.ts` → `cameras.*` | **D secondary** — no change in E Phase 0 |
| Hero bounds | `HERO_NEIGHBORHOOD_DEFINITION.bounds` | Frozen |
| Sim facility centers/entrances | `facilityPoints.ts`, `HERO_NAV` | **Never touch** |
| Shell presentation origins | `prototypeShellManifest.json` | **E primary** — via footprint spec |
| World Lab module placement | `WorldLabCompositionLayer` + modules | **E primary** — via footprint spec |
| District scatter | `districtCompositionSpec.ts` | **E primary** — consolidate into footprint spec |
| A/B/C proof layers | `heroBlockProof/*`, `blockChunkProof/*`, `replacementProof/*` | Diagnostic — no production path |
| Terrain / roads / river | WF01 truth | **Never touch** |

---

## 12. Performance budget (preserved)

| Line | Hard cap | Notes |
|---|---:|---|
| Overview DC | ≤140 | Unchanged |
| Street DC | ≤100 | Unchanged |
| Overview tris | <150k | Unchanged |
| M03 headroom | ≥5 DC / ≥8k tris | LOD strategy required |

Candidate E footprint: prefer flattened assemblies (C pipeline) + instancing; measure after Phase 0.

---

## 13. Migration / rollback

| Flag / mode | Presentation |
|---|---|
| Default production | R14 `PrototypeShellLayer` + World Lab modules (unchanged until E approved) |
| `?r15Phase0Proof=1` | Path A diagnostic (frozen) |
| `?r15PathBPhase0Proof=1` | Path B diagnostic (frozen) |
| `?r15ReplacementPhase0Proof=1` | Candidate C diagnostic (frozen) |
| `?r15FootprintPhase0Proof=1` | Candidate E proof (post-approval — plan-only name) |
| `?r15FramingPhase0Proof=1` | Candidate D proof (post-approval — plan-only name; secondary) |
| Sim / worker / save | Unchanged all modes |

---

## 14. File map (post-approval touch list — plan only)

| Action | Paths |
|---|---|
| **Create (E analytical)** | `scripts/wf02-r15-footprint-feasibility-audit.mjs`, `Docs/milestones/WF02/r15_footprint_feasibility_audit.md` |
| **Create (E spec)** | `src/world/worldLab/presentationFootprintSpec.ts` (or consolidated `districtCompositionSpec.ts` extension) |
| **Create (E Phase 0)** | `scripts/wf02-r15-footprint-phase0-proof.mjs`, disposable proof layer (not production until rubric pass) |
| **Modify (E — presentation)** | `prototypeShellManifest.json` origins via spec; `WorldLabCompositionLayer` module roots |
| **Modify (D — secondary)** | `heroNeighborhood.ts` `cameras.*` — only after E footprint + independent readability justification |
| **Reuse (lessons)** | `scripts/wf02-r15-replacement-import.mjs` pipeline vocabulary |
| **Preserve diagnostic** | All A/B/C manifests/PNGs/proof layers |
| **Do NOT touch** | `simulation/**`, `facilityPoints.ts`, worker/save/schema, WF01 terrain/roads/river truth |

---

## 15. Tests and audits

```bash
npm run audit:wf02-r15-footprint-recomposition    # this plan revision
npm run audit:wf02-r15-framing-footprint          # R15.3 record (superseded recommendation)
npm run audit:wf02-r15-composition-reset          # R15.2 record
npm run audit:wf02-r15-replacement                # Candidate C record
npm run audit:wf02-r14-shell-rollout              # door binding baseline
npm run test:all
```

Post-approval additions: footprint offset unit tests, door-delta audit, Street portal e2e regression.

---

## 16. Explicit non-goals

| Non-goal | Reason |
|---|---|
| Candidate D as primary | Rejected @ R15.3 PLAN_CHANGES_REQUIRED |
| Tune Candidate C | Senior prohibited |
| Relax A/B/C gates retroactively | Senior prohibited |
| Production-wire A/B/C proof layers | All falsified |
| Evidence-only camera for MAE | Explicitly forbidden |
| New asset family | Not authorized |
| Candidate E/D implementation in R15.3.1 plan gate | Plan only |
| Merge PR #12 / M03 / Grok | Separate authorization |
| Sim expansion / `facilityPoints` edits | Frozen |

---

## 17. Definition of done (R15.3.1 — plan gate only)

| Criterion | Required |
|---|---|
| A/B/C falsification locked; R15.3 D-primary rejection acknowledged | **Yes** |
| Candidate E primary / D secondary strategy | **Yes** |
| Single presentation-offset authority specified | **Yes** |
| Frame-occupancy descriptive metric + before→proposed targets | **Yes** |
| Multi-part forward evidence rubric (MAE diagnostic, not sole gate) | **Yes** |
| Eight predeclared proof requirements (§10) | **Yes** |
| Rollback/abort criteria | **Yes** |
| File map + audit artifact | **Yes** |
| `npm run audit:wf02-r15-footprint-recomposition` | **Yes** |

**No implementation, new assets, camera tuning, Grok review, merge, or M03 in R15.3.1 plan gate.**

---

## 18. Requirement IDs protected

| ID | R15.3.1 contribution |
|---|---|
| WF02-VISUAL-HARD-GATE | Footprint recomposition after triple falsification |
| WF02-PRESERVE-SIM | Explicit sim vs presentation boundary |
| WF02-PRESERVE-M02 | Door/portal proof requirements |
| WF02-RENDER-BUDGET | Budget preserved through E/D |
| WF02-EVIDENCE-INTEGRITY | Multi-part rubric; anti-crop/anti-tint rules |
| WF02-DETERMINISM | No worker/sim changes |

---

**STOP.** Awaiting `[GOD-MODE:CHATGPT-PLAN-DECISION] Decision: APPROVED_TO_BUILD` before Candidate E analytical audit, Candidate E Phase 0, Candidate D camera work, production wiring, merge, or M03.
