# M02 Asset Register

Status: assets shipped in Milestone M02 (Revision 3 — visual quality pass).

| Asset / pipeline | Creator | Source | License | Download / authored date | Usage |
|------------------|---------|--------|---------|------------------------|-------|
| Procedural citizen mesh (`CitizenMesh.tsx`, `citizenPresentation.ts`) | GOD MODE project | Original authored code | Project original | 2026-09-13 (R1–R3) | Shared stylized humanoid: box-limb body, shoes, idle/walk/sit/work poses, path-facing travel, palette variation |
| M02 corridor polish (`M02CorridorPolish.tsx`) | GOD MODE project | Original authored code | Project original | 2026-09-13 (R3) | Home porch/fence/planters, store awning/sign/bench, workshop bay door/platform, crosswalks, curbs, grouped shrubs |
| Facility interaction spots (`FacilityInteractionSpots.tsx`) | GOD MODE project | Original authored code | Project original | 2026-09-13 (R2–R3) | Doorway thresholds + chair/counter/workbench props at home/store/workshop |
| Shared render materials (`sharedMaterials.ts`) | GOD MODE project | Original authored code | Project original | 2026-09-13 (R3) | Reused road/sidewalk/path/wood/metal materials for GPU batching |
| M01 town shell + terrain | GOD MODE project | `src/world/townLayout.ts` | Project original | M01 | Preserved topology; M02 adds corridor polish overlay + facility metadata |
| North-star reference JPEG | Product Owner / art direction | `visual-reference/town-style-v1` @ `e470a655` | Reference only (not shipped) | 2026-09-13 | Primary visual benchmark for M02 review alignment |
| Kenney / Quaternius packs | — | See `Docs/art-direction/ASSET_PIPELINE_PLAN.md` | CC0 (when imported) | Not imported in M02 | Evaluated; procedural slice chosen to stay within M02 scope and M2/8GB budget |

## M02 decision

Revisions 1–3 establish the **reusable humanoid pipeline** and **lived-in corridor presentation** with lightweight project-authored geometry. R3 adds facade identity (porch, awning, workshop bay), corridor landscaping, crosswalks/curbs, improved citizen proportions, shared materials for performance, and removes debug-style route rings. External CC0 kits remain approved for targeted import when a specific prop materially improves a later vertical slice — each import must be recorded here before merge.

## Performance note (browser HUD, Angled gameplay zoom)

Target remains M2 / 8 GB. R3 optimizations: terrain mesh 64 segments (was 96), shared road/sidewalk/path materials, 512px shadow maps, hidden M00 sim beacon from default view. One citizen + corridor props + M01 town shell.
