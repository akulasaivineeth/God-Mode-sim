import { describe, expect, it } from 'vitest';
import { LEGACY_CANONICAL_TOWN } from '@/world/townLayout';
import {
  bridgePlacementOnRiver,
  buildRiverRibbonGeometry,
  R5_RIVER_CROSS_SECTION,
} from '@/rendering/environment/riverGeometry';
import { R5_RIVER_CROSS_SECTION as SECTION } from '@/rendering/environment/riverCrossSection';

describe('M02 R8 river presentation', () => {
  it('widens ribbon modestly without changing authored centerline nodes', () => {
    expect(SECTION.presentationScale).toBeGreaterThanOrEqual(1.1);
    expect(SECTION.presentationScale).toBeLessThanOrEqual(1.35);
    expect(LEGACY_CANONICAL_TOWN.river.points.length).toBeGreaterThan(3);
  });

  it('places bridge on the authored polyline near the main east-west crossing', () => {
    const bridge = bridgePlacementOnRiver(LEGACY_CANONICAL_TOWN.river.points, 0);
    expect(bridge.z).toBe(0);
    expect(bridge.x).toBeGreaterThan(68);
    expect(bridge.x).toBeLessThan(80);
  });

  it('uses authored river colors in ribbon geometry', () => {
    const { water, bank } = buildRiverRibbonGeometry(
      LEGACY_CANONICAL_TOWN.river.points,
      R5_RIVER_CROSS_SECTION,
      { waterColor: LEGACY_CANONICAL_TOWN.river.color, bankColor: LEGACY_CANONICAL_TOWN.river.bankColor },
    );
    expect(water.attributes.position.count).toBeGreaterThan(0);
    expect(bank.attributes.position.count).toBeGreaterThan(0);
  });
});
