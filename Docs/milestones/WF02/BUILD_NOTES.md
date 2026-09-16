# WF02 Build Notes — R10 Phases A–C

## Base

- Plan revision **10** @ `864961d` (approved `PHASE_A_B_C_ONLY — EXISTING_REGISTERED_ASSETS`)
- Prior blocked: R9 @ `f0d7207` (WF02-R9 — visual gate)
- Handoff SHA: **`8923425731b2add29daff5637e0e567d618d57af`**

## Phase A — vocabulary audit

1. **`scripts/wf02-r10-vocabulary-audit.mjs`** — on-disk Kenney inventory audit vs north-star requirements
2. **`Docs/milestones/WF02/r10_vocabulary_audit.json`** — measured GLB sizes, north-star gap table, Kenney **conditional** sufficiency verdict
3. **`npm run audit:wf02-r10-vocabulary`** — re-run audit

**Verdict:** Registered Kenney assets can support Phase C assembly for residential/gardens and partial civic/commercial reads. Vertical layering and full civic enclosure may need Phase D modular family **if visual gate still fails** — Phase D **not implemented** in this build.

## Phase B — street portal camera

1. **`src/rendering/assets/presentationBounds.ts`** — `resolvePresentationWorldAabb()`, facade-bound AABB from model layout
2. **`src/rendering/streetPortalCamera.ts`** — `resolveFacilityStreetPortal()`, `resolveStreetCorridorPortal()` with distance/lateral sweep fallback
3. **`src/rendering/facilityStreetCamera.ts`** — delegates to street portal when World Lab active
4. **`src/rendering/cameraPresets.ts`** — World Lab street preset from portal resolver (removed hardcoded street from `heroNeighborhood.ts`)
5. **`tests/unit/wf02/streetPortalCamera.test.ts`** — 6 unit tests

## Phase C — district vocabulary (registered assets only)

1. **`src/world/worldLab/districtCompositionSpec.ts`** — declarative civic/commercial/residential/future-lot/frame specs
2. **`src/rendering/environment/worldLab/`** — `CivicEnclosure`, `CommercialFrontage`, `ResidentialGardens`, `FutureLotFrame`, `VegetationFrame`, `WorldLabGroundTint`
3. **`src/rendering/environment/WorldLabCompositionLayer.tsx`** — orchestrates R10 modules via `InstancedGltfPlacements`
4. **`src/rendering/environment/VisualTownLayout.ts`** — bounded staging offsets (≤~1 m) for hero buildings
5. **`src/rendering/assets/buildings/buildingPrefabConfig.ts`** — silhouette variation (house-1 11.8 m, house-2 10.4 m, workshop awning, cafe awning)

## Preserved (simulation semantics)

- R9 `WorldDefinition` / `worldResolver` / hero neighborhood ~70×58 m layout
- Action → location mapping, worker authority, seeded determinism
- Semantic IDs: home / store / work
- 2.32 m presentation / 1.8 m simulation citizen split
- Registered Kenney + Quaternius inventory only (no Phase D import)
- Legacy 240 m layout available via `WORLD_LAB_MODE = false`

## Performance (measured live GL @ handoff SHA)

| Preset | Draw calls | Triangles | Gate |
|---|---:|---:|---|
| Overview 06:00 | **98** | **28,882** | ≤140 / <150k ✅ |
| Overview 12:00 | **95** | **28,546** | ≤140 / <150k ✅ |
| Angled | **96** | **28,548** | info |
| Street | **59** | **64,889** | ≤100 DC ✅ |

Large headroom vs M2/8GB gates; M03 still requires separate citizen LOD/culling.

## Tests

- `npm run test:all` — typecheck, lint, **182 unit + 7 e2e PASS**, build PASS @ handoff SHA
- Street portal: `tests/unit/wf02/streetPortalCamera.test.ts`
- Resolver parity: `tests/unit/world/worldResolver.test.ts`
- Determinism: `tests/integration/m02/determinism.test.ts`, `tests/integration/determinism.test.ts`

## Evidence

- Tag pattern: `review-evidence-wf02-r10-<sha7>`
- Shots: Overview dawn/noon, Angled, Street portal, civic/residential/commercial closeups, store/workshop, M02 home/store/workshop street + door scale, future lot, night, R9→R10→north-star compare strip
- 0 asset/network errors (capture manifest)

## Not authorized (explicit STOP)

- Phase D modular exterior asset-family import
- Generic box/building filler, fake future-lot buildings
- 240 m expansion, merge, M03
