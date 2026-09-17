# WF02 Build Notes — R11 Modular Prototype

## Base

- Plan revision **11** @ `780e93c` (approved `THREE_STRUCTURE_PROTOTYPE_ONLY`)
- Prior blocked: R10 @ `9c64b9c` (WF02-R10-FINAL FIX_REQUIRED)
- Handoff SHA: **`7f968784a3dcaba4f13c6c3c27033f249443c787`**

## Phase 0 — Kenney Modular Buildings import

1. **`scripts/wf02-r11-modular-import.mjs`** — curated 18 GLBs + warm atlas
2. **`Docs/milestones/WF02/r11_modular_audit.json`** — measured grid **1.0 m × 0.625 m story × 1.0 m**
3. **`npm run import:wf02-r11-modular`**

## Phase 1 — module abstraction

1. **`src/rendering/modular/modularModuleRegistry.ts`** — measured module defs
2. **`src/rendering/modular/modularLayout.ts`** — grid → world instances
3. **`src/rendering/modular/modularPresentationBounds.ts`** — assembly AABB for street portal
4. **`src/world/worldLabModularMode.ts`** — `WORLD_LAB_MODULAR_PROTOTYPE` rollback flag

## Phase 2 — three prototypes

1. **Civic enclosure edge** — `civicEnclosureAssembly.ts` (28 m colonnade @ square south)
2. **Commercial 3-bay frontage** — `commercialFrontageAssembly.ts` (34 m, height rhythm, store/work doors)
3. **Residential pair** — `residentialPairAssembly.ts` (8 vs 11 story modules + slanted vs gable roof)

Rendering via **`ModularAssemblyLayer`** + **`InstancedGltfPlacements`**. Kenney prefabs suppressed for replaced buildings only.

## Preserved

- R9 `WorldDefinition` / resolver / hero neighborhood semantic layout
- R10 street portal camera (extends modular presentation bounds)
- Simulation entrances: home **(16, −6.4)**, store **(−14, 10.8)**, work **(4, 10.8)** unchanged
- Kenney roads/props, Quaternius nature, R10 district layers (except R10 commercial scatter when modular active)

## Performance (measured live GL @ handoff SHA)

| Preset | Draw calls | Triangles | Gate |
|---|---:|---:|---|
| Overview 06:00 | **89** | **42,372** | ≤140 / <150k ✅ |
| Overview 12:00 | **86** | **42,036** | ≤140 / <150k ✅ |
| Street | **62** | **81,385** | ≤100 ✅ |

## Tests

- `npm run test:all` — **189 unit + 7 e2e PASS**, build PASS @ handoff SHA
- `tests/unit/wf02/modularAssembly.test.ts` — grid, door binding, portal bounds

## Evidence

- Manifest: `Docs/milestones/WF02/r11_prototype_manifest.json`
- Compare: `Docs/milestones/WF02/compare_r10_r11_northstar.png`
- Tag: `review-evidence-wf02-r11-7f96878`

## Rollback

Set `WORLD_LAB_MODULAR_PROTOTYPE = false` in `src/world/worldLabModularMode.ts` → R10 presentation restored.

## Not authorized (explicit STOP)

- Neighborhood-wide modular replacement
- 240 m expansion, merge, M03
