# M02 Build Notes

## Revision 1

### Simulation

- Single citizen `citizen-alex` with assignments home/store/workplace.
- Needs decay per sim minute; reflex Layer-1 + utility Layer-2 planner.
- Waypoint graph from authored roads/sidewalks/paths + facility entrances.
- Walk speed 3.5 units/minute; actions have deterministic durations.
- `CITIZEN_ACTION_SELECTED` domain events carry utility traces.

### Rendering / UI

- `CitizenMesh` procedural humanoid with palette variation.
- `RouteMarkers` at M02 facilities.
- `CitizenInspector` panel with need bars + utility contributor breakdown.
- Worker `SELECT_CITIZEN` message; inspector reads worker snapshot only.

### Schema

- `SCHEMA_VERSION`: `m02.1`
- `WorldSnapshot.citizens[]` optional (absent in M00 regression snapshots)

### Assets

- Procedural citizen + route markers (see `Docs/assets/ASSET_REGISTER.md`)
- No third-party GLB packs imported in R1

### Tests added

- `tests/unit/navigation.test.ts`
- `tests/integration/m02/autonomous-citizen.test.ts`
- `tests/integration/m02/determinism.test.ts`
- E2E utility breakdown visibility

### M03 not started

No twenty-citizen generation, social systems, or economy.
