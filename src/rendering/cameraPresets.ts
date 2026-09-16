/**
 * Camera presets — WF02 R9 World Lab neighborhood framings.
 */
import { computeFacilityStreetPreset } from './facilityStreetCamera';
import { computeRiverBridgePreset } from './riverBridgeCamera';
import { isWorldLabActive, resolveWorldDefinition } from '@/world/resolver/worldResolver';

export type CameraView =
  | 'overview'
  | 'angled'
  | 'street'
  | 'home-street'
  | 'store-street'
  | 'workshop-street'
  | 'store-workshop'
  | 'river'
  | 'square'
  | 'civic'
  | 'residential'
  | 'commercial';

export interface CameraPreset {
  position: [number, number, number];
  target: [number, number, number];
}

const LEGACY_PRESETS: Record<CameraView, CameraPreset> = {
  overview: { position: [10, 93, 54], target: [30, 2, 4] },
  angled: { position: [68, 53, 37], target: [28, 3, 2] },
  street: { position: [14, 4.5, 24], target: [0, 2.5, 2] },
  'home-street': computeFacilityStreetPreset('home-street'),
  'store-street': computeFacilityStreetPreset('store-street'),
  'workshop-street': computeFacilityStreetPreset('workshop-street'),
  'store-workshop': { position: [-20, 8, 18], target: [-11, 2, 17] },
  river: computeRiverBridgePreset(),
  square: { position: [-22, 18, 24], target: [-4, 2, -8] },
  civic: { position: [-28, 12, -8], target: [-18, 3, -18] },
  residential: { position: [58, 52, -38], target: [62, 0, -55] },
  commercial: { position: [-24, 14, 28], target: [-8, 2, 14] },
};

function buildPresets(): Record<CameraView, CameraPreset> {
  if (!isWorldLabActive()) return LEGACY_PRESETS;
  const world = resolveWorldDefinition().cameras;
  return {
    overview: world.overview ?? LEGACY_PRESETS.overview,
    angled: world.angled ?? LEGACY_PRESETS.angled,
    street: world.street ?? LEGACY_PRESETS.street,
    'home-street': computeFacilityStreetPreset('home-street'),
    'store-street': computeFacilityStreetPreset('store-street'),
    'workshop-street': computeFacilityStreetPreset('workshop-street'),
    'store-workshop': world['store-workshop'] ?? LEGACY_PRESETS['store-workshop'],
    river: world.river ?? computeRiverBridgePreset(),
    square: world.square ?? LEGACY_PRESETS.square,
    civic: world.civic ?? LEGACY_PRESETS.civic,
    residential: world.residential ?? LEGACY_PRESETS.residential,
    commercial: world.commercial ?? LEGACY_PRESETS.commercial,
  };
}

export const CAMERA_PRESETS: Record<CameraView, CameraPreset> = buildPresets();

export function cameraViewFromQuery(search: string): CameraView | null {
  const cam = new URLSearchParams(search).get('cam');
  if (cam && cam in CAMERA_PRESETS) return cam as CameraView;
  return null;
}
