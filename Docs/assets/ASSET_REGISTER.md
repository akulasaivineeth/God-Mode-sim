# Asset Register

Status: M02 visual foundation + WF01 Riverside World Foundation curated imports (Revision 2 audit).

Kenney GLBs reference `Textures/colormap.png` relative to each pack directory. **Repackaged per-pack** so atlases do not collide. No mesh edits; scale normalization via `ModelAsset.targetWidth` at placement time.

## WF02 R5.1 warm atlas derivatives

Offline hue normalization from approved Kenney pack `colormap.png` sources (512×512 PNG). Original GLBs archived at `public/assets/glb/kenney/_archive/pre-r5/`. Geometry/UVs unchanged; GLB JSON texture URI patched only.

| Derived texture | Source pack | Role | Facilities |
|---|---|---|---|
| `suburban/Textures/colormap_warm_residential.png` | Suburban colormap | warm_residential | house-1–4, apartment |
| `suburban/Textures/colormap_farm_straw.png` | Suburban colormap | farm_straw | farmhouse |
| `commercial/Textures/colormap_warm_commercial.png` | Commercial colormap | warm_commercial | store, cafe, clinic |
| `commercial/Textures/colormap_civic_cream.png` | Commercial colormap | civic_cream | community-hall, school |
| `industrial/Textures/colormap_warm_industrial.png` | Industrial colormap | warm_industrial | workshop, warehouse, utility |

Script: `npm run repack:wf02-atlas` (`scripts/wf02-r51-repack-atlas.mjs`).

## WF01 curated imports — full provenance

| Local renamed path | Original Kenney identifier | Pack | Source URL | License | Download | Modifications |
|--------------------|---------------------------|------|------------|---------|----------|---------------|
| `public/assets/glb/kenney/suburban/home-type-a.glb` | `building-type-a.glb` | City Kit Suburban 2.0 | https://kenney.nl/assets/city-kit-suburban | CC0 1.0 | 2026-09-15 | Renamed only; `targetWidth` 7.5 m for `house-2` |
| `public/assets/glb/kenney/suburban/home-type-c.glb` | `building-type-c.glb` | City Kit Suburban 2.0 | https://kenney.nl/assets/city-kit-suburban | CC0 1.0 | 2026-09-15 | Renamed only; `targetWidth` 7.5 m for `house-3` |
| `public/assets/glb/kenney/suburban/home-type-d.glb` | `building-type-d.glb` | City Kit Suburban 2.0 | https://kenney.nl/assets/city-kit-suburban | CC0 1.0 | 2026-09-15 | Renamed only; `targetWidth` 7.8 m for `house-4` |
| `public/assets/glb/kenney/suburban/apartment-block.glb` | `building-type-e.glb` | City Kit Suburban 2.0 | https://kenney.nl/assets/city-kit-suburban | CC0 1.0 | 2026-09-15 | Renamed only; `targetWidth` 11.5 m |
| `public/assets/glb/kenney/suburban/farmhouse.glb` | `building-type-g.glb` | City Kit Suburban 2.0 | https://kenney.nl/assets/city-kit-suburban | CC0 1.0 | 2026-09-15 | Renamed only; `targetWidth` 8.5 m |
| `public/assets/glb/kenney/commercial/cafe-bistro.glb` | `building-b.glb` | City Kit Commercial 2.1 | https://kenney.nl/assets/city-kit-commercial | CC0 1.0 | 2026-09-15 | Renamed only; `targetWidth` 8.5 m + `detail-parasol-a` |
| `public/assets/glb/kenney/commercial/clinic.glb` | `building-d.glb` | City Kit Commercial 2.1 | https://kenney.nl/assets/city-kit-commercial | CC0 1.0 | 2026-09-15 | Renamed only; `targetWidth` 9.5 m |
| `public/assets/glb/kenney/commercial/community-hall.glb` | `building-e.glb` | City Kit Commercial 2.1 | https://kenney.nl/assets/city-kit-commercial | CC0 1.0 | 2026-09-15 | Renamed only; `targetWidth` 11.5 m |
| `public/assets/glb/kenney/commercial/school.glb` | `building-h.glb` | City Kit Commercial 2.1 | https://kenney.nl/assets/city-kit-commercial | CC0 1.0 | 2026-09-15 | Renamed only; `targetWidth` 12.5 m |
| `public/assets/glb/kenney/commercial/detail-parasol-a.glb` | `detail-parasol-a.glb` | City Kit Commercial 2.1 | https://kenney.nl/assets/city-kit-commercial | CC0 1.0 | 2026-09-15 | Unmodified; cafe prop |
| `public/assets/glb/kenney/industrial/warehouse.glb` | `building-a.glb` | City Kit Industrial 2.0 | https://kenney.nl/assets/city-kit-industrial | CC0 1.0 | 2026-09-15 | Renamed only; `targetWidth` 13.5 m |
| `public/assets/glb/kenney/industrial/utility-station.glb` | `building-c.glb` | City Kit Industrial 2.0 | https://kenney.nl/assets/city-kit-industrial | CC0 1.0 | 2026-09-15 | Renamed only; `targetWidth` 9.5 m |

## M02 baseline assets (unchanged)

| Local path | Original identifier | Pack | Source | License | Download | Usage |
|------------|--------------------|------|--------|---------|----------|-------|
| `suburban/home-cottage.glb` | `building-type-b.glb` | City Kit Suburban | https://kenney.nl/assets/city-kit-suburban | CC0 1.0 | 2026-09-13 | M02 `house-1` |
| `commercial/store-general.glb` | `building-f.glb` | City Kit Commercial | https://kenney.nl/assets/city-kit-commercial | CC0 1.0 | 2026-09-13 | M02 `store` |
| `commercial/detail-awning.glb` | `detail-awning.glb` | City Kit Commercial | https://kenney.nl/assets/city-kit-commercial | CC0 1.0 | 2026-09-13 | Store awning |
| `industrial/workshop-industrial.glb` | `building-l.glb` | City Kit Industrial | https://kenney.nl/assets/city-kit-industrial | CC0 1.0 | 2026-09-13 | M02 `workshop` |
| `characters/alex-character.glb` | `character-male-a` | Mini Characters | https://kenney.nl/assets/mini-characters | CC0 1.0 | 2026-09-13 | Alex citizen rig (32 clips) |
| `roads/road-straight.glb` | `road-straight.glb` | City Kit Roads 2.1 | https://kenney.nl/assets/city-kit-roads | CC0 1.0 | 2026-09-13 | Instanced spine |
| `roads/road-crossing.glb` | `road-crossing.glb` | City Kit Roads 2.1 | https://kenney.nl/assets/city-kit-roads | CC0 1.0 | 2026-09-13 | Centre intersection |
| `roads/road-bridge.glb` | `road-bridge.glb` | City Kit Roads 2.1 | https://kenney.nl/assets/city-kit-roads | CC0 1.0 | 2026-09-13 | River crossing |
| `roads/road-bend.glb` | `road-bend.glb` | City Kit Roads 2.1 | https://kenney.nl/assets/city-kit-roads | CC0 1.0 | 2026-09-13 | Residential/industrial bends |
| `roads/road-curve-pavement.glb` | `road-curve-pavement.glb` | City Kit Roads 2.1 | https://kenney.nl/assets/city-kit-roads | CC0 1.0 | 2026-09-13 | T-junction transitions |
| `roads/road-driveway-double.glb` | `road-driveway-double.glb` | City Kit Roads 2.1 | https://kenney.nl/assets/city-kit-roads | CC0 1.0 | 2026-09-13 | Facility aprons |
| Suburban props | various | City Kit Suburban | https://kenney.nl/assets/city-kit-suburban | CC0 1.0 | 2026-09-13 | Paths, fences, trees |
| `gltf/quaternius/*` | Stylized Nature MegaKit | Quaternius | https://opengameart.org/content/stylized-nature-megakit | CC0 1.0 | 2026-09-13 | Instanced vegetation |

## Character animation (R7)

Kenney Mini Characters `alex-character.glb` — 32 skeletal clips via `AnimationMixer` in `CitizenVisual`.

## North-star reference

`Docs/art-direction/references/god-mode-town-north-star.png`

## Performance note (WF01 R2)

Overview **127** draw calls / **140,305** triangles (WF02 R3 measured). See `Docs/milestones/WF01/M03_HEADROOM.md` for M03 citizen scaling estimate.
