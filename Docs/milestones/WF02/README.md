# WF02 — North-Star Scale & Aesthetic Calibration

## Summary

WF02 calibrates presentation scale, camera framing, bounds-anchored building
dressing, and **overview-scale district composition** toward the approved north-star
reference — without changing simulation authority or WF01 geography.

## Status

**READY_FOR_REVIEW (R4.1)** — Plan 4.1 approved; implementation complete; awaiting Grok independent review.

## Key deliverables

- Category-tuned Kenney prefab `targetWidth` (R2 — frozen)
- Citizen visual height **2.32 m** (simulation body remains **1.8 m**)
- Shared `modelLayout.ts` + offline manifest + `buildingPresentationAnchors.ts`
- **R4.1 `OverviewCompositionLayer`** — Kenney orchard grid, civic frame, residential hedges, district ground tints, frontage bands
- R3 modules integrated: future lots, commercial street life, instanced curbs/farm rows
- Warmer daylight palette; roof tint **not** used (GLB audit)

## Evidence

Captured via `npm run capture:wf02-evidence` into `/opt/cursor/artifacts/wf02_evidence/`.

Release tag: `review-evidence-wf02-r41-builder` (at handoff SHA)
