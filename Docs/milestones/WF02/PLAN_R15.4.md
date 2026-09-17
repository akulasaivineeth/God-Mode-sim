# WF02 Plan Revision 15.4 — Authoring Pipeline Reset

**State:** WAITING_FOR_CHATGPT_PLAN_APPROVAL  
**Supersedes:** Plan revision 15.3.1 Candidate E Phase 0 @ `bc1d41a55b8e03dc4a07d9e6e802fe0cb3563e6f` — **FIX_REQUIRED (WF02-R15-SENIOR)**  
**Senior arbitration:** `[GOD-MODE:CHATGPT-DECISION]` WF02-R15-SENIOR @ `bc1d41a` — **FIX_REQUIRED — PLAN_R15.4_REQUIRED — AUTHORING_PIPELINE_RESET**  
**Investigation base SHA:** `bc1d41a55b8e03dc4a07d9e6e802fe0cb3563e6f`  
**Candidate E implementation SHA:** `e4b59ab9e52476fe2db50af5f1c8e16f41832208`  
**Branch:** `cursor/wf02-scale-calibration-754a`  
**Scope:** PLAN ONLY — no Strategy A/B Phase 0 build, asset import, production wiring, camera change, merge, Grok review, or M03 until `[GOD-MODE:CHATGPT-PLAN-DECISION] Decision: APPROVED_TO_BUILD`

---

## 1. Work item

WF02 — North-Star Scale & Aesthetic Calibration.

R15 has now exhausted **procedural placement, scatter, replacement, footprint offset, and coordinate optimization** as paths to north-star neighborhood composition. Candidate E Phase 0 @ `bc1d41a` confirms senior + Grok judgment: **engineering green does not clear the visual product gate.**

| Experiment | SHA | Changed % | MAE | Key signal | Verdict |
|---|---|---:|---:|---|---|
| Path A — runtime envelopes | `c3d0739` | 20.09% | 5.31 | Breadth without hierarchy | **FAIL** |
| Path B B1 — additive chunks | `babd0fe` | 15.79% | 4.59 | 206 DC; additive surround | **FAIL** |
| Candidate C — replacement | `85ded03` | 19.16% | 6.19 | ROI MAE 14.20; town-scale thin | **FAIL** |
| **Candidate E — footprint** | `bc1d41a` | 19.02% | 6.39 | **Occupancy Δ0 built mass** | **FAIL** |
| R14 baseline | `3b0aa0c` | ~4.2% | 3.11 | Stagnation reference | — |

**Senior signal @ `bc1d41a`:** Candidate E is mechanically sound but **falsifies the footprint-recomposition hypothesis**. Frozen Overview still reads as sparse R14 with isolated shells. Descriptive occupancy unchanged (built mass **Δ0%**, vegetation **−0.8%**, meadow **+1.1%**). **Do not proceed to Candidate D** as standalone camera fix — camera cannot create missing authored mass.

R15.4 is an **authoring pipeline reset decision plan**, not code.

---

## 2. What R15.4 changes vs R15.3.1

| R15.3.1 (falsified) | R15.4 (reset) |
|---|---|
| Candidate E — presentation footprint recomposition | **Rejected** — occupancy flat; hierarchy unchanged |
| Single `presentationFootprintSpec` as path to north-star | **Research evidence only** — do not production-wire |
| Procedural scatter/offset/massing iterations | **Stop** — bottleneck is authored scene vocabulary |
| Candidate D secondary after footprint | **Forbidden** until authored composition passes at current camera |
| Multi-part rubric with footprint as primary lever | **Qualitative north-star decisive**; occupancy diagnostic only |
| Next work: E Phase 0+ / D calibration | Next work: **Strategy comparison A / B / C** then one bounded proof |

---

## 3. Locked falsification record (A/B/C/E — do not re-score)

Historical verdicts are **immutable**. No threshold relaxation. No tune loops.

### 3.1 Path A @ `c3d0739`

Added composition **around** unchanged hierarchy. Changed 20.09%, MAE 5.31. Disposable proof only.

### 3.2 Path B B1 @ `babd0fe`

Authored chunks **surrounded** retained shells. MAE 4.59, 206 DC. Proves draw multiplication + insufficient whole-frame hierarchy.

### 3.3 Candidate C @ `85ded03`

**Replacement** shifted local ROI (MAE 14.20) but too little town-scale coverage. Hero DC 8. Lessons: flatten/join pipeline, door sockets — not proof wiring.

### 3.4 Candidate E @ `bc1d41a`

**Footprint authority** moved 4 shell origins + cluster offsets + 12 supplementary props. Engineering PASS (Overview 98 DC / 35k tris). **Visual FAIL:**

| Occupancy (descriptive) | R14 | Candidate E | Δ |
|---|---:|---:|---:|
| Built mass | 11.1% | 11.1% | **0.0** |
| Vegetation | 41.9% | 41.1% | −0.8 |
| Meadow/periphery | 28.7% | 29.8% | +1.1 |
| Roads | 9.0% | 8.7% | −0.3 |

M02 door deltas: 0.000 m. Ordinary viewer: still sparse R14 meadow + isolated shells.

**Disposition:** `presentationFootprintSpec.ts` + `?r15FootprintPhase0Proof=1` remain **disposable research record** — not production path.

---

## 4. Symptom and root cause (revised @ E falsification)

### 4.1 Symptom

A/B/C changed local hero pixels; E moved presentation footprints; **none changed ordinary-viewer town hierarchy enough**. Dominant image remains meadow/roads/void with isolated buildings. North-star reference shows **continuous authored neighborhood mass** — civic/commercial/residential/park/farm zones occupying most of the frame as one composed scene.

### 4.2 Root cause

We are still trying to manufacture a north-star neighborhood by **procedural placement of individually good pieces**. The bottleneck is **authored environment composition / scene vocabulary at neighborhood scale**, not:

- another coordinate optimizer (E)
- another metric gate tweak
- tint / scatter / instancing patch
- camera constant (D)

### 4.3 Why prior attempts failed (complete chain)

| Attempt | Mechanism | Why it failed |
|---|---|---|
| R4.1 scatter/tint | Procedural dressing | Low-amplitude; ~4% stagnation |
| Path A | Runtime envelopes around hierarchy | Breadth without hierarchy shift |
| Path B | Offline chunks surrounding shells | MAE worse; 206 DC; hierarchy unchanged |
| Candidate C | Local replacement assemblies | Strong ROI; insufficient frame coverage |
| Candidate E | Footprint offset authority | **Screen-space mass unchanged** |
| Candidate D (not run) | Camera reframing | **Rejected a priori** — would crop under-authored composition |

**Conclusion:** Next strategy must **author one coherent neighborhood scene/chunk offline** (or acquire one credibly), not rearrange existing procedural modules.

---

## 5. Strategy comparison (mandatory — exactly three)

**Artifact:** [`r15_authoring_pipeline_audit_plan.json`](r15_authoring_pipeline_audit_plan.json)  
**Script:** `npm run audit:wf02-r15-authoring-pipeline`

### 5.1 Strategy A — Offline authored hero-neighborhood scene/chunk (RECOMMEND primary)

| Attribute | Assessment |
|---|---|
| **Method** | One **deliberately authored hero-neighborhood presentation chunk** built offline from already-licensed R13/Kenney/Quaternius vocabulary. Owns **visual composition only** — not simulation layout authority. |
| **Scale** | Single bounded chunk (~64×54 m hero bounds) replacing parallel scatter/shell islands with **one coherent GLB assembly** (+ thin door-socket metadata layer) |
| **Pipeline** | Extend proven R13 kitbash + Candidate C flatten/join import (`wf02-r13-shell-import.mjs`, `wf02-r15-replacement-import.mjs`) |
| **Semantic anchors** | Existing facility IDs + M02 door labels remain **socket targets**; sim positions are **not** render-authority inputs |
| **Visual hypothesis** | R13 proved offline kitbash at building scale; C proved flatten at block scale; E proved placement alone cannot add mass — **author the scene as a unit** |
| **License** | CC0 Kenney + Quaternius derivatives only (already registered) |
| **Risk** | Authoring labor; door socket revalidation; must not repeat B's 206-DC failure — flatten/batch mandatory |
| **Rollback** | URL-gated proof layer; production flag only after senior PASS |

### 5.2 Strategy B — Audit stronger finished CC0 environment source (RECOMMEND audit-only fallback)

| Attribute | Assessment |
|---|---|
| **Method** | Inspect **one** stronger finished CC0 environment/building source with exact assets/license/version. Produce disposable import **proof plan** only — **no import during R15.4 plan gate**. |
| **Candidates to audit** | See §6 — KayKit (prior reject), registered Kenney packs (parts not scenes), Quaternius MegaKit (nature-only), OpenGameArt CC0 town slices (license file audit) |
| **Visual hypothesis** | **Unknown** until file-level audit — may supply missing pre-composed neighborhood read |
| **Risk** | R10/R11 external-family monolith failure class; ambiguous Sketchfab licenses; browser GLB compatibility |
| **Gate** | No dependency or asset import without explicit post-plan approval |

### 5.3 Strategy C — Stop WF02 visual rebuild / change north-star requirement (RECOMMEND document-only alternative)

| Attribute | Assessment |
|---|---|
| **Method** | Explicitly **stop the WF02 visual iteration loop** at current best (R14 shells + engineering-green presentation stack). Document north-star reference as **aspirational art direction**, not mechanical milestone gate. |
| **Product tradeoff** | Ship M03+ on R14-scale readable town; defer north-star densification to future milestone or art pass |
| **When to choose** | If Strategy A Phase 0 proof and Strategy B audit both show **no credible path** to ordinary-viewer north-star within one bounded proof |
| **Requirement** | Must be **explicit Product Owner decision** — not silent scope reduction |

**Forbidden as Strategy C substitute:** Another R15.5/R15.6 procedural scatter/footprint/camera micro-patch without authored scene vocabulary.

---

## 6. Strategy B — upstream source audit (plan-level; no import)

Inspect **exact upstream files and license**, not README claims.

### 6.1 Already registered inventory (insufficient alone)

| Source | License | Files | Polygon cost (sample) | Vocabulary gap |
|---|---|---|---|---|
| Kenney City Kit Suburban/Commercial/Industrial/Roads | CC0 1.0 | 14+ building GLBs registered | 1.9k–7k tris/building | **Parts, not composed neighborhood** |
| Kenney Modular Buildings 2.1 | CC0 1.0 | 24 modules imported R11/R12 | ~200–800 tris/module | Wall kit — R11 modular failure class |
| R13 FOUR_SHELL kitbash | CC0 derivative | 4 shells, 4.2k–7.1k tris each | Building-scale only | Proved kitbash method; not neighborhood scene |
| Quaternius Stylized Nature MegaKit | CC0 1.0 | `gltf/quaternius/*` | Low per instance | **Vegetation/rocks only** — no civic/commercial/residential buildings |

**Verdict:** Registered inventory supplies **pieces**. It does not supply the missing **neighborhood-scale composed scene**.

### 6.2 External candidate — KayKit City Builder Bits v1.0

| Field | Value |
|---|---|
| URL | https://kaylousberg.itch.io/city-builder-bits |
| License | CC0 1.0 Universal (itch page claim — **must verify LICENSE file in download**) |
| Formats | OBJ, FBX, GLTF |
| Assets | `building_A`–`building_H` pre-assembled + roads/props |
| Modularity | **Pre-assembled monoliths** — not wall/floor/roof kit |
| Prior audit | R11 `r11_candidate_audit_plan.json` — **REJECT** (repeats R10 monolith failure) |
| Neighborhood vocabulary | Partial — individual buildings + roads; **no unified park/farm/orchard scene** |
| Browser fit | GLTF import feasible; material/atlas audit required |
| R15.4 disposition | **Audit-only reconfirmation** — unlikely to clear bar without repeating R10/R11 failure |

### 6.3 External candidate — OpenGameArt CC0 town/environment packs (screening list)

Plan gate requires **file-level audit** of one shortlisted pack if Strategy A Phase 0 fails:

| Candidate | URL (screening) | License claim | Risk |
|---|---|---|---|
| Poly Pizza CC0 collections | poly.pizza | CC0 (per-asset verify) | Mixed quality; license per model |
| Quaternius extended packs | quaternius.com | CC0 | Mostly nature/low-poly props |
| Kenney future pack drops | kenney.nl | CC0 | Unknown until published |

**R15.4 plan gate:** Name candidates and audit checklist only. **Zero downloads during plan gate.**

### 6.4 Strategy B verdict (plan recommendation)

**HOLD audit-only.** Registered + KayKit history suggests external import is **last resort**. Strategy A uses existing licensed vocabulary with proven offline pipeline — higher credibility for one bounded proof.

---

## 7. Strategy A — offline scene-authoring workflow (post-approval design)

### 7.1 Authority model

```
facilityPoints.ts / HERO_NAV / simulation/**     (FROZEN — semantic reference only)
        │
        └── heroNeighborhoodSceneManifest.json   (NEW — presentation authority)
                    │
                    ├── wf02-hero-neighborhood-scene.glb   (single authored chunk)
                    ├── doorSockets[] — label → local offset (NOT sim coords)
                    ├── districtZones[] — civic/commercial/residential/park (diagnostic)
                    └── provenance + flatten stats
        │
        └── HeroNeighborhoodSceneLayer (disposable proof → production after PASS)
                    │
                    └── M02 door markers validate sockets ≤0.3 m to frozen entrances
```

**Invariant:** Simulation positions do **not** become render-authority inputs. Author places mass for **Overview composition**; sockets prove alignment to frozen M02 semantics.

### 7.2 Offline authoring workflow

| Step | Tool / script | Output |
|---|---|---|
| 1. Scene recipe | `heroNeighborhoodSceneRecipe.json` (plan name) | Declarative part list: Kenney/Quaternius sources, transforms, district tags |
| 2. Part staging | Extend `wf02-r13-shell-import.mjs` pattern | Temp shifted parts in `.cache/wf02-r15-scene-parts/` |
| 3. District assembly | Civic + commercial + residential + park/river + future-lot framing in **one coordinate system** | Merged scene (pre-flatten) |
| 4. Flatten/batch | Candidate C pipeline: `merge → flatten → join → flatten` | ≤8 meshes target; ≤12 hero-scene DC hard stop |
| 5. Socket bake | Record door socket local positions for `home-door`, `store-door`, `workshop-door` | Manifest entries |
| 6. Measure | Triangle count, mesh count, material count, bounds | Provenance JSON |
| 7. Register | `ASSET_REGISTER.md` row + `modelLayoutManifest.json` | CC0 derivative record |

**Authoring surface:** Recipe JSON + offline script — **not** hand-maintained duplicate coordinates in React modules. Edits change recipe → re-import → re-flatten → re-proof.

### 7.3 Export format

```typescript
// heroNeighborhoodSceneManifest.json (proposed)
{
  planRevision: "15.4",
  sceneId: "wf02-hero-neighborhood-scene",
  assetUrl: "/assets/glb/wf02/hero-scenes/wf02-hero-neighborhood-scene.glb",
  anchor: { x: 0, y: 0, z: 4 },           // world anchor — single placement
  bounds: { min, max, size, triangles, meshCount, materialCount },
  doorSockets: [
    { label: "home-door", localX, localY, localZ, facilityId: "house-1" },
    { label: "store-door", ... },
    { label: "workshop-door", ... }
  ],
  districtZones: [ /* civic/commercial/residential/park/future-lot AABBs — diagnostic */ ],
  provenance: { sourceMeshes: string[], license: "CC0 derivative", flattenPipeline: "merge-flatten-join-flatten" }
}
```

### 7.4 Batching / material strategy

| Constraint | Target |
|---|---|
| Hero-scene meshes after flatten | **≤8** (hard stop 12) |
| Materials | **≤4** (Kenney colormap atlas reuse) |
| Draw calls (hero scene only) | **≤6** target |
| Total Overview DC | **≤135** with **≥5 reserve** |
| Total Overview tris | **<150k** with **≥8k reserve** |

Reuse Candidate C flatten discipline. **Do not** repeat Path B's 140+ mesh unflattened chunk.

### 7.5 Semantic socket mapping

| Label | Frozen sim entrance (reference) | Socket rule |
|---|---|---|
| `home-door` | house-1 entrance | Authored local socket; world position within **≤0.3 m** of sim |
| `store-door` | store entrance | Same |
| `workshop-door` | workshop entrance | Same |

Sockets are **authored in scene space** then validated against `getFacilityPoint()` — not copied from sim coords into recipe as placement authority.

### 7.6 Rollback

| Mode | Behavior |
|---|---|
| Default production | R14 `WorldLabCompositionLayer` (unchanged until senior PASS) |
| `?r15ScenePhase0Proof=1` | Disposable `HeroNeighborhoodSceneProofLayer` only |
| A/B/C/E proof layers | Frozen diagnostic — never production-wired |
| Rollback | Remove proof URL param or disable scene flag — zero `simulation/**` touch |

---

## 8. Composition proof (precommitted — post-approval Phase 0)

At **existing frozen Overview camera** `[0,46,36] → [0,0,4]`, viewport **1440×900**:

### 8.1 Qualitative gate (decisive)

| Criterion | Required |
|---|---|
| Ordinary viewer | **Cannot** mistake for sparse R14 meadow + four isolated shells |
| Neighborhood read | Civic/commercial/residential/future-lot/park-river read as **one composed town** |
| North-star direction | Materially closer to reference family (warmth, density, district character) |
| No crop gaming | Success at default camera — not zoom/crop-only path |
| M02 honesty | Street preset; door/path readable; socket ≤0.3 m |

### 8.2 Descriptive occupancy (non-gating)

Target direction vs R14 @ same camera (not pass substitute):

| Category | R14 @ E review | Strategy A target direction |
|---|---:|---|
| Built mass | 11.1% | **↑ materially** (authored architectural mass in frame) |
| Vegetation | 41.9% | **→ or ↑** with composed framing, not scatter-only |
| Meadow/periphery void | 28.7% | **↓ materially** — intentional negative space only |
| Coherent cluster coverage | ~20–30% hero ROI | **↑ majority of central frame** |

Candidate E proved **Δ0 built mass** — Strategy A must show **visible occupancy shift** or abort.

### 8.3 Diagnostic metrics (record only)

- Whole-frame changed % vs R14
- Whole-frame MAE vs R14
- ROI MAE / high-contrast changed %
- A/B/C/E historical gates **not** retroactively applied

### 8.4 Evidence captures (same camera)

Overview dawn, civic, commercial, residential/future-lot, river/park, Street (store-workshop), Angled; compare strip R14 → Strategy A → north-star reference.

---

## 9. Candidate D — camera calibration (forbidden until composition passes)

| Rule | Rationale |
|---|---|
| No Candidate D in Strategy A Phase 0 | E proved composition under-authored at current camera |
| No evidence-only camera preset | Crop gaming |
| D authorized only after | Strategy A (or approved B) passes qualitative composition gate at **current** camera |
| D justification | Gameplay readability independent of metrics — not MAE optimization |

---

## 10. Recommendation matrix

| Priority | Strategy | Next authorized work (post R15.4 approval) |
|---|---|---|
| **1** | **A — Offline authored hero-neighborhood scene** | Scene recipe + import/flatten pipeline + disposable Phase 0 proof |
| **2** | **B — External CC0 source audit** | File-level audit doc only if A Phase 0 fails qualitative gate |
| **3** | **C — Stop / scope tradeoff** | Product Owner explicit decision if A and B both non-credible |
| **Reject** | E production, D standalone, R15.5 procedural patch | Locked falsification / senior prohibition |
| **Reject** | Tune A/B/C/E | Locked record |

**Primary recommendation: Strategy A.**

**Rationale:**

1. R13 + Candidate C prove **offline kitbash + flatten** works at building/block scale within DC budget.
2. Candidate E proves **coordinate optimization does not add screen-space mass** — occupancy flat.
3. Registered CC0 vocabulary is sufficient **if composed as one scene** — no new asset family required for first proof.
4. Strategy B (KayKit / external) repeats R10/R11 monolith risk; Quaternius lacks building vocabulary.
5. Strategy C is valid **only** as explicit Product Owner tradeoff — plan must not silently choose it.

**Stop recommendation:** If Strategy A Phase 0 fails qualitative north-star gate **and** Strategy B audit finds no credible CC0 neighborhood source, **recommend Strategy C** (stop iteration loop) rather than R15.5/R15.6 micro-patches.

---

## 11. Authority / data flow

```
┌─────────────────────────────────────────────────────────────┐
│ FROZEN: facilityPoints, HERO_NAV, simulation/**, roads/river │
└───────────────────────────┬─────────────────────────────────┘
                            │ semantic reference (door targets)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ NEW: heroNeighborhoodSceneManifest.json                      │
│   + wf02-hero-neighborhood-scene.glb (offline authored)        │
└───────────────────────────┬─────────────────────────────────┘
                            │ single anchor placement
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ HeroNeighborhoodSceneProofLayer (?r15ScenePhase0Proof=1)     │
│   OR production WorldLabCompositionLayer (post senior PASS)  │
└───────────────────────────┬─────────────────────────────────┘
                            │ renders only
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Rendering / evidence — never simulation truth                │
└─────────────────────────────────────────────────────────────┘

SUPERSEDES (do not production-wire):
  presentationFootprintSpec.ts / FootprintPhase0ProofLayer
  heroBlockProof / blockChunkProof / replacementProof
  parallel WorldLab scatter modules as composition authority
```

---

## 12. Performance budget (M2 / 8 GB)

| Line | Hard cap | Strategy A target | Reserve |
|---|---:|---:|---:|
| Overview DC | ≤140 | **≤135** | **≥5** |
| Street DC | ≤100 | ≤95 | ≥5 |
| Overview tris | <150k | ≤142k | **≥8k** |
| Hero-scene chunk DC | — | ≤6 | — |
| Hero-scene meshes | — | ≤8 (hard stop 12) | — |
| M03 headroom note | — | LOD/culling required for 20 citizens | not raw WF02 slack |

Measured after flatten — not theoretical GLB arithmetic.

---

## 13. File map (post-approval touch list — plan only)

| Action | Paths |
|---|---|
| **Create (A recipe)** | `scripts/wf02-r15-scene-recipe.schema.json`, `Docs/milestones/WF02/r15_hero_neighborhood_scene_recipe.json` |
| **Create (A import)** | `scripts/wf02-r15-hero-neighborhood-scene-import.mjs` |
| **Create (A manifest)** | `src/rendering/heroScene/heroNeighborhoodSceneManifest.json` |
| **Create (A proof)** | `src/rendering/heroScene/HeroNeighborhoodSceneProofLayer.tsx`, `?r15ScenePhase0Proof=1` |
| **Create (A capture)** | `scripts/wf02-r15-scene-phase0-proof.mjs` |
| **Create (B audit)** | `Docs/milestones/WF02/r15_external_cc0_source_audit.md` |
| **Modify (post PASS only)** | `WorldLabCompositionLayer.tsx` — single scene layer integration |
| **Preserve diagnostic** | All A/B/C/E proof layers + manifests + `presentationFootprintSpec.ts` |
| **Do NOT touch** | `simulation/**`, `facilityPoints.ts`, worker/save/schema, cameras, M03 |
| **Do NOT production-wire** | A/B/C/E footprint/replacement/chunk proof layers |

---

## 14. Tests and audits

```bash
npm run audit:wf02-r15-authoring-pipeline          # this plan revision
npm run audit:wf02-r15-footprint-recomposition     # E record (superseded)
npm run audit:wf02-r15-replacement                 # C record
npm run audit:wf02-r14-shell-rollout               # door baseline
npm run test:all
```

Post-approval additions:

- Scene manifest schema validation
- Door socket ≤0.3 m unit tests
- Flatten mesh/DC budget tests
- Scene proof capture + multi-part rubric manifest

---

## 15. Unknowns and risks

| Unknown | Mitigation |
|---|---|
| Can one flattened chunk achieve north-star density within 12 DC? | Phase 0 proof mandatory; flatten pipeline proven @ C |
| Door socket alignment after scene authoring | Precommit socket validation in import script |
| Authoring recipe complexity | Start with hero-bounds-only scene; no 240 m expansion |
| Strategy B viable external pack exists | Audit checklist; default to Strategy C if none |
| Qualitative gate still subjective | Senior + Grok review; pixels authoritative |

---

## 16. Definition of done (R15.4 — plan gate only)

| Criterion | Required |
|---|---|
| A/B/C/E falsification locked; E occupancy failure recorded | **Yes** |
| Exactly three strategies A/B/C compared | **Yes** |
| Strategy A offline workflow + export format + sockets + rollback | **Yes** |
| Strategy B file-level source audit (no import) | **Yes** |
| Strategy C documented as explicit product tradeoff | **Yes** |
| Composition proof precommitted at frozen camera | **Yes** |
| Candidate D forbidden until composition passes | **Yes** |
| Stop recommendation if A/B non-credible | **Yes** |
| File map + budget + authority flow | **Yes** |
| `npm run audit:wf02-r15-authoring-pipeline` | **Yes** |

**No implementation, asset import, camera change, Grok review, merge, or M03 in R15.4 plan gate.**

---

## 17. Requirement IDs protected

| ID | R15.4 contribution |
|---|---|
| WF02-VISUAL-HARD-GATE | Authoring pipeline reset after E falsification |
| WF02-PRESERVE-SIM | Scene layer presentation-only; sockets validate sim |
| WF02-PRESERVE-M02 | Door socket discipline preserved |
| WF02-RENDER-BUDGET | ≤135 DC target with real reserve |
| WF02-EVIDENCE-INTEGRITY | Frozen camera; anti-crop; qualitative decisive |
| WF02-DETERMINISM | No worker/sim changes |

---

**STOP.** Awaiting `[GOD-MODE:CHATGPT-PLAN-DECISION] Decision: APPROVED_TO_BUILD` before Strategy A scene import, Strategy B audit import, production wiring, merge, or M03.
