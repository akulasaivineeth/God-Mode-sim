# WF02 Data Flow

## Presentation bounds authority

```
modelLayoutManifest.json (offline GLB AABB)
        ↓
modelLayout.ts — resolveNormalizedLayout / resolveRotatedFootprint
        ↓
    ┌───────────────────┴────────────────────┐
    ↓                                        ↓
ModelAsset.tsx                    buildingPresentationAnchors.ts
(uniform scale)                   (signs, awnings, paths, fences)
        ↓                                        ↓
              PrefabBuildings.tsx (group + presentation offset)
```

## Citizen scale split

| Layer | Height | Owner |
|---|---:|---|
| Simulation / pathing | 1.8 m | `TARGET_CITIZEN_HEIGHT` |
| Visual mesh | 2.32 m | `PRESENTATION_CITIZEN_HEIGHT` in `CitizenVisual.tsx` |

Simulation coordinates and collision authority are unchanged.

## Material / lighting owners

- Ground/road/sidewalk/path colors: `sharedMaterials.ts`
- Day/night intensities: `DayNightLighting.tsx`
- Terrain carve / geography: `TownLandscape.tsx` (presentation only)
- Authoritative geography: `townLayout.ts` (coordinates only — not edited)
