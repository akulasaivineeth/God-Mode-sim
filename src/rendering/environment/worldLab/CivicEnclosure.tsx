/**
 * WF02 R10 — civic plaza enclosure (colonnade + radial paving + center amenity).
 */
import { Suspense, useMemo } from 'react';
import { buildCivicEnclosureSpec } from '@/world/worldLab/districtCompositionSpec';
import { KENNEY_ASSETS } from '../../assets/EnvironmentAssetRegistry';
import {
  InstancedGltfPlacements,
  type GltfInstancePlacement,
} from '../../assets/InstancedGltfPlacements';

const URL_BY_KEY: Record<string, string> = {
  planter: KENNEY_ASSETS.planter,
  pathStonesShort: KENNEY_ASSETS.pathStonesShort,
  pathStonesMessy: KENNEY_ASSETS.pathStonesMessy,
  fenceLow: KENNEY_ASSETS.fenceLow,
};

function toPlacements(
  items: Array<{ urlKey: string; x: number; z: number; rotY?: number; scale?: number; yOffset?: number }>,
): GltfInstancePlacement[] {
  return items.map((p) => ({
    url: URL_BY_KEY[p.urlKey],
    x: p.x,
    z: p.z,
    rotY: p.rotY,
    scale: p.scale,
    yOffset: p.yOffset,
  }));
}

export function CivicEnclosure() {
  const spec = useMemo(() => buildCivicEnclosureSpec(), []);
  const placements = useMemo(
    () => toPlacements([...spec.pavers, ...spec.colonnade, ...spec.center]),
    [spec],
  );

  return (
    <group name="world-lab-civic-enclosure">
      <Suspense fallback={null}>
        <InstancedGltfPlacements placements={placements} />
      </Suspense>
    </group>
  );
}
