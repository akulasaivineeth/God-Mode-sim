# WF02 — North-Star Scale & Aesthetic Calibration

## Summary

WF02 calibrates presentation scale, camera framing, and **town composition** toward the approved north-star reference — without changing simulation authority, worker determinism, or semantic M02 behavior.

## Status

**READY_FOR_REVIEW (R10)** — Plan R10 Phases A–C implemented @ `8923425`. Awaiting independent Grok review. Do not merge. Do not start M03.

## Plans

| Revision | Document | State |
|---:|---|---|
| 9 | [`PLAN_R9.md`](PLAN_R9.md) | Implemented + BLOCKED @ `f0d7207` |
| **10** | [`PLAN_R10.md`](PLAN_R10.md) | **Implemented @ `8923425` — READY_FOR_REVIEW** |

## R10 deliverables (this handoff)

| Phase | Deliverable |
|---|---|
| **A** | Vocabulary audit script + `r10_vocabulary_audit.json` (Kenney conditional sufficiency verdict) |
| **B** | `presentationBounds.ts`, `streetPortalCamera.ts`, facade-bound M02 street presets with collision/occlusion fallback |
| **C** | District composition: civic enclosure, commercial frontage, residential gardens, future-lot frame, vegetation frame via `WorldLabCompositionLayer` + `InstancedGltfPlacements` |

## R9 foundation (preserved)

| Phase | Deliverable |
|---|---|
| **0** | `WorldDefinition` API, `worldResolver.ts`, `WORLD_LAB_MODE` flag, legacy rollback |
| **1** | ~70×58 m hero neighborhood (7 buildings + 1 future lot), compact road topology |

## Evidence

- Capture: `npm run capture:wf02-r10-neighborhood` → `/opt/cursor/artifacts/wf02_r10_neighborhood/`
- Manifest: [`r10_neighborhood_manifest.json`](r10_neighborhood_manifest.json)
- Compare strip: [`compare_r9_r10_northstar.png`](compare_r9_r10_northstar.png)
- Vocabulary audit: [`r10_vocabulary_audit.json`](r10_vocabulary_audit.json)

## Rollback

Set `WORLD_LAB_MODE = false` in `src/world/worldLabMode.ts` to restore the legacy 240 m skeleton without touching simulation code paths.
