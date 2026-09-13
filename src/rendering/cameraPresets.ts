/**
 * Camera presets — VIS-002.
 *
 * Plain English: Named framings the player can jump to. Constants live here
 * (separate from the component) so the camera component only exports a component.
 */
export type CameraView = 'overview' | 'angled' | 'street';

export interface CameraPreset {
  position: [number, number, number];
  target: [number, number, number];
}

export const CAMERA_PRESETS: Record<CameraView, CameraPreset> = {
  // Overview/Angled are biased slightly toward the north-west so the peripheral
  // hills + North Woods read clearly as topography (not a flat plane).
  overview: { position: [24, 74, 86], target: [-10, 2, -12] },
  angled: { position: [44, 38, 54], target: [-8, 3, -10] },
  street: { position: [12, 4.5, 22], target: [0, 2.5, 2] },
};
