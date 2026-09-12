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
  overview: { position: [0, 85, 95], target: [0, 0, 0] },
  angled: { position: [46, 40, 58], target: [0, 0, 4] },
  street: { position: [12, 4.5, 22], target: [0, 2.5, 2] },
};
