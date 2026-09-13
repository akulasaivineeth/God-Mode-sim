# M02 Asset Register

Status: assets shipped in Milestone M02 (Revision 3).

| Asset / pipeline | Creator | Source | License | Download / authored date | Usage |
|------------------|---------|--------|---------|------------------------|-------|
| Procedural citizen mesh (`CitizenMesh.tsx`, `citizenPresentation.ts`) | GOD MODE project | Original authored code | Project original | 2026-09-13 (R1–R3) | Shared stylized humanoid: capsule limbs, idle/walk/sit/work poses, path-facing travel, palette variation |
| Facility interaction spots (`FacilityInteractionSpots.tsx`) | GOD MODE project | Original authored code | Project original | 2026-09-13 (R3) | Doorway thresholds + shared chair/counter/workbench props at home/store/workshop |
| Route markers (`RouteMarkers.tsx`) | GOD MODE project | Original authored code | Project original | 2026-09-13 (R1–R2) | Subtle entrance rings for M02 vertical slice |
| M01 town shell + terrain | GOD MODE project | `src/world/townLayout.ts` | Project original | M01 | Preserved topology; M02 adds facility entrance/presentation metadata |
| North-star reference JPEG | Product Owner / art direction | `visual-reference/town-style-v1` @ `8b8c606` | Reference only (not shipped) | 2026-09-13 | Primary visual benchmark for M02 review alignment |
| Kenney / Quaternius packs | — | See `Docs/art-direction/ASSET_PIPELINE_PLAN.md` | CC0 (when imported) | Not imported in M02 | Evaluated for later milestones; M02 proves procedural slice first |

## M02 decision

Revisions 1–3 establish the **reusable humanoid pipeline** and **lived-in route presentation** with lightweight project-authored geometry rather than importing third-party GLB packs. R3 completes the core **idle/walk/sit/work** presentation vocabulary and adds doorway/interaction props so home/store/workplace use is visible at gameplay zoom without VIS-003 roof-fade interiors. External CC0 kits remain approved for targeted import when a specific prop materially improves a later vertical slice — each import must be recorded here before merge.

## Performance note (browser HUD, Overview frustum)

Target remains M2 / 8 GB. M02 adds one citizen mesh, three facility prop groups, and three route markers; total draw calls stay in the low hundreds alongside the M01 town shell.
