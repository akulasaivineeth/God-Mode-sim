# WF02 Build Notes

## Base

- Plan revision 2 at `e322f5fcff24a4ea3656755703c21b36173cc297` (scale plumbing)
- Plan revision 3 at `8be181cd244bb9817aae13200e01d4b3d3b5c886` (composition/art-direction correction)
- Plan revision 4.1 at `783755f705c28c6199fbb8c2b4caa8df05d5d15f` (plan); implementation handoff at branch HEAD

## Architecture

1. **`modelLayout.ts`** — pure layout from offline `modelLayoutManifest.json`
2. **`buildingPresentationAnchors.ts`** — facade/sign/extras from layout + rotation
3. **`OverviewCompositionLayer.tsx`** — R4.1 single orchestrator for district massing
4. **`districtMassing.ts`** + **`compositionMask.ts`** — declarative specs + road/water exclusions
5. **R3 submodules integrated:** `FutureLotPresentation`, `CommercialStreetLife`

## R4.1 composition additions

- **`DistrictGroundTint.tsx`** — clipped instanced ground overlays (5 zones, road/path/river mask)
- **`CanopyMassing.tsx`** — Kenney treeSmall orchard 4×5 + civic/residential treeLarge/treeSmall
- **`ResidentialHedges.tsx`** — Kenney fenceLow instanced hedges (≤48 segments)
- **`FrontageBands.tsx`** — commercial/residential shrub scatter + civic radial pavers
- **Phase A recovery:** periphery forest removed; legacy district Quaternius scatter relocated to Kenney massing
- **Palette:** `DistrictPalette.ts` ground/canopy roles; roof tint **not** used (Kenney GLB audit)
- **Terrain:** warmer meadow base `#5a7348`

## Presentation transforms (render-only)

Unchanged from R3 — see prior table. Workshop offset `[0.6, 0, 1.8]` + rot `-0.03`.

## Preserved

- `facilityPoints.ts`, simulation/**, LOCATIONS, M02 routes/entrances
- Authoritative building centers and road topology
- R2 category `targetWidth` values and 2.32 m presentation citizen

## Performance (measured at R4.1 build — live GL after frame settle)

| Preset | Draw calls | Triangles |
|---|---:|---:|
| Overview 06:00 | **135** | **94,253** |
| Overview 12:00 | **138** | **94,589** |
| Street | **76** | **83,323** |
| Angled | 124 | 94,908 |

Gates: Overview ≤140 ✅ | Street ≤100 ✅ | Overview <150k ✅

Headroom vs gates: ~2–5 Overview draw calls; ~55k triangles below 150k preferred gate.

**M03 note:** Triangle headroom is **not** 20-citizen skinned-mesh budget. M03 requires separate LOD/culling/impostor strategy per `Docs/milestones/WF01/M03_HEADROOM.md`.
