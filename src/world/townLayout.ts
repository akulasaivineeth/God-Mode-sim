/**
 * Canonical handcrafted town shell — WORLD-001 / WF01 Riverside expansion.
 *
 * Authored geography for the ~240 m Riverside starter settlement. Immutable
 * presentation data — simulation references facility IDs only (ADR-006).
 *
 * WF01 expands groundExtent to 120 (240 m plane) while preserving M02 facility
 * coordinates for house-1, store, and workshop.
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
  position: Vec2;
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

export interface TerrainConfig {
  flatRadius: number;
  blend: number;
  maxHeight: number;
}

export interface TownLayout {
  id: string;
  name: string;
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
    bankWidth: number;
    bankColor: string;
  };
  trees: readonly TreeInstance[];
  forest: Forest;
  graves: readonly GraveInstance[];
}

export type RoofStyle = 'gable' | 'hip' | 'flat';

export interface BuildingArchetype {
  roof: RoofStyle;
  canopy: boolean;
  entry: boolean;
  tower: boolean;
  windowColor: string;
  accentColor: string;
}

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
  flatRadius: 78,
  blend: 18,
  maxHeight: 12,
};

export function terrainHeightAt(x: number, z: number): number {
  const north = Math.max(0, -z - TERRAIN.flatRadius);
  const west = Math.max(0, -x - TERRAIN.flatRadius);
  let reach = Math.min(1, Math.max(north, west) / TERRAIN.blend);
  if (reach <= 0) return 0;
  // Eastern river valley stays low.
  if (x > 55) {
    reach *= Math.max(0, 1 - (x - 55) / 28);
  }
  if (reach <= 0) return 0;
  const ridge = reach * reach * (3 - 2 * reach);
  const undulation = 0.5 * (Math.sin(x * 0.09) * Math.cos(z * 0.08) + Math.sin((x + z) * 0.04));
  return ridge * TERRAIN.maxHeight * (0.82 + 0.18 * undulation);
}

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
  {
    id: 'community-hall',
    type: 'community',
    label: 'Community Hall',
    position: { x: -18, z: -18 },
    size: { width: 10, depth: 10, height: 8 },
    wallColor: WALL.civic,
    roofColor: ROOF.civic,
  },
  {
    id: 'clinic',
    type: 'clinic',
    label: 'Clinic',
    position: { x: -42, z: -14 },
    size: { width: 8, depth: 6, height: 5 },
    wallColor: '#e3e7ea',
    roofColor: '#8fa0ab',
  },
  {
    id: 'school',
    type: 'school',
    label: 'School',
    position: { x: -24, z: -48 },
    size: { width: 12, depth: 8, height: 5 },
    wallColor: WALL.civic,
    roofColor: ROOF.civic,
  },
  // M02 citizen home — coordinate preserved.
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
    position: { x: 30, z: -12 },
    size: { width: 5, depth: 5, height: 4 },
    wallColor: '#cdbfa6',
    roofColor: '#7a4d3a',
  },
  {
    id: 'house-3',
    type: 'house',
    label: 'House 3',
    position: { x: 11, z: -30 },
    size: { width: 5, depth: 5, height: 4 },
    wallColor: '#e0d3bd',
    roofColor: '#96634a',
  },
  {
    id: 'house-4',
    type: 'house',
    label: 'House 4',
    position: { x: 30, z: -30 },
    size: { width: 5, depth: 5, height: 4 },
    wallColor: WALL.house,
    roofColor: ROOF.house,
  },
  {
    id: 'apartment',
    type: 'apartment',
    label: 'Apartments',
    position: { x: 52, z: -22 },
    size: { width: 10, depth: 10, height: 12 },
    wallColor: WALL.apartment,
    roofColor: ROOF.apartment,
  },
  // M02 store — coordinate preserved.
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
    position: { x: -30, z: 12 },
    size: { width: 6, depth: 5, height: 4 },
    wallColor: '#d9b98f',
    roofColor: '#6e5238',
  },
  // M02 workshop — coordinate preserved.
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
    position: { x: -38, z: 48 },
    size: { width: 12, depth: 9, height: 7 },
    wallColor: '#b9ad97',
    roofColor: '#5f5647',
  },
  {
    id: 'utility',
    type: 'utility',
    label: 'Utility Station',
    position: { x: -52, z: 30 },
    size: { width: 6, depth: 6, height: 4 },
    wallColor: WALL.utility,
    roofColor: ROOF.utility,
  },
  {
    id: 'farmhouse',
    type: 'farmhouse',
    label: 'Farmhouse',
    position: { x: 28, z: 82 },
    size: { width: 6, depth: 5, height: 4 },
    wallColor: WALL.farm,
    roofColor: ROOF.farm,
  },
];

const ROAD_WIDTH = 6;
const MAIN_ROAD_HALF = 105;

const roads: readonly RoadSegment[] = [
  { id: 'road-main-ew', from: { x: -MAIN_ROAD_HALF, z: 0 }, to: { x: MAIN_ROAD_HALF, z: 0 }, width: ROAD_WIDTH },
  { id: 'road-main-ns', from: { x: 0, z: -MAIN_ROAD_HALF }, to: { x: 0, z: MAIN_ROAD_HALF }, width: ROAD_WIDTH },
  { id: 'road-residential', from: { x: 8, z: -18 }, to: { x: 78, z: -42 }, width: 4.5 },
  { id: 'road-residential-loop', from: { x: 78, z: -42 }, to: { x: 45, z: -58 }, width: 4 },
  { id: 'road-residential-return', from: { x: 45, z: -58 }, to: { x: 8, z: -42 }, width: 4 },
  { id: 'road-commercial', from: { x: -48, z: 18 }, to: { x: -4, z: 18 }, width: 4.5 },
  { id: 'road-industrial', from: { x: -52, z: 38 }, to: { x: -4, z: 38 }, width: 4.5 },
  { id: 'road-farm', from: { x: 0, z: 58 }, to: { x: 75, z: 82 }, width: 4 },
  { id: 'road-riverside', from: { x: 24, z: 38 }, to: { x: 88, z: 38 }, width: 3.5 },
];

function buildTrees(): readonly TreeInstance[] {
  const trees: TreeInstance[] = [];
  for (let x = -95; x <= 65; x += 10) {
    if (Math.abs(x) < 6) continue;
    trees.push({ position: { x, z: -5 }, scale: 1 });
    trees.push({ position: { x, z: 5 }, scale: 1 });
  }
  const park = { x: 72, z: 38 };
  const parkEdges: Vec2[] = [
    { x: park.x - 10, z: park.z - 8 },
    { x: park.x, z: park.z - 10 },
    { x: park.x + 10, z: park.z - 8 },
    { x: park.x + 12, z: park.z },
    { x: park.x + 10, z: park.z + 8 },
    { x: park.x, z: park.z + 10 },
    { x: park.x - 10, z: park.z + 8 },
    { x: park.x - 12, z: park.z },
  ];
  for (const p of parkEdges) {
    trees.push({ position: p, scale: 1.15 });
  }
  for (let z = -80; z <= 80; z += 14) {
    trees.push({ position: { x: 68, z }, scale: 0.95 });
  }
  return trees;
}

function buildGraves(center: Vec2): readonly GraveInstance[] {
  const graves: GraveInstance[] = [];
  for (let gx = -4; gx <= 4; gx += 2) {
    for (let gz = -4; gz <= 4; gz += 2) {
      graves.push({ position: { x: center.x + gx, z: center.z + gz } });
    }
  }
  return graves;
}

const SIDEWALK_WIDTH = 1.4;

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
      } else {
        const dx = road.to.x - road.from.x;
        const dz = road.to.z - road.from.z;
        const len = Math.hypot(dx, dz) || 1;
        const nx = -dz / len;
        const nz = dx / len;
        result.push({
          id: `${road.id}-sidewalk-${sign}`,
          from: { x: road.from.x + nx * sign * offset, z: road.from.z + nz * sign * offset },
          to: { x: road.to.x + nx * sign * offset, z: road.to.z + nz * sign * offset },
          width: SIDEWALK_WIDTH,
        });
      }
    }
  }
  return result;
}

const PATH_WIDTH = 1.6;

const paths: readonly RoadSegment[] = [
  { id: 'path-square-park', from: { x: 4, z: 4 }, to: { x: 72, z: 38 }, width: PATH_WIDTH },
  { id: 'path-square-store', from: { x: -4, z: 4 }, to: { x: -11, z: 9 }, width: PATH_WIDTH },
  { id: 'path-square-civic', from: { x: -4, z: -4 }, to: { x: -18, z: -14 }, width: PATH_WIDTH },
  { id: 'path-civic-school', from: { x: -18, z: -14 }, to: { x: -24, z: -44 }, width: 1.4 },
  { id: 'path-square-housing', from: { x: 4, z: -4 }, to: { x: 13, z: -10 }, width: PATH_WIDTH },
  { id: 'path-park-river', from: { x: 72, z: 38 }, to: { x: 88, z: 38 }, width: 1.4 },
  { id: 'path-cafe-cluster', from: { x: -18, z: 18 }, to: { x: -30, z: 12 }, width: 1.4 },
];

function buildForest(): Forest {
  const trees: TreeInstance[] = [];
  const minX = -108;
  const maxX = 108;
  const minZ = -112;
  const maxZ = -92;
  let i = 0;
  for (let x = minX; x <= maxX; x += 7) {
    for (let z = minZ; z <= maxZ; z += 5) {
      const jitterX = (((i * 37) % 7) - 3) * 0.55;
      const jitterZ = (((i * 53) % 5) - 2) * 0.55;
      const scale = 1.15 + ((i * 13) % 5) * 0.12;
      trees.push({ position: { x: x + jitterX, z: z + jitterZ }, scale });
      i += 1;
    }
  }
  return {
    id: 'north-woods',
    label: 'North Woods',
    area: { id: 'forest-area', label: 'North Woods', center: { x: 0, z: -102 }, width: 220, depth: 22, color: '#2f5730' },
    trees,
  };
}

const CEMETERY_CENTER: Vec2 = { x: -18, z: 92 };

export const CANONICAL_TOWN: TownLayout = {
  id: 'canonical-town-wf01',
  name: 'Riverside',
  groundExtent: 120,
  groundColor: '#3c4a34',
  terrain: TERRAIN,
  buildings,
  roads,
  sidewalks: buildSidewalks(),
  paths,
  park: {
    id: 'park',
    label: 'Riverside Park',
    center: { x: 72, z: 38 },
    width: 28,
    depth: 22,
    color: '#4a7a3f',
  },
  square: {
    id: 'square',
    label: 'Town Square',
    center: { x: 0, z: 0 },
    width: 22,
    depth: 22,
    color: '#9b9186',
  },
  farmPlots: [
    { id: 'farm-1', label: 'Farm Plot A', center: { x: 45, z: 90 }, width: 18, depth: 10, color: '#7d6a3a' },
    { id: 'farm-2', label: 'Farm Plot B', center: { x: 62, z: 78 }, width: 16, depth: 12, color: '#6f5f34' },
    { id: 'farm-3', label: 'Orchard', center: { x: 55, z: 98 }, width: 14, depth: 10, color: '#5a6f38' },
  ],
  vacantPlots: [
    { id: 'plot-1', label: 'Lot 1', center: { x: 48, z: -48 }, width: 10, depth: 10, color: '#5f6a48' },
    { id: 'plot-2', label: 'Lot 2', center: { x: 62, z: -48 }, width: 10, depth: 10, color: '#5f6a48' },
    { id: 'plot-3', label: 'Lot 3', center: { x: 76, z: -48 }, width: 10, depth: 10, color: '#5f6a48' },
    { id: 'plot-4', label: 'Lot 4', center: { x: 48, z: -62 }, width: 10, depth: 10, color: '#5a5140' },
    { id: 'plot-5', label: 'Lot 5', center: { x: 62, z: -62 }, width: 10, depth: 10, color: '#5a5140' },
    { id: 'plot-6', label: 'Lot 6', center: { x: 76, z: -62 }, width: 10, depth: 10, color: '#5a5140' },
    { id: 'plot-7', label: 'Lot 7', center: { x: 88, z: -22 }, width: 10, depth: 10, color: '#5f6a48' },
    { id: 'plot-8', label: 'Lot 8', center: { x: 95, z: -8 }, width: 10, depth: 10, color: '#5f6a48' },
  ],
  cemetery: {
    id: 'cemetery',
    label: 'Cemetery',
    center: CEMETERY_CENTER,
    width: 16,
    depth: 14,
    color: '#4c5540',
  },
  river: {
    points: [
      { x: 108, z: -115 },
      { x: 102, z: -82 },
      { x: 94, z: -45 },
      { x: 88, z: 0 },
      { x: 90, z: 42 },
      { x: 98, z: 82 },
      { x: 108, z: 115 },
    ],
    width: 10,
    color: '#3f6f8f',
    bankWidth: 16,
    bankColor: '#7c8a5b',
  },
  trees: buildTrees(),
  forest: buildForest(),
  graves: buildGraves(CEMETERY_CENTER),
};
