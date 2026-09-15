/**
 * Citizen model scale normalization — presentation only (M02 closure).
 *
 * Derives uniform scale from the loaded GLB rest-pose bounding box so standing
 * height is ~1.7–1.9 world units. Feet offset lifts the mesh so soles sit on terrain.
 */
import { Box3, Object3D, Vector3 } from 'three';

/** Simulation/collision authority height — unchanged from M02 (ARCH-002). */
export const TARGET_CITIZEN_HEIGHT = 1.8;

/** WF02 presentation-only visual height (simulation authority decoupled). */
export const PRESENTATION_CITIZEN_HEIGHT = 2.32;

/**
 * Measured rest height of Kenney alex-character.glb (CC0 registry) in model units.
 * Used only when SkinnedMesh bbox is degenerate (< MIN_TRUSTED_MODEL_HEIGHT).
 */
export const KENNEY_ALEX_MODEL_HEIGHT = 0.67132488322258;

/** Below this, treat bbox as degenerate (not "small but valid"). */
const MIN_TRUSTED_MODEL_HEIGHT = 0.05;

const _box = new Box3();
const _size = new Vector3();

export interface CitizenModelLayout {
  scale: number;
  /** Y offset applied to body group so feet rest at terrain (world-up). */
  footOffsetY: number;
  rawHeight: number;
}

export function layoutCitizenModelFromObject(
  object: Object3D,
  targetHeight = TARGET_CITIZEN_HEIGHT,
): CitizenModelLayout {
  _box.setFromObject(object);
  _box.getSize(_size);
  const measuredHeight = _size.y;
  const rawHeight =
    measuredHeight >= MIN_TRUSTED_MODEL_HEIGHT ? measuredHeight : KENNEY_ALEX_MODEL_HEIGHT;
  const scale = targetHeight / rawHeight;
  const footOffsetY =
    measuredHeight >= MIN_TRUSTED_MODEL_HEIGHT ? -_box.min.y * scale : 0;
  return { scale, footOffsetY, rawHeight };
}
