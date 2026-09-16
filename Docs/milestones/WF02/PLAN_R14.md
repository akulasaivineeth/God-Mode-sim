# WF02 Plan Revision 14 — Hero Neighborhood Shell Rollout

**State:** WAITING_FOR_CHATGPT_PLAN_APPROVAL  
**Supersedes:** Plan revision 13 implementation @ `3ea8e20ba08f6e34022aadd4ff0bb86ea6b7d071` (R13 prototype) + evidence tip @ `d2ebdd43be652b7a26a1429f7152706bfbc05fc2`  
**Senior arbitration:** `[GOD-MODE:CHATGPT-DECISION]` WF02-R13-SENIOR @ `d2ebdd4` — **PASS_PROTOTYPE_STRATEGY — PLAN_GATE_REQUIRED_FOR_ROLLOUT**  
**Investigation base SHA:** `d2ebdd43be652b7a26a1429f7152706bfbc05fc2`  
**Branch:** `cursor/wf02-scale-calibration-754a`  
**Scope:** PLAN ONLY — no neighborhood rollout code, shell re-anchor, evidence repair implementation, merge, 240 m expansion, TownBox production port, or M03 until `[GOD-MODE:CHATGPT-PLAN-DECISION] Decision: APPROVED_TO_BUILD`

---

## 1. Work item

WF02 — North-Star Scale & Aesthetic Calibration.

R13 validated the **root-cause strategy change**: bounded offline CC0 Kenney kitbash **FOUR_SHELL** vocabulary materially escapes the R11/R12 modular-wall failure mode while measured Overview/Street budgets remain inside prototype gates (Overview **89–92 DC / ~37k tris**; Street **49 DC / ~61k tris** @ `3ea8e20`).

R13 proved **silhouette vocabulary**, not **cohesive hero neighborhood**. Four shells sit as isolated demos: civic shell is **additive** (does not replace `community-hall` / `clinic` prefabs); `CivicEnclosure` colonnade props still render atop the civic shell; shell origins were authored against legacy R11/R12 assembly anchors, not the active **hero neighborhood** semantic layout in `heroNeighborhood.ts`. Ordinary viewers still see duplicate civic clutter and misaligned massing relative to roads, square, park edge, and river.

R14 is the **smallest production rollout** that proves the shell vocabulary can produce a **cohesive hero neighborhood** — one readable town block — rather than four isolated prototype placements. This is **not** WF02 milestone PASS, **not** merge authorization, and **not** M03 authorization.

---

## 2. Decision context

| Review | SHA | Gate | Lesson |
|---|---|---|---|
| WF02-R4.1 | `6dbd8b5` | BLOCKED | Composition scatter insufficient; modular/prefab vocabulary ceiling |
| WF02-R11/R12 | `4658dd2` / `ab4a8d2` | BLOCKED | Modular cell assembly caps finished form |
| **WF02-R13-SENIOR** | **`d2ebdd4`** | **PASS_PROTOTYPE_STRATEGY** | Finished shell vocabulary works; rollout requires new plan gate |
| WF02 milestone | — | **OPEN** | North-star town-density / river / park / district polish bar unchanged |

**Senior arbitration boundaries (preserved):**

| System | Status |
|---|---|
| Deterministic worker / simulation authority | Frozen |
| M02 semantic facility / entrance / route truth | Frozen |
| R9 `WorldDefinition` / resolver boundary | Frozen |
| No runtime paid LLM / API | Forbidden |
| Apple M2 / 8 GB performance target | Hard cap |
| Simulation / render separation | Required |
| Hero neighborhood geography (~70×58 m) | Frozen topology — no 240 m expansion |

**Evidence integrity finding (mandatory repair before next BUILDER handoff):**

At `d2ebdd4`, `Docs/milestones/WF02/r13_prototype_manifest.json` lists `sha256` values that **do not match committed** `Docs/milestones/WF02/*.png` bytes (**11 / 15** shots/silhouettes mismatch; manifest still references `/opt/cursor/artifacts/...` paths and stale `sha: 3ea8e20`). Senior treats the manifest as **NON-CANONICAL** metadata; visual prototype PASS relies on independently reviewed committed PNGs / release assets, not mismatched hashes.

R14 Phase 0 (pre-build) defines the repair; R14 implementation must not paper over by hashing transient artifact paths.

---

## 3. Executive summary — R14 smallest rollout

R14 rolls the R13 **FOUR_SHELL** vocabulary into the **active hero neighborhood** as one coherent presentation block:

| Phase | Name | Deliverable | Gate |
|---|---|---|---|
| **0** | Evidence integrity + anchor audit | Repair manifest hashing; hero-neighborhood anchor delta report | Audit PASS before Phase 1 |
| **1** | Shell re-anchor + suppression semantics | Align 4 shells to `HERO_NEIGHBORHOOD_LAYOUT` building centers; civic **replacement** not duplication | Unit tests + overlap audit |
| **2** | District composition integration | River/park edge, future lot, vegetation frame tied to shell districts — no additive civic clutter | Composition mask tests |
| **3** | Secondary civic cluster (bounded) | **One** additional shell OR prefab policy for `clinic` — smallest change that completes civic frame | Visual closeup |
| **4** | Evidence + STOP | Same-view compare chain + release + manifest integrity CI | Visual hard gate + engineering green |

**Deferred without new plan:** Full legacy 14-facility town rollout; 240 m `LEGACY_CANONICAL_TOWN`; M03 citizen population; PR merge; TownBox production port; external asset families.

---

## 4. Smallest rollout scope — hero neighborhood only

R14 targets **`hero-neighborhood-r9`** (`src/world/worldLab/heroNeighborhood.ts`) — 7 buildings, 1 future lot, park edge, river, civic square — **not** the legacy 14-facility envelope.

### 4.1 Building / facility mapping (exact)

| Semantic ID | Auth center (x,z) | M02? | R13 shell | R14 presentation authority |
|---|---|---:|---|---|
| `community-hall` | (−14, −18) | — | S1 civic shell @ (−14, −3.5) **misaligned** | **S1 re-anchored** to civic cluster; **suppress** prefab + duplicate colonnade |
| `clinic` | (14, −18) | — | none (Kenney prefab renders) | **Bounded:** retain scaled Kenney `clinic.glb` **or** author **S1b clinic wing shell** (plan chooses one; no both) |
| `house-1` | (16, −4) | ✅ home | S3 cottage @ (13, −6.5) **misaligned** | **S3 re-anchored**; suppress prefab |
| `house-2` | (−16, −4) | — | S4 gable @ (−19, −6.5) **misaligned** | **S4 re-anchored**; suppress prefab |
| `store` | (−14, 14) | ✅ store | S2 commercial (replaces) | **S2 re-anchored** to commercial row |
| `workshop` | (4, 14) | ✅ work | S2 commercial (replaces) | same shell; **doorBindings** frozen |
| `cafe` | (16, 14) | — | S2 commercial (replaces) | same shell |
| future lot | (0, 26) | — | `FutureLotFrame` | retain; clip against shell AABBs |
| park edge | (28, 4) | — | `VegetationFrame` partial | **R14 river/park treatment** (§6) |
| river | x≈32–34 | — | terrain carve | **No massing through water** |

**Door / entrance authority (frozen sim truth):**

| Label | Sim entrance | R13 binding (localX, localZ) | R14 gate |
|---|---|---|---|
| `home-door` | (16, −6.4) | (2.5, 0.5) on S3 | ≤0.3 m visual delta after re-anchor |
| `store-door` | (−14, 10.8) | (3.5, 0.5) on S2 | ≤0.3 m |
| `workshop-door` | (4, 10.8) | (21.5, 0.5) on S2 | ≤0.3 m |

M02 route: square → home / store → workshop paths unchanged in `HERO_NAV`.

### 4.2 Civic replacement semantics (eliminate duplicate clutter)

**Current R13 defect:** `PrototypeShellLayer` renders S1 **while** `PrefabBuildings` still renders `community-hall` + `clinic`, and `CivicEnclosure` still instanciates colonnade/paver props (`replacesBuildingIds: []` on civic shell).

**R14 required behavior when `WORLD_LAB_PROTOTYPE_SHELL=true`:**

| Layer | R14 rule |
|---|---|
| `community-hall` prefab | **Suppressed** (add to `SHELL_SUPPRESSED_BUILDINGS` or shell `replacesBuildingIds`) |
| S1 civic shell | **Single civic mass** anchored to square edge @ (−14, −18) envelope |
| `CivicEnclosure` colonnade/pavers | **Suppressed** when shell active **OR** reduced to **non-structural square amenity only** (planters/radial pavers) that do not duplicate shell colonnade geometry |
| `clinic` | Explicit policy: prefab **or** S1b shell — never shell + prefab stack |

**Principle:** Shell mass **replaces** prefab presentation for mapped buildings; district props **frame** shells — they do not reconstruct parallel architecture.

### 4.3 Commercial / residential row

S2 must span store (−14), workshop (4), cafe (16) along `road-commercial-ew` (z=8 frontage band) with continuous silhouette. Re-anchor origin + `targetWidth` so presentation AABB covers three auth centers without engulfing M02 entrances or future-lot spur.

S3/S4 must read as **distinct pair** flanking residential road (z=−6) with porch/gable discrimination @ Overview thumbnail — preserved from R13 PASS criteria.

---

## 5. District composition — vegetation, river, park

Integrate existing World Lab modules under shell-aware guards; **do not** reintroduce R4.1 sparse ground-tint grid as primary read.

| District module | R14 treatment |
|---|---|
| `WorldLabGroundTint` | Clip to hero zones; exclude road/path/river corridors (`compositionMask` pattern) |
| `VegetationFrame` | Kenney `treeLarge` / `treeSmall` frame **park edge** (x≈28) + north perimeter — density increase bounded by budget |
| `ResidentialGardens` | Hedge/planter bands **outside** shell AABBs; respect M02 path buffer |
| `FutureLotFrame` | Visible pad @ (0,26); **no phantom building** |
| `CommercialFrontage` | Remains **off** when shell active (already guarded) — re-enable only non-structural sidewalk scatter if budget allows |
| River | Bank vegetation + tint **outside** water mesh; no z-fighting on `riverCrossSection` |
| Civic square | Ground tint + **minimal** center amenity; colonnade geometry owned by shell |

**North-star reads required @ hero Overview camera** (`[0,46,36]` → `[0,0,4]`):

1. Civic frame holding square  
2. Residential pair + future lot negative space  
3. Commercial/work frontage continuity  
4. Park/orchard silhouette @ east edge  
5. River/park edge warmth (not empty olive meadow)

---

## 6. Citizen : door : building scale

Frozen from R4.1 / M02 (unchanged in R14):

| Measure | Value |
|---|---:|
| Visual citizen height | 2.32 m |
| Simulation citizen | 1.8 m |
| Door aperture | ~1× citizen height @ Street portal |
| Main road width | 6 m |
| Sidewalk | 1.4 m |
| Path | 1.6 m |

**Evidence:** Street + store/workshop/home street captures @ frozen portal presets; citizen readable against shell doors post re-anchor.

---

## 7. Asset / provenance pipeline

| Step | Action |
|---|---|
| 0 | Reuse R13 four shell GLBs unless re-anchor requires mesh edit (prefer transform-only) |
| 1 | If S1b clinic shell approved: offline kitbash from registered Kenney `clinic.glb` + provenance row in `r14_shell_provenance.json` |
| 2 | Update `prototypeShellManifest.json` origins / `replacesBuildingIds` / suppression sets |
| 3 | Register in `Docs/assets/ASSET_REGISTER.md` — CC0 Kenney derivatives only |
| 4 | `npm run audit:wf02-r14-shell-rollout` (new) — anchor delta, suppression completeness, provenance paths |
| 5 | **No** new external families; **no** `building-type-f.glb`; **no** runtime mesh merge |

---

## 8. Performance budget + M03 headroom

Measure after Phase 1 re-anchor **before** Phase 2 density add (recovery-before-add).

| Gate | Hard cap | R13 measured @ `3ea8e20` | R14 conservative target |
|---|---:|---:|---:|
| Overview DC | ≤140 | 89–92 | ≤120 |
| Overview tris | <150k | ~37k | ≤95k (density add headroom) |
| Street DC | ≤100 | 49 | ≤85 |
| Street tris | — | ~61k | ≤90k |
| M03 20-citizen | LOD required | large slack incidental | preserve **≥8k tris / ≥5 DC** below Overview gate after Phase 2 |

Shell draw count stays **4–5** (four core + optional clinic); budget spend is **district vegetation / park edge**, not modular cell spam.

If measured recovery after density is below target, prune in order: peripheral scatter → hedge segments → ground tint opacity → park edge trees **before** civic/commercial/residential shell edits.

---

## 9. Rollback compatibility

| Flag configuration | Presentation |
|---|---|
| `WORLD_LAB_PROTOTYPE_SHELL=true` | R14 hero shell rollout |
| `WORLD_LAB_PROTOTYPE_SHELL=false`, `WORLD_LAB_MODULAR_PROTOTYPE=true` | R12 modular assemblies |
| Both false | R10 Kenney prefab + World Lab district modules |
| Sim / resolver / entrances | Unchanged in all modes |

Rollback must restore R13 prototype anchors for comparison without code deletion.

---

## 10. Evidence integrity repair (Phase 0 — mandatory)

**Root cause @ `d2ebdd4`:** Capture script hashes `/opt/cursor/artifacts/wf02_r13_prototype/*.png` then copies to `Docs/milestones/WF02/`; manifest committed without atomic PNG commit (or PNGs regenerated later). Result: manifest `sha256` ≠ git-committed PNG bytes.

**R14 repair spec:**

| # | Requirement |
|---|---|
| 1 | Capture script writes PNG to `Docs/milestones/WF02/` **first**, then hashes **that committed path** |
| 2 | Manifest `file` fields use repo-relative paths (`Docs/milestones/WF02/...`) — never `/opt/cursor/artifacts/...` |
| 3 | Manifest `sha` equals `git rev-parse HEAD` at capture time |
| 4 | New audit: `npm run audit:wf02-evidence-integrity` — for each manifest entry, `sha256(Docs/...)` must match JSON; **fail CI** on mismatch |
| 5 | Single atomic commit: PNGs + manifest + compare strip together |
| 6 | Release tag references same SHA; Grok/builder cross-check manifest vs committed bytes |

**Backfill @ Phase 0 (plan approval only):** Re-run R13 capture **or** re-hash existing authoritative PNGs into manifest without reshooting if pixels unchanged — but bytes and manifest must match in one commit.

---

## 11. Same-view north-star comparisons

Frozen cameras from `HERO_NEIGHBORHOOD_DEFINITION.cameras` + R10 Street portal preset.

| Panel | Source |
|---|---|
| WF01 BEFORE | `Docs/milestones/WF02/00_before_wf01_overview.png` |
| R13 prototype | `Docs/milestones/WF02/01_r13_overview_dawn.png` (post integrity repair) |
| **R14 rollout** | `01_r14_overview_dawn.png` @ approved SHA |
| NORTH STAR | `Docs/art-direction/references/god-mode-town-north-star.png` |

**Required shots @ R14 SHA:**

| # | Shot |
|---|---|
| 1 | Compare strip: WF01 → R13 → **R14** → north-star (dawn + noon) |
| 2 | Overview dawn + noon |
| 3 | Angled |
| 4 | Civic square — **no duplicate colonnade clutter** |
| 5 | Commercial frontage — continuous 3-bay |
| 6 | Residential pair + future lot |
| 7 | Park edge + river |
| 8 | Street citizen + door + road/sidewalk |
| 9 | Store / workshop / home door scale |
| 10 | Night |
| 11 | Diagnostics manifest + provenance JSON (**integrity audit PASS**) |
| 12 | **0** asset/network/404 errors |

Pixels authoritative; composition SVG diagnostic only.

---

## 12. Tests and zero-404 / network proof

```bash
npm run audit:wf02-evidence-integrity      # Phase 0+
npm run audit:wf02-r14-shell-rollout       # post-approval
npm run test:all                           # must remain green
npm run capture:wf02-r14-rollout           # post-approval evidence
```

| Suite | Coverage |
|---|---|
| `prototypeShell.test.ts` | Re-anchor bounds, door deltas, suppression sets, civic duplicate guard |
| `worldResolver.test.ts` | Entrances unchanged |
| `streetPortalCamera.test.ts` | Portal outside shell AABB post re-anchor |
| `compositionMask.test.ts` | River/road exclusions |
| `evidenceIntegrity.test.ts` (new) | Manifest sha256 vs committed Docs bytes |
| `determinism.test.ts` | Unchanged |

Capture manifest must record `consoleErrors: []`, `networkAssetErrors: []`; audit fails on any `/assets/` 404.

---

## 13. File map (post-approval touch list)

| Action | Paths |
|---|---|
| **Modify** | `prototypeShellManifest.json`, `prototypeShellMode.ts`, `prototypeShellRegistry.ts`, `presentationBounds.ts` |
| **Modify** | `WorldLabCompositionLayer.tsx`, `CivicEnclosure.tsx`, `PrefabBuildings.tsx` suppression hooks |
| **Modify** | `districtCompositionSpec.ts`, `VegetationFrame.tsx`, `ResidentialGardens.tsx` (shell-aware clipping) |
| **Create** | `scripts/wf02-r14-shell-rollout-audit.mjs`, `scripts/wf02-r14-rollout-capture.mjs`, `scripts/wf02-evidence-integrity-audit.mjs` |
| **Create** | `tests/unit/wf02/evidenceIntegrity.test.ts`, extend `prototypeShell.test.ts` |
| **Create** | `Docs/milestones/WF02/r14_rollout_manifest.json`, `r14_shell_provenance.json` (if S1b) |
| **Modify** | `Docs/assets/ASSET_REGISTER.md`, `package.json` scripts |
| **Repair** | `r13_prototype_manifest.json` + R13 PNGs (Phase 0 backfill) |
| **Preserve** | `src/simulation/**`, `facilityPoints.ts`, `heroNeighborhood.ts` sim coords/entrances/nav, worker determinism |

---

## 14. Explicit non-goals

| Non-goal | Reason |
|---|---|
| WF02 milestone PASS declaration | North-star density/polish bar still open |
| Merge PR #12 | Separate authorization |
| M03 20-citizen population | Requires LOD plan |
| 240 m legacy town expansion | Out of hero rollout scope |
| TownBox production code port | ARCH01 spike not approved for production |
| Full 14-facility shell replacement | Smallest rollout = hero 7 + districts only |
| Kenney Modular Buildings cell assembly | Exhausted @ R11/R12 |
| External asset families | Not approved |
| Runtime LLM / paid API | Constitution forbidden |
| Roof-only material tint | GLB audit — no reliable roof split |

---

## 15. Visual definition of done (R14 rollout — authoritative)

| Criterion | Required |
|---|---|
| Hero block reads as **one cohesive neighborhood** — not four isolated demos | **Yes** |
| Civic **replacement** — no prefab + shell + colonnade triple stack | **Yes** |
| Commercial continuous storefront across store/workshop/cafe | **Yes** |
| Residential distinct pair @ silhouette | **Yes** (inherit R13 PASS) |
| Future lot visible; park/river edge framed | **Yes** |
| M02 door/entrance deltas | ≤0.3 m |
| R13 → R14 material Overview delta toward north-star family | **Yes** — image-space |
| Evidence manifest integrity | **Yes** — audit PASS |
| Engineering / perf / determinism | **Yes** — cannot override visual gate |

**STOP if visual hard gate fails:** Post exact pixels + gap report; do not self-escalate to external assets or 240 m expansion.

---

## 16. Phase gates and STOP points

| Gate | Entry | Exit | STOP if fail |
|---|---|---|---|
| **Plan R14** | This document | `[GOD-MODE:CHATGPT-PLAN-DECISION] APPROVED_TO_BUILD` | **No rollout code** |
| **Phase 0** | Plan approved | Evidence integrity repair + hero anchor audit | No Phase 1 |
| **Phase 1** | Phase 0 PASS | Shell re-anchor + civic suppression | No Phase 2 |
| **Phase 2** | Phase 1 PASS | District / river / park integration | No Phase 3 |
| **Phase 3** | Phase 2 PASS | Clinic policy + bounded civic cluster complete | No evidence |
| **Phase 4** | Phase 3 PASS | Visual DoD + compare + tests + release | No merge / M03 / 240 m |

---

## 17. Requirement IDs protected

| ID | R14 contribution |
|---|---|
| WF02-VISUAL-HARD-GATE | Cohesive hero neighborhood + north-star delta |
| WF02-SCALE-001 | Frozen entrances + citizen/door/road proportions |
| WF02-PRESERVE-SIM | No simulation edits |
| WF02-PRESERVE-M02 | Door bindings + route preservation |
| WF02-RENDER-BUDGET | Shell-first + measured density add |
| WF02-DETERMINISM | Seeded presentation only |
| WF02-EVIDENCE-INTEGRITY | Manifest ↔ committed bytes audit |

---

**STOP.** Awaiting `[GOD-MODE:CHATGPT-PLAN-DECISION] Decision: APPROVED_TO_BUILD` before any R14 implementation, evidence repair execution, merge, or M03. Do not port TownBox production code. Do not expand to 240 m.
