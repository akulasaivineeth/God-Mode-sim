/**
 * Authored environment asset paths — reusable vegetation/prop vocabulary (M02 R6/R8).
 * Kenney GLBs are repackaged per-pack with matching Textures/colormap.png.
 */
import type { Vec2 } from '@/world/townLayout';

export const KENNEY_ASSETS = {
  homeCottage: '/assets/glb/kenney/suburban/home-cottage.glb',
  homeTypeA: '/assets/glb/kenney/suburban/home-type-a.glb',
  homeTypeC: '/assets/glb/kenney/suburban/home-type-c.glb',
  homeTypeD: '/assets/glb/kenney/suburban/home-type-d.glb',
  apartmentBlock: '/assets/glb/kenney/suburban/apartment-block.glb',
  farmhouse: '/assets/glb/kenney/suburban/farmhouse.glb',
  storeGeneral: '/assets/glb/kenney/commercial/store-general.glb',
  storeAwning: '/assets/glb/kenney/commercial/detail-awning.glb',
  cafeBistro: '/assets/glb/kenney/commercial/cafe-bistro.glb',
  cafeParasol: '/assets/glb/kenney/commercial/detail-parasol-a.glb',
  clinic: '/assets/glb/kenney/commercial/clinic.glb',
  school: '/assets/glb/kenney/commercial/school.glb',
  communityHall: '/assets/glb/kenney/commercial/community-hall.glb',
  workshopIndustrial: '/assets/glb/kenney/industrial/workshop-industrial.glb',
  warehouse: '/assets/glb/kenney/industrial/warehouse.glb',
  utilityStation: '/assets/glb/kenney/industrial/utility-station.glb',
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
  roadBend: '/assets/glb/kenney/roads/road-bend.glb',
  roadCurvePavement: '/assets/glb/kenney/roads/road-curve-pavement.glb',
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
  { position: { x: 14, z: -8 }, asset: 'bushFlowers', scale: 1.0, source: 'quaternius' },
  { position: { x: -8, z: 14 }, asset: 'flowers', scale: 0.95, source: 'quaternius' },
  { position: { x: -8, z: 26 }, asset: 'bush', scale: 1.05, source: 'quaternius' },
  { position: { x: -20, z: -16 }, asset: 'bush', scale: 1.0, source: 'quaternius' },
  { position: { x: -32, z: 12 }, asset: 'flowers', scale: 0.9, source: 'quaternius' },
];

/** Riverbank rock/shrub accents — WF01 eastern frame. */
export const RIVERBANK_VEGETATION: readonly VegetationPlacement[] = [
  { position: { x: 62, z: -12 }, asset: 'pebble1', scale: 0.8, source: 'quaternius' },
  { position: { x: 66, z: 18 }, asset: 'pebble2', scale: 0.9, source: 'quaternius' },
  { position: { x: 60, z: 42 }, asset: 'bush', scale: 1.0, source: 'quaternius' },
  { position: { x: 70, z: -38 }, asset: 'fern', scale: 0.9, source: 'quaternius' },
  { position: { x: 82, z: -28 }, asset: 'pine1', scale: 1.05, source: 'quaternius' },
  { position: { x: 86, z: 22 }, asset: 'commonTree1', scale: 1.0, source: 'quaternius' },
  { position: { x: 84, z: 58 }, asset: 'pine2', scale: 0.95, source: 'quaternius' },
  { position: { x: 78, z: -68 }, asset: 'commonTree2', scale: 0.9, source: 'quaternius' },
  { position: { x: 92, z: -8 }, asset: 'fern', scale: 0.85, source: 'quaternius' },
  { position: { x: 88, z: 72 }, asset: 'bushFlowers', scale: 1.0, source: 'quaternius' },
];

/** Dense north/west/east forest frame — WF01 periphery. */
export function buildPeripheryForest(): VegetationPlacement[] {
  const placements: VegetationPlacement[] = [];
  const northEdge = [
    { x: -95, z: -102 }, { x: -35, z: -104 }, { x: 35, z: -104 }, { x: 95, z: -102 },
  ];
  const westEdge = [
    { x: -104, z: -70 }, { x: -106, z: 0 }, { x: -104, z: 65 },
  ];
  const eastEdge = [
    { x: 100, z: -75 }, { x: 102, z: -20 }, { x: 101, z: 25 }, { x: 100, z: 75 },
  ];
  const variants: VegetationPlacement[] = [
    { position: { x: 0, z: 0 }, asset: 'pine1', source: 'quaternius' },
    { position: { x: 0, z: 0 }, asset: 'pine2', source: 'quaternius' },
    { position: { x: 0, z: 0 }, asset: 'commonTree1', source: 'quaternius' },
    { position: { x: 0, z: 0 }, asset: 'commonTree2', source: 'quaternius' },
  ];
  let i = 0;
  for (const pos of [...northEdge, ...westEdge, ...eastEdge]) {
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
