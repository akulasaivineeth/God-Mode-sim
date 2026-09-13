/**
 * Authored environment asset paths — reusable vegetation/prop vocabulary (M02 R5).
 */
import type { Vec2 } from '@/world/townLayout';

export const KENNEY_ASSETS = {
  treeSmall: '/assets/glb/kenney/tree-small.glb',
  treeLarge: '/assets/glb/kenney/tree-large.glb',
  fenceLow: '/assets/glb/kenney/fence-low.glb',
  pathShort: '/assets/glb/kenney/path-short.glb',
  pathLong: '/assets/glb/kenney/path-long.glb',
  drivewayShort: '/assets/glb/kenney/driveway-short.glb',
  roadStraight: '/assets/glb/kenney/roads/road-straight.glb',
  roadCrossing: '/assets/glb/kenney/roads/road-crossing.glb',
  roadBridge: '/assets/glb/kenney/roads/road-bridge.glb',
  roadDriveway: '/assets/glb/kenney/roads/road-driveway-double.glb',
} as const;

export const QUATERNIUS_ASSETS = {
  commonTree1: '/assets/gltf/quaternius/CommonTree_1.gltf',
  commonTree2: '/assets/gltf/quaternius/CommonTree_2.gltf',
  pine1: '/assets/gltf/quaternius/Pine_1.gltf',
  pine2: '/assets/gltf/quaternius/Pine_2.gltf',
  bush: '/assets/gltf/quaternius/Bush_Common.gltf',
  bushFlowers: '/assets/gltf/quaternius/Bush_Common_Flowers.gltf',
  fern: '/assets/gltf/quaternius/Fern_1.gltf',
  flowers: '/assets/gltf/quaternius/Flower_3_Group.gltf',
  pebble1: '/assets/gltf/quaternius/Pebble_Round_1.gltf',
  pebble2: '/assets/gltf/quaternius/Pebble_Round_2.gltf',
} as const;

export interface VegetationPlacement {
  position: Vec2;
  asset: keyof typeof QUATERNIUS_ASSETS | keyof typeof KENNEY_ASSETS;
  scale?: number;
  rotY?: number;
  source: 'kenney' | 'quaternius';
}

/** Deterministic corridor + periphery vegetation — no runtime randomness. */
export const M02_CORRIDOR_VEGETATION: readonly VegetationPlacement[] = [
  { position: { x: 8, z: -5 }, asset: 'commonTree1', scale: 0.9, source: 'quaternius' },
  { position: { x: -5, z: 5 }, asset: 'bushFlowers', scale: 1.1, source: 'quaternius' },
];

/** Dense north/west forest frame placements. */
/** Sparse periphery frame — kept under ~24 instances for draw-call budget. */
export function buildPeripheryForest(): VegetationPlacement[] {
  const placements: VegetationPlacement[] = [];
  const northEdge = [
    { x: -42, z: -44 }, { x: -14, z: -45 }, { x: 14, z: -45 }, { x: 42, z: -44 },
  ];
  const westEdge = [
    { x: -44, z: -30 }, { x: -46, z: 0 }, { x: -44, z: 28 },
  ];
  let i = 0;
  for (const pos of [...northEdge, ...westEdge]) {
    const variant = i % 4;
    placements.push({
      position: pos,
      asset: variant === 0 ? 'pine1' : variant === 1 ? 'pine2' : variant === 2 ? 'commonTree1' : 'treeLarge',
      scale: 1.0 + (i % 3) * 0.15,
      rotY: (i % 6) * 0.5,
      source: variant === 3 ? 'kenney' : 'quaternius',
    });
    i += 1;
  }
  return placements;
}
