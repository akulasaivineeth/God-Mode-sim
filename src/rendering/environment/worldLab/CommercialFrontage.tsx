/**
 * WF02 R10 — commercial frontage rhythm tied to facade entrances.
 */
import { Suspense, useMemo } from 'react';
import { terrainHeightAt } from '@/world/townLayout';
import { isModularPrototypeActive } from '@/rendering/modular/modularMode';
import { buildCommercialFrontageSpec } from '@/world/worldLab/districtCompositionSpec';
import { KENNEY_ASSETS } from '../../assets/EnvironmentAssetRegistry';
import {
  InstancedGltfPlacements,
  type GltfInstancePlacement,
} from '../../assets/InstancedGltfPlacements';
import { InstancedScatter } from '../../InstancedScatter';
import { SCATTER_GEOM } from '../../scatterGeometries';
import { MAT } from '../../sharedMaterials';

const SCATTER = {
  bench: { geometry: SCATTER_GEOM.benchSeat, material: MAT.wood },
  lamp: { geometry: SCATTER_GEOM.lampPost, material: MAT.metalDark },
  shrub: { geometry: SCATTER_GEOM.shrub, material: MAT.foliageLight },
  paver: { geometry: SCATTER_GEOM.paver, material: MAT.path },
} as const;

export function CommercialFrontage() {
  const modularActive = isModularPrototypeActive();
  const spec = useMemo(() => buildCommercialFrontageSpec(), []);
  const gltfPlacements = useMemo<GltfInstancePlacement[]>(
    () =>
      spec.props.map((p) => ({
        url: p.urlKey === 'pathLong' ? KENNEY_ASSETS.pathLong : KENNEY_ASSETS.pathStonesMessy,
        x: p.x,
        z: p.z,
        rotY: p.rotY,
        scale: p.scale,
        yOffset: p.yOffset,
      })),
    [spec.props],
  );
  const scatterByKind = useMemo(() => {
    const groups: Record<keyof typeof SCATTER, Array<{ x: number; z: number; y: number; rotY: number; scale?: number }>> = {
      bench: [],
      lamp: [],
      shrub: [],
      paver: [],
    };
    for (const point of spec.scatter) {
      if (point.kind === 'bench' || point.kind === 'lamp' || point.kind === 'shrub' || point.kind === 'paver') {
        groups[point.kind].push({
          x: point.x,
          z: point.z,
          y: terrainHeightAt(point.x, point.z) + (point.kind === 'lamp' ? 0.1 : 0),
          rotY: point.rotY ?? 0,
          scale: point.scale,
        });
      }
    }
    return groups;
  }, [spec.scatter]);

  if (modularActive) return null;

  return (
    <group name="world-lab-commercial-frontage">
      {(Object.keys(SCATTER) as Array<keyof typeof SCATTER>).map((kind) => (
        <InstancedScatter
          key={kind}
          points={scatterByKind[kind]}
          geometry={SCATTER[kind].geometry}
          material={SCATTER[kind].material}
          castShadow={false}
        />
      ))}
      <Suspense fallback={null}>
        <InstancedGltfPlacements placements={gltfPlacements} />
      </Suspense>
    </group>
  );
}
