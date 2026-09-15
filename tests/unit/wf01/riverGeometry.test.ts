import { describe, expect, it } from 'vitest';
import { CANONICAL_TOWN } from '@/world/townLayout';
import {
  buildRiverRibbonGeometry,
  RIVER_WATER_FLOOR_DROP,
  RIVER_WATER_SURFACE_DROP,
} from '@/rendering/environment/riverGeometry';

describe('WF01 R4.1 river cross-section', () => {
  const { points, width, bankWidth, color, bankColor } = CANONICAL_TOWN.river;

  it('builds depressed channel with floor below surface', () => {
    const { water, waterFloor, bank } = buildRiverRibbonGeometry(points, width, bankWidth, {
      waterColor: color,
      bankColor,
    });
    expect(water.attributes.position.count).toBeGreaterThan(0);
    expect(waterFloor.attributes.position.count).toBeGreaterThan(0);
    expect(bank.attributes.position.count).toBeGreaterThan(0);

    const waterY = water.attributes.position.getY(0);
    const floorY = waterFloor.attributes.position.getY(0);
    expect(waterY - floorY).toBeCloseTo(RIVER_WATER_FLOOR_DROP - RIVER_WATER_SURFACE_DROP, 4);
  });

  it('keeps bridge anchor on polyline at z=0', () => {
    const crossing = points.find((p) => p.z === 0);
    expect(crossing).toBeDefined();
    expect(crossing!.x).toBeGreaterThan(70);
    expect(crossing!.x).toBeLessThan(78);
  });
});
