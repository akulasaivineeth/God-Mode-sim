/**
 * Reusable instanced prop scatter — reduces draw calls for repeated corridor geometry.
 */
import { useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import type { InstancedMesh, MeshStandardMaterial } from 'three';

export interface ScatterPoint {
  x: number;
  z: number;
  y?: number;
  scale?: number;
  rotY?: number;
  rotX?: number;
}

interface InstancedScatterProps {
  points: readonly ScatterPoint[];
  geometry: THREE.BufferGeometry;
  material: MeshStandardMaterial;
  yLift?: number;
  castShadow?: boolean;
}

export function InstancedScatter({
  points,
  geometry,
  material,
  yLift = 0,
  castShadow = true,
}: InstancedScatterProps) {
  const ref = useRef<InstancedMesh>(null);
  const count = points.length;

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh || count === 0) return;
    const matrix = new THREE.Matrix4();
    const quat = new THREE.Quaternion();
    const pos = new THREE.Vector3();
    const scale = new THREE.Vector3();

    points.forEach((point, i) => {
      const s = point.scale ?? 1;
      pos.set(point.x, (point.y ?? 0) + yLift, point.z);
      quat.setFromEuler(new THREE.Euler(point.rotX ?? 0, point.rotY ?? 0, 0));
      scale.set(s, s, s);
      matrix.compose(pos, quat, scale);
      mesh.setMatrixAt(i, matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [points, count, yLift]);

  if (count === 0) return null;

  return (
    <instancedMesh
      ref={ref}
      args={[geometry, material, count]}
      castShadow={castShadow}
      receiveShadow
    />
  );
}
