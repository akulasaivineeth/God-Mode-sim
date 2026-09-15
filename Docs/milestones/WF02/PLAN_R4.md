# WF02 Plan Revision 4 — Overview-Scale Presentation Composition

**State:** WAITING_FOR_CHATGPT_PLAN_APPROVAL  
**Investigation base SHA:** `8be181cd244bb9817aae13200e01d4b3d3b5c886` (WF02-002 blocked)  
**Branch:** `cursor/wf02-scale-calibration-754a`  
**Scope:** PLAN ONLY — no production code, asset import, or implementation until `[GOD-MODE:CHATGPT-PLAN-DECISION] Decision: APPROVED_TO_BUILD`

---

## 1. Work item

WF02 — North-Star Scale & Aesthetic Calibration (presentation-only milestone; simulation/geography frozen).

---

## 2. Decision context

- **Review:** WF02-002 @ `8be181c`
- **Gate:** BLOCKED (visual/aesthetic hard gate; repeated failure after WF02-001)
- **ChatGPT decision:** FIX_REQUIRED — Plan R4 required; **root-cause change required**
- **Engineering preserved:** 154/154 tests, sim authority, performance gates (~127–130 Overview DC / ~140k tris)

R2 changed scale. R3 added bounded props/lighting/local modules. Neither altered **dominant overview image-space shapes**. R4 must redesign the **presentation composition layer**, not add more scatter polish.

---

## 3. Executive summary

R4 introduces a deliberate **overview-scale presentation composition system** that breaks the current sparse dark-green envelope into coherent district blocks using **massing clusters, canopy bands, frontage strips, and district palette roles** — all presentation-only, all within existing ~240 m geography and frozen facility coordinates.

**Core architectural addition:** a single new orchestrator `OverviewCompositionLayer.tsx` backed by declarative `districtMassing.ts` specs, integrating/upgrading R3 modules (`FutureLotPresentation`, `CommercialStreetLife`, `TownAmenities`, `CorridorPresentation`, `VegetationLayer`) rather than creating a parallel render authority.

**Target visual outcome:** From Overview/Angled, an ordinary viewer sees a **warm, layered miniature town** with readable civic anchor, residential garden blocks, commercial frontage rhythm, farm/orchard silhouette, and river/park edge — not “WF01/R2/R3 with dressing.”

**Scale discipline:** Structured mass covers **~38% of currently empty overview envelope** (~4,200 m² of ~11,000 m² visually vacant midground), preserving **~62% intentional growth negative space** appropriate for a ~20-founder starter town.

---

## 4. Preserved (frozen — do not revert or touch)

| Domain | Frozen artifact |
|---|---|
| Simulation | `src/simulation/**`, worker authority, determinism, seeded RNG |
| Geography | `src/world/facilityPoints.ts`, authoritative `LOCATIONS`, building centers |
| M02 trio | house-1 (11,-10), store (-11,11), workshop (-11,23) centers/entrances/route |
| Topology | `townLayout.ts` road segments, river polyline, `riverCrossSection.ts` carve |
| R2 scale | All 14 `targetWidth` values; 2.32 m presentation / 1.8 m sim citizen |
| Layout authority | `modelLayout.ts` + `modelLayoutManifest.json` + `buildingPresentationAnchors.ts` |
| Cameras (comparison) | Overview `[10,93,54]→[30,2,4]`, Angled `[68,53,37]→[28,3,2]` |
| Performance baseline | R3 measured: Overview 127–130 DC / 140,305–140,641 tris; Street 70–73 DC |
| R3 systems (reuse) | Instanced curbs/farm rows, `FutureLotPresentation`, `CommercialStreetLife`, e2e serial camera suite |
| Assets (provenance) | Registered Kenney + Quaternius only unless R4 plan explicitly approves import |
| Scope | No M03 population gameplay, no runtime LLM/API |

---

## 5. Root cause analysis

| Layer | R2 attempt | R3 attempt | Why still blocked |
|---|---|---|---|
| Building presence | +40% footprints | unchanged | Larger silhouettes alone; roofs still read as one green family at Overview |
| District envelope | none | local scatter modules | Modules too small vs 240 m empty terrain fields |
| Vegetation | sparse dots | +38 placements, perf-trimmed | Individual scatter, not **canopy massing** |
| Streets | roads readable | benches/lamps/curbs | Roads still dominate as lines across grass |
| Palette | minor lighting | dawn floor 0.62, warm paths | Kenney atlas roofs unchanged; ground still dark-green dominant |
| Farm/civic/park | minimal | farm rows, reframed cameras | No overview-readable orchard/civic **silhouette** |

**Limiting abstraction:** presentation composition treats the town as **facilities + road spine + sparse props**. North-star treats it as **block/frontage/canopy/orchard/park-edge composition** where empty space is **shaped**, not merely tinted grass.

---

## 6. R4 strategy — root-cause change

### 6.1 New presentation composition layer (not another prop pass)

Add **`src/rendering/environment/OverviewCompositionLayer.tsx`** mounted once in `Scene.tsx`, composing:

1. **`districtMassing.ts`** — declarative district specs (bounds, layers, counts, materials)
2. **`CanopyMassing.tsx`** — instanced Quaternius + Kenney tree clusters (5–12 trees per cluster, 1 draw/part/URL)
3. **`FrontageBands.tsx`** — instanced hedge/shrub/sidewalk widening strips along block edges
4. **`DistrictGroundTint.tsx`** — presentation-only ground overlay meshes (warm tan/ochre/garden green), **not** editing `townLayout.ts` colors
5. **`CivicAnchorMassing.tsx`** — square frame: twin `treeLarge`, radial path ring, amenity silhouette readable from Overview
6. **`FarmOrchardSilhouette.tsx`** — Kenney `treeSmall` 4×5 orchard grid + widened field bands + approach `pathLong`
7. **`RiverParkEdge.tsx`** — park canopy arc + promenade scatter + shore shrub band

**Integration rule:** R3 files become **subcomponents called by** OverviewCompositionLayer; no duplicate placements.

### 6.2 What R4 explicitly rejects

- Another global `targetWidth` multiplier or camera zoom
- More isolated benches/lamps without block massing
- Screenshot-time-only exposure tricks
- Generic box buildings as filler
- Moving authoritative facilities/routes/roads/river

---

## 7. District occupancy / massing map

**Coordinate system:** CANONICAL_TOWN, groundExtent 120 → **240 m** plane. Overview camera sees roughly x ∈ [-40, 100], z ∈ [-70, 110].

### 7.1 Envelope accounting (overview-visible)

| Zone | Current built footprint (approx) | Current empty visual (approx) | R4 structured mass target | Remaining growth space |
|---|---:|---:|---:|---:|
| Civic core (square + hall cluster) | 480 m² | 900 m² | **+520 m²** canopy/path/frame | 380 m² |
| Residential cluster + future lots | 1,100 m² | 3,800 m² | **+1,450 m²** gardens/hedges/lot pads | 2,350 m² |
| Commercial/work frontage | 900 m² | 1,600 m² | **+780 m²** apron/hedge/canopy bands | 820 m² |
| Farm/orchard + approach | 520 m² | 2,400 m² | **+900 m²** orchard grid + field bands | 1,500 m² |
| River/park edge | 616 m² | 1,400 m² | **+550 m²** promenade/canopy arc | 850 m² |
| **Total midground envelope** | **~3,600 m²** | **~11,100 m²** | **+4,200 m² (~38%)** | **~6,900 m² (~62%)** |

This remains a **~20-founder town**: 14 facilities + 8 future lots; massing fills **block courtyards and frontages**, not simulating extra population.

### 7.2 District-by-district spec

#### A. Civic anchor (town identity from Overview)

**Bounds:** x ∈ [-28, 8], z ∈ [-28, 8]  
**Sightline:** Overview target [30,2,4] must show fountain disc + hall/school mass + framing trees

| Element | Asset / geometry | Count | Placement |
|---|---|---:|---|
| Square frame trees | Kenney `treeLarge` | 4 | (-14,-14), (14,-14), (-14,14), (14,14) scale 1.1–1.2 |
| Radial path ring | scatter `paver` + Kenney `pathShort` ×8 | 8+32 | r=6.5–8.5 around (0,0) |
| Corner shrubs | Quaternius `bushFlowers` | 6 | square corners + approach axes |
| Amenity read | existing fountain + 6 benches + 6 lamps | keep | `TownAmenities.tsx` refactor into civic submodule |

**Overview test:** civic mass occupies **≥25%** of central overview frame (annotated overlay in evidence).

#### B. Residential cluster + future lots

**Bounds:** x ∈ [6, 100], z ∈ [-67, -6]  
**Blocks:** houses at (11,-10), (30,-12), (11,-30), (30,-30), apartment (52,-22); 8 vacant 10×10 lots

| Element | Asset | Count | Notes |
|---|---|---:|---|
| House garden hedges | Kenney `fenceLow` instanced | 48 segments | 3 sides × 4 houses + apartment front |
| Lot envelopes | R3 paver+fence posts | upgrade | 2×2 pavers + 8 posts/lot (keep instanced) |
| Street canopy pairs | Quaternius `commonTree1/2` | 8 clusters × 3 trees | along z=-22 and z=-42 spines |
| Hedge line | Quaternius `bush` | 8 | x=24,36,48,60 at z=-44 + mid-block |
| Garden tint overlay | `DistrictGroundTint` warm tan | 1 mesh | residential rect x∈[8,82], z∈[-65,-8] alpha blend |

#### C. Commercial / work frontage (spatial rooms)

**Bounds:** x ∈ [-57, 0], z ∈ [6, 53]  
**Streets:** z=18 commercial, z=38 industrial (topology frozen)

| Element | Asset | Count | Notes |
|---|---|---:|---|
| Block sidewalk widening | scatter + `MAT.sidewalk` instanced strips | 6 strips | 2 m widen west of x=-8..-48 at z=18,38 |
| Frontage shrubs | Quaternius `bushFlowers`/`flowers` | 16 | every 4 m along store/cafe/workshop/warehouse facades |
| Apron rhythm | Kenney `pathShort` + scatter paver | 12 | store, cafe, workshop, warehouse entrances |
| Work separator | R3 separator + hedge band | 6 | store/workshop mid-block z≈17–19 |
| Cafe parasol cluster | existing `detail-parasol-a` | 2 | keep anchor |
| Commercial tint | ochre ground overlay | 1 mesh | x∈[-58,-2], z∈[8,52] |

#### D. Farm / orchard silhouette

**Bounds:** x ∈ [36, 70], z ∈ [72, 103]  
**Plots:** farm-1 (45,90), farm-2 (62,78), farm-3 orchard (55,98)

| Element | Asset | Count | Notes |
|---|---|---:|---|
| Orchard grid | Kenney `treeSmall` | **20** (4×5) | farm-3 centered (55,98), 2.4 m spacing |
| Field bands | instanced farm rows (existing) | widen to 5 rows/plot | alternating A/B materials |
| Farmhouse approach | Kenney `pathLong` + 2× `treeLarge` | 3 | flanking (22,82) approach from road-farm |
| Field tint | warm straw overlay | 1 mesh | farm rect union |
| Edge shrubs | Quaternius `bush` | 8 | plot corners |

**Overview test:** orchard reads as **rectangular canopy mass**, not 3 green boxes.

#### E. River / park edge

**Bounds:** park center (72,38) 28×22; river x≈74–96

| Element | Asset | Count | Notes |
|---|---|---:|---|
| Park canopy arc | Quaternius `commonTree1/2` + `pine1` | 14 | semicircle r=7–10 facing river |
| Promenade pavers | scatter `paver` | 24 | arc along park river edge |
| Shore band | Quaternius `fern`/`pebble` | 10 | x=68–72, z=30–46 |
| Bench ring | R3 (reduce to 4 park benches) | 4 | perf-neutral vs civic 6 |
| Kenney path modules | `pathShort` ×5 | 5 | reinstate river-facing paths (removed in R3 perf trim) |

---

## 8. Annotated composition map (evidence deliverable)

R4 evidence will include **`composition_map_r4.svg`** (or PNG overlay) on Overview screenshot showing:

- Civic frame (red)
- Residential garden blocks (tan)
- Commercial frontage bands (ochre)
- Farm/orchard silhouette (straw/green grid)
- River/park edge (blue-green)
- Intentional future negative space (hatched)

Same map regenerated for WF01/R2/R3/R4 comparison strip to falsify “same empty envelope” claim.

---

## 9. Asset inventory assessment

### 9.1 Registered Kenney GLBs on disk (29 total)

**Buildings (14/14 assigned — no spare building GLBs on disk):**

| GLB | Facility | Silhouette role |
|---|---|---|
| home-cottage | house-1 | M02 anchor cottage |
| home-type-a/c/d | house-2/3/4 | residential variety |
| apartment-block | apartment | mid-rise mass |
| store-general | store | M02 anchor |
| cafe-bistro | cafe | gable + parasol |
| clinic, school, community-hall | civic cluster | public massing |
| workshop-industrial | workshop | M02 anchor |
| warehouse, utility-station | industrial | large/industrial read |
| farmhouse | farmhouse | farm anchor |

**Props currently underused (R4 deploy target):**

| GLB | Registered | R3 runtime | R4 plan |
|---|---|---|---|
| `tree-small.glb` | yes | **0** | 20 orchard instances (instanced) |
| `tree-large.glb` | yes | **0** | 6 civic/farm frame instances |
| `fence-low.glb` | yes | **0** (anchors exist, unused) | 48 residential lot segments (instanced) |
| `path-short/long`, `driveway-short` | partial | sparse | +35 frontage/apron instances |

**Road + character GLBs:** fully used; no recovery budget from removal.

### 9.2 Quaternius inventory (10 types — all used)

R4 shifts from **sparse individual** to **clustered instancing** (same URLs, higher instance counts, fewer unique draw calls via grouping).

### 9.3 Kenney pack gaps (not on disk)

Audited Kenney City Kit Suburban/Commercial/Industrial pack listings vs imports:

| Kenney original ID | Status | Notes |
|---|---|---|
| `building-type-f.glb` (Suburban) | **NOT imported** | Distinct silhouette; proposed optional import — see §10 |
| `building-type-h.glb` (Suburban) | maps to school | already used |
| Other commercial/industrial letters | mapped to current 14 | no additional CC0 silhouettes remain unimported |

**Conclusion:** Existing 14 silhouettes provide variety but **share green-roof colormap family**. Overview monoculture is an **atlas/material** limit, not a missing silhouette limit.

---

## 10. Optional new asset family proposal (NOT pre-approved)

**Only if ChatGPT requires breaking green-roof monoculture beyond presentation massing:**

| Field | Proposal |
|---|---|
| Candidate | Kenney **City Kit Suburban** `building-type-f.glb` |
| Source | https://kenney.nl/assets/city-kit-suburban |
| License | CC0 1.0 (same as existing) |
| Import path | `public/assets/glb/kenney/suburban/home-type-f.glb` |
| Use | **Presentation-only** swap for `house-3` visual (sim ID unchanged) OR additional presentation-only backdrop mass at vacant lot (clearly non-interactive) |
| Triangle budget | ~1,800–2,400 tris/mesh part × 1–2 parts ≈ **+2.5k tris** if one building swapped |
| Draw budget | +1–2 Overview DC (one new URL group) |
| Why Kenney alone insufficient | 14 silhouettes differ in shape but share atlas hue; north-star needs **warm multi-hue roof read at Overview** without fake boxes |
| Default R4 path | **Do not import**; achieve hue break via ground tint overlays + canopy massing + district palette roles first; import only if Grok criterion still fails |

**No import until plan approval explicitly authorizes.**

---

## 11. Palette architecture (coherent roles — not ad hoc tweaks)

New file: **`src/rendering/palette/DistrictPalette.ts`**

| Role | Hex (presentation) | Applied to |
|---|---|---|
| `groundMeadow` | `#5a7348` | base terrain vertex lerp (warmer than `#3c4a34`) |
| `groundResidential` | `#c8b888` | residential overlay |
| `groundCommercial` | `#d4bc94` | commercial overlay |
| `groundFarm` | `#b8a868` | farm field overlay |
| `groundPark` | `#6a9a58` | park lawn (existing foliageLight family) |
| `canopyDeep` | `#3d6b38` | cluster shadow mass |
| `canopyLight` | `#7aaa58` | sunlit canopy |
| `accentWarm` | `#c87848` | civic paths, farm rows B |
| `accentCool` | `#6a8a9a` | river/park edge |
| `roofRead` | (atlas + overlay) | **presentation tint pass** on Kenney roof mesh names matching `/roof/i` — multiply `#8a5a44`, `#96634a`, `#7a6551`, `#6e5238` by district |

**Implementation owner:** extend `gltfPipeline.prepareStaticGltfRoot` with optional `districtRole` tint map (presentation-only clone materials; simulation untouched).

**Lighting (keep R3 dawn floor 0.62):** adjust `DayNightLighting` hemisphere ground to `#a08858` (warmer); dir light +0.08 midday; **no evidence-only exposure**.

---

## 12. Performance budget (mandatory — recover before add)

**Baseline (R3 @ 8be181c):** Overview **127** DC / **140,305** tris; headroom **13** DC / **9,695** tris.

### 12.1 Recovery sources (before adds)

| Recovery | Est. Δ DC | Est. Δ tris | Owner |
|---|---:|---:|---|
| Merge R3+VegetationLayer duplicate bush placements | -2 | -800 | `EnvironmentAssetRegistry.ts` |
| Remove 2 periphery forest trees (north/west edge) | -1 | -1,200 | `buildPeripheryForest()` |
| Park bench ring 6→4 | 0 | -120 | `TownAmenities.tsx` |
| Deduplicate commercial/apron GLB URLs via instancing | -1 | -600 | `CommercialStreetLife.tsx` |
| **Subtotal recovery** | **-4** | **-2,720** | |

### 12.2 R4 additions (net budget)

| System | Instances | Est. Δ DC | Est. Δ tris |
|---|---|---:|---:|
| Kenney treeSmall orchard grid (instanced) | 20 | +1 | +3,200 |
| Kenney treeLarge civic/farm (instanced) | 6 | +1 | +2,400 |
| Kenney fenceLow residential (instanced) | 48 | +1 | +1,800 |
| Canopy clusters Quaternius (6 clusters) | ~42 | +2 | +4,500 |
| Frontage bands (scatter instanced) | ~80 | +2 | +800 |
| District ground tint overlays (5 meshes) | 5 | +5 | +600 |
| River park pathShort reinstatement | 5 | +1 | +900 |
| Roof tint material clones (14 buildings) | 14 | 0 | 0 |
| **Subtotal adds** | | **+13** | **+14,200** |

### 12.3 Net target (post-R4)

| Preset | Target DC | Target tris | Gate |
|---|---:|---:|---|
| Overview | **133–138** | **145k–149k** | ≤140 / <150k (prune if exceeded) |
| Street | **74–82** | **132k–138k** | ≤100 |
| M03 headroom | ≥2 DC / ≥1k tris | documented in BUILD_NOTES | |

**Overflow policy:** If net exceeds gate, prune in order: (1) periphery forest, (2) park promenade pavers, (3) reduce orchard 20→16, (4) reduce canopy clusters — **never** prune civic frame or commercial frontage bands first.

---

## 13. Implementation map (actual repo paths)

| Concern | Primary files |
|---|---|
| Composition orchestrator | **NEW** `src/rendering/environment/OverviewCompositionLayer.tsx` |
| Declarative specs | **NEW** `src/rendering/environment/districtMassing.ts` |
| Palette roles | **NEW** `src/rendering/palette/DistrictPalette.ts` |
| Canopy clustering | **NEW** `src/rendering/environment/CanopyMassing.tsx` |
| Frontage / block edges | **NEW** `src/rendering/environment/FrontageBands.tsx` |
| Ground overlays | **NEW** `src/rendering/environment/DistrictGroundTint.tsx` |
| Building registry | `src/rendering/assets/buildings/buildingPrefabConfig.ts` |
| Prefab render | `src/rendering/assets/buildings/PrefabBuildings.tsx` |
| Anchors / layout | `buildingPresentationAnchors.ts`, `modelLayout.ts`, `modelLayoutManifest.json` |
| R3 modules (integrate) | `FutureLotPresentation.tsx`, `CommercialStreetLife.tsx`, `TownAmenities.tsx`, `CorridorPresentation.tsx` |
| Vegetation | `EnvironmentAssetRegistry.ts`, `VegetationLayer.tsx`, `InstancedVegetation.tsx` |
| Materials / lighting | `sharedMaterials.ts`, `DayNightLighting.tsx`, `TownLandscape.tsx`, `gltfPipeline.ts` |
| Scene mount | `Scene.tsx` (single mount point) |
| Cameras / evidence | `cameraPresets.ts`, `scripts/capture-wf02-evidence.mjs` |
| Tests | **NEW** `tests/unit/wf02/overviewComposition.test.ts`; extend `composition.test.ts` |
| Docs | `Docs/milestones/WF02/BUILD_NOTES.md`, `ASSET_REGISTER.md`, `KNOWN_LIMITATIONS.md` |

**Authority rule:** One composition orchestrator; no second layout authority; simulation never reads `districtMassing.ts`.

---

## 14. Evidence criteria (falsifiable — visual gate)

Independent review must be able to **reject** R4 if these fail:

1. **Same-view chain:** WF01 → R2 → R3 → **R4** → NORTH STAR at Overview + Angled, **same camera constants**, gameplay time **06:00** + **12:00** + night
2. **Composition map overlay** included (§8) proving structured mass in 5 districts
3. **Overview transformation test:** ordinary viewer can distinguish R4 from R3 without zoom — civic trees + orchard rectangle + residential hedge grid + commercial frontage tint visible
4. **Warm/multi-hue read:** not green-roof monoculture at Overview (annotated roof/ground samples in diagnostics only — not acceptance proxy)
5. **Civic anchor:** hall + fountain + frame visible together from Overview (not facade-fill close-up only)
6. **Farm/orchard silhouette:** rectangular canopy mass at farm-3; field bands visible
7. **Store/workshop:** separation visible; sim door/path authority preserved (AABB audit)
8. **Street hierarchy:** citizen + doorway + sidewalk/road in Street preset
9. **Zero asset/network errors;** 154/154 tests; measured render budget in manifest
10. **No stale filenames:** use `01_wf02_overview_dawn.png`, `01b_wf02_overview_noon.png` only; delete/avoid legacy `01_wf02_overview.png`

**PASS bar:** pixels show material overview transformation toward north-star **family** — not numeric gate alone.

---

## 15. Do-not-touch / stop condition

**Do not touch:** `facilityPoints.ts`, `simulation/**`, authoritative centers/entrances/routes, road topology, river carve, R2 widths, M03 scope, runtime LLM/API.

**Do not repeat:** symptom-level scatter-only iteration; global scale bump; camera zoom; screenshot-time manipulation.

**Stop condition:** Post `[GOD-MODE:CURSOR-PLAN]` with `State: WAITING_FOR_CHATGPT_PLAN_APPROVAL` → **STOP**. No production code until ChatGPT posts `Decision: APPROVED_TO_BUILD`.

---

## Appendix: R3 → R4 delta summary

| R3 (blocked) | R4 (planned) |
|---|---|
| Local scatter modules | Overview-scale **composition layer** with occupancy map |
| 38 sparse vegetation placements | **Clustered canopy massing** (~100+ instances, instanced) |
| Unused Kenney trees/fences | **Deploy treeSmall/treeLarge/fenceLow** at scale |
| Ad hoc material tweaks | **DistrictPalette roles** + optional roof tint pass |
| Perf-trimmed orchard to farm rows only | **Orchard GLB grid** + field bands (budgeted) |
| Civic camera reframe only | Civic **frame mass** visible from Overview |
| Evidence compare WF01→R3 | Evidence compare **WF01→R2→R3→R4→north-star** |
