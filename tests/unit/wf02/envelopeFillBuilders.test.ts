import { describe, expect, it } from 'vitest';
import {
  buildCivicHeroEnvelopeFills,
  buildCommercialFrontageCvp,
  buildOrchardBlockEnvelopeKcc,
  buildResidentialClusterCvp,
  listCompositionEnvelopeIds,
} from '@/rendering/environment/envelopeFillBuilders';
import { isOverlayExcluded } from '@/rendering/environment/compositionMask';

import { isWorldLabActive } from '@/world/resolver/worldResolver';

describe.skipIf(isWorldLabActive())('WF02 R7.1 envelopeFillBuilders', () => {
  it('exports all composition envelope ids', () => {
    expect(listCompositionEnvelopeIds()).toContain('hero-core');
    expect(listCompositionEnvelopeIds()).toContain('orchard-block');
  });

  it('builds dense connected civic fills', () => {
    const { plazaCvp, colonnadeKcc } = buildCivicHeroEnvelopeFills();
    expect(plazaCvp.length).toBeGreaterThan(20);
    expect(colonnadeKcc.length).toBeGreaterThan(8);
  });

  it('builds solid orchard block inside envelope', () => {
    const trees = buildOrchardBlockEnvelopeKcc();
    expect(trees.length).toBeGreaterThan(40);
    expect(new Set(trees.map((t) => t.url)).size).toBe(1);
  });

  it('avoids road/water exclusions in commercial frontage', () => {
    const band = buildCommercialFrontageCvp();
    expect(band.length).toBeGreaterThan(15);
    for (const p of band.slice(0, 30)) {
      expect(isOverlayExcluded(p.x, p.z)).toBe(false);
    }
  });

  it('anchors residential gardens at visual house centers', () => {
    const gardens = buildResidentialClusterCvp();
    expect(gardens.length).toBeGreaterThan(20);
    const nearHouse1 = gardens.filter((p) => Math.hypot(p.x - 14, p.z - -8) < 4);
    expect(nearHouse1.length).toBeGreaterThanOrEqual(3);
  });
});
