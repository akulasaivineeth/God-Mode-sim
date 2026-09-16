# WF02 — North-Star Scale & Aesthetic Calibration

## Summary

WF02 calibrates presentation scale, camera framing, and **town composition** toward the approved north-star reference — without changing simulation authority, worker determinism, or semantic M02 behavior.

## Status

**WAITING_FOR_CHATGPT_PLAN_APPROVAL (R10)** — Plan R9 implemented @ `f0d7207` but **BLOCKED** on visual gate (WF02-R9). Plan R10 posted for vocabulary + street proof. No implementation until `[GOD-MODE:CHATGPT-PLAN-DECISION] APPROVED_TO_BUILD`.

## Plans

| Revision | Document | State |
|---:|---|---|
| 9 | [`PLAN_R9.md`](PLAN_R9.md) | Implemented + BLOCKED @ `f0d7207` |
| **10** | [`PLAN_R10.md`](PLAN_R10.md) | **WAITING_FOR_CHATGPT_PLAN_APPROVAL** |

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
