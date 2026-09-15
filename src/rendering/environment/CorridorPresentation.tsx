/**
 * WF01 corridor presentation — curbs, crosswalk, entrance aprons (presentation only).
 */
import { useMemo } from 'react';
import { terrainHeightAt } from '@/world/townLayout';
import { ModelAsset } from '../assets/ModelAsset';
import { KENNEY_ASSETS } from '../assets/EnvironmentAssetRegistry';
import { InstancedScatter } from '../InstancedScatter';
import { SCATTER_GEOM } from '../scatterGeometries';
import { MAT } from '../sharedMaterials';

function ZebraCrosswalk({ x, z }: { x: number; z: number }) {
  const stripes = useMemo(() => {
    const points = [];
    for (let i = -3; i <= 3; i += 1) {
      points.push({ x: x + i * 0.55, z, rotY: 0, y: terrainHeightAt(x + i * 0.55, z) + 0.055 });
    }
    return points;
  }, [x, z]);

  return (
    <InstancedScatter
      points={stripes}
      geometry={SCATTER_GEOM.crossStripe}
      material={MAT.stoneLight}
      yLift={0}
      castShadow={false}
    />
  );
}

function CorridorCurbs() {
  const curbs = useMemo(
    () => [
      { from: { x: -35, z: -3.8 }, to: { x: 35, z: -3.8 } },
      { from: { x: -35, z: 3.8 }, to: { x: 35, z: 3.8 } },
    ],
    [],
  );

  return (
    <group>
      {curbs.map((seg, i) => {
        const dx = seg.to.x - seg.from.x;
        const dz = seg.to.z - seg.from.z;
        const len = Math.hypot(dx, dz);
        const angle = Math.atan2(dz, dx);
        const cx = (seg.from.x + seg.to.x) / 2;
        const cz = (seg.from.z + seg.to.z) / 2;
        const y = terrainHeightAt(cx, cz) + 0.07;
        return (
          <mesh key={i} position={[cx, y, cz]} rotation={[0, -angle, 0]} receiveShadow>
            <boxGeometry args={[len, 0.1, 0.22]} />
            <primitive object={MAT.curb} attach="material" />
          </mesh>
        );
      })}
    </group>
  );
}

export function CorridorPresentation() {
  return (
    <group>
      <CorridorCurbs />
      <ZebraCrosswalk x={0} z={0} />
      <ZebraCrosswalk x={24} z={12} />
      <ModelAsset
        url={KENNEY_ASSETS.drivewayShort}
        position={[11, terrainHeightAt(11, -6), -6]}
        rotation={[0, Math.PI / 2, 0]}
        scale={2.2}
        castShadow={false}
      />
      <ModelAsset
        url={KENNEY_ASSETS.roadDriveway}
        position={[-11, terrainHeightAt(-11, 18), 18]}
        rotation={[0, Math.PI, 0]}
        scale={1.5}
        castShadow={false}
      />
    </group>
  );
}
