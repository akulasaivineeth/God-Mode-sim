import { describe, expect, it } from 'vitest';
import { CANONICAL_TOWN } from '@/world/townLayout';
import { buildDistrictCompositionPlacements } from '@/rendering/assets/EnvironmentAssetRegistry';

describe('WF01 R5 district composition', () => {
  it('places corner markers on every vacant lot', () => {
    const placements = buildDistrictCompositionPlacements();
    const lotMarkers = placements.filter(
      (p) =>
        p.source === 'quaternius' &&
        p.asset === 'bush' &&
        CANONICAL_TOWN.vacantPlots.some(
          (lot) =>
            Math.abs(p.position.x - (lot.center.x - lot.width * 0.42)) < 0.01 &&
            Math.abs(p.position.z - (lot.center.z + lot.depth * 0.38)) < 0.01,
        ),
    );
    expect(lotMarkers.length).toBe(CANONICAL_TOWN.vacantPlots.length);
  });

  it('places six orchard tree-small instances', () => {
    const placements = buildDistrictCompositionPlacements();
    const orchardTrees = placements.filter((p) => p.source === 'kenney' && p.asset === 'treeSmall');
    expect(orchardTrees.length).toBe(6);
  });

  it('places park river-facing path modules and tree arc', () => {
    const placements = buildDistrictCompositionPlacements();
    const parkPaths = placements.filter((p) => p.source === 'kenney' && p.asset === 'pathShort');
    expect(parkPaths.length).toBe(2);
    const parkTrees = placements.filter(
      (p) => p.position.x >= 72 && p.position.x <= 90 && p.position.z >= 34 && p.position.z <= 46,
    );
    expect(parkTrees.length).toBeGreaterThanOrEqual(4);
  });

  it('includes residential branch hedge line along z≈-44', () => {
    const placements = buildDistrictCompositionPlacements();
    const hedgeXs = new Set([24, 36, 48, 60]);
    const hedge = placements.filter(
      (p) => p.asset === 'bush' && Math.abs(p.position.z + 44) < 1 && hedgeXs.has(p.position.x),
    );
    expect(hedge.length).toBe(4);
  });
});
