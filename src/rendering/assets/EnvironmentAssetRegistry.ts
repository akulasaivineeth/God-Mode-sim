/**
 * Authored environment asset paths — reusable vegetation/prop vocabulary (M02 R6/R8).
 * Kenney GLBs are repackaged per-pack with matching Textures/colormap.png.
 */
import { CANONICAL_TOWN, type Vec2 } from '@/world/townLayout';

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

export type KenneyPropKey = 'treeSmall' | 'treeLarge' | 'fenceLow' | 'pathShort' | 'pathLong';
export type VegetationAssetKey = keyof typeof QUATERNIUS_ASSETS | KenneyPropKey;

export interface VegetationPlacement {
  position: Vec2;
  asset: VegetationAssetKey;
  scale?: number;
  rotY?: number;
  source: 'kenney' | 'quaternius';
}

const KENNEY_PROP_ASSETS: Record<KenneyPropKey, string> = {
  treeSmall: KENNEY_ASSETS.treeSmall,
  treeLarge: KENNEY_ASSETS.treeLarge,
  fenceLow: KENNEY_ASSETS.fenceLow,
  pathShort: KENNEY_ASSETS.pathShort,
  pathLong: KENNEY_ASSETS.pathLong,
};

export function resolveVegetationUrl(placement: VegetationPlacement): string {
  if (placement.source === 'kenney') {
    return KENNEY_PROP_ASSETS[placement.asset as KenneyPropKey] ?? KENNEY_ASSETS.treeLarge;
  }
  return QUATERNIUS_ASSETS[placement.asset as keyof typeof QUATERNIUS_ASSETS];
}

/** Kenney/Quaternius prop clusters for district readability — WF02 street-life massing. */
export function buildDistrictCompositionPlacements(): VegetationPlacement[] {
  const placements: VegetationPlacement[] = [];

  // Civic cluster framing (2 trees — budget-conscious).
  placements.push(
    { position: { x: -22, z: -12 }, asset: 'commonTree1', scale: 0.92, source: 'quaternius' },
    { position: { x: -28, z: -44 }, asset: 'pine1', scale: 0.82, source: 'quaternius' },
    { position: { x: -8, z: -8 }, asset: 'bushFlowers', scale: 1.0, source: 'quaternius' },
  );

  // Residential branch hedge line along z=-42 (4 bushes).
  for (let x = 24; x <= 60; x += 12) {
    placements.push({ position: { x, z: -44 }, asset: 'bush', scale: 0.95, source: 'quaternius' });
  }

  // Future lot corner markers + low fence framing (presentation-only lot identity).
  for (const plot of CANONICAL_TOWN.vacantPlots) {
    placements.push({
      position: { x: plot.center.x - plot.width * 0.42, z: plot.center.z + plot.depth * 0.38 },
      asset: 'bush',
      scale: 0.95,
      rotY: ((plot.center.x + plot.center.z) % 5) * 0.4,
      source: 'quaternius',
    });
    placements.push({
      position: { x: plot.center.x + plot.width * 0.38, z: plot.center.z - plot.depth * 0.35 },
      asset: 'fenceLow',
      scale: 1.15,
      rotY: Math.PI / 2,
      source: 'kenney',
    });
  }

  // Commercial/work street-facing accents.
  placements.push(
    { position: { x: -18, z: 16 }, asset: 'bushFlowers', scale: 1.05, source: 'quaternius' },
    { position: { x: -6, z: 22 }, asset: 'bush', scale: 1.0, source: 'quaternius' },
    { position: { x: 2, z: 18 }, asset: 'commonTree2', scale: 0.88, source: 'quaternius' },
  );

  // Riverside Park river-facing path + tree arc (anchor fixed at 72,38).
  for (const pos of [{ x: 80, z: 38 }, { x: 86, z: 38 }, { x: 74, z: 40 }]) {
    placements.push({ position: pos, asset: 'pathShort', scale: 1.15, rotY: Math.PI / 2, source: 'kenney' });
  }
  placements.push(
    { position: { x: 76, z: 42 }, asset: 'commonTree1', scale: 0.92, source: 'quaternius' },
    { position: { x: 82, z: 44 }, asset: 'bushFlowers', scale: 1.05, source: 'quaternius' },
    { position: { x: 88, z: 36 }, asset: 'pine1', scale: 0.82, source: 'quaternius' },
    { position: { x: 84, z: 34 }, asset: 'fern', scale: 0.95, source: 'quaternius' },
    { position: { x: 78, z: 32 }, asset: 'pebble1', scale: 0.85, source: 'quaternius' },
  );

  // Orchard tree-small grid on farm-3 (10 instances) + row boundary bushes.
  const orchard = CANONICAL_TOWN.farmPlots.find((p) => p.id === 'farm-3');
  if (orchard) {
    for (let r = 0; r < 2; r += 1) {
      for (let c = 0; c < 3; c += 1) {
        placements.push({
          position: { x: orchard.center.x + (c - 1) * 3.2, z: orchard.center.z + (r - 0.5) * 2.8 },
          asset: 'treeSmall',
          scale: 0.95 + (r + c) * 0.04,
          rotY: (r * 3 + c) * 0.7,
          source: 'kenney',
        });
      }
    }
    // WF02 +4 orchard accent trees at plot edges.
    placements.push(
      { position: { x: orchard.center.x - 4.5, z: orchard.center.z + 1.2 }, asset: 'treeSmall', scale: 1.0, rotY: 0.5, source: 'kenney' },
      { position: { x: orchard.center.x + 4.5, z: orchard.center.z + 1.2 }, asset: 'treeSmall', scale: 1.05, rotY: 1.1, source: 'kenney' },
      { position: { x: orchard.center.x - 4.5, z: orchard.center.z - 1.2 }, asset: 'treeSmall', scale: 0.98, rotY: 1.8, source: 'kenney' },
      { position: { x: orchard.center.x + 4.5, z: orchard.center.z - 1.2 }, asset: 'treeSmall', scale: 1.02, rotY: 2.4, source: 'kenney' },
    );
  }

  return placements;
}


/** Corridor accents — deterministic, no runtime randomness. WF02: 1.15× tree scale. */
export const M02_CORRIDOR_VEGETATION: readonly VegetationPlacement[] = [
  { position: { x: 8, z: -5 }, asset: 'commonTree1', scale: 1.04, source: 'quaternius' },
  { position: { x: -5, z: 5 }, asset: 'commonTree2', scale: 1.15, source: 'quaternius' },
  { position: { x: -14, z: 18 }, asset: 'pine1', scale: 0.98, source: 'quaternius' },
  { position: { x: 22, z: 8 }, asset: 'bushFlowers', scale: 1.05, source: 'quaternius' },
  { position: { x: -8, z: 26 }, asset: 'bush', scale: 1.1, source: 'quaternius' },
  { position: { x: 42, z: -18 }, asset: 'bush', scale: 1.05, source: 'quaternius' },
];

/** Riverbank rock/shrub accents — WF01 eastern frame. */
export const RIVERBANK_VEGETATION: readonly VegetationPlacement[] = [
  { position: { x: 62, z: -12 }, asset: 'pebble1', scale: 0.8, source: 'quaternius' },
  { position: { x: 66, z: 18 }, asset: 'pebble2', scale: 0.9, source: 'quaternius' },
  { position: { x: 70, z: -38 }, asset: 'fern', scale: 0.9, source: 'quaternius' },
  { position: { x: 82, z: -28 }, asset: 'pine1', scale: 1.05, source: 'quaternius' },
  { position: { x: 86, z: 22 }, asset: 'commonTree1', scale: 1.0, source: 'quaternius' },
  { position: { x: 92, z: -8 }, asset: 'fern', scale: 0.85, source: 'quaternius' },
];

/** Dense north/west/east forest frame — WF01 periphery. */
export function buildPeripheryForest(): VegetationPlacement[] {
  const placements: VegetationPlacement[] = [];
  const northEdge = [
    { x: -95, z: -102 }, { x: -35, z: -104 }, { x: 35, z: -104 },
  ];
  const westEdge = [
    { x: -104, z: -70 }, { x: -106, z: 0 }, { x: -104, z: 65 },
  ];
  // East edge omitted — riverbank vegetation provides eastern frame (R4.1 perf trim).
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
