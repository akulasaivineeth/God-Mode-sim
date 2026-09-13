/**
 * Authored facility entrance / interior points for M02 pathfinding (spec §30.8).
 *
 * Plain English: Buildings are drawn as boxes, but citizens need deterministic
 * door positions and simple interior anchors. These are presentation-adjacent
 * authored metadata — not dynamic simulation state.
 */
import type { Vec2 } from './townLayout';
import { CANONICAL_TOWN } from './townLayout';

export interface FacilityPoint {
  /** Matches Building.id in townLayout. */
  facilityId: string;
  label: string;
  /** Ground-plane door / arrival point facing the public realm. */
  entrance: Vec2;
  /** Simple interior anchor used while performing indoor actions. */
  interior: Vec2;
}

/** M02 vertical slice — one citizen's home, store, and workplace. */
export const M02_CITIZEN_ASSIGNMENTS = {
  homeId: 'house-1',
  storeId: 'store',
  workplaceId: 'workshop',
} as const;

/**
 * Deterministic entrance points derived from building footprints.
 * Each entrance sits on the footprint edge closest to the main road network.
 */
export const FACILITY_POINTS: readonly FacilityPoint[] = [
  {
    facilityId: 'house-1',
    label: 'House 1',
    entrance: { x: 11, z: -7.6 },
    interior: { x: 11, z: -8.5 },
  },
  {
    facilityId: 'store',
    label: 'General Store',
    entrance: { x: -11, z: 7.6 },
    interior: { x: -11, z: 9.2 },
  },
  {
    facilityId: 'workshop',
    label: 'Workshop',
    entrance: { x: -11, z: 20.2 },
    interior: { x: -11, z: 21.5 },
  },
];

export function getFacilityPoint(facilityId: string): FacilityPoint {
  const point = FACILITY_POINTS.find((entry) => entry.facilityId === facilityId);
  if (!point) {
    throw new Error(`Unknown facility point: ${facilityId}`);
  }
  return point;
}

export function getBuildingById(buildingId: string) {
  const building = CANONICAL_TOWN.buildings.find((entry) => entry.id === buildingId);
  if (!building) {
    throw new Error(`Unknown building: ${buildingId}`);
  }
  return building;
}
