# WF02 Known Limitations — R9 Phase 1 STOP

## In scope for this handoff

- **Hero neighborhood only** (~70×58 m, 7 buildings + 1 future lot) — not the full 240 m town
- **World Lab flag** — rollback to legacy layout requires code change (`WORLD_LAB_MODE = false`) and rebuild
- **Existing asset silhouettes only** — no new architectural asset family; convincing full-town density may require Phase 2 asset-gap work
- **Simulation coordinates** — M02 nav uses resolver output; full simulation-coordinate migration beyond the Phase 0 boundary is Phase 3 (not implemented)

## Out of scope (explicit STOP)

- Phase 2 modular asset-family import
- Phase 3 simulation-wide coordinate migration
- 240 m World Lab expansion
- M03 twenty-citizen population / LOD strategy
- Merge to `main`

## Visual risk

North-star family match is judged on **pixels**, not triangle/DC counts alone. R9 replaces the coordinate skeleton; silhouette/palette gaps in the registered Kenney inventory may still block final WF02 PASS until Phase 2 if closeups cannot read as a warm miniature town.
