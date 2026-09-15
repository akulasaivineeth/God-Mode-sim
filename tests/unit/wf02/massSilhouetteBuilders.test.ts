import { describe, expect, it } from 'vitest';
import {
  buildFieldBandRows,
  buildOrchardBlockKenney,
  buildParkRiverArcKenney,
  buildPeripheryForestKenney,
} from '@/rendering/environment/massSilhouetteBuilders';
import { isOverlayExcluded } from '@/rendering/environment/compositionMask';
import { CANONICAL_TOWN } from '@/world/townLayout';

describe('WF02 R6 mass silhouette builders', () => {
  const orchardCenter = CANONICAL_TOWN.farmPlots.find((p) => p.id === 'farm-3')!.center;

  it('orchard block avoids road overlay cells', () => {
    const trees = buildOrchardBlockKenney(orchardCenter);
    for (const t of trees) {
      expect(isOverlayExcluded(t.x, t.z)).toBe(false);
    }
  });

  it('field bands avoid farm road corridor', () => {
    const rows = buildFieldBandRows(orchardCenter, 3, 10, 2.8, 12);
    expect(rows.length).toBeGreaterThan(15);
    for (const r of rows) {
      expect(isOverlayExcluded(r.x, r.z)).toBe(false);
    }
  });

  it('park arc and periphery wall are non-empty', () => {
    expect(buildParkRiverArcKenney().length).toBeGreaterThanOrEqual(12);
    expect(buildPeripheryForestKenney().length).toBeGreaterThanOrEqual(40);
  });
});
