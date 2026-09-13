# GOD MODE Asset Pipeline Plan

Status: supporting art-direction plan for the approved town north star. This document recommends reusable asset sources and tooling so the project does not hand-model every object from scratch.

## Principle

Keep the existing React Three Fiber / Three.js runtime. Use modular low-poly assets in GLB/glTF where they improve quality and iteration speed. The simulation, pathing, ownership, interiors and deterministic state remain project-authored systems; visual assets are presentation resources only.

## Preferred environment sources to evaluate

### Kenney — primary modular city baseline

Evaluate these CC0 kits first because they are simple, lightweight, consistent and easy to combine:

- City Kit (Suburban) — houses / suburban structures.
- City Kit (Roads) — roads, signs and street pieces.
- City Kit (Commercial) — commercial/city buildings.
- City Kit (Industrial) — warehouse / factory / utility structures.
- Building Kit — modular building pieces.

Do not import an entire pack blindly. Select only assets that match the GOD MODE palette and scale.

### Quaternius — visual variety and nature

Evaluate these CC0 packs for complementary assets:

- Stylized Nature MegaKit — trees, plants, rocks and environmental variety.
- Ultimate Buildings Pack / Buildings Pack — extra building families and palette variants.
- Modular Streets Pack — optional road/street pieces where Kenney or project-authored roads are insufficient.
- Downtown City MegaKit — only selected pieces if later denser commercial blocks need them; do not import the full kit into V1 without a measured need.

Quaternius character and animation packs should be evaluated separately at M02 for the shared humanoid pipeline.

## Tooling

- Blender: optional but recommended for one-time asset cleanup, pivots, scale normalization, material consolidation, simple edits, and GLB export.
- glTF Transform / meshopt: use after measurement for texture/mesh optimization and packaging.
- Project-authored placement metadata remains the source of truth for roads, lots, entrances, functional building points and future construction slots.

## Import rules

For every third-party asset brought into the game:

1. Record creator, source URL, license and download date in `Docs/assets/ASSET_REGISTER.md`.
2. Normalize world scale and origin/pivot.
3. Prefer shared materials and small texture atlases.
4. Remove unused meshes/materials/animations.
5. Convert to GLB/glTF where needed.
6. Measure draw calls, triangles and memory impact in the actual browser scene.
7. Keep collision/pathing metadata separate from decorative geometry.
8. Never let an imported asset dictate authoritative simulation behavior.

## Art-direction rule

Do not mix dozens of unrelated low-poly styles. A smaller set of coherent assets with project-authored palette/material adjustments is preferable to a visually inconsistent asset soup.

The target is the approved GOD MODE miniature-town north star, not the default look of any one asset pack.