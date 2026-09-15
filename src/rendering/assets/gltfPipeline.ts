/**
 * Shared GLTF presentation pipeline — Foundation Hardening.
 *
 * Single loader import path and clone/prepare helpers for static props (ModelAsset),
 * skinned citizens (CitizenVisual), and instanced vegetation. R3F `useLoader` still
 * owns URL-level caching; this module owns mesh preparation rules.
 */
import type { AnimationClip, Group, Object3D } from 'three';
import { Mesh } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';

export { GLTFLoader };

export interface PreparedStaticRoot {
  root: Object3D;
}

export interface PreparedSkinnedCitizen {
  scene: Group;
  animations: AnimationClip[];
}

export function applyShadowFlags(
  root: Object3D,
  { castShadow = true, receiveShadow = true }: { castShadow?: boolean; receiveShadow?: boolean } = {},
): void {
  root.traverse((child) => {
    if (child instanceof Mesh) {
      child.castShadow = castShadow;
      child.receiveShadow = receiveShadow;
    }
  });
}

/** Static GLB/GLB prop — shallow scene clone with shared geometry/material refs. */
export function prepareStaticGltfRoot(
  source: Object3D,
  shadow: { castShadow?: boolean; receiveShadow?: boolean } = {},
): PreparedStaticRoot {
  const root = source.clone(true);
  applyShadowFlags(root, shadow);
  return { root };
}

/** Skinned citizen — SkeletonUtils clone preserves bone bindings for AnimationMixer. */
export function prepareSkinnedCitizenRoot(source: Group, animations: AnimationClip[]): PreparedSkinnedCitizen {
  const scene = cloneSkeleton(source) as Group;
  applyShadowFlags(scene);
  return { scene, animations };
}
