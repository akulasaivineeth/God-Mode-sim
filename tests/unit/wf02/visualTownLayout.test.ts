import { describe, expect, it } from 'vitest';
import {
  VISUAL_FACILITY_MAPPINGS,
  assertSimCentersFrozen,
  getVisualFacilityMapping,
  resolveVisualTransform,
  visualOffsetM,
  HERO_CORE_BOUNDS,
} from '@/rendering/environment/VisualTownLayout';
import { LEGACY_CANONICAL_TOWN } from '@/world/townLayout';
import { isWorldLabActive } from '@/world/resolver/worldResolver';
import { HERO_NEIGHBORHOOD_DEFINITION } from '@/world/worldLab/heroNeighborhood';

describe('WF02 R7.1 VisualTownLayout', () => {
  it('maps all legacy facilities in offset table', () => {
    expect(VISUAL_FACILITY_MAPPINGS).toHaveLength(14);
    for (const b of LEGACY_CANONICAL_TOWN.buildings) {
      expect(() => getVisualFacilityMapping(b.id)).not.toThrow();
    }
  });

  it('keeps legacy simulation auth centers frozen when legacy mode', () => {
    if (isWorldLabActive()) {
      assertSimCentersFrozen();
      return;
    }
    for (const mapping of VISUAL_FACILITY_MAPPINGS) {
      const b = LEGACY_CANONICAL_TOWN.buildings.find((x) => x.id === mapping.facilityId)!;
      expect(b.position.x).toBe(mapping.authCenter.x);
      expect(b.position.z).toBe(mapping.authCenter.z);
    }
  });

  it('bounds every legacy visual offset within maxOffsetM', () => {
    for (const mapping of VISUAL_FACILITY_MAPPINGS) {
      expect(visualOffsetM(mapping.facilityId)).toBeLessThanOrEqual(mapping.maxOffsetM + 0.01);
    }
  });

  it('World Lab uses bounded R10 presentation staging offsets', () => {
    if (!isWorldLabActive()) return;
    const store = resolveVisualTransform('store');
    expect(Math.abs(store.positionOffset[0])).toBeLessThanOrEqual(1);
    expect(Math.abs(store.positionOffset[2])).toBeLessThanOrEqual(1);
    const workshop = resolveVisualTransform('workshop');
    expect(Math.abs(workshop.positionOffset[0])).toBeLessThanOrEqual(1);
    expect(Math.abs(workshop.positionOffset[2])).toBeLessThanOrEqual(1);
  });

  it('defines hero core bounds from active world definition in World Lab', () => {
    if (!isWorldLabActive()) {
      expect(HERO_CORE_BOUNDS.minX).toBe(-55);
      expect(HERO_CORE_BOUNDS.maxX).toBe(55);
      return;
    }
    expect(HERO_CORE_BOUNDS).toEqual(HERO_NEIGHBORHOOD_DEFINITION.bounds);
  });
});
