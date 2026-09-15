/**
 * Shared GLTF instancing — one draw call per mesh part per asset URL.
 * Used by vegetation, roads, and district composition props (WF01 R4.1).
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
import { GLTFLoader } from './gltfPipeline';
import { terrainHeightAt } from '@/world/townLayout';

export interface MeshPart {
  geometry: BufferGeometry;
  material: Material;
}

export interface GltfInstancePlacement {
  url: string;
  x: number;
  z: number;
  rotY?: number;
  scale?: number;
  yOffset?: number;
}

export function useGltfMeshParts(url: string): MeshPart[] {
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

export function groupPlacementsByUrl<T extends { url: string }>(
  placements: readonly T[],
  resolveUrl: (item: T) => string,
): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of placements) {
    const url = resolveUrl(item);
    const list = groups.get(url) ?? [];
    list.push(item);
    groups.set(url, list);
  }
  return groups;
}

function InstancedGltfGroup({
  url,
  placements,
  resolveMatrix,
}: {
  url: string;
  placements: GltfInstancePlacement[];
  resolveMatrix: (placement: GltfInstancePlacement, matrix: Matrix4) => void;
}) {
  const parts = useGltfMeshParts(url);
  const refs = useRef<(InstancedMesh | null)[]>([]);
  const count = placements.length;

  useLayoutEffect(() => {
    const matrix = new Matrix4();
    placements.forEach((placement, i) => {
      resolveMatrix(placement, matrix);
      parts.forEach((_, partIdx) => {
        const mesh = refs.current[partIdx];
        if (mesh) mesh.setMatrixAt(i, matrix);
      });
    });

    parts.forEach((_, partIdx) => {
      const mesh = refs.current[partIdx];
      if (mesh) mesh.instanceMatrix.needsUpdate = true;
    });
  }, [placements, parts, resolveMatrix]);

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

export function terrainGltfMatrixResolver(placement: GltfInstancePlacement, matrix: Matrix4) {
  const quat = new Quaternion();
  const pos = new Vector3();
  const scale = new Vector3();
  const y = terrainHeightAt(placement.x, placement.z) + (placement.yOffset ?? 0);
  const s = placement.scale ?? 1;
  pos.set(placement.x, y, placement.z);
  quat.setFromEuler(new THREE.Euler(0, placement.rotY ?? 0, 0));
  scale.set(s, s, s);
  matrix.compose(pos, quat, scale);
}

export function InstancedGltfPlacements({
  placements,
  resolveMatrix = terrainGltfMatrixResolver,
}: {
  placements: readonly GltfInstancePlacement[];
  resolveMatrix?: (placement: GltfInstancePlacement, matrix: Matrix4) => void;
}) {
  const groups = useMemo(() => {
    const byUrl = new Map<string, GltfInstancePlacement[]>();
    for (const p of placements) {
      const list = byUrl.get(p.url) ?? [];
      list.push(p);
      byUrl.set(p.url, list);
    }
    return byUrl;
  }, [placements]);

  return (
    <group>
      {[...groups.entries()].map(([url, group]) => (
        <InstancedGltfGroup key={url} url={url} placements={group} resolveMatrix={resolveMatrix} />
      ))}
    </group>
  );
}
