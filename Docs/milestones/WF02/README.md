# WF02 — North-Star Scale & Aesthetic Calibration

## Summary

WF02 calibrates presentation scale, camera framing, and **town composition** toward the approved north-star reference — without changing simulation authority, worker determinism, or semantic M02 behavior.

## Status

**WAITING_FOR_CHATGPT_PLAN_APPROVAL (R11)** — Plan R10 implemented @ `9c64b9c` but **FIX_REQUIRED** on visual gate (WF02-R10-FINAL). ChatGPT triggers R10 Phase-D condition: Kenney-only vocabulary ceiling hit. Plan R11 posted for modular architectural prototype. **No import or implementation until plan approval.**

## Plans

| Revision | Document | State |
|---:|---|---|
| 9 | [`PLAN_R9.md`](PLAN_R9.md) | Implemented + BLOCKED @ `f0d7207` |
| 10 | [`PLAN_R10.md`](PLAN_R10.md) | Implemented + FIX_REQUIRED @ `9c64b9c` |
| **11** | [`PLAN_R11.md`](PLAN_R11.md) | **WAITING_FOR_CHATGPT_PLAN_APPROVAL** |

## R10 deliverables (blocked handoff @ `9c64b9c`)

| Phase | Deliverable |
|---|---|
| **A** | Vocabulary audit + Kenney conditional sufficiency verdict |
| **B** | Facade-bound street portal camera (wall-jam fixed) |
| **C** | District composition via registered Kenney/Quaternius only |

## R11 proposal (plan only)

| Phase | Deliverable |
|---|---|
| **0–2** | Import **Kenney Modular Buildings 2.1** (one family); prototype 3 structures only |
| **Reject** | KayKit City Builder Bits — pre-assembled prefabs, not facade modules |

## Evidence

- R10 manifest: [`r10_neighborhood_manifest.json`](r10_neighborhood_manifest.json)
- R10 compare: [`compare_r9_r10_northstar.png`](compare_r9_r10_northstar.png)
- R11 plan audit: [`r11_candidate_audit_plan.json`](r11_candidate_audit_plan.json)

## Rollback

Set `WORLD_LAB_MODE = false` in `src/world/worldLabMode.ts` to restore legacy 240 m skeleton. R11 adds `WORLD_LAB_MODULAR_PROTOTYPE` flag (plan) for rollback to R10 presentation.
