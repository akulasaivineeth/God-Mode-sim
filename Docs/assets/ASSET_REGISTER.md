# M02 Asset Register

Status: assets shipped in Milestone M02 (Revision 1).

| Asset / pipeline | Creator | Source | License | Download / authored date | Usage |
|------------------|---------|--------|---------|------------------------|-------|
| Procedural citizen mesh (`CitizenMesh.tsx`) | GOD MODE project | Original authored code | Project original | 2026-09-13 | Shared stylized humanoid pipeline: capsule body, sphere head, palette variation |
| Route markers (`RouteMarkers.tsx`) | GOD MODE project | Original authored code | Project original | 2026-09-13 | Home/store/workplace entrance rings for M02 vertical slice |
| M01 town shell + terrain | GOD MODE project | `src/world/townLayout.ts` | Project original | M01 | Preserved topology; M02 adds facility entrance metadata only |
| Kenney / Quaternius packs | — | See `Docs/art-direction/ASSET_PIPELINE_PLAN.md` | CC0 (when imported) | Not imported in M02 R1 | Evaluated for later milestones; M02 R1 proves procedural slice first to stay within scope |

## M02 decision

Revision 1 establishes the **reusable humanoid pipeline** and **lived-in route presentation** with lightweight project-authored geometry rather than importing third-party GLB packs in this revision. This keeps draw calls predictable while meeting the M02 gate. External CC0 kits remain approved for targeted import when a specific prop/building module materially improves a later vertical slice — each import must be recorded here before merge.

## Performance note (browser HUD, Overview frustum)

Target remains M2 / 8 GB. M02 adds one citizen mesh plus three route markers; total draw calls stay in the low hundreds alongside the M01 town shell.
