import { describe, expect, it } from 'vitest';
import { BUILDING_PREFABS } from '@/rendering/assets/buildings/buildingPrefabConfig';
import { resolvePresentationTransform } from '@/rendering/assets/buildings/buildingPresentationAnchors';
import {
  resolveNormalizedLayout,
  resolveRotatedFootprint,
} from '@/rendering/assets/modelLayout';
import { buildPeripheryForest } from '@/rendering/assets/EnvironmentAssetRegistry';
import {
  buildDistrictMassingSpec,
  toGltfPlacements,
} from '@/rendering/environment/districtMassing';
import { isOverlayExcluded, buildOverlayCells } from '@/rendering/environment/compositionMask';
import { CANONICAL_TOWN } from '@/world/townLayout';
import { KENNEY_ASSETS } from '@/rendering/assets/EnvironmentAssetRegistry';

function presentationAabb(buildingId: string) {
  const config = BUILDING_PREFABS.find((c) => c.buildingId === buildingId)!;
  const b = CANONICAL_TOWN.buildings.find((x) => x.id === buildingId)!;
  const t = resolvePresentationTransform(buildingId);
  const foot = resolveRotatedFootprint(
    resolveNormalizedLayout(config.assetUrl, config.targetWidth),
    (config.rotationY ?? 0) + t.rotationDelta,
  );
  const cx = b.position.x + t.positionOffset[0];
  const cz = b.position.z + t.positionOffset[2];
  return {
    minX: cx - foot.halfWidthX,
    maxX: cx + foot.halfWidthX,
    minZ: cz - foot.halfWidthZ,
    maxZ: cz + foot.halfWidthZ,
  };
}

describe('WF02 R4.1 overview composition', () => {
  it('excludes main road center from ground overlay cells', () => {
    expect(isOverlayExcluded(0, 0)).toBe(true);
    expect(isOverlayExcluded(10, 10)).toBe(false);
  });

  it('excludes river corridor from overlay cells', () => {
    expect(isOverlayExcluded(88, 38)).toBe(true);
  });

  it('deploys Kenney treeSmall orchard grid at farm-3', () => {
    const orchard = CANONICAL_TOWN.farmPlots.find((p) => p.id === 'farm-3')!;
    const spec = buildDistrictMassingSpec();
    const orchardTrees = spec.kenneyTrees.filter(
      (t) =>
        t.url === KENNEY_ASSETS.treeSmall &&
        Math.abs(t.x - orchard.center.x) < 8 &&
        Math.abs(t.z - orchard.center.z) < 8,
    );
    expect(orchardTrees.length).toBeGreaterThanOrEqual(16);
  });

  it('uses Kenney-first civic frame treeLarge placements', () => {
    const spec = buildDistrictMassingSpec();
    const civic = spec.kenneyTrees.filter((t) => t.url === KENNEY_ASSETS.treeLarge);
    expect(civic.length).toBeGreaterThanOrEqual(6);
  });

  it('caps residential fence segments at 48', () => {
    const spec = buildDistrictMassingSpec();
    expect(spec.fenceSegments.length).toBeLessThanOrEqual(48);
    expect(spec.fenceSegments.length).toBeGreaterThan(20);
  });

  it('removes periphery forest for Phase A recovery', () => {
    expect(buildPeripheryForest()).toEqual([]);
  });

  it('excludes road and path corridors from ground tint overlay cells', () => {
    expect(isOverlayExcluded(0, 0)).toBe(true);
    const storePath = CANONICAL_TOWN.paths.find((p) => p.id === 'path-square-store');
    expect(storePath).toBeDefined();
    const midX = (storePath!.from.x + storePath!.to.x) / 2;
    const midZ = (storePath!.from.z + storePath!.to.z) / 2;
    expect(isOverlayExcluded(midX, midZ)).toBe(true);
  });

  it('keeps store/workshop presentation AABB gap non-negative', () => {
    const store = presentationAabb('store');
    const workshop = presentationAabb('workshop');
    const gapZ = workshop.minZ - store.maxZ;
    expect(gapZ).toBeGreaterThanOrEqual(0);
  });

  it('produces gltf placements for Kenney canopy instancing', () => {
    const placements = toGltfPlacements(buildDistrictMassingSpec().kenneyTrees);
    expect(placements.length).toBeGreaterThan(20);
    expect(new Set(placements.map((p) => p.url)).size).toBeLessThanOrEqual(2);
  });

  it('builds clipped overlay cells within residential bounds', () => {
    const cells = buildOverlayCells(8, 82, -65, -8, 3.5);
    expect(cells.length).toBeGreaterThan(10);
    for (const cell of cells.slice(0, 20)) {
      expect(isOverlayExcluded(cell.x, cell.z)).toBe(false);
    }
  });
});
