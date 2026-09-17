/**
 * WF02 R15 Phase 0 — proof placement exclusions (roads/water/paths + building footprints).
 */
import { CANONICAL_TOWN } from '@/world/townLayout';
import { isOverlayExcluded } from '../compositionMask';

export function isProofPlacementExcluded(x: number, z: number, buildingMargin = 1.8): boolean {
  if (isOverlayExcluded(x, z)) return true;
  for (const building of CANONICAL_TOWN.buildings) {
    const halfW = building.size.width / 2 + buildingMargin;
    const halfD = building.size.depth / 2 + buildingMargin;
    if (
      Math.abs(x - building.position.x) <= halfW &&
      Math.abs(z - building.position.z) <= halfD
    ) {
      return true;
    }
  }
  return false;
}
