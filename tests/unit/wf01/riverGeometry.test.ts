import { describe, expect, it } from 'vitest';
import { CANONICAL_TOWN } from '@/world/townLayout';
import {
  buildRiverRibbonGeometry,
  R5_RIVER_CROSS_SECTION,
} from '@/rendering/environment/riverGeometry';

describe('WF01 R5 river ribbon geometry', () => {
  const { points, color, bankColor } = CANONICAL_TOWN.river;

  it('builds water and bank meshes from cross-section authority', () => {
    const { water, bank } = buildRiverRibbonGeometry(points, R5_RIVER_CROSS_SECTION, {
      waterColor: color,
      bankColor,
    });
    expect(water.attributes.position.count).toBeGreaterThan(0);
    expect(bank.attributes.position.count).toBeGreaterThan(0);
  });

  it('keeps bridge anchor on polyline at z=0', () => {
    const crossing = points.find((p) => p.z === 0);
    expect(crossing).toBeDefined();
    expect(crossing!.x).toBeGreaterThan(70);
    expect(crossing!.x).toBeLessThan(78);
  });
});
