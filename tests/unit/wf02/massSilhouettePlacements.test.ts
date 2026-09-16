import { describe, expect, it } from 'vitest';
import {
  ORCHARD_BLOCK_KCC,
  PARK_RIVER_ARC_KCC,
  PERIPHERY_FOREST_FRAME_KCC,
  CIVIC_COLONNADE_KCC,
  ORCHARD_FIELD_BAND_CVP,
  PARK_PROMENADE_CVP,
  buildKenneyPlacementsForView,
  buildVolumePlacementsForView,
} from '@/rendering/environment/massSilhouettePlacements';
import { WF02_R8_SLICE_MODE } from '@/rendering/environment/r8SliceMode';

describe('WF02 R6 mass silhouette placements', () => {
  it('ships non-empty mandatory hero tables', () => {
    if (WF02_R8_SLICE_MODE) {
      const overview = buildKenneyPlacementsForView('overview');
      const vol = buildVolumePlacementsForView('overview');
      expect(overview.length).toBeGreaterThan(120);
      expect(vol.canopyWarm.length).toBeGreaterThan(150);
      return;
    }
    expect(ORCHARD_BLOCK_KCC.length).toBeGreaterThanOrEqual(40);
    expect(PARK_RIVER_ARC_KCC.length).toBeGreaterThanOrEqual(12);
    expect(PERIPHERY_FOREST_FRAME_KCC.length).toBeGreaterThanOrEqual(40);
    expect(CIVIC_COLONNADE_KCC.length).toBeGreaterThanOrEqual(8);
    expect(ORCHARD_FIELD_BAND_CVP.length).toBeGreaterThanOrEqual(20);
    expect(PARK_PROMENADE_CVP.length).toBeGreaterThanOrEqual(8);
  });

  it('builds deterministic Kenney placements for overview', () => {
    const a = buildKenneyPlacementsForView('overview');
    const b = buildKenneyPlacementsForView('overview');
    expect(a).toEqual(b);
    expect(a.length).toBeGreaterThan(WF02_R8_SLICE_MODE ? 120 : 100);
  });

  it('excludes periphery Kenney on street preset', () => {
    if (WF02_R8_SLICE_MODE) {
      const overview = buildKenneyPlacementsForView('overview');
      const street = buildKenneyPlacementsForView('street');
      expect(overview.length).toBe(street.length);
      return;
    }
    const overview = buildKenneyPlacementsForView('overview');
    const street = buildKenneyPlacementsForView('street');
    expect(overview.length).toBeGreaterThan(street.length);
  });

  it('includes orchard and park volumes on overview', () => {
    const vol = buildVolumePlacementsForView('overview');
    if (WF02_R8_SLICE_MODE) {
      expect(vol.canopyWarm.length).toBeGreaterThan(150);
      expect(vol.fieldWarm.length).toBe(0);
      return;
    }
    expect(vol.canopyWarm.length).toBeGreaterThan(40);
    expect(vol.fieldWarm.length).toBeGreaterThan(20);
  });
});
