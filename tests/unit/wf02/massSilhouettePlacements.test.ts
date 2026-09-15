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

describe('WF02 R6 mass silhouette placements', () => {
  it('ships non-empty mandatory hero tables', () => {
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
    expect(a.length).toBeGreaterThan(100);
  });

  it('excludes periphery Kenney on street preset', () => {
    const overview = buildKenneyPlacementsForView('overview');
    const street = buildKenneyPlacementsForView('street');
    expect(overview.length).toBeGreaterThan(street.length);
  });

  it('includes orchard and park volumes on overview', () => {
    const vol = buildVolumePlacementsForView('overview');
    expect(vol.canopyWarm.length).toBeGreaterThan(40);
    expect(vol.fieldWarm.length).toBeGreaterThan(20);
  });
});
