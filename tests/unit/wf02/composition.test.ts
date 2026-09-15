import { describe, expect, it } from 'vitest';
import { CAMERA_PRESETS } from '@/rendering/cameraPresets';
import { resolvePresentationTransform } from '@/rendering/assets/buildings/buildingPresentationAnchors';
import { CANONICAL_TOWN } from '@/world/townLayout';
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

  it('applies R3 workshop presentation offset and rotation', () => {
    const t = resolvePresentationTransform('workshop');
    expect(t.positionOffset).toEqual([0.6, 0, 1.8]);
    expect(t.rotationDelta).toBeCloseTo(-0.03, 3);
  });

  it('R6 places dense Kenney orchard block via massSilhouettePlacements', () => {
    const orchard = CANONICAL_TOWN.farmPlots.find((p) => p.id === 'farm-3');
    expect(orchard).toBeDefined();
    const orchardTrees = ORCHARD_BLOCK_KCC.filter(
      (t) =>
        t.url === KENNEY_ASSETS.treeSmall &&
        Math.abs(t.x - orchard!.center.x) < 10 &&
        Math.abs(t.z - orchard!.center.z) < 10,
    );
    expect(orchardTrees.length).toBeGreaterThanOrEqual(30);
  });

  it('R6 provides orchard perimeter treeLarge frame near farmhouse district', () => {
    const perimeterLarge = ORCHARD_BLOCK_KCC.filter((t) => t.url === KENNEY_ASSETS.treeLarge);
    expect(perimeterLarge.length).toBeGreaterThanOrEqual(8);
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
