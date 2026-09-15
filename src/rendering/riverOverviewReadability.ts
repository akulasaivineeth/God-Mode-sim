/**
 * River readability diagnostics — evidence harness only (WF01 R5).
 *
 * Pixel/hue classification is GPU/lighting-sensitive; used in Playwright capture
 * manifest, not as unit-test authority.
 */
export interface RiverPixelMetrics {
  /** Fraction of ROI pixels classified as water-blue/cyan. */
  waterFraction: number;
  /** Fraction of full frame classified as water-blue/cyan. */
  fullFrameWaterFraction: number;
  /** Longest continuous water run along horizontal scan through ROI centre. */
  continuityFraction: number;
}

/** Classify RGB as north-star-family water blue/cyan (evidence diagnostic). */
export function isWaterishPixel(r: number, g: number, b: number): boolean {
  if (b < 90 || b <= r + 15) return false;
  if (g > b + 10) return false;
  if (r > 140) return false;
  const saturation = b - Math.min(r, g);
  return saturation >= 18 && b > g;
}

/**
 * Analyse PNG RGBA buffer for river readability metrics.
 * ROI defaults to eastern corridor band (x 55%–100% of width).
 */
export function analyseRiverPixels(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  roi?: { x0: number; y0: number; x1: number; y1: number },
): RiverPixelMetrics {
  const rx0 = roi?.x0 ?? Math.floor(width * 0.55);
  const ry0 = roi?.y0 ?? 0;
  const rx1 = roi?.x1 ?? width;
  const ry1 = roi?.y1 ?? height;

  let roiTotal = 0;
  let roiWater = 0;
  let frameTotal = 0;
  let frameWater = 0;

  const rowWaterRuns: number[] = [];
  const midY = Math.floor((ry0 + ry1) / 2);
  let currentRun = 0;
  let maxRun = 0;

  for (let y = ry0; y < ry1; y += 1) {
    for (let x = rx0; x < rx1; x += 1) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const water = isWaterishPixel(r, g, b);
      roiTotal += 1;
      if (water) roiWater += 1;
      if (y === midY) {
        if (water) {
          currentRun += 1;
          maxRun = Math.max(maxRun, currentRun);
        } else {
          currentRun = 0;
        }
      }
    }
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      frameTotal += 1;
      if (isWaterishPixel(data[i], data[i + 1], data[i + 2])) frameWater += 1;
    }
  }

  const roiWidth = rx1 - rx0;
  rowWaterRuns.push(maxRun);

  return {
    waterFraction: roiTotal > 0 ? roiWater / roiTotal : 0,
    fullFrameWaterFraction: frameTotal > 0 ? frameWater / frameTotal : 0,
    continuityFraction: roiWidth > 0 ? maxRun / roiWidth : 0,
  };
}

/** G1–G3 thresholds for evidence manifest (diagnostic, not unit-test authority). */
export const RIVER_EVIDENCE_THRESHOLDS = {
  g1OverviewRoiWater: 0.02,
  g2Continuity: 0.35,
  g3RiverObliqueWater: 0.04,
} as const;

export function evaluateRiverEvidenceGates(metrics: RiverPixelMetrics, preset: 'overview' | 'river') {
  if (preset === 'overview') {
    return {
      g1: metrics.waterFraction >= RIVER_EVIDENCE_THRESHOLDS.g1OverviewRoiWater,
      g2: metrics.continuityFraction >= RIVER_EVIDENCE_THRESHOLDS.g2Continuity,
      g3: true,
    };
  }
  return {
    g1: true,
    g2: true,
    g3: metrics.fullFrameWaterFraction >= RIVER_EVIDENCE_THRESHOLDS.g3RiverObliqueWater,
  };
}
