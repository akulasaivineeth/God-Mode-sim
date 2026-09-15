# WF02 Build Notes

## Base

- Plan revision 5.1 at `122d68dbebff34fd2bd7f5909fd547eaa6728a23` (plan); implementation at branch HEAD
- Prior blocked: R4.1 @ `6dbd8b5` (WF02-003 visual gate)

## R5.1 architecture

1. **Warm atlas normalization** — offline repack of 14 Kenney facility GLBs (`scripts/wf02-r51-repack-atlas.mjs`); originals in `_archive/pre-r5/`
2. **`compositionVisibility.ts`** — preset-tier gating via `cameraView` (same path for gameplay + evidence)
3. **`NatureMassLayer.tsx`** — merged instanced Quaternius mass (district + periphery tiers)
4. **`OverviewCompositionLayer.tsx`** — orchestrator; ground tint reduced to 2 zones; terrain value bands

## R5.1 presentation changes

- **Atlas roles:** warm_residential, warm_commercial, civic_cream, farm_straw, warm_industrial
- **Nature mass:** 5 district + 4 periphery Quaternius (orchard/park read from Kenney grid + VegetationLayer baseline)
- **Terrain:** meadow/garden/farm/park vertex value regions in `TownLandscape.tsx`
- **Lighting:** warmer hemisphere ground `#b89868`
- **Ground tint:** 2 zones (residential, farm), 5.0 m cell stride

## Preserved

- `facilityPoints.ts`, simulation/**, LOCATIONS, M02 routes/entrances
- R2 `targetWidth`, 2.32 m presentation citizen, frozen Overview/Angled cameras

## Performance (measured live GL @ R5.1 build)

| Preset | Draw calls | Triangles |
|---|---:|---:|
| Overview 06:00 | 138 | 130,565 |
| Overview 12:00 | 141 | 130,901 |
| Angled | 128 | 131,292 |
| Street | 78 | 98,199 |

Gates: Overview ≤140 DC / ≤135k tris ✅ | Street ≤100 DC ✅

## Evidence hygiene

- Authoritative Overview: `01_wf02_overview_dawn.png`, `01b_wf02_overview_noon.png` only
- Stale `01_wf02_overview.png` deleted at capture start; regeneration fails if recreated
