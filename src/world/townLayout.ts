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
 * plots, plus roads, trees, and a river.
 */

export type BuildingType =
  | 'townhall'
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

export interface TownLayout {
  id: string;
  name: string;
  /** Half-size of the square ground plane (full plane is 2 × groundExtent). */
  groundExtent: number;
  groundColor: string;
  buildings: readonly Building[];
  roads: readonly RoadSegment[];
  park: AreaRect;
  square: AreaRect;
  farmPlots: readonly AreaRect[];
  vacantPlots: readonly AreaRect[];
  cemetery: AreaRect;
  river: { points: readonly RiverPoint[]; width: number; color: string };
  trees: readonly TreeInstance[];
  graves: readonly GraveInstance[];
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
  // NW quadrant — civic
  {
    id: 'townhall',
    type: 'townhall',
    label: 'Town Hall',
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

const CEMETERY_CENTER: Vec2 = { x: 31, z: 28 };

export const CANONICAL_TOWN: TownLayout = {
  id: 'canonical-town-v1',
  name: 'Riverside',
  groundExtent: 50,
  groundColor: '#3c4a34',
  buildings,
  roads,
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
    { id: 'plot-2', label: 'Vacant Plot 2', center: { x: 30, z: 8 }, width: 8, depth: 8, color: '#5a5140' },
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
    points: [
      { x: 42, z: -50 },
      { x: 40, z: -20 },
      { x: 41, z: 0 },
      { x: 39, z: 20 },
      { x: 42, z: 50 },
    ],
    width: 6,
    color: '#3f6f8f',
  },
  trees: buildTrees(),
  graves: buildGraves(CEMETERY_CENTER),
};
