import { describe, expect, it } from 'vitest';
import { BUILDING_PREFABS } from '@/rendering/assets/buildings/buildingPrefabConfig';
import { resolveVisualTransform } from '@/rendering/assets/buildings/buildingPresentationAnchors';
import {
  resolveNormalizedLayout,
  resolveRotatedFootprint,
} from '@/rendering/assets/modelLayout';
import { buildDistrictMassingSpec } from '@/rendering/environment/districtMassing';
import { isOverlayExcluded, buildOverlayCells } from '@/rendering/environment/compositionMask';
import {
  isBaselineVegetationVisible,
  isCompositionTierVisible,
} from '@/rendering/environment/compositionVisibility';
import {
  ORCHARD_BLOCK_KCC,
  PARK_RIVER_ARC_KCC,
  PERIPHERY_FOREST_FRAME_KCC,
  buildKenneyPlacementsForView,
} from '@/rendering/environment/massSilhouettePlacements';
import { CANONICAL_TOWN } from '@/world/townLayout';

function presentationAabb(buildingId: string) {
  const config = BUILDING_PREFABS.find((c) => c.buildingId === buildingId)!;
  const b = CANONICAL_TOWN.buildings.find((x) => x.id === buildingId)!;
  const t = resolveVisualTransform(buildingId);
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

describe('WF02 R6 overview composition', () => {
  it('excludes main road center from ground overlay cells', () => {
    expect(isOverlayExcluded(0, 0)).toBe(true);
    expect(isOverlayExcluded(10, 10)).toBe(false);
  });

  it('excludes river corridor from overlay cells', () => {
    expect(isOverlayExcluded(88, 38)).toBe(true);
  });

  it('removes R5.1 ground tint zones (terrain bands carry district read)', () => {
    const spec = buildDistrictMassingSpec();
    expect(spec.groundZones).toHaveLength(0);
  });

  it('deploys dense Kenney orchard block at farm-3', () => {
    expect(ORCHARD_BLOCK_KCC.length).toBeGreaterThanOrEqual(40);
  });

  it('caps residential fence segments at 48', () => {
    const spec = buildDistrictMassingSpec();
    expect(spec.fenceSegments.length).toBeLessThanOrEqual(48);
    expect(spec.fenceSegments.length).toBeGreaterThan(20);
  });

  it('R6 MSS hero tables are non-empty', () => {
    expect(PARK_RIVER_ARC_KCC.length).toBeGreaterThanOrEqual(12);
    expect(PERIPHERY_FOREST_FRAME_KCC.length).toBeGreaterThanOrEqual(40);
  });

  it('gates periphery tier to overview and angled only', () => {
    expect(isCompositionTierVisible('periphery', 'overview')).toBe(true);
    expect(isCompositionTierVisible('periphery', 'angled')).toBe(true);
    expect(isCompositionTierVisible('periphery', 'street')).toBe(false);
  });

  it('mounts zero Quaternius baseline on overview', () => {
    expect(isBaselineVegetationVisible('overview')).toBe(false);
  });

  it('keeps store/workshop presentation AABB gap ≥ 0.10 m', () => {
    const store = presentationAabb('store');
    const workshop = presentationAabb('workshop');
    const gapZ = workshop.minZ - store.maxZ;
    expect(gapZ).toBeGreaterThanOrEqual(0.1);
  });

  it('overview Kenney placements use at most two tree URLs', () => {
    const placements = buildKenneyPlacementsForView('overview');
    expect(placements.length).toBeGreaterThan(80);
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
