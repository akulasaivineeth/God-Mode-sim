# WF02 Plan Revision 12 — Architectural Form & Facade Depth Prototype

**State:** WAITING_FOR_CHATGPT_PLAN_APPROVAL  
**Supersedes:** Plan revision 11 implementation @ `7f968784a3dcaba4f13c6c3c27033f249443c787` (evidence head `4658dd2fec0ebafd9a8b21488f393788a1e218cc`) — WF02-R11-FINAL **FIX_REQUIRED**  
**Investigation base SHA:** `4658dd2fec0ebafd9a8b21488f393788a1e218cc`  
**Branch:** `cursor/wf02-scale-calibration-754a`  
**Scope:** PLAN ONLY — no asset import, production assembly rewrite, evidence capture, neighborhood rollout, merge, or M03 until `[GOD-MODE:CHATGPT-PLAN-DECISION] Decision: APPROVED_TO_BUILD`

---

## 1. Work item

WF02 — North-Star Scale & Aesthetic Calibration.

R11 proved that **true modularity alone is not art direction**. Engineering is green @ `4658dd2` (189 unit + 7 e2e PASS; Overview **89 DC / ~42k tris**; Street **62 DC / ~81k tris**; 0 asset/network errors), but Grok independently **BLOCKS** the visual hard gate: civic/commercial/residential pixels read as **larger flat tan wall grids**, not north-star miniature-town architecture.

R12 is **not** more module counts, taller walls, palette-only washes, vegetation scatter, camera changes, or neighborhood-wide rollout. R12 redesigns the **same three prototype roles** as **finished buildings in image space** — silhouette, roof mass, facade relief, storefront depth, civic identity, residential character.

---

## 2. Decision context

| Review | SHA | Gate | Lesson |
|---|---|---|---|
| WF02-R10-FINAL | `9c64b9c` | FIX_REQUIRED | Street portal + composition green; Kenney prefab vocabulary ceiling |
| **WF02-R11-FINAL** | **`4658dd2`** | **FIX_REQUIRED** | Modular vocabulary works mechanically; **finished architectural form layer missing** |
| ChatGPT FIX_REQUIRED | `4658dd2` | **Plan R12 required** | Root-cause = under-designed assemblies, not missing modularity |

**Preserved from R11 (must not regress):**

| Check | Result @ `4658dd2` |
|---|---|
| R9 semantic resolver / `WorldDefinition` | Implemented |
| R10 collision-safe Street portal | Implemented |
| Modular import/provenance/rollback machinery | 18 GLBs + warm atlas + audit JSON |
| Kenney roads + Quaternius nature | Supporting vocabulary |
| Simulation / worker determinism | Frozen |
| Performance headroom | Large slack vs gates |

**Visual failure (Grok + ChatGPT alignment on R11):**

| Symptom | R11 evidence |
|---|---|
| Civic reads as held/enclosed square | ❌ — flat 28 m tan wall loop |
| Commercial continuous frontage with depth | ❌ — coplanar 34 m stack; awnings on roof plane only |
| Residential distinct character | ❌ — two similar boxes; roof type only delta |
| Architectural depth at thumbnail | ❌ — silhouette = flat rectangle |
| Role recognition (civic / shop / home) | ❌ — ordinary viewer sees wall grids |
| Street citizen + door + road proof | ✅ — R10 portal preserved |
| Engineering / perf / determinism | ✅ — cannot override visual gate |

**Root cause:** R9 fixed spatial composition; R10 fixed camera/frontage composition; R11 fixed vocabulary flexibility. **None solved the final-building design layer.** R11 assemblies are procedural **coplanar wall loops** (`building-block` / `building-window` at `gz=0`) with roof caps — construction mechanics without authored architectural form.

---

## 3. Executive summary — R12 finished-building prototype (3 structures only)

R12 is **not** a neighborhood rewrite, not legacy 240 m restoration, not module-count inflation, not generic box filler, not a second layout authority.

### Build Path P-AFD (Architectural Form & Depth — mandatory)

| Phase | Name | Deliverable | Gate |
|---|---|---|---|
| **0** | Depth audit + conditional import prep | `r12_facade_depth_audit_plan.json` + bounded same-pack module list (≤12 new) | Audit PASS; import list approved |
| **1** | Authored assembly rewrite | Replace procedural loops with **finished-building specs** in existing 3 assembly files | Unit tests + bounds audit |
| **2** | Palette / material roles | Warm modular colormap zone roles (base / trim / roof / accent) — **not** global ground tint | Visual closeups |
| **3** | Evidence + STOP | R10 → R11 → R12 → north-star compare; silhouette thumbnails | Visual definition-of-done |

**Deferred without new plan:** Full hero neighborhood modular replacement; 240 m expansion; M03; merge.

**Preserved:** R9 resolver; R10 street portal; R11 modular machinery; simulation authority; Kenney roads/props + Quaternius nature.

---

## 4. R11 failure diagnosis (why modularity did not pass)

### 4.1 Current assembly patterns (image-space)

| Prototype | R11 pattern | Visual read |
|---|---|---|
| Civic | `28 × 8` single-plane wall at `gz=0`; sparse sill at `gz=1` | Long flat tan bar — not town hall / colonnade |
| Commercial | `34 × stories` coplanar stack; shallow `gz=1` fill; roof awning row | Strip mall wall — no storefront recess / bay rhythm |
| Residential | `6×5` filled boxes; slanted vs gable roof only | Two similar cottages — no porch / bay / dormer character |

### 4.2 Prohibited R12 responses (explicit)

| Prohibited | Reason |
|---|---|
| More wall modules / taller stacks | R11 already proved count ≠ form |
| Palette-only / ground tint | R4.1–R11 repeated failure mode |
| Vegetation / scatter dressing | Does not fix building architecture |
| Camera / portal changes | R10 portal is preserved proof, not root cause |
| Neighborhood-wide replacement | Out of scope until prototype PASS |
| Runtime generic boxes | Forbidden by constitution + prior plans |
| Import second modular family before Kenney same-pack expansion | Bounded escalation only |

---

## 5. Module audit — depth capability & missing forms

**Artifact:** [`r12_facade_depth_audit_plan.json`](r12_facade_depth_audit_plan.json) (`npm run audit:wf02-r12-facade-depth`)

### 5.1 R11 imported set (18 modules)

| Depth class | Count | Modules |
|---|---:|---|
| Coplanar (`depth ≈ 1.0 m`) | **11** | `building-block`, `building-corner`, windows, doors, most roofs |
| Shallow / moderate / strong projection | **7** | `building-window-sill`, `building-window-awnings`, `building-steps-wide`, `roof-flat-top`, `roof-flat-awning-a`, `roof-slanted`, `roof-gable-corner` |

**Key insight:** Individual GLB bounding boxes understate facade depth. Kenney depth is achieved by **multi-layer `gz` stacking** (porch at `gz=1`, recess at `gz=2`, roof mass above) and **authored module selection** — not by importing more coplanar blocks.

### 5.2 Depth-capable pieces already imported but under-used in R11

| Module | Facade depth | R11 usage gap |
|---|---:|---|
| `building-window-sill` | 1.05 m | Civic: occasional; not rhythm |
| `building-window-awnings` | 1.13 m | Commercial: upper row only — not ground storefront |
| `building-steps-wide` | 1.20 m | Civic: 2 cells only — no portico composition |
| `roof-flat-awning-a` | 1.11 m | Commercial: roof plane — not street-facing awning layer |

### 5.3 Missing forms for north-star reads (same Kenney pack — not yet imported)

| Missing form | Candidate module(s) | Measured depth | Prototype role |
|---|---|---:|---|
| Second-floor balcony rhythm | `building-window-balcony` | 1.15 m | Commercial upper bay; civic upper wall |
| Porch / stoop with side windows | `building-steps-narrow-windows`, `building-steps-narrow-windows-round` | 1.20 m | Residential house-1; commercial cafe bay |
| Dormer / roof window mass | `roof-slanted-window`, `roof-slanted-detail` | 1.14 m | Residential house-2 |
| Storefront display bay | `building-window-large-left/middle/right` | 1.0 m each — **compose 3-wide bay** | Commercial ground floor |
| Civic corner tower cap | `building-corner-window-top-round`, tower sample disassembly | — | Civic end mass |
| Roof parapet + mechanical silhouette | `roof-flat-detail-a/b`, `detail-ac-a/b` | roof + accent | Commercial roofline |
| Vertical civic window stack | `building-windows-high-middle`, `building-windows-high-top-round` | compose | Civic center bay |

**Reference disassembly only (do NOT import as runtime monoliths):**

| Sample | Footprint × height | Triangles | Use in R12 |
|---|---|---:|---|
| `building-sample-house-a` | 1.1 × 2.0 × 1.14 m | 312 | Authorship guide for house-1 porch + roof |
| `building-sample-house-b` | 1.1 × 2.2 × 1.98 m | 374 | Authorship guide for house-2 two-story mass |
| `building-sample-house-c` | 2.0 × 2.2 × 1.98 m | 322 | Wide cottage bay rhythm |
| `building-sample-tower-a` | 1.1 × 1.25 × 2.5 m | 398 | Civic corner tower cap pattern |

### 5.4 Conditional import proposal (Phase 0 — pending approval)

**Preferred path:** Expand curated import from **same Kenney Modular Buildings pack** by **≤12 modules** (total registered modular ≤30):

```
building-window-balcony
building-steps-narrow-windows
building-steps-narrow-windows-round
building-window-large-left
building-window-large-middle
building-window-large-right
building-windows-high-middle
building-corner-window-top-round
roof-flat-detail-a
roof-flat-detail-b
roof-slanted-window
roof-slanted-detail
```

Estimated incremental triangle budget for new modules: **~896 tris** (manifest only; instanced cost scales with placement count).

**Fallback (only if authored assemblies still fail visual DoD after same-pack expansion):**

| Option | Description | Reversibility |
|---|---|---|
| **F1 — Offline kitbash (preferred fallback)** | Merge ≤4 approved-source Kenney depth modules into **2 authored GLBs** (`porch-bay-warm.glb`, `storefront-bay-warm.glb`) with warm colormap; register as modular modules | Delete GLBs + manifest rows |
| **F2 — ONE external CC0 family** | Hold unless ChatGPT explicitly approves; no import in R12 plan | Full rollback flag |

No external family import in this plan revision.

---

## 6. Finished-building design specs (image-space authoritative)

Grid unit frozen from R11 audit: **1.0 m × 0.625 m story × 1.0 m depth**. All dimensions below are **presentation targets** at existing semantic anchors.

### 6.1 Prototype A — Civic enclosure edge (`civic-enclosure-edge`)

**Role read:** Town-hall / civic colonnade holding the square — not a prison wall.

| Attribute | Target |
|---|---|
| Footprint | **22 m wide × 3.5 m deep** (22 grid × 3 gz layers) — shorter than R11 28 m wall; depth replaces length |
| Height | **6.0 m** (10 stories) center; **5.0 m** (8 stories) wings |
| Roof profile | Flat parapet with **`roof-flat-detail-*`** rhythm; **corner tower cap** at south-east (disassembled from `building-sample-tower-a` pattern, modular cells only) |
| Facade depth layers | **gz=0** base wall; **gz=1** recessed colonnade (`building-block` set back); **gz=2** pilaster / sill projections |
| Entrance | Central **4 m portico**: `building-steps-wide` ×2 + `building-steps-narrow-windows-round` + `door-white` |
| Window rhythm | Every **3rd** bay: `building-window` + `building-window-sill`; upper: `building-windows-high-middle` / `building-window-balcony` |
| Corner treatment | `building-corner` + `building-corner-window-top-round` at tower |
| Material roles | Warm stone base (`#c4a882`), darker roof parapet (`#8b6914`), white trim accents on cornice |
| Origin / anchor | Keep `origin: { x: -14, y: 0, z: -3.5 }` — adjust placements, not world authority |

**Silhouette sketch (south facade, thumbnail-readable):**

```
        [==tower cap==]
    ___/‾‾‾‾‾‾‾‾‾‾‾‾‾‾\___
   |  ▢   ▢   ▢   ▢   ▢  |  ← balcony / high windows
   |  ▓   ▓   ▓   ▓   ▓  |  ← recessed colonnade (gz=1)
   |  ■ ■ ■ ■ ■ ■ ■ ■ ■  |  ← base wall
       ^portico/steps^
```

**Assembly diagram (layers, south-facing +Z):**

```
gz=2  sill / pilaster caps (sparse)
gz=1  recessed wall plane (set back 1 m)
gz=0  primary facade + corners + door modules
roof  flat detail + tower cap cells at east corner
```

### 6.2 Prototype B — Commercial frontage (`commercial-frontage-3bay`)

**Role read:** Continuous **3-bay shop street** — store / workshop / cafe — with readable storefront depth.

| Attribute | Target |
|---|---|
| Footprint | **34 m × 4.0 m** (34 × 4 gz) — unchanged width; **+1 gz depth layer** vs R11 |
| Height | Bay A (store): **7** stories (4.375 m); Bay B (workshop): **9** (5.625 m); Bay C (cafe): **6** (3.75 m) |
| Roof profile | Flat roof + **`roof-flat-detail-a/b`** alternating; **`detail-ac-*`** on workshop bay; **`roof-flat-awning-a`** at **street gz**, not roof gy |
| Facade depth layers | **gz=0** display floor (`window-large L/M/R` per 3 m bay); **gz=1** awning/shadow layer; **gz=2** upper wall set back |
| Storefront depth | Ground floor **recess 0.5 m** behind awning plane; visible door inset |
| Entrance / awning | Store @ gx=3, workshop @ gx=21 — preserve **`doorBindings`**; cafe @ gx=28 narrow door; **`building-window-awnings`** at gz=1 across bay |
| Window rhythm | Ground: 3-wide display per bay; upper: `building-window-balcony` every 4 gx on workshop bay |
| Corner treatment | `building-corner` at bay dividers gx=11, gx=23 |
| Material roles | Storefront cream (`#e8dcc8`), workshop brick accent (`#b85c38`), cafe awning stripe (warm red `#c45c3e` trim) |
| Replaces | `['store', 'workshop', 'cafe']` unchanged |

**Silhouette sketch:**

```
  ~awning~ ~awning~ ~awning~   ← gz=1 street projections
 |▓▓▓|  |▓▓▓▓▓|  |▓▓▓|       ← display windows (L/M/R)
 |▓▓▓|  |▓▓▓▓▓|  |▓▓▓|       ← upper floors step back (gz=2)
  ‾‾‾    ‾‾‾‾‾    ‾‾‾         ← roof details + AC
  store  workshop  cafe
```

**Door / sim preservation:**

| Label | R11 binding | R12 rule |
|---|---|---|
| `store-door` | localX=3.5, localZ=0.5 | Visible door module aligned; binding delta ≤0.3 m to sim entrance |
| `workshop-door` | localX=21.5, localZ=0.5 | Same |

### 6.3 Prototype C — Residential pair

#### C1 — `residential-house-1` (M02 home)

**Role read:** Cozy **1.5-story cottage** with porch — not a 5 m block.

| Attribute | Target |
|---|---|
| Footprint | **5 m × 4 m** (5 × 4 grid) — reduce R11 6×5 box |
| Height | **5.0 m** (8 stories) wall + **`roof-slanted`** + **`roof-slanted-window`** dormer |
| Roof profile | Slanted main roof; **one dormer** centered |
| Facade depth | **`building-steps-narrow-windows-round`** porch at front gz=1 spanning 3 gx; **`building-window-sill`** bay side |
| Entrance | `building-door-window` + `door-white`; **`home-door` binding** preserved |
| Window rhythm | Front: porch flanked windows; sides: every 2 gy |
| Material roles | Warm siding (`#d4b896`), white trim, darker roof |

**Silhouette:**

```
      /\_ dormer
     /  \___
    | ▢  ▢ |  ← porch + windows
    |__|__|__|
       porch
```

#### C2 — `residential-house-2`

**Role read:** Taller **2-story home** — clearly distinct from house-1 at Overview thumbnail.

| Attribute | Target |
|---|---|
| Footprint | **6 m × 5 m** |
| Height | **6.875 m** (11 stories) + **`roof-gable`** + **`roof-gable-end`** |
| Roof profile | Gable with **`roof-slanted-detail`** at center |
| Facade depth | **`building-window-balcony`** on front upper floor; **`building-steps-narrow-windows`** stoop (no round) |
| Entrance | Narrow door bay offset gx=1 (asymmetry vs house-1 center) |
| Window rhythm | Asymmetric — north-star residential character |
| Material roles | Slightly cooler siding (`#c8b8a0`) vs house-1 warm |

**Pair discrimination @ Overview thumbnail:** house-1 = **low + porch + slanted roof**; house-2 = **taller + gable + balcony**.

---

## 7. Implementation architecture (no third authority)

Reuse R11 modular stack exactly:

```
modularModuleRegistry / modularModuleManifest.json
modularLayout (resolveModularInstances)
modularPresentationBounds (resolveModularAssemblyAabb)
prototypes/*.ts (authored ModularAssemblySpec)
ModularAssemblyLayer → InstancedGltfPlacements
worldLabModularMode.ts (WORLD_LAB_MODULAR_PROTOTYPE rollback)
```

### 7.1 Required changes (post-approval only)

| File | Change |
|---|---|
| `civicEnclosureAssembly.ts` | Replace procedural loop with **authored placement table** per §6.1 |
| `commercialFrontageAssembly.ts` | Authored 3-bay spec per §6.2; move awnings to gz=1 |
| `residentialPairAssembly.ts` | Separate authored specs; delete shared `buildHouseFootprint` loop |
| `modularModuleManifest.json` | Add ≤12 approved modules if Phase 0 import approved |
| `modularPresentationBounds.ts` | Verify AABB includes gz=2 projections for Street portal |
| `presentationBounds.ts` integration | Extend modular bounds into R10 portal collision path (already wired — re-audit) |
| `ASSET_REGISTER.md` | Rows for new modules only after import approval |

### 7.2 Explicit do-not-touch

| Path | Reason |
|---|---|
| `src/simulation/**` | Simulation authority |
| `src/world/facilityPoints.ts` | Frozen sim centers |
| `src/world/worldResolver.ts` / entrances | Authoritative door semantics |
| Overview / Angled / Street portal camera constants | Frozen framing |
| Kenney roads / Quaternius nature | Supporting vocabulary |
| `OverviewCompositionLayer` district scatter | Out of R12 scope |
| Legacy 240 m skeleton | Do not resurrect |
| M03 / merge | Hold |

### 7.3 Presentation bounds rule (R10 portal safety)

Any facade projection at `gz ≥ 1` **must** flow into `resolveModularAssemblyAabb()`. Street portal collision uses presentation AABB — **never** hand-tuned camera offsets to hide clipping.

Door modules are **visual only**; `doorBindings` remain aligned to resolved sim entrances (≤0.3 m delta, tested).

---

## 8. Rollback path to R11

| Step | Action |
|---|---|
| 1 | Revert assembly spec files to @ `4658dd2` |
| 2 | Remove Phase 0 imported modules if any |
| 3 | `WORLD_LAB_MODULAR_PROTOTYPE = false` restores R10 Kenney prefabs |
| 4 | Re-run `capture:wf02-r11-prototype` for pixel parity |

---

## 9. Performance budget

Measure after Phase 1 on live GL. **Hard gates unchanged:**

| Gate | Target | Hard cap |
|---|---:|---:|
| Overview DC | ≤**120** | ≤**140** |
| Overview tris | ≤**80k** | ≤**150k** |
| Street DC | ≤**85** | ≤**100** |

R11 @ ~89 DC / ~42k tris leaves headroom for **authored depth layers** (~2–3× module instances vs flat R11 walls, still instanced). If over budget, **prune decorative roof AC / dormer count** before shrinking footprints or removing storefront bays.

---

## 10. Tests and evidence plan

### 10.1 Automated (post-implementation)

```bash
npm run audit:wf02-r12-facade-depth          # plan artifact (this revision)
npm run test:all                               # must remain green
npm run import:wf02-r12-modular                # only after APPROVED_TO_BUILD
npm run capture:wf02-r12-prototype             # evidence @ approved SHA
```

| Suite | Coverage |
|---|---|
| `modularAssembly.test.ts` | Authored placement snap; door binding delta ≤0.3 m |
| `modularPresentationBounds.test.ts` | gz=2 projections enclosed; Street portal clearance |
| `streetPortalCamera.test.ts` | Unchanged algorithm + modular bounds |
| `worldResolver.test.ts` | Entrances unchanged vs R11 |
| `determinism.test.ts` | Unchanged |

### 10.2 Evidence compare chain (frozen views)

| Panel | Source |
|---|---|
| **R10 BEFORE** | `Docs/milestones/WF02/01_r10_overview_dawn.png` @ `9c64b9c` |
| **R11 AFTER (blocked)** | `compare_r10_r11_northstar.png` @ `4658dd2` |
| **R12 AFTER (prototype)** | `review-evidence-wf02-r12-<sha>` |
| **NORTH STAR** | `Docs/art-direction/references/god-mode-town-north-star.png` |

**Required shots @ R12 SHA:**

| # | Shot |
|---|---|
| 1 | Compare strip: **R10 → R11 → R12 → north-star** (same camera) |
| 2 | Overview dawn + noon |
| 3 | Angled |
| 4 | **Civic closeup** — colonnade depth + tower cap |
| 5 | **Commercial closeup** — storefront bay + awning depth |
| 6 | **Residential closeup** — pair discrimination |
| 7 | **Silhouette thumbnails** (128 px crop) — role recognition |
| 8 | Street citizen + doorway + road/sidewalk |
| 9 | Store / workshop / home door scale |
| 10 | Night |
| 11 | Diagnostics manifest |
| 12 | **0** asset/network errors |

### 10.3 Visual definition of done (authoritative — not DC/tris alone)

| Criterion | Required |
|---|---|
| **Role recognition at thumbnail** — civic / commercial / residential | **Yes** |
| **Architectural depth at glance** — not flat tan wall | **Yes** |
| Facade relief visible in **isolated closeups** | **Yes** |
| R11 → R12 material delta — not confusable with R11 wall grids | **Yes** |
| R10 Street portal + citizen-door-road proportion | **Yes** — preserved |
| Sim entrances unchanged | **Yes** — tests prove |
| Module-count completion | **No** — not a pass criterion |
| Neighborhood rollout | **No** — prohibited |

**STOP if visual gate fails:** Post evidence + gap analysis; escalate to kitbash fallback (§5.4 F1) or ChatGPT-approved external CC0 — **do not** silently expand scope.

---

## 11. Phase gates and STOP points

| Gate | Entry | Exit | STOP if fail |
|---|---|---|---|
| **Plan R12** | This document | `[GOD-MODE:CHATGPT-PLAN-DECISION] APPROVED_TO_BUILD` | **No import / assembly rewrite** |
| **Phase 0** | Plan approved | Conditional import + audit refresh | No Phase 1 |
| **Phase 1** | Phase 0 PASS | Authored 3 assemblies | No evidence |
| **Phase 2** | Phase 1 PASS | Palette roles + bounds audit | No handoff |
| **Phase 3** | Phase 2 PASS | Visual DoD + compare strip + tests | No expansion / merge / M03 |
| **Neighborhood rollout** | R12 visual PASS | Separate plan revision | **Prohibited** in R12 |

---

## 12. File touch map (implementation — post-approval)

| Action | Paths |
|---|---|
| **Create** | `scripts/wf02-r12-modular-import.mjs`, `scripts/wf02-r12-prototype-capture.mjs`, `Docs/milestones/WF02/r12_prototype_manifest.json` |
| **Modify** | `src/rendering/modular/prototypes/*.ts`, `modularModuleManifest.json`, `tests/unit/wf02/modularAssembly.test.ts`, `Docs/assets/ASSET_REGISTER.md`, `package.json` scripts |
| **Preserve** | All paths in §7.2 |
| **Evidence** | `Docs/milestones/WF02/compare_r10_r11_r12_northstar.png`, closeups, silhouette crops |

---

## 13. Requirement IDs protected

| ID | R12 contribution |
|---|---|
| WF02-VISUAL-HARD-GATE | Finished-building form layer |
| WF02-SCALE-001 | Frozen grid + citizen/door/road proportions |
| WF02-PRESERVE-SIM | No simulation edits |
| WF02-PRESERVE-M02 | Door bindings + entrance tests |
| WF02-RENDER-BUDGET | Instanced assemblies; measured gates |
| WF02-DETERMINISM | Seeded presentation only |

---

**STOP.** Awaiting `[GOD-MODE:CHATGPT-PLAN-DECISION] Decision: APPROVED_TO_BUILD` before any R12 implementation, import, or evidence capture. Do not merge. Do not start M03.
