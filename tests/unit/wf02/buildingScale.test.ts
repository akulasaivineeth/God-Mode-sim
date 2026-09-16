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
import { CANONICAL_TOWN } from '@/world/townLayout';
import { isWorldLabActive } from '@/world/resolver/worldResolver';
import { HERO_NEIGHBORHOOD_DEFINITION } from '@/world/worldLab/heroNeighborhood';

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
      if (WF02_TARGET_WIDTHS[config.buildingId]) {
        expect(config.targetWidth).toBe(WF02_TARGET_WIDTHS[config.buildingId]);
      }
    }
  });

  it('uses distinct Kenney GLB silhouettes for active buildings', () => {
    const activeIds = new Set(CANONICAL_TOWN.buildings.map((b) => b.id));
    const urls = new Set(
      BUILDING_PREFABS.filter((c) => activeIds.has(c.buildingId)).map((c) => c.assetUrl),
    );
    expect(urls.size).toBe(activeIds.size);
  });

  it('World Lab uses zero presentation offsets (placement in world definition)', () => {
    if (!isWorldLabActive()) return;
    expect(resolvePresentationTransform('store').positionOffset).toEqual([0, 0, 0]);
    expect(resolvePresentationTransform('house-1').positionOffset).toEqual([0, 0, 0]);
    expect(resolvePresentationTransform('workshop').positionOffset).toEqual([0, 0, 0]);
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

  it('preserves store/workshop presentation AABB gap ≥ 0.10 m', () => {
    const store = BUILDING_PREFABS.find((c) => c.buildingId === 'store')!;
    const workshop = BUILDING_PREFABS.find((c) => c.buildingId === 'workshop')!;
    const storeTransform = resolvePresentationTransform('store');
    const workshopTransform = resolvePresentationTransform('workshop');
    const storeBuilding = CANONICAL_TOWN.buildings.find((b) => b.id === 'store')!;
    const workshopBuilding = CANONICAL_TOWN.buildings.find((b) => b.id === 'workshop')!;
    const storeFoot = resolveRotatedFootprint(
      resolveNormalizedLayout(store.assetUrl, store.targetWidth),
      (store.rotationY ?? 0) + storeTransform.rotationDelta,
    );
    const workshopFoot = resolveRotatedFootprint(
      resolveNormalizedLayout(workshop.assetUrl, workshop.targetWidth),
      (workshop.rotationY ?? 0) + workshopTransform.rotationDelta,
    );
    const storeCenter = {
      x: storeBuilding.position.x + storeTransform.positionOffset[0],
      z: storeBuilding.position.z + storeTransform.positionOffset[2],
    };
    const workshopCenter = {
      x: workshopBuilding.position.x + workshopTransform.positionOffset[0],
      z: workshopBuilding.position.z + workshopTransform.positionOffset[2],
    };
    const gapX =
      Math.abs(workshopCenter.x - storeCenter.x) -
      (storeFoot.halfWidthX + workshopFoot.halfWidthX);
    expect(gapX).toBeGreaterThanOrEqual(0.1);
  });
});

describe('WF02 citizen presentation scale', () => {
  it('keeps simulation authority at 1.8 and presentation at 2.32', () => {
    expect(TARGET_CITIZEN_HEIGHT).toBe(1.8);
    expect(PRESENTATION_CITIZEN_HEIGHT).toBeCloseTo(2.32, 2);
  });
});

describe('WF02 camera calibration', () => {
  it('uses neighborhood-scoped overview/angled when World Lab is active', () => {
    if (!isWorldLabActive()) {
      expect(CAMERA_PRESETS.overview.position).toEqual([10, 93, 54]);
      expect(CAMERA_PRESETS.angled.position).toEqual([68, 53, 37]);
      return;
    }
    expect(CAMERA_PRESETS.overview).toEqual(HERO_NEIGHBORHOOD_DEFINITION.cameras.overview);
    expect(CAMERA_PRESETS.angled).toEqual(HERO_NEIGHBORHOOD_DEFINITION.cameras.angled);
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
