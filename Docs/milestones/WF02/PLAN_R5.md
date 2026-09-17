# WF02 Plan Revision 5 — Art-Direction Vocabulary & Dense Composition

**State:** WAITING_FOR_CHATGPT_PLAN_APPROVAL  
**Supersedes:** Plan revision 4.1 (`Docs/milestones/WF02/PLAN_R4_1.md`)  
**Investigation base SHA:** `6dbd8b5f8373cfcfced7b34bf9bdb57f783386e6` (WF02-003 blocked — **3rd consecutive visual failure**)  
**Branch:** `cursor/wf02-scale-calibration-754a`  
**Scope:** PLAN ONLY — no production code, asset import, or implementation until `[GOD-MODE:CHATGPT-PLAN-DECISION] Decision: APPROVED_TO_BUILD`

---

## 1. Work item

WF02 — North-Star Scale & Aesthetic Calibration (presentation-only milestone; simulation/geography frozen).

---

## 2. Decision context

| Review | SHA | Gate | Lesson |
|---|---|---|---|
| WF02-001 (R2) | `e3c1b3f` | BLOCKED | Scale/camera alone |
| WF02-002 (R3) | `8be181c` | BLOCKED | Local props/lighting alone |
| WF02-003 (R4.1) | `6dbd8b5` | BLOCKED | Composition-layer architecture correct; **vocabulary + mass density insufficient**; recovery removed lush framing before equivalent high-value mass restored |

**ChatGPT decision:** FIX_REQUIRED — Plan R5 required; **REPEATED FAILURE — ROOT-CAUSE CHANGE REQUIRED**  
**Engineering preserved @ 6dbd8b5:** 157/157 unit+integration, 7/7 e2e (clean rerun), sim/`facilityPoints` frozen, 0 asset/network errors, Overview **135–138 DC / ~94k tris**, Street **76–79 DC / ~83–84k tris**.

**Product gate still fails:** R4.1 Overview remains near-indistinguishable from R3 to ordinary viewers — sparse, flat, cool/olive Kenney settlement. Ground-tint grids, sparse Kenney trees, hedge segments, and civic pavers are **incremental dressing**, not north-star family densification.

---

## 3. Executive summary — what R5 changes (root cause)

R4/R4.1 correctly introduced a **single composition orchestrator** but treated the problem as **layout of existing subtle props**. R5 reframes the root cause as **art-direction vocabulary + image-space mass hierarchy**:

1. **Image-space composition study first** — define dominant warm shapes that must visibly change at Overview (not another code-first scatter pass).
2. **Asset-vocabulary decision** — audit proves current 14 Kenney buildings share one green `colormap` atlas family; **palette/roofline diversity requires offline material normalization and/or a tightly curated CC0 import set** (proposed, not pre-approved).
3. **Intentional nature mass restoration** — R4.1 emptied `buildPeripheryForest()` and `buildDistrictCompositionPlacements()` (~22 Quaternius placements) before adding faint Kenney dots; R5 **restores dense instanced canopy/forest framing** with measured budget, using Quaternius where silhouette value wins.
4. **Replace ground-tint dependence** with **terrain-value bands + canopy masses + hero district silhouettes** (civic plaza ring, orchard block, river/park arc, residential garden blocks).
5. **Warm palette via offline atlas roles** — not runtime roof tint (R4.1 GLB audit: single merged mesh per building, material name `colormap` only).
6. **Evidence hygiene** — delete stale `01_wf02_overview.png`; SHA-embedded manifest; falsifiable visual stop tests.

**Explicit prohibition:** Another global scale/camera zoom, another scatter-only pass, generic box-building filler, or decorative roads that lie about pathing.

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
| R4.1 engineering | Instancing discipline, composition orchestrator pattern, ~94k Overview baseline |
| Useful modules | `FutureLotPresentation`, `CommercialStreetLife`, instanced curbs/farm rows where retained |
| Scope | No M03 population gameplay, no runtime LLM/API |

---

## 5. Image-space composition study (plan deliverable — §1)

**Method:** Annotated Overview frame @ 06:00 (1440×900, camera frozen) divided into **dominant shape zones**. Plan doc includes `composition_map_r5.svg` (diagnostic only; acceptance = pixels).

### 5.1 Dominant shapes that MUST visibly change vs R4.1

| Zone | R4.1 failure (image-space) | R5 target shape (Overview-readable) | Approx world coverage | Approx screen coverage @ Overview |
|---|---|---|---:|---:|
| **A. Civic/commercial core** | Faint tan wash; square reads as flat disc | Warm plaza ring + tree colonnade + hall/store mass cluster; roads visually **contained** by frontage | 55×45 m authored envelope | **~18%** frame |
| **B. Residential garden block** | Olive void + faint grid tint | Continuous hedge/garden **blocks** between houses and future lots; street tree lines | 74×57 m | **~16%** frame |
| **C. Future lots (8)** | Small paver dots | **Legible lot garden structure**: paired fences, corner trees, interior shrub mass — not empty grass | 8×100 m² lots | **~6%** frame |
| **D. Farm/orchard hero** | Kenney dots + thin rows | **Single rectangular orchard canopy block** + field band silhouette + farmhouse approach frame | 34×31 m farm-3 + bands | **~8%** frame |
| **E. River/park edge** | Sparse park scatter | **Curved canopy arc** + promenade edge + brighter lawn mass facing river | 28×22 m park + 20 m shore band | **~7%** frame |
| **F. Forest/periphery frame** | **Removed in R4.1 recovery** | Dense north/west/east **forest wall** framing town; no vast unframed olive periphery | 240 m extent edges | **~12%** frame perimeter band |
| **G. Intentional growth void** | Entire central/right meadow reads as missing content | **Structured negative space** between blocks — still ~20-founder, not city density | ~62% of midground envelope | **~33%** frame (down from ~45% in R4.1) |

**Negative-space discipline:** Structured mass rises from **~38% (R4 plan)** to **~55–58% of midground envelope** while keeping **~42–45% deliberate growth void** — achieved via **canopy/forest mass**, not fake buildings.

### 5.2 Road subordination (image-space, topology frozen)

Roads remain authoritative polylines. R5 adds **inhabited edge mass** so roads read through adjacent volume:

| Road segment | Visual containment (presentation-only) |
|---|---|
| Main cross (6 m) | Sidewalk brighten + 2 m shrub/hedge bands on both sides in commercial/residential districts |
| z=18 commercial | Awning/sign/apron clusters + tree pairs at 8 m spacing west of facades |
| z=38 industrial | Lower hedge + warehouse apron rhythm; no new decorative roads |
| Residential loop | Continuous hedge + garden tint **between** loop and lot interiors |
| M02 path corridor | Keep clear; canopy frames path but does not block entrances |

---

## 6. Asset-vocabulary audit (§2 — mandatory)

**Sources inspected:** `Docs/assets/ASSET_REGISTER.md`, `Docs/art-direction/TOWN_VISUAL_DIRECTION.md`, `Docs/art-direction/ASSET_PIPELINE_PLAN.md`, on-disk inventory (29 Kenney GLBs + 10 Quaternius glTFs).

### 6.1 Current registered building inventory

| Pack | On disk | Assigned | Spare silhouettes |
|---|---:|---:|---|
| Kenney Suburban | 7 building GLBs + props | 5 houses/apartment/farmhouse | **building-type-f** not imported |
| Kenney Commercial | 5 building GLBs + details | store, cafe, clinic, hall, school | **building-c, building-a, building-g** not imported |
| Kenney Industrial | 3 building GLBs | workshop, warehouse, utility | **building-b, building-d, …** not imported |
| Quaternius Nature | 10 glTFs | vegetation only | **No building assets imported** |
| Quaternius Buildings | 0 | — | Pipeline contemplates; **not evaluated on disk** |

### 6.2 Material/palette audit (GLB JSON parse @ 6dbd8b5)

| Finding | Implication |
|---|---|
| All 14 Kenney buildings = **1 merged mesh**, material **`colormap`** | No runtime roof/wall split (R4.1 confirmed) |
| All share pack `Textures/colormap.png` green-dominant atlas | **Roofline variety ≠ palette variety** without offline work |
| Quaternius nature uses separate materials per glTF | Good for canopy; style differs from Kenney buildings |
| Runtime `districtOverlayMaterial` translucent grids | Readable only on close inspection; **fails Overview hierarchy** |

**Conclusion:** Existing registered inventory **cannot** produce north-star warm multi-hue roof/facade diversity through composition/scatter alone. R5 requires **one or both**:

- **Path A (preferred first):** Offline **atlas normalization** — 3–4 shared colormap variants (warm residential, warm commercial, civic cream, farm straw) applied at import time to selected GLBs; runtime uses **one material ref per variant** (not per-building clone).
- **Path B (curated import):** 2–4 additional CC0 silhouettes with distinct warm palettes, assigned as **presentation-only skins** to non-M02 facilities.

### 6.3 Proposed curated imports (NOT pre-approved — require explicit R5 approval)

| Candidate | Source | License | Intended use | Est. Δ DC | Est. Δ tris | Why superior to overlay |
|---|---|---|---|---:|---:|---|
| Kenney Suburban `building-type-f.glb` | city-kit-suburban | CC0 | **Presentation skin** for `house-3` (sim ID unchanged) | +1 | +1.8k | Distinct gable/warm atlas vs type-c |
| Kenney Commercial `building-c.glb` | city-kit-commercial | CC0 | **Presentation skin** for `utility` | +1 | +2.0k | Industrial/civic contrast vs warehouse block |
| Quaternius Buildings Pack `House_2.gltf` (or equivalent warm cottage) | opengameart CC0 | CC0 | **Optional presentation skin** for `house-4` only | +1 | +2.5k | Warm palette family; evaluate style coherence in plan approval |
| Quaternius `PalmTree` or second pine variant | Nature MegaKit (already partial) | CC0 | Park river edge accent only | +1 | +3k | Silhouette variety at park — **not** M02 corridor |

**Rejected without approval:** Full pack imports, phantom lot buildings, Quaternius buildings on M02 trio, generic Building Kit soup.

**Default R5 build path if imports denied:** Path A atlas normalization on existing 14 GLBs + dense nature mass (no new building URLs).

---

## 7. Presentation-only building variant rules (§3)

Any approved new skin:

- Maps to **existing facility ID** in `buildingPrefabConfig.ts`; `targetWidth` unchanged unless R2 table explicitly reopened (default: frozen).
- Auth center, M02 entrances, `facilityPoints.ts` **unchanged**.
- Presentation offset/rotation only via existing `resolvePresentationTransform` bounds.
- Re-run full 14-facility AABB/door/road audit post-implementation.
- **M02 trio (house-1, store, workshop):** Kenney originals retained unless PO explicitly approves exception; entrances must remain recognizable in Street preset.

---

## 8. Nature mass plan — restore/replace intentionally (§4)

### 8.1 R4.1 regression to correct

| Removed in R4.1 | Approx visual loss | R5 restoration |
|---|---|---|
| `buildPeripheryForest()` (4 Quaternius) | North/west edge framing | **`PeripheryForestFrame`**: 28–32 instances, 4 instanced URL groups |
| `buildDistrictCompositionPlacements()` (~18 Quaternius) | District canopy dots | **`DistrictCanopyClusters`**: 6 clusters × 4–6 trees (Quaternius), placed per §5 zones |
| Kenney treeSmall-only orchard | Weak rectangular read | **Hybrid orchard hero**: Quaternius row silhouettes + Kenney treeSmall fill |

### 8.2 Instance groups (declarative — `districtMassing.ts` extension)

| Group | Asset mix | Instances | Instanced DC | Visible tris (est.) |
|---|---|---:|---:|---:|
| Periphery north arc | Pine_1 + Pine_2 | 10 | 2 | ~39k |
| Periphery west strip | CommonTree_1 + CommonTree_2 | 8 | 2 | ~50k |
| Park river arc | CommonTree + Pine mix | 14 | 2 | ~70k |
| Orchard block (farm-3) | Pine_1 perimeter + treeSmall interior | 20 | 2 | ~18k |
| Residential street lines | treeLarge + bushFlowers | 16 | 2 | ~12k |
| M02 corridor (keep) | existing 6 placements | 6 | 2 | ~30k |

**Culling strategy:** Overview-frustum instances only for periphery forest (>90 m from center); Street/near modes render full set. Document in `KNOWN_LIMITATIONS.md`; deterministic placement table (no `Math.random`).

---

## 9. Compositional hierarchy — reduce ground-tint dependence (§5)

| Layer | R4.1 | R5 |
|---|---|---|
| Ground tint overlays | 5 zones, ~40% opacity grids — dominant technical approach | **Reduce to 2 subtle bands** (residential warm straw, farm straw); primary read from terrain vertex lerp |
| Terrain vertex colors | Single meadow shift | **Three warm terrain value regions** in `TownLandscape.tsx` (meadow / garden / farm) — presentation-only mesh |
| Canopy | Sparse Kenney 42-tris dots | **Quaternius mass clusters** (§8) |
| Public realm | Scatter shrubs | **Civic plaza ring geometry** + retained `TownAmenities` fountain; widened sidewalk instanced strips |
| Frontage | Commercial scatter | **Facade clusters**: awning + sign + parasol + pathShort rhythm per block (existing anchors, higher density) |

**No generic box-building filler.**

---

## 10. Warm palette / material plan (§6)

### 10.1 Offline normalization path (preferred)

1. **Audit export:** For each of 14 GLBs, record mesh name, material name, texture path, triangle count (script: extend `scripts/wf02-r41-audit.mjs`).
2. **Blender batch (one-time):** Duplicate `colormap.png` → `colormap_warm_residential.png`, `colormap_warm_commercial.png`, `colormap_civic_cream.png`, `colormap_farm_straw.png` with controlled hue shift (preserve window/door contrast).
3. **Repack GLB** per facility assignment; register in `ASSET_REGISTER.md`.
4. **Runtime:** `prepareStaticGltfRoot` unchanged — shared material refs per atlas variant (**max 4 building material URLs**, not 14 clones).
5. **Lighting:** Shift `DayNightLighting` hemisphere ground `#a08858` → `#b89868`; dawn floor 0.62 retained; **warm sky horizon** without evidence-only exposure.

### 10.2 If atlas normalization deferred

Approved imports (§6.3) must bring **intrinsic** warm palettes; no runtime tint fallback.

---

## 11. Hero district compositions (§8)

Each hero must produce an **unmistakable Overview silhouette** using legal existing or approved assets:

| Hero | Anchor | Composition elements | Overview stop test |
|---|---|---|---|
| **Civic** | Square (0,0) | Fountain disc + 4× treeLarge colonnade + radial paver ring + hall/school mass in Angled sightline | Civic identifiable **without labels** |
| **Orchard/farm** | farm-3 (55,98) | 4×5 Quaternius pine perimeter + Kenney treeSmall interior + 5 field bands + farmhouse flanking trees | Rectangular canopy block visible |
| **River/park** | park (72,38) | Semicircle canopy arc + brighter lawn disc + promenade pavers + 4 benches | Park reads as **green mass**, not dots |
| **Commercial frontage** | z=18 band | Awning/apron/sign clusters + tree pairs + warm commercial atlas | Road visually subordinate to facades |
| **Future lots** | 8×10 m plots | Fence perimeter + corner shrub + interior garden mass (no buildings) | Lots read as **deliberate garden capacity** |

---

## 12. Performance budget (§9 — R4.1 baseline)

**Baseline (R4.1 @ 6dbd8b5, live GL after frame settle):**

| Preset | DC | Tris |
|---|---:|---:|
| Overview 06:00 | 135 | 94,253 |
| Overview 12:00 | 138 | 94,589 |
| Street | 76 | 83,323 |

**R5 hard gates:** Overview ≤**140** DC, Street ≤**100** DC, Overview visible ≤**135,000** tris, retain ≥**5 DC / ≥8k tris** headroom vs gates where feasible.

**Tighter constraint:** Only **~2 DC** headroom at Overview noon — **consolidate materials/instancing before adding families**.

### 12.1 Per-system allocation (conservative worst-case)

| Phase | System | Δ DC | Δ tris |
|---|---|---:|---:|
| **Recovery** | Remove 5 ground-tint instanced zones → 2 + terrain vertex bands | **−3** | **−6k** |
| **Recovery** | Merge duplicate scatter materials | **−2** | 0 |
| **Add** | Periphery forest frame (§8.2) | **+4** | **+39k** |
| **Add** | Park river arc + orchard hero | **+4** | **+88k** |
| **Add** | Residential/civic canopy clusters | **+4** | **+42k** |
| **Add** | Atlas variants (4 materials, no mesh clone) | **+0–1** | **+0** |
| **Add** | Curated building skins (if approved, max 3 URLs) | **+2** | **+6k** |
| **Add** | Civic plaza ring + sidewalk widen (instanced) | **+1** | **+3k** |
| **Net (with culling)** | Periphery/park culled ~35% at Overview | **+4 to +6** | **+95k to +110k** |
| **Net visible @ Overview** | After frustum culling | **~137–139 DC** | **~118k–125k** |

**Overflow prune order:** park arc density → periphery west strip → orchard interior Kenney fill → ground tint — **never** civic colonnade, M02 corridor, or commercial frontage first.

**M03 note:** Remaining slack is incidental; 20 citizens require LOD/culling per `M03_HEADROOM.md`.

---

## 13. Facility / entrance truth audit (mandatory pre-READY)

Re-run R4.1 §5–§6 tables unchanged for widths/centers. Additional R5 checks:

| Check | Rule |
|---|---|
| M02 entrances | house-1 (11,-7.6), store (-11,7.6), workshop (-11,20.2) — canopy/hedge **≥1.5 m** clearance |
| Store/workshop | Presentation AABB gap ≥0.10 m; separator mass outside AABB |
| New building skins | AABB audit + Street preset door visibility |
| Future lots | No phantom facility GLBs; garden mass only |
| Road/water | `compositionMask.ts` exclusions preserved; no tint through roads/river |

---

## 14. Objective visual stop tests (§11 — support pixel review)

Independent review may reject R5 if **any** fail (in addition to ordinary-viewer pixel judgment):

| ID | Stop test | Measurement |
|---|---|---|
| VST-01 | No vast unframed olive field | Central/peripheral olive void **≤33%** of Overview frame (annotated overlay) |
| VST-02 | Forest frame present | Periphery canopy band **≥10%** of frame perimeter |
| VST-03 | Orchard mass | farm-3 rectangular canopy **≥6%** frame area |
| VST-04 | Park mass | Park/river arc **≥5%** frame area |
| VST-05 | Civic anchor | Square colonnade + fountain readable without labels @ Overview |
| VST-06 | Future lots | All 8 lots show fence/garden structure @ residential preset |
| VST-07 | Building diversity | **≥4** categories distinguishable by silhouette **and** color family @ Overview/Angled |
| VST-08 | R4.1 stagnation falsified | Blind side-by-side: **≥70%** naive viewers pick R5 as “more like north-star” vs R4.1 (diagnostic survey optional; pixel review authoritative) |
| VST-09 | Dawn readability | 06:00 Overview is self-readable without noon compensation |

---

## 15. Evidence pipeline (§10 — fresh canonical files)

### 15.1 Mandatory hygiene

| Action | Owner |
|---|---|
| **DELETE** generation of `01_wf02_overview.png` | `scripts/capture-wf02-evidence.mjs` |
| Authoritative Overview filenames only | `01_wf02_overview_dawn.png`, `01b_wf02_overview_noon.png` |
| Manifest embeds `sha`, `planRevision: 5` | manifest.json |
| Fail build if stale file present | CI/evidence script guard |

### 15.2 Required evidence set

Same-view chain: **WF01 BEFORE → R2 → R3 → R4.1 → R5 → NORTH STAR** @ Overview dawn; plus R5 noon, night, Angled, civic, residential/future lots, commercial/work, farm/orchard, river/park, Street citizen+door+sidewalk, store/workshop, attachments, diagnostics, **0 asset/network errors**.

Composition map (`composition_map_r5.svg`) — **diagnostic only**.

---

## 16. Implementation map (after approval — repo-truth paths)

| Concern | Primary files |
|---|---|
| Orchestrator | `src/rendering/environment/OverviewCompositionLayer.tsx` |
| Declarative specs | `src/rendering/environment/districtMassing.ts`, `compositionMask.ts` |
| Nature mass | **NEW** `PeripheryForestFrame.tsx`, **NEW** `DistrictCanopyClusters.tsx`; extend `CanopyMassing.tsx` |
| Terrain value bands | `src/rendering/environment/TownLandscape.tsx` |
| Ground tint (reduced) | `src/rendering/environment/DistrictGroundTint.tsx` |
| Palette / materials | `src/rendering/palette/DistrictPalette.ts`, `sharedMaterials.ts`, offline repacked GLBs |
| Building skins | `buildingPrefabConfig.ts`, `modelLayoutManifest.json`, `ASSET_REGISTER.md` |
| Registry | `src/rendering/assets/EnvironmentAssetRegistry.ts` |
| Scene mount | `src/rendering/Scene.tsx` (single orchestrator — no parallel authority) |
| Evidence | `scripts/capture-wf02-evidence.mjs`, `scripts/regenerate-wf02-manifest.mjs` |
| Tests | `tests/unit/wf02/overviewComposition.test.ts`, extend `buildingScale.test.ts` |
| Docs | `Docs/milestones/WF02/BUILD_NOTES.md`, `KNOWN_LIMITATIONS.md` |

**Authority rule:** One composition orchestrator; simulation never reads `districtMassing.ts`.

---

## 17. What R5 explicitly rejects

- Another tint/hedge/scatter increment on R4.1 vocabulary
- Removing Quaternius/periphery mass without **equal-or-greater** Overview-visible replacement
- Runtime roof tint / per-instance material cloning
- Global scale bump or camera zoom
- Phantom lot buildings or new authoritative facilities
- Full asset pack imports
- Passing on DC/tris/tests without pixel family shift

---

## 18. Stop condition

Post `[GOD-MODE:CURSOR-PLAN]` Plan revision **5** → **STOP**. No production code or asset import until ChatGPT posts `Decision: APPROVED_TO_BUILD`. Do not merge. Do not start M03.

---

## Appendix A — ChatGPT R5 requirement checklist

| # | Requirement | Section |
|---|---|---|
| 1 | Image-space composition study | §5 |
| 2 | Asset-vocabulary audit + proposed imports | §6 |
| 3 | Presentation-only variant rules | §7 |
| 4 | Nature mass restore/replace | §8 |
| 5 | Compositional hierarchy > ground tint | §9 |
| 6 | Warm palette / offline material path | §10 |
| 7 | Road subordination without topology change | §5.2 |
| 8 | Hero district silhouettes | §11 |
| 9 | Per-system render budget from 94k baseline | §12 |
| 10 | Fresh evidence pipeline | §15 |
| 11 | Objective visual stop tests | §14 |

## Appendix B — R4.1 lessons applied

| R4.1 mistake | R5 correction |
|---|---|
| Recovery removed Quaternius/periphery before equivalent mass | §8 restores framed forest + clusters with budget |
| Kenney 42-tris dots insufficient at Overview | Quaternius silhouette clusters for heroes/periphery |
| Faint ground-tint grids as primary hierarchy | Terrain bands + canopy mass (§9) |
| Green colormap monoculture unaddressed | Offline atlas variants + curated skins (§6, §10) |
| Stale `01_wf02_overview.png` | §15 deletes canonical stale file |
| Near-identical R3→R4.1 Overview | VST-08 stagnation falsification required |
