import { describe, expect, it } from 'vitest';
import { CAMERA_PRESETS } from '@/rendering/cameraPresets';
import { resolvePresentationTransform } from '@/rendering/assets/buildings/buildingPresentationAnchors';
import { KENNEY_ASSETS } from '@/rendering/assets/EnvironmentAssetRegistry';
import {
  ORCHARD_BLOCK_KCC,
  RESIDENTIAL_STREET_TREES_KCC,
  buildKenneyPlacementsForView,
} from '@/rendering/environment/massSilhouettePlacements';

describe('WF02 R3/R4.1/R6 composition envelopes', () => {
  it('reframes civic square preset to show fountain and civic massing', () => {
    expect(CAMERA_PRESETS.square.position).toEqual([-22, 18, 24]);
    expect(CAMERA_PRESETS.square.target).toEqual([-4, 2, -8]);
  });

  it('includes store/workshop relationship evidence preset', () => {
    expect(CAMERA_PRESETS['store-workshop'].position).toEqual([-20, 8, 18]);
    expect(CAMERA_PRESETS['store-workshop'].target).toEqual([-11, 2, 17]);
  });

  it('applies R7.1 workshop visual mapping from VisualTownLayout', () => {
    const t = resolvePresentationTransform('workshop');
    expect(t.positionOffset).toEqual([1, 0, -3]);
    expect(t.rotationDelta).toBeCloseTo(-0.03, 3);
  });

  it('R7.1 places dense Kenney orchard block inside hero envelope', () => {
    const orchardTrees = ORCHARD_BLOCK_KCC.filter(
      (t) =>
        t.url === KENNEY_ASSETS.treeSmall &&
        t.x >= 52 &&
        t.x <= 88 &&
        t.z >= 58 &&
        t.z <= 78,
    );
    expect(orchardTrees.length).toBeGreaterThanOrEqual(40);
  });

  it('R7.1 orchard block is solid treeSmall grid (no sparse perimeter-only frame)', () => {
    expect(ORCHARD_BLOCK_KCC.every((t) => t.url === KENNEY_ASSETS.treeSmall)).toBe(true);
    expect(ORCHARD_BLOCK_KCC.length).toBeGreaterThanOrEqual(40);
  });

  it('adds residential Kenney street trees via MSS district tier', () => {
    expect(RESIDENTIAL_STREET_TREES_KCC.length).toBeGreaterThanOrEqual(8);
    const overview = buildKenneyPlacementsForView('overview');
    const streetTrees = overview.filter(
      (t) =>
        t.url === KENNEY_ASSETS.treeSmall &&
        t.z < -10 &&
        t.z > -65 &&
        (t.x === 14 || t.x === 48),
    );
    expect(streetTrees.length).toBeGreaterThanOrEqual(8);
  });
});
