/**
 * Groups vegetation placements by asset URL and instances real GLTF geometry.
 */
import { useLayoutEffect, useMemo, useRef } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import {
  type BufferGeometry,
  type InstancedMesh,
  type Material,
  Matrix4,
  Mesh,
  Quaternion,
  Vector3,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { terrainHeightAt } from '@/world/townLayout';
import type { VegetationPlacement } from './EnvironmentAssetRegistry';
import { resolveVegetationUrl } from './EnvironmentAssetRegistry';

interface MeshPart {
  geometry: BufferGeometry;
  material: Material;
}

function useGltfMeshParts(url: string): MeshPart[] {
  const gltf = useLoader(GLTFLoader, url);
  return useMemo(() => {
    const parts: MeshPart[] = [];
    gltf.scene.traverse((child) => {
      if (child instanceof Mesh) {
        parts.push({ geometry: child.geometry, material: child.material as Material });
      }
    });
    return parts;
  }, [gltf]);
}

function InstancedGltfGroup({
  url,
  placements,
}: {
  url: string;
  placements: VegetationPlacement[];
}) {
  const parts = useGltfMeshParts(url);
  const refs = useRef<(InstancedMesh | null)[]>([]);
  const count = placements.length;

  useLayoutEffect(() => {
    const matrix = new Matrix4();
    const quat = new Quaternion();
    const pos = new Vector3();
    const scale = new Vector3();

    placements.forEach((placement, i) => {
      const y = terrainHeightAt(placement.position.x, placement.position.z);
      const s = placement.scale ?? 1;
      pos.set(placement.position.x, y, placement.position.z);
      quat.setFromEuler(new THREE.Euler(0, placement.rotY ?? 0, 0));
      scale.set(s, s, s);
      matrix.compose(pos, quat, scale);
      parts.forEach((_, partIdx) => {
        const mesh = refs.current[partIdx];
        if (mesh) mesh.setMatrixAt(i, matrix);
      });
    });

    parts.forEach((_, partIdx) => {
      const mesh = refs.current[partIdx];
      if (mesh) mesh.instanceMatrix.needsUpdate = true;
    });
  }, [placements, parts]);

  if (count === 0 || parts.length === 0) return null;

  return (
    <group>
      {parts.map((part, partIdx) => (
        <instancedMesh
          key={partIdx}
          ref={(el) => {
            refs.current[partIdx] = el;
          }}
          args={[part.geometry, part.material, count]}
          castShadow={false}
          receiveShadow
        />
      ))}
    </group>
  );
}

export function groupPlacementsByUrl(
  placements: readonly VegetationPlacement[],
): Map<string, VegetationPlacement[]> {
  const groups = new Map<string, VegetationPlacement[]>();
  for (const p of placements) {
    const url = resolveVegetationUrl(p);
    const list = groups.get(url) ?? [];
    list.push(p);
    groups.set(url, list);
  }
  return groups;
}

export function InstancedVegetation({ placements }: { placements: readonly VegetationPlacement[] }) {
  const groups = useMemo(() => groupPlacementsByUrl(placements), [placements]);
  return (
    <group>
      {[...groups.entries()].map(([url, group]) => (
        <InstancedGltfGroup key={url} url={url} placements={group} />
      ))}
    </group>
  );
}
