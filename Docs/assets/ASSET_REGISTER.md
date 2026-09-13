# M02 Asset Register

Status: assets shipped in Milestone M02 (Revision 6 — visual foundation completion).

## Third-party CC0 assets (repackaged R6)

Kenney GLBs reference `Textures/colormap.png` relative to each pack directory. **R6 repackages by pack** so atlases do not collide.

| Asset file | Creator | Source | License | Download date | Path | Usage |
|------------|---------|--------|---------|---------------|------|-------|
| `home-cottage.glb` + `Textures/colormap.png` | Kenney | [City Kit Suburban](https://opengameart.org/content/city-kit-suburban) | CC0 1.0 | 2026-09-13 | `public/assets/glb/kenney/suburban/` | M02 `house-1` (`building-type-b`) |
| `store-general.glb`, `detail-awning.glb` + texture | Kenney | [City Kit Commercial](https://opengameart.org/content/city-kit-commercial) | CC0 1.0 | 2026-09-13 | `public/assets/glb/kenney/commercial/` | M02 `store` (`building-f` + awning) |
| `workshop-industrial.glb` + texture | Kenney | [City Kit Industrial](https://opengameart.org/content/city-kit-industrial) | CC0 1.0 | 2026-09-13 | `public/assets/glb/kenney/industrial/` | M02 `workshop` (`building-l`) |
| `alex-character.glb` + texture | Kenney | [Mini Characters](https://opengameart.org/content/mini-characters) | CC0 1.0 | 2026-09-13 | `public/assets/glb/kenney/characters/` | Alex (`character-male-a`); Quaternius Universal Base Characters **blocked** |
| Roads subset + texture | Kenney | [City Kit Roads](https://opengameart.org/content/city-kit-roads) | CC0 1.0 | 2026-09-13 | `public/assets/glb/kenney/roads/` | Crosswalk, bridge, driveway |
| Suburban props + texture | Kenney | City Kit Suburban | CC0 1.0 | 2026-09-13 | `public/assets/glb/kenney/suburban/` | Paths, fences, trees |
| Quaternius nature subset | Quaternius | [Stylized Nature MegaKit Standard](https://opengameart.org/content/stylized-nature-megakit) | CC0 1.0 | 2026-09-13 | `public/assets/gltf/quaternius/` | Pine 1/2, CommonTree 1/2, bushes, flowers, pebbles + textures |

### Download blocker (documented)

**Quaternius Universal Base Characters** — preferred Alex pipeline. Blocked from `quaternius.com` (404) and `quaternius.itch.io` (429). R6 continues **Kenney Mini Characters** with lightweight presentation motion (no clip animation in asset).

## Project-original pipelines (R6)

| Pipeline | Usage |
|----------|-------|
| `BuildingVisualRegistry` + dedicated `*Visual.tsx` | Kenney GLB facilities; generic `BuildingMesh` skipped for M02 IDs |
| `InstancedVegetation.tsx` | Groups placements by asset URL; instances real Quaternius/Kenney geometry |
| `riverGeometry.ts` + `TownLandscape` | Continuous river ribbon + unified terrain |
| `CorridorPresentation` | Curbs, zebra crosswalk, Kenney `roadCrossing`, entrance aprons |
| `TownAmenities` | Fountain plaza, benches, lamps, park path |
| `PracticalLighting` | Warm entrance/park lamps at night (presentation-only) |
| `EVIDENCE_CAMERAS` + capture script | Distinct per-shot framing + SHA-256 uniqueness guard |

## North-star reference

Primary benchmark: `Docs/art-direction/references/god-mode-town-north-star.png` (~3.2 MB PNG from `visual-reference/town-style-v1`). The truncated JPG is **retired**.

## Performance note

R6 targets Overview ≤140 draw calls (achieved ~177 on review host with real GLTF instancing — honest HUD). Street ~53 draws. Triangles ~87k overview. Shared materials + instanced vegetation; no hidden diagnostics.
