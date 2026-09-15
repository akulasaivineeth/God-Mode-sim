import { CANONICAL_TOWN } from '@/world/townLayout';

/** Building IDs that skip the generic BuildingMesh shell entirely (WF01 — all major facilities). */
export const DEDICATED_BUILDING_IDS = new Set<string>(
  CANONICAL_TOWN.buildings.map((building) => building.id),
);

export function usesDedicatedVisual(buildingId: string): boolean {
  return DEDICATED_BUILDING_IDS.has(buildingId);
}
