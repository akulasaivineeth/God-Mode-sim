# WF02 Build Notes — R9 Phase 0 + Phase 1

## Base

- Plan revision **9** @ `8f4d8dd` (approved `PHASE_0_AND_PHASE_1_HERO_NEIGHBORHOOD_ONLY`)
- Prior blocked: R4.1 @ `6dbd8b5` (WF02-003 — 3rd consecutive visual gate)

## Phase 0 — semantic world definition

1. **`src/world/types.ts`** — `WorldDefinition`, `SemanticFacilityId`, nav/entrance specs
2. **`src/world/resolver/worldResolver.ts`** — active layout, entrances, cameras, nav graph
3. **`src/world/townLayoutLegacy.ts`** — frozen legacy 240 m skeleton (`LEGACY_CANONICAL_TOWN`)
4. **`src/world/legacy/legacyTownDefinition.ts`** — legacy wrapped as `WorldDefinition`
5. **`src/world/worldLabMode.ts`** — `WORLD_LAB_MODE = true` (rollback flag)
6. **`src/simulation/model/locations.ts`** + **`src/world/facilityPoints.ts`** — resolver-backed (single coordinate authority for M02 nav)

## Phase 1 — hero neighborhood prototype

1. **`src/world/worldLab/heroNeighborhood.ts`** — compact civic/residential/commercial/future-lot layout (~70×58 m)
2. **`src/world/worldLab/roadTopologyWorldLab.ts`** — neighborhood junctions (no legacy bridge)
3. **`src/rendering/environment/WorldLabCompositionLayer.tsx`** — plaza props, frame trees, hedges, commercial/residential life
4. **`src/rendering/cameraPresets.ts`** — cameras derived from world definition (not legacy coordinates)
5. **`src/rendering/facilityStreetCamera.ts`** — home/store/workshop street presets from resolver entrances
6. **`src/rendering/environment/r8SliceMode.ts`** — disabled when World Lab active

## Preserved (simulation semantics)

- Action → location mapping, worker authority, seeded determinism
- Semantic IDs: home / store / work
- 2.32 m presentation / 1.8 m simulation citizen split
- Registered Kenney + Quaternius inventory only (no new asset family)
- Legacy 240 m layout available via `WORLD_LAB_MODE = false`

## Coordinate assumptions removed vs remaining

**Removed in World Lab mode**

- 240 m `CANONICAL_TOWN` coordinate skeleton as a presentation invariant
- Legacy Overview `[10,93,54]` / Angled `[68,53,37]` camera constants
- Full-town 14-facility scatter at historical x/z positions
- Legacy bridge + 240 m road spine as the active presentation topology
- `VisualTownLayout` presentation offsets for M02 trio
- Hardcoded legacy home-street camera preset
- R8 slice density mode on the legacy envelope

**Still remaining**

- Semantic facility roles and M02 nav graph structure (nodes/edges, not legacy coordinates)
- Resolver boundary: simulation reads coordinates through `worldResolver`, not ad-hoc literals
- R2 `targetWidth` / prefab manifest scale plumbing
- Legacy rollback path and parity tests against `LEGACY_CANONICAL_TOWN`

## Performance (measured live GL @ handoff SHA)

| Preset | Draw calls | Triangles | Gate |
|---|---:|---:|---|
| Overview 06:00 | **119** | **18,358** | ≤140 / <150k ✅ |
| Overview 12:00 | **116** | **18,022** | ≤140 / <150k ✅ |
| Angled | **108** | **17,676** | info |
| Street | **85** | **61,575** | ≤100 DC ✅ |

Large headroom vs M2/8GB gates; M03 still requires separate citizen LOD/culling.

## Tests

- `npm run test:all` — typecheck, lint, **175 unit + 7 e2e PASS**, build PASS @ handoff SHA
- Resolver parity: `tests/unit/world/worldResolver.test.ts`
- Determinism: `tests/integration/m02/determinism.test.ts`, `tests/integration/determinism.test.ts`

## Evidence

- Tag pattern: `review-evidence-wf02-r9-<sha7>`
- Shots: Overview dawn/noon, Angled, Street, civic/residential/commercial closeups, store/workshop, citizen scale streets, future lot, night, north-star compare strip
- 0 asset/network errors (capture manifest)
