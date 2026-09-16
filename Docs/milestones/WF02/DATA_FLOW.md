# WF02 Data Flow — R9 World Lab

## Authority chain

```
WorldDefinition (hero or legacy)
        ↓
worldResolver.ts  ← WORLD_LAB_MODE flag
        ↓
┌───────────────────┬────────────────────────────┐
│ simulation        │ rendering / presentation      │
│ locations.ts      │ cameraPresets.ts              │
│ facilityPoints.ts │ PrefabBuildings, RoadNetwork  │
│ pathfinding       │ WorldLabCompositionLayer      │
└───────────────────┴────────────────────────────┘
```

Simulation semantics (actions, needs, decisions) are unchanged. Coordinates and cameras are **resolved**, not hardcoded from the legacy 240 m skeleton.

## Phase 0 resolver outputs

| API | Consumer |
|---|---|
| `resolveActiveLayout()` | Town mesh, roads, vegetation bounds |
| `resolveEntrances()` | M02 routes, facility street cameras, citizen targets |
| `resolveNavGraph()` | `locations.ts` shortest-path graph |
| `resolveCameraPreset(view)` | `cameraPresets.ts`, evidence capture |
| `isWorldLabActive()` | Composition tier gates, r8 slice disable, player camera bounds |

## Phase 1 presentation path

`OverviewCompositionLayer` → `WorldLabCompositionLayer` when World Lab active:

- Civic plaza props + frame trees
- Residential hedges + commercial street life
- Empty farm/cemetery/grave modules (hero layout has none)

## Rollback

`WORLD_LAB_MODE = false` → resolver serves `LEGACY_WORLD_DEFINITION` → legacy cameras, 240 m layout, R4/R8 composition modules at prior coordinates.
