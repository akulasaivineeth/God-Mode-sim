/**
 * Static scene occluder cache for evidence portrait raycasts — Foundation Hardening.
 *
 * Avoids full scene.traverse on every line-of-sight check during capture framing.
 */
import type { Mesh, Object3D } from 'three';
import { Mesh as MeshClass } from 'three';

let cachedScene: Object3D | null = null;
let cachedMeshes: Mesh[] = [];
let cacheGeneration = 0;

export function invalidateSceneOccluderCache(): void {
  cachedScene = null;
  cachedMeshes = [];
  cacheGeneration += 1;
}

export function getVisibleOccluderMeshes(scene: Object3D): Mesh[] {
  if (cachedScene === scene && cachedMeshes.length > 0) {
    return cachedMeshes;
  }

  scene.updateMatrixWorld(true);
  const meshes: Mesh[] = [];
  scene.traverse((obj) => {
    if (obj instanceof MeshClass && obj.visible) {
      meshes.push(obj);
    }
  });
  cachedScene = scene;
  cachedMeshes = meshes;
  return meshes;
}

export function occluderCacheGeneration(): number {
  return cacheGeneration;
}
