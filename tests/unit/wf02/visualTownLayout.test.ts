import { describe, expect, it } from 'vitest';
import {
  VISUAL_FACILITY_MAPPINGS,
  assertSimCentersFrozen,
  getVisualFacilityMapping,
  resolveVisualTransform,
  visualOffsetM,
  HERO_CORE_BOUNDS,
} from '@/rendering/environment/VisualTownLayout';
import { CANONICAL_TOWN } from '@/world/townLayout';

describe('WF02 R7.1 VisualTownLayout', () => {
  it('maps all 14 facilities', () => {
    expect(VISUAL_FACILITY_MAPPINGS).toHaveLength(14);
    for (const b of CANONICAL_TOWN.buildings) {
      expect(() => getVisualFacilityMapping(b.id)).not.toThrow();
    }
  });

  it('keeps simulation auth centers frozen', () => {
    assertSimCentersFrozen();
    for (const mapping of VISUAL_FACILITY_MAPPINGS) {
      const b = CANONICAL_TOWN.buildings.find((x) => x.id === mapping.facilityId)!;
      expect(b.position.x).toBe(mapping.authCenter.x);
      expect(b.position.z).toBe(mapping.authCenter.z);
    }
  });

  it('bounds every visual offset within maxOffsetM', () => {
    for (const mapping of VISUAL_FACILITY_MAPPINGS) {
      expect(visualOffsetM(mapping.facilityId)).toBeLessThanOrEqual(mapping.maxOffsetM + 0.01);
    }
  });

  it('matches Phase 0 audit store/workshop visual centers', () => {
    const store = getVisualFacilityMapping('store');
    const workshop = getVisualFacilityMapping('workshop');
    expect(store.visualCenter).toEqual({ x: -10, z: 6 });
    expect(workshop.visualCenter).toEqual({ x: -10, z: 20 });
  });

  it('resolveVisualTransform returns delta from auth center', () => {
    const store = getVisualFacilityMapping('store');
    const t = resolveVisualTransform('store');
    expect(t.positionOffset[0]).toBeCloseTo(store.visualCenter.x - store.authCenter.x);
    expect(t.positionOffset[2]).toBeCloseTo(store.visualCenter.z - store.authCenter.z);
  });

  it('defines hero core bounds per R7.1 §6.2', () => {
    expect(HERO_CORE_BOUNDS.minX).toBe(-55);
    expect(HERO_CORE_BOUNDS.maxX).toBe(55);
    expect(HERO_CORE_BOUNDS.maxZ).toBe(35);
  });
});
