/**
 * Canonical handcrafted town shell — WORLD-001.
 *
 * Plain English: This is the authored geography of the starting town — where the
 * buildings, roads, park, square, river, farm, cemetery, and vacant plots sit.
 * It is IMMUTABLE authored content (like a 3D asset), not dynamic simulation
 * state. The renderer reads it directly to draw geometry; the worker references
 * it by id. Nothing here changes at runtime in M01 (ADR-006).
 *
 * Coordinates use the Three.js convention: X and Z are the ground plane, Y is
 * up. One unit ≈ one metre. The town is centred on the origin where the two
 * main roads cross.
 *
 * The facility set intentionally covers the spec §3.2 day-one requirements:
 * housing, grocery/general store, clinic, school, cafe/social venue,
 * workshop/warehouse, farm, park, town square, utility area, cemetery, vacant
 * plots, plus roads, sidewalks, pedestrian paths, trees, a nearby forest,
 * modest terrain elevation, and a river.
 *
 * Note on government (canonical §22): the starting town has NO mature local
 * government or bureaucracy. There is therefore deliberately no Town Hall or
 * government building. A neutral shared `community` hall exists as a physical
 * gathering place only — it confers no political authority.
 */

export type BuildingType =
  | 'community'
  | 'house'
  | 'apartment'
  | 'store'
  | 'clinic'
  | 'school'
  | 'cafe'
  | 'workshop'
  | 'warehouse'
  | 'utility'
  | 'farmhouse';

export interface Vec2 {
  x: number;
  z: number;
}

export interface Building {
  id: string;
  type: BuildingType;
  label: string;
  /** Centre of the footprint on the ground plane. */
  position: Vec2;
  /** Footprint width (X), depth (Z), and wall height (Y). */
  size: { width: number; depth: number; height: number };
  wallColor: string;
  roofColor: string;
}

export interface RoadSegment {
  id: string;
  from: Vec2;
  to: Vec2;
  width: number;
}

export interface AreaRect {
  id: string;
  label: string;
  center: Vec2;
  width: number;
  depth: number;
  color: string;
}

export type RiverPoint = Vec2;

export interface TreeInstance {
  position: Vec2;
  scale: number;
}

export interface GraveInstance {
  position: Vec2;
}

export interface Forest {
  id: string;
  label: string;
  area: AreaRect;
  trees: readonly TreeInstance[];
}

/**
 * Deterministic terrain heightfield config (WORLD-001, spec §3.2 "modest terrain
 * elevation"). The settled town core stays flat so buildings, roads, sidewalks,
 * and paths sit level; gentle hills rise toward the periphery where the nearby
 * forest sits. Purely authored presentation data — no physics, no simulation
 * authority (ARCH-002).
 */
export interface TerrainConfig {
  /** Radius (in world units from origin, per-axis) that stays perfectly flat. */
  flatRadius: number;
  /** Distance over which flat blends up into full hills. */
  blend: number;
  /** Maximum hill height at the periphery. */
  maxHeight: number;
}

export interface TownLayout {
  id: string;
  name: string;
  /** Half-size of the square ground plane (full plane is 2 × groundExtent). */
  groundExtent: number;
  groundColor: string;
  terrain: TerrainConfig;
  buildings: readonly Building[];
  roads: readonly RoadSegment[];
  sidewalks: readonly RoadSegment[];
  paths: readonly RoadSegment[];
  park: AreaRect;
  square: AreaRect;
  farmPlots: readonly AreaRect[];
  vacantPlots: readonly AreaRect[];
  cemetery: AreaRect;
  river: {
    points: readonly RiverPoint[];
    width: number;
    color: string;
    /** Wider riverbank strip drawn beneath the water for readability. */
    bankWidth: number;
    bankColor: string;
  };
  trees: readonly TreeInstance[];
  forest: Forest;
  graves: readonly GraveInstance[];
}

/** Low-poly building silhouette archetypes (WORLD-001 visual differentiation). */
export type RoofStyle = 'gable' | 'hip' | 'flat';

export interface BuildingArchetype {
  roof: RoofStyle;
  /** Storefront awning over the entrance. */
  canopy: boolean;
  /** Protruding entry volume (civic buildings). */
  entry: boolean;
  /** Rooftop tank/tower (utility). */
  tower: boolean;
  windowColor: string;
  accentColor: string;
}

/**
 * A small reusable set of archetypes so major facilities read differently at
 * gameplay zoom without importing any heavyweight asset pack. Same fictional
 * modern-town language, differentiated by roof style + light add-ons.
 */
export const BUILDING_ARCHETYPES: Record<BuildingType, BuildingArchetype> = {
  house: { roof: 'gable', canopy: false, entry: false, tower: false, windowColor: '#bcd3e6', accentColor: '#7a4d3a' },
  apartment: { roof: 'flat', canopy: false, entry: true, tower: false, windowColor: '#cfe0ee', accentColor: '#556170' },
  store: { roof: 'flat', canopy: true, entry: false, tower: false, windowColor: '#dfe7c8', accentColor: '#b5573a' },
  cafe: { roof: 'gable', canopy: true, entry: false, tower: false, windowColor: '#f0dcae', accentColor: '#6e5238' },
  clinic: { roof: 'hip', canopy: false, entry: true, tower: false, windowColor: '#e8f0f4', accentColor: '#3f8f86' },
  school: { roof: 'hip', canopy: false, entry: true, tower: false, windowColor: '#dfe7ef', accentColor: '#8a6d3a' },
  community: { roof: 'hip', canopy: false, entry: true, tower: false, windowColor: '#e6ddc7', accentColor: '#6b7f8c' },
  workshop: { roof: 'gable', canopy: false, entry: false, tower: false, windowColor: '#d8cbb0', accentColor: '#5f5647' },
  warehouse: { roof: 'gable', canopy: false, entry: false, tower: false, windowColor: '#c3b9a3', accentColor: '#5f5647' },
  utility: { roof: 'flat', canopy: false, entry: false, tower: true, windowColor: '#aab2b8', accentColor: '#5b6169' },
  farmhouse: { roof: 'gable', canopy: false, entry: false, tower: false, windowColor: '#e6d6a8', accentColor: '#8f6b3f' },
};

export const TERRAIN: TerrainConfig = {
  flatRadius: 34,
  blend: 15,
  maxHeight: 7,
};

/**
 * WORLD-001 — deterministic ground height at a world (x, z). Returns 0 in the
 * flat settled core. Hills are concentrated to the NORTH and WEST (where the
 * nearby forest sits) so they read clearly as a silhouette, while the EASTERN
 * river valley is kept low so the river never runs uphill. Pure function of its
 * inputs (only trigonometry, never randomness), so the town and the renderer
 * agree on terrain and it is safe to assert in tests.
 */
export function terrainHeightAt(x: number, z: number): number {
  const north = Math.max(0, -z - TERRAIN.flatRadius);
  const west = Math.max(0, -x - TERRAIN.flatRadius);
  let reach = Math.min(1, Math.max(north, west) / TERRAIN.blend);
  if (reach <= 0) {
    return 0;
  }
  // Keep the eastern river valley flat so the river reads as water, not a slope.
  if (x > 22) {
    reach *= Math.max(0, 1 - (x - 22) / 12);
  }
  if (reach <= 0) {
    return 0;
  }
  const undulation = 0.5 * (Math.sin(x * 0.13) * Math.cos(z * 0.11) + Math.sin((x + z) * 0.05));
  return reach * TERRAIN.maxHeight * (0.7 + 0.3 * undulation);
}

/**
 * All authored trees (town + forest) combined — the single source the renderer
 * uses to build shared/instanced tree geometry (one draw call per part instead
 * of one per tree).
 */
export function collectAllTrees(): TreeInstance[] {
  return [...CANONICAL_TOWN.trees, ...CANONICAL_TOWN.forest.trees];
}

const WALL = {
  civic: '#c7b9a1',
  house: '#d8cbb6',
  apartment: '#b9c2cc',
  commercial: '#cbb7a6',
  utility: '#9aa3ab',
  farm: '#c9b48c',
} as const;

const ROOF = {
  civic: '#6b7f8c',
  house: '#8a5a44',
  apartment: '#556170',
  commercial: '#7a6551',
  utility: '#5b6169',
  farm: '#8f6b3f',
} as const;

const buildings: readonly Building[] = [
  // NW quadrant — shared community building (NOT a government/town hall; the
  // canonical town has no mature government on Day 1, spec §22).
  {
    id: 'community-hall',
    type: 'community',
    label: 'Community Hall',
    position: { x: -11, z: -11 },
    size: { width: 9, depth: 9, height: 8 },
    wallColor: WALL.civic,
    roofColor: ROOF.civic,
  },
  {
    id: 'clinic',
    type: 'clinic',
    label: 'Clinic',
    position: { x: -25, z: -9 },
    size: { width: 8, depth: 6, height: 5 },
    wallColor: '#e3e7ea',
    roofColor: '#8fa0ab',
  },
  {
    id: 'school',
    type: 'school',
    label: 'School',
    position: { x: -14, z: -26 },
    size: { width: 12, depth: 7, height: 5 },
    wallColor: WALL.civic,
    roofColor: ROOF.civic,
  },
  // NE quadrant — residential
  {
    id: 'house-1',
    type: 'house',
    label: 'House 1',
    position: { x: 11, z: -10 },
    size: { width: 5, depth: 5, height: 4 },
    wallColor: WALL.house,
    roofColor: ROOF.house,
  },
  {
    id: 'house-2',
    type: 'house',
    label: 'House 2',
    position: { x: 19, z: -10 },
    size: { width: 5, depth: 5, height: 4 },
    wallColor: '#cdbfa6',
    roofColor: '#7a4d3a',
  },
  {
    id: 'house-3',
    type: 'house',
    label: 'House 3',
    position: { x: 11, z: -20 },
    size: { width: 5, depth: 5, height: 4 },
    wallColor: '#e0d3bd',
    roofColor: '#96634a',
  },
  {
    id: 'house-4',
    type: 'house',
    label: 'House 4',
    position: { x: 19, z: -20 },
    size: { width: 5, depth: 5, height: 4 },
    wallColor: WALL.house,
    roofColor: ROOF.house,
  },
  {
    id: 'apartment',
    type: 'apartment',
    label: 'Apartments',
    position: { x: 29, z: -16 },
    size: { width: 9, depth: 9, height: 12 },
    wallColor: WALL.apartment,
    roofColor: ROOF.apartment,
  },
  // SW quadrant — commercial
  {
    id: 'store',
    type: 'store',
    label: 'General Store',
    position: { x: -11, z: 11 },
    size: { width: 9, depth: 7, height: 5 },
    wallColor: '#d7c39c',
    roofColor: '#7a6551',
  },
  {
    id: 'cafe',
    type: 'cafe',
    label: 'Cafe',
    position: { x: -22, z: 10 },
    size: { width: 6, depth: 5, height: 4 },
    wallColor: '#d9b98f',
    roofColor: '#6e5238',
  },
  {
    id: 'workshop',
    type: 'workshop',
    label: 'Workshop',
    position: { x: -11, z: 23 },
    size: { width: 7, depth: 6, height: 5 },
    wallColor: WALL.commercial,
    roofColor: ROOF.commercial,
  },
  {
    id: 'warehouse',
    type: 'warehouse',
    label: 'Warehouse',
    position: { x: -25, z: 23 },
    size: { width: 11, depth: 8, height: 7 },
    wallColor: '#b9ad97',
    roofColor: '#5f5647',
  },
  {
    id: 'utility',
    type: 'utility',
    label: 'Utility Station',
    position: { x: -33, z: 15 },
    size: { width: 5, depth: 5, height: 4 },
    wallColor: WALL.utility,
    roofColor: ROOF.utility,
  },
  // SE quadrant — farmhouse near the fields
  {
    id: 'farmhouse',
    type: 'farmhouse',
    label: 'Farmhouse',
    position: { x: 9, z: 30 },
    size: { width: 6, depth: 5, height: 4 },
    wallColor: WALL.farm,
    roofColor: ROOF.farm,
  },
];

const ROAD_WIDTH = 6;
const roads: readonly RoadSegment[] = [
  {
    id: 'road-main-ew',
    from: { x: -40, z: 0 },
    to: { x: 40, z: 0 },
    width: ROAD_WIDTH,
  },
  {
    id: 'road-main-ns',
    from: { x: 0, z: -40 },
    to: { x: 0, z: 40 },
    width: ROAD_WIDTH,
  },
  {
    id: 'road-north',
    from: { x: -30, z: -18 },
    to: { x: 30, z: -18 },
    width: 4,
  },
  {
    id: 'road-south',
    from: { x: -30, z: 18 },
    to: { x: 30, z: 18 },
    width: 4,
  },
];

/** Deterministic tree placement — authored rows, no randomness. */
function buildTrees(): readonly TreeInstance[] {
  const trees: TreeInstance[] = [];
  // Avenue trees along the main east-west road.
  for (let x = -36; x <= 36; x += 8) {
    if (Math.abs(x) < 5) continue; // keep the crossroads clear
    trees.push({ position: { x, z: -4.5 }, scale: 1 });
    trees.push({ position: { x, z: 4.5 }, scale: 1 });
  }
  // Park border trees (park centred at (16,12), 16×16).
  const parkEdges: Vec2[] = [
    { x: 9, z: 6 },
    { x: 16, z: 5 },
    { x: 23, z: 6 },
    { x: 23, z: 12 },
    { x: 23, z: 18 },
    { x: 16, z: 19 },
    { x: 9, z: 18 },
    { x: 9, z: 12 },
  ];
  for (const p of parkEdges) {
    trees.push({ position: p, scale: 1.2 });
  }
  // A small stand near the river.
  for (let z = -20; z <= 20; z += 10) {
    trees.push({ position: { x: 33, z }, scale: 0.9 });
  }
  return trees;
}

/** Deterministic grave markers inside the cemetery. */
function buildGraves(center: Vec2): readonly GraveInstance[] {
  const graves: GraveInstance[] = [];
  for (let gx = -3; gx <= 3; gx += 2) {
    for (let gz = -3; gz <= 3; gz += 2) {
      graves.push({ position: { x: center.x + gx, z: center.z + gz } });
    }
  }
  return graves;
}

const SIDEWALK_WIDTH = 1.4;

/**
 * WORLD-001 — sidewalks flanking each settled street. Deterministically derived
 * from the road segments: two parallel strips offset to either side of each road.
 */
function buildSidewalks(): RoadSegment[] {
  const result: RoadSegment[] = [];
  for (const road of roads) {
    const offset = road.width / 2 + SIDEWALK_WIDTH / 2 + 0.15;
    const horizontal = road.from.z === road.to.z;
    const vertical = road.from.x === road.to.x;
    for (const sign of [-1, 1] as const) {
      if (horizontal) {
        result.push({
          id: `${road.id}-sidewalk-${sign}`,
          from: { x: road.from.x, z: road.from.z + sign * offset },
          to: { x: road.to.x, z: road.to.z + sign * offset },
          width: SIDEWALK_WIDTH,
        });
      } else if (vertical) {
        result.push({
          id: `${road.id}-sidewalk-${sign}`,
          from: { x: road.from.x + sign * offset, z: road.from.z },
          to: { x: road.to.x + sign * offset, z: road.to.z },
          width: SIDEWALK_WIDTH,
        });
      }
    }
  }
  return result;
}

const PATH_WIDTH = 1.6;

/**
 * WORLD-001 — coherent pedestrian paths linking key places (square ↔ park,
 * housing, commercial store, civic community/school area). Authored polyline-ish
 * segments; walkable routing itself arrives with citizens in M02.
 */
const paths: readonly RoadSegment[] = [
  { id: 'path-square-park', from: { x: 3, z: 3 }, to: { x: 16, z: 12 }, width: PATH_WIDTH },
  { id: 'path-square-store', from: { x: -3, z: 3 }, to: { x: -11, z: 9 }, width: PATH_WIDTH },
  { id: 'path-square-civic', from: { x: -3, z: -3 }, to: { x: -11, z: -8 }, width: PATH_WIDTH },
  { id: 'path-civic-school', from: { x: -11, z: -8 }, to: { x: -14, z: -22 }, width: 1.4 },
  { id: 'path-square-housing', from: { x: 3, z: -3 }, to: { x: 13, z: -10 }, width: PATH_WIDTH },
  { id: 'path-park-housing', from: { x: 14, z: 6 }, to: { x: 15, z: -8 }, width: 1.4 },
];

/**
 * WORLD-001 — a clearly identifiable nearby forest along the northern hills,
 * denser and distinct from the sparse street/park trees. Deterministic grid
 * placement with index-based (non-random) jitter so it is reproducible.
 */
function buildForest(): Forest {
  const trees: TreeInstance[] = [];
  const minX = -46;
  const maxX = 46;
  const minZ = -49;
  const maxZ = -37;
  let i = 0;
  for (let x = minX; x <= maxX; x += 6) {
    for (let z = minZ; z <= maxZ; z += 4) {
      const jitterX = (((i * 37) % 7) - 3) * 0.5;
      const jitterZ = (((i * 53) % 5) - 2) * 0.5;
      const scale = 1.2 + ((i * 13) % 5) * 0.14;
      trees.push({ position: { x: x + jitterX, z: z + jitterZ }, scale });
      i += 1;
    }
  }
  return {
    id: 'north-woods',
    label: 'North Woods',
    area: { id: 'forest-area', label: 'North Woods', center: { x: 0, z: -43 }, width: 96, depth: 14, color: '#2f5730' },
    trees,
  };
}

const CEMETERY_CENTER: Vec2 = { x: -8, z: 40 };

export const CANONICAL_TOWN: TownLayout = {
  id: 'canonical-town-v1',
  name: 'Riverside',
  groundExtent: 50,
  groundColor: '#3c4a34',
  terrain: TERRAIN,
  buildings,
  roads,
  sidewalks: buildSidewalks(),
  paths,
  park: {
    id: 'park',
    label: 'Central Park',
    center: { x: 16, z: 12 },
    width: 16,
    depth: 16,
    color: '#4a7a3f',
  },
  square: {
    id: 'square',
    label: 'Town Square',
    center: { x: 0, z: 0 },
    width: 12,
    depth: 12,
    color: '#9b9186',
  },
  farmPlots: [
    { id: 'farm-1', label: 'Farm Plot A', center: { x: 18, z: 30 }, width: 12, depth: 8, color: '#7d6a3a' },
    { id: 'farm-2', label: 'Farm Plot B', center: { x: 18, z: 40 }, width: 12, depth: 6, color: '#6f5f34' },
  ],
  vacantPlots: [
    { id: 'plot-1', label: 'Vacant Plot 1', center: { x: -22, z: -22 }, width: 8, depth: 8, color: '#5a5140' },
    { id: 'plot-2', label: 'Vacant Plot 2', center: { x: -32, z: 30 }, width: 8, depth: 8, color: '#5a5140' },
  ],
  cemetery: {
    id: 'cemetery',
    label: 'Cemetery',
    center: CEMETERY_CENTER,
    width: 12,
    depth: 12,
    color: '#4c5540',
  },
  river: {
    // A broad river that bends inward past the town's eastern edge so Riverside
    // reads as an actual riverside town from Overview/Angled, with visible banks.
    points: [
      { x: 47, z: -50 },
      { x: 41, z: -30 },
      { x: 35, z: -8 },
      { x: 34, z: 10 },
      { x: 38, z: 28 },
      { x: 46, z: 50 },
    ],
    width: 8,
    color: '#3f6f8f',
    bankWidth: 13,
    bankColor: '#7c8a5b',
  },
  trees: buildTrees(),
  forest: buildForest(),
  graves: buildGraves(CEMETERY_CENTER),
};
