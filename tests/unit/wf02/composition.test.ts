import { describe, expect, it } from 'vitest';
import { CAMERA_PRESETS } from '@/rendering/cameraPresets';
import {
  resolvePresentationTransform,
} from '@/rendering/assets/buildings/buildingPresentationAnchors';
import { buildDistrictMassingSpec } from '@/rendering/environment/districtMassing';
import { CANONICAL_TOWN } from '@/world/townLayout';
import { KENNEY_ASSETS } from '@/rendering/assets/EnvironmentAssetRegistry';

describe('WF02 R3/R4.1 composition envelopes', () => {
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

  it('R4.1 places Kenney treeSmall orchard grid via district massing', () => {
    const orchard = CANONICAL_TOWN.farmPlots.find((p) => p.id === 'farm-3');
    expect(orchard).toBeDefined();
    const spec = buildDistrictMassingSpec();
    const orchardTrees = spec.kenneyTrees.filter(
      (t) =>
        t.url === KENNEY_ASSETS.treeSmall &&
        Math.abs(t.x - orchard!.center.x) < 8 &&
        Math.abs(t.z - orchard!.center.z) < 8,
    );
    expect(orchardTrees.length).toBeGreaterThanOrEqual(16);
  });

  it('R4.1 provides farmhouse approach treeLarge via district massing', () => {
    const spec = buildDistrictMassingSpec();
    const farmhouseTrees = spec.kenneyTrees.filter(
      (t) => t.url === KENNEY_ASSETS.treeLarge && t.z > 75,
    );
    expect(farmhouseTrees.length).toBeGreaterThanOrEqual(2);
  });

  it('adds staggered residential Kenney street trees in district massing', () => {
    const spec = buildDistrictMassingSpec();
    const streetTrees = spec.kenneyTrees.filter(
      (t) =>
        t.url === KENNEY_ASSETS.treeSmall &&
        t.z < -10 &&
        t.z > -35 &&
        t.x >= 14 &&
        t.x <= 60,
    );
    expect(streetTrees.length).toBeGreaterThanOrEqual(4);
  });
});
