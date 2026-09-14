import { describe, expect, it } from 'vitest';
import {
  Box3,
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  SphereGeometry,
  Vector3,
} from 'three';
import {
  hasUnobstructedLineOfSight,
  samplePointsFromBounds,
} from '@/rendering/evidencePortrait';

describe('M02-020 portrait line-of-sight', () => {
  it('samplePointsFromBounds returns head/chest/pelvis samples', () => {
    const bounds = new Box3(new Vector3(-0.3, 0, -0.3), new Vector3(0.3, 1.8, 0.3));
    const samples = samplePointsFromBounds(bounds);
    expect(samples).toHaveLength(3);
    expect(samples[0].y).toBeGreaterThan(samples[2].y);
  });

  it('rejects a candidate when world geometry blocks the citizen', () => {
    const scene = new Object3D();
    const citizen = new Mesh(new SphereGeometry(0.35, 8, 8), new MeshBasicMaterial());
    citizen.position.set(0, 1, 0);
    scene.add(citizen);

    const wall = new Mesh(new BoxGeometry(2, 2, 0.4), new MeshBasicMaterial());
    wall.position.set(0, 1, 1.5);
    scene.add(wall);

    const bounds = new Box3().setFromObject(citizen);
    const cameraPos = new Vector3(0, 1.2, 4);
    expect(hasUnobstructedLineOfSight(cameraPos, bounds, scene, citizen)).toBe(false);
  });

  it('accepts a candidate with clear line of sight to the citizen', () => {
    const scene = new Object3D();
    const citizen = new Mesh(new SphereGeometry(0.35, 8, 8), new MeshBasicMaterial());
    citizen.position.set(0, 1, 0);
    scene.add(citizen);

    const bounds = new Box3().setFromObject(citizen);
    const cameraPos = new Vector3(2.5, 1.4, 2.5);
    expect(hasUnobstructedLineOfSight(cameraPos, bounds, scene, citizen)).toBe(true);
  });

  it('occlusion-aware portrait rejects wall between camera and subject', () => {
    const scene = new Object3D();
    const citizen = new Mesh(new SphereGeometry(0.35, 8, 8), new MeshBasicMaterial());
    citizen.position.set(0, 1, 0);
    scene.add(citizen);

    const occluder = new Mesh(new BoxGeometry(2.5, 2.5, 0.5), new MeshBasicMaterial());
    occluder.position.set(0, 1, 1.6);
    scene.add(occluder);

    const bounds = new Box3().setFromObject(citizen);
    const blockedPos = new Vector3(0, 1.2, 4);
    expect(hasUnobstructedLineOfSight(blockedPos, bounds, scene, citizen)).toBe(false);

    const clearPos = new Vector3(3, 1.4, 3);
    expect(hasUnobstructedLineOfSight(clearPos, bounds, scene, citizen)).toBe(true);
  });
});
