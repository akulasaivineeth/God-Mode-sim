/**
 * Authored environment asset paths — reusable vegetation/prop vocabulary (M02 R6).
 * Kenney GLBs are repackaged per-pack with matching Textures/colormap.png.
 */
import type { Vec2 } from '@/world/townLayout';

export const KENNEY_ASSETS = {
  homeCottage: '/assets/glb/kenney/suburban/home-cottage.glb',
  storeGeneral: '/assets/glb/kenney/commercial/store-general.glb',
  storeAwning: '/assets/glb/kenney/commercial/detail-awning.glb',
  workshopIndustrial: '/assets/glb/kenney/industrial/workshop-industrial.glb',
  alexCharacter: '/assets/glb/kenney/characters/alex-character.glb',
  treeSmall: '/assets/glb/kenney/suburban/tree-small.glb',
  treeLarge: '/assets/glb/kenney/suburban/tree-large.glb',
  fenceLow: '/assets/glb/kenney/suburban/fence-low.glb',
  pathShort: '/assets/glb/kenney/suburban/path-short.glb',
  pathLong: '/assets/glb/kenney/suburban/path-long.glb',
  drivewayShort: '/assets/glb/kenney/suburban/driveway-short.glb',
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

export type VegetationAssetKey = keyof typeof QUATERNIUS_ASSETS | 'treeLarge';

export interface VegetationPlacement {
  position: Vec2;
  asset: VegetationAssetKey;
  scale?: number;
  rotY?: number;
  source: 'kenney' | 'quaternius';
}

export function resolveVegetationUrl(placement: VegetationPlacement): string {
  if (placement.source === 'kenney') {
    return KENNEY_ASSETS.treeLarge;
  }
  return QUATERNIUS_ASSETS[placement.asset as keyof typeof QUATERNIUS_ASSETS];
}

/** Corridor accents — deterministic, no runtime randomness. */
export const M02_CORRIDOR_VEGETATION: readonly VegetationPlacement[] = [
  { position: { x: 8, z: -5 }, asset: 'commonTree1', scale: 0.9, source: 'quaternius' },
  { position: { x: 5, z: -2 }, asset: 'bushFlowers', scale: 1.1, source: 'quaternius' },
  { position: { x: -5, z: 5 }, asset: 'commonTree2', scale: 1.0, source: 'quaternius' },
  { position: { x: -14, z: 18 }, asset: 'pine1', scale: 0.85, source: 'quaternius' },
];

/** Riverbank rock/shrub accents along the eastern river. */
export const RIVERBANK_VEGETATION: readonly VegetationPlacement[] = [
  { position: { x: 30, z: -6 }, asset: 'pebble1', scale: 0.8, source: 'quaternius' },
  { position: { x: 32, z: 8 }, asset: 'pebble2', scale: 0.9, source: 'quaternius' },
  { position: { x: 29, z: 22 }, asset: 'bush', scale: 1.0, source: 'quaternius' },
  { position: { x: 33, z: -20 }, asset: 'fern', scale: 0.9, source: 'quaternius' },
];

/** Dense north/west forest frame — real asset families from registry data. */
export function buildPeripheryForest(): VegetationPlacement[] {
  const placements: VegetationPlacement[] = [];
  const northEdge = [
    { x: -42, z: -44 }, { x: -14, z: -45 }, { x: 14, z: -45 }, { x: 42, z: -44 },
  ];
  const westEdge = [
    { x: -44, z: -30 }, { x: -46, z: 0 }, { x: -44, z: 28 },
  ];
  const variants: VegetationPlacement[] = [
    { position: { x: 0, z: 0 }, asset: 'pine1', source: 'quaternius' },
    { position: { x: 0, z: 0 }, asset: 'pine2', source: 'quaternius' },
    { position: { x: 0, z: 0 }, asset: 'commonTree1', source: 'quaternius' },
    { position: { x: 0, z: 0 }, asset: 'commonTree2', source: 'quaternius' },
  ];
  let i = 0;
  for (const pos of [...northEdge, ...westEdge]) {
    const variant = variants[i % variants.length];
    placements.push({
      position: pos,
      asset: variant.asset,
      scale: 1.0 + (i % 3) * 0.12,
      rotY: (i % 6) * 0.55,
      source: variant.source,
    });
    i += 1;
  }
  return placements;
}
