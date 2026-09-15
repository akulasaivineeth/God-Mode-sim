import { describe, expect, it } from 'vitest';
import { isCompositionTierVisible } from '@/rendering/environment/compositionVisibility';
import { ORCHARD_PERIMETER } from '@/rendering/environment/natureMassPlacements';

describe('WF02 R5.1 composition visibility tiers', () => {
  it('always shows core tier', () => {
    expect(isCompositionTierVisible('core', 'store-street')).toBe(true);
    expect(isCompositionTierVisible('core', 'overview')).toBe(true);
  });

  it('hides park tier on facility street presets', () => {
    expect(isCompositionTierVisible('park', 'home-street')).toBe(false);
    expect(isCompositionTierVisible('park', 'river')).toBe(true);
  });

  it('shows orchard on overview via Kenney grid (Quaternius perimeter deferred for budget)', () => {
    expect(isCompositionTierVisible('orchard', 'overview')).toBe(true);
    expect(ORCHARD_PERIMETER).toHaveLength(0);
  });
});
