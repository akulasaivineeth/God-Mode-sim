import { describe, expect, it } from 'vitest';
import {
  isBaselineVegetationVisible,
  isCompositionTierVisible,
} from '@/rendering/environment/compositionVisibility';
import { ORCHARD_BLOCK_KCC } from '@/rendering/environment/massSilhouettePlacements';

describe('WF02 R6 composition visibility tiers', () => {
  it('always shows core tier', () => {
    expect(isCompositionTierVisible('core', 'store-street')).toBe(true);
    expect(isCompositionTierVisible('core', 'overview')).toBe(true);
  });

  it('hides park tier on facility street presets', () => {
    expect(isCompositionTierVisible('park', 'home-street')).toBe(false);
    expect(isCompositionTierVisible('park', 'river')).toBe(true);
  });

  it('shows non-empty orchard block on overview', () => {
    expect(isCompositionTierVisible('orchard', 'overview')).toBe(true);
    expect(ORCHARD_BLOCK_KCC.length).toBeGreaterThan(0);
  });

  it('hides baseline Quaternius vegetation on overview and angled', () => {
    expect(isBaselineVegetationVisible('overview')).toBe(false);
    expect(isBaselineVegetationVisible('angled')).toBe(false);
    expect(isBaselineVegetationVisible('street')).toBe(true);
    expect(isBaselineVegetationVisible('store-street')).toBe(true);
  });
});
