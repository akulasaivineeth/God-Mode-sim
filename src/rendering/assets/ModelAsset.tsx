/**
 * Cached GLTF/GLB loader — presentation-only asset pipeline (M02 R5).
 */
import { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { Box3, Mesh, Object3D, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export interface ModelAssetProps {
  url: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  targetWidth?: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
}

function normalizeScale(scene: Object3D, targetWidth?: number): number {
  if (!targetWidth) return 1;
  const box = new Box3().setFromObject(scene);
  const size = box.getSize(new Vector3());
  const width = Math.max(size.x, size.z, 0.001);
  return targetWidth / width;
}

export function ModelAsset({
  url,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  targetWidth,
  castShadow = true,
  receiveShadow = true,
}: ModelAssetProps) {
  const gltf = useLoader(GLTFLoader, url);

  const prepared = useMemo(() => {
    const root = gltf.scene.clone(true);
    root.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = castShadow;
        child.receiveShadow = receiveShadow;
      }
    });
    return root;
  }, [gltf, castShadow, receiveShadow]);

  const resolvedScale = useMemo(() => {
    const base = normalizeScale(prepared, targetWidth);
    if (typeof scale === 'number') return base * scale;
    return [scale[0] * base, scale[1] * base, scale[2] * base] as [number, number, number];
  }, [prepared, scale, targetWidth]);

  return (
    <group position={position} rotation={rotation} scale={resolvedScale}>
      <primitive object={prepared} />
    </group>
  );
}
