/**
 * Facility street camera presets — M02-020 presentation fix.
 *
 * World Lab uses R10 streetPortalCamera (presentation AABB + approach fallback).
 * Legacy mode keeps layout-AABB heuristic + frozen home-street reference.
 */
import { getBuildingById, getFacilityPoint } from '@/world/facilityPoints';
import { terrainHeightAt } from '@/world/townLayout';
import { LOCATIONS } from '@/simulation/model/locations';
import {
  assertFacilityPortalOutsideBuilding,
  resolveFacilityStreetPortal,
  shouldUseStreetPortal,
} from './streetPortalCamera';
import {
  isInsidePresentationAabb,
  resolvePresentationWorldAabb,
} from './assets/presentationBounds';
import { isWorldLabActive } from '@/world/resolver/worldResolver';
import type { CameraPreset } from './cameraPresets';

export type FacilityStreetView = 'home-street' | 'store-street' | 'workshop-street';

const FACILITY_FOR_VIEW: Record<FacilityStreetView, string> = {
  'home-street': 'house-1',
  'store-street': 'store',
  'workshop-street': 'workshop',
};

interface BuildingAabb {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  minY: number;
  maxY: number;
}

function legacyLayoutAabb(facilityId: string): BuildingAabb {
  const building = getBuildingById(facilityId);
  const halfW = building.size.width / 2;
  const halfD = building.size.depth / 2;
  const groundY = terrainHeightAt(building.position.x, building.position.z);
  return {
    minX: building.position.x - halfW,
    maxX: building.position.x + halfW,
    minZ: building.position.z - halfD,
    maxZ: building.position.z + halfD,
    minY: groundY,
    maxY: groundY + building.size.height,
  };
}

export function isPointInsideBuildingVolume(
  x: number,
  y: number,
  z: number,
  facilityId: string,
  padding = 0.4,
): boolean {
  if (isWorldLabActive()) {
    return isInsidePresentationAabb(
      x,
      y,
      z,
      resolvePresentationWorldAabb(facilityId),
      padding,
    );
  }
  const box = legacyLayoutAabb(facilityId);
  return (
    x >= box.minX - padding &&
    x <= box.maxX + padding &&
    z >= box.minZ - padding &&
    z <= box.maxZ + padding &&
    y >= box.minY - padding &&
    y <= box.maxY + padding
  );
}

const HOME_STREET_PRESET: CameraPreset = {
  position: [16, 5.5, -3],
  target: [11, 2.2, -5.5],
};

const FACILITY_SIM_POINT: Partial<Record<FacilityStreetView, { x: number; z: number }>> = {
  'store-street': LOCATIONS.store.point,
  'workshop-street': LOCATIONS.work.point,
};

export function computeFacilityStreetPreset(view: FacilityStreetView): CameraPreset {
  if (shouldUseStreetPortal()) {
    return resolveFacilityStreetPortal(view);
  }

  if (view === 'home-street') {
    return HOME_STREET_PRESET;
  }

  const facilityId = FACILITY_FOR_VIEW[view];
  const point = getFacilityPoint(facilityId);
  const simPoint = FACILITY_SIM_POINT[view];
  const targetX = simPoint?.x ?? point.presentationSpot.x;
  const targetZ = simPoint?.z ?? point.presentationSpot.z;
  const targetY = terrainHeightAt(targetX, targetZ) + 0.95;

  let camX = targetX + 6.5;
  let camZ = targetZ - 6.5;
  let camY = targetY + 4.2;
  if (view === 'workshop-street') {
    camX = targetX + 13;
    camZ = targetZ - 1.5;
    camY = targetY + 7.2;
  }

  let guard = 0;
  while (isPointInsideBuildingVolume(camX, camY, camZ, facilityId) && guard < 16) {
    camX += 0.75;
    camZ -= 0.5;
    guard += 1;
  }

  if (isPointInsideBuildingVolume(camX, camY, camZ, facilityId)) {
    throw new Error(`Unable to place ${view} camera outside ${facilityId} footprint`);
  }

  return {
    position: [camX, camY, camZ],
    target: [targetX, targetY, targetZ],
  };
}

export function assertCameraOutsideFacilityBuilding(
  position: [number, number, number],
  view: FacilityStreetView,
): { ok: true } | { ok: false; reason: string } {
  if (shouldUseStreetPortal()) {
    return assertFacilityPortalOutsideBuilding(view);
  }
  const facilityId = FACILITY_FOR_VIEW[view];
  if (isPointInsideBuildingVolume(position[0], position[1], position[2], facilityId)) {
    return {
      ok: false,
      reason: `${view} camera at [${position.map((v) => v.toFixed(1)).join(', ')}] is inside ${facilityId} building volume`,
    };
  }
  return { ok: true };
}

export { assertFacilityPortalOutsideBuilding };
