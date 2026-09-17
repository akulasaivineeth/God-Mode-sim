/**
 * WF02 R10 — future lot negative-space framing (no phantom buildings).
 */
import { Suspense, useMemo } from 'react';
import { terrainHeightAt } from '@/world/townLayout';
import { buildFutureLotFrameSpec } from '@/world/worldLab/districtCompositionSpec';
import { KENNEY_ASSETS } from '../../assets/EnvironmentAssetRegistry';
import {
  InstancedGltfPlacements,
  type GltfInstancePlacement,
} from '../../assets/InstancedGltfPlacements';
import { InstancedScatter } from '../../InstancedScatter';
import { SCATTER_GEOM } from '../../scatterGeometries';
import { MAT } from '../../sharedMaterials';

export function FutureLotFrame() {
  const spec = useMemo(() => buildFutureLotFrameSpec(), []);
  const fences = useMemo<GltfInstancePlacement[]>(
    () =>
      spec.fences.map((p) => ({
        url: KENNEY_ASSETS.fenceLow,
        x: p.x,
        z: p.z,
        rotY: p.rotY,
        scale: p.scale,
        yOffset: p.yOffset,
      })),
    [spec.fences],
  );
  const pavers = useMemo(
    () =>
      spec.pavers.map((p) => ({
        x: p.x,
        z: p.z,
        y: terrainHeightAt(p.x, p.z) + 0.04,
        rotY: p.rotY ?? 0,
        scale: p.scale,
      })),
    [spec.pavers],
  );

  return (
    <group name="world-lab-future-lot-frame">
      <InstancedScatter
        points={pavers}
        geometry={SCATTER_GEOM.paver}
        material={MAT.path}
        castShadow={false}
      />
      <Suspense fallback={null}>
        <InstancedGltfPlacements placements={fences} />
      </Suspense>
    </group>
  );
}
