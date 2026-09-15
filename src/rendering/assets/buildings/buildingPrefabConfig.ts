/**
 * WF02 prefab-backed facility presentation config.
 * Positions read from CANONICAL_TOWN; simulation IDs unchanged.
 * Attached dressing uses anchor kinds resolved via buildingPresentationAnchors.ts.
 */
import { CANONICAL_TOWN } from '@/world/townLayout';
import { KENNEY_ASSETS } from '../EnvironmentAssetRegistry';
import type { AnchorExtraKind } from './buildingPresentationAnchors';

export interface PrefabExtra {
  kind: AnchorExtraKind;
  /** Optional multiplier on anchor-derived scale. */
  scaleMultiplier?: number;
}

export interface BuildingPrefabConfig {
  buildingId: string;
  assetUrl: string;
  targetWidth: number;
  /** Y rotation for south-facing (-Z) facade toward public realm. */
  rotationY?: number;
  sign?: { text: string; width: number; height: number; fontSize: number };
  extras?: PrefabExtra[];
}

function pos(id: string): { x: number; z: number } {
  const b = CANONICAL_TOWN.buildings.find((entry) => entry.id === id);
  if (!b) throw new Error(`Unknown building: ${id}`);
  return b.position;
}

/** South-facing facade convention (matches M02 store/workshop). */
const SOUTH = Math.PI;

export const BUILDING_PREFABS: readonly BuildingPrefabConfig[] = [
  {
    buildingId: 'house-1',
    assetUrl: KENNEY_ASSETS.homeCottage,
    targetWidth: 11.2,
    rotationY: -Math.PI / 2,
    sign: { text: '11 Riverside Lane', width: 3.0, height: 0.55, fontSize: 36 },
    extras: [
      { kind: 'path-short' },
      { kind: 'fence-left' },
      { kind: 'fence-right' },
    ],
  },
  {
    buildingId: 'house-2',
    assetUrl: KENNEY_ASSETS.homeTypeA,
    targetWidth: 11.0,
    rotationY: -Math.PI / 2,
    extras: [{ kind: 'driveway-short' }, { kind: 'fence-left' }],
  },
  {
    buildingId: 'house-3',
    assetUrl: KENNEY_ASSETS.homeTypeC,
    targetWidth: 11.0,
    rotationY: 0,
    extras: [{ kind: 'path-short' }],
  },
  {
    buildingId: 'house-4',
    assetUrl: KENNEY_ASSETS.homeTypeD,
    targetWidth: 11.2,
    rotationY: -Math.PI / 2,
    extras: [{ kind: 'driveway-short' }],
  },
  {
    buildingId: 'apartment',
    assetUrl: KENNEY_ASSETS.apartmentBlock,
    targetWidth: 16.0,
    rotationY: -Math.PI / 2,
    sign: { text: 'RIVERSIDE APARTMENTS', width: 4.5, height: 0.65, fontSize: 34 },
  },
  {
    buildingId: 'community-hall',
    assetUrl: KENNEY_ASSETS.communityHall,
    targetWidth: 16.0,
    rotationY: SOUTH,
    sign: { text: 'COMMUNITY HALL', width: 4.2, height: 0.7, fontSize: 38 },
  },
  {
    buildingId: 'clinic',
    assetUrl: KENNEY_ASSETS.clinic,
    targetWidth: 13.5,
    rotationY: SOUTH,
    sign: { text: 'CLINIC', width: 2.8, height: 0.6, fontSize: 40 },
  },
  {
    buildingId: 'school',
    assetUrl: KENNEY_ASSETS.school,
    targetWidth: 17.5,
    rotationY: SOUTH,
    sign: { text: 'RIVERSIDE SCHOOL', width: 4.8, height: 0.7, fontSize: 36 },
  },
  {
    buildingId: 'store',
    assetUrl: KENNEY_ASSETS.storeGeneral,
    targetWidth: 13.5,
    rotationY: 0,
    sign: { text: 'GENERAL STORE', width: 4.2, height: 0.75, fontSize: 44 },
    extras: [
      { kind: 'awning' },
      { kind: 'path-short', scaleMultiplier: 1.15 },
      { kind: 'driveway-short', scaleMultiplier: 0.7 },
    ],
  },
  {
    buildingId: 'cafe',
    assetUrl: KENNEY_ASSETS.cafeBistro,
    targetWidth: 12.2,
    rotationY: SOUTH,
    sign: { text: 'RIVERSIDE CAFE', width: 3.6, height: 0.65, fontSize: 38 },
    extras: [{ kind: 'parasol-right' }, { kind: 'path-short' }],
  },
  {
    buildingId: 'workshop',
    assetUrl: KENNEY_ASSETS.workshopIndustrial,
    targetWidth: 15.0,
    rotationY: 0,
    sign: { text: 'RIVERSIDE WORKSHOP', width: 4.4, height: 0.75, fontSize: 38 },
    extras: [{ kind: 'road-driveway' }],
  },
  {
    buildingId: 'warehouse',
    assetUrl: KENNEY_ASSETS.warehouse,
    targetWidth: 19.0,
    rotationY: SOUTH,
    sign: { text: 'WAREHOUSE', width: 3.6, height: 0.65, fontSize: 40 },
    extras: [{ kind: 'road-driveway', scaleMultiplier: 1.2 }],
  },
  {
    buildingId: 'utility',
    assetUrl: KENNEY_ASSETS.utilityStation,
    targetWidth: 13.5,
    rotationY: SOUTH,
    sign: { text: 'UTILITY', width: 2.8, height: 0.6, fontSize: 40 },
  },
  {
    buildingId: 'farmhouse',
    assetUrl: KENNEY_ASSETS.farmhouse,
    targetWidth: 12.5,
    rotationY: -Math.PI / 2,
    sign: { text: 'RIVERSIDE FARM', width: 3.4, height: 0.6, fontSize: 36 },
    extras: [{ kind: 'path-long' }],
  },
];

export function getBuildingPosition(id: string) {
  return pos(id);
}
