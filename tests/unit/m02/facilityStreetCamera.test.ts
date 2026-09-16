import { describe, expect, it } from 'vitest';
import { CAMERA_PRESETS } from '@/rendering/cameraPresets';
import {
  assertCameraOutsideFacilityBuilding,
  computeFacilityStreetPreset,
  isPointInsideBuildingVolume,
} from '@/rendering/facilityStreetCamera';
import { LOCATIONS } from '@/simulation/model/locations';

describe('M02-020 facility street cameras', () => {
  it('keeps accepted HOME street reference', () => {
    const home = computeFacilityStreetPreset('home-street');
    expect(home.target[0]).toBeCloseTo(LOCATIONS.home.point.x, 0);
    expect(home.target[2]).toBeCloseTo(LOCATIONS.home.point.z, 0);
    expect(home.position[1]).toBeGreaterThan(3);
  });

  it('places STORE camera outside the building footprint facing the simulation doorstep', () => {
    const store = computeFacilityStreetPreset('store-street');
    expect(store.target[0]).toBeCloseTo(LOCATIONS.store.point.x, 0);
    expect(store.target[2]).toBeCloseTo(LOCATIONS.store.point.z, 0);
    expect(isPointInsideBuildingVolume(store.position[0], store.position[1], store.position[2], 'store')).toBe(
      false,
    );
    const check = assertCameraOutsideFacilityBuilding(store.position, 'store-street');
    expect(check.ok).toBe(true);
  });

  it('places WORKSHOP camera outside the building footprint facing the simulation doorstep', () => {
    const workshop = computeFacilityStreetPreset('workshop-street');
    expect(workshop.target[0]).toBeCloseTo(LOCATIONS.work.point.x, 0);
    expect(workshop.target[2]).toBeCloseTo(LOCATIONS.work.point.z, 0);
    expect(workshop.position[1]).toBeGreaterThan(4);
    const check = assertCameraOutsideFacilityBuilding(workshop.position, 'workshop-street');
    expect(check.ok).toBe(true);
  });

  it('wires presets through CAMERA_PRESETS', () => {
    expect(CAMERA_PRESETS['store-street']).toEqual(computeFacilityStreetPreset('store-street'));
    expect(CAMERA_PRESETS['workshop-street']).toEqual(computeFacilityStreetPreset('workshop-street'));
  });
});
