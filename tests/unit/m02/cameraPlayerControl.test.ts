import { describe, expect, it } from 'vitest';
import { Vector3 } from 'three';
import { CAMERA_PRESETS } from '@/rendering/cameraPresets';
import { clampOrbitTarget, PLAYER_CAMERA_LIMITS } from '@/rendering/cameraPlayerControl';
import { isWorldLabActive } from '@/world/resolver/worldResolver';

describe('cameraPlayerControl', () => {
  it('clamps orbit target inside town-scale bounds', () => {
    const target = new Vector3(999, -50, -999);
    clampOrbitTarget(target);
    const b = PLAYER_CAMERA_LIMITS.targetBounds;
    expect(target.x).toBe(b.maxX);
    expect(target.y).toBe(b.minY);
    expect(target.z).toBe(b.minZ);
  });

  it('preserves in-bounds targets', () => {
    const target = isWorldLabActive() ? new Vector3(8, 2, 5) : new Vector3(20, 2, 5);
    clampOrbitTarget(target);
    expect(target.x).toBe(isWorldLabActive() ? 8 : 20);
    expect(target.y).toBe(2);
    expect(target.z).toBe(5);
  });

  it('uses practical max distance tighter than legacy 180', () => {
    expect(PLAYER_CAMERA_LIMITS.maxDistance).toBeLessThan(180);
    expect(PLAYER_CAMERA_LIMITS.maxDistance).toBeGreaterThanOrEqual(isWorldLabActive() ? 55 : 90);
  });

  it('allows the active overview preset without orbit clamping', () => {
    const { position, target } = CAMERA_PRESETS.overview;
    const dist = new Vector3(...position).distanceTo(new Vector3(...target));
    expect(dist).toBeLessThanOrEqual(PLAYER_CAMERA_LIMITS.maxDistance);
  });
});
