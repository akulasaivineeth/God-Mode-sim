import { describe, expect, it } from 'vitest';
import { CANONICAL_TOWN } from '@/world/townLayout';
import { buildDistrictCompositionPlacements } from '@/rendering/assets/EnvironmentAssetRegistry';

describe('WF01 R4.1 district composition', () => {
  it('places corner markers on every vacant lot', () => {
    const placements = buildDistrictCompositionPlacements();
    const lotMarkers = placements.filter(
      (p) => p.source === 'quaternius' && p.asset === 'bush' && CANONICAL_TOWN.vacantPlots.some(
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

  it('places park river-facing path modules', () => {
    const placements = buildDistrictCompositionPlacements();
    const parkPaths = placements.filter((p) => p.source === 'kenney' && p.asset === 'pathShort');
    expect(parkPaths.length).toBe(3);
  });
});
