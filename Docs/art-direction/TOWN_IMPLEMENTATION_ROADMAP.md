# GOD MODE Town North-Star Implementation Roadmap

Status: product/art-direction roadmap addendum. This document does not replace milestone scope in the canonical build specification. It defines how the approved town visual target should become the running 3D world over successive milestones without turning M01 into an endless art pass.

## Product-owner north star

The approved target is a polished, stylized, expandable small-town diorama built for an initial population of 20 young adults. The town should already feel pleasant and functional on day one, while preserving visible undeveloped parcels for future homes, businesses, institutions, and generational growth.

The town should eventually include, at minimum:

- several distinct starter homes plus future residential lots;
- a market/general store and cafe/social venue;
- clinic/health center;
- dormant school / community education building;
- neutral Community Hall and town square;
- workshop/warehouse/light-industry area;
- farm/orchard/barn area;
- utility/water infrastructure;
- cemetery;
- park, riverside recreation, paths, bridge/dock where appropriate;
- coherent road hierarchy, intersections, sidewalks, crossings and pedestrian paths;
- river/water with attractive banks;
- nearby forest, open land, gentle elevation and scenic framing;
- vacant/buildable plots that visibly communicate future growth.

The visual language is a clean, beautiful, miniature-town / city-builder style: mostly efficient angular geometry, but strong proportions, architecture, material hierarchy, landscaping, lighting, and composition. It should not look like raw boxes placed on a flat plane.

## What is realistically achievable in the browser

A close 3D interpretation of the concept is achievable with React Three Fiber / Three.js on the M2 / 8 GB target if the implementation is modular and disciplined.

We should NOT attempt to reproduce the concept-art illustration pixel-for-pixel. The target is the same design language and overall emotional impression in a real-time, navigable 3D scene.

### Achievable V1 visual target

- 8-14 reusable building archetypes with several material/roof/facade variants;
- approximately 8-12 initial residential units/bed spaces suitable for 20 founders, including roommate/shared-house arrangements where simulation rules allow;
- visually distinct clinic, school/community education building, market, cafe, Community Hall, warehouse/workshop, farm structures and utility structures;
- modular roads, sidewalks, crossings, paths and lots;
- instanced trees/shrubs/fences/lamps/benches;
- terrain heightfield with clear but modest hills;
- river mesh with banks and simple water shader/material;
- park/town-square landscaping and several decorative props;
- empty parcels reserved for later construction;
- day/night lighting with restrained shadows and automatic high-speed visual simplification;
- overview / angled / street cameras that all remain readable.

This level should look intentionally designed and attractive, though concept art will still be richer than the live simulation because the game must animate citizens, expose interiors, run simulation logic and stay responsive.

## Recommended asset strategy

Do not hand-model every object in code.

Use three layers:

1. **Procedural/modular code** for terrain, roads, sidewalks, lots, zoning, paths and placement metadata.
2. **Reusable low-poly GLB assets** for building modules, props, vegetation and eventually citizens.
3. **Small project-authored custom pieces** only when an important landmark or gameplay object needs unique identity.

Preferred formats:

- GLB/glTF for 3D assets;
- small compressed textures or mostly vertex/material colors;
- one shared material family where possible;
- instancing for repeated vegetation/props;
- shared humanoid rig/animations later.

Any external pack must have a clear commercial-use license recorded in `Docs/assets/ASSET_REGISTER.md` before becoming a shipped dependency.

## Tooling recommendation

The current web stack remains appropriate. We do not need to abandon Three.js/R3F or migrate the game to Unity/Unreal merely for this art direction.

Useful supporting tools/assets may include:

- Blender for lightweight edits, combining modules, pivots, LODs and GLB export;
- Quaternius or similarly license-safe low-poly packs for modular props/vegetation/characters after review;
- Poly Haven / ambientCG only for specifically needed license-safe environment textures/HDRIs, kept small;
- glTF optimization tooling (gltf-transform / meshopt / Draco where measured useful);
- simple image/texture authoring only where flat colors/materials are insufficient.

Blender is optional for the Product Owner; Cursor/build automation can work with prepared assets. The runtime remains browser-local with no paid AI/runtime service.

## Milestone alignment

### M01 — World shell and visual foundation

M01 should establish:

- attractive terrain, river, forest and town composition;
- roads, sidewalks and paths;
- differentiated building shells;
- clear empty future lots;
- coherent materials/palette;
- readable day/night lighting;
- performant repeated geometry.

M01 does NOT need final interiors, citizens, cars, working economy, functional utilities or construction gameplay.

Once the shell is attractive and structurally ready, stop polishing M01 and advance.

### M02 — One citizen + first lived-in vertical slice

In addition to canonical M02 simulation requirements, visual implementation should prove one complete lived-in route:

Home -> sidewalk/path -> workplace/store -> return home.

Add one approved stylized humanoid prototype, core idle/walk/sit/action animations, path adherence, door/entrance points, and enough building/interior presentation for the one citizen to visibly use home/store/workplace.

Do not import 20 unique character models. Establish the shared rig/material/variation pipeline first.

### M03 — Twenty founders

Scale the shared character system to 20 unique citizens through efficient variation:

- body/height/face/hair/clothing palette variation;
- shared skeleton and animations;
- appropriate starter housing/roommates;
- visually readable movement through the same town.

This is the checkpoint where the town must convincingly feel inhabited.

### M04 — Functional amenities and household economy

Make existing visual amenities become economically meaningful rather than adding disconnected buildings. Market inventory, housing/rent, jobs, cafe/workplace and food flows should connect to the authored town locations.

### Later milestones

Construction, business ownership, property expansion and institution growth should reuse the vacant-lot/building-module system rather than spawning arbitrary geometry. Future buildings should emerge from simulation decisions/events at the milestones that own those systems.

## Starter-town capacity principle

The founding settlement should be sized for approximately 20 people, not for hundreds.

A reasonable initial visual mix is:

- 6-9 detached/small shared houses plus 1 small apartment/shared residence, depending on household assignment;
- market/general store;
- cafe/pub/social venue;
- clinic;
- dormant school / education building;
- Community Hall;
- workshop + warehouse/light industrial workplace;
- farm/orchard and barn/utility sheds;
- utility/water structure;
- park/town square;
- cemetery;
- multiple clearly visible future residential and commercial lots.

The exact resident-to-home allocation remains simulation data, not art-direction hard-coding.

## Visual acceptance standard

The live town is good enough to become the permanent foundation when all of the following are true:

- a first-time viewer can identify residential, civic, commercial, industrial and agricultural areas without debug labels;
- the overview has an obvious focal center and attractive natural framing;
- terrain and river are legible at normal camera positions;
- roads, sidewalks and paths look connected and intentional;
- building categories have distinct silhouettes and entrances;
- vegetation placement feels composed rather than uniformly scattered;
- empty lots clearly read as future growth space rather than missing content;
- day and night are both pleasant/readable;
- the scene is still responsive on the M2 / 8 GB target;
- the world remains compatible with later interiors, pathing, ownership and construction systems.

## Explicit non-goal

Do not chase static concept-art fidelity so aggressively that we compromise simulation architecture, performance, interiors, citizen visibility, deterministic behavior or milestone progression. The concept is the visual north star; the live, systemic God simulator is the product.