# WF02 Plan Revision 15.1 — Path B Neighborhood Chunk (Offline Kitbash)

**State:** WAITING_FOR_CHATGPT_PLAN_APPROVAL  
**Supersedes:** Plan revision 15 Path A Phase 0 @ `f7c0c57587f963d900c82084ed5f28125d1e12f0` — **PHASE_0_FAIL (MAE gate)**  
**Senior arbitration:** `[GOD-MODE:CHATGPT-DECISION]` R15-PHASE0-ARBITRATION @ `f7c0c57` — **FIX_REQUIRED — Next gate: PLAN_R15.1_PATH_B**  
**Investigation base SHA:** `f7c0c57587f963d900c82084ed5f28125d1e12f0`  
**Branch:** `cursor/wf02-scale-calibration-754a`  
**Scope:** PLAN ONLY — no Path B chunk import, offline kitbash, disposable prototype build, production wiring, merge, or M03 until `[GOD-MODE:CHATGPT-PLAN-DECISION] Decision: APPROVED_TO_BUILD`

---

## 1. Work item

WF02 — North-Star Scale & Aesthetic Calibration.

R15 Path A Phase 0 **correctly falsified** runtime declarative hero-block envelopes before production wiring. Engineering @ `f7c0c57` is green (**214/214** tests; proof Overview **87 DC / ~34k tris**; 0 asset/network errors). **Visual falsification gate fails:**

| Metric | R14 baseline | Path A Phase 0 | Gate | Verdict |
|---|---:|---:|---:|---|
| Materially changed pixels | ~4.2% | **20.09%** | ≥15% | **PASS** |
| Overview MAE vs R14 | 3.11 | **5.31** | ≥8.0 | **FAIL** |
| Overall Phase 0 | — | — | both required | **FAIL** |

**Diagnostic:** Path A increased **breadth** (20% of pixels move) without sufficient **aggregate visual energy** (MAE 5.31). The frame receives more low-amplitude ground/canopy/prop dressing around independent shell islands — not decisive neighborhood-scale form, depth, or occlusion change.

Per R15 §6.4 and senior arbitration: **do not relax gates, do not tune Path A, do not proceed to Path A Phase 1.** Escalate to **Path B** — bounded offline-authored neighborhood chunk(s), extending the proven R13 offline shell method from **building scale → block scale**.

---

## 2. Decision context

| Review | SHA | Gate | Lesson |
|---|---|---|---|
| WF02-R4.1 | `6dbd8b5` | BLOCKED | Scatter/tint insufficient |
| WF02-R13-SENIOR | `d2ebdd4` | PASS_PROTOTYPE_STRATEGY | Offline kitbash shells escape modular-wall cap |
| WF02-R14-SENIOR | `3b0aa0c` | FIX_REQUIRED | Shell re-anchor ≠ neighborhood composition |
| **R15 Path A Phase 0** | **`f7c0c57`** | **PHASE_0_FAIL** | Runtime envelopes = breadth without structural mass |
| WF02 milestone | — | **OPEN** | North-star neighborhood read still required |

**Preserved (must not regress):**

| Asset / system | Status |
|---|---|
| Four R13 shell GLBs + R14 registry origins / suppression / door bindings | Frozen vocabulary |
| M02 door bindings ≤0.3 m; `HERO_NAV`; entrances/routes | Frozen sim truth |
| `facilityPoints.ts`, `simulation/**`, worker determinism | Frozen |
| R9 resolver boundary; evidence-integrity audit tooling | Frozen |
| Phase 0 disposable proof pattern (URL-gated, not production) | Preserve methodology |
| Performance reserve (~55k+ tris / ~50+ DC below hard caps) | Preserve M03 headroom |
| Rollback flags (block chunk → R14 shells → modular → prefab) | Required |

**Forbidden without new plan gate:**

| Action | Reason |
|---|---|
| Path A Phase 1 production wiring | Phase 0 hard-fail |
| MAE threshold relaxation / metric gaming | Senior explicit prohibition |
| Camera/crop/evidence manipulation | Senior explicit prohibition |
| External asset-family expansion (Path C) | Not authorized in R15.1 |
| Merge PR #12 / M03 | Separate authorization |

---

## 3. Path A falsification — preserved diagnostic evidence

**Evidence @ `f7c0c57`:**

| Artifact | Role |
|---|---|
| `Docs/milestones/WF02/r15_phase0_proof_overview.png` | Disposable proof capture |
| `Docs/milestones/WF02/r15_phase0_proof_manifest.json` | Pixel delta + diagnostics |
| `Docs/milestones/WF02/compare_r14_r15_phase0_proof.png` | R14 vs Path A compare strip |
| `npm run proof:wf02-r15-phase0` | Capture harness (reusable for Path B) |

**What Path A proved useful:**

- URL-gated disposable proof (`?r15Phase0Proof=1`) correctly avoided production composition authority.
- Changed-pixel gate can be met (20.09%) with zone-limited ground + 100+ Kenney prop placements.
- MAE gate exposes **low-contrast distributed dressing** — changed pixels alone are insufficient.
- `compositionMask` road/water/path exclusions remain valid reusable helpers.

**What Path A proved insufficient:**

- Runtime declarative envelopes decompose the hero block into many small-amplitude elements.
- Replacing R14 scatter with proof scatter changes coverage, not dominant neighborhood silhouette.
- Ground overlay opacity / prop count increases cannot reach MAE ≥8 without metric gaming.

**Disposition:** Treat Path A proof code as **disposable diagnostic** — not production composition to salvage. See §12 discard matrix.

---

## 4. Strategy — Path B offline neighborhood chunk(s)

**Artifact (plan gate):** [`r15_path_b_audit_plan.json`](r15_path_b_audit_plan.json)  
**Script:** `npm run audit:wf02-r15-path-b`

### 4.1 Method

Extend R13 **`import:wf02-r13-shells`** offline kitbash pipeline to author **1–2 presentation GLBs** that encode **coherent neighborhood-scale mass**:

```
ground plane transitions + canopy belts + park/river edge shelf + lot framing + plaza hierarchy
        → baked into offline chunk mesh(es)
        → thin runtime placement in hero neighborhood
```

**Not** another runtime instanced scatter grid. **Not** another envelope opacity pass.

### 4.2 Integration mode comparison (mandatory)

| Mode | Label | Verdict | Door authority | Visual coherence | Risk |
|---|---|---|---|---|---|
| **B1** | **1–2 mass chunks + retained separate R13/R14 shells** | **RECOMMEND** | Existing `doorBindings` + frozen entrances | High if chunks encode continuous mass | **Low** door drift |
| B2 | Single monolithic block with baked shell silhouettes + external sockets | Fallback | Re-derived socket metadata + ≤0.3 m re-audit | Highest | **High** door drift |
| A | Runtime declarative envelopes | **REJECT** | n/a | Phase 0 falsified | Proven insufficient |

**R15.1 recommendation: B1 — mass chunk(s) + separate shells.**

Rationale: R13/R14 already validated shell vocabulary and M02 door bindings. B1 adds neighborhood-scale **mass authority** without rebaking door-critical architecture. B2 reserved if B1 Phase 0 prototype still fails MAE gate with qualitative improvement.

### 4.3 Shell relationship decision (explicit)

| Question | R15.1 decision |
|---|---|
| Do R13 shells remain separate runtime placements? | **Yes (B1)** — primary architecture + door authority |
| Are shells visually baked into block chunk? | **No (B1 first)** — chunks surround/frame shells; shells render on top |
| Can clinic remain Kenney prefab? | **Yes** — unchanged from R14 policy |
| Do chunks replace `WorldLabGroundTint` / `VegetationFrame` scatter? | **Yes, when block-chunk mode active** — chunks become primary neighborhood read |
| Do chunks replace `PrototypeShellLayer`? | **No** — shells remain authoritative silhouettes |

If B1 Phase 0 fails, B2 may be audited in plan revision 15.2 with explicit door socket revalidation plan — **not in R15.1 build scope**.

---

## 5. Proposed block chunk design (plan-only)

Hero neighborhood bounds: **~64×54 m** (`HERO_NEIGHBORHOOD_DEFINITION.bounds`).

### 5.1 Chunk C1 — West/civic-residential mass (`wf02-hero-block-mass-west.glb`)

| Attribute | Target |
|---|---|
| Footprint | x: −30…8, z: −22…30 (clipped to non-road/non-water) |
| Encodes | Civic plaza ground + radial warmth; residential block hedge/canopy framing; future-lot pad edge; north spine canopy belt |
| Excludes | Road/spine/sidewalk corridors; river water envelope; M02 entrance buffers; shell door volumes |
| Est. tris | ≤12k |
| Runtime draws | 1 |
| Placement anchor | `{ x: 0, y: 0, z: 4 }` (hero block centroid) |

### 5.2 Chunk C2 — East/commercial-park-river mass (`wf02-hero-block-mass-east.glb`)

| Attribute | Target |
|---|---|
| Footprint | x: −8…20, z: −16…22 (west of river corridor envelope) |
| Encodes | Commercial frontage ground/canopy strip; park-river edge tree shelf + bank transition; east perimeter closure |
| Excludes | Road corridors; river water; commercial shell door sockets (store/workshop) |
| Est. tris | ≤14k |
| Runtime draws | 1 |
| Placement anchor | `{ x: 8, y: 0, z: 6 }` |

**Combined chunk budget (plan):** ≤26k tris + 4 shell draws (~17.5k) + terrain/roads/citizen ≈ **≤55k Overview tris** — within R14 headroom.

### 5.3 Offline kitbash sources (registered only)

| Category | Registered sources |
|---|---|
| Canopy | `tree-large.glb`, `tree-small.glb` |
| Edge framing | `fence-low.glb`, `planter.glb` |
| Ground transitions | `path-stones-short.glb`, `path-stones-messy.glb`, `path-long.glb` |
| Reference massing | Existing 4 R13 shell GLBs (guide envelopes only in B1 — not merged into chunk) |
| **Forbidden** | New asset families; Quaternius-only block if not already registered; Path C imports |

**Pipeline:** Extend `scripts/wf02-r13-shell-import.mjs` → `scripts/wf02-r15-block-chunk-import.mjs` (post-approval). Provenance → `Docs/milestones/WF02/r15_block_chunk_provenance.json`. ASSET_REGISTER row per chunk.

### 5.4 Road/water/M02 exclusion (offline authoring)

Reuse `compositionMask.ts` exclusion logic as **authoring guide**:

- River corridor envelope half-width ≈16 m from polyline — no chunk geometry inside.
- Road width 6 m + sidewalk 1.4 m + margin — boolean cut corridors.
- M02 entrances: `(16, −6.4)`, `(−14, 10.8)`, `(4, 10.8)` — 0.8 m buffer volumes excluded from chunk mesh.
- Shell AABB footprints — leave clearance gaps; no z-fighting with separate shells.

Offline authoring may use boolean subtraction in gltf-transform merge step; runtime does **not** rely on live clipping alone.

---

## 6. Phase 0 — Path B disposable prototype (mandatory pre-build)

Same falsification discipline as R15 Path A Phase 0.

### 6.1 Proof scope

One **fixed-camera** Overview @ **1440×900**, camera `[0,46,36]` → `[0,0,4]`, containing in **same frame**:

| Element | Must read |
|---|---|
| Civic shell + plaza mass | Landmark + hierarchy |
| Commercial shell + frontage mass | Continuous strip |
| Residential pair | Distinct silhouettes framed by mass |
| Future lot | Intentional pad — not abstract markers |
| Park/river edge | Warm shelf — not empty meadow |

### 6.2 Proof method (Path B)

1. Offline kitbash **C1 + C2** chunk GLBs (registered Kenney sources only).
2. URL-gated disposable layer: `?r15PathBPhase0Proof=1` — **NOT** production scene graph.
3. Render: `PrototypeShellLayer` + block chunks + frozen terrain/roads (R14 scatter bypassed).
4. Capture `Docs/milestones/WF02/r15_pathb_phase0_proof_overview.png`.
5. Pixel delta vs `01_r14_overview_dawn.png` @ same crop (reuse `wf02-r15-pixel-delta.mjs` harness).

### 6.3 Quantitative gates (unchanged)

| Metric | R14 | Phase 0 minimum | Hard fail |
|---|---:|---:|---|
| Overview MAE vs R14 | 3.11 | **≥8.0** | <8.0 |
| Materially changed pixels | ~4.2% | **≥15%** | <15% |

**Do not weaken gates after seeing results.** Metrics necessary, not sufficient.

Path A achieved 20.09% changed / MAE 5.31 — Path B must improve **MAE** materially while maintaining changed-pixel gate, through **structural mass** not opacity tuning.

### 6.4 Qualitative gates (ordinary viewer)

| Criterion | Required |
|---|---|
| Continuous frontage read | Commercial block connects to street edge |
| Canopy/ground mass | Visible district warmth — not faint grid wash |
| Park-edge warmth | East frame reads as park/river edge |
| Lot intentionality | Future lot = deliberate growth pad |
| Road/plaza hierarchy | Square + spine readable |
| Door/road alignment | Close proof: M02 doors ≤0.3 m vs shell bindings |
| No evidence trick | Same production camera path; no crop/camera/overlay gaming |

**STOP if Phase 0 fails:** Escalate B2 monolithic audit or Path C hold — do not production-wire failed prototype.

---

## 7. Phases 1–4 — Path B production architecture (post Phase 0 PASS only)

| Phase | Name | Deliverable | Gate |
|---|---|---|---|
| **0** | Path B disposable prototype | URL-gated chunk proof + pixel delta | §6 gates PASS |
| **1** | Block chunk registry | `blockChunkManifest.json` + provenance + ASSET_REGISTER | Phase 0 PASS |
| **2** | Runtime layer | `HeroBlockChunkLayer.tsx` + mode flag + rollback | Door audit PASS |
| **3** | Integration | Wire into `WorldLabCompositionLayer`; bypass R14 scatter | Unit tests green |
| **4** | Evidence + STOP | R14 → R15 Path B → north-star; integrity audit | Visual hard gate |

**Integration point:** When `WORLD_LAB_HERO_BLOCK_CHUNK=true`:

```
PrototypeShellLayer (unchanged)
HeroBlockChunkLayer (C1 + C2)
  — replaces WorldLabGroundTint, VegetationFrame, ResidentialGardens, FutureLotFrame, CivicEnclosure scatter
terrain / roads / river carve (unchanged)
```

### 7.1 Authority / data flow

```
HERO_NEIGHBORHOOD_LAYOUT (frozen sim/layout)
        ↓
prototypeShellManifest (frozen R14 shells + doorBindings)
        ↓
blockChunkManifest (presentation-only chunk placements)
        ↓
HeroBlockChunkLayer → 2 GLB draws
        ↓
Evidence capture (pixels authoritative)
```

Simulation truth never flows upward from rendering.

---

## 8. Door binding / M02 proof requirements

| Label | Sim entrance | Shell binding | R15.1 gate |
|---|---|---|---|
| `home-door` | (16, −6.4) | S3 cottage local | ≤0.3 m visual delta |
| `store-door` | (−14, 10.8) | S2 commercial local | ≤0.3 m |
| `workshop-door` | (4, 10.8) | S2 commercial local | ≤0.3 m |

**Mandatory audits (post-approval):**

```bash
npm run audit:wf02-r14-shell-rollout    # regression — bindings unchanged
npm run audit:wf02-evidence-integrity
```

Chunk mesh must **not** occlude door portals or misalign path approach geometry visible in Street preset.

---

## 9. Performance budget + M03 headroom

Measure after Path B Phase 0 **before** production integration.

| Gate | Hard cap | R14 measured | Path B Phase 0 target | Path B production target |
|---|---:|---:|---:|---:|
| Overview DC | ≤140 | 90/87 | ≤95 | ≤110 |
| Overview tris | <150k | ~34k | ≤55k | ≤75k |
| Street DC | ≤100 | 54 | ≤85 | ≤85 |
| M03 headroom | LOD required | ~55k slack | preserve | **≥8k tris / ≥5 DC** below hard cap |

**Recovery-before-add prune order:** east chunk canopy density → west chunk lot accents → chunk ground mesh decimation → **never** sacrifice shell silhouettes or M02 corridor first.

---

## 10. Rollback compatibility

| Flag configuration | Presentation |
|---|---|
| `WORLD_LAB_HERO_BLOCK_CHUNK=true` | R15.1 Path B block chunks + shells |
| `WORLD_LAB_HERO_BLOCK_CHUNK=false`, `WORLD_LAB_PROTOTYPE_SHELL=true` | **R14 rollout** (current production path) |
| Shell off, modular on | R12 modular |
| Both off | R10 prefab + World Lab modules |
| Sim / resolver / entrances | Unchanged all modes |

Path A proof flag (`r15Phase0Proof=1`) remains diagnostic-only; remove from production path after Path B Phase 0 supersedes.

---

## 11. Asset / license / provenance

| Asset class | R15.1 policy |
|---|---|
| R13 shell GLBs | **Frozen** — not re-kitbashed unless B2 explicitly approved |
| Block chunks C1/C2 | CC0 Kenney derivative only; `r15_block_chunk_provenance.json` |
| Props in chunks | Registered Kenney paths only — measured in audit |
| External families | **No import** (Path C HOLD) |
| Evidence | Repo-relative Docs paths; `audit:wf02-evidence-integrity` |

---

## 12. Path A Phase 0 discard matrix

| Component | Disposition | Rationale |
|---|---|---|
| `heroBlockProof/heroBlockPhase0ProofMode.ts` | **Discard** | Path A proof gate only |
| `heroBlockProof/heroBlockPhase0ProofSpec.ts` | **Discard** | Runtime envelope scatter falsified |
| `heroBlockProof/HeroBlockPhase0ProofLayer.tsx` | **Discard** | Not production authority |
| `heroBlockProof/HeroBlockPhase0ProofGround.tsx` | **Discard** | Overlay approach insufficient |
| `heroBlockProof/heroBlockPhase0ProofMask.ts` | **Retain-neutral** | Exclusion helpers reusable for chunk authoring |
| `compositionMask.ts` | **Retain-neutral** | Road/water/path exclusions |
| `scripts/wf02-r15-phase0-proof.mjs` | **Retain-neutral** | Adapt harness for Path B Phase 0 |
| `scripts/wf02-r15-pixel-delta.mjs` | **Retain-neutral** | Metric utility unchanged |
| `r15_phase0_proof_manifest.json` | **Retain-diagnostic** | Path A falsification record |
| `WorldLabCompositionLayer` proof branch | **Remove on Path B build** | Replace with Path B proof branch |

---

## 13. File map (post-approval touch list)

| Action | Paths |
|---|---|
| **Create** | `scripts/wf02-r15-block-chunk-import.mjs`, `scripts/wf02-r15-pathb-phase0-proof.mjs` |
| **Create** | `src/rendering/blockChunk/blockChunkManifest.json`, `blockChunkLayer.tsx`, `blockChunkMode.ts` |
| **Create** | `Docs/milestones/WF02/r15_block_chunk_provenance.json`, `r15_pathb_phase0_proof_manifest.json` |
| **Modify** | `WorldLabCompositionLayer.tsx` (Path B chunk mode + rollback) |
| **Modify** | `package.json` scripts, `Docs/assets/ASSET_REGISTER.md` |
| **Modify** | `tests/unit/wf02/blockChunk.test.ts`, extend `prototypeShell.test.ts` |
| **Discard** | `src/rendering/environment/heroBlockProof/*` (after Path B Phase 0 supersedes) |
| **Preserve** | `prototypeShellManifest.json`, `simulation/**`, `facilityPoints.ts`, `heroNeighborhood.ts` |

---

## 14. Tests and audits

```bash
npm run audit:wf02-r15-path-b              # plan artifact (this revision)
npm run proof:wf02-r15-pathb-phase0          # post-approval — Path B Phase 0 only
npm run audit:wf02-evidence-integrity
npm run audit:wf02-r14-shell-rollout         # door binding regression
npm run test:all
```

| Suite | Coverage |
|---|---|
| `blockChunk.test.ts` | Chunk manifest bounds, exclusion volumes, rollback flags |
| `prototypeShell.test.ts` | R14 anchor/door/suppression unchanged |
| `heroBlockPhase0Proof.test.ts` | **Retire** after Path A code discarded |
| `worldResolver.test.ts` | Entrances unchanged |
| `streetPortalCamera.test.ts` | Portal clearance preserved |

---

## 15. Unknowns and risks

| Unknown | Mitigation |
|---|---|
| B1 chunks may still cap below MAE 8 if authored as "merged scatter" | Phase 0 gate; escalate B2 in plan 15.2 |
| Offline boolean cuts may leak into road corridors | Authoring audit + runtime overlap test |
| Door occlusion by chunk canopy | Entrance buffer volumes + Street preset proof |
| Chunk + 4 shells exceed budget if over-dense | Measured prune order §9 |
| B2 monolithic bake door drift | Deferred — B1 first |

---

## 16. Explicit non-goals

| Non-goal | Reason |
|---|---|
| Path A Phase 1 production wiring | Phase 0 hard-fail |
| MAE gate relaxation | Senior prohibited |
| Path C external import | Not authorized in R15.1 |
| Merge PR #12 / M03 | Separate authorization |
| `simulation/**` / entrance edits | Frozen |
| Metric gaming via opacity/camera/crop | Senior prohibited |

---

## 17. Definition of done (R15.1 — post-implementation)

| Criterion | Required |
|---|---|
| Path B Phase 0 ≥15% changed pixels + MAE ≥8 vs R14 | **Yes** |
| Qualitative north-star checks @ Overview | **Yes** |
| R13 shells + R14 door bindings preserved | **Yes** |
| Chunk provenance + ASSET_REGISTER | **Yes** |
| Evidence integrity audit PASS | **Yes** |
| `test:all` green; 0 asset/network errors | **Yes** |
| Performance within §9 ceilings | **Yes** |

**STOP if visual hard gate fails:** Post exact pixels + gap report; escalate B2 or Path C audit — do not self-merge or start M03.

---

## 18. Requirement IDs protected

| ID | R15.1 contribution |
|---|---|
| WF02-VISUAL-HARD-GATE | Path B block chunk falsification + Phase 0 proof |
| WF02-SCALE-001 | Frozen entrances + citizen/door/road |
| WF02-PRESERVE-SIM | No simulation edits |
| WF02-PRESERVE-M02 | Door/route preservation |
| WF02-RENDER-BUDGET | Chunk budgets + headroom |
| WF02-DETERMINISM | Seeded presentation only |
| WF02-EVIDENCE-INTEGRITY | Repo-relative manifest audit |

---

**STOP.** Awaiting `[GOD-MODE:CHATGPT-PLAN-DECISION] Decision: APPROVED_TO_BUILD` before any Path B chunk import, offline kitbash, Phase 0 prototype build, production wiring, merge, or M03.
