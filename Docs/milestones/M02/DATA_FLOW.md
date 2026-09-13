# M02 Data Flow

## Authoritative loop

```text
SimulationDriver (main thread)
  → STEP { count }
simulation.worker
  → stepWorldSimulation() × count
      → advance clock + toy (M00 regression path)
      → stepCitizens() — needs, movement, utility decisions
  → toRenderSnapshot(snapshot, selectedCitizenId)
  → STEP_COMPLETE { renderSnapshot }
UI
  → Scene renders citizen meshes from snapshot positions
  → CitizenInspector reads needs + inspectorTrace
```

## Selection

```text
UI click Alex
  → SELECT_CITIZEN { citizenId }
worker
  → INSPECTOR_UPDATED { renderSnapshot with selectedCitizenId + trace }
```

## Pathfinding

Authored `NAV_GRAPH` (immutable) ← `townLayout` roads/paths + `facilityPoints` entrances.

Citizen travel action stores `pathNodeIds`; each minute advances `traversedDistance` along the polyline.

## Boundary

Renderer never writes citizen state. Inspector displays worker-provided trace only.
