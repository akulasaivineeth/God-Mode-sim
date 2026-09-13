/**
 * Camera presets — VIS-002 + R8 evidence framings.
 *
 * Plain English: Named framings the player (and capture harness) can jump to.
 * Constants live here so the camera component only exports a component.
 */
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
  // Overview/Angged biased east so the river ribbon + bridge read as geography.
  overview: { position: [8, 80, 58], target: [26, 1, 0] },
  angled: { position: [48, 44, 32], target: [28, 2, 2] },
  street: { position: [12, 4.5, 22], target: [0, 2.5, 2] },
  // Facility street framings — each targets its dedicated Kenney visual.
  'home-street': { position: [11, 6, -2], target: [11, 3.5, -10] },
  'store-street': { position: [-11, 5.5, 19], target: [-11, 3.5, 11] },
  'workshop-street': { position: [-15, 6, 34], target: [-11, 3.5, 23] },
  // Oblique cross-river view near the bridge — diagonal across the ribbon width (R10 evidence).
  river: { position: [12, 28, -14], target: [40, 0.5, 14] },
  square: { position: [-14, 14, 18], target: [0, 2, 0] },
};

/** Parse `?cam=store-street` for evidence capture (presentation only). */
export function cameraViewFromQuery(search: string): CameraView | null {
  const cam = new URLSearchParams(search).get('cam');
  if (cam && cam in CAMERA_PRESETS) return cam as CameraView;
  return null;
}
