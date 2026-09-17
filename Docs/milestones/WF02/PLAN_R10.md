# WF02 Plan Revision 10 — Hero Neighborhood Visual Vocabulary & Street Proof

**State:** WAITING_FOR_CHATGPT_PLAN_APPROVAL  
**Supersedes:** Plan revision 9 implementation @ `f0d720725c99dd33f8cab8a5c8e7e58a6eb165f4` (WF02-R9 BLOCKED)  
**Investigation base SHA:** `f0d720725c99dd33f8cab8a5c8e7e58a6eb165f4`  
**Pixel evidence SHA:** `923769ad5bfde300e2c8258684003e5d2445b2c9` (`Docs/milestones/WF02/r9_neighborhood_manifest.json`)  
**Branch:** `cursor/wf02-scale-calibration-754a`  
**Scope:** PLAN ONLY — no production code, asset import/repack, evidence capture, merge, or M03 until `[GOD-MODE:CHATGPT-PLAN-DECISION] Decision: APPROVED_TO_BUILD`

---

## 1. Work item

WF02 — North-Star Scale & Aesthetic Calibration.

R9 solved the **spatial-skeleton** blocker: semantic `WorldDefinition`, compact ~70×58 m hero neighborhood, re-authored cameras, legacy rollback preserved. Grok **BLOCKED** R9 on the **visual hard gate** — engineering green, pixels still sparse/flat/muted vs north-star; Street evidence unusable (camera wall-jammed; human-scale proof missing).

R10 is **not** another layout rewrite. R10 spends R9's spatial freedom on **architectural vocabulary**, **inhabited frontage density**, **vertical/silhouette layering**, and a **reliable human-scale Street camera portal** derived from resolved facade bounds.

---

## 2. Decision context

| Review | SHA | Gate | Lesson |
|---|---|---|---|
| WF02-003 (R4.1) | `6dbd8b5` | BLOCKED | Decoration on frozen 240 m skeleton insufficient |
| WF02-R8-PHASE0B | `314d57c` | BLOCKED | High prop density under wrong skeleton still reads as green board |
| **WF02-R9** | **`f0d7207`** | **BLOCKED** | **First meaningful spatial reset — preserve architecture; vocabulary + street proof remain** |
| ChatGPT FIX_REQUIRED | `f0d7207` | **Plan R10 required** | Root-cause correction = visual vocabulary + inhabited density + street portal, not revert to legacy 240 m |

**Engineering preserved @ `f0d7207` (must not regress):**

| Check | Result |
|---|---|
| Unit + integration + e2e + build | **175 unit + 7 e2e PASS** |
| Asset/network errors (R9 capture) | **0** |
| `WorldDefinition` / `worldResolver` / `WORLD_LAB_MODE` rollback | Implemented |
| Hero neighborhood layout (~70×58 m, 7 buildings + future lot) | Implemented |
| Simulation semantics / worker determinism | Frozen |
| Overview live GL @ R9 | **116–119 DC / ~18k tris** (large headroom vs gates) |

**Visual failure (ChatGPT + Grok agree on R9):**

| Symptom | R9 evidence |
|---|---|
| Overview/Angled show real composition delta vs R4–R8 | ✅ — compact town readable |
| Still sparse/flat/muted vs north-star family | ❌ — cool green board, thin dressing |
| Commercial frontage lacks continuous inhabited rhythm | ❌ — three isolated Kenney boxes + scatter lamps/benches |
| Civic/residential under-articulated | ❌ — monolithic hall/clinic; two similar cottages |
| Street / citizen-door proof blocked | ❌ — `03_r9_street` wall-jammed; M02 street presets not readable for scale proof |

**Root cause (mentor brief):** R9 removed the coordinate constraint but kept essentially the same **exterior-prefab visual vocabulary** (Kenney single-mesh buildings + thin environmental scatter). Layout freedom was not spent on silhouette variation, frontage depth, plaza enclosure, or collision-safe human-scale cameras.

**Why another layout rewrite is rejected:** R2–R8 failed by decorating the old skeleton. R9 correctly removed that constraint. Reverting to 240 m or re-scattering facilities would repeat the proven failure class.

---

## 3. Executive summary — R10 keeps R9 skeleton, changes vocabulary + proof

R10 is **not** R9.1 coordinate tuning, not legacy 240 m restoration, not prop-count quota bumps, not generic box filler.

### Build Path P-HNV (Hero Neighborhood Vocabulary — mandatory)

| Phase | Name | Deliverable | Gate |
|---|---|---|---|
| **A** | Vocabulary audit + composition spec | On-disk asset/manifest audit vs north-star; district image-space specs; Kenney sufficiency verdict | Audit JSON + plan approval |
| **B** | Street portal camera system | Facade-bound camera resolver; M02 home/store/workshop proof presets; collision/occlusion fallback | Unit + e2e + pixel proof |
| **C** | Real-engine vocabulary pass (existing assets first) | Civic enclosure, commercial frontage continuity, residential gardens, future-lot negative space — **no generic primitives** | Measured DC/tris + compare strip |
| **D** | Conditional modular family (plan proposal only until approved) | At most **one** CC0 exterior modular family if Phase A proves Kenney insufficient | Separate import authorization in plan §8 |
| **E** | Expansion | **Deferred** — no 240 m rollout, no M03, no merge | Requires R10 PASS + new plan |

**Rejected without new plan revision:** Revert to legacy 240 m skeleton; relocate hero buildings; R8/R4 composition on legacy coords; scatter-count-only densification; enterable-house gameplay; runtime LLM; merge; M03 population.

**Preserved from R9:** `WorldDefinition` / `worldResolver` / `WORLD_LAB_MODE`; hero neighborhood semantic layout; deterministic worker; semantic home/store/work; asset/error diagnostics; performance headroom discipline.

---

## 4. On-disk vocabulary audit (Phase A — required before build)

### 4.1 Audit script (plan deliverable)

Add `scripts/wf02-r10-vocabulary-audit.mjs` (plan-only in this turn; implement in build):

- Enumerate every GLB used by hero neighborhood (`BUILDING_PREFABS` filtered to `HERO_BUILDING_IDS`)
- Read `modelLayoutManifest.json` per asset: local bounds, triangle count, facade axis
- Cross-reference `ASSET_REGISTER.md` license rows
- Emit `Docs/milestones/WF02/r10_vocabulary_audit.json` with per-building and per-district gaps

### 4.2 Hero neighborhood building inventory (current @ `f0d7207`)

| Semantic ID | Kenney GLB | targetWidth | Facade role | Notes |
|---|---|---:|---|---|
| `community-hall` | `commercial/community-hall.glb` | 16.0 m | Civic anchor | Single colormap mesh; flat block; no colonnade/steps |
| `clinic` | `commercial/clinic.glb` | 13.5 m | Civic flank | Same vocabulary as hall; low vertical contrast |
| `house-1` | `suburban/home-cottage.glb` | 11.2 m | M02 home | Chunky cottage; one story; limited garden depth |
| `house-2` | `suburban/home-type-a.glb` | 11.0 m | Residential pair | Near-identical silhouette to house-1 at Overview |
| `store` | `commercial/store-general.glb` | 13.5 m | M02 eat | Awning extra only; no continuous shopfront with neighbors |
| `workshop` | `industrial/workshop-industrial.glb` | 15.0 m | M02 work | Industrial slab; weak commercial rhythm link to store/cafe |
| `cafe` | `commercial/cafe-bistro.glb` | 12.2 m | Commercial cap | Parasol prop; detached from store/workshop frontage line |

Environment dressing @ R9 (`WorldLabCompositionLayer`, `CommercialStreetLife`):

| Element | Source | Gap vs north-star |
|---|---|---|
| Plaza | 4 planters + 8 path stones in ring | No enclosure/colonnade; square reads empty |
| Frame trees | `treeSmall`/`treeLarge` per layout coords | Belt present but sparse; no layered understory/shrub mass |
| Residential hedges | 6 instanced fence posts | Not continuous garden walls; no gate/path depth |
| Commercial life | Bench/lamp/bush scatter along z≈10–11 | **Rhythm by count, not facade width**; no awning continuity across trio |
| Future lot | `FutureLotPresentation` hedge stub | Negative space OK; lacks designed "held for growth" framing |

### 4.3 North-star requirement matrix (image-space)

| Requirement | North-star read | Kenney-only credible? | Gap if Kenney-only |
|---|---|---|---|
| Warm miniature town palette | Warm creams/terracotta/golden green | Partial — R5.1 atlas helps interiors of meshes only | Ground/canopy still cool; no per-district material identity at silhouette level |
| Civic anchor + plaza enclosure | Colonnade/steps/statue density framing square | **No** — hall/clinic blocks lack portico/colonnade meshes | Need designed assembly from existing props OR modular civic pieces |
| Commercial continuous frontage | Shared sidewalk rhythm, varied shopfront heights, inhabited depth | **No** — three disconnected GLBs with gaps | Need aligned facade modules or modular shopfront kit |
| Residential cluster readability | Pair of distinct houses + gardens/fences/paths | Partial — two suburban types too similar | Need height/silhouette variation + garden depth layers |
| Vertical layering | 1–3 story variation, chimneys, roof lines | **No** — Kenney hero meshes are 1–2 story boxes | Modular family or multi-part assembly spec |
| Vegetation belts | Lush framing, orchard richness | Partial — trees exist; mass too thin | Designed belts tied to district envelopes, not scatter |
| Human-scale proof | Citizen + ~2 m door + 6 m road readable | **Blocked by camera** — not vocabulary alone | Street portal system (§6) |

### 4.4 Kenney sufficiency verdict (plan position)

**Near-term visual milestone:** current Kenney **exterior-only** houses are **not sufficient alone** to reach north-star family for civic enclosure and commercial continuity. They **may suffice** for residential pair **if** R10 executes deliberate multi-part facade assembly (existing props + ground layers + height staging) **and** passes the street portal gate.

**Recommendation:** Phase C implements maximum credible vocabulary from **registered** Kenney/Quaternius first (recovery-before-add). Phase D plan proposes **one** modular exterior family import **only if** Phase C compare strip still fails civic/commercial silhouette gates. **No import in R10 plan approval turn.**

---

## 5. District image-space composition spec (Phase C design)

All changes are **presentation-only**, scoped to hero neighborhood via `isWorldLabActive()`, orchestrated through a single module (extend `WorldLabCompositionLayer` → split into district sub-orchestrators). **No generic box primitives.** No phantom buildings on future lot.

### 5.1 Civic — plaza enclosure + anchor mass

**Target read:** Community hall + clinic frame a **held** square; viewer sees colonnade-like edge, radial paving, central amenity, approach paths from residential/commercial spines.

| Layer | Implementation (existing assets) | Composition rule |
|---|---|---|
| Plaza ground | Warm civic tint plane clipped to square minus road mask | Enclose square — not full-map wash |
| Radial paving | `path-stones-short` + `path-stones-messy` spokes + ring | 8–12 spokes; align to hall/clinic door axes |
| Colonnade illusion | `fenceLow` segments + `planter` pairs at square corners | Continuous perimeter read at Overview; gap ≤1.2 m |
| Central amenity | `planter` cluster + optional `path-stones` fountain pad | One focal mass — not 4 isolated planters |
| Hall/clinic staging | Presentation offsets ≤2 m + distinct `targetWidth` delta | Clinic set back 1.5 m; hall forward — depth not coplanar blocks |
| Approach paths | Kenney `path-long` from square to residential/commercial junctions | Must connect to nav-visible routes |

**Acceptance pixel test:** Civic preset shows enclosed square; hall sign readable; clinic flank visible; **no** empty lawn inside square.

### 5.2 Commercial — continuous frontage rhythm

**Target read:** Store → workshop → cafe read as **one inhabited high street** from Overview and Street; sidewalk life cadence follows facade widths.

| Layer | Implementation | Composition rule |
|---|---|---|
| Shared frontage line | Align building presentation anchors to common `frontageZ` with ≤0.3 m jitter | Store/workshop/cafe door thresholds on one sidewalk edge |
| Awning/canopy continuity | Store awning + cafe parasol + **new** workshop canopy using `detail-awning` scaled | Visual link across gaps ≤4 m |
| Sidewalk cadence | Lamps/benches at `facadeWidth/2` offsets from each door | **No** uniform z scatter (`CommercialStreetLife` refactor) |
| Street furniture density | 2 lamps + 1 bench per shop frontage segment | Tied to semantic IDs |
| Depth props | Crates/parasol/path stones in alcoves (`InstancedScatter` with deterministic seed) | Behind sidewalk line — not in road |
| Ground band | Warm commercial tint strip 2.5 m deep along frontage | Clipped to road/sidewalk mask |

**Acceptance pixel test:** Overview commercial wedge shows **continuous** built edge; Street preset shows ≥2 shopfronts in frame with sidewalk readable.

### 5.3 Residential — cluster + garden depth

**Target read:** Two distinct house silhouettes with front gardens, fence gates, path to spine road; readable from residential preset.

| Layer | Implementation | Composition rule |
|---|---|---|
| Silhouette variation | house-1 cottage + house-2 type-A with **different** targetWidth/rotation/staging | Min 15% height delta at Overview |
| Garden envelopes | Per-house clipped ground tint + `path-short` from door to sidewalk | Depth ≥3 m |
| Fence continuity | `fenceLow` runs on garden front + side — not 3 isolated posts | Corner returns |
| Tree anchor | One `treeLarge` per house rear corner | Frames house — not random scatter |
| Spine connection | Path to `road-residential-ew` crossing | Citizen route visible |

**Acceptance pixel test:** Residential preset shows two distinct houses + garden negative space between.

### 5.4 Future lot — designed negative space

**Target read:** Held growth parcel framed by hedges/paths; **no** fake building.

| Layer | Implementation | Composition rule |
|---|---|---|
| Lot pad | Slightly raised tint + corner posts | Reads "surveyed" not "empty bug" |
| Frame hedge | `fenceLow` on 3 sides; open to road spur | Connects to `path-lot-frontage` |
| Sign/stake | Optional Kenney prop stake (registered) | Deterministic placement |

---

## 6. Street portal camera system (Phase B — mandatory)

### 6.1 Failure analysis @ R9

| Preset | R9 behavior | Failure |
|---|---|---|
| `street` | Hardcoded in `heroNeighborhood.ts` `[8, 4.8, 22] → [0, 2, 10]` | Low height + target near commercial wall → **wall-jammed** (`03_r9_street.png`) |
| `home-street` / `store-street` / `workshop-street` | `computeFacilityStreetPreset()` uses **layout AABB**, not rotated GLB bounds | Iterative guard insufficient when presentation mesh extends beyond layout box |
| Evidence | No citizen-height reference overlay | Human-scale proof not demonstrated |

### 6.2 Street portal resolver (new module)

**New file:** `src/rendering/streetPortalCamera.ts`

Derives cameras from **resolved presentation bounds** (not layout `size` alone):

```text
resolveStreetPortal(facilityId | 'street-corridor'):
  1. Load modelLayout world AABB (manifest bounds × targetWidth × rotation × presentation offset)
  2. Resolve public facade plane (from facade axis + entrance side)
  3. Place doorway target = entrance point @ y = terrain + 0.95 m (citizen eye line)
  4. Candidate camera = facade outward normal × minClearance (≥5 m) + lateral offset for composition
  5. Reject if inside expanded presentation AABB (padding 0.6 m)
  6. Reject if below min height (≥ doorTop + 0.5 m) or above max (≤ 12 m)
  7. Occlusion fallback: sweep lateral ±30° in 5° steps; then increase distance up to 18 m
  8. Corridor `street` preset: midpoint between store/workshop facades, 6 m from frontage line, target = sidewalk center @ citizen height
```

**Integration points:**

| File | Change |
|---|---|
| `facilityStreetCamera.ts` | Delegate to `streetPortalCamera` when World Lab active; keep legacy path for rollback |
| `heroNeighborhood.ts` | Remove hardcoded `street` camera; reference semantic `street-corridor` portal |
| `cameraPresets.ts` | World Lab street presets from resolver at module init (same as today) |
| `modelLayout.ts` | Export `resolvePresentationWorldAabb(buildingId)` helper |

### 6.3 Human-scale proof requirements

Evidence must include **readable** comparison in frame:

| Reference | World size | Visual |
|---|---:|---|
| Citizen simulation body | 1.8 m | Logic / inspector |
| Citizen presentation rig | 2.32 m | Visible mesh |
| Door opening | ~2.0 m | Kenney door bay height from manifest |
| Road carriageway | 6.0 m | Road segment width |
| Sidewalk | 1.4 m | Sidewalk segment |

**New evidence shots (mandatory @ R10 SHA):**

- `14_r10_street_portal_proof` — corridor preset with citizen visible
- `15_r10_home_door_scale` — home-street with door + citizen + road edge
- `16_r10_store_door_scale` — store-street with awning + citizen
- `17_r10_workshop_door_scale` — workshop-street without wall occlusion

**Unit tests:**

- `tests/unit/wf02/streetPortalCamera.test.ts` — camera outside presentation AABB for all M02 facilities
- Extend `facilityStreetCamera.test.ts` — World Lab presets pass `assertCameraOutsideFacilityBuilding` using presentation bounds

**E2E:**

- Extend `camera-controls.spec.ts` — after reset, street presets have `distance ≥ 4` and `position[1] ≥ 2.5`

---

## 7. Conditional modular exterior family (Phase D — proposal only)

**Trigger:** Phase C compare strip fails civic enclosure OR commercial continuity gates **after** Kenney assembly pass.

**Proposed family (one coherent set — not authorized to import until plan amendment):**

| Field | Value |
|---|---|
| Candidate | **KayKit City Builder Bits** or **Kenney Modular Medieval Town** (whichever audit confirms CC0 + facade modules) — final pick at Phase A audit |
| License | CC0 only; row in `ASSET_REGISTER.md` before any file lands |
| Scope | **Exterior modular facades only** — shopfront modules, civic portico pieces, residential bay modules |
| Normalization | `targetWidth` per module; manifest entry; warm atlas repack if colormap |
| Import budget | ≤12 new GLB files; ≤+25k tris hero neighborhood; ≤+15 Overview DC |
| Rollback | Delete GLBs + registry rows; revert `buildingPrefabConfig` module mappings; `WORLD_LAB_MODE` unchanged |
| Explicitly excluded | Enterable interiors; `building-type-f.glb` resurrection; phantom lot buildings |

**If Kenney assembly passes Phase C gates:** Phase D remains **documented but not executed**.

---

## 8. File-by-file change map (implementation @ approval)

### 8.1 New files

| File | Purpose |
|---|---|
| `scripts/wf02-r10-vocabulary-audit.mjs` | Phase A audit JSON |
| `src/rendering/streetPortalCamera.ts` | Facade-bound camera resolver |
| `src/world/worldLab/districtCompositionSpec.ts` | Declarative civic/commercial/residential/future-lot specs |
| `src/rendering/environment/worldLab/CivicEnclosure.tsx` | Plaza enclosure assembly |
| `src/rendering/environment/worldLab/CommercialFrontage.tsx` | Continuous frontage orchestrator |
| `src/rendering/environment/worldLab/ResidentialGardens.tsx` | Garden/fence/path clusters |
| `src/rendering/environment/worldLab/FutureLotFrame.tsx` | Negative space framing |
| `tests/unit/wf02/streetPortalCamera.test.ts` | Portal bounds tests |
| `scripts/wf02-r10-neighborhood-capture.mjs` | R10 evidence (+ scale proof shots) |

### 8.2 Modified files

| File | Change |
|---|---|
| `WorldLabCompositionLayer.tsx` | Split into district sub-orchestrators; remove ad-hoc scatter |
| `CommercialStreetLife.tsx` | Refactor to facade-cadence placement from spec |
| `facilityStreetCamera.ts` | World Lab → `streetPortalCamera` |
| `heroNeighborhood.ts` | Remove hardcoded `street` preset; optional minor presentation offsets only |
| `modelLayout.ts` | `resolvePresentationWorldAabb()` |
| `buildingPresentationAnchors.ts` | Frontage-line alignment helpers |
| `cameraPresets.ts` | Street presets from portal resolver |
| `OverviewCompositionLayer.tsx` | Route World Lab districts only |
| `Docs/milestones/WF02/BUILD_NOTES.md` | R10 handoff section |
| `Docs/assets/ASSET_REGISTER.md` | Phase D rows **only if** import authorized |

### 8.3 Do-not-touch

| Area | Rule |
|---|---|
| `src/simulation/**` behavior/state/action semantics | **No changes** |
| Worker authority / seeded determinism | **No changes** |
| `WorldDefinition` / `worldResolver` architecture | **No removal**; optional entrance metadata only |
| Hero neighborhood **semantic** layout (facility IDs, nav graph) | **No relocation** unless street portal audit proves entrance/framing conflict — then ≤2 m presentation offset only |
| Legacy 240 m skeleton / `WORLD_LAB_MODE` rollback | **Preserve** |
| M03 population | **Hold** |
| Enterable house gameplay | **Forbidden in WF02** |
| Generic box/primitive buildings | **Forbidden** |
| Runtime LLM/API | **Forbidden** (constitution) |
| Merge to main | **Prohibited** until WF02 PASS |

---

## 9. Performance budget (retain headroom)

Measure after Phase C on real engine pixels. **Hard gates unchanged:**

| Gate | Target | Hard cap |
|---|---:|---:|
| Overview DC | ≤**130** | ≤**140** |
| Overview tris | ≤**120k** | ≤**150k** |
| Street DC | ≤**90** | ≤**100** |
| Angled DC | ≤**130** | ≤**140** |

R9 @ ~18k Overview tris leaves budget for vocabulary layers. Phase C must **measure recovery-before-add**: if assembly exceeds caps, prune in order: periphery scatter → duplicate lamps → secondary props → ground tint layers — **never** civic enclosure or commercial frontage first.

M03 citizen LOD/culling remains separate per `M03_HEADROOM.md`.

---

## 10. Tests and proof plan

### 10.1 Automated

```bash
npm run test:all   # must remain green
npm run audit:wf02-r10-vocabulary   # new script alias
```

| Suite | New/updated coverage |
|---|---|
| `streetPortalCamera.test.ts` | Camera outside presentation AABB; min clearance; fallback sweep |
| `facilityStreetCamera.test.ts` | World Lab M02 presets |
| `worldResolver.test.ts` | Unchanged parity — must stay green |
| `determinism.test.ts` | Unchanged — must stay green |
| `camera-controls.spec.ts` | Street preset sanity bounds |
| `overviewComposition.test.ts` | World Lab district spec presence |

### 10.2 Evidence compare chain (frozen views)

| Panel | Source |
|---|---|
| **BEFORE (R9 blocked)** | `Docs/milestones/WF02/01_r9_overview_dawn.png` @ `f0d7207` |
| **AFTER (R10)** | `review-evidence-wf02-r10-<sha>` |
| **NORTH STAR** | `Docs/art-direction/references/god-mode-town-north-star.png` |

**Required shots @ R10 SHA:**

Overview dawn + noon, Angled, civic, residential, commercial, future lot, **street portal proof**, **home/store/workshop door scale proofs**, store/workshop relationship, night, diagnostics manifest, **0** asset/network errors.

**Acceptance (ChatGPT visual gate):**

| Criterion | Required |
|---|---|
| Material delta R9 → R10 at Overview/Angled | **Yes** — not confusable with R9 blocked |
| Civic enclosure readable | **Yes** |
| Commercial frontage continuity | **Yes** |
| Residential distinct pair + gardens | **Yes** |
| Street citizen + door + road scale proof | **Yes** — portal shots |
| North-star family direction | **Yes** — warm/lush/inhabited ( judge on pixels ) |
| Kenney-only or approved modular | **Documented** in audit JSON |
| Tests green | **Yes** |
| Overview ≤140 DC; Street ≤100 DC | **Yes** — manifest |

---

## 11. Phase gates and STOP points

| Gate | Entry | Exit | STOP if fail |
|---|---|---|---|
| **Plan R10** | This document | `[GOD-MODE:CHATGPT-PLAN-DECISION] APPROVED_TO_BUILD` | No implementation |
| **Phase A** | Plan approved | Vocabulary audit JSON + Kenney verdict | No Phase B |
| **Phase B** | Phase A PASS | Street portal + tests + scale proof shots | No Phase C |
| **Phase C** | Phase B PASS | District vocabulary pass + compare strip | No Phase D import |
| **Phase D** | Phase C FAIL silhouette gate | Modular family import (if separately authorized) | No import without amendment |
| **Merge / M03 / 240 m** | WF02 PASS | — | **Prohibited** in R10 scope |

**This plan ends at approval request.** No implementation until ChatGPT `APPROVED_TO_BUILD`.

---

## 12. Requirement IDs protected

| ID | R10 response |
|---|---|
| WORLD-001 | Preserve R9 World Lab definition — vocabulary layer only |
| VIS-002 | Street portal camera + preset proof |
| M02-020 | Facade-bound facility street cameras |
| ADR-006 | Simulation reads semantic IDs via resolver — unchanged |
| WF02-NORTH-STAR | Image-space vocabulary + inhabited density gates |
| DET-001 | Deterministic composition specs; no `Math.random` |
| ARCH-002 | Presentation-only vocabulary; sim authority unchanged |

---

**STOP.** Awaiting `[GOD-MODE:CHATGPT-PLAN-DECISION]` on Plan revision **10**. No implementation, asset import, merge, or M03 until approval.
