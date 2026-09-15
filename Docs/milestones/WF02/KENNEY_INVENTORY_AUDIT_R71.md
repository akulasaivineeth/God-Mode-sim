# WF02 R7.1 Kenney Inventory Audit (Phase 0a)

**Generated:** Phase 0 @ `local`  
**Scope:** On-disk `public/assets/glb/kenney/**` (excluding `_archive`) vs `EnvironmentAssetRegistry.ts`  
**Purpose:** Asset-vocabulary decision for North-Star Composition Reset — no imports in Phase 0

---

## Summary

| Metric | Count |
|---|---:|
| On-disk Kenney GLBs (active) | 29 |
| Registered in `KENNEY_ASSETS` | 29 |
| Unregistered on-disk | 0 |
| Registered but missing on-disk | 0 |
| In `modelLayoutManifest.json` | 22 |

**Phase 0 conclusion:** All **29** active on-disk Kenney GLBs are registered; **0** missing paths; **7** road/tree props not in `modelLayoutManifest.json` (bounds-only manifest scope). No suburban detail props (bench/fountain/lamp) on disk — north-star civic gaps require curated single-file import in Phase 2+ if approved.

---

## Full on-disk inventory

| Local path | Pack | License | Registered | Manifest | Meshes | Materials | Tris | DC est. |
|---|---|---|:---:|:---:|---:|---:|---:|---:|
| `/assets/glb/kenney/characters/alex-character.glb` | Mini Characters | CC0 1.0 | ✅ | ✅ | 2 | 1 | **723** | 1 |
| `/assets/glb/kenney/commercial/cafe-bistro.glb` | City Kit Commercial 2.1 | CC0 1.0 | ✅ | ✅ | 1 | 1 | **1276** | 1 |
| `/assets/glb/kenney/commercial/clinic.glb` | City Kit Commercial 2.1 | CC0 1.0 | ✅ | ✅ | 1 | 1 | **1100** | 1 |
| `/assets/glb/kenney/commercial/community-hall.glb` | City Kit Commercial 2.1 | CC0 1.0 | ✅ | ✅ | 1 | 1 | **1509** | 1 |
| `/assets/glb/kenney/commercial/detail-awning.glb` | City Kit Commercial 2.1 | CC0 1.0 | ✅ | ✅ | 1 | 1 | **40** | 1 |
| `/assets/glb/kenney/commercial/detail-parasol-a.glb` | City Kit Commercial 2.1 | CC0 1.0 | ✅ | ✅ | 1 | 1 | **96** | 1 |
| `/assets/glb/kenney/commercial/school.glb` | City Kit Commercial 2.1 | CC0 1.0 | ✅ | ✅ | 1 | 1 | **1512** | 1 |
| `/assets/glb/kenney/commercial/store-general.glb` | City Kit Commercial 2.1 | CC0 1.0 | ✅ | ✅ | 1 | 1 | **1794** | 1 |
| `/assets/glb/kenney/industrial/utility-station.glb` | City Kit Industrial 2.0 | CC0 1.0 | ✅ | ✅ | 2 | 2 | **1928** | 1 |
| `/assets/glb/kenney/industrial/warehouse.glb` | City Kit Industrial 2.0 | CC0 1.0 | ✅ | ✅ | 2 | 2 | **2046** | 1 |
| `/assets/glb/kenney/industrial/workshop-industrial.glb` | City Kit Industrial 2.0 | CC0 1.0 | ✅ | ✅ | 2 | 2 | **1896** | 1 |
| `/assets/glb/kenney/roads/road-bend.glb` | City Kit Roads 2.1 | CC0 1.0 | ✅ | — | 1 | 1 | **260** | 1 |
| `/assets/glb/kenney/roads/road-bridge.glb` | City Kit Roads 2.1 | CC0 1.0 | ✅ | — | 1 | 1 | **248** | 1 |
| `/assets/glb/kenney/roads/road-crossing.glb` | City Kit Roads 2.1 | CC0 1.0 | ✅ | — | 1 | 1 | **104** | 1 |
| `/assets/glb/kenney/roads/road-curve-pavement.glb` | City Kit Roads 2.1 | CC0 1.0 | ✅ | — | 1 | 1 | **220** | 1 |
| `/assets/glb/kenney/roads/road-driveway-double.glb` | City Kit Roads 2.1 | CC0 1.0 | ✅ | ✅ | 1 | 1 | **72** | 1 |
| `/assets/glb/kenney/roads/road-straight.glb` | City Kit Roads 2.1 | CC0 1.0 | ✅ | — | 1 | 1 | **44** | 1 |
| `/assets/glb/kenney/suburban/apartment-block.glb` | City Kit Suburban 2.0 | CC0 1.0 | ✅ | ✅ | 1 | 1 | **1731** | 1 |
| `/assets/glb/kenney/suburban/driveway-short.glb` | City Kit Suburban 2.0 | CC0 1.0 | ✅ | ✅ | 1 | 1 | **12** | 1 |
| `/assets/glb/kenney/suburban/farmhouse.glb` | City Kit Suburban 2.0 | CC0 1.0 | ✅ | ✅ | 1 | 1 | **1067** | 1 |
| `/assets/glb/kenney/suburban/fence-low.glb` | City Kit Suburban 2.0 | CC0 1.0 | ✅ | ✅ | 1 | 1 | **180** | 1 |
| `/assets/glb/kenney/suburban/home-cottage.glb` | City Kit Suburban 2.0 | CC0 1.0 | ✅ | ✅ | 1 | 1 | **1748** | 1 |
| `/assets/glb/kenney/suburban/home-type-a.glb` | City Kit Suburban 2.0 | CC0 1.0 | ✅ | ✅ | 1 | 1 | **1174** | 1 |
| `/assets/glb/kenney/suburban/home-type-c.glb` | City Kit Suburban 2.0 | CC0 1.0 | ✅ | ✅ | 1 | 1 | **1196** | 1 |
| `/assets/glb/kenney/suburban/home-type-d.glb` | City Kit Suburban 2.0 | CC0 1.0 | ✅ | ✅ | 1 | 1 | **1757** | 1 |
| `/assets/glb/kenney/suburban/path-long.glb` | City Kit Suburban 2.0 | CC0 1.0 | ✅ | ✅ | 1 | 1 | **12** | 1 |
| `/assets/glb/kenney/suburban/path-short.glb` | City Kit Suburban 2.0 | CC0 1.0 | ✅ | ✅ | 1 | 1 | **12** | 1 |
| `/assets/glb/kenney/suburban/tree-large.glb` | City Kit Suburban 2.0 | CC0 1.0 | ✅ | — | 1 | 1 | **42** | 1 |
| `/assets/glb/kenney/suburban/tree-small.glb` | City Kit Suburban 2.0 | CC0 1.0 | ✅ | — | 1 | 1 | **42** | 1 |

---

## Unregistered on-disk assets

_None — all active on-disk Kenney GLBs are registered._

## Registered paths missing on-disk

_None._

## North-star gap candidates (NOT on disk — import requires ChatGPT approval)

These Kenney CC0 originals are **not present** in the repo. Phase 0 prototype may **mock** silhouettes in composited pixels; import deferred to Phase 2+ with exact provenance row.

| Kenney original | Pack | Proposed bounded use | Est. tris | Est. DC @ Overview |
|---|---|---|---:|---:|
| `detail-bench.glb` | suburban | Civic plaza / park seating silhouette | 24 | 1 (instanced) |
| `detail-fountain.glb` | suburban | Square center civic anchor | 80 | 1 (instanced) |
| `lamp-post.glb` | suburban | Commercial frontage rhythm (instanced) | 36 | 1 (instanced) |
| `path-round.glb` | suburban | Plaza/promenade edge (presentation-only) | 12 | 1 (instanced) |
| `bush-large.glb` | suburban | Residential garden band accent | 48 | 1 (instanced) |

---

## Registered prop/building triangle reference (measured)

| Asset | Tris | Notes |
|---|---:|---|
| `tree-small.glb` | **42** | registered |
| `tree-large.glb` | **42** | registered |
| `fence-low.glb` | **180** | registered |
| `detail-awning.glb` | **40** | registered |
| `detail-parasol-a.glb` | **96** | registered |

---

## Phase 0 asset decision

| Decision | Choice |
|---|---|
| Phase 0 import | **None** — zero new files |
| Prototype props | Mock bench/fountain/lamp silhouettes in composited pixels only |
| Phase 2+ (if approved) | Max 3 single-file Kenney CC0 imports from table above; each row in `ASSET_REGISTER.md` before use |

**Legal:** All on-disk assets Kenney CC0 1.0 per `Docs/assets/ASSET_REGISTER.md`.
