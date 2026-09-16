/**
 * WF02 R7.1 Phase 1 — bounded presentation layout mapping.
 * Simulation centers in CANONICAL_TOWN / facilityPoints.ts remain authoritative.
 */
import { CANONICAL_TOWN } from '@/world/townLayout';

export interface VisualTransform {
  positionOffset: [number, number, number];
  rotationDelta: number;
}

function getAuthPosition(buildingId: string): { x: number; z: number } {
  const b = CANONICAL_TOWN.buildings.find((entry) => entry.id === buildingId);
  if (!b) throw new Error(`Unknown building: ${buildingId}`);
  return b.position;
}

export interface VisualFacilityMapping {
  facilityId: string;
  authCenter: { x: number; z: number };
  visualCenter: { x: number; z: number };
  rotationDelta: number;
  maxOffsetM: number;
}

/** Phase 0 validated mappings @ visual_layout_audit_r71.json */
export const VISUAL_FACILITY_MAPPINGS: readonly VisualFacilityMapping[] = [
  { facilityId: 'community-hall', authCenter: { x: -18, z: -18 }, visualCenter: { x: -16, z: -14 }, rotationDelta: 0, maxOffsetM: 6 },
  { facilityId: 'clinic', authCenter: { x: -42, z: -14 }, visualCenter: { x: -38, z: -12 }, rotationDelta: -0.03, maxOffsetM: 6 },
  { facilityId: 'school', authCenter: { x: -24, z: -48 }, visualCenter: { x: -22, z: -44 }, rotationDelta: 0, maxOffsetM: 6 },
  { facilityId: 'house-1', authCenter: { x: 11, z: -10 }, visualCenter: { x: 14, z: -8 }, rotationDelta: 0, maxOffsetM: 4 },
  { facilityId: 'house-2', authCenter: { x: 30, z: -12 }, visualCenter: { x: 28, z: -10 }, rotationDelta: 0.06, maxOffsetM: 4 },
  { facilityId: 'house-3', authCenter: { x: 11, z: -30 }, visualCenter: { x: 14, z: -28 }, rotationDelta: 0, maxOffsetM: 4 },
  { facilityId: 'house-4', authCenter: { x: 30, z: -30 }, visualCenter: { x: 28, z: -28 }, rotationDelta: -0.04, maxOffsetM: 4 },
  { facilityId: 'apartment', authCenter: { x: 52, z: -22 }, visualCenter: { x: 46, z: -20 }, rotationDelta: 0.04, maxOffsetM: 8 },
  { facilityId: 'store', authCenter: { x: -11, z: 11 }, visualCenter: { x: -10, z: 6 }, rotationDelta: 0, maxOffsetM: 5.5 },
  { facilityId: 'cafe', authCenter: { x: -30, z: 12 }, visualCenter: { x: -28, z: 10 }, rotationDelta: 0.05, maxOffsetM: 5 },
  { facilityId: 'workshop', authCenter: { x: -11, z: 23 }, visualCenter: { x: -10, z: 20 }, rotationDelta: -0.03, maxOffsetM: 5 },
  { facilityId: 'warehouse', authCenter: { x: -38, z: 48 }, visualCenter: { x: -36, z: 42 }, rotationDelta: 0, maxOffsetM: 8 },
  { facilityId: 'utility', authCenter: { x: -52, z: 30 }, visualCenter: { x: -48, z: 28 }, rotationDelta: -0.05, maxOffsetM: 8 },
  { facilityId: 'farmhouse', authCenter: { x: 28, z: 82 }, visualCenter: { x: 32, z: 68 }, rotationDelta: 0, maxOffsetM: 16 },
] as const;

const mappingById = new Map(VISUAL_FACILITY_MAPPINGS.map((m) => [m.facilityId, m]));

export function getVisualFacilityMapping(facilityId: string): VisualFacilityMapping {
  const mapping = mappingById.get(facilityId);
  if (!mapping) throw new Error(`Unknown visual facility mapping: ${facilityId}`);
  return mapping;
}

export function resolveVisualTransform(buildingId: string): VisualTransform {
  const mapping = getVisualFacilityMapping(buildingId);
  const auth = getAuthPosition(buildingId);
  return {
    positionOffset: [
      mapping.visualCenter.x - auth.x,
      0,
      mapping.visualCenter.z - auth.z,
    ],
    rotationDelta: mapping.rotationDelta,
  };
}

export function visualOffsetM(facilityId: string): number {
  const mapping = getVisualFacilityMapping(facilityId);
  return Math.hypot(
    mapping.visualCenter.x - mapping.authCenter.x,
    mapping.visualCenter.z - mapping.authCenter.z,
  );
}

/** Hero core bounds for envelope scoping (R7.1 §6.2). */
export const HERO_CORE_BOUNDS = {
  minX: -55,
  maxX: 55,
  minZ: -55,
  maxZ: 35,
} as const;

export function isInsideHeroCore(x: number, z: number): boolean {
  return (
    x >= HERO_CORE_BOUNDS.minX &&
    x <= HERO_CORE_BOUNDS.maxX &&
    z >= HERO_CORE_BOUNDS.minZ &&
    z <= HERO_CORE_BOUNDS.maxZ
  );
}

/** Sim auth centers unchanged vs CANONICAL_TOWN. */
export function assertSimCentersFrozen(): void {
  for (const mapping of VISUAL_FACILITY_MAPPINGS) {
    const b = CANONICAL_TOWN.buildings.find((entry) => entry.id === mapping.facilityId);
    if (!b) throw new Error(`Missing building ${mapping.facilityId}`);
    if (b.position.x !== mapping.authCenter.x || b.position.z !== mapping.authCenter.z) {
      throw new Error(`Auth center drift for ${mapping.facilityId}`);
    }
  }
}
