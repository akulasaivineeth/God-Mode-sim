/**
 * Town zones — WORLD-001 / WF01.
 *
 * Draws authored zone overlays, pedestrian paths, and graves. Roads are rendered
 * by RoadNetwork; buildings by PrefabBuildings. Display only (ARCH-002).
 */
import { useLayoutEffect, useMemo, useRef } from 'react';
import {
  BoxGeometry,
  type InstancedMesh,
  Matrix4,
  Quaternion,
  Vector3,
} from 'three';
import {
  CANONICAL_TOWN,
  terrainHeightAt,
  type AreaRect,
  type Vec2,
} from '@/world/townLayout';
import { MAT } from './sharedMaterials';

function segmentTransform(from: Vec2, to: Vec2) {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const length = Math.hypot(dx, dz);
  const angle = Math.atan2(dz, dx);
  const center: [number, number] = [(from.x + to.x) / 2, (from.z + to.z) / 2];
  return { length, angle, center };
}

function FlatStrip({
  from,
  to,
  width,
  material,
  y,
}: {
  from: Vec2;
  to: Vec2;
  width: number;
  material: typeof MAT.stoneLight;
  y: number;
}) {
  const { length, angle, center } = segmentTransform(from, to);
  return (
    <mesh position={[center[0], y, center[1]]} rotation={[0, -angle, 0]} receiveShadow>
      <boxGeometry args={[length, 0.06, width]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

function FlatArea({ area, y }: { area: AreaRect; y: number }) {
  return (
    <mesh position={[area.center.x, y, area.center.z]} receiveShadow>
      <boxGeometry args={[area.width, 0.05, area.depth]} />
      <meshStandardMaterial color={area.color} />
    </mesh>
  );
}

function InstancedGraves() {
  const graves = CANONICAL_TOWN.graves;
  const count = graves.length;
  const geometry = useMemo(() => new BoxGeometry(0.5, 0.7, 0.15), []);
  const material = MAT.grave;
  const ref = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const matrix = new Matrix4();
    const quat = new Quaternion();
    const scale = new Vector3(1, 1, 1);
    graves.forEach((grave, i) => {
      const y = terrainHeightAt(grave.position.x, grave.position.z);
      matrix.compose(new Vector3(grave.position.x, y + 0.35, grave.position.z), quat, scale);
      mesh.setMatrixAt(i, matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [graves]);

  return <instancedMesh ref={ref} args={[geometry, material, count]} castShadow />;
}

export function Town() {
  const town = CANONICAL_TOWN;

  return (
    <group>
      {town.farmPlots.map((plot) => (
        <FlatArea key={plot.id} area={plot} y={0.03} />
      ))}
      {town.vacantPlots.map((plot) => (
        <FlatArea key={plot.id} area={plot} y={0.03} />
      ))}
      {town.cemetery.width > 0 && <FlatArea area={town.cemetery} y={0.03} />}

      {town.paths.map((path) => (
        <FlatStrip
          key={path.id}
          from={path.from}
          to={path.to}
          width={path.width}
          material={MAT.stoneLight}
          y={0.052}
        />
      ))}

      {town.graves.length > 0 && <InstancedGraves />}
    </group>
  );
}
