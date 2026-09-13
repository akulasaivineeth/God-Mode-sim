# M02 Asset Register

Status: assets shipped in Milestone M02 (Revision 5 — visual foundation rebuild).

## Third-party CC0 assets (imported R5)

| Asset file | Creator | Source | License | Download date | Path | Usage |
|------------|---------|--------|---------|---------------|------|-------|
| `home-cottage.glb` | Kenney | [City Kit Suburban](https://opengameart.org/content/city-kit-suburban) via OpenGameArt | CC0 1.0 | 2026-09-13 | `public/assets/glb/kenney/home-cottage.glb` | M02 `house-1` dedicated visual (`building-type-b`) |
| `store-general.glb` | Kenney | [City Kit Commercial](https://opengameart.org/content/city-kit-commercial) via OpenGameArt | CC0 1.0 | 2026-09-13 | `public/assets/glb/kenney/store-general.glb` | M02 `store` dedicated visual (`building-f`) |
| `workshop-industrial.glb` | Kenney | [City Kit Industrial](https://opengameart.org/content/city-kit-industrial) via OpenGameArt | CC0 1.0 | 2026-09-13 | `public/assets/glb/kenney/workshop-industrial.glb` | M02 `workshop` dedicated visual (`building-l`) |
| `alex-character.glb` | Kenney | [Mini Characters](https://opengameart.org/content/mini-characters) via OpenGameArt | CC0 1.0 | 2026-09-13 | `public/assets/glb/kenney/alex-character.glb` | Alex citizen (`character-male-a`); **Quaternius Universal Base Characters blocked** (itch.io 429, no OGA mirror) |
| Kenney roads subset | Kenney | [City Kit Roads](https://opengameart.org/content/city-kit-roads) via OpenGameArt | CC0 1.0 | 2026-09-13 | `public/assets/glb/kenney/roads/*.glb` | Crosswalk, bridge, driveway pieces |
| Kenney props | Kenney | City Kit Suburban | CC0 1.0 | 2026-09-13 | `public/assets/glb/kenney/{tree-*,fence-*,path-*,driveway-*}.glb` | Corridor landscaping props |
| Quaternius nature subset | Quaternius | [Stylized Nature MegaKit Standard](https://opengameart.org/content/stylized-nature-megakit) via OpenGameArt | CC0 1.0 | 2026-09-13 | `public/assets/gltf/quaternius/*` | Trees, bushes, flowers, rocks, ferns (10 models + shared textures) |

### Download blocker (documented)

**Quaternius Universal Base Characters** — preferred Alex pipeline per art direction. Download blocked from `quaternius.com` (404) and `quaternius.itch.io` (429 Too Many Requests) in Cloud Agent environment. No OpenGameArt mirror found. R5 uses **Kenney Mini Characters `character-male-a`** as the interim CC0 humanoid with documented blocker.

## Project-original pipelines (R5)

| Asset / pipeline | Creator | License | Usage |
|------------------|---------|---------|-------|
| `BuildingVisualRegistry.tsx` + `dedicatedBuildingIds.ts` | GOD MODE | Project original | Maps `house-1` / `store` / `workshop` to dedicated GLB visuals; skips generic `BuildingMesh` |
| `ModelAsset.tsx` | GOD MODE | Project original | Cached GLTF/GLB loader with scale normalization |
| `EnvironmentAssetRegistry.ts` | GOD MODE | Project original | Vegetation/road asset paths + deterministic placements |
| `CitizenVisual.tsx` | GOD MODE | Project original | Kenney character GLB + presentation pose mapping |
| `WorldSign.tsx` | GOD MODE | Project original | In-world signage (address, store, workshop) |
| `TownLandscape.tsx` | GOD MODE | Project original | Landscape skirt, river banks, bridge |
| `TownAmenities.tsx` | GOD MODE | Project original | Square fountain/benches, park path, farm rows |
| `VegetationLayer.tsx` | GOD MODE | Project original | Corridor + periphery vegetation from registries |
| `sharedMaterials.ts` | GOD MODE | Project original | Shared materials for Town paths/roads/generic shells |
| Generic `BuildingMesh` / `Town.tsx` | GOD MODE (M01+) | Project original | Non-M02 facilities remain procedural shells |
| North-star reference JPEG | Product Owner | Reference only | `Docs/art-direction/references/god-mode-town-north-star.jpg` |

## M02 decision

R5 replaces the decorate-the-box approach with a **visual foundation rebuild**: dedicated Kenney GLB buildings for M02 facilities, Quaternius nature props, Kenney character for Alex (with Quaternius character blocker documented), reusable registries, and landscape/amenity framing. Simulation IDs, coordinates, and pathing graph are unchanged.

## Performance note

Target M2 / 8 GB. R5 uses GLB reuse via `ModelAsset` cache, instanced trees/graves for bulk town trees, and sparse placed vegetation (~30 instances). Live draw-call and triangle metrics remain visible in the diagnostics HUD.
