# WF02 — North-Star Scale & Aesthetic Calibration

## Summary

WF02 calibrates presentation scale, camera framing, and **town composition** toward the approved north-star reference — without changing simulation authority, worker determinism, or semantic M02 behavior.

## Status

**WAITING_FOR_CHATGPT_PLAN_APPROVAL (R12)** — Plan R11 @ `4658dd2` received **FIX_REQUIRED** (WF02-R11-FINAL). Plan R12 posted; no implementation until approval. Do not merge. Do not start M03. No neighborhood-wide rollout.

## Plans

| Revision | Document | State |
|---:|---|---|
| 10 | [`PLAN_R10.md`](PLAN_R10.md) | Implemented + FIX_REQUIRED @ `9c64b9c` |
| 11 | [`PLAN_R11.md`](PLAN_R11.md) | Implemented + FIX_REQUIRED @ `4658dd2` |
| **12** | [`PLAN_R12.md`](PLAN_R12.md) | **WAITING_FOR_CHATGPT_PLAN_APPROVAL** |

## R11 outcome (blocked — preserved as rollback base)

| Phase | Deliverable |
|---|---|
| **0** | Curated Kenney Modular Buildings import (18 GLBs) + `r11_modular_audit.json` |
| **1** | Module manifest / assembly / bounds abstraction + rollback flag |
| **2** | 3 prototypes: civic enclosure edge, 3-bay commercial frontage, residential pair |
| **3** | R10 BEFORE → R11 AFTER → north-star evidence @ `4658dd2` |

**Lesson:** True modularity alone is not art direction — R12 addresses finished architectural form & facade depth.

## R12 plan deliverable (this handoff)

| Item | Artifact |
|---|---|
| Plan document | [`PLAN_R12.md`](PLAN_R12.md) |
| Facade depth audit | [`r12_facade_depth_audit_plan.json`](r12_facade_depth_audit_plan.json) |
| Audit script | `npm run audit:wf02-r12-facade-depth` |

## Rollback

Set `WORLD_LAB_MODULAR_PROTOTYPE = false` in `src/world/worldLabModularMode.ts` to restore R10 Kenney prefab presentation.
