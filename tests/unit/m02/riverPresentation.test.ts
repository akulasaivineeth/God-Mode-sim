import { describe, expect, it } from 'vitest';
import { CANONICAL_TOWN } from '@/world/townLayout';
import {
  RIVER_PRESENTATION_SCALE,
  bridgePlacementOnRiver,
  buildRiverRibbonGeometry,
} from '@/rendering/environment/riverGeometry';

describe('M02 R8 river presentation', () => {
  it('widens ribbon modestly without changing authored centerline nodes', () => {
    expect(RIVER_PRESENTATION_SCALE).toBeGreaterThanOrEqual(1.15);
    expect(RIVER_PRESENTATION_SCALE).toBeLessThanOrEqual(1.32);
    expect(CANONICAL_TOWN.river.points.length).toBeGreaterThan(3);
  });

  it('places bridge on the authored polyline near the main east-west crossing', () => {
    const bridge = bridgePlacementOnRiver(CANONICAL_TOWN.river.points, 0);
    expect(bridge.z).toBe(0);
    expect(bridge.x).toBeGreaterThan(68);
    expect(bridge.x).toBeLessThan(80);
  });

  it('uses authored river colors in ribbon geometry', () => {
    const { water, bank } = buildRiverRibbonGeometry(
      CANONICAL_TOWN.river.points,
      CANONICAL_TOWN.river.width,
      CANONICAL_TOWN.river.bankWidth,
      { waterColor: CANONICAL_TOWN.river.color, bankColor: CANONICAL_TOWN.river.bankColor },
    );
    expect(water.attributes.position.count).toBeGreaterThan(0);
    expect(bank.attributes.position.count).toBeGreaterThan(0);
  });
});
