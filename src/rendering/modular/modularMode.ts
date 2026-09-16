import { isWorldLabActive } from '@/world/resolver/worldResolver';
import { WORLD_LAB_MODULAR_PROTOTYPE } from '@/world/worldLabModularMode';

const MODULAR_SUPPRESSED_BUILDINGS = new Set([
  'house-1',
  'house-2',
  'store',
  'workshop',
  'cafe',
]);

export function isModularPrototypeActive(): boolean {
  return isWorldLabActive() && WORLD_LAB_MODULAR_PROTOTYPE;
}

export function isBuildingSuppressedByModular(buildingId: string): boolean {
  return isModularPrototypeActive() && MODULAR_SUPPRESSED_BUILDINGS.has(buildingId);
}

export function modularFacilityForBuilding(buildingId: string): string | null {
  if (!isModularPrototypeActive()) return null;
  if (MODULAR_SUPPRESSED_BUILDINGS.has(buildingId)) return buildingId;
  return null;
}
