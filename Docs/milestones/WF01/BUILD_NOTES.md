# WF01 Build Notes

## Base

- `main` at `c9cb2a8624c5712090f2e3d702982a33c1434519` (Foundation Hardening)

## Implementation highlights

1. Expanded `src/world/townLayout.ts` to 240 m geography with district anchors.
2. Added `RoadNetwork.tsx` + `InstancedRoadStraights.tsx` for Kenney road tiling.
3. Added `PrefabBuildings.tsx` + `buildingPrefabConfig.ts` for all facility categories.
4. Curated 12 additional Kenney GLBs from CC0 City Kit packs (documented in ASSET_REGISTER).
5. Preserved M02 facility coordinates and `FACILITY_POINTS` entrances.

## Revision 2 corrections (pre-Grok)

1. **Evidence publishing** — `capture-wf01-evidence.mjs` publishes GitHub release `review-evidence-wf01-builder-r2` with BEFORE/WF01/north-star compare panel.
2. **Asset instrumentation** — console/network listeners registered before `page.goto()`; fail-closed on asset errors.
3. **Road topology** — `roadTopology.ts` junction exclusions + dedicated pieces at all major joins; road graph connectivity fixes in `townLayout.ts`.
4. **Asset provenance** — full audit table in `ASSET_REGISTER.md`.
5. **M03 headroom** — `M03_HEADROOM.md`.

## Performance measurement

`npm run measure:render-budget` (2026-09-15):

| Preset | Draw calls | Triangles |
|--------|-----------|-----------|
| Overview | 116 | 146,971 |
| Home street | 55 | 133,461 |
| Store street | 63 | 135,923 |
| Workshop street | 54 | 135,629 |

Within WF01 targets (Overview ≤140, Street ≤100, triangles <150k).
