import { describe, expect, it } from 'vitest';
import { CAMERA_PRESETS } from '@/rendering/cameraPresets';
import {
  assertCameraOutsideFacilityBuilding,
  computeFacilityStreetPreset,
  isPointInsideBuildingVolume,
} from '@/rendering/facilityStreetCamera';

describe('M02-020 facility street cameras', () => {
  it('keeps accepted HOME street reference', () => {
    const home = computeFacilityStreetPreset('home-street');
    expect(home.position).toEqual([16, 5.5, -3]);
    expect(home.target).toEqual([11, 2.2, -5.5]);
  });

  it('places STORE camera outside the building footprint facing the simulation doorstep', () => {
    const store = computeFacilityStreetPreset('store-street');
    expect(store.target[0]).toBeCloseTo(-11, 0);
    expect(store.target[2]).toBeCloseTo(5, 0);
    expect(store.position[2]).toBeLessThan(5);
    expect(store.position[0]).toBeGreaterThan(-6);
    const check = assertCameraOutsideFacilityBuilding(store.position, 'store-street');
    expect(check.ok).toBe(true);
    expect(isPointInsideBuildingVolume(store.position[0], store.position[1], store.position[2], 'store')).toBe(
      false,
    );
  });

  it('places WORKSHOP camera outside the building footprint facing the simulation doorstep', () => {
    const workshop = computeFacilityStreetPreset('workshop-street');
    expect(workshop.target[0]).toBeCloseTo(-11, 0);
    expect(workshop.target[2]).toBeCloseTo(17, 0);
    // M02-021 — elevated east-side oblique clears yard props without framing the store
    expect(workshop.position[0]).toBeCloseTo(2, 0);
    expect(workshop.position[2]).toBeCloseTo(15.5, 0);
    expect(workshop.position[1]).toBeGreaterThan(6);
    const check = assertCameraOutsideFacilityBuilding(workshop.position, 'workshop-street');
    expect(check.ok).toBe(true);
  });

  it('wires presets through CAMERA_PRESETS', () => {
    expect(CAMERA_PRESETS['store-street']).toEqual(computeFacilityStreetPreset('store-street'));
    expect(CAMERA_PRESETS['workshop-street']).toEqual(computeFacilityStreetPreset('workshop-street'));
  });
});
