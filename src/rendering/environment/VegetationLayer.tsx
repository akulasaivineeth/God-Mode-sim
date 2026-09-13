/**
 * Instanced + placed vegetation — corridor GLB accents + instanced periphery forest.
 */
import { useMemo } from 'react';
import { terrainHeightAt } from '@/world/townLayout';
import { ModelAsset } from '../assets/ModelAsset';
import {
  buildPeripheryForest,
  KENNEY_ASSETS,
  M02_CORRIDOR_VEGETATION,
  QUATERNIUS_ASSETS,
  type VegetationPlacement,
} from '../assets/EnvironmentAssetRegistry';
import { InstancedScatter } from '../InstancedScatter';
import { SCATTER_GEOM } from '../scatterGeometries';
import { MAT } from '../sharedMaterials';

function resolveAsset(placement: VegetationPlacement): string {
  return placement.source === 'kenney'
    ? KENNEY_ASSETS[placement.asset as keyof typeof KENNEY_ASSETS]
    : QUATERNIUS_ASSETS[placement.asset as keyof typeof QUATERNIUS_ASSETS];
}

function CorridorAccent({ placement }: { placement: VegetationPlacement }) {
  const y = terrainHeightAt(placement.position.x, placement.position.z);
  return (
    <ModelAsset
      url={resolveAsset(placement)}
      position={[placement.position.x, y, placement.position.z]}
      rotation={[0, placement.rotY ?? 0, 0]}
      scale={placement.scale ?? 1}
      castShadow={false}
    />
  );
}

export function VegetationLayer() {
  const periphery = useMemo(() => buildPeripheryForest(), []);
  const corridor = M02_CORRIDOR_VEGETATION;

  const forestCanopy = useMemo(
    () =>
      periphery.map((p) => ({
        x: p.position.x,
        z: p.position.z,
        y: terrainHeightAt(p.position.x, p.position.z) + 2.2 * (p.scale ?? 1),
        scale: (p.scale ?? 1) * 1.4,
        rotY: p.rotY ?? 0,
      })),
    [periphery],
  );

  const forestTrunk = useMemo(
    () =>
      periphery.map((p) => ({
        x: p.position.x,
        z: p.position.z,
        y: terrainHeightAt(p.position.x, p.position.z) + 0.9 * (p.scale ?? 1),
        scale: p.scale ?? 1,
        rotY: p.rotY ?? 0,
      })),
    [periphery],
  );

  return (
    <group>
      {corridor.map((p, i) => (
        <CorridorAccent key={`corridor-${i}`} placement={p} />
      ))}
      <InstancedScatter
        points={forestTrunk}
        geometry={SCATTER_GEOM.shrubTrunk}
        material={MAT.trunk}
        castShadow={false}
      />
      <InstancedScatter
        points={forestCanopy}
        geometry={SCATTER_GEOM.shrub}
        material={MAT.treeCanopy}
        castShadow={false}
      />
    </group>
  );
}
