/**
 * Camera presets — VIS-002 + evidence capture overrides.
 */
export type CameraView = 'overview' | 'angled' | 'street';

export interface CameraPreset {
  position: [number, number, number];
  target: [number, number, number];
}

export const CAMERA_PRESETS: Record<CameraView, CameraPreset> = {
  overview: { position: [24, 74, 86], target: [-10, 2, -12] },
  angled: { position: [44, 38, 54], target: [-8, 3, -10] },
  street: { position: [12, 4.5, 22], target: [0, 2.5, 2] },
};

/** Evidence capture shots — each with distinct framing (M02 R6). */
export const EVIDENCE_CAMERAS: Record<string, CameraPreset> = {
  overview: { position: [24, 74, 86], target: [-10, 2, -12] },
  angled: { position: [44, 38, 54], target: [-8, 3, -10] },
  street_home: { position: [16, 3.8, -4], target: [11, 2.5, -10] },
  street_store: { position: [-6, 4.2, 14], target: [-11, 3, 11] },
  workshop_work: { position: [-18, 5.5, 26], target: [-11, 2.5, 23] },
  river_forest: { position: [55, 42, 10], target: [35, 0, 0] },
  square_park: { position: [18, 28, 22], target: [8, 1, 8] },
  night: { position: [20, 55, 70], target: [-5, 2, -5] },
  inspector: { position: [14, 6, 8], target: [0, 2.5, 2] },
  facility_identity: { position: [8, 52, 48], target: [-2, 2, 8] },
};

declare global {
  interface Window {
    __GODMODE_SET_EVIDENCE_CAMERA__?: (name: string) => void;
  }
}
