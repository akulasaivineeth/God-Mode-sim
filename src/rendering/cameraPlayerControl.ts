/**
 * Player camera helpers — VIS-002 UX (presentation only, ARCH-002).
 *
 * Registers the live OrbitControls instance so UI buttons and tests can dolly,
 * reset, and read camera state without touching simulation authority.
 */
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PerspectiveCamera, Vector3 } from 'three';
import { CAMERA_PRESETS, type CameraView } from './cameraPresets';
import { isWorldLabActive } from '@/world/resolver/worldResolver';

const LEGACY_TARGET_BOUNDS = {
  minX: -22,
  maxX: 56,
  minY: 0,
  maxY: 14,
  minZ: -32,
  maxZ: 42,
} as const;

const WORLD_LAB_TARGET_BOUNDS = {
  minX: -28,
  maxX: 28,
  minY: 0,
  maxY: 14,
  minZ: -28,
  maxZ: 32,
} as const;

export const PLAYER_CAMERA_LIMITS = {
  minDistance: 6,
  /** WF01 overview preset ≈133 m; block fly-away speck views (was 180). */
  maxDistance: isWorldLabActive() ? 90 : 136,
  minPolarAngle: 0.18,
  maxPolarAngle: Math.PI * 0.48,
  targetBounds: isWorldLabActive() ? WORLD_LAB_TARGET_BOUNDS : LEGACY_TARGET_BOUNDS,
  evidenceMinDistance: 1.2,
  dampingFactor: 0.085,
  rotateSpeed: 0.55,
  zoomSpeed: 0.9,
  panSpeed: 0.65,
} as const;

export interface PlayerCameraState {
  position: [number, number, number];
  target: [number, number, number];
  distance: number;
  minDistance: number;
  maxDistance: number;
}

let controlsRef: OrbitControls | null = null;

export function registerPlayerCameraControls(controls: OrbitControls | null): void {
  controlsRef = controls;
}

export function clampOrbitTarget(target: Vector3): void {
  const b = PLAYER_CAMERA_LIMITS.targetBounds;
  target.x = Math.max(b.minX, Math.min(b.maxX, target.x));
  target.y = Math.max(b.minY, Math.min(b.maxY, target.y));
  target.z = Math.max(b.minZ, Math.min(b.maxZ, target.z));
}

export function getCameraDistance(camera: PerspectiveCamera, target: Vector3): number {
  return camera.position.distanceTo(target);
}

export function applyPlayerCameraLimits(controls: OrbitControls, evidenceMode: boolean): void {
  controls.minDistance = evidenceMode
    ? PLAYER_CAMERA_LIMITS.evidenceMinDistance
    : PLAYER_CAMERA_LIMITS.minDistance;
  controls.maxDistance = PLAYER_CAMERA_LIMITS.maxDistance;
  controls.minPolarAngle = PLAYER_CAMERA_LIMITS.minPolarAngle;
  controls.maxPolarAngle = PLAYER_CAMERA_LIMITS.maxPolarAngle;
}

export function configureOrbitControls(controls: OrbitControls): void {
  const limits = PLAYER_CAMERA_LIMITS;
  controls.enableDamping = true;
  controls.dampingFactor = limits.dampingFactor;
  controls.rotateSpeed = limits.rotateSpeed;
  controls.zoomSpeed = limits.zoomSpeed;
  controls.panSpeed = limits.panSpeed;
  controls.screenSpacePanning = true;
  controls.zoomToCursor = true;
  controls.enableRotate = true;
  controls.enableZoom = true;
  controls.enablePan = true;
  applyPlayerCameraLimits(controls, false);
}

/** Multiply orbit radius by `factor` (<1 zoom in, >1 zoom out). */
export function dollyPlayerCamera(factor: number): boolean {
  if (!controlsRef) return false;
  const camera = controlsRef.object as PerspectiveCamera;
  const target = controlsRef.target;
  const offset = new Vector3().subVectors(camera.position, target);
  const dist = offset.length();
  if (dist < 1e-4) return false;
  const next = Math.max(
    controlsRef.minDistance,
    Math.min(controlsRef.maxDistance, dist * factor),
  );
  offset.normalize().multiplyScalar(next);
  camera.position.copy(target).add(offset);
  clampOrbitTarget(target);
  controlsRef.update();
  return true;
}

type OrbitDampingInternals = OrbitControls & {
  _sphericalDelta?: { set: (x: number, y: number, z: number) => void };
  _panOffset?: { set: (x: number, y: number, z: number) => void };
};

/** Hard-snap orbit controls; clears damping momentum so preset survives the next frame. */
export function snapOrbitControlsToPreset(
  controls: OrbitControls,
  preset: { position: [number, number, number]; target: [number, number, number] },
): void {
  const camera = controls.object as PerspectiveCamera;
  const damping = controls.enableDamping;
  controls.enableDamping = false;
  camera.position.set(...preset.position);
  controls.target.set(...preset.target);
  clampOrbitTarget(controls.target);
  const internals = controls as OrbitDampingInternals;
  internals._sphericalDelta?.set(0, 0, 0);
  internals._panOffset?.set(0, 0, 0);
  controls.update();
  controls.enableDamping = damping;
}

export function applyPresetToControls(view: CameraView): boolean {
  if (!controlsRef) return false;
  applyPlayerCameraLimits(controlsRef, false);
  snapOrbitControlsToPreset(controlsRef, CAMERA_PRESETS[view]);
  return true;
}

/** Recenter orbit on a world point (future citizen-follow) while preserving distance. */
export function recenterOrbitOnPoint(x: number, y: number, z: number, preserveDistance = true): boolean {
  if (!controlsRef) return false;
  const camera = controlsRef.object as PerspectiveCamera;
  const dist = preserveDistance ? getCameraDistance(camera, controlsRef.target) : null;
  controlsRef.target.set(x, y, z);
  clampOrbitTarget(controlsRef.target);
  if (dist != null) {
    const offset = new Vector3().subVectors(camera.position, controlsRef.target);
    if (offset.length() < 1e-4) {
      offset.set(0.4 * dist, 0.35 * dist, 0.4 * dist);
    }
    offset.normalize().multiplyScalar(
      Math.max(controlsRef.minDistance, Math.min(controlsRef.maxDistance, dist)),
    );
    camera.position.copy(controlsRef.target).add(offset);
  }
  clampOrbitTarget(controlsRef.target);
  controlsRef.update();
  return true;
}

export function getPlayerCameraState(): PlayerCameraState | null {
  if (!controlsRef) return null;
  const camera = controlsRef.object as PerspectiveCamera;
  return {
    position: [camera.position.x, camera.position.y, camera.position.z],
    target: [controlsRef.target.x, controlsRef.target.y, controlsRef.target.z],
    distance: getCameraDistance(camera, controlsRef.target),
    minDistance: controlsRef.minDistance,
    maxDistance: controlsRef.maxDistance,
  };
}
