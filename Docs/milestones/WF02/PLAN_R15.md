# WF02 Plan Revision 15 — Neighborhood Composition Reset

**State:** WAITING_FOR_CHATGPT_PLAN_APPROVAL  
**Supersedes:** Plan revision 14 implementation @ `f9be001d0cfc69eafeedc6c40e76d6f961c9fff7` (evidence head `3b0aa0c042266a43f17962b0a9352872532890f9`) — WF02-R14-SENIOR **FIX_REQUIRED**  
**Senior arbitration:** `[GOD-MODE:CHATGPT-DECISION]` WF02-R14-SENIOR @ `3b0aa0c` — **FIX_REQUIRED — PLAN_R15_REQUIRED — ROOT_CAUSE_COMPOSITION_RESET**  
**Investigation base SHA:** `3b0aa0c042266a43f17962b0a9352872532890f9`  
**Branch:** `cursor/wf02-scale-calibration-754a`  
**Scope:** PLAN ONLY — no composition implementation, asset import, Phase 0 proof build, evidence capture, merge, or M03 until `[GOD-MODE:CHATGPT-PLAN-DECISION] Decision: APPROVED_TO_BUILD`

---

## 1. Work item

WF02 — North-Star Scale & Aesthetic Calibration.

R13 validated **finished-architecture shell vocabulary** (FOUR_SHELL CC0 Kenney kitbash). R14 preserved that vocabulary and added **semantic shell bindings** (civic replacement/suppression, hero-neighborhood re-anchor, door authority, evidence integrity). Engineering @ `3b0aa0c` is green: Overview **90/87 DC / ~34k tris**; Street **54 DC / ~65k tris**; tests **208/208 PASS**; evidence integrity **PASS**.

**Visual DoD fails.** Independent senior + Grok agree @ exact SHA `3b0aa0c`:

| Metric | R13 → R14 Overview | Verdict |
|---|---:|---|
| Mean absolute error (MAE) | **3.11** | Stagnation |
| Materially changed pixels | **~4.2%** | Stagnation |
| Angled MAE / changed pixels | **3.86 / ~6.0%** | Stagnation |

Isolated shell closeups read better; **Overview still reads as sparse prototypes on empty ground.** Park/river = empty meadow; future lot = abstract fence markers; shells do not combine into a convincing north-star neighborhood at Overview.

This is a **repeated failure** in the composition layer (R4.1 scatter, R14 re-anchor). **R15 is a composition reset**, not R14.1 scatter/re-anchor/camera/tint patch.

---

## 2. Decision context

| Review | SHA | Gate | Lesson |
|---|---|---|---|
| WF02-R4.1 | `6dbd8b5` | BLOCKED | Scatter/tint insufficient — no continuous mass |
| WF02-R11/R12 | `4658dd2` / `ab4a8d2` | BLOCKED | Modular wall vocabulary caps form |
| WF02-R13-SENIOR | `d2ebdd4` | PASS_PROTOTYPE_STRATEGY | Shell vocabulary validated in isolation |
| **WF02-R14-SENIOR** | **`3b0aa0c`** | **FIX_REQUIRED** | Re-anchor cannot solve missing neighborhood composition |
| WF02 milestone | — | **OPEN** | North-star density/park/river/lot polish bar unchanged |

**Preserved from R13/R14 (must not regress):**

| Asset / system | Status |
|---|---|
| Four finished shell GLBs + provenance | Frozen vocabulary |
| R14 shell registry origins, `replacesBuildingIds`, suppression sets | Frozen semantic bindings |
| M02 door bindings ≤0.3 m; `HERO_NAV`; entrances/routes | Frozen sim truth |
| `facilityPoints.ts`, `simulation/**`, worker determinism | Frozen |
| R9 resolver boundary; evidence-integrity audit tooling | Frozen |
| Performance reserve (~55k+ tris / ~50+ DC below hard caps) | Preserve M03 headroom |
| Rollback flags (shell → modular → prefab) | Preserved |

**Forbidden in R15 without new plan gate:**

| Action | Reason |
|---|---|
| R14.1 scatter / re-anchor / camera / tint patch | Senior explicit prohibition |
| 240 m expansion | Out of scope |
| M03 population | Separate milestone |
| Merge PR #12 | Not authorized |
| TownBox production port | ARCH01 not approved for production |
| Runtime paid LLM/API | Constitution |

---

## 3. Symptom vs root cause

### 3.1 Symptom (image-space)

- Civic/commercial/residential **shell silhouettes** individually readable at closeup/thumbnail.
- **Overview @ frozen hero camera** still reads: four building islands + olive ground + thin road lines + empty east meadow + abstract future-lot fence pad.
- R13 → R14 Overview delta **~4.2% changed pixels** — ordinary viewer cannot perceive neighborhood-scale improvement.
- Park/river evidence frames show **terrain color + sparse trees**, not lush park-edge warmth.
- Future lot reads as **markers**, not intentional growth negative space framed by district mass.

### 3.2 Root cause (architecture)

There is **no authored neighborhood-scale composition system** that ties:

```
buildings (shells) + lots + streets + park/river edge + vegetation + ground treatment
        → continuous readable masses at Overview
```

Current stack (`WorldLabCompositionLayer`) **mounts independent modules** in parallel:

| Module | Role today | Composition gap |
|---|---|---|
| `PrototypeShellLayer` | 4 shell placements | Islands — no envelope glue |
| `WorldLabGroundTint` | Rectangular cell grids | Reads as faint wash, not district ground mass |
| `VegetationFrame` | Perimeter + park/river scatter | Too sparse; no canopy continuity |
| `ResidentialGardens` | Per-house fence/path | Local dressing, not block read |
| `FutureLotFrame` | Fence pad | Abstract, not framed lot |
| `CivicEnclosure` | Square pavers (colonnade suppressed) | Plaza amenity only — no block mass |

**Re-anchoring four shells cannot solve this.** The missing layer is **neighborhood-block composition authority** — a single declarative spec that authors **continuous ground/canopy/edge/lot negative-space envelopes** around frozen shell anchors.

---

## 4. Strategy comparison (mandatory — choose one)

**Artifact (plan gate):** `Docs/milestones/WF02/r15_composition_strategy_audit_plan.json`  
**Script (post-approval):** `npm run audit:wf02-r15-composition-strategy`

### 4.1 Path A — Authored hero-block composition (current shells + licensed props)

| Attribute | Assessment |
|---|---|
| Method | New **`HeroBlockCompositionSpec`** orchestrator: declarative mass envelopes (ground roles, canopy belts, park-edge shelf, lot framing, plaza hierarchy) integrating R13 shells + registered Kenney/Quaternius props |
| Runtime | Presentation-only React layer; shells remain thin registry placements |
| Visual capability | **High IF** envelopes authored at neighborhood scale — addresses root cause directly |
| Migration cost | **Medium** — new spec + mask/clipping + Phase 0 proof; no new shell GLBs required |
| License | CC0 Kenney + Quaternius only (already registered) |
| Risk | May still cap at "better scatter" if envelopes stay rectangular/thin |
| R13/R14 preservation | **Full** — shells + bindings untouched |

**Visual-capability evidence:** R4.1/R14 proved scatter modules alone cap at ~4–6% Overview delta. Path A succeeds only if envelopes are **authored as continuous mass fields** (canopy belts ≥60% block perimeter coverage, park-edge tree shelf ≥12 instances, lot pad framed by hedge/ground transition), not another instanced grid.

### 4.2 Path B — Bounded offline-authored neighborhood chunk(s)

| Attribute | Assessment |
|---|---|
| Method | Offline merge CC0 Kenney/Quaternius into **1–2 hero-block presentation GLBs** (ground+canopy+architectural mass baked) + thin runtime placement; shells become subordinate or baked-in |
| Runtime | 1–2 draws for block mass + optional shell registry for M02 door alignment |
| Visual capability | **High** — baked neighborhood read similar to R13 shell success at block scale |
| Migration cost | **High** — offline kitbash pipeline, provenance, bounds/door socket revalidation |
| License | CC0 derivative only |
| Risk | Door/entrance alignment drift; harder rollback granularity |
| R13/R14 preservation | **Partial** — shell GLBs may be baked into chunk; semantic door bindings must be re-proven |

**Visual-capability evidence:** R13 FOUR_SHELL proved offline kitbash escapes modular-wall failure. Path B extends that method from **building scale → block scale**.

### 4.3 Path C — Acquire / audit stronger finished CC0 architectural source

| Attribute | Assessment |
|---|---|
| Method | Audit external CC0 packs (e.g. KayKit City Builder Bits — previously REJECT @ R11 as R10-class monolith repeat) or new Kenney pack drops for **pre-composed neighborhood slices** |
| Visual capability | **Unknown until audit** — may exceed Kenney scatter ceiling |
| Migration cost | **High + plan gate** — import approval, license register, pipeline fit |
| License | Must be unambiguous CC0; no ambiguous Sketchfab |
| Risk | ARCH01/TownBox rejected for production; external family may repeat R10 disconnected prefab failure |
| R13/R14 preservation | **Low** — likely replaces vocabulary |

**Visual-capability evidence:** R11 candidate audit rejected KayKit as pre-assembled repeat of R10 monolith class. Path C requires **new audit with neighborhood-scale thumbnail test** before any import.

### 4.4 Recommendation

| Path | Verdict |
|---|---|
| A — Authored hero-block composition | **RECOMMEND (Phase 0 first)** |
| B — Offline neighborhood chunk | **FALLBACK** if Path A Phase 0 proof fails ≥15% Overview delta gate |
| C — External CC0 source | **HOLD** — audit-only in Phase 0 if A and B both fail; no import without explicit ChatGPT approval |

**Rationale:** Path A directly addresses the diagnosed root cause while **fully preserving** R13/R14 engineering investment. Phase 0 disposable proof de-risks before production rollout. Path B is the proven offline-kitbash escalation (R13 method at block scale). Path C remains last resort given repeated R10/R11 external-family failures.

---

## 5. Executive summary — R15 composition reset

| Phase | Name | Deliverable | Gate |
|---|---|---|---|
| **0** | **Disposable visual proof** | Fixed-camera **1440×900 Overview composition slice** — civic + commercial + residential + future lot + park/river edge **in same frame** | **≥15% materially changed pixels** vs R14 @ same camera + qualitative north-star checks |
| **1** | Hero-block composition spec | `HeroBlockCompositionSpec` + `HeroBlockCompositionLayer` — single orchestrator replacing parallel scatter authority | Phase 0 PASS only |
| **2** | Mass envelope authoring | Continuous ground/canopy/park-edge/lot-framing envelopes with road/water/M02 exclusions | Mask audit PASS |
| **3** | Integration + rollback | Wire into `WorldLabCompositionLayer`; preserve shell registry; rollback to R14 | Unit tests green |
| **4** | Evidence + STOP | Same-view R14 → R15 → north-star; integrity audit; measured DC/tris | Visual hard gate + engineering green |

**No production rollout until Phase 0 proof visibly changes neighborhood massing.**

---

## 6. Phase 0 — Disposable visual proof (mandatory pre-build)

### 6.1 Proof scope

One **fixed-camera** composition slice @ hero Overview camera (`[0,46,36]` → `[0,0,4]`), viewport **1440×900**, containing **in the same frame**:

| Element | Must read in frame |
|---|---|
| Civic shell + square | Landmark + plaza hierarchy |
| Commercial shell | Continuous frontage mass |
| Residential pair | Distinct cottage/gable silhouettes |
| Future lot | **Intentional** framed pad — not abstract markers |
| Park/river edge | Warm canopy/ground shelf — not empty meadow |

### 6.2 Proof method (Path A — recommended)

Offline or runtime-isolated **`HeroBlockCompositionProof`** — not wired to production scene graph until approved:

1. Author declarative envelope spec (JSON/TS) for ground/canopy/park-edge/lot-framing masses.
2. Render proof slice using existing shells + registered props only.
3. Capture `Docs/milestones/WF02/r15_phase0_proof_overview.png` @ R14-frozen camera.
4. Compute pixel delta vs `01_r14_overview_dawn.png` @ same crop.

**Proof is disposable** — may live under `scripts/wf02-r15-phase0-proof/` or `Docs/milestones/WF02/r15_phase0/` until Phase 1 integration.

### 6.3 Phase 0 quantitative gate

| Metric | R14 measured | R15 Phase 0 minimum | Hard fail |
|---|---:|---:|---|
| Overview MAE (vs R14 same camera) | 3.11 | **≥8.0** | <8.0 |
| Materially changed pixels (Overview) | ~4.2% | **≥15%** | <15% |
| Angled MAE (informational) | 3.86 | ≥10.0 target | — |

**Guardrail only** — metrics do not substitute for qualitative north-star checks (§8).

### 6.4 Phase 0 qualitative gate (ordinary viewer)

| Criterion | Required |
|---|---|
| Continuous frontage read | Commercial block connects visually to street edge |
| Canopy/ground mass | Visible district ground warmth — not faint grid wash |
| Park-edge warmth | East frame reads as park/river edge, not empty olive field |
| Lot intentionality | Future lot = deliberate growth pad framed by mass |
| Road/plaza hierarchy | Square + spine road readable as civic organizer |
| No evidence-only trick | Proof uses **same** production camera + scene path — no crop-to-empty or overlay-only render |

**STOP if Phase 0 fails:** Escalate to Path B audit in plan revision 15.1 — do not proceed to Phase 1 on Path A.

---

## 7. Phase 1–3 — Hero-block composition architecture (Path A)

### 7.1 New composition authority (single orchestrator)

Replace parallel scatter as **primary neighborhood read** with:

```
src/rendering/environment/heroBlock/
  heroBlockCompositionTypes.ts     — envelope specs (ground, canopy, edge, lot, plaza)
  heroBlockCompositionSpec.ts      — declarative hero-neighborhood mass authoring
  heroBlockCompositionMask.ts      — road/path/river/M02/shell-AABB exclusions
  heroBlockCompositionLayer.tsx    — single render orchestrator
  heroBlockCompositionMode.ts     — WORLD_LAB_HERO_BLOCK flag + rollback
```

**Integration point:** `WorldLabCompositionLayer` mounts `HeroBlockCompositionLayer` **instead of** independent `WorldLabGroundTint` + sparse `VegetationFrame` scatter when flag active. Shell layer unchanged.

### 7.2 Envelope categories (authored masses)

| Envelope | Purpose | Min authored density (plan) |
|---|---|---|
| `civicPlazaMass` | Square ground + radial warmth + center amenity | Connects civic shell to spine road |
| `commercialFrontageMass` | Sidewalk/canopy/ground strip along z=8–16 band | Continuous ≥28 m readable strip |
| `residentialBlockMass` | Hedge/canopy framing house pair | Distinct east/west residential reads |
| `futureLotFrameMass` | Intentional pad — mown edge, corner posts, approach path | Reads as **lot**, not fence grid |
| `parkRiverEdgeMass` | East shelf: tree belt + bank ground + color transition | ≥12 tree instances + ground role shift |
| `spineCanopyBelt` | North perimeter + road-edge trees | Closes "empty meadow" east/west read |

All envelopes clip via `heroBlockCompositionMask.ts` — reuse R4.1 exclusion corridor rules (roads, river water, M02 path buffer, shell AABBs).

### 7.3 Authority / data flow

```
HERO_NEIGHBORHOOD_LAYOUT (frozen sim/layout)
        ↓
prototypeShellManifest (frozen R14 anchors + door bindings)
        ↓
heroBlockCompositionSpec (presentation-only envelopes)
        ↓
HeroBlockCompositionLayer → GPU instancing / ground overlays
        ↓
Evidence capture (pixels authoritative)
```

**Simulation truth never flows upward from rendering.**

### 7.4 Preserved modules (subordinate or bypassed)

| Module | R15 behavior when hero-block active |
|---|---|
| `PrototypeShellLayer` | **Unchanged** — primary architecture |
| `CivicEnclosure` | Subsumed into `civicPlazaMass` or bypassed |
| `WorldLabGroundTint` | **Bypassed** — replaced by envelope ground roles |
| `VegetationFrame` | **Bypassed** — replaced by `parkRiverEdgeMass` + `spineCanopyBelt` |
| `ResidentialGardens` | Reduced to non-structural accents or bypassed |
| `FutureLotFrame` | **Replaced** by `futureLotFrameMass` |
| `CommercialFrontage` | Remains off when shell active |

---

## 8. Image-space acceptance (R15 rollout — authoritative)

### 8.1 Quantitative guardrails (R14 → R15)

| Metric | Gate |
|---|---|
| Overview materially changed pixels vs R14 | **≥15%** (3.6× R14 stagnation) |
| Overview MAE vs R14 | **≥8.0** |
| Evidence camera discipline | Shots must frame **feature**, not empty regions (§9) |

### 8.2 Qualitative north-star checklist (ordinary viewer)

| Criterion | Required |
|---|---|
| Overview reads as **one composed miniature neighborhood** | **Yes** — not four shells on empty ground |
| Continuous commercial frontage | **Yes** |
| Civic plaza hierarchy | **Yes** |
| Residential pair + intentional future lot | **Yes** |
| Park/river edge warmth | **Yes** — not empty meadow |
| R14 → R15 material Overview delta | **Yes** — unmistakable without pixel math |
| M02 door/street proof | **Yes** — inherited from R14 |
| Dawn gameplay readable | **Yes** |

**Do not PASS on metrics alone.**

---

## 9. Evidence camera discipline

Evidence shots must **show the feature being claimed**:

| Shot | Must include in frame | Must NOT |
|---|---|---|
| Overview dawn/noon | Full hero block: civic, commercial, residential, lot, park edge | Crop that hides empty regions |
| Park/river | Park-edge tree shelf + bank + water glimpse | Empty terrain fallback |
| Future lot | Framed pad with approach path | Fence-grid-only abstract marker |
| Civic | Shell + square hierarchy | Shell-only closeup as Overview substitute |
| Street/door | Citizen + door + road (R10 portal) | — |

**Forbidden:** evidence-only rendering layers, camera tricks, or post overlays that are not in production `HeroBlockCompositionLayer` path.

---

## 10. Performance budget + M03 headroom

Measure after Phase 0 proof **before** Phase 2 envelope expansion (recovery-before-add).

| Gate | Hard cap | R14 measured | R15 conservative target |
|---|---:|---:|---:|
| Overview DC | ≤140 | 90/87 | ≤115 |
| Overview tris | <150k | ~34k | ≤75k |
| Street DC | ≤100 | 54 | ≤80 |
| Street tris | — | ~65k | ≤85k |
| M03 headroom | LOD required | ~55k tris / ~50 DC slack | preserve **≥8k tris / ≥5 DC** below Overview hard cap |

**Rollback-before-add prune order:** peripheral spine trees → lot accent scatter → ground tint opacity → park-edge density **before** civic/commercial/residential shell or envelope edits.

---

## 11. Rollback compatibility

| Flag configuration | Presentation |
|---|---|
| `WORLD_LAB_HERO_BLOCK=true` | R15 hero-block composition |
| `WORLD_LAB_HERO_BLOCK=false`, `WORLD_LAB_PROTOTYPE_SHELL=true` | **R14 rollout** (current @ `3b0aa0c`) |
| Shell off, modular on | R12 modular |
| Both off | R10 prefab + World Lab modules |
| Sim / resolver / entrances | Unchanged all modes |

---

## 12. Asset / source / license / provenance

| Asset class | R15 policy |
|---|---|
| Shell GLBs | **Frozen** R13 provenance — no re-kitbash unless Path B approved |
| Props / vegetation | Registered Kenney + Quaternius only |
| New offline chunks (Path B only) | CC0 derivative + `r15_block_provenance.json` + ASSET_REGISTER row |
| External families (Path C) | **No import** until audit + ChatGPT approval |
| Evidence | Repo-relative Docs paths; `audit:wf02-evidence-integrity` CI |

---

## 13. File map (post-approval touch list)

| Action | Paths |
|---|---|
| **Create** | `src/rendering/environment/heroBlock/*` |
| **Create** | `scripts/wf02-r15-composition-strategy-audit.mjs`, `scripts/wf02-r15-phase0-proof.mjs`, `scripts/wf02-r15-composition-capture.mjs` |
| **Create** | `Docs/milestones/WF02/r15_composition_strategy_audit_plan.json`, `r15_phase0_proof_manifest.json`, `r15_composition_manifest.json` |
| **Modify** | `WorldLabCompositionLayer.tsx`, `districtCompositionSpec.ts` (deprecate/bypass paths) |
| **Modify** | `tests/unit/wf02/heroBlockComposition.test.ts`, extend `prototypeShell.test.ts` rollback cases |
| **Modify** | `package.json` scripts, `Docs/assets/ASSET_REGISTER.md` (Path B only) |
| **Preserve** | `prototypeShellManifest.json`, `prototypeShellMode.ts`, `simulation/**`, `facilityPoints.ts`, `heroNeighborhood.ts`, worker determinism |

---

## 14. Tests and audits (post-approval)

```bash
npm run audit:wf02-r15-composition-strategy   # plan artifact
npm run proof:wf02-r15-phase0                 # Phase 0 disposable proof only
npm run audit:wf02-evidence-integrity
npm run audit:wf02-r14-shell-rollout           # regression — R14 bindings preserved
npm run test:all
npm run capture:wf02-r15-composition           # post Phase 0 PASS
```

| Suite | Coverage |
|---|---|
| `heroBlockComposition.test.ts` | Envelope masks, road/water exclusions, rollback flags |
| `prototypeShell.test.ts` | R14 anchor/door/suppression unchanged |
| `evidenceIntegrity.test.ts` | Manifest ↔ committed PNG bytes |
| `worldResolver.test.ts` | Entrances unchanged |
| `streetPortalCamera.test.ts` | Portal clearance preserved |

---

## 15. Unknowns and risks

| Unknown | Mitigation |
|---|---|
| Path A envelopes may still cap at ~4–6% delta like R4.1/R14 | Phase 0 proof gate; escalate to Path B |
| Park-edge warmth may require more tris than budget | Recovery-before-add + measured prune order |
| Future lot intentionality vs sim truth (no phantom building) | Framing mass only — no fake structures |
| Path B door drift after block bake | Door socket metadata + ≤0.3 m re-audit |
| Path C license/audit latency | HOLD until A+B exhausted |

---

## 16. Explicit non-goals

| Non-goal | Reason |
|---|---|
| R14.1 scatter/re-anchor/camera/tint patch | Senior prohibited |
| WF02 milestone PASS | Composition bar still open |
| Merge PR #12 | Separate authorization |
| M03 | Separate milestone |
| 240 m legacy town | Out of hero scope |
| TownBox production port | Not approved |
| `simulation/**` / entrance edits | Frozen |
| Runtime LLM / paid API | Forbidden |

---

## 17. Definition of done (R15 — post-implementation)

| Criterion | Required |
|---|---|
| Phase 0 proof ≥15% Overview changed pixels + qualitative PASS | **Yes** |
| Hero block reads as one neighborhood @ Overview | **Yes** |
| R13 shells + R14 bindings preserved | **Yes** |
| Park/river/future lot intentional @ Overview | **Yes** |
| Overview ≥15% / MAE ≥8 vs R14; qualitative north-star PASS | **Yes** |
| Evidence integrity audit PASS | **Yes** |
| `test:all` green; 0 asset/network errors | **Yes** |
| Performance within §10 ceilings + M03 headroom | **Yes** |

**STOP if visual hard gate fails:** Post exact pixels + gap report; escalate Path B in plan revision 15.1 — do not self-merge or start M03.

---

## 18. Requirement IDs protected

| ID | R15 contribution |
|---|---|
| WF02-VISUAL-HARD-GATE | Neighborhood composition reset + Phase 0 proof |
| WF02-SCALE-001 | Frozen entrances + citizen/door/road |
| WF02-PRESERVE-SIM | No simulation edits |
| WF02-PRESERVE-M02 | Door/route preservation |
| WF02-RENDER-BUDGET | Recovery-before-add + headroom |
| WF02-DETERMINISM | Seeded presentation only |
| WF02-EVIDENCE-INTEGRITY | Repo-relative manifest audit |

---

**STOP.** Awaiting `[GOD-MODE:CHATGPT-PLAN-DECISION] Decision: APPROVED_TO_BUILD` before any R15 Phase 0 proof, composition code, asset import, merge, or M03.
