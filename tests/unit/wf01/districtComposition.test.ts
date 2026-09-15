import { describe, expect, it } from 'vitest';
import { CANONICAL_TOWN } from '@/world/townLayout';
import { buildDistrictCompositionPlacements } from '@/rendering/assets/EnvironmentAssetRegistry';
import { buildDistrictMassingSpec } from '@/rendering/environment/districtMassing';

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

  it('R4.1 orchard Kenney treeSmall grid lives in district massing (not legacy registry)', () => {
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
    const spec = buildDistrictMassingSpec();
    const massingOrchard = spec.kenneyTrees.filter(
      (t) =>
        orchard &&
        Math.abs(t.x - orchard.center.x) < 8 &&
        Math.abs(t.z - orchard.center.z) < 8,
    );
    expect(massingOrchard.length).toBeGreaterThanOrEqual(16);
  });

  it('R4.1 park edge massing uses district ground tint zone (no duplicate kenney path modules)', () => {
    const spec = buildDistrictMassingSpec();
    const parkZone = spec.groundZones.find((z) => z.id === 'park');
    expect(parkZone).toBeDefined();
    expect(parkZone!.minX).toBeLessThanOrEqual(72);
    expect(parkZone!.maxX).toBeGreaterThanOrEqual(88);
  });

  it('R4.1 residential branch frontage scatter along z≈-44', () => {
    const spec = buildDistrictMassingSpec();
    const hedgeXs = new Set([14, 20, 26, 32, 38, 44, 50, 56]);
    const hedge = spec.frontageScatter.filter(
      (p) => Math.abs(p.z + 44) < 1 && [...hedgeXs].some((x) => Math.abs(p.x - x) < 2),
    );
    expect(hedge.length).toBeGreaterThanOrEqual(4);
  });
});
