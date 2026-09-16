# WF02 Plan Revision 13 — Finished Architecture Source Strategy

**State:** WAITING_FOR_CHATGPT_PLAN_APPROVAL  
**Supersedes:** Plan revision 12 implementation @ `b4cf52c18427cbec2a4f8ebe567d3f2786efd57f` (evidence head `ab4a8d2a68be55af47d4a042a9d3a63a03d0702b`) — WF02-R12 **FIX_REQUIRED**  
**Investigation base SHA:** `ab4a8d2a68be55af47d4a042a9d3a63a03d0702b`  
**Branch:** `cursor/wf02-scale-calibration-754a`  
**Scope:** PLAN ONLY — no shell import, offline kitbash, production code, evidence capture, neighborhood rollout, merge, or M03 until `[GOD-MODE:CHATGPT-PLAN-DECISION] Decision: APPROVED_TO_BUILD`

---

## 1. Work item

WF02 — North-Star Scale & Aesthetic Calibration.

R12 added same-pack depth modules and authored gz-layer placements on top of the R11 modular assembly method. Engineering is green @ `ab4a8d2` (191 unit + 7 e2e PASS; Overview **97–100 DC / ~48k tris**; Street **69 DC / ~87k tris**; 0 asset/network errors), but authoritative Grok review **BLOCKS** the visual hard gate: prototypes remain **too visually close to R11** — civic especially still reads as a **flat tan modular wall assembly**; finished-building image-space DoD not met.

R13 is a **root-cause strategy change**, not another module-count, wall-height, palette, scatter, camera, or facade-offset patch.

---

## 2. Decision context

| Review | SHA | Gate | Lesson |
|---|---|---|---|
| WF02-R10-FINAL | `9c64b9c` | FIX_REQUIRED | Kenney prefab monoliths — disconnected; no continuous frontage / civic enclosure |
| WF02-R11-FINAL | `4658dd2` | FIX_REQUIRED | Modular cell assembly — flat tan wall grids |
| **WF02-R12** | **`ab4a8d2`** | **FIX_REQUIRED** | Authored depth on same method — **visually indistinguishable from R11** |
| ChatGPT FIX_REQUIRED | `ab4a8d2` | **Plan R13 required** | **Construction vocabulary/assembly method caps form** |

**Preserved (must not regress):**

| System | Status |
|---|---|
| R9 `WorldDefinition` / semantic resolver | Frozen contract |
| R10 facade-bound Street portal | Frozen algorithm |
| R11 modular registry / layout / bounds / rollback | Preserved as R12 rollback base |
| Simulation / worker determinism | Frozen |
| M02 facility/entrance/route authority | Frozen |
| Kenney roads + Quaternius nature | Supporting pipeline |
| Performance gates (Overview ≤140 DC / <150k tris; Street ≤100 DC) | Hard caps |

**Visual failure (Grok + ChatGPT alignment on R12):**

| Criterion | R12 verdict |
|---|---|
| Civic landmark / enclosure at Overview | ❌ — flat tan modular wall |
| Commercial continuous inhabited storefront | ❌ — still wall-dominant |
| Residential distinct miniature homes | ❌ — too close to R11 pair |
| R11 → R12 material delta | ❌ — ordinary viewer confuses |
| Silhouette role recognition @ thumbnail | ❌ |
| Street citizen + door + road proof | ✅ — R10 portal preserved |
| Engineering / perf / determinism | ✅ — cannot override visual gate |

**Root cause:** Two consecutive prototype revisions (R11, R12) using **Kenney Modular Buildings cell assembly** have failed to produce thumbnail-readable finished architecture. Roof/door/window/corner pieces remain **subordinate to broad coplanar tan wall masses**. The assembly method dictates the look instead of serving north-star silhouette and facade language.

---

## 3. Executive summary — R13 source strategy

R13 compares three paths and **recommends exactly one**:

| Path | Label | Verdict |
|---|---|---|
| **A** | Continue Kenney Modular Buildings cell assembly | **REJECT** — exhausted (R11+R12) |
| **B** | Kenney City Kit finished prefab shells (registered) | **REJECT for prototypes** — R10 failure class |
| **C** | **Bounded offline-authored prototype shells (CC0 Kenney kitbash)** | **RECOMMEND** |

### Recommended path: **P-FAS (Finished Architecture Shells)**

Replace modular **cell stacking** with **4 offline-authored shell GLBs** (CC0 Kenney sources only) placed via a thin shell registry that reuses R11 **door bindings**, **presentation bounds**, and **Street portal** integration — not a third world authority.

**Deferred without new plan:** Neighborhood-wide shell replacement; 240 m expansion; M03; merge; external asset families.

---

## 4. Strategy comparison (mandatory audit)

**Artifact:** [`r13_architecture_source_audit_plan.json`](r13_architecture_source_audit_plan.json) (`npm run audit:wf02-r13-architecture-source`)

### 4.1 Path A — Continue Kenney Modular Buildings assembly

| Attribute | Assessment |
|---|---|
| Module inventory | 30 curated GLBs @ R12 |
| Prototype instance count | ~400+ instanced cells per scene |
| R11 outcome | FIX_REQUIRED — flat wall grids |
| R12 outcome | FIX_REQUIRED — visually ~R11 |
| Silhouette class | Coplanar-wall-dominant |
| North-star fit | **Poor** — construction kit caps finished form |
| Verdict | **REJECT** — prohibited as primary strategy |

**Why not another modular pass:** Same vocabulary + same assembly grammar cannot produce landmark civic hierarchy, continuous storefront identity, or distinct residential character when wall cells dominate pixel mass. R12 proved depth modules and authored gz layers are insufficient.

### 4.2 Path B — Kenney City Kit prefab / architectural family (registered)

| Asset | Role | Measured intrinsic | Tris | Warm atlas |
|---|---|---:|---:|---|
| `community-hall.glb` | Civic candidate | 1.64×0.89×1.01 m | ~1,509 | civic_cream |
| `school.glb` | Civic alt | 0.88×1.29×1.01 m | ~1,512 | civic_cream |
| `store-general.glb` | Commercial bay | 0.84×1.69×1.03 m | ~1,794 | warm_commercial |
| `workshop-industrial.glb` | Commercial bay | 2.08×1.92×1.87 m | ~1,896 | warm_industrial |
| `cafe-bistro.glb` | Commercial bay | 0.97×1.29×0.94 m | ~1,276 | warm_commercial |
| `home-cottage.glb` | Residential house-1 | 1.83×1.14×1.14 m | ~1,748 | warm_residential |
| `home-type-a.glb` | Residential house-2 | 1.30×0.83×1.03 m | ~1,174 | warm_residential |

**Pipeline compatibility:** ✅ Already in `ASSET_REGISTER`; `ModelAsset` + `targetWidth` + `presentationBounds` proven.

**R10 outcome @ `9c64b9c`:** FIX_REQUIRED — prefabs readable individually but **disconnected boxes**; no continuous 34 m commercial frontage; civic enclosure insufficient; vertical layering FAIL at Overview.

| North-star requirement | Prefab-only feasibility |
|---|---|
| Civic landmark / held square | Partial — single low hall mesh; no colonnade/tower hierarchy |
| 3-bay continuous storefront | **Fail** — three separate scaled boxes with gaps |
| Distinct residential pair | Partial — similar suburban silhouettes |
| Street portal + door scale | ✅ Proven R10 |

**Verdict:** **REJECT as R13 primary strategy** — repeats R10 monolithic placement failure for commercial continuity and civic enclosure. Acceptable only as **source geometry** for Path C kitbash merges, not as runtime placement strategy.

**External families (KayKit City Builder Bits, etc.):** HOLD — R11 audit rejected KayKit as pre-assembled repeat of R10 class; no R13 import without explicit ChatGPT approval after Path C prototype FAIL.

### 4.3 Path C — Bounded offline-authored prototype shells (RECOMMEND)

| Attribute | Assessment |
|---|---|
| Method | Offline merge of CC0 Kenney reference meshes → 4 authored shell GLBs |
| Runtime | Single placement per shell (not cell instancing) |
| Silhouette class | Authored finished form |
| North-star fit | **Best available** within license/pipeline/performance bar |
| License | CC0 1.0 derivative — Kenney Modular sample houses/tower + selective City Kit extracts |
| Rollback | `WORLD_LAB_PROTOTYPE_SHELL=false` → R12 modular assemblies |

**Reference meshes (modular pack — disassembly guides, not runtime stacks):**

| Reference | Measured size (m) | Tris | R13 use |
|---|---|---:|---|
| `building-sample-tower-a` | 1.1×2.5×1.25 | 398 | Civic tower cap / landmark mass |
| `building-sample-house-c` | 2.0×1.98×2.2 | 322 | Wide facade / commercial bay rhythm |
| `building-sample-house-b` | 1.1×1.98×2.2 | 374 | Taller residential gable read |
| `building-sample-house-a` | 1.1×1.14×2.0 | 312 | Cottage porch residential read |

**Verdict:** **RECOMMEND** — shifts from construction grammar to **silhouette-first authored shells** while staying inside approved CC0 Kenney provenance and existing presentation pipeline.

---

## 5. Recommended build — four prototype shells (three roles)

Grid/placement anchors frozen from R9/R11 semantic layout. Shells scaled to presentation envelopes — **sim centers/entrances unchanged**.

### 5.1 Shell S1 — Civic enclosure (`wf02-civic-enclosure-shell.glb`)

| Attribute | Target |
|---|---|
| Role | Town civic landmark holding square edge — not a wall strip |
| Footprint | **18 m × 6 m** presentation envelope |
| Height | **6.5 m** (tower mass dominates silhouette) |
| Roof profile | Tower cap + stepped parapet (baked mesh) |
| Facade | Colonnade recess + portico baked — not gz cell stack |
| Door | Central portico socket → visual only; no sim entrance change |
| Source kitbash | `building-sample-tower-a` + `building-sample-house-c` wing + baked `steps-narrow-windows-round` porch |
| Est. tris | ~1,200 |
| Overview read | Landmark tower + held square edge |
| Street read | Colonnade depth + civic identity |

**Silhouette sketch:**

```
      [==TOWER==]
     /  HALL   \
    | ▓▓▓▓▓▓▓▓ |  ← baked colonnade recess
    |__PORTICO__|
```

### 5.2 Shell S2 — Commercial frontage (`wf02-commercial-frontage-shell.glb`)

| Attribute | Target |
|---|---|
| Role | **Single mesh** continuous 3-bay shop frontage |
| Footprint | **34 m × 5 m** |
| Height | **5.5 m** (workshop bay tallest) |
| Roof profile | Stepped roofline across bays (baked) |
| Facade | Storefront display recess + awning shadow plane baked |
| Doors | Store @ gx≈3.5, workshop @ gx≈21.5 — **preserve R12 `doorBindings`** |
| Replaces | `store`, `workshop`, `cafe` presentation |
| Source kitbash | `building-sample-house-c` wide form + `store-general` door bay + `detail-awning` bake |
| Est. tris | ~1,800 |
| Overview read | Continuous inhabited shop wall |
| Street read | Awning + display depth + citizen-door-road proportion |

### 5.3 Shell S3 — Residential cottage (`wf02-residential-cottage-shell.glb`)

| Attribute | Target |
|---|---|
| Role | M02 home — cozy 1.5-story cottage |
| Footprint | **6 m × 5 m** |
| Height | **4.5 m** incl. roof |
| Roof | Slanted + dormer baked |
| Facade | Porch stoop + flanking windows baked |
| Door | **`home-door` binding** preserved |
| Replaces | `house-1` |
| Source kitbash | `building-sample-house-a` + porch bake |
| Est. tris | ~450 |

### 5.4 Shell S4 — Residential gable (`wf02-residential-gable-shell.glb`)

| Attribute | Target |
|---|---|
| Role | Taller distinct 2-story home |
| Footprint | **7 m × 6 m** |
| Height | **6.0 m** |
| Roof | Gable + balcony shelf baked |
| Facade | Asymmetric stoop + upper balcony |
| Replaces | `house-2` |
| Source kitbash | `building-sample-house-b` |
| Est. tris | ~500 |

**Pair discrimination @ Overview thumbnail:** S3 = low porch cottage; S4 = taller gable + balcony — must not read as modular wall boxes.

---

## 6. Implementation architecture (no third authority)

### 6.1 Shell registry (new — thin layer)

```
src/rendering/prototypeShell/
  prototypeShellTypes.ts       — PrototypeShellSpec (shellId, assetUrl, origin, rotY, scale, doorBindings, replacesBuildingIds)
  prototypeShellRegistry.ts    — 4 shells from manifest JSON
  prototypeShellBounds.ts      — AABB from modelLayoutManifest + scale
  prototypeShellLayer.tsx      — ModelAsset or single GltfPlacement per shell
  prototypeShellMode.ts        — WORLD_LAB_PROTOTYPE_SHELL flag + rollback
```

**Reuse without duplication:**

| R11 module | R13 reuse |
|---|---|
| `doorBindings` contract | Same labels/localX/localZ → sim entrance delta ≤0.3 m |
| `resolveModularAssemblyAabb` pattern | `resolvePrototypeShellAabb` in `presentationBounds.ts` |
| `ModularAssemblyLayer` rollback | Keep; shell mode takes precedence when flag true |
| `modularModuleRegistry` | **Frozen** — R12 rollback path |

### 6.2 Import / normalization / material strategy

| Step | Action |
|---|---|
| 0 | Offline kitbash in Blender/etc. from CC0 Kenney sources only |
| 1 | Export 4 GLBs → `public/assets/glb/wf02/prototype-shells/` |
| 2 | Apply `colormap_warm_modular.png` or per-role warm atlas (civic_cream / warm_commercial / warm_residential) |
| 3 | Measure bounds → `prototypeShellManifest.json` + `modelLayoutManifest.json` rows |
| 4 | Register provenance in `ASSET_REGISTER.md` with source mesh list |
| 5 | **No runtime mesh merge** — shells are authoritative presentation meshes |

**Door socket authoring:** Mark door plane in shell metadata; `doorBindings` align visual door to frozen sim entrance (same test as R12).

### 6.3 Anchor / bounds strategy

| Concern | Rule |
|---|---|
| Placement origin | Same semantic anchors as R11/R12 assemblies |
| Presentation AABB | Measured shell bounds × scale → `presentationBounds.ts` |
| Street portal | Shell AABB must not engulf portal presets (extend R12 tests) |
| Awnings / signs / paths | Baked into shell mesh OR existing Kenney props as **non-structural** attachments only |
| Facility overlap | Rerun store/workshop 0.10 m gap audit against shell AABBs |

### 6.4 Rollback compatibility

| Flag | Behavior |
|---|---|
| `WORLD_LAB_PROTOTYPE_SHELL=false`, `WORLD_LAB_MODULAR_PROTOTYPE=true` | R12 modular assemblies |
| Both false | R10 Kenney prefab presentation |
| Sim / resolver | Unchanged in all modes |

---

## 7. Files and functions (post-approval touch map)

| Action | Paths |
|---|---|
| **Create** | `public/assets/glb/wf02/prototype-shells/*.glb`, `prototypeShellManifest.json`, `scripts/wf02-r13-shell-import.mjs`, `scripts/wf02-r13-prototype-capture.mjs` |
| **Create** | `src/rendering/prototypeShell/*` |
| **Modify** | `presentationBounds.ts`, `WorldLabCompositionLayer.tsx`, `worldLabModularMode.ts` (add shell flag), `PrefabBuildings.tsx` suppression hook |
| **Modify** | `tests/unit/wf02/prototypeShell.test.ts`, extend `modularAssembly.test.ts` rollback cases |
| **Modify** | `Docs/assets/ASSET_REGISTER.md`, `package.json` scripts |
| **Preserve** | All paths in §8 |

---

## 8. Do-not-touch list

| Path / system | Reason |
|---|---|
| `src/simulation/**` | Simulation authority |
| `src/world/facilityPoints.ts` | Frozen sim centers |
| `src/world/worldResolver.ts` / entrances / routes | M02 semantic authority |
| Overview / Angled / Street portal camera constants | Frozen framing (R10 proof) |
| Road topology / river / terrain carve | WF01 geography authority |
| Worker determinism / RNG | Constitution |
| Runtime LLM / network inference | Forbidden |
| `OverviewCompositionLayer` district scatter | Out of R13 prototype scope |
| Neighborhood-wide replacement | Prohibited until prototype PASS |
| M03 / merge | Hold |

---

## 9. Facility overlap and proportion audits (pre-handoff)

| Audit | Method | Gate |
|---|---|---|
| Store/workshop presentation AABB gap | Extend `visual_layout_audit` / shell bounds test | ≥0.10 m |
| Door binding vs sim entrance | `prototypeShell.test.ts` | ≤0.3 m delta |
| Citizen / door / road proportion | Street capture @ frozen portal | Readable @ 2.32 m visual citizen |
| Street portal clearance | `assertFacilityPortalOutsideBuilding` | PASS all M02 presets |
| Asset 404 / network | Capture manifest | 0 errors |

---

## 10. Performance budget

| Gate | Hard cap | R12 measured | R13 shell estimate |
|---|---:|---:|---:|
| Overview DC | ≤140 | 97–100 | **≤110** (4 shells + town) |
| Overview tris | <150k | ~48k | **≤55k** (+~4k shell mesh) |
| Street DC | ≤100 | 69 | **≤75** |
| M03 20-citizen headroom | LOD required | ~100k tri slack | Preserved — not raw slack for citizens |

Shell path **reduces** instanced module draw spam vs R12 (~400 instances → 4 shell draws for prototypes).

---

## 11. Tests and evidence plan (post-implementation)

### 11.1 Automated

```bash
npm run audit:wf02-r13-architecture-source   # plan artifact (this revision)
npm run test:all                              # must remain green
npm run import:wf02-r13-shells                # only after APPROVED_TO_BUILD
npm run capture:wf02-r13-prototype            # evidence @ approved SHA
```

| Suite | Coverage |
|---|---|
| `prototypeShell.test.ts` | Shell manifest, bounds, door bindings, rollback flags |
| `streetPortalCamera.test.ts` | Portal outside shell AABB |
| `worldResolver.test.ts` | Entrances unchanged |
| `determinism.test.ts` | Unchanged |

### 11.2 Evidence compare chain (frozen views)

| Panel | Source |
|---|---|
| **R11 (modular grid)** | `Docs/milestones/WF02/01_r11_overview_dawn.png` |
| **R12 (authored depth)** | `Docs/milestones/WF02/01_r12_overview_dawn.png` |
| **R13 (shell prototype)** | `review-evidence-wf02-r13-<sha>` |
| **NORTH STAR** | `Docs/art-direction/references/god-mode-town-north-star.png` |

**Required shots @ R13 SHA:**

| # | Shot |
|---|---|
| 1 | Compare strip: **R11 → R12 → R13 → north-star** |
| 2 | Overview dawn + noon |
| 3 | Angled |
| 4 | Civic closeup — **landmark tower + enclosure** |
| 5 | Commercial closeup — **continuous storefront** |
| 6 | Residential closeup — **distinct pair** |
| 7 | Silhouette thumbnails (128 px) — role recognition without labels |
| 8 | Street citizen + doorway + road/sidewalk |
| 9 | Store / workshop / home door scale |
| 10 | Night |
| 11 | Diagnostics manifest + provenance JSON |
| 12 | **0** asset/network errors |

### 11.3 Visual definition of done (authoritative)

| Criterion | Required |
|---|---|
| Civic reads as **landmark/enclosure** — not tan wall strip | **Yes** |
| Commercial reads as **continuous inhabited storefront** | **Yes** |
| Residential pair **distinct miniature homes** @ silhouette | **Yes** |
| R12 → R13 material delta — not confusable with modular walls | **Yes** |
| R11/R12 → R13 role recognition @ thumbnail | **Yes** |
| Street citizen + door + road proportion | **Yes** |
| Sim entrances unchanged | **Yes** |
| Modular cell count / gz depth completion | **No** — not a pass criterion |

**STOP if Path C fails:** Post exact pixels + asset/form gap report; **do not self-escalate** to external family without ChatGPT plan revision.

---

## 12. Phase gates and STOP points

| Gate | Entry | Exit | STOP if fail |
|---|---|---|---|
| **Plan R13** | This document | `[GOD-MODE:CHATGPT-PLAN-DECISION] APPROVED_TO_BUILD` | **No kitbash/import/code** |
| **Phase 0** | Plan approved | Offline shell authoring + provenance doc | No Phase 1 |
| **Phase 1** | Phase 0 PASS | Shell import + registry + bounds | No Phase 2 |
| **Phase 2** | Phase 1 PASS | 3-role shell placement in engine | No evidence |
| **Phase 3** | Phase 2 PASS | Visual DoD + compare strip + tests | No expansion / merge / M03 |
| **Neighborhood rollout** | R13 visual PASS | Separate plan revision | **Prohibited** in R13 |

---

## 13. Requirement IDs protected

| ID | R13 contribution |
|---|---|
| WF02-VISUAL-HARD-GATE | Silhouette-first shell strategy |
| WF02-SCALE-001 | Frozen anchors + citizen/door/road proportions |
| WF02-PRESERVE-SIM | No simulation edits |
| WF02-PRESERVE-M02 | Door bindings + entrance tests |
| WF02-RENDER-BUDGET | 4 shells vs 400+ module instances |
| WF02-DETERMINISM | Seeded presentation only |

---

**STOP.** Awaiting `[GOD-MODE:CHATGPT-PLAN-DECISION] Decision: APPROVED_TO_BUILD` before any R13 kitbash, import, or implementation. Do not merge. Do not start M03.
