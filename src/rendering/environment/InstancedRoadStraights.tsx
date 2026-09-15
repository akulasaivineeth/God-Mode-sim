/**
 * Instanced Kenney road-straight modules — one draw call per mesh part.
 */
import { useLayoutEffect, useMemo, useRef } from 'react';
import { useLoader } from '@react-three/fiber';
import {
  type BufferGeometry,
  type InstancedMesh,
  type Material,
  Matrix4,
  Mesh,
  Quaternion,
  Vector3,
} from 'three';
import { GLTFLoader } from '../assets/gltfPipeline';
import { KENNEY_ASSETS } from '../assets/EnvironmentAssetRegistry';
import { terrainHeightAt } from '@/world/townLayout';
import type { RoadTilePlacement } from './RoadNetwork';

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

export function InstancedRoadStraights({ tiles }: { tiles: readonly RoadTilePlacement[] }) {
  const parts = useGltfMeshParts(KENNEY_ASSETS.roadStraight);
  const refs = useRef<(InstancedMesh | null)[]>([]);
  const count = tiles.length;

  useLayoutEffect(() => {
    const matrix = new Matrix4();
    const quat = new Quaternion();
    const pos = new Vector3();
    const scale = new Vector3();

    tiles.forEach((tile, i) => {
      const y = terrainHeightAt(tile.x, tile.z) + 0.04;
      const s = tile.scale ?? 1.5;
      pos.set(tile.x, y, tile.z);
      quat.setFromAxisAngle(new Vector3(0, 1, 0), tile.rotY);
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
  }, [tiles, parts]);

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
