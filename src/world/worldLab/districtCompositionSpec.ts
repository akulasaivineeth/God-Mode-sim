/**
 * WF02 R10 — declarative hero-neighborhood district composition specs.
 * Deterministic placement only; presentation-only.
 */
import { CANONICAL_TOWN } from '@/world/townLayout';
import { getFacilityPoint } from '@/world/facilityPoints';
import { DISTRICT_PALETTE } from '@/rendering/palette/DistrictPalette';

function commercialEntrance(facilityId: string): { x: number; z: number } {
  if (facilityId === 'store' || facilityId === 'workshop') {
    return getFacilityPoint(facilityId).entrance;
  }
  const building = CANONICAL_TOWN.buildings.find((b) => b.id === facilityId);
  if (!building) throw new Error(`Unknown commercial building: ${facilityId}`);
  return { x: building.position.x, z: building.position.z - building.size.depth / 2 - 0.6 };
}

export interface GroundTintZoneSpec {
  id: string;
  color: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface GltfPlacementSpec {
  urlKey:
    | 'planter'
    | 'pathStonesShort'
    | 'pathStonesMessy'
    | 'pathShort'
    | 'pathLong'
    | 'fenceLow'
    | 'treeLarge'
    | 'treeSmall'
    | 'storeAwning'
    | 'cafeParasol';
  x: number;
  z: number;
  rotY?: number;
  scale?: number;
  yOffset?: number;
}

export interface ScatterPlacementSpec {
  x: number;
  z: number;
  rotY?: number;
  scale?: number;
  kind: 'bench' | 'lamp' | 'shrub' | 'paver' | 'fencePost';
}

const sq = CANONICAL_TOWN.square;

export const WORLD_LAB_GROUND_ZONES: readonly GroundTintZoneSpec[] = [
  {
    id: 'civic-square',
    color: DISTRICT_PALETTE.groundCommercial,
    minX: sq.center.x - 7,
    maxX: sq.center.x + 7,
    minZ: sq.center.z - 7,
    maxZ: sq.center.z + 7,
  },
  {
    id: 'commercial-frontage',
    color: DISTRICT_PALETTE.groundCommercial,
    minX: -20,
    maxX: 20,
    minZ: 6,
    maxZ: 16.5,
  },
  {
    id: 'residential-gardens',
    color: DISTRICT_PALETTE.groundResidential,
    minX: -22,
    maxX: 22,
    minZ: -8,
    maxZ: 2,
  },
  {
    id: 'future-lot-pad',
    color: DISTRICT_PALETTE.groundGarden,
    minX: -5,
    maxX: 5,
    minZ: 22,
    maxZ: 30,
  },
];

/** Colonnade + radial paving around civic square. */
export function buildCivicEnclosureSpec(): {
  pavers: GltfPlacementSpec[];
  colonnade: GltfPlacementSpec[];
  center: GltfPlacementSpec[];
} {
  const cx = sq.center.x;
  const cz = sq.center.z;
  const pavers: GltfPlacementSpec[] = [];
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2;
    const radius = 5.4 + (i % 3) * 0.35;
    pavers.push({
      urlKey: i % 2 === 0 ? 'pathStonesShort' : 'pathStonesMessy',
      x: cx + Math.cos(a) * radius,
      z: cz + Math.sin(a) * radius,
      rotY: a + Math.PI / 2,
      scale: 1.12,
    });
  }
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 8;
    const radius = 6.4;
    pavers.push({
      urlKey: 'pathStonesShort',
      x: cx + Math.cos(a) * radius * 0.55,
      z: cz + Math.sin(a) * radius * 0.55,
      rotY: a,
      scale: 1.05,
    });
  }

  const colonnade: GltfPlacementSpec[] = [];
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2;
    const radius = 6.6;
    colonnade.push({
      urlKey: 'fenceLow',
      x: cx + Math.cos(a) * radius,
      z: cz + Math.sin(a) * radius,
      rotY: a + Math.PI / 2,
      scale: 2.4,
    });
  }

  const center: GltfPlacementSpec[] = [
    { urlKey: 'planter', x: cx, z: cz, scale: 1.35 },
    { urlKey: 'planter', x: cx - 1.6, z: cz + 1.2, scale: 1.1, rotY: 0.4 },
    { urlKey: 'planter', x: cx + 1.6, z: cz - 1.2, scale: 1.1, rotY: -0.5 },
  ];

  return { pavers, colonnade, center };
}

/** Facade-cadence commercial street life tied to semantic entrances. */
export function buildCommercialFrontageSpec(): {
  scatter: ScatterPlacementSpec[];
  props: GltfPlacementSpec[];
} {
  const commercialIds = ['store', 'workshop', 'cafe'] as const;
  const scatter: ScatterPlacementSpec[] = [];
  const props: GltfPlacementSpec[] = [];

  for (const id of commercialIds) {
    const entrance = commercialEntrance(id);
    scatter.push(
      { kind: 'lamp', x: entrance.x - 2.2, z: entrance.z - 1.4, rotY: 0 },
      { kind: 'lamp', x: entrance.x + 2.2, z: entrance.z - 1.4, rotY: 0 },
      { kind: 'bench', x: entrance.x, z: entrance.z - 2.2, rotY: 0 },
      { kind: 'paver', x: entrance.x, z: entrance.z - 1.1, rotY: 0.2, scale: 1.05 },
    );
    props.push({
      urlKey: 'pathStonesMessy',
      x: entrance.x,
      z: entrance.z - 0.6,
      rotY: 0,
      scale: 1.1,
    });
  }

  props.push(
    { urlKey: 'pathLong', x: -5, z: 11.5, rotY: Math.PI / 2, scale: 1.2 },
    { urlKey: 'pathLong', x: 5, z: 11.5, rotY: Math.PI / 2, scale: 1.2 },
  );

  return { scatter, props };
}

/** Per-house garden depth + rear tree anchors. */
export function buildResidentialGardenSpec(): {
  fences: GltfPlacementSpec[];
  paths: GltfPlacementSpec[];
  trees: GltfPlacementSpec[];
  scatter: ScatterPlacementSpec[];
} {
  const houses = CANONICAL_TOWN.buildings.filter((b) => b.type === 'house');
  const fences: GltfPlacementSpec[] = [];
  const paths: GltfPlacementSpec[] = [];
  const trees: GltfPlacementSpec[] = [];
  const scatter: ScatterPlacementSpec[] = [];

  for (const house of houses) {
    const side = house.position.x > 0 ? 1 : -1;
    const frontZ = house.position.z + 2.8;
    const gardenZ = house.position.z + 1.2;
    for (let i = -2; i <= 2; i += 1) {
      fences.push({
        urlKey: 'fenceLow',
        x: house.position.x + side * 3.6,
        z: gardenZ + i * 1.4,
        rotY: side > 0 ? Math.PI / 2 : -Math.PI / 2,
        scale: 2.1,
      });
    }
    fences.push({
      urlKey: 'fenceLow',
      x: house.position.x + side * 1.8,
      z: frontZ,
      rotY: 0,
      scale: 2.3,
    });
    paths.push({
      urlKey: 'pathShort',
      x: house.position.x,
      z: house.position.z - 1.2,
      rotY: side > 0 ? -Math.PI / 2 : Math.PI / 2,
      scale: 1.15,
    });
    trees.push({
      urlKey: 'treeLarge',
      x: house.position.x - side * 2.8,
      z: house.position.z + 3.5,
      scale: 1.25,
      rotY: side * 0.4,
    });
    scatter.push(
      { kind: 'shrub', x: house.position.x + side * 2.2, z: gardenZ, scale: 1.1, rotY: 0.3 },
      { kind: 'paver', x: house.position.x, z: frontZ - 0.4, scale: 0.95, rotY: 0.1 },
    );
  }

  return { fences, paths, trees, scatter };
}

export function buildFutureLotFrameSpec(): {
  fences: GltfPlacementSpec[];
  pavers: ScatterPlacementSpec[];
} {
  const plot = CANONICAL_TOWN.vacantPlots[0];
  if (!plot) return { fences: [], pavers: [] };
  const fences: GltfPlacementSpec[] = [];
  const halfW = plot.width * 0.42;
  const halfD = plot.depth * 0.42;
  const sides = [
    { x1: plot.center.x - halfW, z1: plot.center.z - halfD, x2: plot.center.x + halfW, z2: plot.center.z - halfD },
    { x1: plot.center.x - halfW, z1: plot.center.z - halfD, x2: plot.center.x - halfW, z2: plot.center.z + halfD },
    { x1: plot.center.x + halfW, z1: plot.center.z - halfD, x2: plot.center.x + halfW, z2: plot.center.z + halfD },
  ];
  for (const side of sides) {
    const steps = 4;
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      fences.push({
        urlKey: 'fenceLow',
        x: side.x1 + (side.x2 - side.x1) * t,
        z: side.z1 + (side.z2 - side.z1) * t,
        rotY: Math.atan2(side.x2 - side.x1, side.z2 - side.z1) + Math.PI / 2,
        scale: 2.2,
      });
    }
  }
  const pavers: ScatterPlacementSpec[] = [];
  for (let r = 0; r < 2; r += 1) {
    for (let c = 0; c < 2; c += 1) {
      pavers.push({
        kind: 'paver',
        x: plot.center.x + (c - 0.5) * 2.4,
        z: plot.center.z + (r - 0.5) * 2.4,
        rotY: (r + c) * 0.7,
        scale: 0.92,
      });
    }
  }
  return { fences, pavers };
}

export function buildFrameTreeSpec(): GltfPlacementSpec[] {
  return CANONICAL_TOWN.trees.map((tree, i) => ({
    urlKey: i % 3 === 0 ? 'treeLarge' : 'treeSmall',
    x: tree.position.x,
    z: tree.position.z,
    scale: tree.scale * 1.4,
    rotY: ((tree.position.x * 17 + tree.position.z * 13) % 8) * (Math.PI / 4),
  }));
}
