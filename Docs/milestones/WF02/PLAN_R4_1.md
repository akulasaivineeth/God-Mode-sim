# WF02 Plan Revision 4.1 — Overview-Scale Presentation Composition (Corrected)

**State:** WAITING_FOR_CHATGPT_PLAN_APPROVAL  
**Supersedes:** Plan revision 4 (`Docs/milestones/WF02/PLAN_R4.md`)  
**Investigation base SHA:** `8be181cd244bb9817aae13200e01d4b3d3b5c886` (WF02-002 blocked)  
**Plan doc base SHA:** `27c9bc8577176e48501a6e786a1f102080b653d2` (Plan R4 posted)  
**Branch:** `cursor/wf02-scale-calibration-754a`  
**Scope:** PLAN ONLY — no production code, asset import, or implementation until `[GOD-MODE:CHATGPT-PLAN-DECISION] Decision: APPROVED_TO_BUILD`

---

## 1. Work item

WF02 — North-Star Scale & Aesthetic Calibration (presentation-only milestone; simulation/geography frozen).

---

## 2. Decision context

- **Review:** WF02-002 @ `8be181c`
- **Gate:** BLOCKED (visual/aesthetic hard gate; repeated failure)
- **ChatGPT Plan R4 decision:** `PLAN_CHANGES_REQUIRED` — directionally correct root-cause change, but mandatory gates incomplete/inconsistent
- **R4.1 purpose:** Correct render-budget arithmetic, add mandatory scale/overlap/proportion audits, resolve roof-tint architecture, remove optional-import ambiguity, tighten composition coordinates against road/water truth, preserve R4 strategy

**Engineering preserved from R3:** 154/154 tests, sim authority, performance baseline Overview **127** DC / **140,305** visible tris @ `8be181c`.

---

## 3. Executive summary (unchanged strategy, corrected gates)

R4.1 retains R4’s root-cause reframing: introduce a single **overview-scale presentation composition layer** (`OverviewCompositionLayer` + `districtMassing.ts`) that shapes empty envelope into district blocks using **Kenney-first canopy massing, frontage strips, district ground tints, and integrated R3 modules** — all presentation-only, geography frozen.

**R4.1 corrections vs R4:**

| R4 defect | R4.1 fix |
|---|---|
| Budget math: `140,305 − 2,720 + 14,200 ≈ 151,785` (over `<150k` before uncertainty) | Measured per-asset costs; **Kenney-first** overview canopy; Quaternius capped; recovery-before-add targets **~125–128k nominal / ~135–138k worst-case** |
| M03 headroom claimed as `≥1k tris` raw slack | M03 headroom = **citizen LOD/culling strategy** per `Docs/milestones/WF01/M03_HEADROOM.md`; WF02 target **≥8k tris / ≥5 DC** below gates after build |
| Missing 14-facility scale table | §5 — full table with AABB, offsets, clearance pass/fail |
| Missing massing overlap audit | §6 — all 14 facilities + 8 future lots |
| Unverified `/roof/i` roof tint | §8 — **removed**; verified Kenney GLB structure |
| Optional `building-type-f.glb` ambiguity | §9 — **not in R4.1**; no phantom lot buildings |
| Broad ground-tint rectangles | §7 — exclusion corridors + polygon clip/mask method |
| Composition map as acceptance proxy | §14 — **diagnostic only**; pixels authoritative |

---

## 4. Preserved (frozen — do not revert or touch)

Same as R4 §4: `facilityPoints.ts`, `simulation/**`, M02 trio centers/entrances/route, road/river topology, R2 `targetWidth` values, 2.32/1.8 citizen split, `modelLayout`/manifest/anchors, Overview `[10,93,54]` and Angled `[68,53,37]` cameras, R3 instancing + useful modules (integrated not duplicated), registered Kenney/Quaternius only, no M03 population gameplay.

---

## 5. Mandatory 14-facility scale table (R3 frozen → R4.1 unchanged widths)

All widths **identical R3→R4.1**. AABBs computed from `modelLayoutManifest.json` + `resolveRotatedFootprint` + R3 `resolvePresentationTransform` @ investigation SHA. Auth centers from `CANONICAL_TOWN.buildings`.

| Facility | Kenney prefab | R3/R4.1 width (m) | Auth center (x,z) | Pres offset [x,y,z] | rotΔ | Presentation AABB x×z (m) | Height (m) | Nearest road / neighbor | Pass |
|---|---|---:|---|---|---|---|---|---|:---:|
| house-1 | home-cottage | **11.2** | (11, −10) | [0,0,0] | 0 | [7.5,14.5] × [−15.6,−4.4] | 7.0 | Main NS x=0: ~4.5 m; entrance south to z=0 road ~4.4 m | ✅ |
| house-2 | home-type-a | **11.0** | (30, −12) | [0.35,0,−0.25] | +0.06 | [25.7,35.0] × [−18.0,−6.5] | 7.1 | Branch z=−42: ~35 m; spur x=8: ~18 m | ✅ |
| house-3 | home-type-c | **11.0** | (11, −30) | [0,0,0] | 0 | [5.5,16.5] × [−34.4,−25.6] | 8.8 | Loop z=−58: ~24 m | ✅ |
| house-4 | home-type-d | **11.2** | (30, −30) | [−0.2,0,0.3] | −0.04 | [26.3,33.3] × [−35.4,−24.0] | 7.9 | Loop z=−58: ~24 m | ✅ |
| apartment | apartment-block | **16.0** | (52, −22) | [0.25,0,0.35] | +0.04 | [45.6,58.9] × [−29.9,−13.4] | 14.0 | Branch z=−42: ~20 m | ✅ |
| community-hall | community-hall | **16.0** | (−18, −18) | [0,0,0] | 0 | [−26.0,−10.0] × [−22.9,−13.1] | 8.7 | Square edge; main cross ~18 m | ✅ |
| clinic | clinic | **13.5** | (−42, −14) | [−0.3,0,0.2] | −0.03 | [−48.8,−35.8] × [−20.7,−6.9] | 19.4 | Civic cluster; no M02 route | ✅ |
| school | school | **17.5** | (−24, −48) | [0,0,0] | 0 | [−31.7,−16.3] × [−56.8,−39.3] | 22.5 | Residential loop ~14 m | ✅ |
| store | store-general | **13.5** | (−11, 11) | [0,0,0] | 0 | [−16.5,−5.5] × [4.3,17.8] | 22.2 | Main EW z=0: ~4.3 m; M02 entrance clear **3.3 m** to AABB | ✅ |
| cafe | cafe-bistro | **12.2** | (−30, 12) | [0.4,0,−0.15] | +0.05 | [−36.0,−23.2] × [5.6,18.1] | 16.3 | Commercial rd z=18: ~6 m | ✅ |
| workshop | workshop-industrial | **15.0** | (−11, 23) | **[0.6,0,1.8]** | −0.03 | [−18.1,−2.7] × **[17.8,31.8]** | 13.9 | M02 entrance clear **2.4 m**; store gapZ **0.10 m** (AABB) | ⚠️ see §6 |
| warehouse | warehouse | **19.0** | (−38, 48) | [0,0,0] | 0 | [−47.5,−28.5] × [42.3,53.7] | 13.4 | Industrial rd z=38: ~10 m | ✅ |
| utility | utility-station | **13.5** | (−52, 30) | [−0.35,0,−0.2] | −0.05 | [−58.7,−46.0] × [22.8,36.8] | 8.0 | Industrial rd: ~8 m | ✅ |
| farmhouse | farmhouse | **12.5** | (28, 82) | [0,0,0] | 0 | [22.9,33.1] × [75.8,88.3] | 6.6 | Farm rd approach: ~6 m | ✅ |

**Store↔workshop (M02 audit):**

| Metric | Value | Gate |
|---|---:|---|
| Auth sim centers | store (−11,11), workshop (−11,23) | frozen |
| Auth entrances | store (−11,7.6), workshop (−11,20.2) | frozen |
| Presentation AABB gap (Z) | **0.10 m** (touching at z=17.8) | visual separation via R3 separator + R4.1 frontage hedge band **outside** AABB |
| Entrance→nearest massing band clearance | store 3.3 m, workshop 2.4 m to building AABB edge | ≥1.5 m walkable read ✅ |

R4.1 **does not** change any `targetWidth`, auth center, or presentation offset from R3.

---

## 6. Facility-by-facility R4.1 massing overlap / door / road audit

New composition elements (ground tints, Kenney hedges/trees, frontage bands, civic frame) audited against **presentation AABB**, **M02 entrances** (where applicable), **auth paths**, and **road/sidewalk corridors**.

### 6.1 Exclusion corridors (global)

| Corridor | Rule (CANONICAL_TOWN) | Massing must |
|---|---|---|
| Main roads | `\|x\| ≤ 3` or `\|z\| ≤ 3` (6 m width) | No tree/hedge/tint centroids inside |
| Branch roads | Segment buffer = `width/2 + 0.5 m` from polyline | No overlay fill |
| Sidewalks | Road edge + 1.4 m + 0.15 m gap | Tint clipped; props on sidewalk OK |
| M02 route | house-1 (11,−7.6) → store (−11,7.6) → workshop (−11,20.2) + 1.2 m buffer | No hedge height blocking door read |
| River water | `riverCrossSection` carve: x ≳ **74** at mid-town; wider at south | No tint/fence inside water mesh |
| Bridge approach | road-bridge segment @ x≈88,z≈38 | Keep 4 m clear cone |

### 6.2 Per-facility audit

| Facility | R4.1 planned massing near facility | Door/path conflict | Verdict |
|---|---|---|---|
| house-1 | Garden hedge (fenceLow) on N/E/W; paver path anchor unchanged | Entrance (11,−7.6) faces south path; hedges **≥2.5 m** from entrance | ✅ PASS |
| house-2 | Side hedge + driveway scatter | No entrance auth | ✅ PASS |
| house-3 | Side path + bush bed | No entrance auth | ✅ PASS |
| house-4 | Driveway + offset massing | No entrance auth | ✅ PASS |
| apartment | Corner tree (Kenney treeLarge) + sign | Tree at (58,−18) **≥6 m** from facade | ✅ PASS |
| community-hall | Civic frame tree at (−14,−14) etc. | South facade to square **≥4 m** | ✅ PASS |
| clinic | Sign + bush flanking (existing) | No route | ✅ PASS |
| school | Distant civic massing | Loop road only | ✅ PASS |
| store | Frontage apron band z≈13–15; separator bushes z≈16–17 | Entrance (11,7.6) **outside** hedge band; apron **≥1.8 m** south of entrance | ✅ PASS |
| cafe | Parasol cluster + commercial frontage z=18 | Facade south; band parallel road, **≥2 m** offset | ✅ PASS |
| workshop | Separator hedge + frontage band; pres offset [0.6,0,1.8] | Entrance (20.2) **2.4 m** clear to AABB; band at z≈17–19 does **not** cover door (band x∈[−16,−6], door x=−11) | ✅ PASS |
| warehouse | Apron + industrial frontage | Driveway anchor preserved | ✅ PASS |
| utility | Industrial frontage strip | No entrance auth | ✅ PASS |
| farmhouse | Approach pathLong + 2× treeLarge flanking | Path from road-farm; trees **≥3 m** from door facade | ✅ PASS |

### 6.3 Future lots (8) — presentation-only capacity, not phantom buildings

| Lot | Center | R4.1 envelope | Road/path | Verdict |
|---|---|---|---|:---:|
| plot-1 | (48,−48) | R3 paver 2×2 + 6 fence posts + R4.1 hedge on **lot interior** only | Frontage path width 1.2 m to z=−42 | ✅ |
| plot-2 | (62,−48) | same | same | ✅ |
| plot-3 | (76,−48) | same | same | ✅ |
| plot-4 | (48,−62) | same | loop road buffer ≥2 m | ✅ |
| plot-5 | (62,−62) | same | same | ✅ |
| plot-6 | (76,−62) | same | same | ✅ |
| plot-7 | (88,−22) | same | spur buffer ≥3 m | ✅ |
| plot-8 | (95,−8) | same | eastern edge; **no building GLB** | ✅ |

**Explicit rejection:** No `building-type-f.glb`, no presentation-only fake buildings on vacant lots.

---

## 7. Composition coordinates vs road/topology truth

### 7.1 Clipping / masking method

**`DistrictGroundTint.tsx`** (R4.1):

1. Each district spec provides a **polygon** (not axis-aligned rectangle alone) derived from district bounds **minus** road/water exclusion corridors (§6.1).
2. Build overlay mesh via **ear-clipping triangulation** of clipped polygon at `y = terrainHeight + 0.02`.
3. **Stencil/mask alternative (fallback):** single plane with multi-material UV regions disabled where `roadMask(x,z)` or `riverMask(x,z)` returns true — `roadMask` uses authoritative `CANONICAL_TOWN.roads` + `paths` segment distance ≤ half-width + 0.3 m.
4. **Z-fighting guard:** overlay y-offset **0.02–0.04 m** above terrain; no overlay on water surface material.

### 7.2 District specs with exclusions

| District | Intended bounds | Exclusions (must clip) | Structured mass |
|---|---|---|---|
| **A Civic** | x∈[−28,8], z∈[−28,8] | Main cross `\|x\|<3`, `\|z\|<3`; square fountain disc r=3.5 | 4× treeLarge frame **outside** r=8 ring; radial pavers r=6.5–8.5 |
| **B Residential** | x∈[8,82], z∈[−65,−8] | Branch roads z=−42,−58; spur x=8; main `\|x\|<3` | fenceLow hedges **lot interior**; Kenney treeSmall pairs; warm tan tint **between** roads |
| **C Commercial/work** | x∈[−58,−2], z∈[8,52] | Roads z=18,38; main `\|x\|<3`; M02 door corridor x≈−11 ±2 | Frontage bands west of x=−8; separator z∈[17,19] x∈[−16,−6] |
| **D Farm/orchard** | x∈[36,70], z∈[72,103] | road-farm diagonal buffer 2 m | 4×5 treeSmall grid @ farm-3; widened instanced field rows |
| **E River/park** | park rect + east edge | River x≳74; path-park-river | Kenney treeLarge + Quaternius **≤6** park arc (hero); promenade scatter on land only |

Occupancy target unchanged: **~4,200 m²** structured mass / **~62%** growth negative space.

---

## 8. Roof-tint architecture — RESOLVED: removed from build plan

**Inspection method:** GLB JSON chunk parse of all 14 Kenney building assets @ investigation SHA (see `scripts/wf02-r41-audit.mjs`).

| Finding | Implication |
|---|---|
| Each building = **1 merged mesh** (warehouse/workshop/utility: 2 meshes — `colormap` + tiny `colormap-specular`) | No roof/wall mesh separation |
| Material name always **`colormap`** | `/roof/i` name filter **invalid** |
| Node names e.g. `building-type-b`, `building-f` | No semantic roof group |

**R4.1 decision:** **Remove presentation roof tint pass entirely.** Palette variety via:

- `DistrictPalette.ts` ground overlay roles (§10)
- Kenney treeSmall/large **green/brown canopy massing** at Overview
- Quaternius hero accents (cap §12) for close/mid color
- Existing Kenney atlas silhouettes (14 distinct shapes)

**Budget impact:** 0 material clones; **0 DC / 0 tris** from roof tint (R4 incorrectly assumed 0 cost but relied on unbuildable architecture).

---

## 9. Asset policy — no optional import ambiguity

| Policy | R4.1 |
|---|---|
| Registered Kenney + Quaternius | **Only** assets in `EnvironmentAssetRegistry.ts` / `ASSET_REGISTER.md` |
| `building-type-f.glb` | **NOT imported in R4.1** — deferred to future explicit plan revision if needed |
| Phantom lot buildings | **Forbidden** — future lots = paver + fence + hedge envelope only |
| New asset families | **None** |

---

## 10. Palette architecture (ground + canopy — no roof tint)

**`DistrictPalette.ts`** roles (presentation-only):

| Role | Hex | Applied to |
|---|---|---|
| `groundMeadow` | `#5a7348` | terrain vertex lerp (warmer base) |
| `groundResidential` | `#c8b888` | clipped residential overlay |
| `groundCommercial` | `#d4bc94` | clipped commercial overlay |
| `groundFarm` | `#b8a868` | clipped farm overlay |
| `groundPark` | `#6a9a58` | clipped park overlay |
| `canopyDeep` | `#3d6b38` | instanced cluster shadow read |
| `canopyLight` | `#7aaa58` | sunlit Kenney tree massing |
| `accentWarm` | `#c87848` | civic paths, farm row B |
| `accentCool` | `#6a8a9a` | river/park edge scatter |

Lighting: keep R3 dawn floor **0.62**; hemisphere ground `#a08858`; **no evidence-only exposure**.

---

## 11. Citizen / door / road proportions (explicit)

| Quantity | Simulation authority | Presentation (WF02) | Notes |
|---|---:|---:|---|
| Citizen height | **1.8 m** | **2.32 m** | `citizenModelScale.ts`; sim collision unchanged |
| Representative door (store, scaled) | n/a | **~2.4–2.8 m** tall × **~1.6 m** wide | Derived from store AABB height 22.2 m; Kenney door ~12% facade |
| Door vs citizen | n/a | door **~1.0–1.2×** citizen height | Readable Street threshold |
| Main road width | **6.0 m** | same | `ROAD_WIDTH` |
| Branch road width | **4.0–4.5 m** | same | commercial/industrial/residential |
| Sidewalk width | **1.4 m** | same | `SIDEWALK_WIDTH` |
| Path width | **1.6 m** (1.2 m lot frontage) | same | `PATH_WIDTH` |
| Citizen : road (Street) | n/a | 2.32 m / 6 m ≈ **39%** | Citizen readable against lane |
| Citizen : sidewalk | n/a | 2.32 / 1.4 ≈ **166%** | Walkable frontage not choked |
| Block massing scale | n/a | House width 11–11.2 m vs citizen 2.32 m ≈ **4.7–4.8×** | Miniature town read preserved |

R4.1 frontage bands widen **sidewalk presentation** by ≤0.6 m scatter paver edge — does not change `townLayout` sidewalk authority.

---

## 12. Render budget — corrected arithmetic (measured)

### 12.1 R4 arithmetic error (acknowledged)

```
R3 baseline:     140,305 tris
R4 claimed net:  −2,720 + 14,200 = +11,480 → 151,785 tris  ❌ exceeds <150k
R4 target stated: 145k–149k                                      ❌ inconsistent
```

R4 overestimated add costs (assumed ~3,200 tris for 20 treeSmall; actual **42 tris** each) and underestimated Quaternius cluster cost (~**5,500–6,300 tris/tree**).

### 12.2 Measured unit costs (GLB/GLTF parse @ investigation SHA)

| Asset | Tris/instance | DC model (instanced) |
|---|---:|---|
| Kenney treeSmall | **42** | 1 URL = 1 DC |
| Kenney treeLarge | **42** | 1 DC |
| Kenney fenceLow | **180** | 1 DC |
| Kenney pathShort | **12** | 1 DC |
| Quaternius CommonTree_1 | **6,265** | 1 DC |
| Quaternius CommonTree_2 | **5,648** | 1 DC |
| Quaternius Pine_1 | **3,947** | 1 DC |
| Quaternius Bush_Common | **900** | 1 DC |
| Scatter shrub (primitive) | **72** | shared 1 DC |
| Ground overlay plane | **2** | 1 DC per mesh |

**Culled vs visible:** Budget numbers are **renderer.info.render triangles after frustum culling** at Overview preset (same method as R3 evidence manifest). Off-screen instances still count if in view frustum.

### 12.3 R4.1 strategy — Kenney-first overview canopy

Overview-readable massing uses **Kenney treeSmall/large** (42 tris). Quaternius limited to:

- Existing M02 corridor + riverbank + park/square placements (**unchanged count ~16–20 trees**)
- **No new Quaternius clusters** in residential/commercial districts for Overview; replace R3 `buildDistrictCompositionPlacements` scattered Quaternius with Kenney instanced rows where Overview-visible

### 12.4 Phase A — recovery (before adds)

| Action | Δ DC | Δ visible tris |
|---|---:|---:|
| Remove `buildPeripheryForest()` (4× Quaternius avg ~5,000) | **−4** | **−~19,500** |
| Replace 8 Overview-visible district Quaternius singles with Kenney treeSmall instancing (8×5,500 → 8×42) | **0** | **−~43,600** |
| Merge 5 ground tint meshes → 1 clipped multi-polygon | **−4** | **0** |
| Deduplicate overlapping bush placements (registry audit) | **−1** | **−~900** |
| **Phase A subtotal** | **−9** | **−~64,000** |

**Post-recovery estimate:** ~127 − 9 = **118 DC**; ~140,305 − 64,000 = **~76,000 tris** (theoretical); practical measured recovery **~22–28k tris** after view-frustum retention → **~112–118k tris**.

*Note: Phase A replacement savings depend on which district Quaternius are in Overview frustum; conservative planning uses **−25k tris** measured expectation, not full theoretical.*

### 12.5 Phase B — composition adds

| System | Instances | Δ DC | Δ visible tris |
|---|---|---:|---:|
| Kenney treeSmall orchard 4×5 (instanced) | 20 | +1 | +840 |
| Kenney treeLarge civic 4 + farm 2 | 6 | +1 | +252 |
| Kenney fenceLow residential hedges | 48 | +1 | +8,640 |
| Frontage scatter bands (shrubs/pavers instanced) | ~80 | +2 | +~4,500 |
| Clipped ground tint (1 mesh, 5 zones) | 1 | +1 | +2 |
| Civic radial pavers + pathShort (instanced) | ~40 | +1 | +~500 |
| River park promenade (scatter + 5 pathShort) | ~30 | +1 | +~600 |
| **Phase B subtotal** | | **+8** | **+~15,300** |

### 12.6 Net targets

| Metric | Nominal target | Conservative worst-case (+10% adds, −15% recovery) | Gate |
|---|---:|---:|---|
| Overview DC | **126–132** | **≤138** | ≤140 ✅ |
| Overview visible tris | **125k–128k** | **≤138k** | <150k ✅ |
| Street DC | **72–78** | **≤85** | ≤100 ✅ |
| Headroom vs gate | **~12–15 DC / ~20–25k tris** | **~2 DC / ~12k tris** | not M03 citizen budget |

### 12.7 M03 headroom (corrected)

Per `Docs/milestones/WF01/M03_HEADROOM.md`:

- **20 full-detail skinned citizens** ≈ **+120–160k tris** if all visible — impossible within WF02 gates.
- M03 **must** use distance culling, LOD, impostors — **not** WF02 triangle slack.
- R4.1 WF02 deliverable: preserve **≥8k tris / ≥5 DC** below `<150k`/≤140 gates after measured build for incidental M03 debug overlays only.
- **Retract R3/R4 claim** that ~9.7k tris headroom reserves 20 citizens.

**Overflow prune order (unchanged priority):** periphery replacements → park promenade density → orchard 20→16 → reduce Kenney cluster pairs — **never** civic frame, commercial frontage, or M02 corridor first.

---

## 13. R4.1 implementation map

Same as R4 §13 with these deltas:

| Change vs R4 | File |
|---|---|
| Roof tint removed | no `gltfPipeline` district tint |
| Clipped ground tint | `DistrictGroundTint.tsx` uses polygon clip + roadMask |
| Kenney-first canopy | `CanopyMassing.tsx` prefers Kenney URLs for Overview clusters |
| Quaternius cap | `districtMassing.ts` max new Quaternius = 0; relocate existing only |
| Budget tests | `tests/unit/wf02/overviewComposition.test.ts` asserts instancing groups + exclusion helpers |

---

## 14. Evidence criteria (image-space authoritative)

1. Same-view **WF01 → R2 → R3 → R4.1 → NORTH STAR** @ Overview + Angled, **06:00 + 12:00 + night**, cameras frozen
2. **`composition_map_r4.svg`** — diagnostic overlay only; not acceptance proxy
3. Overview pixel test: orchard rectangle, civic frame, residential hedge grid, commercial frontage tint visible without zoom
4. Store/workshop separation + M02 door/path evidence @ Street preset
5. **No stale `01_wf02_overview.png`** — use `01_wf02_overview_dawn.png`, `01b_wf02_overview_noon.png`
6. 154/154 tests; measured manifest budget; 0 asset/network errors
7. Annotated scale/overlap audit sheet in evidence diagnostics

**PASS:** ordinary viewer sees material overview transformation — not numeric gates alone.

---

## 15. Stop condition

Post `[GOD-MODE:CURSOR-PLAN]` Plan revision **4.1** → **STOP**. No production code until `Decision: APPROVED_TO_BUILD`. Do not merge. Do not start M03.

---

## Appendix A — R4 → R4.1 correction checklist

| ChatGPT R4.1 requirement | Section |
|---|---|
| 1. Fix render-budget arithmetic | §12 |
| 2. 14-facility scale table | §5 |
| 3. Massing overlap/door/road audit | §6 |
| 4. Citizen/door/road proportions | §11 |
| 5. Resolve roof-tint architecture | §8 (removed) |
| 6. No optional asset ambiguity | §9 |
| 7. Composition vs road/water truth | §7 |
| 8. Evidence image-space authoritative | §14 |
