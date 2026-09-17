/**
 * WF02 R8 Phase 0b slice bounds — PLAN_R8 §7.1 (world X/Z).
 */
export const R8_SLICE_ZONES = {
  civic: { minX: -40, maxX: -8, minZ: -28, maxZ: 8 },
  commercial: { minX: -36, maxX: 4, minZ: 0, maxZ: 24 },
  residential: { minX: 8, maxX: 52, minZ: -32, maxZ: -4 },
} as const;

export type R8SliceZoneId = keyof typeof R8_SLICE_ZONES;

export function isInR8SliceZone(x: number, z: number, zone: R8SliceZoneId): boolean {
  const b = R8_SLICE_ZONES[zone];
  return x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ;
}

export function isInAnyR8SliceZone(x: number, z: number): boolean {
  return (
    isInR8SliceZone(x, z, 'civic') ||
    isInR8SliceZone(x, z, 'commercial') ||
    isInR8SliceZone(x, z, 'residential')
  );
}
