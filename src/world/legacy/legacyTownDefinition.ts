/**
 * WF02 R9 — legacy 240 m Riverside layout wrapped as a WorldDefinition.
 * Byte-identical to pre-R9 CANONICAL_TOWN for parity tests and rollback.
 */
import type { ActionType } from '@/simulation/model/types';
import { LEGACY_CANONICAL_TOWN } from '../townLayoutLegacy';
import type { FacilityEntranceSpec, NavGraphSpec, SemanticFacilityId, WorldDefinition } from '../types';

function doorstepPoint(id: string, offsetZ: number) {
  const b = LEGACY_CANONICAL_TOWN.buildings.find((building) => building.id === id);
  if (!b) throw new Error(`Unknown building for location: ${id}`);
  return { x: b.position.x, z: b.position.z + offsetZ };
}

const HOME_POINT = doorstepPoint('house-1', 4.5);
const STORE_POINT = doorstepPoint('store', -6);
const WORK_POINT = doorstepPoint('workshop', -6);

const LEGACY_NAV: NavGraphSpec = {
  nodes: {
    SQ: { x: 0, z: 0 },
    RN: { x: 0, z: -10 },
    RW: { x: -11, z: 0 },
    RE: { x: 11, z: 0 },
    home: HOME_POINT,
    store: STORE_POINT,
    work: WORK_POINT,
  },
  edges: [
    ['SQ', 'RN'],
    ['SQ', 'RW'],
    ['SQ', 'RE'],
    ['RN', 'home'],
    ['RE', 'home'],
    ['RW', 'store'],
    ['store', 'work'],
  ],
};

const LEGACY_ENTRANCES: readonly FacilityEntranceSpec[] = [
  {
    semanticId: 'home',
    facilityId: 'house-1',
    label: 'House 1',
    entrance: { x: 11, z: -7.6 },
    interior: { x: 11, z: -8.5 },
    presentationSpot: { x: 11, z: -7.1 },
    presentationKind: 'chair',
    indoorFacingRadians: Math.PI,
    serves: ['sleep', 'toilet', 'shower', 'drink'],
  },
  {
    semanticId: 'store',
    facilityId: 'store',
    label: 'General Store',
    entrance: { x: -11, z: 7.6 },
    interior: { x: -11, z: 9.2 },
    presentationSpot: { x: -11, z: 8.0 },
    presentationKind: 'counter',
    indoorFacingRadians: Math.PI,
    serves: ['eat'],
  },
  {
    semanticId: 'work',
    facilityId: 'workshop',
    label: 'Workshop',
    entrance: { x: -11, z: 20.2 },
    interior: { x: -11, z: 21.5 },
    presentationSpot: { x: -11, z: 20.6 },
    presentationKind: 'workbench',
    indoorFacingRadians: Math.PI,
    serves: ['work'],
  },
];

const ACTION_LOCATION: Record<ActionType, SemanticFacilityId | null> = {
  sleep: 'home',
  toilet: 'home',
  shower: 'home',
  drink: 'home',
  eat: 'store',
  work: 'work',
  idle: null,
};

export const LEGACY_WORLD_DEFINITION: WorldDefinition = {
  id: 'legacy-riverside-wf01',
  version: 1,
  name: 'Riverside (Legacy)',
  bounds: { minX: -120, maxX: 120, minZ: -120, maxZ: 120 },
  layout: LEGACY_CANONICAL_TOWN,
  entrances: LEGACY_ENTRANCES,
  nav: LEGACY_NAV,
  m02Assignments: {
    homeId: 'house-1',
    storeId: 'store',
    workplaceId: 'workshop',
  },
  cameras: {
    overview: { position: [10, 93, 54], target: [30, 2, 4] },
    angled: { position: [68, 53, 37], target: [28, 3, 2] },
    street: { position: [14, 4.5, 24], target: [0, 2.5, 2] },
    square: { position: [-22, 18, 24], target: [-4, 2, -8] },
    'store-workshop': { position: [-20, 8, 18], target: [-11, 2, 17] },
  },
};

export { ACTION_LOCATION as LEGACY_ACTION_LOCATION };
