import { describe, expect, it } from 'vitest';
import {
  COMPOSITION_ENVELOPES,
  HERO_CORE_ENVELOPE,
  getCompositionEnvelope,
  insetEnvelopePoly,
} from '@/rendering/environment/compositionEnvelopes';
import { HERO_CORE_BOUNDS } from '@/rendering/environment/VisualTownLayout';
import { pointInPolygon } from '@/rendering/environment/envelopeFillBuilders';

describe('WF02 R7.1 compositionEnvelopes', () => {
  it('lists hero-core and district envelopes from prototype', () => {
    expect(COMPOSITION_ENVELOPES.length).toBeGreaterThanOrEqual(8);
    expect(getCompositionEnvelope('civic-plaza').tier).toBe('core');
    expect(getCompositionEnvelope('orchard-block').tier).toBe('orchard');
  });

  it('hero core envelope matches VisualTownLayout bounds', () => {
    expect(HERO_CORE_ENVELOPE.poly[0]).toEqual([HERO_CORE_BOUNDS.minX, HERO_CORE_BOUNDS.minZ]);
    expect(HERO_CORE_ENVELOPE.poly[2]).toEqual([HERO_CORE_BOUNDS.maxX, HERO_CORE_BOUNDS.maxZ]);
  });

  it('inset shrinks colonnade band inside civic plaza', () => {
    const civic = getCompositionEnvelope('civic-colonnade');
    const inner = insetEnvelopePoly(civic.poly, civic.insetM!);
    const outerCenter = [(civic.poly[0]![0] + civic.poly[2]![0]) / 2, (civic.poly[0]![1] + civic.poly[2]![1]) / 2] as const;
    expect(pointInPolygon(outerCenter[0], outerCenter[1], inner)).toBe(true);
    expect(pointInPolygon(civic.poly[0]![0], civic.poly[0]![1], inner)).toBe(false);
  });
});
