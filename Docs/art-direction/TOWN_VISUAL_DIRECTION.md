# GOD MODE Town Visual Direction

Status: canonical visual reference addendum for environment-facing milestones.

## Primary approved north star

The Product Owner's current primary visual target is:

`Docs/art-direction/references/god-mode-town-north-star.png`

**Cursor, Grok, and ChatGPT must use this image as the primary visual benchmark for environment-facing work.** It is not a pixel-perfect implementation contract; it defines the target design language, composition quality, amenity readability, landscaping quality, and overall emotional impression of the live town.

The approved north star shows an attractive, expandable starter settlement for roughly 20 founders: a compact civic/commercial center, several starter homes, future home lots, clinic, school, market, cafe, Community Hall, workshop/warehouse, farm/orchard/barn, water infrastructure, river/bridge/park, strong vegetation and terrain framing, coherent roads/sidewalks/crossings, and obvious room for later growth.

When a static concept-art detail would conflict with simulation architecture, performance, interiors, pathing, ownership, or milestone scope, preserve the systemic game requirement while matching the concept's design language as closely as practical.

## Secondary inspiration board

See `Docs/art-direction/references/town-visual-reference-board.webp`.

The board contains the six original user-supplied reference images combined into one temporary internal reference sheet. It is **secondary** to the approved north-star PNG above and exists to explain the visual lineage.

**Important:** Several source images on the secondary board contain Getty/Shutterstock watermarks. They are reference-only, not game assets. Do not copy logos/watermarks or reproduce an image exactly. Extract the design language. Remove that temporary board before any public release or asset-distribution step unless licensed replacements are obtained.

## Desired look

The town should feel like a polished, stylized miniature society rather than a prototype made from generic primitives. The target is not photorealism and not literal Minecraft. Geometry may stay efficient and mostly angular, but composition, proportion, palette, silhouette, materials, lighting, landscaping, and environmental detail should make the scene visually compelling from overview through street level.

### Overall art language

- Clean, inviting, highly readable miniature-town composition.
- Stylized low-poly / isometric-friendly forms with intentional proportions.
- Strong visual hierarchy between roads, sidewalks, paths, lots, buildings, water, vegetation, and terrain.
- Cohesive palette with enough contrast to distinguish functional zones without becoming toy-like or neon.
- Soft but directional lighting and readable shadows that create depth.
- Rich but performance-conscious landscaping and natural framing.
- Avoid razor-sharp placeholder edges, flat empty planes, identical box buildings, random scatter vegetation, and uniformly repeated assets.

### Starter-town composition

- The founding settlement is sized for about 20 people, not hundreds.
- Provide several distinct starter homes/shared residences while preserving obvious future residential and commercial lots.
- The civic/commercial center should be compact and readable rather than sprawling.
- Essential amenities should visually exist from day one even when their deeper simulation behavior belongs to later milestones.
- Empty lots must look intentional and attractive, communicating future growth rather than missing content.

### Buildings

- Major categories must be recognizable from silhouette and massing alone: homes, apartments/shared housing, market/cafe, clinic, school, workshop/warehouse, farm structures, community hall, utility building.
- Use varied rooflines, facade depth, entrances, awnings/canopies, porches, windows, trims, signage placeholders, and footprint shapes where appropriate.
- Residential buildings should have several coherent families rather than one repeated house primitive.
- Commercial/civic buildings should feel denser and more street-facing than detached homes.
- Keep geometry efficient; visual interest should come from smart shape language and reusable modules, not excessive polygons.

### Roads, sidewalks, and public realm

- Roads should read as a deliberate network with clear intersections and hierarchy.
- Sidewalks must be clearly visible at overview/angled/street cameras.
- Crossings, curbs or simple edge treatments should visually explain pedestrian space.
- Pedestrian paths should connect useful places and look intentional rather than decorative lines.
- Town square / park / civic areas should act as visual anchors.
- Roads and paths must remain compatible with later citizen pathing rather than being purely decorative.

### Terrain, river, forest, and vegetation

- Terrain elevation must be visible in ordinary screenshots without exaggerated mountains.
- The river must read as a real geographic feature from overview, not a tiny blue edge fragment.
- Water should have a distinct material/value from ground and include simple banks/edge treatment.
- Trees and shrubs should be grouped compositionally: street trees, park trees, residential greenery, and a clearly denser nearby forest.
- Avoid evenly spaced copy-paste vegetation.
- Town edges should transition naturally toward forest/farmland/open land.
- Nature should frame the settlement strongly, as in the approved north-star image, while leaving buildable space for future expansion.

### Camera readability

- Overview should instantly communicate the town's structure, amenities, vacant growth space, and surrounding geography.
- Angled view should showcase depth, terrain, building differentiation, landscaping, and public spaces.
- Street view should make roads, sidewalks, entrances, facade variety, vegetation, and scale feel believable.

### Performance

The M2 / 8 GB target remains binding. Prefer shared materials, instancing, reusable modular geometry, shared rigs/animations later, and sensible draw-call/triangle budgets. Visual polish should come from art direction and reusable systems, not brute-force asset weight.

## Review standard

A milestone is not visually complete merely because required objects exist. For production-facing environment work, reviewers should compare the actual running build to `god-mode-town-north-star.png` and ask: **Does this feel like the same family of beautiful, intentional, expandable miniature town while remaining a real-time systemic simulation?**
