/**
 * Camera presets — VIS-002 + R8/R12 evidence framings.
 *
 * Plain English: Named framings the player (and capture harness) can jump to.
 * Constants live here so the camera component only exports a component.
 */
import { computeFacilityStreetPreset } from './facilityStreetCamera';
import { computeRiverBridgePreset } from './riverBridgeCamera';

export type CameraView =
  | 'overview'
  | 'angled'
  | 'street'
  | 'home-street'
  | 'store-street'
  | 'workshop-street'
  | 'river'
  | 'square';

export interface CameraPreset {
  position: [number, number, number];
  target: [number, number, number];
}

export const CAMERA_PRESETS: Record<CameraView, CameraPreset> = {
  // WF01 — expanded 240 m town; overview biased east for river geography.
  overview: { position: [12, 145, 105], target: [32, 2, 0] },
  angled: { position: [95, 78, 58], target: [38, 4, 2] },
  street: { position: [14, 4.5, 24], target: [0, 2.5, 2] },
  // Facility street framings — doorstep-derived, camera outside building volumes (M02-020).
  'home-street': computeFacilityStreetPreset('home-street'),
  'store-street': computeFacilityStreetPreset('store-street'),
  'workshop-street': computeFacilityStreetPreset('workshop-street'),
  // Bridge-centric cross-river subject — derived from authored geometry (R12).
  river: computeRiverBridgePreset(),
  square: { position: [-14, 14, 18], target: [0, 2, 0] },
};

/** Parse `?cam=store-street` for evidence capture (presentation only). */
export function cameraViewFromQuery(search: string): CameraView | null {
  const cam = new URLSearchParams(search).get('cam');
  if (cam && cam in CAMERA_PRESETS) return cam as CameraView;
  return null;
}
