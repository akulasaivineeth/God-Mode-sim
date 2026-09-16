# WF02 Plan Revision 11 — Modular Architectural Vocabulary Prototype

**State:** WAITING_FOR_CHATGPT_PLAN_APPROVAL  
**Supersedes:** Plan revision 10 implementation @ `9c64b9c3cf82684df088d6bc341401fcebc5929a` (WF02-R10-FINAL **FIX_REQUIRED**)  
**Investigation base SHA:** `9c64b9c3cf82684df088d6bc341401fcebc5929a`  
**Pixel evidence SHA:** `Docs/milestones/WF02/r10_neighborhood_manifest.json` @ `8923425731b2add29daff5637e0e567d618d57af`  
**Branch:** `cursor/wf02-scale-calibration-754a`  
**Scope:** PLAN ONLY — no asset download/import, production code, evidence capture, merge, or M03 until `[GOD-MODE:CHATGPT-PLAN-DECISION] Decision: APPROVED_TO_BUILD`

---

## 1. Work item

WF02 — North-Star Scale & Aesthetic Calibration.

R10 Phase C has **failed the visual hard gate** despite engineering green and valid Street portal proof. ChatGPT decision **FIX_REQUIRED** @ `9c64b9c` triggers the R10 audit's Phase-D condition: registered Kenney prefab vocabulary cannot produce north-star **vertical layering**, **civic enclosure silhouette**, or **continuous commercial frontage** at Overview.

R11 is **not** another Kenney scatter/staging pass. R11 imports **at most one** CC0 modular architectural family and prototypes **exactly three structures** in the existing hero neighborhood before any wider rollout.

---

## 2. Decision context

| Review | SHA | Gate | Lesson |
|---|---|---|---|
| WF02-003 (R4.1) | `6dbd8b5` | BLOCKED | Decoration on 240 m skeleton insufficient |
| WF02-R9 | `f0d7207` | BLOCKED | Spatial reset correct; vocabulary insufficient |
| **WF02-R10-FINAL** | **`9c64b9c`** | **FIX_REQUIRED** | Phase C Kenney assembly + Street portal green; **Overview pixels stagnant** — vertical layering FAIL |
| ChatGPT FIX_REQUIRED | `9c64b9c` | **Plan R11 required** | Root-cause = asset-family change; Kenney-only passes **prohibited** |

**Preserved from R10 (must not regress):**

| Check | Result @ `9c64b9c` |
|---|---|
| Unit + integration + e2e + build | **182 unit + 7 e2e PASS** |
| Asset/network errors | **0** |
| `WorldDefinition` / `worldResolver` / `WORLD_LAB_MODE` | Implemented |
| Hero neighborhood ~70×58 m semantic layout | Frozen |
| Street portal camera + M02 door scale proof | **Grok confirms wall-jam fixed** |
| Overview live GL | **95–98 DC / ~28.5k tris** (large headroom) |
| Simulation / worker determinism | Frozen |

**Visual failure (ChatGPT + expected Grok alignment on R10):**

| Symptom | R10 evidence |
|---|---|
| R9 → R10 Overview family shift | ❌ — compare strip shows composition delta but **not north-star family entry** |
| Civic enclosed/held square | ❌ — props/fences insufficient; no layered town-wall read |
| Commercial continuous frontage | ❌ — three disconnected Kenney boxes persist under scatter |
| Residential distinct silhouettes | ❌ — similar single-story cottages |
| Vertical layering | ❌ — R10 audit predicted FAIL; confirmed at pixels |
| Street citizen + door + road proof | ✅ — portal presets readable |

**Root cause:** Registered Kenney City Kit prefabs are **monolithic single-story colormap meshes**. R10 Phase C maximized credible assembly from fences, paths, tint, offsets, and instanced props — hitting the **image-space ceiling** documented in `r10_vocabulary_audit.json`. More of the same is prohibited.

---

## 3. Executive summary — R11 modular prototype (3 structures only)

R11 is **not** a neighborhood rewrite, not legacy 240 m restoration, not Kenney quota/scatter tuning, not generic box filler.

### Build Path P-MAV (Modular Architectural Vocabulary — mandatory)

| Phase | Name | Deliverable | Gate |
|---|---|---|---|
| **0** | Candidate audit + import prep | Download-free plan audit (this doc) + build-time `wf02-r11-candidate-audit.mjs` tri/manifest pass on chosen family | One-family selection + ASSET_REGISTER rows drafted |
| **1** | Module abstraction | `ModularModuleManifest`, `ModularAssemblySpec`, attachment/door anchor resolver | Unit tests |
| **2** | Three-structure prototype | Civic enclosure edge, 3-bay commercial frontage, differentiated residential pair — **visual only** | Engine-pixel compare strip |
| **3** | Evidence + STOP | R10 BEFORE → R11 AFTER → north-star; tests; live GL | Visual definition-of-done |

**Deferred without new plan:** Full hero neighborhood modular replacement; 240 m expansion; M03; merge.

**Preserved:** R9 WorldDefinition/resolver; R10 street portal; simulation authority; Kenney roads/props + Quaternius nature as supporting vocabulary.

---

## 4. Independent candidate audit (Phase 0 — plan deliverable)

R10 artifact named two candidates. This plan audits them **independently** — neither assumed suitable because R10 named it.

### 4.1 Candidate A — KayKit City Builder Bits

| Field | Verified finding |
|---|---|
| **Exact name** | KayKit : City Builder Bits v1.0 |
| **Author / provenance** | Kay Lousberg — https://kaylousberg.itch.io/city-builder-bits |
| **GitHub mirror** | https://github.com/KayKit-Game-Assets/KayKit-City-Builder-Bits-1.0 (LICENSE.txt = CC0 1.0) |
| **License** | **CC0 1.0 Universal** — commercial OK, no attribution required |
| **Download** | Free 4.6 MB ZIP on itch.io; formats **OBJ, FBX, GLTF** (not pre-converted GLB in repo) |
| **Texture** | Single **1024×1024 gradient atlas** — different art direction from Kenney warm north-star palette |
| **Model count** | **32+** in free tier (Unity store edition lists 70+ with roads/vehicles — separate paid Unity pack) |
| **Modularity class** | **Pre-assembled buildings** — `building_A.gltf` … `building_H.gltf` (+ `_withoutBase` variants), roads, cars, props |
| **Wall/floor/roof/door modules** | **None found** in public file tree — no `wall_*`, `floor_*`, `roof_*`, `door_*` pieces |
| **Vertical layering** | Fixed per prefab; cannot stack bays or raise second story from shared modules |
| **Commercial frontage continuity** | Would still be **disconnected building GLTFs** — same failure class as Kenney City Kits |
| **Palette compatibility** | Low — gradient atlas vs Kenney warm colormap family |
| **Runtime fit (M2/8GB)** | Low–medium per prefab; entire pack small; **not the bottleneck** |
| **R11 verdict** | **REJECT** for prototype scope — fails "asset-first modular kit that can construct real facades/buildings" |

### 4.2 Candidate B — Kenney Modular Buildings 2.1

| Field | Verified finding |
|---|---|
| **Exact name** | Kenney **Modular Buildings** v2.1 (R10 artifact said "Modular Town" — **incorrect name**; no such Kenney pack found) |
| **Author / provenance** | Kenney — https://kenney.nl/assets/modular-buildings |
| **Alternate mirrors** | https://kenney-assets.itch.io/modular-buildings , OpenGameArt CC0 |
| **License** | **CC0 1.0 Universal** |
| **Download** | `kenney_modular-buildings.zip` **1.7 MB** — OBJ, FBX, **glTF/GLB** |
| **Model count** | **100+** modular pieces (public catalogues list ~108 assets) |
| **Modularity class** | **True construction kit** — separate walls, floors, roofs, doors, windows, corners, borders |
| **Representative modules** (public catalogue) | `Wall`, `Wall Doorway`, `Wall Window`, `Wall Window Wide`, `Floor`, `Floor Corner`, `Roof Slanted`, `Roof Gable`, `Roof Flat Top`, `Roof Flat Border Straight`, `Window White/Brown` variants, etc. |
| **Material/texture** | Shared **colormap.png** + **colormap-variation.png** — compatible with existing Kenney warm-atlas repack pipeline (`npm run repack:wf02-atlas`) |
| **Vertical layering** | **Yes** — stack floor + wall rings + roof modules to 1.5–3 stories |
| **Commercial frontage continuity** | **Yes** — align wall bays on shared grid for 2–3 shopfront run |
| **Civic enclosure** | **Yes** — low wall/colonnade rings + gable/roof caps around square edge |
| **Door/window scale** | Module-native openings; build-time audit must confirm **~2.0–2.4 m door height** after normalization to 2.32 m citizen |
| **Runtime fit (M2/8GB)** | Low poly per piece; 3 prototypes via **instancing** → estimated **+8–15k tris**, **+5–12 Overview DC** (within R10 headroom) |
| **R11 verdict** | **SELECT** — only candidate that satisfies modular facade construction requirement |

### 4.3 Final one-family choice

**Selected family: Kenney Modular Buildings 2.1**

| Criterion | KayKit City Builder Bits | Kenney Modular Buildings |
|---|---|---|
| CC0 license | ✅ | ✅ |
| True wall/roof/floor/door modules | ❌ | ✅ |
| Continuous multi-bay frontage | ❌ | ✅ |
| Vertical layering (1.5–2+ stories) | ❌ (fixed prefabs) | ✅ |
| Palette fit to north-star / existing Kenney | ❌ | ✅ |
| Existing pipeline compatibility (GLB, colormap repack) | ❌ (GLTF + gradient atlas) | ✅ |
| **Decision** | **Reject** | **Select** |

**Explicit rejection rationale for KayKit:** Pre-built `building_A–H` GLTFs repeat the monolithic-prefab failure class. Importing KayKit would add a **second disconnected art family** without solving facade continuity or vertical layering.

---

## 5. Proposed import scope (Phase 0 build — not authorized in this plan turn)

### 5.1 Import budget (3-prototype subset only)

| Limit | Value |
|---|---|
| New GLB files in repo | **≤24 modules** (curated subset, not full 100+) |
| New texture files | **≤2** (`colormap.png`, `colormap-variation.png` repacked warm) |
| ASSET_REGISTER rows | One family section + per-module rows |
| Hero neighborhood triangle add | **≤+15k** for 3 prototypes (measure after Phase 2) |
| Overview DC add | **≤+12** (instancing mandatory) |

### 5.2 Curated module shortlist (draft — confirmed at build-time tri audit)

**Walls & structure**

| Module (Kenney name) | Role in prototypes |
|---|---|
| `wall` / `wall-low` / `wall-high` | Bay segments |
| `wall-doorway` | M02 store/work door anchors |
| `wall-window` / `wall-window-wide` | Shopfront + residential rhythm |
| `wall-corner` / `wall-corner-small` | Enclosure corners |
| `floor` / `floor-corner` / `floor-half` | Story plates |

**Roofs**

| Module | Role |
|---|---|
| `roof-slanted` / `roof-gable` | Residential silhouette variation |
| `roof-flat-top` / `roof-flat-border-straight` | Commercial awning-cap line |
| `roof-slanted-corner-*` | Civic enclosure caps |

**Openings**

| Module | Role |
|---|---|
| `door` (if separate) or doorway wall | Visual door mesh aligned to sim entrance |
| `window-white` / `window-brown` variants | Facade rhythm |

**Excluded from import:** Stairs, high-rise-only modules, duplicate corner variants, any module not used in 3 prototypes.

### 5.3 Normalization strategy

| Parameter | Value |
|---|---|
| Module grid unit | **1.0 m** (Kenney modular default — verify in build audit) |
| Story height | **3.0 m** floor-to-floor (tune ±0.2 m to match 2.32 m citizen / ~2.1 m door) |
| Door opening target | **1.0 m wide × 2.1 m tall** visual (sim entrance unchanged) |
| Colormap | Warm repack via existing `scripts/wf02-r51-repack-atlas.mjs` pattern → `public/assets/glb/kenney/modular/Textures/colormap_warm_modular.png` |
| Placement | Grid-snapped `ModularAssemblySpec` — **no ad-hoc magic coordinates** in render code |

### 5.4 Estimated cost (pre-measurement — must verify at build)

| Prototype | Module instances (est.) | Triangles (est.) | Draw calls (est.) |
|---|---:|---:|---:|
| Civic enclosure edge | 18–24 | 3–5k | 2–4 (instanced) |
| Commercial 3-bay frontage | 24–36 | 4–7k | 3–5 (instanced) |
| Residential pair (2 assemblies) | 20–28 each | 3–5k each | 2–4 each |
| **Total add** | **~80–110** | **~12–15k** | **~8–12** |

Post-R10 baseline Overview **~98 DC / ~29k tris** → projected **~110 DC / ~44k tris** — well inside ≤140 / <150k gates.

---

## 6. Three prototype structures (exact footprints)

Semantic facility positions **unchanged** in `heroNeighborhood.ts`. Prototypes are **presentation replacements** adjacent to or wrapping existing semantic anchors.

### 6.1 Prototype 1 — Civic anchor / enclosure edge

**Purpose:** South edge of civic square reads as a **held/enclosed** civic frame — layered wall + roof silhouette, not scatter props.

| Field | Value |
|---|---|
| **Semantic anchors** | `community-hall` (−14, −18), `clinic` (+14, −18), square center (0, −10) |
| **Assembly origin** | Square south edge: centered **x=0**, **z=−3.5** (facing north into square) |
| **Footprint** | **28 m wide × 3.5 m deep** enclosure colonnade (low wall + roof cap) |
| **Height** | **4.5 m** (1.5-story civic wall rhythm) |
| **Facade** | North-facing — readable from Overview/Angled |
| **Kenney hall/clinic** | **Retained behind/aside** OR visually subsumed into modular civic mass — sim IDs unchanged |
| **Door dimensions** | Decorative civic openings only (non-M02) — **no sim entrance move** |

### 6.2 Prototype 2 — Continuous 2–3 bay commercial frontage

**Purpose:** Store + cafe + workshop row reads as **one inhabited street wall** with varied bay heights and shopfront windows.

| Field | Value |
|---|---|
| **Semantic anchors** | `store` (−14, 14), `workshop` (4, 14), `cafe` (16, 14) |
| **Assembly origin** | Frontage line **z=12.5** (south of commercial road at z=8), **x=−16..+18** |
| **Footprint** | **34 m × 7 m** continuous facade plane |
| **Height** | **5.5 m** center bay (workshop), **4.5 m** flanking bays — deliberate height steps |
| **Bays** | 3 bays: **store** (west), **workshop** (center), **cafe** (east) |
| **Door anchors** | Visual doors aligned to **existing sim entrances**: store **(−14, 10.8)**, work **(4, 10.8)** |
| **Door size** | **1.0 × 2.1 m** visual openings; cafe decorative door only |
| **Kenney prefabs** | **Hidden/suppressed** in prototype zone — modular facade is presentation authority for this strip only |

### 6.3 Prototype 3 — Distinct residential silhouettes (1.5–2 story)

**Purpose:** `house-1` and `house-2` read as **different** home silhouettes with garden depth — not two similar cottages.

| Field | house-1 (M02 home) | house-2 |
|---|---|---|
| **Semantic anchor** | (16, −4) — M02 **home** | (−16, −4) |
| **Assembly origin** | Lot center + presentation offset | Lot center + presentation offset |
| **Footprint** | **6 m × 7 m** | **6 m × 7 m** |
| **Height** | **5.0 m** (1.5-story — slanted roof peak) | **7.0 m** (2-story — gable + chimney module) |
| **Roof** | `roof-slanted` family | `roof-gable` + vertical wall stack |
| **Door anchor** | Visual door → sim **home entrance (16, −6.4)** | Decorative — no M02 sim binding |
| **Garden** | Retain R10 `ResidentialGardens` props **outside** modular footprint | Same |

---

## 7. Module / anchor / bounds abstraction

### 7.1 Core types (new — presentation only)

```typescript
// src/rendering/modular/ModularModuleManifest.ts
interface ModularModuleDef {
  moduleId: string;
  assetUrl: string;
  localBounds: [min, max];      // from modelLayoutManifest after import
  gridWidth: number;            // meters, usually 1.0
  gridDepth: number;
  attachmentSockets: { id, localX, localY, localZ }[];
  doorSocket?: { width, height, localX, localY, localZ };
}

// src/rendering/modular/ModularAssemblySpec.ts
interface ModularModulePlacement {
  moduleId: string;
  gridX: number;
  gridY: number;               // story index
  gridZ: number;
  rotY: 0 | 90 | 180 | 270;
}

interface ModularAssemblySpec {
  assemblyId: string;
  origin: { x, y, z };
  rotY: number;
  placements: ModularModulePlacement[];
  doorBindings?: { label, worldOffsetFromOrigin }[];
}
```

### 7.2 Rendering path

| Component | Responsibility |
|---|---|
| `ModularAssemblyLayer.tsx` | Renders one `ModularAssemblySpec` via `InstancedGltfPlacements` grouped by `moduleId` |
| `ModularDoorAnchor.tsx` | Optional visual door frame mesh snapped to `doorSocket` |
| `modularPresentationBounds.ts` | `resolveModularAssemblyAabb(spec)` — extends R10 `presentationBounds` for portal cameras |
| `WorldLabModularLayer.tsx` | Orchestrates 3 prototype specs only |

### 7.3 Attachment / entrance anchor strategy (sim authority preserved)

| Rule | Implementation |
|---|---|
| Simulation entrances | **Frozen** in `heroNeighborhood.ts` / `worldResolver` — `HOME_ENTRANCE`, `STORE_ENTRANCE`, `WORK_ENTRANCE` unchanged |
| Visual door placement | `doorBindings` in assembly spec offset from assembly origin to **minimize delta** to sim entrance (target ≤0.3 m) |
| Street portal camera | Extend `streetPortalCamera.ts` to prefer `resolveModularAssemblyAabb` when modular prototype active for store/work/home |
| Pathfinding / worker | Reads **sim entrance** only — never modular mesh bounds |
| Presentation bounds | Modular AABB drives **camera/framing only** |

**Invariant:** `getFacilityPoint('home'|'store'|'work').entrance` SHA-stable vs R10 handoff.

---

## 8. File-by-file change map (implementation @ approval)

### 8.1 New files

| File | Purpose |
|---|---|
| `scripts/wf02-r11-candidate-audit.mjs` | Post-download tri/bounds audit → `r11_modular_audit.json` |
| `scripts/wf02-r11-modular-import.mjs` | Curated GLB copy + manifest generation (build Phase 0) |
| `scripts/wf02-r11-prototype-capture.mjs` | R11 evidence (R10 BEFORE frozen + R11 AFTER) |
| `public/assets/glb/kenney/modular/**` | **≤24 curated GLBs** + warm colormap |
| `src/rendering/modular/ModularModuleManifest.ts` | Module defs + socket metadata |
| `src/rendering/modular/ModularAssemblySpec.ts` | 3 prototype specs (declarative) |
| `src/rendering/modular/modularPresentationBounds.ts` | Assembly AABB for cameras |
| `src/rendering/modular/ModularAssemblyLayer.tsx` | Instanced renderer |
| `src/rendering/environment/worldLab/WorldLabModularLayer.tsx` | Prototype orchestrator |
| `src/rendering/modular/prototypes/civicEnclosureAssembly.ts` | Prototype 1 spec |
| `src/rendering/modular/prototypes/commercialFrontageAssembly.ts` | Prototype 2 spec |
| `src/rendering/modular/prototypes/residentialPairAssembly.ts` | Prototype 3 spec |
| `tests/unit/wf02/modularAssembly.test.ts` | Grid placement, door binding, bounds |
| `tests/unit/wf02/modularPresentationBounds.test.ts` | AABB + portal compatibility |
| `Docs/milestones/WF02/r11_modular_audit.json` | Build-time measured audit |

### 8.2 Modified files

| File | Change |
|---|---|
| `WorldLabCompositionLayer.tsx` | Add `WorldLabModularLayer`; suppress Kenney prefab draw in prototype zones |
| `buildingPrefabConfig.ts` | `presentationSuppressed` flag for structures replaced by modular prototypes |
| `presentationBounds.ts` | Delegate to modular bounds when active |
| `streetPortalCamera.ts` | Prefer modular assembly AABB for M02 facilities |
| `Docs/assets/ASSET_REGISTER.md` | Kenney Modular Buildings family rows |
| `package.json` | `audit:wf02-r11-modular`, `capture:wf02-r11-prototype` scripts |
| Milestone docs | R11 handoff sections |

### 8.3 Do-not-touch

| Area | Rule |
|---|---|
| `src/simulation/**` | **No changes** |
| Worker protocol / determinism / action semantics | **No changes** |
| `heroNeighborhood.ts` semantic positions / nav graph / entrances | **No relocation** |
| `WorldDefinition` / `worldResolver` architecture | **Preserve** |
| R10 street portal algorithm | **Preserve** (extend bounds source only) |
| Legacy 240 m skeleton | **Do not resurrect as design authority** |
| Kenney roads, Quaternius nature, citizen rig | **Supporting vocabulary only** |
| M03 / merge | **Hold** |
| Generic box/primitive buildings | **Forbidden** |
| Second modular family / KayKit import | **Forbidden** |
| Full neighborhood modular replacement before prototype PASS | **Forbidden** |

---

## 9. Rollback path to R10

| Step | Action |
|---|---|
| 1 | Set `WORLD_LAB_MODULAR_PROTOTYPE = false` in new `src/world/worldLabModularMode.ts` flag (default **true** only after R11 approval) |
| 2 | Remove `WorldLabModularLayer` from composition orchestrator |
| 3 | Clear `presentationSuppressed` flags on Kenney prefabs |
| 4 | Delete `public/assets/glb/kenney/modular/**` and ASSET_REGISTER rows |
| 5 | Revert modular source files (listed §8.1) |
| 6 | Re-run R10 capture manifest to confirm pixel parity |

Rollback must leave R10 @ `9c64b9c` behavior **bit-for-bit** on sim/tests when flag false.

---

## 10. Performance budget

Measure after Phase 2 on live GL. **Hard gates unchanged:**

| Gate | Target | Hard cap |
|---|---:|---:|
| Overview DC | ≤**120** | ≤**140** |
| Overview tris | ≤**80k** | ≤**150k** |
| Street DC | ≤**85** | ≤**100** |

R10 @ ~98 DC / ~29k tris leaves ample headroom for 3 prototypes. **Instancing mandatory** — no per-module `ModelAsset` draw spam.

If measured cost exceeds plan estimate, **prune module variants** before reducing prototype footprint — do not shrink commercial frontage or civic enclosure first.

---

## 11. Tests and evidence plan

### 11.1 Automated

```bash
npm run test:all                              # must remain green
npm run audit:wf02-r11-modular                # post-import tri/bounds JSON
npm run capture:wf02-r11-prototype            # evidence @ approved SHA
```

| Suite | Coverage |
|---|---|
| `modularAssembly.test.ts` | Grid snap, rotation, door binding delta ≤0.3 m to sim entrance |
| `modularPresentationBounds.test.ts` | Assembly AABB encloses door socket |
| `streetPortalCamera.test.ts` | Unchanged + modular bounds path |
| `worldResolver.test.ts` | Entrances unchanged vs R10 |
| `determinism.test.ts` | Unchanged |

### 11.2 Evidence compare chain (frozen views)

| Panel | Source |
|---|---|
| **BEFORE (R10 FIX_REQUIRED)** | `Docs/milestones/WF02/01_r10_overview_dawn.png` @ `9c64b9c` |
| **AFTER (R11 prototype)** | `review-evidence-wf02-r11-<sha>` |
| **NORTH STAR** | `Docs/art-direction/references/god-mode-town-north-star.png` |

**Required shots @ R11 SHA:**

Overview dawn + noon, Angled, **civic enclosure closeup**, **commercial frontage closeup**, **residential pair closeup**, Street citizen + doorway, home/store/workshop door scale (R10 portal preserved), night, compare strip, diagnostics manifest, **0** asset/network errors.

### 11.3 Visual definition of done (authoritative — not DC/tris alone)

| Criterion | Required |
|---|---|
| Obvious **vertical layering** at Overview first glance | **Yes** |
| Civic reads as **enclosed/held** square edge | **Yes** |
| Commercial reads as **continuous 2–3 bay street wall** | **Yes** |
| Residential pair **distinct silhouettes** (1.5 vs 2 story) | **Yes** |
| Warm miniature-town coherence vs R10 | **Yes** — ordinary viewer sees family shift toward north-star |
| R10 → R11 material delta | **Yes** — not confusable with R10 blocked pixels |
| Street citizen + door + road/sidewalk | **Yes** — R10 portal preserved |
| Sim entrances unchanged | **Yes** — tests prove |
| Kenney-only retry | **No** — prohibited |

**STOP if visual gate fails after 3 prototypes:** Post evidence + precise gap analysis; **do not** import second family or replace whole neighborhood without new plan revision.

---

## 12. Phase gates and STOP points

| Gate | Entry | Exit | STOP if fail |
|---|---|---|---|
| **Plan R11** | This document | `[GOD-MODE:CHATGPT-PLAN-DECISION] APPROVED_TO_BUILD` | **No download/import/code** |
| **Phase 0** | Plan approved | Curated import + `r11_modular_audit.json` | No Phase 1 |
| **Phase 1** | Phase 0 PASS | Module abstraction + unit tests | No Phase 2 |
| **Phase 2** | Phase 1 PASS | 3 prototypes in engine | No evidence handoff |
| **Phase 3** | Phase 2 PASS | Visual DoD + compare strip + tests | No expansion / merge / M03 |
| **Neighborhood rollout** | R11 visual PASS | Separate plan revision | **Prohibited** in R11 scope |

---

## 13. Requirement IDs protected

| ID | R11 response |
|---|---|
| WORLD-001 | Preserve R9 WorldDefinition — modular layer presentation-only |
| VIS-002 | Preserve R10 street portal; extend bounds source |
| M02-020 | Visual doors align to frozen sim entrances |
| ADR-006 | Simulation reads semantic IDs via resolver — unchanged |
| WF02-NORTH-STAR | **Visual DoD §11.3** — modular prototype gate |
| DET-001 | Declarative assembly specs; no `Math.random` |
| ARCH-002 | Presentation-only modular vocabulary |
| ASSET-001 | CC0 Kenney Modular Buildings; ASSET_REGISTER before import |

---

**STOP.** Awaiting `[GOD-MODE:CHATGPT-PLAN-DECISION]` on Plan revision **11**. No asset download/import, implementation, merge, or M03 until approval.
