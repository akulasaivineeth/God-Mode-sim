# WF02 — North-Star Scale & Aesthetic Calibration

## Summary

WF02 calibrates presentation scale, camera framing, and **town composition** toward the approved north-star reference — without changing simulation authority, worker determinism, or semantic M02 behavior.

## Status

**WAITING_FOR_CHATGPT_PLAN_APPROVAL (R13)** — Plan R12 @ `ab4a8d2` received **FIX_REQUIRED** (WF02-R12). Plan R13 (finished architecture source strategy) posted; no implementation until approval. Do not merge. Do not start M03. No neighborhood-wide rollout.

## Plans

| Revision | Document | State |
|---:|---|---|
| 10 | [`PLAN_R10.md`](PLAN_R10.md) | Implemented + FIX_REQUIRED @ `9c64b9c` |
| 11 | [`PLAN_R11.md`](PLAN_R11.md) | Implemented + FIX_REQUIRED @ `4658dd2` |
| 12 | [`PLAN_R12.md`](PLAN_R12.md) | Implemented + FIX_REQUIRED @ `ab4a8d2` |
| **13** | [`PLAN_R13.md`](PLAN_R13.md) | **WAITING_FOR_CHATGPT_PLAN_APPROVAL** |

## R12 outcome (blocked — preserved as rollback base)

| Phase | Deliverable |
|---|---|
| **0** | +12 Kenney same-pack modules (30 total) |
| **1** | Authored gz-layer civic/commercial/residential assemblies |
| **2** | Tests + Street portal bounds |
| **3** | R10 → R11 → R12 → north-star evidence @ `ab4a8d2` |

**Lesson:** Modular cell assembly method caps finished form — visually indistinguishable from R11.

## R13 plan deliverable (this handoff)

| Item | Artifact |
|---|---|
| Plan document | [`PLAN_R13.md`](PLAN_R13.md) |
| Source strategy audit | [`r13_architecture_source_audit_plan.json`](r13_architecture_source_audit_plan.json) |
| Audit script | `npm run audit:wf02-r13-architecture-source` |
| **Recommendation** | **Path C** — bounded offline-authored prototype shells (CC0 Kenney kitbash) |

## Rollback

`WORLD_LAB_PROTOTYPE_SHELL=false` + `WORLD_LAB_MODULAR_PROTOTYPE=true` → R12 modular assemblies.
