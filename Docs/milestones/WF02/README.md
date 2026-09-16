# WF02 — North-Star Scale & Aesthetic Calibration

## Summary

WF02 calibrates presentation scale, camera framing, and **town composition** toward the approved north-star reference — without changing simulation authority, worker determinism, or semantic M02 behavior.

## Status

**READY_FOR_REVIEW (R12)** — Plan R12 finished-building prototype implemented @ approved scope. Awaiting independent Grok review. Do not merge. Do not start M03. No neighborhood-wide rollout.

## Plans

| Revision | Document | State |
|---:|---|---|
| 10 | [`PLAN_R10.md`](PLAN_R10.md) | Implemented + FIX_REQUIRED @ `9c64b9c` |
| 11 | [`PLAN_R11.md`](PLAN_R11.md) | Implemented + FIX_REQUIRED @ `4658dd2` |
| **12** | [`PLAN_R12.md`](PLAN_R12.md) | **Implemented — READY_FOR_REVIEW** |

## R12 deliverables (this handoff)

| Phase | Deliverable |
|---|---|
| **0** | Same-pack Kenney expansion (+12 modules, 30 total) + `r12_modular_audit.json` |
| **1** | Authored civic/commercial/residential assemblies with multi-layer facade depth |
| **2** | Tests + presentation bounds audit (door bindings, Street portal) |
| **3** | R10 → R11 → R12 → north-star evidence + silhouette thumbnails |

## Rollback

Set `WORLD_LAB_MODULAR_PROTOTYPE = false` in `src/world/worldLabModularMode.ts` to restore R10 Kenney prefab presentation.
