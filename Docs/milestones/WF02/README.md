# WF02 — North-Star Scale & Aesthetic Calibration

## Summary

WF02 calibrates presentation scale, camera framing, and **town composition** toward the approved north-star reference — without changing simulation authority, worker determinism, or semantic M02 behavior.

## Status

**READY_FOR_REVIEW (R9 Phase 0 + Phase 1 hero neighborhood)** — Plan R9 approved `APPROVED_TO_BUILD` scope `PHASE_0_AND_PHASE_1_HERO_NEIGHBORHOOD_ONLY`; implementation complete @ handoff SHA; awaiting Grok independent review. **STOP** before Phase 2 asset import, 240 m expansion, merge, or M03.

## R9 deliverables (this handoff)

| Phase | Deliverable |
|---|---|
| **0** | `WorldDefinition` API, `worldResolver.ts`, `WORLD_LAB_MODE` flag, legacy rollback (`LEGACY_CANONICAL_TOWN`), resolver parity tests |
| **1** | ~70×58 m hero neighborhood (7 buildings + 1 future lot), re-authored cameras, `WorldLabCompositionLayer`, compact road topology |

## Evidence

- Capture: `npm run capture:wf02-r9-neighborhood` → `/opt/cursor/artifacts/wf02_r9_neighborhood/`
- Manifest: `Docs/milestones/WF02/r9_neighborhood_manifest.json`
- Compare strip: `Docs/milestones/WF02/compare_r8_r9_northstar.png`

## Rollback

Set `WORLD_LAB_MODE = false` in `src/world/worldLabMode.ts` to restore the legacy 240 m skeleton without touching simulation code paths.
