import { describe, expect, it } from 'vitest';
import { analyseRiverPixels, isWaterishPixel, RIVER_EVIDENCE_THRESHOLDS } from '@/rendering/riverOverviewReadability';

describe('WF01 R5 river overview readability diagnostics', () => {
  it('classifies north-star-family water blue pixels', () => {
    expect(isWaterishPixel(30, 100, 200)).toBe(true);
    expect(isWaterishPixel(60, 90, 80)).toBe(false);
    expect(isWaterishPixel(200, 200, 50)).toBe(false);
  });

  it('computes water fraction from synthetic buffer', () => {
    const w = 100;
    const h = 50;
    const data = new Uint8ClampedArray(w * h * 4);
    for (let y = 20; y < 30; y += 1) {
      for (let x = 60; x < 95; x += 1) {
        const i = (y * w + x) * 4;
        data[i] = 30;
        data[i + 1] = 110;
        data[i + 2] = 210;
        data[i + 3] = 255;
      }
    }
    const metrics = analyseRiverPixels(data, w, h);
    expect(metrics.waterFraction).toBeGreaterThan(RIVER_EVIDENCE_THRESHOLDS.g1OverviewRoiWater);
    expect(metrics.continuityFraction).toBeGreaterThan(RIVER_EVIDENCE_THRESHOLDS.g2Continuity);
  });
});
