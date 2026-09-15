# WF02 Build Notes

## Base

- Plan revision 6 @ `71f9c679ead7f007c3456964555187373ab1d314` (approved)
- Prior blocked: R5.1 @ `fa64055` (WF02-004 visual gate — 4th consecutive)

## R6 architecture — Mass Silhouette System (MSS)

1. **Phase A recovery** — removed `NatureMassLayer` Quaternius, `DistrictGroundTint`, `FrontageBands`; tier-gated `VegetationLayer` Quaternius off Overview/Angled
2. **`massSilhouetteBuilders.ts` + `massSilhouettePlacements.ts`** — deterministic KCC + CVP tables with road/path/river exclusions
3. **`CanopyMassing.tsx`** — tier-gated Kenney `treeSmall`/`treeLarge` instancing (1–2 DC)
4. **`CanopyVolumeLayer.tsx`** — ≤2 DC low-poly garden/field volume primitives (`gardenMound`, `fieldBand`)
5. **`compositionVisibility.ts`** — added `baselineVegetation` tier (zero Quaternius on Overview/Angled)
6. **Warm atlas** — frozen from R5.1 (no further repack)

## Mandatory hero silhouettes (non-empty)

| Hero | Batch | Min count |
|---|---|---:|
| Orchard farm-3 | `ORCHARD_BLOCK_KCC` + `ORCHARD_FIELD_BAND_CVP` | 40 + 20 |
| Park/river | `PARK_RIVER_ARC_KCC` + `PARK_PROMENADE_CVP` | 12 + 8 |
| Periphery frame | `PERIPHERY_FOREST_FRAME_KCC` | 40 |
| Civic colonnade | `CIVIC_COLONNADE_KCC` + `CIVIC_PLAZA_CVP` | 8 + 8 |
| Residential gardens | `RESIDENTIAL_GARDEN_CVP` + `RESIDENTIAL_STREET_TREES_KCC` | 32 + 8 |

## Preserved

- `facilityPoints.ts`, simulation/**, LOCATIONS, M02 routes/entrances
- R2 `targetWidth`, 2.32 m presentation citizen, frozen Overview/Angled cameras

## Performance (measured live GL @ R6 build)

| Preset | Draw calls | Triangles | Gate |
|---|---:|---:|---|
| Overview 06:00 | **117** | **45,536** | ≤135 DC ✅ (≥5 reserve vs 140) |
| Overview 12:00 | **120** | **45,872** | ≤135 DC ✅ |
| Angled | **110** | **47,132** | info |
| Street | **72–75** | **~80k** | ≤100 DC ✅ |

Low Overview tris vs R5.1 reflects Kenney-first instancing (42 tris/tree) replacing high-poly Quaternius scatter; visible mass increased while GPU cost dropped.

## Tests

- `npm run test:all` — **169 unit + 7 e2e PASS** @ implementation SHA

## Evidence

- Tag pattern: `review-evidence-wf02-r6-<sha7>`
- Compare: WF01 → R4.1 blocked → R5.1 blocked → R6 → north star
- 0 asset/network errors
