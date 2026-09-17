import { describe, expect, it } from 'vitest';
import { isOverlayExcluded } from '@/rendering/environment/compositionMask';
import { isHeroBlockPhase0ProofActive } from '@/rendering/environment/heroBlockProof/heroBlockPhase0ProofMode';
import { isProofPlacementExcluded } from '@/rendering/environment/heroBlockProof/heroBlockPhase0ProofMask';
import {
  buildProofGltfPlacements,
  buildProofGroundEnvelopes,
} from '@/rendering/environment/heroBlockProof/heroBlockPhase0ProofSpec';

describe('WF02 R15 Phase 0 hero-block proof', () => {
  it('proof mode is inactive without URL param', () => {
    expect(isHeroBlockPhase0ProofActive()).toBe(false);
  });

  it('authors five district ground envelopes', () => {
    const envelopes = buildProofGroundEnvelopes();
    expect(envelopes).toHaveLength(5);
    expect(envelopes.map((e) => e.id)).toEqual([
      'civic-plaza-mass',
      'commercial-frontage-mass',
      'residential-block-mass',
      'future-lot-frame-mass',
      'park-river-edge-mass',
    ]);
    for (const envelope of envelopes) {
      expect(envelope.opacity).toBeLessThanOrEqual(0.4);
    }
  });

  it('authors dense prop placements for neighborhood-scale read', () => {
    const placements = buildProofGltfPlacements();
    expect(placements.length).toBeGreaterThan(80);
    const trees = placements.filter((p) => p.urlKey === 'treeLarge' || p.urlKey === 'treeSmall');
    expect(trees.length).toBeGreaterThanOrEqual(24);
  });

  it('excludes proof placements from roads and river corridors', () => {
    expect(isProofPlacementExcluded(0, 0)).toBe(true);
    expect(isProofPlacementExcluded(33, 4)).toBe(true);
  });

  it('allows park-edge placements west of river corridor', () => {
    expect(isOverlayExcluded(16, 4)).toBe(false);
    expect(isProofPlacementExcluded(16, 4, 1.0)).toBe(false);
  });

  it('future lot envelope targets vacant plot center', () => {
    const lot = buildProofGroundEnvelopes().find((e) => e.id === 'future-lot-frame-mass');
    expect(lot).toBeDefined();
    expect(lot!.minX).toBeLessThan(0);
    expect(lot!.maxX).toBeGreaterThan(0);
    expect(lot!.minZ).toBeGreaterThan(20);
  });
});
