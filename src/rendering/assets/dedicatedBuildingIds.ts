import { M02_CITIZEN_ASSIGNMENTS } from '@/world/facilityPoints';

/** Building IDs that skip the generic BuildingMesh shell entirely. */
export const DEDICATED_BUILDING_IDS = new Set<string>([
  M02_CITIZEN_ASSIGNMENTS.homeId,
  M02_CITIZEN_ASSIGNMENTS.storeId,
  M02_CITIZEN_ASSIGNMENTS.workplaceId,
]);

export function usesDedicatedVisual(buildingId: string): boolean {
  return DEDICATED_BUILDING_IDS.has(buildingId);
}
