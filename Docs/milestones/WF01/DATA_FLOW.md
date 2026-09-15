# WF01 Data Flow

## Authored layout (immutable)

`src/world/townLayout.ts` → `CANONICAL_TOWN`

- Buildings, roads, paths, zones, river, trees, terrain config
- Worker and renderer both read this; it does not change at runtime

## Presentation pipeline

```
CANONICAL_TOWN
  ├─ TownLandscape (terrain mesh + river ribbon)
  ├─ RoadNetwork (instanced Kenney road-straight + intersection/bridge pieces)
  ├─ Town (zone overlays, pedestrian paths, graves)
  ├─ CorridorPresentation (curbs, zebra crossings, driveways)
  ├─ TownAmenities (square fountain, park ring, farm rows)
  ├─ PrefabBuildings (Kenney GLB per facility ID)
  ├─ VegetationLayer (instanced Quaternius/Kenney nature)
  └─ CitizenVisual (M02 Alex — unchanged)
```

## Simulation invariants

- `FACILITY_POINTS` in `src/world/facilityPoints.ts` unchanged for M02 trio
- Worker pathfinding references facility entrances, not visual meshes
- Rendering never writes simulation state (ARCH-002)
