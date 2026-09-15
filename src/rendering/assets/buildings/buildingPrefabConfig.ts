/**
 * WF01 prefab-backed facility presentation config.
 * Positions read from CANONICAL_TOWN; simulation IDs unchanged.
 */
import { CANONICAL_TOWN } from '@/world/townLayout';
import { KENNEY_ASSETS } from '../EnvironmentAssetRegistry';

export interface PrefabExtra {
  url: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  targetWidth?: number;
  castShadow?: boolean;
}

export interface BuildingPrefabConfig {
  buildingId: string;
  assetUrl: string;
  targetWidth: number;
  /** Y rotation for south-facing (-Z) facade toward public realm. */
  rotationY?: number;
  sign?: { text: string; position: [number, number, number]; width: number; height: number; fontSize: number };
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
    targetWidth: 7.8,
    rotationY: -Math.PI / 2,
    sign: { text: '11 Riverside Lane', position: [0, 4.1, 4.5], width: 3.0, height: 0.55, fontSize: 36 },
    extras: [
      { url: KENNEY_ASSETS.pathShort, position: [0, 0.02, 6.2], scale: 2.8, castShadow: false },
      { url: KENNEY_ASSETS.fenceLow, position: [-2.4, 0, 4.8], rotation: [0, Math.PI / 2, 0], scale: 2.2, castShadow: false },
      { url: KENNEY_ASSETS.fenceLow, position: [2.4, 0, 4.8], rotation: [0, Math.PI / 2, 0], scale: 2.2, castShadow: false },
    ],
  },
  {
    buildingId: 'house-2',
    assetUrl: KENNEY_ASSETS.homeTypeA,
    targetWidth: 7.5,
    rotationY: -Math.PI / 2,
    extras: [
      { url: KENNEY_ASSETS.drivewayShort, position: [0, 0.02, 5.5], scale: 2.0, castShadow: false },
      { url: KENNEY_ASSETS.fenceLow, position: [-2.2, 0, 4.2], rotation: [0, Math.PI / 2, 0], scale: 2.0, castShadow: false },
    ],
  },
  {
    buildingId: 'house-3',
    assetUrl: KENNEY_ASSETS.homeTypeC,
    targetWidth: 7.5,
    rotationY: 0,
    extras: [{ url: KENNEY_ASSETS.pathShort, position: [0, 0.02, 5.8], scale: 2.6, castShadow: false }],
  },
  {
    buildingId: 'house-4',
    assetUrl: KENNEY_ASSETS.homeTypeD,
    targetWidth: 7.8,
    rotationY: -Math.PI / 2,
    extras: [{ url: KENNEY_ASSETS.drivewayShort, position: [0, 0.02, 5.5], scale: 2.0, castShadow: false }],
  },
  {
    buildingId: 'apartment',
    assetUrl: KENNEY_ASSETS.apartmentBlock,
    targetWidth: 11.5,
    rotationY: -Math.PI / 2,
    sign: { text: 'RIVERSIDE APARTMENTS', position: [0, 8.5, 5.8], width: 4.5, height: 0.65, fontSize: 34 },
  },
  {
    buildingId: 'community-hall',
    assetUrl: KENNEY_ASSETS.communityHall,
    targetWidth: 11.5,
    rotationY: SOUTH,
    sign: { text: 'COMMUNITY HALL', position: [0, 5.8, -5.5], width: 4.2, height: 0.7, fontSize: 38 },
  },
  {
    buildingId: 'clinic',
    assetUrl: KENNEY_ASSETS.clinic,
    targetWidth: 9.5,
    rotationY: SOUTH,
    sign: { text: 'CLINIC', position: [0, 4.8, -4.8], width: 2.8, height: 0.6, fontSize: 40 },
  },
  {
    buildingId: 'school',
    assetUrl: KENNEY_ASSETS.school,
    targetWidth: 12.5,
    rotationY: SOUTH,
    sign: { text: 'RIVERSIDE SCHOOL', position: [0, 5.5, -5.8], width: 4.8, height: 0.7, fontSize: 36 },
  },
  {
    buildingId: 'store',
    assetUrl: KENNEY_ASSETS.storeGeneral,
    targetWidth: 9.5,
    rotationY: 0,
    sign: { text: 'GENERAL STORE', position: [0, 5.2, -5.2], width: 4.2, height: 0.75, fontSize: 44 },
    extras: [
      { url: KENNEY_ASSETS.storeAwning, position: [0, 3.1, -4.2], scale: 2.45, castShadow: false },
      { url: KENNEY_ASSETS.pathShort, position: [0, 0.02, -6.2], scale: 3.2, castShadow: false },
      { url: KENNEY_ASSETS.drivewayShort, position: [0, 0.02, -7.4], scale: 1.4, castShadow: false },
    ],
  },
  {
    buildingId: 'cafe',
    assetUrl: KENNEY_ASSETS.cafeBistro,
    targetWidth: 8.5,
    rotationY: SOUTH,
    sign: { text: 'RIVERSIDE CAFE', position: [0, 4.6, -4.8], width: 3.6, height: 0.65, fontSize: 38 },
    extras: [
      { url: KENNEY_ASSETS.cafeParasol, position: [2.2, 0, -5.2], scale: 1.8, castShadow: false },
      { url: KENNEY_ASSETS.pathShort, position: [0, 0.02, -5.8], scale: 2.8, castShadow: false },
    ],
  },
  {
    buildingId: 'workshop',
    assetUrl: KENNEY_ASSETS.workshopIndustrial,
    targetWidth: 11.5,
    rotationY: 0,
    sign: { text: 'RIVERSIDE WORKSHOP', position: [0, 5.4, -5.4], width: 4.4, height: 0.75, fontSize: 38 },
    extras: [{ url: KENNEY_ASSETS.roadDriveway, position: [0, 0.02, -6.8], scale: 1.85, castShadow: false }],
  },
  {
    buildingId: 'warehouse',
    assetUrl: KENNEY_ASSETS.warehouse,
    targetWidth: 13.5,
    rotationY: SOUTH,
    sign: { text: 'WAREHOUSE', position: [0, 6.2, -6.2], width: 3.6, height: 0.65, fontSize: 40 },
    extras: [{ url: KENNEY_ASSETS.roadDriveway, position: [0, 0.02, -7.5], scale: 2.2, castShadow: false }],
  },
  {
    buildingId: 'utility',
    assetUrl: KENNEY_ASSETS.utilityStation,
    targetWidth: 9.5,
    rotationY: SOUTH,
    sign: { text: 'UTILITY', position: [0, 4.5, -4.8], width: 2.8, height: 0.6, fontSize: 40 },
  },
  {
    buildingId: 'farmhouse',
    assetUrl: KENNEY_ASSETS.farmhouse,
    targetWidth: 8.5,
    rotationY: -Math.PI / 2,
    sign: { text: 'RIVERSIDE FARM', position: [0, 4.2, 4.8], width: 3.4, height: 0.6, fontSize: 36 },
    extras: [{ url: KENNEY_ASSETS.pathLong, position: [0, 0.02, 6.5], scale: 3.0, castShadow: false }],
  },
];

export function getBuildingPosition(id: string) {
  return pos(id);
}
