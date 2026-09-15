import { describe, expect, it } from 'vitest';
import { CAMERA_PRESETS } from '@/rendering/cameraPresets';
import {
  resolvePresentationTransform,
} from '@/rendering/assets/buildings/buildingPresentationAnchors';
import { buildDistrictCompositionPlacements } from '@/rendering/assets/EnvironmentAssetRegistry';
import { CANONICAL_TOWN } from '@/world/townLayout';

describe('WF02 R3 composition envelopes', () => {
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

  it('delegates orchard tree read to TownAmenities farm rows (no duplicate treeSmall GLBs)', () => {
    const placements = buildDistrictCompositionPlacements();
    const orchard = CANONICAL_TOWN.farmPlots.find((p) => p.id === 'farm-3');
    expect(orchard).toBeDefined();
    const orchardTrees = placements.filter(
      (p) =>
        p.source === 'kenney' &&
        p.asset === 'treeSmall' &&
        Math.abs(p.position.x - orchard!.center.x) < 6 &&
        Math.abs(p.position.z - orchard!.center.z) < 5,
    );
    expect(orchardTrees.length).toBe(0);
  });

  it('does not duplicate farmhouse treeLarge (approach handled by building anchors)', () => {
    const placements = buildDistrictCompositionPlacements();
    const farmhouseTrees = placements.filter((p) => p.source === 'kenney' && p.asset === 'treeLarge');
    expect(farmhouseTrees.length).toBe(0);
  });

  it('adds staggered residential street trees', () => {
    const placements = buildDistrictCompositionPlacements();
    const streetTrees = placements.filter(
      (p) =>
        (p.asset === 'commonTree1' || p.asset === 'commonTree2') &&
        p.position.z < -10 &&
        p.position.z > -35 &&
        p.position.x >= 14 &&
        p.position.x <= 30,
    );
    expect(streetTrees.length).toBeGreaterThanOrEqual(2);
  });
});
