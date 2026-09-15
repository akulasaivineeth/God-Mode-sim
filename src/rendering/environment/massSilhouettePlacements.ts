/**
 * WF02 R6 deterministic mass silhouette tables — KCC + CVP batch exports.
 */
import type { CameraView } from '../cameraPresets';
import { CANONICAL_TOWN } from '@/world/townLayout';
import { isCompositionTierVisible } from './compositionVisibility';
import type { MassingGltfPlacement } from './districtMassing';
import type { VolumeScatterPoint } from './massSilhouetteBuilders';
import {
  buildCivicVolumePlacements,
  buildFieldBandRows,
  buildFutureLotGardenVolumes,
  buildOrchardBlockKenney,
  buildParkPromenadeVolumes,
  buildParkRiverArcKenney,
  buildPeripheryForestKenney,
  buildResidentialGardenVolumes,
  buildResidentialStreetTrees,
  buildRingKenneyPlacements,
} from './massSilhouetteBuilders';
import { KENNEY_ASSETS } from '../assets/EnvironmentAssetRegistry';

const orchardCenter = CANONICAL_TOWN.farmPlots.find((p) => p.id === 'farm-3')!.center;
const squareCenter = CANONICAL_TOWN.square.center;

/** Kenney orchard hero block — interior grid + perimeter frame. */
export const ORCHARD_BLOCK_KCC: readonly MassingGltfPlacement[] = buildOrchardBlockKenney(orchardCenter);

/** Kenney park/river arc canopy. */
export const PARK_RIVER_ARC_KCC: readonly MassingGltfPlacement[] = buildParkRiverArcKenney();

/** Kenney north/west periphery forest wall. */
export const PERIPHERY_FOREST_FRAME_KCC: readonly MassingGltfPlacement[] = buildPeripheryForestKenney();

/** Civic plaza tree ring. */
export const CIVIC_COLONNADE_KCC: readonly MassingGltfPlacement[] = buildRingKenneyPlacements(
  squareCenter,
  9.5,
  12,
  KENNEY_ASSETS.treeLarge,
  1.12,
);

/** Residential dual street-tree lines. */
export const RESIDENTIAL_STREET_TREES_KCC: readonly MassingGltfPlacement[] =
  buildResidentialStreetTrees();

/** Orchard south field-band CVP rows. */
export const ORCHARD_FIELD_BAND_CVP: readonly VolumeScatterPoint[] = buildFieldBandRows(
  orchardCenter,
  3,
  10,
  2.8,
  12,
);

/** Park promenade lawn mass arc. */
export const PARK_PROMENADE_CVP: readonly VolumeScatterPoint[] = buildParkPromenadeVolumes();

export const CIVIC_PLAZA_CVP: readonly VolumeScatterPoint[] = buildCivicVolumePlacements();
export const RESIDENTIAL_GARDEN_CVP: readonly VolumeScatterPoint[] = buildResidentialGardenVolumes();
export const FUTURE_LOT_GARDEN_CVP: readonly VolumeScatterPoint[] = buildFutureLotGardenVolumes();

/** @deprecated R5.1 Quaternius tier removed in R6 */
export const DISTRICT_CANOPY_RESTORE: readonly MassingGltfPlacement[] = [];

/** Legacy export name — Kenney orchard block. */
export const ORCHARD_PERIMETER = ORCHARD_BLOCK_KCC;

/** Legacy export name — Kenney park arc. */
export const PARK_RIVER_ARC = PARK_RIVER_ARC_KCC;

/** Legacy export name — Kenney periphery wall. */
export const PERIPHERY_FOREST_FRAME = PERIPHERY_FOREST_FRAME_KCC;

export function buildKenneyPlacementsForView(cameraView: CameraView): MassingGltfPlacement[] {
  const all: MassingGltfPlacement[] = [];
  if (isCompositionTierVisible('core', cameraView)) {
    all.push(...CIVIC_COLONNADE_KCC);
  }
  if (isCompositionTierVisible('district', cameraView)) {
    all.push(...RESIDENTIAL_STREET_TREES_KCC);
  }
  if (isCompositionTierVisible('orchard', cameraView)) {
    all.push(...ORCHARD_BLOCK_KCC);
  }
  if (isCompositionTierVisible('park', cameraView)) {
    all.push(...PARK_RIVER_ARC_KCC);
  }
  if (isCompositionTierVisible('periphery', cameraView)) {
    all.push(...PERIPHERY_FOREST_FRAME_KCC);
  }
  return all;
}

export function buildVolumePlacementsForView(cameraView: CameraView): {
  canopyWarm: VolumeScatterPoint[];
  fieldWarm: VolumeScatterPoint[];
} {
  const canopyWarm: VolumeScatterPoint[] = [];
  const fieldWarm: VolumeScatterPoint[] = [];

  if (isCompositionTierVisible('core', cameraView)) {
    canopyWarm.push(...CIVIC_PLAZA_CVP, ...RESIDENTIAL_GARDEN_CVP, ...FUTURE_LOT_GARDEN_CVP);
  }
  if (isCompositionTierVisible('orchard', cameraView)) {
    fieldWarm.push(...ORCHARD_FIELD_BAND_CVP);
  }
  if (isCompositionTierVisible('park', cameraView)) {
    canopyWarm.push(...PARK_PROMENADE_CVP);
  }

  return { canopyWarm, fieldWarm };
}
