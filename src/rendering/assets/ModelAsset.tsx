/**
 * Cached GLTF/GLB loader — shared presentation pipeline (Foundation Hardening + WF02 layout authority).
 */
import { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import type { Object3D } from 'three';
import { resolveNormalizedLayout, resolveUniformScale } from './modelLayout';
import { GLTFLoader, prepareStaticGltfRoot } from './gltfPipeline';

export interface ModelAssetProps {
  url: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  targetWidth?: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
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
    return prepareStaticGltfRoot(gltf.scene, { castShadow, receiveShadow }).root;
  }, [gltf, castShadow, receiveShadow]);

  const resolvedScale = useMemo(() => {
    const base = resolveUniformScale(url, targetWidth);
    if (typeof scale === 'number') return base * scale;
    return [scale[0] * base, scale[1] * base, scale[2] * base] as [number, number, number];
  }, [url, scale, targetWidth]);

  return (
    <group position={position} rotation={rotation} scale={resolvedScale}>
      <primitive object={prepared} />
    </group>
  );
}

/** Exported for tests and anchor consumers — same authority as rendered scale. */
export function getModelPresentationLayout(url: string, targetWidth?: number) {
  return resolveNormalizedLayout(url, targetWidth);
}

/** Runtime AABB from manifest (deterministic fallback, no post-load recompute). */
export function getPreparedObjectFootprint(scene: Object3D, url: string, targetWidth?: number) {
  void scene;
  return resolveNormalizedLayout(url, targetWidth);
}
