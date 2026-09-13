# M02 Asset Register

Status: assets shipped in Milestone M02 (Revision 4 — corridor polish + material pipeline).

| Asset / pipeline | Creator | Source | License | Download / authored date | Usage |
|------------------|---------|--------|---------|------------------------|-------|
| Procedural citizen mesh (`CitizenMesh.tsx`, `citizenPresentation.ts`) | GOD MODE project | Original authored code | Project original | 2026-09-13 (R1–R4) | Shared stylized humanoid: box-limb body, shoes, idle/walk/sit/work poses, path-facing travel, selection diamond, palette variation |
| M02 corridor polish (`M02CorridorPolish.tsx`) | GOD MODE project | Original authored code | Project original | 2026-09-13 (R3–R4) | Distinct home/store/workshop facades, porch/bay/sawtooth silhouettes, crosswalks, curbs, instanced shrubs/fence/pavers |
| Instanced scatter (`InstancedScatter.tsx`) | GOD MODE project | Original authored code | Project original | 2026-09-13 (R4) | Shared instanced geometry for repeated corridor props (shrubs, fence posts, crosswalk stripes, entrance pavers) |
| Facility interaction spots (`FacilityInteractionSpots.tsx`) | GOD MODE project | Original authored code | Project original | 2026-09-13 (R2–R4) | Doorway thresholds + chair/counter/workbench props at visible outdoor presentation anchors |
| Shared render materials (`sharedMaterials.ts`) | GOD MODE project | Original authored code | Project original | 2026-09-13 (R4) | **Imported by** `Town.tsx`, `M02CorridorPolish.tsx`, `FacilityInteractionSpots.tsx`, `CitizenMesh.tsx` for road/sidewalk/path/water/facade/wood/metal/foliage reuse |
| M01 town shell + terrain | GOD MODE project | `src/world/townLayout.ts` | Project original | M01 | Preserved topology; M02 facility shells use shared materials + corridor overlay |
| North-star reference JPEG | Product Owner / art direction | `visual-reference/town-style-v1` @ `e470a655` | Reference only (not shipped) | 2026-09-13 | Primary visual benchmark for M02 review alignment |
| Kenney / Quaternius packs | — | See `Docs/art-direction/ASSET_PIPELINE_PLAN.md` | CC0 (when imported) | Not imported in M02 | Evaluated; procedural slice chosen to stay within M02 scope and M2/8GB budget |

## M02 decision

Revisions 1–4 establish the **reusable humanoid pipeline** and **lived-in corridor presentation** with lightweight project-authored geometry. R4 wires `sharedMaterials.ts` into production imports, adds `InstancedScatter` for repeated corridor props, strengthens home/workshop silhouettes, moves citizen render positions to visible presentation anchors (simulation interior unchanged), and removes obsolete route-marker wiring. External CC0 kits remain approved for targeted import when a specific prop materially improves a later vertical slice — each import must be recorded here before merge.

## Performance note (browser HUD, Angled gameplay zoom)

Target remains M2 / 8 GB. R4 optimizations: shared materials wired into Town/corridor/spots/citizen, instanced shrubs/fence/crosswalk/pavers, terrain 64 segments, 512px shadow maps, tree/grave materials shared. Live draw-call and triangle counts remain visible in the diagnostics HUD.
