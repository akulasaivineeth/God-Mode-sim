/**
 * WF02 R10 — facade-bound street portal cameras for World Lab hero neighborhood.
 * Presentation only — derives lens from presentation AABB + entrance approach.
 */
import { getBuildingById, getFacilityPoint } from '@/world/facilityPoints';
import { terrainHeightAt } from '@/world/townLayout';
import { isWorldLabActive } from '@/world/resolver/worldResolver';
import type { CameraPreset } from './cameraPresets';
import {
  isInsideAnyPresentationAabb,
  isInsidePresentationAabb,
  resolvePresentationWorldAabb,
} from './assets/presentationBounds';

export type StreetPortalKind =
  | 'home-street'
  | 'store-street'
  | 'workshop-street'
  | 'street-corridor';

const FACILITY_FOR_PORTAL: Record<Exclude<StreetPortalKind, 'street-corridor'>, string> = {
  'home-street': 'house-1',
  'store-street': 'store',
  'workshop-street': 'workshop',
};

const COMMERCIAL_IDS = ['store', 'workshop', 'cafe'] as const;

const MIN_CLEARANCE = 5;
const MAX_CLEARANCE = 18;
const CITIZEN_EYE_OFFSET = 0.95;

function entranceTarget(facilityId: string): [number, number, number] {
  const point = getFacilityPoint(facilityId);
  const x = point.entrance.x;
  const z = point.entrance.z;
  const y = terrainHeightAt(x, z) + CITIZEN_EYE_OFFSET;
  return [x, y, z];
}

function outwardFromEntrance(facilityId: string): [number, number] {
  const point = getFacilityPoint(facilityId);
  const inwardX = Math.sin(point.indoorFacingRadians);
  const inwardZ = Math.cos(point.indoorFacingRadians);
  return [-inwardX, -inwardZ];
}

function tryPortalPlacement(
  target: [number, number, number],
  approachX: number,
  approachZ: number,
  blockIds: readonly string[],
  baseHeight = 2.8,
): CameraPreset | null {
  const [targetX, targetY, targetZ] = target;
  let lateral = 0;

  for (let dist = MIN_CLEARANCE; dist <= MAX_CLEARANCE; dist += 0.75) {
    for (let sweep = -6; sweep <= 6; sweep += 1) {
      lateral = sweep * 1.1;
      const perpX = -approachZ;
      const perpZ = approachX;
      const camX = targetX + approachX * dist + perpX * lateral;
      const camZ = targetZ + approachZ * dist + perpZ * lateral;
      const camY = targetY + baseHeight;
      if (camY > 12) continue;
      if (isInsideAnyPresentationAabb(camX, camY, camZ, blockIds, 0.65)) continue;
      return {
        position: [camX, camY, camZ],
        target: [targetX, targetY, targetZ],
      };
    }
  }
  return null;
}

export function resolveFacilityStreetPortal(kind: Exclude<StreetPortalKind, 'street-corridor'>): CameraPreset {
  const facilityId = FACILITY_FOR_PORTAL[kind];
  getBuildingById(facilityId);
  const target = entranceTarget(facilityId);
  const [approachX, approachZ] = outwardFromEntrance(facilityId);
  const baseHeight = kind === 'workshop-street' ? 3.4 : 2.8;
  const preset =
    tryPortalPlacement(target, approachX, approachZ, [facilityId], baseHeight) ??
    tryPortalPlacement(target, approachX, approachZ, [facilityId], baseHeight + 1.5);

  if (!preset) {
    throw new Error(`Unable to place ${kind} street portal outside ${facilityId} presentation bounds`);
  }
  return preset;
}

/** Commercial corridor — sidewalk south of frontage, citizen eye height, ≥2 shopfronts in frame. */
export function resolveStreetCorridorPortal(): CameraPreset {
  const storeTarget = entranceTarget('store');
  const workshopTarget = entranceTarget('workshop');
  const targetX = (storeTarget[0] + workshopTarget[0]) / 2;
  const targetZ = (storeTarget[2] + workshopTarget[2]) / 2 - 0.8;
  const targetY = terrainHeightAt(targetX, targetZ) + CITIZEN_EYE_OFFSET;
  const target: [number, number, number] = [targetX, targetY, targetZ];

  // Camera on commercial road / sidewalk looking north at frontage.
  const approachX = 0;
  const approachZ = -1;
  const preset =
    tryPortalPlacement(target, approachX, approachZ, COMMERCIAL_IDS, 2.6) ??
    tryPortalPlacement(target, approachX, approachZ, COMMERCIAL_IDS, 3.8);

  if (!preset) {
    throw new Error('Unable to place street-corridor portal outside commercial presentation bounds');
  }
  return preset;
}

export function resolveStreetPortal(kind: StreetPortalKind): CameraPreset {
  if (kind === 'street-corridor') return resolveStreetCorridorPortal();
  return resolveFacilityStreetPortal(kind);
}

export function assertStreetPortalOutsideBuildings(
  preset: CameraPreset,
  blockIds: readonly string[],
): { ok: true } | { ok: false; reason: string } {
  const [x, y, z] = preset.position;
  if (isInsideAnyPresentationAabb(x, y, z, blockIds, 0.5)) {
    return {
      ok: false,
      reason: `Camera at [${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}] intersects presentation bounds`,
    };
  }
  return { ok: true };
}

export function assertFacilityPortalOutsideBuilding(
  kind: Exclude<StreetPortalKind, 'street-corridor'>,
): { ok: true } | { ok: false; reason: string } {
  const preset = resolveFacilityStreetPortal(kind);
  const facilityId = FACILITY_FOR_PORTAL[kind];
  const aabb = resolvePresentationWorldAabb(facilityId);
  if (isInsidePresentationAabb(preset.position[0], preset.position[1], preset.position[2], aabb, 0.5)) {
    return {
      ok: false,
      reason: `${kind} camera inside ${facilityId} presentation AABB`,
    };
  }
  return { ok: true };
}

/** Legacy path when World Lab inactive — caller handles fallback. */
export function shouldUseStreetPortal(): boolean {
  return isWorldLabActive();
}
