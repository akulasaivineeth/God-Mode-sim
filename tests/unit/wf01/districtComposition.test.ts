import { describe, expect, it } from 'vitest';
import { CANONICAL_TOWN } from '@/world/townLayout';
import { buildDistrictCompositionPlacements } from '@/rendering/assets/EnvironmentAssetRegistry';
import { buildDistrictMassingSpec } from '@/rendering/environment/districtMassing';
import { ORCHARD_BLOCK_KCC } from '@/rendering/environment/massSilhouettePlacements';

describe('WF01 R5 district composition', () => {
  it('does not duplicate vacant lot markers (handled by FutureLotPresentation in R3+)', () => {
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

  it('R6 orchard Kenney block lives in massSilhouettePlacements (not legacy registry)', () => {
    const legacy = buildDistrictCompositionPlacements();
    const orchard = CANONICAL_TOWN.farmPlots.find((p) => p.id === 'farm-3');
    const legacyOrchard = legacy.filter(
      (p) =>
        p.source === 'kenney' &&
        p.asset === 'treeSmall' &&
        orchard &&
        Math.abs(p.position.x - orchard.center.x) < 6 &&
        Math.abs(p.position.z - orchard.center.z) < 5,
    );
    expect(legacyOrchard.length).toBe(0);
    expect(ORCHARD_BLOCK_KCC.length).toBeGreaterThanOrEqual(40);
    const spec = buildDistrictMassingSpec();
    expect(spec.kenneyTrees).toHaveLength(0);
  });

  it('R6 removes ground tint zones (terrain vertex bands only)', () => {
    const spec = buildDistrictMassingSpec();
    expect(spec.groundZones).toHaveLength(0);
  });

  it('R6 frontage scatter removed from districtMassing (KCC + CVP replace)', () => {
    const spec = buildDistrictMassingSpec();
    expect(spec.frontageScatter).toHaveLength(0);
  });
});
