import { describe, expect, it } from 'vitest';
import { BUILDING_PREFABS } from '@/rendering/assets/buildings/buildingPrefabConfig';
import {
  resolveBuildingAnchors,
  resolvePresentationTransform,
} from '@/rendering/assets/buildings/buildingPresentationAnchors';
import {
  resolveNormalizedLayout,
  resolveRotatedFootprint,
  resolveUniformScale,
} from '@/rendering/assets/modelLayout';
import { KENNEY_ASSETS } from '@/rendering/assets/EnvironmentAssetRegistry';
import { CAMERA_PRESETS } from '@/rendering/cameraPresets';
import {
  PRESENTATION_CITIZEN_HEIGHT,
  TARGET_CITIZEN_HEIGHT,
} from '@/rendering/citizenModelScale';

const WF02_TARGET_WIDTHS: Record<string, number> = {
  'house-1': 11.2,
  'house-2': 11.0,
  'house-3': 11.0,
  'house-4': 11.2,
  cafe: 12.2,
  farmhouse: 12.5,
  store: 13.5,
  clinic: 13.5,
  utility: 13.5,
  'community-hall': 16.0,
  workshop: 15.0,
  apartment: 16.0,
  school: 17.5,
  warehouse: 19.0,
};

describe('WF02 building presentation scale', () => {
  it('applies approved per-category target widths', () => {
    for (const config of BUILDING_PREFABS) {
      expect(config.targetWidth).toBe(WF02_TARGET_WIDTHS[config.buildingId]);
    }
  });

  it('uses 14 distinct Kenney GLB silhouettes', () => {
    const urls = new Set(BUILDING_PREFABS.map((c) => c.assetUrl));
    expect(urls.size).toBe(14);
  });

  it('keeps M02 sim centers while applying R7.1 visual offsets', () => {
    const store = resolvePresentationTransform('store');
    expect(store.positionOffset).toEqual([1, 0, -5]);
    const house1 = resolvePresentationTransform('house-1');
    expect(house1.positionOffset).toEqual([3, 0, 2]);
    const workshop = resolvePresentationTransform('workshop');
    expect(workshop.positionOffset).toEqual([1, 0, -3]);
  });

  it('derives anchor extras on scaled facade without manual coordinates', () => {
    const store = BUILDING_PREFABS.find((c) => c.buildingId === 'store');
    expect(store).toBeDefined();
    const anchors = resolveBuildingAnchors(store!);
    expect(anchors.signPosition).toBeDefined();
    expect(anchors.extras.length).toBe(3);
    for (const extra of anchors.extras) {
      expect(extra.position.every((v) => Number.isFinite(v))).toBe(true);
    }
  });

  it('R7.1 visual transforms preserve store/workshop presentation AABB gap', () => {
    const store = BUILDING_PREFABS.find((c) => c.buildingId === 'store')!;
    const workshop = BUILDING_PREFABS.find((c) => c.buildingId === 'workshop')!;
    const storeTransform = resolvePresentationTransform('store');
    const workshopTransform = resolvePresentationTransform('workshop');
    const storeFoot = resolveRotatedFootprint(
      resolveNormalizedLayout(store.assetUrl, store.targetWidth),
      (store.rotationY ?? 0) + storeTransform.rotationDelta,
    );
    const workshopFoot = resolveRotatedFootprint(
      resolveNormalizedLayout(workshop.assetUrl, workshop.targetWidth),
      (workshop.rotationY ?? 0) + workshopTransform.rotationDelta,
    );
    const storeCenter = { x: -11 + storeTransform.positionOffset[0], z: 11 + storeTransform.positionOffset[2] };
    const workshopCenter = {
      x: -11 + workshopTransform.positionOffset[0],
      z: 23 + workshopTransform.positionOffset[2],
    };
    const gapZ =
      workshopCenter.z - workshopFoot.halfWidthZ - (storeCenter.z + storeFoot.halfWidthZ);
    expect(workshop.targetWidth).toBe(15.0);
    expect(workshopTransform.positionOffset).toEqual([1, 0, -3]);
    expect(gapZ).toBeGreaterThanOrEqual(0.1);
  });
});

describe('WF02 citizen presentation scale', () => {
  it('keeps simulation authority at 1.8 and presentation at 2.32', () => {
    expect(TARGET_CITIZEN_HEIGHT).toBe(1.8);
    expect(PRESENTATION_CITIZEN_HEIGHT).toBeCloseTo(2.32, 2);
  });
});

describe('WF02 camera calibration', () => {
  it('moves overview and angled ~17% closer with unchanged targets', () => {
    expect(CAMERA_PRESETS.overview.position).toEqual([10, 93, 54]);
    expect(CAMERA_PRESETS.overview.target).toEqual([30, 2, 4]);
    expect(CAMERA_PRESETS.angled.position).toEqual([68, 53, 37]);
    expect(CAMERA_PRESETS.angled.target).toEqual([28, 3, 2]);
  });
});

describe('WF02 model layout authority', () => {
  it('normalizes Kenney cottage to target width from manifest', () => {
    const scale = resolveUniformScale(KENNEY_ASSETS.homeCottage, 11.2);
    const layout = resolveNormalizedLayout(KENNEY_ASSETS.homeCottage, 11.2);
    expect(layout.footprintWidth).toBeCloseTo(11.2, 1);
    expect(scale).toBeGreaterThan(1);
  });
});
