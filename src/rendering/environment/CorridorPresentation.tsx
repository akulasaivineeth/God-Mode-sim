/**
 * WF02 R3 corridor presentation — instanced curbs, crosswalk, entrance aprons.
 */
import { useLayoutEffect, useMemo, useRef } from 'react';
import { BoxGeometry, Euler, type InstancedMesh, Matrix4, Quaternion, Vector3 } from 'three';
import { terrainHeightAt } from '@/world/townLayout';
import { KENNEY_ASSETS } from '../assets/EnvironmentAssetRegistry';
import { InstancedGltfPlacements, type GltfInstancePlacement } from '../assets/InstancedGltfPlacements';
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

function InstancedCorridorCurbs() {
  const segments = useMemo(
    () => [
      { from: { x: -35, z: -3.8 }, to: { x: 35, z: -3.8 } },
      { from: { x: -35, z: 3.8 }, to: { x: 35, z: 3.8 } },
    ],
    [],
  );
  const geometry = useMemo(() => new BoxGeometry(1, 0.1, 0.22), []);
  const ref = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const matrix = new Matrix4();
    const quat = new Quaternion();
    segments.forEach((seg, i) => {
      const dx = seg.to.x - seg.from.x;
      const dz = seg.to.z - seg.from.z;
      const len = Math.hypot(dx, dz);
      const angle = Math.atan2(dz, dx);
      const cx = (seg.from.x + seg.to.x) / 2;
      const cz = (seg.from.z + seg.to.z) / 2;
      const y = terrainHeightAt(cx, cz) + 0.07;
      quat.setFromEuler(new Euler(0, -angle, 0));
      matrix.compose(new Vector3(cx, y, cz), quat, new Vector3(len, 1, 1));
      mesh.setMatrixAt(i, matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [segments]);

  return <instancedMesh ref={ref} args={[geometry, MAT.curb, segments.length]} receiveShadow />;
}

function EntranceAprons() {
  const placements = useMemo((): GltfInstancePlacement[] => {
    return [
      {
        url: KENNEY_ASSETS.drivewayShort,
        x: 11,
        z: -6,
        rotY: Math.PI / 2,
        scale: 2.4,
        yOffset: 0.02,
      },
    ];
  }, []);

  return <InstancedGltfPlacements placements={placements} />;
}

export function CorridorPresentation() {
  return (
    <group>
      <InstancedCorridorCurbs />
      <ZebraCrosswalk x={0} z={0} />
      <ZebraCrosswalk x={24} z={12} />
      <EntranceAprons />
    </group>
  );
}
