# WF02 Plan Revision 15.2 — Composition Reset Decision Plan

**State:** WAITING_FOR_CHATGPT_PLAN_APPROVAL  
**Supersedes:** Plan revision 15.1 Path B Phase 0 @ `b7f491dab00dd6367ae7186b8b6c51b6298aad7e` — **PATH_B_PHASE_0_FAIL (MAE gate)**  
**Senior arbitration:** `[GOD-MODE:CHATGPT-DECISION]` @ `b7f491d` — **FIX_REQUIRED — Next gate: PLAN_R15.2_REQUIRED**  
**Investigation base SHA:** `b7f491dab00dd6367ae7186b8b6c51b6298aad7e`  
**Branch:** `cursor/wf02-scale-calibration-754a`  
**Scope:** PLAN ONLY — no Candidate C/D Phase 0 build, production wiring, merge, Grok review, or M03 until `[GOD-MODE:CHATGPT-PLAN-DECISION] Decision: APPROVED_TO_BUILD`

---

## 1. Work item

WF02 — North-Star Scale & Aesthetic Calibration.

R15 composition reset has now run **two disciplined falsification experiments**. Both increase screen-area coverage but fail the precommitted **MAE magnitude gate**. Path B additionally proves **draw-call multiplication** unsuitable for production.

| Experiment | SHA | Changed pixels | MAE | Changed gate | MAE gate | Proof DC | Verdict |
|---|---|---:|---:|---|---|---:|---|
| **Path A** — runtime declarative envelopes | `c3d0739` | **20.09%** | **5.31** | PASS | **FAIL** | 87 | **FAIL** |
| **Path B B1** — offline mass chunks + shells | `babd0fe` | **15.79%** | **4.59** | PASS | **FAIL** | **206** | **FAIL** |
| R14 baseline | `3b0aa0c` | ~4.2% | 3.11 | — | — | ~90 | stagnation |

**Diagnostic shift:** The failure is no longer "insufficient object count." Both approaches add **secondary mass around an unchanged macro composition**. Dominant image-space anchors — block silhouette, roofline hierarchy, street-wall rhythm, civic focal mass, canopy layering — remain too similar to R14. Many pixels move slightly; **important pixels do not move decisively**.

Per senior arbitration: **do not relax metrics, do not tune B1, do not production-wire Path A/B proof code, do not proceed to B2/Path C without new plan gate.** R15.2 is a **decision plan**, not code.

---

## 2. Decision context

| Review / experiment | SHA | Gate | Lesson |
|---|---|---|---|
| WF02-R4.1 | `6dbd8b5` | BLOCKED | Scatter/tint insufficient |
| WF02-R14-SENIOR | `3b0aa0c` | FIX_REQUIRED | Shell re-anchor ≠ neighborhood composition |
| **R15 Path A Phase 0** | `c3d0739` | **FAIL** | Breadth (20%) without MAE magnitude |
| **R15 Path B Phase 0** | `babd0fe` | **FAIL** | Additive chunks; MAE worse; **206 DC** |
| WF02 milestone | — | **OPEN** | Root-cause composition change still required |

**Preserved (must not regress):**

| Asset / system | Status |
|---|---|
| Deterministic worker authority; save/snapshot architecture | Frozen |
| M02 semantic entrances/routes; `facilityPoints.ts`; `simulation/**` | Frozen |
| WF01 roads/river/terrain truth | Frozen |
| R13/R14 shells as rollback/reference + door bindings ≤0.3 m | Frozen vocabulary |
| Kenney/Quaternius provenance discipline | Frozen |
| Disposable proof-mode boundary (`?r15Phase0Proof=1`, `?r15PathBPhase0Proof=1`) | Preserve methodology |
| M03 | **HOLD** |

**Forbidden without new plan gate:**

| Action | Reason |
|---|---|
| Tune B1 chunk density/placement to pass MAE | Senior explicit prohibition |
| Production-wire `HeroBlockChunkLayer` or Path A proof layers | Both falsified |
| Relax MAE ≥8 / changed ≥15% gates retroactively | Senior explicit prohibition |
| Merge PR #12 / M03 | Separate authorization |
| New asset family import | Not authorized in R15.2 |

---

## 3. Locked falsification record (A/B — do not re-score)

### 3.1 Path A — runtime declarative envelopes

| Artifact | Role |
|---|---|
| `Docs/milestones/WF02/r15_phase0_proof_overview.png` | Proof capture |
| `Docs/milestones/WF02/r15_phase0_proof_manifest.json` | Pixel delta @ MAE 5.31 / 20.09% |
| `src/rendering/environment/heroBlockProof/*` | Disposable proof layer |

**Proved useful:** URL-gated falsification; changed-pixel gate reachable; exclusion masks reusable.  
**Proved insufficient:** Runtime scatter = low-amplitude dressing; does not shift dominant hierarchy.

### 3.2 Path B B1 — offline mass chunks + separate shells

| Artifact | Role |
|---|---|
| `Docs/milestones/WF02/r15_pathb_phase0_proof_overview.png` | Proof capture |
| `Docs/milestones/WF02/r15_pathb_phase0_proof_manifest.json` | Pixel delta @ MAE 4.59 / 15.79% |
| `public/assets/glb/wf02/block-chunks/*.glb` | 82 + 58 mesh parts, 6654 tris total |
| `src/rendering/blockChunkProof/*` | Disposable proof layer |

**Proved useful:** Offline kitbash pipeline; provenance audit; shell door bindings preserved.  
**Proved insufficient:** Chunks **surround** shells instead of **replacing** macro mass; MAE **lower** than Path A despite structural intent; **206 proof DC** from per-part mesh retention.

**Disposition:** Both Path A and Path B proof branches remain **diagnostic-only**. Neither is a production candidate.

---

## 4. Root-cause diagnosis (post A/B)

### 4.1 Symptom

Two composition experiments now affect enough screen area but produce only **weak per-pixel visual displacement**:

- Path A: high breadth (20%), low aggregate energy (MAE 5.31)
- Path B: minimal breadth pass (15.79%), even lower energy (MAE 4.59), worse draw cost

### 4.2 Mechanism

| Dominant anchor | Owner today | A/B effect |
|---|---|---|
| Block silhouette / occupancy | 4 R13 shells + sparse meadow | Unchanged centroid |
| Roofline hierarchy | Shell GLBs (4 draws) | Shells retained on top |
| Street-wall rhythm | Commercial shell + road spine | Frontage mass additive only |
| Civic focal mass | Civic shell + thin plaza scatter | No replacement |
| Canopy / foreground layering | Chunk/prop scatter at ground level | Low vertical contrast at Overview altitude |

Both paths **preserve the same visual hierarchy** while adding peripheral dressing. The Overview camera `[0,46,36] → [0,0,4]` sees shell rooflines and road spine as before; added ground-level trees/pavers shift pixels weakly.

### 4.3 Draw-call multiplication (Path B specific)

| Component | Meshes | Draw impact |
|---|---:|---|
| `wf02-hero-block-mass-west.glb` | **82** | 82 draws |
| `wf02-hero-block-mass-east.glb` | **58** | 58 draws |
| R13 shells | 4 | 4 draws |
| Terrain/roads/citizen/etc. | — | ~62 draws |
| **Proof total** | — | **206 DC** |

**Cause:** `gltf-transform merge --merge-scenes` retained one mesh per kitbashed part. B1 authored offline scatter **inside GLBs** but did not batch materials or flatten geometry. Production target ≤140 Overview DC is **incompatible** with this approach without post-merge `flatten`/`join`/`palette`.

---

## 5. Metric analysis (analytical — gates unchanged for A/B)

### 5.1 Why changed-pixels passes while MAE fails

Global MAE averages absolute RGB delta over **all** pixels:

```
MAE = Σ|Δpixel| / (width × height)
```

With ~80–85% unchanged pixels (Δ≈0), even 15–20% changed pixels at low contrast (Δ≈15–27 on 0–255 scale) yields MAE ≈4.5–5.3.

| Experiment | Changed % | MAE | Implied avg Δ on changed pixels* |
|---|---:|---:|---:|
| Path A | 20.09% | 5.31 | ~26.4 |
| Path B | 15.79% | 4.59 | ~29.1 |
| **MAE ≥8 @ 15% changed requires** | 15% | **8.0** | **~53.3** |

\*Approximation: `MAE / (changedPct/100)` — illustrative, not a gate substitute.

**Conclusion:** Current gates detect **breadth** (changed %) and **aggregate energy** (MAE) separately. Path A/B satisfy breadth with **faint** deltas. Passing MAE ≥8 without metric gaming requires **decisive contrast or structural replacement** on important pixels — not more faint scatter.

### 5.2 Correlation with north-star perceptual change

| Observation | Implication |
|---|---|
| R14 → north-star is visually obvious to ordinary viewers | MAE vs R14 ≈ 3.11 — far below 8 |
| Path A/B look near R14 to ordinary viewers (Grok R4.1/R14 precedent) | MAE 4.5–5.3 — only modestly above R14 |
| North-star delta likely requires large silhouette/palette shifts | MAE ≥8 may correlate with perceptual change **if** changes are on hierarchy pixels, not grass tint |

**R15.2 rule:** Keep MAE ≥8 + changed ≥15% as **locked comparison gates** for A/B. Do **not** retroactively re-score A/B into passes.

### 5.3 Proposed supplementary metrics (approval required before next experiment)

| ID | Metric | Purpose | Retroactive? |
|---|---|---|---|
| `roi-mae` | MAE on central 60% hero-block crop | Weight hierarchy pixels | **No** |
| `high-contrast-changed-pct` | Changed pixels at threshold ≥20 | Detect decisive shifts vs wash | **No** |
| `silhouette-edge-delta` | Edge-map occupancy vs north-star | Shape/mass independent of tint | **No** |

If ChatGPT approves a supplementary metric for Candidate C Phase 0, it must be declared **before** capture. Existing gates remain mandatory until explicitly superseded in a future plan revision.

---

## 6. Strategy comparison (mandatory — choose path for next experiment)

**Artifact:** [`r15_composition_reset_audit_plan.json`](r15_composition_reset_audit_plan.json)  
**Script:** `npm run audit:wf02-r15-composition-reset`

### 6.1 Rejected — do not revisit without new gate

| ID | Path | Verdict | Evidence |
|---|---|---|---|
| A | Runtime declarative envelopes | **REJECT falsified** | MAE 5.31 FAIL |
| B1 | Additive offline chunks + shells | **REJECT falsified** | MAE 4.59 FAIL; 206 DC |
| B1-tune | Density/placement tuning | **FORBIDDEN** | Senior prohibition |
| R14.1 | Scatter/re-anchor/tint patch | **REJECT** | Prior senior prohibition |

### 6.2 Candidate C — Replacement hero-block assembly (RECOMMEND primary)

| Attribute | Assessment |
|---|---|
| **Method** | Author **1–3 offline merged assemblies** that **REPLACE** (not surround) the current dominant hero-neighborhood presentation: suppress parallel scatter modules (`WorldLabGroundTint`, `VegetationFrame`, `ResidentialGardens`, `FutureLotFrame`, `CivicEnclosure`) and **hide or subordinate shell visuals** in proof mode while retaining a **thin semantic door/socket layer** bound to frozen M02 entrances |
| **Visual hypothesis** | Shifts block silhouette, roofline hierarchy, and street-wall rhythm because **macro mass authority** changes — not merely pixel coverage |
| **Door authority** | Separate socket markers / invisible collision anchors at R14 `doorBindings`; shells become reference-only or hidden in Phase 0 proof |
| **Draw strategy** | Post-import `gltf-transform flatten` + `join` + `palette` → **≤3 materials, ≤1 mesh per assembly**; target **≤6 DC** for hero block in proof |
| **Migration cost** | **Medium-high** — new assembly spec + merge pipeline + Phase 0 proof |
| **License** | Registered Kenney CC0 only (same sources as B1, different integration) |
| **Risk** | Door/socket revalidation; assembly may still fail MAE if authored as recolored scatter |
| **Abort** | Phase 0 MAE <8 **and** qualitative hierarchy unchanged; or hero-block proof DC >12 |

**Replacement boundary (explicit):**

```
SUPPRESS in proof/production candidate mode:
  WorldLabGroundTint, VegetationFrame, ResidentialGardens,
  FutureLotFrame, CivicEnclosure, ModularAssemblyLayer scatter

REPLACE visual mass with:
  1–3 batched hero-block assemblies (offline GLB)

RETAIN separately (never baked into assembly doors):
  M02 entrance coords, HERO_NAV, door socket markers,
  facilityPoints.ts, simulation/**

OPTIONAL hide in Phase 0 proof only:
  PrototypeShellLayer visuals (door sockets remain)
```

### 6.3 Candidate D — Framing feasibility audit (RECOMMEND secondary / parallel analytical)

| Attribute | Assessment |
|---|---|
| **Method** | Analytical Phase 0 **without new geometry**: measure whether frozen Overview @ 64×54 m hero bounds + `[0,46,36]` altitude makes north-star-family delta **mathematically unrealistic** at town scale; compare ROI metrics vs full-frame; simulate bounded camera/framing adjustments that improve **normal gameplay readability** |
| **Visual hypothesis** | May reveal **metric/framing mismatch** rather than composition technique gap |
| **Constraint** | Any framing correction must improve **default gameplay** (dawn Overview readability, Street portal proofs) — **not** metric gaming |
| **Deliverable** | Analytical report + optional **bounded** `HERO_NEIGHBORHOOD_DEFINITION.cameras.overview` proposal with before/after gameplay evidence |
| **Risk** | Camera change alone may pass MAE without north-star perceptual improvement |
| **Abort** | Framing change improves MAE but not ordinary-viewer north-star read; or degrades M02 Street proofs |

**Candidate D is not a substitute for Candidate C.** It answers whether the **evaluation frame** itself blocks progress. If D proves framing is the blocker, a **bounded correction** may accompany C — not replace it.

### 6.4 Candidate B2 — Monolithic block + external sockets (HOLD)

Deferred from R15.1. High door-drift risk. Escalate only if Candidate C Phase 0 shows **qualitative hierarchy improvement** but fails MAE — not if C fails entirely.

### 6.5 Recommendation matrix

| Priority | Candidate | Next authorized work |
|---|---|---|
| **1** | **C — Replacement assembly** | Phase 0 disposable prototype (post R15.2 approval) |
| **2** | **D — Framing audit** | Analytical report (may run in parallel with C planning) |
| — | B2 monolithic | Hold |
| — | Path C external import | Hold — separate license decision |
| **Reject** | A, B1, B1-tune | Locked falsification |

---

## 7. Draw-call and material strategy (mandatory before any build)

Measure and enforce **before** Candidate C Phase 0 integration.

| Budget line | Hard cap | R15.2 target (Candidate C) |
|---|---:|---:|
| Overview DC (total) | ≤140 | ≤110 preferred |
| Hero-block assembly DC | — | **≤6** (1–3 flattened GLBs + sockets) |
| Street DC | ≤100 | ≤85 |
| Overview tris | <150k | ≤75k |
| M03 headroom | LOD required | **≥5 DC / ≥8k tris** below hard cap |

**Pipeline requirements (Candidate C):**

1. Offline kitbash from registered Kenney sources (reuse exclusion tooling).
2. **`gltf-transform flatten`** — single mesh per assembly (or ≤2 if ground/canopy material split required).
3. **`palette` / `join`** — ≤3 materials per assembly; shared `colormap` where possible.
4. Runtime: **one `ModelAsset` draw per assembly** — not per tree instance.
5. Proof-mode audit must report mesh count ≤3 per assembly before capture.

**Prune order if over budget:** reduce assembly part count → merge materials → decimate ground mesh → **never** sacrifice door socket accuracy or M02 corridor readability first.

---

## 8. Layer replacement boundaries

### 8.1 Presentation authority map

| Layer / module | Current role | Candidate C action |
|---|---|---|
| `PrototypeShellLayer` | Dominant roofline/silhouette (4 DC) | **Hide visuals in Phase 0**; retain registry for rollback; sockets separate |
| `WorldLabGroundTint` | Faint district wash | **Suppress** |
| `VegetationFrame` | Perimeter scatter | **Suppress** |
| `ResidentialGardens` | Local hedge/path | **Suppress** |
| `FutureLotFrame` | Lot pad markers | **Suppress** — lot negative space **authored into assembly** |
| `CivicEnclosure` | Plaza pavers | **Suppress** — plaza mass **in assembly** |
| `ModularAssemblyLayer` | Legacy modular | **Suppress in hero block** |
| `BlockChunkPhase0ProofLayer` | B1 diagnostic | **No production path** — retain as falsification record |
| `HeroBlockPhase0ProofLayer` | Path A diagnostic | **No production path** — retain as falsification record |
| Terrain / roads / river | WF01 truth | **Unchanged** |
| M02 door sockets | Semantic authority | **Separate thin layer** — ≤0.3 m to entrances |

### 8.2 Simulation boundary (must not cross)

```
facilityPoints.ts ──► simulation/** ──► worker PRNG ──► save/schema
        │                      │
        └── HERO_NAV / entrances (frozen coords)
                    │
                    └── door socket markers (presentation-only, derived)
```

No presentation assembly may become simulation truth.

---

## 9. Phase 0 proof plan (post R15.2 approval — Candidate C)

Same falsification discipline as R15 Path A/B.

### 9.1 Proof scope

Fixed Overview @ **1440×900**, camera `[0,46,36] → [0,0,4]`, simMinute 0 (dawn).

| Element | Must read differently from R14 |
|---|---|
| Block silhouette / occupancy | Continuous mass — not four islands on meadow |
| Roofline hierarchy | Assembly-driven — not identical shell cluster |
| Street-wall rhythm | Commercial frontage connects visually |
| Civic focal mass | Landmark weight — not thin plaza scatter |
| Park/river edge | Warm shelf — not empty east meadow |
| Future lot | Intentional growth pad framed by mass |

### 9.2 Proof method

1. Offline author **1–3 flattened assemblies** (registered Kenney only).
2. URL-gated disposable layer: `?r15ReplacementPhase0Proof=1` — **NOT** production.
3. Render: replacement assemblies + door sockets + terrain/roads; **suppress** shells + scatter modules.
4. Capture vs `01_r14_overview_dawn.png`.
5. Close proofs: Street store/workshop/home doors ≤0.3 m; hero-block crop strip.

### 9.3 Quantitative gates (unchanged unless superseded in approval)

| Metric | Gate | Hard fail |
|---|---:|---|
| Overview MAE vs R14 | **≥8.0** | <8.0 |
| Materially changed pixels (threshold 5) | **≥15%** | <15% |

Plus **approved supplementary metric** if declared in approval message.

### 9.4 Qualitative gates (ordinary viewer)

| Criterion | Required |
|---|---|
| Hierarchy shift visible vs R14 at Overview | **Yes** — not mistakable for R14 |
| North-star direction | Warmth, density, district character improving |
| No evidence trick | Same production camera path unless Candidate D approved bounded framing |
| Door/road alignment | Street preset ≤0.3 m |

### 9.5 Objective abort criteria (before code — enforce after capture)

| Condition | Action |
|---|---|
| MAE <8 OR changed <15% | **STOP** — FAIL handoff; no tune loop |
| Qualitative hierarchy unchanged | **STOP** — even if metrics pass |
| Hero-block proof DC >12 | **STOP** — batching failure |
| Door drift >0.3 m | **STOP** |
| Asset/network errors >0 | **STOP** |

**Do not proceed to production wiring on Phase 0 FAIL.**

---

## 10. Candidate D analytical plan (optional parallel)

| Step | Deliverable |
|---|---|
| D1 | ROI vs full-frame metric report on R14, Path A, Path B, north-star reference PNG |
| D2 | Frustum coverage analysis: % of hero block occupying central 40% of frame |
| D3 | Bounded camera proposal (if justified): max Δposition 15% / Δtarget 10% with gameplay rationale |
| D4 | Street/M02 portal regression checklist for any proposed framing change |

**Output:** `Docs/milestones/WF02/r15_framing_feasibility_audit.md` (post-approval). No runtime change in R15.2 plan gate.

---

## 11. Rollback compatibility

| Flag / mode | Presentation |
|---|---|
| `?r15ReplacementPhase0Proof=1` | Candidate C disposable proof (post-approval) |
| `?r15PathBPhase0Proof=1` | Path B diagnostic (frozen record) |
| `?r15Phase0Proof=1` | Path A diagnostic (frozen record) |
| `WORLD_LAB_PROTOTYPE_SHELL=true` (default) | **R14 rollout** — current production path |
| Shell off, modular on | R12 modular |
| Both off | R10 prefab + World Lab modules |
| Sim / resolver / entrances | Unchanged all modes |

---

## 12. File map (post-approval touch list — plan only)

| Action | Paths |
|---|---|
| **Create (C Phase 0)** | `scripts/wf02-r15-replacement-import.mjs`, `scripts/wf02-r15-replacement-phase0-proof.mjs` |
| **Create (C Phase 0)** | `src/rendering/replacementProof/*`, flattened GLBs under `public/assets/glb/wf02/hero-assemblies/` |
| **Create (D audit)** | `scripts/wf02-r15-framing-feasibility-audit.mjs`, `Docs/milestones/WF02/r15_framing_feasibility_audit.md` |
| **Modify (C Phase 0)** | `WorldLabCompositionLayer.tsx` (replacement proof branch only) |
| **Preserve diagnostic** | `blockChunkProof/*`, `heroBlockProof/*`, A/B manifests and PNGs |
| **Do NOT touch** | `simulation/**`, `facilityPoints.ts`, `heroNeighborhood.ts` entrances/nav, worker, save schema |

---

## 13. Tests and audits

```bash
npm run audit:wf02-r15-composition-reset    # this plan revision
npm run audit:wf02-r15-pathb-chunk          # Path B record (existing)
npm run proof:wf02-r15-phase0               # Path A record (existing)
npm run proof:wf02-r15-pathb-phase0         # Path B record (existing)
npm run audit:wf02-r14-shell-rollout        # door binding regression baseline
npm run test:all
```

Post-approval Candidate C additions: `replacementProof.test.ts`, mesh-count ≤3 audit, door socket ≤0.3 m audit.

---

## 14. Explicit non-goals

| Non-goal | Reason |
|---|---|
| Tune B1 chunks or Path A scatter | Senior prohibited |
| Production-wire falsified A/B proof layers | Both FAIL |
| Relax MAE / changed-pixel gates retroactively | Senior prohibited |
| B2 monolithic without C attempt | Escalation order |
| Path C external asset import | Not authorized |
| Merge PR #12 / M03 | Separate authorization |
| `simulation/**` / entrance edits | Frozen |
| Metric gaming via opacity/camera/crop overlay | Senior prohibited |

---

## 15. Definition of done (R15.2 — plan gate only)

| Criterion | Required |
|---|---|
| Path A + Path B falsification recorded and locked | **Yes** |
| Metric rationale documented | **Yes** |
| ≥2 genuinely different root-cause candidates compared | **Yes** (C + D) |
| Layer replacement boundaries explicit | **Yes** |
| Draw-call/material strategy with production budget | **Yes** |
| Phase 0 proof + abort criteria defined | **Yes** |
| File map + rollback | **Yes** |
| `npm run audit:wf02-r15-composition-reset` artifact | **Yes** |

**No implementation, evidence capture, Grok review, merge, or M03 in R15.2 plan gate.**

---

## 16. Requirement IDs protected

| ID | R15.2 contribution |
|---|---|
| WF02-VISUAL-HARD-GATE | Decision plan after A/B falsification |
| WF02-PRESERVE-SIM | Explicit simulation boundary |
| WF02-PRESERVE-M02 | Door socket preservation strategy |
| WF02-RENDER-BUDGET | Draw-call batching requirements |
| WF02-EVIDENCE-INTEGRITY | Locked A/B manifests; no retroactive re-score |
| WF02-DETERMINISM | Presentation-only scope unchanged |

---

**STOP.** Awaiting `[GOD-MODE:CHATGPT-PLAN-DECISION] Decision: APPROVED_TO_BUILD` before Candidate C Phase 0 prototype, Candidate D analytical audit implementation, production wiring, merge, or M03.
