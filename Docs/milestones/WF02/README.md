# WF02 — North-Star Scale & Aesthetic Calibration

## Summary

WF02 calibrates presentation scale, camera framing, and **town composition** toward the approved north-star reference — without changing simulation authority, worker determinism, or semantic M02 behavior.

## Status

**READY_FOR_REVIEW (R11)** — Plan R11 three-structure modular prototype implemented. Awaiting independent Grok review. Do not merge. Do not start M03. No neighborhood-wide rollout.

## Plans

| Revision | Document | State |
|---:|---|---|
| 10 | [`PLAN_R10.md`](PLAN_R10.md) | Implemented + FIX_REQUIRED @ `9c64b9c` |
| **11** | [`PLAN_R11.md`](PLAN_R11.md) | **Implemented — READY_FOR_REVIEW** |

## R11 deliverables (this handoff)

| Phase | Deliverable |
|---|---|
| **0** | Curated Kenney Modular Buildings import (18 GLBs) + `r11_modular_audit.json` |
| **1** | Module manifest / assembly / bounds abstraction + rollback flag |
| **2** | 3 prototypes: civic enclosure edge, 3-bay commercial frontage, residential pair |
| **3** | R10 BEFORE → R11 AFTER → north-star evidence |

## Rollback

Set `WORLD_LAB_MODULAR_PROTOTYPE = false` in `src/world/worldLabModularMode.ts` to restore R10 Kenney prefab presentation.
