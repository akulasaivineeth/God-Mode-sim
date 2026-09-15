import { describe, expect, it } from 'vitest';
import { CANONICAL_TOWN } from '@/world/townLayout';
import { buildDistrictCompositionPlacements } from '@/rendering/assets/EnvironmentAssetRegistry';

describe('WF01 R5 district composition', () => {
  it('does not duplicate vacant lot markers (handled by FutureLotPresentation in R3)', () => {
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
    expect(lotMarkers.length).toBe(0);
  });

  it('avoids duplicate orchard tree-small GLBs (farm rows carry orchard read)', () => {
    const placements = buildDistrictCompositionPlacements();
    const orchard = CANONICAL_TOWN.farmPlots.find((p) => p.id === 'farm-3');
    const orchardTrees = placements.filter(
      (p) =>
        p.source === 'kenney' &&
        p.asset === 'treeSmall' &&
        orchard &&
        Math.abs(p.position.x - orchard.center.x) < 6 &&
        Math.abs(p.position.z - orchard.center.z) < 5,
    );
    expect(orchardTrees.length).toBe(0);
  });

  it('places park river-facing tree arc without duplicate kenney path modules', () => {
    const placements = buildDistrictCompositionPlacements();
    const parkPaths = placements.filter((p) => p.source === 'kenney' && p.asset === 'pathShort');
    expect(parkPaths.length).toBe(0);
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
