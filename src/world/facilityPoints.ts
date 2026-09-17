/**
 * Authored facility entrance / interior points for M02 pathfinding (spec §30.8).
 * WF02 R9 — resolved from active world definition (single source of truth).
 */
import type { Vec2 } from './townLayout';
import { CANONICAL_TOWN } from './townLayout';
import {
  resolveEntrances,
  resolveEntranceForFacility,
  resolveM02Assignments,
} from './resolver/worldResolver';

export type FacilityPresentationKind = 'chair' | 'counter' | 'workbench';

export interface FacilityPoint {
  facilityId: string;
  label: string;
  entrance: Vec2;
  interior: Vec2;
  presentationSpot: Vec2;
  presentationKind: FacilityPresentationKind;
  indoorFacingRadians: number;
}

export const M02_CITIZEN_ASSIGNMENTS = resolveM02Assignments();

export const FACILITY_POINTS: readonly FacilityPoint[] = resolveEntrances().map((entry) => ({
  facilityId: entry.facilityId,
  label: entry.label,
  entrance: entry.entrance,
  interior: entry.interior,
  presentationSpot: entry.presentationSpot,
  presentationKind: entry.presentationKind,
  indoorFacingRadians: entry.indoorFacingRadians,
}));

export function getFacilityPoint(facilityId: string): FacilityPoint {
  const entry = resolveEntranceForFacility(facilityId);
  return {
    facilityId: entry.facilityId,
    label: entry.label,
    entrance: entry.entrance,
    interior: entry.interior,
    presentationSpot: entry.presentationSpot,
    presentationKind: entry.presentationKind,
    indoorFacingRadians: entry.indoorFacingRadians,
  };
}

export function getBuildingById(buildingId: string) {
  const building = CANONICAL_TOWN.buildings.find((entry) => entry.id === buildingId);
  if (!building) {
    throw new Error(`Unknown building: ${buildingId}`);
  }
  return building;
}
