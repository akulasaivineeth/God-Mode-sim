/**
 * WF02 R10 — perimeter frame trees (vegetation belt).
 */
import { Suspense, useMemo } from 'react';
import { buildFrameTreeSpec } from '@/world/worldLab/districtCompositionSpec';
import { KENNEY_ASSETS } from '../../assets/EnvironmentAssetRegistry';
import {
  InstancedGltfPlacements,
  type GltfInstancePlacement,
} from '../../assets/InstancedGltfPlacements';

export function VegetationFrame() {
  const placements = useMemo<GltfInstancePlacement[]>(
    () =>
      buildFrameTreeSpec().map((p) => ({
        url: p.urlKey === 'treeLarge' ? KENNEY_ASSETS.treeLarge : KENNEY_ASSETS.treeSmall,
        x: p.x,
        z: p.z,
        rotY: p.rotY,
        scale: p.scale,
      })),
    [],
  );

  return (
    <group name="world-lab-vegetation-frame">
      <Suspense fallback={null}>
        <InstancedGltfPlacements placements={placements} />
      </Suspense>
    </group>
  );
}
