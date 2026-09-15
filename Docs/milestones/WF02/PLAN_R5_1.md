# WF02 Plan Revision 5.1 — Resolved Asset Path & Reconciled Render Budget

**State:** WAITING_FOR_CHATGPT_PLAN_APPROVAL  
**Supersedes:** Plan revision 5 (`Docs/milestones/WF02/PLAN_R5.md`)  
**Investigation base SHA:** `d0bb7d65b175a83679c7f9a83ae0333a5d094685` (Plan R5 posted; WF02-003 implementation remains `6dbd8b5`)  
**Branch:** `cursor/wf02-scale-calibration-754a`  
**Scope:** PLAN ONLY — no production code, asset repack/import, or evidence capture until `[GOD-MODE:CHATGPT-PLAN-DECISION] Decision: APPROVED_TO_BUILD`

---

## 1. Work item

WF02 — North-Star Scale & Aesthetic Calibration (presentation-only; simulation/geography frozen).

---

## 2. Decision context

| Review | SHA | Gate | Lesson |
|---|---|---|---|
| WF02-003 (R4.1) | `6dbd8b5` | BLOCKED | Composition orchestrator correct; vocabulary + mass density insufficient |
| Plan R5 | `d0bb7d6` | PLAN_CHANGES_REQUIRED | Root-cause direction accepted; asset path ambiguous; nature-mass tris unreconciled; culling underspecified |

**ChatGPT R5.1 requirements addressed:** §3 (asset decision), §4 (verified inventory), §5 (reconciled budget), §6 (preset visibility architecture), §7 (atlas integrity), §8 (frozen camera/pixel gate), §9 (evidence hygiene).

---

## 3. Executive summary — single authorized build path

R5 offered Path A vs Path B and optional Quaternius Buildings imports. **R5.1 resolves to one path:**

### **Build Path P-A+E-N (mandatory — no alternatives at implementation)**

| Layer | Decision |
|---|---|
| **Buildings** | **Existing 14 registered Kenney facility GLBs only** — same URLs, same silhouettes, same `targetWidth`. No `building-type-f.glb`, no Kenney commercial/industrial spare imports, **no Quaternius Buildings family**. |
| **Palette** | **Offline warm atlas normalization** — 4 derived textures from already-approved Kenney pack `colormap.png` sources; repacked presentation GLBs; originals archived, not mutated in place. |
| **Nature** | **Existing registered Quaternius Nature MegaKit (10 glTFs on disk) + Kenney props (`tree-small`, `tree-large`, `fence-low`, paths)** — restore R3 district/periphery mass with **preset-tier visibility** and **hard instance caps** reconciled to per-preset budgets below. |
| **Composition** | Extend R4.1 `OverviewCompositionLayer` orchestrator — reduce ground-tint dependence; add terrain value bands; hero district silhouettes via mass, not new building URLs. |

**Rejected without further plan revision:** Quaternius Buildings, Kenney spare building GLBs, runtime roof tint, global scale/camera change, phantom lot buildings, geometric frustum culling that diverges from gameplay/evidence paths.

---

## 4. Preserved (frozen)

Same as R5 §4: `facilityPoints.ts`, `simulation/**`, M02 trio centers/entrances/route, road/river topology, R2 `targetWidth`, 2.32 m / 1.8 m citizen split, `modelLayout` authority, Overview `[10,93,54]→[30,2,4]`, Angled `[68,53,37]→[28,3,2]`, determinism, no M03/LLM.

**R5.1 explicit freeze:** No global building multiplier, no Overview/Angled camera constant change, no decorative roads, no authoritative coordinate edits.

---

## 5. Image-space composition study (unchanged intent from R5 §5)

Dominant Overview shapes @ 06:00 (1440×900, frozen camera) that must visibly change vs R4.1:

| Zone | R5 target (Overview-readable) | Screen coverage target |
|---|---|---:|
| A. Civic/commercial core | Warm plaza ring + tree colonnade + hall/store cluster; roads contained by frontage | ~18% |
| B. Residential garden block | Continuous hedge/garden blocks + street tree lines | ~16% |
| C. Future lots (8) | Fence perimeter + corner shrub + interior garden mass | ~6% |
| D. Farm/orchard hero | Rectangular canopy block + field bands + farmhouse frame | ~8% |
| E. River/park edge | Curved canopy arc + brighter lawn + promenade | ~7% |
| F. Forest/periphery frame | North/west/east forest wall — no vast olive void | ~12% perimeter |
| G. Growth void | Structured negative space (~20 founders) | ~33% (down from ~45% R4.1) |

**Pixel acceptance is primary.** 06:00 gameplay Overview must be attractive/readable without noon compensation. Noon evidence is supplementary. RGB/statistical metrics (VST-01–09) diagnose only — they never substitute for rendered-pixel judgment.

Diagnostic only: `Docs/milestones/WF02/composition_map_r5.svg` (to be added at plan approval; not an acceptance artifact).

---

## 6. Verified asset inventory — everything that enters the build

All paths verified on disk @ investigation base `6dbd8b5` branch head unless noted as **new derived output**.

### 6.1 Building GLBs (14 facilities — geometry unchanged, warm atlas repack only)

| Facility ID | Runtime URL (unchanged) | Kenney original | Pack source | License |
|---|---|---|---|---|
| `house-1` | `/assets/glb/kenney/suburban/home-cottage.glb` | `building-type-b.glb` | https://kenney.nl/assets/city-kit-suburban | CC0 1.0 |
| `house-2` | `/assets/glb/kenney/suburban/home-type-a.glb` | `building-type-a.glb` | same | CC0 1.0 |
| `house-3` | `/assets/glb/kenney/suburban/home-type-c.glb` | `building-type-c.glb` | same | CC0 1.0 |
| `house-4` | `/assets/glb/kenney/suburban/home-type-d.glb` | `building-type-d.glb` | same | CC0 1.0 |
| `apartment` | `/assets/glb/kenney/suburban/apartment-block.glb` | `building-type-e.glb` | same | CC0 1.0 |
| `farmhouse` | `/assets/glb/kenney/suburban/farmhouse.glb` | `building-type-g.glb` | same | CC0 1.0 |
| `store` | `/assets/glb/kenney/commercial/store-general.glb` | `building-f.glb` | https://kenney.nl/assets/city-kit-commercial | CC0 1.0 |
| `cafe` | `/assets/glb/kenney/commercial/cafe-bistro.glb` | `building-b.glb` | same | CC0 1.0 |
| `clinic` | `/assets/glb/kenney/commercial/clinic.glb` | `building-d.glb` | same | CC0 1.0 |
| `community-hall` | `/assets/glb/kenney/commercial/community-hall.glb` | `building-e.glb` | same | CC0 1.0 |
| `school` | `/assets/glb/kenney/commercial/school.glb` | `building-h.glb` | same | CC0 1.0 |
| `workshop` | `/assets/glb/kenney/industrial/workshop-industrial.glb` | `building-l.glb` | https://kenney.nl/assets/city-kit-industrial | CC0 1.0 |
| `warehouse` | `/assets/glb/kenney/industrial/warehouse.glb` | `building-a.glb` | same | CC0 1.0 |
| `utility` | `/assets/glb/kenney/industrial/utility-station.glb` | `building-c.glb` | same | CC0 1.0 |

M02 trio (`house-1`, `store`, `workshop`) keep **same GLB geometry**; warm atlas applied via repack — entrances and Street readability re-audited post-repack.

### 6.2 Kenney props (unchanged URLs)

| Asset | URL | Tris (measured) | DC model |
|---|---|---:|---|
| `tree-small.glb` | `/assets/glb/kenney/suburban/tree-small.glb` | 42 | 1 URL = 1 DC instanced |
| `tree-large.glb` | `/assets/glb/kenney/suburban/tree-large.glb` | 42 | 1 |
| `fence-low.glb` | `/assets/glb/kenney/suburban/fence-low.glb` | 180 | 1 |
| `path-short.glb` | `/assets/glb/kenney/suburban/path-short.glb` | 12 | shared |
| Roads pack | `/assets/glb/kenney/roads/*.glb` | per R4.1 | instanced |

Commercial detail props (`detail-awning.glb`, `detail-parasol-a.glb`) — unchanged.

### 6.3 Quaternius Nature (10 registered glTFs — no building assets)

| File | URL | Tris (measured) |
|---|---|---:|
| `CommonTree_1.gltf` | `/assets/gltf/quaternius/CommonTree_1.gltf` | 3,153 |
| `CommonTree_2.gltf` | `/assets/gltf/quaternius/CommonTree_2.gltf` | 2,702 |
| `Pine_1.gltf` | `/assets/gltf/quaternius/Pine_1.gltf` | 1,749 |
| `Pine_2.gltf` | `/assets/gltf/quaternius/Pine_2.gltf` | 1,642 |
| `Bush_Common.gltf` | `/assets/gltf/quaternius/Bush_Common.gltf` | 600 |
| `Bush_Common_Flowers.gltf` | `/assets/gltf/quaternius/Bush_Common_Flowers.gltf` | 838 |
| `Fern_1.gltf` | `/assets/gltf/quaternius/Fern_1.gltf` | 81 |
| `Flower_3_Group.gltf` | `/assets/gltf/quaternius/Flower_3_Group.gltf` | 194 |
| `Pebble_Round_1.gltf` | `/assets/gltf/quaternius/Pebble_Round_1.gltf` | 97 |
| `Pebble_Round_2.gltf` | `/assets/gltf/quaternius/Pebble_Round_2.gltf` | 71 |

### 6.4 New derived assets only (offline atlas normalization)

| Derived texture | Source (embedded in pack GLB) | Output path | Format |
|---|---|---|---|
| `colormap_warm_residential.png` | Kenney Suburban `colormap.png` | `public/assets/glb/kenney/suburban/Textures/colormap_warm_residential.png` | PNG, **same dimensions as source** (verify in Phase 0 — Kenney Suburban atlas is **256×256** per embedded image audit) |
| `colormap_warm_commercial.png` | Kenney Commercial `colormap.png` | `public/assets/glb/kenney/commercial/Textures/colormap_warm_commercial.png` | PNG 256×256 (verify) |
| `colormap_civic_cream.png` | Kenney Commercial `colormap.png` (hue-shift variant) | `public/assets/glb/kenney/commercial/Textures/colormap_civic_cream.png` | PNG 256×256 (verify) |
| `colormap_farm_straw.png` | Kenney Suburban `colormap.png` | `public/assets/glb/kenney/suburban/Textures/colormap_farm_straw.png` | PNG 256×256 (verify) |
| `colormap_warm_industrial.png` | Kenney Industrial `colormap.png` | `public/assets/glb/kenney/industrial/Textures/colormap_warm_industrial.png` | PNG 256×256 (verify) |

**Archive originals before repack:** copy each affected GLB to `public/assets/glb/kenney/_archive/pre-r5/` (git-tracked once) — **never overwrite `_archive/`**.

**Repacked GLBs:** write warm variants to **same canonical runtime URLs** listed in §6.1 (runtime config unchanged). UVs, geometry, material slot names (`colormap`, `colormap-specular`) unchanged — **texture URI inside GLB updated only**.

### 6.5 Atlas role assignment (exact)

| Atlas role | Facilities receiving repack | Shared runtime material |
|---|---|---|
| `warm_residential` | `house-1`, `house-2`, `house-3`, `house-4`, `apartment` | 1 material ref via suburban warm atlas |
| `warm_commercial` | `store`, `cafe`, `clinic` | 1 material ref |
| `civic_cream` | `community-hall`, `school` | 1 material ref |
| `farm_straw` | `farmhouse` | 1 material ref |
| `warm_industrial` | `workshop`, `warehouse`, `utility` | 1 material ref |

**Max 5 building atlas variants** (industrial separate from commercial). `prepareStaticGltfRoot` / instancing unchanged — no per-instance material clones.

### 6.6 Explicitly excluded from build

- Quaternius Buildings Pack (0 files on disk; not imported)
- Kenney `building-type-f.glb`, commercial `building-c.glb` as **new** facility skins (industrial `utility-station` already uses industrial `building-c` identity)
- Any asset named "or equivalent"
- Phantom lot buildings

---

## 7. Warm atlas normalization procedure (§5 ChatGPT)

### 7.1 Phase 0 — audit (extends `scripts/wf02-r41-audit.mjs`)

For each of 14 GLBs record: mesh count, material names, embedded texture byte size/dimensions, triangle count, presentation AABB @ frozen `targetWidth`.

### 7.2 Phase 1 — offline processing (one-time, outside runtime)

1. Export embedded `colormap.png` from each pack GLB via Blender CLI or `gltf-transform` — **do not edit files in `public/` until archive copy exists**.
2. Apply controlled hue/saturation shift per role table (preserve window/door luminance contrast ≥15% relative to walls).
3. Repack GLB: replace embedded texture buffer; **no vertex/mesh edits**.
4. Register derived textures + repack provenance in `Docs/assets/ASSET_REGISTER.md` (new subsection "WF02 R5 warm atlas derivatives").

### 7.3 Rollback

Restore from `public/assets/glb/kenney/_archive/pre-r5/` → canonical URLs. Single git revert of repack commit restores cold atlas.

### 7.4 Post-repack audits (mandatory pre-READY)

Re-run for **all 14 facilities**: presentation AABB, door visibility @ Street presets, M02 entrance clearance ≥1.5 m, store/workshop gap ≥0.10 m, road/path attachment offsets from `modelLayoutManifest.json`.

---

## 8. Nature mass plan — instance tables & preset visibility

### 8.1 R4.1 regression to correct

| Removed @ R4.1 | R5.1 restoration |
|---|---|
| `buildDistrictCompositionPlacements()` → `[]` | **`DistrictCanopyRestore`** — 12 placements (trimmed from R3's 18; table §8.2) |
| `buildPeripheryForest()` → `[]` | **`PeripheryForestFrame`** — 6 placements (expanded from R3's 4, capped for budget) |
| Weak Kenney-only orchard | **Orchard perimeter** — 4× `Pine_1` + retain Kenney 4×5 interior grid |
| Sparse park scatter | **Park river arc** — 4× mixed Quaternius along park/river edge |

### 8.2 Deterministic placement tables (no `Math.random`)

**DistrictCanopyRestore (12)** — derived from R3 `@8be181c` registry, 6 lowest-value bushes pruned:

| # | x | z | asset | source |
|---|---:|---:|---|---|
| 1 | -22 | -12 | commonTree1 | quaternius |
| 2 | -28 | -44 | pine1 | quaternius |
| 3 | -8 | -8 | bushFlowers | quaternius |
| 4 | 16 | -28.5 | commonTree1 | quaternius |
| 5 | 28 | -31.2 | commonTree2 | quaternius |
| 6 | -18 | 16 | bushFlowers | quaternius |
| 7 | -6 | 22 | bush | quaternius |
| 8 | 2 | 18 | commonTree2 | quaternius |
| 9 | 76 | 42 | commonTree1 | quaternius |
| 10 | 88 | 36 | pine1 | quaternius |
| 11 | 84 | 34 | fern | quaternius |
| 12 | 78 | 32 | pebble1 | quaternius |

**PeripheryForestFrame (6)** — north/west edge (R3 used 4; +2 for frame read):

| # | x | z | asset |
|---|---:|---:|---|
| 1 | -95 | -102 | pine1 |
| 2 | 35 | -104 | pine2 |
| 3 | -104 | 0 | commonTree1 |
| 4 | -104 | 65 | commonTree2 |
| 5 | 95 | -98 | pine1 |
| 6 | 98 | 55 | pine2 |

**OrchardPerimeter (4)** — farm-3 rectangle:

| # | offset from farm-3 center (55,98) | asset |
|---|---|---|
| 1–4 | (±14, ±12) corners | pine1 |

**ParkRiverArc (4)** — park center (72,38):

| # | x | z | asset |
|---|---:|---:|---|
| 1 | 68 | 44 | commonTree1 |
| 2 | 76 | 46 | commonTree2 |
| 3 | 80 | 40 | pine1 |
| 4 | 74 | 32 | bushFlowers |

**Always-on baseline (unchanged R4.1):** `M02_CORRIDOR_VEGETATION` (6), `RIVERBANK_VEGETATION` (4), `VegetationLayer` park/square (6), `CanopyMassing` Kenney grid (29), `ResidentialHedges` (≤48 fence instances).

### 8.3 Preset visibility architecture (§4 ChatGPT — deterministic, not frustum-vague)

**Mechanism:** New `CompositionVisibilityTier` gate in `OverviewCompositionLayer` + `VegetationLayer` reads **`cameraView: CameraView`** already passed `Scene → App` (`src/rendering/Scene.tsx`, `src/app/App.tsx`). **Same prop drives normal gameplay camera strip and evidence capture** (`?cam=overview&evidence=1` via `cameraViewFromQuery`).

**Not used in R5.1:** geometric frustum culling, distance LOD tied to simulation, evidence-only render branches, `Math.random`, per-frame visibility changes.

| Tier | Groups mounted | Visible when `cameraView ∈` |
|---|---|---|
| **T0 Core** | R4.1 hedges, Kenney orchard grid, civic Kenney trees, frontage, future lots, commercial street life, M02/riverbank/park-square baseline | **All** presets |
| **T1 District** | `DistrictCanopyRestore` (12) | `overview`, `angled`, `street`, `square`, `river`, `store-workshop`, attachment presets |
| **T2 Orchard** | `OrchardPerimeter` (4 pine) | `overview`, `angled`, `street`, farm-edge preset, `home-street` |
| **T3 Park** | `ParkRiverArc` (4) | `overview`, `angled`, `river`, `street` |
| **T4 Periphery** | `PeripheryForestFrame` (6) | **`overview`, `angled` only** |

Facility street presets (`home-street`, `store-street`, `workshop-street`) exclude T3/T4 to protect Street DC gate.

**Simulation authority:** tier tables live in presentation modules only; worker never reads them.

---

## 9. Reconciled render budget (§3 ChatGPT)

**Baseline (R4.1 measured @ `6dbd8b5`, live GL after frame settle):**

| Preset | DC | Tris |
|---|---:|---:|
| Overview 06:00 | 135 | 94,253 |
| Overview 12:00 | 138 | 94,589 |
| Angled | 124 | 94,908 |
| Street | 76 | 83,323 |

**R5.1 gates:** Overview ≤**140** DC, Street ≤**100** DC, Overview visible ≤**135,000** tris, retain ≥**5** DC / ≥**8k** tris headroom vs hard caps where feasible.

### 9.1 Incremental triangle ledger (measured unit costs)

| Unit | Tris/instance | Notes |
|---|---:|---|
| Quaternius commonTree1 | 3,153 | instanced — visible tris = n × cost |
| Quaternius commonTree2 | 2,702 | |
| Quaternius pine1 | 1,749 | |
| Quaternius pine2 | 1,642 | |
| Quaternius bushFlowers | 838 | |
| Quaternius bush | 600 | |
| Quaternius fern | 81 | |
| Quaternius pebble1 | 97 | |
| Kenney treeSmall / treeLarge | 42 | |
| Kenney fenceLow | 180 | 48 instances max |

**New Quaternius instances by tier (incremental over R4.1):**

| Tier | New instances | Δ tris (sum) | Δ DC |
|---|---:|---:|---:|
| T1 District | 12 | **+22,400** | **+0** (URLs already loaded by T0 baseline) |
| T2 Orchard | 4 pine1 | **+6,996** | **+0** |
| T3 Park | 4 mixed | **+8,432** | **+0** |
| T4 Periphery | 6 mixed | **+11,200** | **+0** |
| **Subtotal new nature** | **26** | **+49,028** | **+0** |

**R4.1 recovery (all presets):**

| Change | Δ tris | Δ DC |
|---|---:|---:|
| Ground tint 5 zones → 2 subtle bands | **−6,200** | **−3** |
| Civic paver scatter −40% | **−1,800** | **−1** |
| Material merge (frontage/shrub) | 0 | **−1** |
| **Subtotal recovery** | **−8,000** | **−5** |

**Warm atlas repack:** Δ tris **0**; Δ DC **0** (same mesh counts; ≤5 shared atlas materials replace green monoculture).

**Terrain vertex value bands (`TownLandscape.tsx`):** Δ tris **0**; Δ DC **0**.

### 9.2 Preset totals (reconciled — not per-group fiction)

Formula: `R4.1 preset baseline − recovery + Σ(visible tier tris)`.

| Preset | Visible tiers | Est. tris | Est. DC | Gate |
|---|---|---:|---:|---|
| **Overview 06:00** | T0+T1+T2+T3+T4 | 94,253 − 8,000 + 49,028 = **135,281** → prune **−1,500** (drop 1 periphery pine + 2 district bushes) = **133,781** | 135 − 5 = **130** | ≤140 / ≤135k ✅ |
| **Overview 12:00** | same | **~134,100** (lighting unchanged geometry) | **~131** | ≤140 / ≤135k ✅ |
| **Angled** | T0–T4 (no T3 if angled farm occludes — still mount T3) | **~133,500** | **~128** | info |
| **Street** | T0+T1+T2 only (no T3/T4) | 83,323 − 8,000 + 22,400 + 6,996 = **104,719** → within Street context acceptable; facility streets lower | 76 − 5 = **71** + T1 = **~71** | ≤100 ✅ |
| **home/store/workshop-street** | T0+T1+T2 | **~100k–103k** | **~72–78** | ≤100 ✅ |

**Prune order if live GL exceeds gate after Phase B measure:** (1) periphery pine #5–6, (2) park arc #3–4, (3) district bushes #6–7, (4) ground tint opacity — **never** civic colonnade, M02 corridor, commercial frontage, Kenney orchard grid.

**M03 headroom after R5.1:** ~1.2k–6k tris / ~5–9 DC below Overview hard caps — **incidental only**; 20 citizens still require LOD/culling per `Docs/milestones/WF01/M03_HEADROOM.md`.

### 9.3 Measurement protocol (implementation)

After Phase B, run `scripts/capture-wf02-evidence.mjs` diagnostics path for **Overview 06:00, Overview 12:00, Angled, Street** — record live GL `drawCalls` / `triangles` from existing diagnostics store (`src/ui/stores/diagnosticsStore.ts`). **Do not ship on theoretical ledger alone.**

---

## 10. Compositional hierarchy (unchanged intent)

| Layer | R4.1 | R5.1 |
|---|---|---|
| Ground tint | 5 faint zones | **2** subtle bands (residential, farm) |
| Terrain | single meadow | **3 vertex value regions** (meadow / garden / farm) |
| Canopy | sparse Kenney dots | **T1–T4 Quaternius masses** + Kenney grid |
| Palette | green colormap monoculture | **5 warm atlas roles** |
| Heroes | weak | civic plaza ring, orchard block, park arc, future lot gardens |

---

## 11. Hero district compositions

| Hero | Elements (all legal §6 assets) | VST |
|---|---|---|
| Civic | Fountain + 4× Kenney treeLarge + radial pavers + warm civic atlas on hall/school | VST-05 |
| Orchard | Kenney 4×5 interior + 4× pine perimeter + field bands + farm_straw atlas | VST-03 |
| River/park | ParkRiverArc + lawn vertex band + benches | VST-04 |
| Commercial | Awning/sign/apron clusters + warm_commercial atlas | road subordination |
| Future lots | Fence + corner shrub + interior garden (no buildings) | VST-06 |

---

## 12. Facility / entrance truth audit (pre-READY)

Re-run R4.1 14-facility table + post-repack bounds/door/road checks (§7.4). M02 entrances frozen: house-1 `(11,-7.6)`, store `(-11,7.6)`, workshop `(-11,20.2)`.

---

## 13. Objective visual stop tests

| ID | Stop test |
|---|---|
| VST-01 | Central/peripheral olive void ≤33% Overview frame |
| VST-02 | Periphery canopy band ≥10% frame perimeter |
| VST-03 | farm-3 orchard mass ≥6% frame area |
| VST-04 | Park/river arc ≥5% frame area |
| VST-05 | Civic readable without labels @ Overview |
| VST-06 | All 8 future lots show fence/garden structure |
| VST-07 | ≥4 building categories distinguishable by silhouette **and** warm atlas color family |
| VST-08 | Side-by-side: ordinary viewer picks R5.1 over R4.1 as closer to north-star |
| VST-09 | 06:00 Overview readable without noon compensation |

---

## 14. Evidence pipeline (§7 ChatGPT)

### 14.1 Hygiene rules

| Rule | Implementation |
|---|---|
| **No stale `01_wf02_overview.png`** | Remove from `SHOTS` in `scripts/capture-wf02-evidence.mjs`; add CI guard `scripts/wf02-evidence-hygiene.mjs` fails if file generated |
| Authoritative Overview names | `01_wf02_overview_dawn.png`, `01b_wf02_overview_noon.png` only |
| Manifest | `planRevision: 5.1`, `gitSha` exact implementation HEAD, per-shot DC/tris |
| Release tag | `review-evidence-wf02-r51-<sha7>` from **implementation** SHA only |
| No stale R4.1 CURRENT | Release contains R5.1 captures only; R4.1 referenced via pinned tag `review-evidence-wf02-r41-6dbd8b5` |

### 14.2 Required evidence set

| Asset | Purpose |
|---|---|
| `00_north_star.png` | Canonical reference copy |
| `00_before_wf01_overview.png` | WF01 BEFORE (pinned release URL) |
| `00_prior_r41_blocked_overview_dawn.png` | R4.1 blocked reference @ `6dbd8b5` |
| `01_wf02_overview_dawn.png` | R5.1 CURRENT @ 06:00 |
| `01b_wf02_overview_noon.png` | supplementary daylight |
| `02_wf02_angled` … `15_*` | civic, residential/future lots, commercial/work, farm/orchard, river/park, street citizen+door/sidewalk, store/workshop, attachments, night |
| `compare_wf01_r51_r41_northstar.png` | merged strip |
| `manifest.json` | SHA + every shot + 0 asset/network errors |

Evidence uses **same** `cameraView` / tier visibility as gameplay — no evidence-only exposure or branch.

---

## 15. Implementation map (post-approval)

| Concern | Files |
|---|---|
| Visibility tiers | **NEW** `compositionVisibility.ts`; wire `cameraView` into `OverviewCompositionLayer`, `VegetationLayer` |
| Nature restore | `EnvironmentAssetRegistry.ts` (tables §8.2), **NEW** `PeripheryForestFrame.tsx`, `DistrictCanopyRestore.tsx`, `ParkRiverArc.tsx`, `OrchardPerimeter.tsx` |
| Atlas repack | `public/assets/glb/kenney/_archive/pre-r5/`, warm textures §6.4, `ASSET_REGISTER.md` |
| Orchestrator | `OverviewCompositionLayer.tsx`, `districtMassing.ts`, `compositionMask.ts` |
| Terrain | `TownLandscape.tsx` |
| Ground tint | `DistrictGroundTint.tsx` (2 zones) |
| Palette/lighting | `DistrictPalette.ts`, `DayNightLighting.tsx` |
| Evidence | `scripts/capture-wf02-evidence.mjs`, **NEW** `scripts/wf02-evidence-hygiene.mjs` |
| Tests | `tests/unit/wf02/overviewComposition.test.ts`, visibility tier tests, repack bounds audit |

---

## 16. What R5.1 explicitly rejects

- Path B building imports / Quaternius Buildings
- Optional/or-equivalent asset candidates
- Geometric frustum culling unspecified in architecture
- Per-group triangle tables that exceed preset totals
- Mutating CC0 originals in place
- Camera/scale changes
- Evidence-only rendering branches

---

## 17. Stop condition

Post `[GOD-MODE:CURSOR-PLAN]` Plan revision **5.1** → **STOP**. No production code, repack, import, or evidence until `Decision: APPROVED_TO_BUILD`. Do not merge. Do not start M03.

---

## Appendix A — ChatGPT PLAN_CHANGES_REQUIRED checklist

| # | Requirement | R5.1 section |
|---:|---|---|
| 1 | Resolve asset decision before build | §3, §6 — **P-A+E-N only** |
| 2 | No speculative asset names | §6 verified tables |
| 3 | Reconcile performance math | §9 preset totals |
| 4 | Deterministic explicit culling | §8.3 preset tiers via `cameraView` |
| 5 | Atlas integrity + rollback | §7 |
| 6 | Freeze camera; pixel primary | §4, §5 |
| 7 | Evidence hygiene | §14 |

## Appendix B — R5 → R5.1 corrections

| R5 gap | R5.1 fix |
|---|---|
| Path A vs B ambiguity | Single **P-A+E-N** path; imports rejected |
| Quaternius Buildings optional | **Excluded** |
| Per-group ~70k tris fiction | Preset-summed ledger §9.2 |
| "Overview-frustum" vague | **`cameraView` tier gate** §8.3 |
| Optional atlas deferral | Atlas normalization **required** in build path |
| Stale evidence filename | §14 delete `01_wf02_overview.png` + guard |
