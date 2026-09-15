import { describe, expect, it } from 'vitest';
import { CANONICAL_TOWN } from '@/world/townLayout';
import {
  ROAD_JUNCTIONS,
  bridgePlacementOnMainRoad,
  buildStraightTiles,
} from '@/rendering/environment/roadTopology';

describe('WF01 road topology', () => {
  it('carves straight tiles around centre crossing and bridge span', () => {
    const bridge = bridgePlacementOnMainRoad(CANONICAL_TOWN.river.points, 0);
    const tiles = buildStraightTiles(CANONICAL_TOWN.roads, bridge);
    expect(tiles.length).toBeGreaterThan(20);
    const nearCenter = tiles.filter((t) => Math.hypot(t.x, t.z) < 5);
    expect(nearCenter.length).toBe(0);
    const onBridge = tiles.filter(
      (t) => t.x >= bridge.exclusion.minX && t.x <= bridge.exclusion.maxX && Math.abs(t.z) < 3,
    );
    expect(onBridge.length).toBe(0);
  });

  it('defines dedicated junction modules for major joins', () => {
    expect(ROAD_JUNCTIONS.length).toBeGreaterThanOrEqual(8);
    const ids = ROAD_JUNCTIONS.map((j) => j.id);
    expect(ids).toContain('center-crossing');
    expect(ids).toContain('commercial-tee');
    expect(ids).toContain('residential-tee');
  });
});
