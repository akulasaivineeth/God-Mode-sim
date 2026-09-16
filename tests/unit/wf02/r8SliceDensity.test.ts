import { describe, expect, it } from 'vitest';
import { KENNEY_ASSETS } from '@/rendering/assets/EnvironmentAssetRegistry';
import {
  buildKenneyPlacementsForView,
  buildVolumePlacementsForView,
} from '@/rendering/environment/massSilhouettePlacements';
import { isInR8SliceZone } from '@/rendering/environment/r8SliceBounds';
import {
  buildR8CivicColonnadeKcc,
  buildR8CommercialFrontageCvp,
  buildR8ResidentialGardenCvp,
  buildR8SliceKenneyPlacements,
  buildR8SliceVolumePlacements,
  getR8SliceCompositionCounts,
} from '@/rendering/environment/r8SliceDensityBuilders';
import { WF02_R8_SLICE_MODE } from '@/rendering/environment/r8SliceMode';
import { isWorldLabActive } from '@/world/resolver/worldResolver';

describe.skipIf(isWorldLabActive())('WF02 R8 Phase 0b slice density', () => {
  it('slice mode is disabled when World Lab supersedes R8', () => {
    expect(WF02_R8_SLICE_MODE).toBe(false);
  });

  it('defines PLAN_R8 slice zone bounds', () => {
    expect(isInR8SliceZone(-20, -10, 'civic')).toBe(true);
    expect(isInR8SliceZone(-10, 12, 'commercial')).toBe(true);
    expect(isInR8SliceZone(22, -18, 'residential')).toBe(true);
    expect(isInR8SliceZone(70, 70, 'civic')).toBe(false);
  });

  it('ships dense civic colonnade with scaled tree-large', () => {
    const ring = buildR8CivicColonnadeKcc();
    expect(ring.length).toBeGreaterThan(40);
    expect(ring.every((t) => t.url === KENNEY_ASSETS.treeLarge)).toBe(true);
    expect(ring.some((t) => (t.scale ?? 0) >= 2.5)).toBe(true);
  });

  it('ships dense commercial and residential CVP within slice', () => {
    expect(buildR8CommercialFrontageCvp().length).toBeGreaterThan(80);
    expect(buildR8ResidentialGardenCvp().length).toBeGreaterThan(30);
  });

  it('includes registered Kenney detail props (planter + path stones)', () => {
    const props = buildR8SliceKenneyPlacements();
    expect(props.some((p) => p.url === KENNEY_ASSETS.planter)).toBe(true);
    expect(props.some((p) => p.url === KENNEY_ASSETS.pathStonesShort)).toBe(true);
  });

  it('overview view uses slice builders only (no orchard/periphery)', () => {
    const kenney = buildKenneyPlacementsForView('overview');
    const vol = buildVolumePlacementsForView('overview');
    expect(kenney.length).toBeGreaterThan(120);
    expect(vol.canopyWarm.length).toBeGreaterThan(150);
    expect(vol.fieldWarm.length).toBe(0);
    expect(kenney.every((p) => p.z <= 28 || p.x <= 52)).toBe(true);
  });

  it('reports slice composition counts for manifest', () => {
    const counts = getR8SliceCompositionCounts();
    expect(counts.civicColonnade).toBeGreaterThan(40);
    expect(counts.commercialFrontageCvp).toBeGreaterThan(80);
    expect(counts.residentialGardenCvp).toBeGreaterThan(30);
  });

  it('buildR8SliceVolumePlacements is deterministic', () => {
    const a = buildR8SliceVolumePlacements();
    const b = buildR8SliceVolumePlacements();
    expect(a).toEqual(b);
  });
});
