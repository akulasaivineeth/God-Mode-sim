import { describe, expect, it } from 'vitest';
import { resolvePresentationWorldAabb } from '@/rendering/assets/presentationBounds';
import {
  assertFacilityPortalOutsideBuilding,
  assertStreetPortalOutsideBuildings,
  resolveFacilityStreetPortal,
  resolveStreetCorridorPortal,
  resolveStreetPortal,
} from '@/rendering/streetPortalCamera';
import { LOCATIONS } from '@/simulation/model/locations';

describe('WF02 R10 street portal cameras', () => {
  it('resolves corridor street preset outside commercial bounds', () => {
    const preset = resolveStreetCorridorPortal();
    expect(preset.position[1]).toBeGreaterThan(2.5);
    expect(preset.target[1]).toBeGreaterThan(0.8);
    const check = assertStreetPortalOutsideBuildings(preset, ['store', 'workshop', 'cafe']);
    expect(check.ok).toBe(true);
  });

  it('places home street portal outside house-1 presentation AABB', () => {
    const preset = resolveFacilityStreetPortal('home-street');
    expect(preset.target[0]).toBeCloseTo(LOCATIONS.home.point.x, 0);
    expect(preset.target[2]).toBeCloseTo(LOCATIONS.home.point.z, 0);
    expect(assertFacilityPortalOutsideBuilding('home-street').ok).toBe(true);
  });

  it('places store street portal outside store presentation AABB', () => {
    const preset = resolveFacilityStreetPortal('store-street');
    expect(preset.target[0]).toBeCloseTo(LOCATIONS.store.point.x, 0);
    expect(assertFacilityPortalOutsideBuilding('store-street').ok).toBe(true);
  });

  it('places workshop street portal outside workshop presentation AABB', () => {
    const preset = resolveFacilityStreetPortal('workshop-street');
    expect(preset.target[0]).toBeCloseTo(LOCATIONS.work.point.x, 0);
    expect(assertFacilityPortalOutsideBuilding('workshop-street').ok).toBe(true);
  });

  it('resolveStreetPortal dispatches corridor and facility kinds', () => {
    expect(resolveStreetPortal('street-corridor').position).toEqual(resolveStreetCorridorPortal().position);
    expect(resolveStreetPortal('store-street').target).toEqual(resolveFacilityStreetPortal('store-street').target);
  });
});

describe('presentation world AABB', () => {
  it('returns finite bounds for hero M02 facilities', () => {
    for (const id of ['house-1', 'store', 'workshop']) {
      const aabb = resolvePresentationWorldAabb(id);
      expect(aabb.maxX).toBeGreaterThan(aabb.minX);
      expect(aabb.maxZ).toBeGreaterThan(aabb.minZ);
      expect(aabb.maxY).toBeGreaterThan(aabb.minY);
    }
  });
});
