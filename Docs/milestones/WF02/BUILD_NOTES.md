# WF02 Build Notes

## Base

- Approved plan revision 2 at `e322f5fcff24a4ea3656755703c21b36173cc297`

## Architecture

1. **`modelLayout.ts`** — pure layout from offline `modelLayoutManifest.json`
2. **`buildingPresentationAnchors.ts`** — facade/sign/extras from layout + rotation
3. **`ModelAsset.tsx`** — consumes `resolveUniformScale()` (no independent bounds recompute)

## Presentation transforms (render-only)

| Building | Offset (x,y,z) | rot Δ |
|---|---|---|
| house-2 | (0.35, 0, -0.25) | +0.06 |
| house-4 | (-0.2, 0, 0.3) | -0.04 |
| cafe | (0.4, 0, -0.15) | +0.05 |
| clinic | (-0.3, 0, 0.2) | -0.03 |
| apartment | (0.25, 0, 0.35) | +0.04 |
| utility | (-0.35, 0, -0.2) | -0.05 |
| workshop | (0, 0, 1.2) | 0 |

M02 trio centers unchanged; workshop offset moves presentation mesh north.

## Preserved

- `facilityPoints.ts`, simulation/**, LOCATIONS, M02 routes/entrances
- Authoritative building centers and road topology

## Performance (measured at build)

| Preset | Draw calls | Triangles |
|---|---:|---:|
| Overview | **137** | **149,154** |
| Street | **78** | **136,851** |
| Angled | 123 | 149,509 |

Gates: Overview ≤140, Street ≤100, triangles <150k preferred — **PASS**.

M03 headroom: ~3 Overview draw calls and ~850 triangles below preferred triangle gate for 20 shared citizens.
