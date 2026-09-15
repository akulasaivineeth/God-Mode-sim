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

## Revision 3 corrections (presentation pass)

1. **Daylight readability** — dawn curve floor in `DayNightLighting.tsx` so 06:00 sim start reads as daytime without breaking night cycle.
2. **River legibility** — inward-bent centerline, authored blue water material, reframed Overview/river cameras.
3. **District storytelling** — farm/orchard row articulation in `TownAmenities.tsx`; corridor vegetation repositioned for inter-district connectors (no duplicate instancing).
4. **Camera-controls e2e** — `maxDistance` raised to 136 so Overview preset is not orbit-clamped on reset.
5. **Evidence** — release `review-evidence-wf01-builder-r3` with R2→R3→north-star compare at genuine daytime.

## Performance measurement

`npm run measure:render-budget` (2026-09-15, R3):

| Preset | Draw calls | Triangles |
|--------|-----------|-----------|
| Overview | 136 | 151,851 |
| Home street | 56 | 132,973 |
| Store street | 63 | 135,175 |
| Workshop street | 54 | 135,636 |
| Angled (evidence) | ~136 | ~152,000 |

Within WF01 primary limits (Overview ≤140 DC, Street ≤100 DC). Soft triangle target 150k: +1.2% on same harness as R2 remeasure (151,893); presentation pass adds no duplicate vegetation draw groups.
