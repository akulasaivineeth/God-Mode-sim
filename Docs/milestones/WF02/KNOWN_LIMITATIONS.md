# WF02 Known Limitations — R10 STOP

## In scope for this handoff

- **Hero neighborhood only** (~70×58 m, 7 buildings + 1 future lot) — not the full 240 m town
- **World Lab flag** — rollback to legacy layout requires code change (`WORLD_LAB_MODE = false`) and rebuild
- **Existing registered assets only** — Phase D modular exterior family **not imported**; Kenney sufficiency is **conditional** per vocabulary audit
- **Simulation coordinates** — M02 nav uses resolver output; full simulation-coordinate migration beyond the Phase 0 boundary is not implemented

## Out of scope (explicit STOP)

- Phase D modular asset-family import (requires separate plan approval)
- 240 m World Lab expansion
- M03 twenty-citizen population / LOD strategy
- Merge to `main`

## Visual risk

North-star family match is judged on **pixels**, not triangle/DC counts alone. R10 adds district vocabulary assembly (civic enclosure, commercial frontage, residential gardens, future-lot frame) on the R9 spatial reset. If the compare strip still fails the warm miniature-town gate, the Phase A audit documents a precise one-family gap proposal — **do not self-authorize Phase D**.
