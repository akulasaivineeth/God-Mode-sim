# WF01 — Riverside World Foundation

## Summary

WF01 expands the Riverside starter town from a ~100 m demo board to a ~240 m
authored landscape with clear districts, Kenney prefab-backed buildings, an
instanced Kenney road network, expanded river/park/farm/periphery framing, and
8 intentional future residential lots.

M02 one-citizen simulation behavior is unchanged. Facility IDs `house-1`,
`store`, and `workshop` remain at their established coordinates.

## Status

**Revision 3 — READY_FOR_REVIEW** (presentation pass after Grok WF01-002 BLOCKED)

## Key deliverables

- `groundExtent: 120` (~240 m plane)
- All major visible facilities use Kenney GLB prefabs (no dominant `BuildingMesh`)
- Kenney road modules replace dominant `FlatStrip` road presentation
- Riverside Park, expanded river ribbon, bridge, farm edge, periphery forest
- Performance: Overview ~127 draw calls / ~148k triangles (M2/8GB target met)

## Evidence

Captured via `npm run capture:wf01-evidence` into `/opt/cursor/artifacts/wf01_evidence/`.
