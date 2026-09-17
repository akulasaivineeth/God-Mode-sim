/**
 * WF02 R10 — residential garden depth (fences, paths, trees, shrubs).
 */
import { Suspense, useMemo } from 'react';
import { terrainHeightAt } from '@/world/townLayout';
import { buildResidentialGardenSpec } from '@/world/worldLab/districtCompositionSpec';
import { KENNEY_ASSETS } from '../../assets/EnvironmentAssetRegistry';
import {
  InstancedGltfPlacements,
  type GltfInstancePlacement,
} from '../../assets/InstancedGltfPlacements';
import { InstancedScatter } from '../../InstancedScatter';
import { SCATTER_GEOM } from '../../scatterGeometries';
import { MAT } from '../../sharedMaterials';

const URL_BY_KEY = {
  fenceLow: KENNEY_ASSETS.fenceLow,
  pathShort: KENNEY_ASSETS.pathShort,
  treeLarge: KENNEY_ASSETS.treeLarge,
} as const;

export function ResidentialGardens() {
  const spec = useMemo(() => buildResidentialGardenSpec(), []);
  const gltfPlacements = useMemo<GltfInstancePlacement[]>(
    () =>
      [...spec.fences, ...spec.paths, ...spec.trees].map((p) => ({
        url: URL_BY_KEY[p.urlKey as keyof typeof URL_BY_KEY],
        x: p.x,
        z: p.z,
        rotY: p.rotY,
        scale: p.scale,
        yOffset: p.yOffset,
      })),
    [spec],
  );
  const scatterPoints = useMemo(
    () =>
      spec.scatter.map((p) => ({
        x: p.x,
        z: p.z,
        y: terrainHeightAt(p.x, p.z),
        rotY: p.rotY ?? 0,
        scale: p.scale,
      })),
    [spec.scatter],
  );

  return (
    <group name="world-lab-residential-gardens">
      <InstancedScatter
        points={scatterPoints.filter((_, i) => spec.scatter[i].kind === 'shrub')}
        geometry={SCATTER_GEOM.shrub}
        material={MAT.foliageLight}
        castShadow={false}
      />
      <InstancedScatter
        points={scatterPoints.filter((_, i) => spec.scatter[i].kind === 'paver')}
        geometry={SCATTER_GEOM.paver}
        material={MAT.path}
        castShadow={false}
      />
      <Suspense fallback={null}>
        <InstancedGltfPlacements placements={gltfPlacements} />
      </Suspense>
    </group>
  );
}
