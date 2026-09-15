import { describe, expect, it } from 'vitest';
import { Group, Mesh, Scene } from 'three';
import {
  getVisibleOccluderMeshes,
  invalidateSceneOccluderCache,
  occluderCacheGeneration,
} from '@/rendering/sceneOccluderCache';

describe('sceneOccluderCache', () => {
  it('caches visible meshes until invalidated', () => {
    const scene = new Scene();
    scene.add(new Mesh());
    invalidateSceneOccluderCache();
    const gen0 = occluderCacheGeneration();
    const first = getVisibleOccluderMeshes(scene);
    const second = getVisibleOccluderMeshes(scene);
    expect(first).toBe(second);
    expect(first).toHaveLength(1);
    invalidateSceneOccluderCache();
    expect(occluderCacheGeneration()).toBeGreaterThan(gen0);
    const after = getVisibleOccluderMeshes(scene);
    expect(after).not.toBe(first);
  });

  it('rebuilds cache when scene reference changes', () => {
    const a = new Scene();
    a.add(new Group());
    const b = new Scene();
    b.add(new Mesh());
    const fromA = getVisibleOccluderMeshes(a);
    const fromB = getVisibleOccluderMeshes(b);
    expect(fromA).not.toBe(fromB);
    expect(fromB).toHaveLength(1);
  });
});
