# WF02 Build Notes

## Base

- Plan revision 2 at `e322f5fcff24a4ea3656755703c21b36173cc297` (scale plumbing)
- Plan revision 3 at `e3c1b3f1f373a07f1db43c2b95b33d30d5305f53` (composition/art-direction correction)

## Architecture

1. **`modelLayout.ts`** — pure layout from offline `modelLayoutManifest.json`
2. **`buildingPresentationAnchors.ts`** — facade/sign/extras from layout + rotation
3. **`ModelAsset.tsx`** — consumes `resolveUniformScale()` (no independent bounds recompute)
4. **R3 composition layers** — `FutureLotPresentation.tsx`, `CommercialStreetLife.tsx`, instanced curbs/farm rows

## Presentation transforms (render-only)

| Building | Offset (x,y,z) | rot Δ |
|---|---|---|
| house-2 | (0.35, 0, -0.25) | +0.06 |
| house-4 | (-0.2, 0, 0.3) | -0.04 |
| cafe | (0.4, 0, -0.15) | +0.05 |
| clinic | (-0.3, 0, 0.2) | -0.03 |
| apartment | (0.25, 0, 0.35) | +0.04 |
| utility | (-0.35, 0, -0.2) | -0.05 |
| workshop | (0.6, 0, 1.8) | -0.03 |

M02 trio centers unchanged; workshop offset moves presentation mesh north with separator bushes.

## R3 composition additions

- **Future lots:** paver pads, fence perimeters, corner stakes (`FutureLotPresentation.tsx`)
- **Commercial street life:** benches, lamps, aprons, store/workshop separator (`CommercialStreetLife.tsx`)
- **Farm/orchard:** 3×4 orchard grid, instanced field rows, farmhouse approach trees
- **River/park:** promenade paths, bench ring, expanded park scatter
- **Palette/lighting:** warmer terrain vertex colors, dawn floor 0.62, brighter sidewalks/paths
- **Civic camera:** `square` preset `[-22,18,24] → [-4,2,-8]`

## Preserved

- `facilityPoints.ts`, simulation/**, LOCATIONS, M02 routes/entrances
- Authoritative building centers and road topology
- R2 category `targetWidth` values and 2.32 m presentation citizen

## Performance (measured at R3 build)

| Preset | Draw calls | Triangles |
|---|---:|---:|
| Overview | **127** | **140,305** |
| Street | **71** | **130,341** |
| Angled | 115 | 141,163 |

Gates: Overview ≤140, Street ≤100, triangles <150k preferred — **PASS**.

M03 headroom: ~13 Overview draw calls and ~9,695 triangles below preferred triangle gate for 20 shared citizens.
