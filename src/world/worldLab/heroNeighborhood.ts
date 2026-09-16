/**
 * WF02 R9 Phase 1 — compact hero neighborhood (~70×58 m).
 * Freely composed layout: civic anchor, residential pair, commercial frontage, future lot.
 */
import type { FacilityEntranceSpec, NavGraphSpec, WorldDefinition } from '../types';
import type {
  AreaRect,
  Building,
  RoadSegment,
  TerrainConfig,
  TownLayout,
  TreeInstance,
} from '../townLayout';

const ROAD_WIDTH = 6;
const SIDEWALK_WIDTH = 1.4;
const PATH_WIDTH = 1.6;

const HERO_TERRAIN: TerrainConfig = {
  flatRadius: 34,
  blend: 10,
  maxHeight: 6,
};

function buildSidewalks(roads: readonly RoadSegment[]): RoadSegment[] {
  const result: RoadSegment[] = [];
  for (const road of roads) {
    const offset = road.width / 2 + SIDEWALK_WIDTH / 2 + 0.12;
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

const buildings: readonly Building[] = [
  {
    id: 'community-hall',
    type: 'community',
    label: 'Community Hall',
    position: { x: -14, z: -18 },
    size: { width: 10, depth: 10, height: 8 },
    wallColor: '#c7b9a1',
    roofColor: '#6b7f8c',
  },
  {
    id: 'clinic',
    type: 'clinic',
    label: 'Clinic',
    position: { x: 14, z: -18 },
    size: { width: 8, depth: 6, height: 5 },
    wallColor: '#e3e7ea',
    roofColor: '#8fa0ab',
  },
  {
    id: 'house-1',
    type: 'house',
    label: 'House 1',
    position: { x: 16, z: -4 },
    size: { width: 5, depth: 5, height: 4 },
    wallColor: '#d8cbb6',
    roofColor: '#8a5a44',
  },
  {
    id: 'house-2',
    type: 'house',
    label: 'House 2',
    position: { x: -16, z: -4 },
    size: { width: 5, depth: 5, height: 4 },
    wallColor: '#cdbfa6',
    roofColor: '#7a4d3a',
  },
  {
    id: 'store',
    type: 'store',
    label: 'General Store',
    position: { x: -14, z: 14 },
    size: { width: 9, depth: 7, height: 5 },
    wallColor: '#d7c39c',
    roofColor: '#7a6551',
  },
  {
    id: 'workshop',
    type: 'workshop',
    label: 'Workshop',
    position: { x: 4, z: 14 },
    size: { width: 7, depth: 6, height: 5 },
    wallColor: '#cbb7a6',
    roofColor: '#7a6551',
  },
  {
    id: 'cafe',
    type: 'cafe',
    label: 'Cafe',
    position: { x: 16, z: 14 },
    size: { width: 6, depth: 5, height: 4 },
    wallColor: '#d9b98f',
    roofColor: '#6e5238',
  },
];

const roads: readonly RoadSegment[] = [
  { id: 'road-spine-ns', from: { x: 0, z: -24 }, to: { x: 0, z: 22 }, width: ROAD_WIDTH },
  { id: 'road-residential-ew', from: { x: -24, z: -6 }, to: { x: 24, z: -6 }, width: ROAD_WIDTH },
  { id: 'road-commercial-ew', from: { x: -18, z: 8 }, to: { x: 18, z: 8 }, width: ROAD_WIDTH },
  { id: 'road-lot-spur', from: { x: 0, z: 8 }, to: { x: 0, z: 20 }, width: 4 },
  { id: 'road-civic-west', from: { x: -18, z: -6 }, to: { x: -18, z: -14 }, width: 4 },
  { id: 'road-civic-east', from: { x: 18, z: -6 }, to: { x: 18, z: -14 }, width: 4 },
];

const paths: readonly RoadSegment[] = [
  { id: 'path-square-store', from: { x: -2, z: -8 }, to: { x: -14, z: 6 }, width: PATH_WIDTH },
  { id: 'path-square-home', from: { x: 2, z: -8 }, to: { x: 16, z: -4 }, width: PATH_WIDTH },
  { id: 'path-square-civic-west', from: { x: -2, z: -12 }, to: { x: -14, z: -16 }, width: 1.4 },
  { id: 'path-square-civic-east', from: { x: 2, z: -12 }, to: { x: 14, z: -16 }, width: 1.4 },
  { id: 'path-lot-frontage', from: { x: 0, z: 20 }, to: { x: 0, z: 24 }, width: 1.2 },
];

function buildFrameTrees(): readonly TreeInstance[] {
  const trees: TreeInstance[] = [];
  for (let x = -30; x <= 30; x += 6) {
    trees.push({ position: { x, z: -22 }, scale: 1.05 + ((x + 30) % 5) * 0.04 });
  }
  for (let z = -18; z <= 18; z += 7) {
    trees.push({ position: { x: -30, z }, scale: 1.0 });
    trees.push({ position: { x: 30, z }, scale: 1.0 });
  }
  for (let x = -16; x <= 16; x += 8) {
    trees.push({ position: { x, z: 6.5 }, scale: 0.95 });
  }
  return trees;
}

const vacantPlots: readonly AreaRect[] = [
  {
    id: 'future-lot-a',
    label: 'Future Lot',
    center: { x: 0, z: 26 },
    width: 8,
    depth: 8,
    color: '#5f6a48',
  },
];

export const HERO_NEIGHBORHOOD_LAYOUT: TownLayout = {
  id: 'hero-neighborhood-r9',
  name: 'Riverside Hero Neighborhood',
  groundExtent: 40,
  groundColor: '#6a8450',
  terrain: HERO_TERRAIN,
  buildings,
  roads,
  sidewalks: buildSidewalks(roads),
  paths,
  park: {
    id: 'park-edge',
    label: 'Riverside Edge',
    center: { x: 28, z: 4 },
    width: 10,
    depth: 28,
    color: '#4a7a3f',
  },
  square: {
    id: 'square',
    label: 'Civic Square',
    center: { x: 0, z: -10 },
    width: 14,
    depth: 14,
    color: '#b8aa96',
  },
  farmPlots: [],
  vacantPlots,
  cemetery: {
    id: 'cemetery',
    label: 'Cemetery',
    center: { x: 0, z: 0 },
    width: 0,
    depth: 0,
    color: '#4c5540',
  },
  river: {
    points: [
      { x: 34, z: -20 },
      { x: 32, z: -4 },
      { x: 34, z: 12 },
      { x: 32, z: 24 },
    ],
    width: 8,
    color: '#2a8fd4',
    bankWidth: 2.5,
    bankColor: '#4a5c38',
  },
  trees: buildFrameTrees(),
  forest: {
    id: 'north-frame',
    label: 'North Frame',
    area: { id: 'north-frame-area', label: 'North Frame', center: { x: 0, z: -22 }, width: 64, depth: 8, color: '#2f5730' },
    trees: [],
  },
  graves: [],
};

const HOME_ENTRANCE = { x: 16, z: -6.4 };
const STORE_ENTRANCE = { x: -14, z: 10.8 };
const WORK_ENTRANCE = { x: 4, z: 10.8 };

const HERO_NAV: NavGraphSpec = {
  nodes: {
    SQ: { x: 0, z: -10 },
    RN: { x: 0, z: -16 },
    RE: { x: 16, z: -6 },
    RW: { x: -14, z: 8 },
    CM: { x: 0, z: 8 },
    home: HOME_ENTRANCE,
    store: STORE_ENTRANCE,
    work: WORK_ENTRANCE,
  },
  edges: [
    ['SQ', 'RN'],
    ['SQ', 'RE'],
    ['SQ', 'RW'],
    ['RE', 'home'],
    ['RW', 'store'],
    ['SQ', 'CM'],
    ['CM', 'store'],
    ['store', 'work'],
  ],
};

const HERO_ENTRANCES: readonly FacilityEntranceSpec[] = [
  {
    semanticId: 'home',
    facilityId: 'house-1',
    label: 'House 1',
    entrance: HOME_ENTRANCE,
    interior: { x: 16, z: -5.2 },
    presentationSpot: { x: 16, z: -6.9 },
    presentationKind: 'chair',
    indoorFacingRadians: Math.PI,
    serves: ['sleep', 'toilet', 'shower', 'drink'],
  },
  {
    semanticId: 'store',
    facilityId: 'store',
    label: 'General Store',
    entrance: STORE_ENTRANCE,
    interior: { x: -14, z: 12.4 },
    presentationSpot: { x: -14, z: 11.2 },
    presentationKind: 'counter',
    indoorFacingRadians: 0,
    serves: ['eat'],
  },
  {
    semanticId: 'work',
    facilityId: 'workshop',
    label: 'Workshop',
    entrance: WORK_ENTRANCE,
    interior: { x: 4, z: 12.4 },
    presentationSpot: { x: 4, z: 11.2 },
    presentationKind: 'workbench',
    indoorFacingRadians: 0,
    serves: ['work'],
  },
];

export const HERO_NEIGHBORHOOD_DEFINITION: WorldDefinition = {
  id: 'hero-neighborhood-r9',
  version: 1,
  name: 'Riverside Hero Neighborhood',
  bounds: { minX: -32, maxX: 32, minZ: -24, maxZ: 30 },
  layout: HERO_NEIGHBORHOOD_LAYOUT,
  entrances: HERO_ENTRANCES,
  nav: HERO_NAV,
  m02Assignments: {
    homeId: 'house-1',
    storeId: 'store',
    workplaceId: 'workshop',
  },
  cameras: {
    overview: { position: [0, 46, 36], target: [0, 0, 4] },
    angled: { position: [34, 26, 26], target: [0, 0, 2] },
    square: { position: [-10, 14, 2], target: [0, 1, -10] },
    civic: { position: [-20, 12, -4], target: [-6, 1, -14] },
    residential: { position: [22, 10, 0], target: [0, 1, -4] },
    commercial: { position: [0, 10, 24], target: [0, 1, 12] },
    'store-workshop': { position: [-14, 7, 20], target: [0, 2, 12] },
    river: { position: [24, 10, 8], target: [30, 1, 4] },
  },
};

export const HERO_BUILDING_IDS = new Set(buildings.map((b) => b.id));
