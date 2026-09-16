/**
 * WF02 R7.1 deterministic mass silhouette tables — hero-core envelope fills + KCC/CVP.
 */
import type { CameraView } from '../cameraPresets';
import { CANONICAL_TOWN } from '@/world/townLayout';
import { isCompositionTierVisible } from './compositionVisibility';
import type { MassingGltfPlacement } from './districtMassing';
import type { VolumeScatterPoint } from './massSilhouetteBuilders';
import {
  buildParkRiverArcKenney,
  buildPeripheryForestKenney,
  buildFutureLotGardenVolumes,
  buildResidentialStreetTrees,
} from './massSilhouetteBuilders';
import {
  buildCivicHeroEnvelopeFills,
  buildCommercialFrontageCvp,
  buildEmbankmentEdgeCvp,
  buildFieldBandEnvelopeCvp,
  buildOrchardBlockEnvelopeKcc,
  buildParkUFrameCvp,
  buildResidentialClusterCvp,
} from './envelopeFillBuilders';
import { WF02_R8_SLICE_MODE } from './r8SliceMode';
import {
  buildR8SliceKenneyPlacements,
  buildR8SliceVolumePlacements,
} from './r8SliceDensityBuilders';

const orchardVisualCenter = { x: 70, z: 68 };

/** R7.1 solid orchard block inside hero envelope. */
export const ORCHARD_BLOCK_KCC: readonly MassingGltfPlacement[] = buildOrchardBlockEnvelopeKcc();

/** Kenney park/river arc canopy (supplement to U-frame CVP). */
export const PARK_RIVER_ARC_KCC: readonly MassingGltfPlacement[] = buildParkRiverArcKenney();

/** Kenney north/west periphery forest wall. */
export const PERIPHERY_FOREST_FRAME_KCC: readonly MassingGltfPlacement[] = buildPeripheryForestKenney();

const civicHero = buildCivicHeroEnvelopeFills();

/** Civic plaza warm pad + colonnade ring. */
export const CIVIC_COLONNADE_KCC: readonly MassingGltfPlacement[] = civicHero.colonnadeKcc;

/** Orchard south field-band CVP rows. */
export const ORCHARD_FIELD_BAND_CVP: readonly VolumeScatterPoint[] = buildFieldBandEnvelopeCvp();

/** Park U-frame promenade mass. */
export const PARK_PROMENADE_CVP: readonly VolumeScatterPoint[] = [
  ...buildParkUFrameCvp(),
];

export const CIVIC_PLAZA_CVP: readonly VolumeScatterPoint[] = [
  ...civicHero.plazaCvp,
  ...buildEmbankmentEdgeCvp(),
];

export const COMMERCIAL_FRONTAGE_CVP: readonly VolumeScatterPoint[] = buildCommercialFrontageCvp();

export const RESIDENTIAL_GARDEN_CVP: readonly VolumeScatterPoint[] = buildResidentialClusterCvp();

export const FUTURE_LOT_GARDEN_CVP: readonly VolumeScatterPoint[] = buildFutureLotGardenVolumes();

/** @deprecated R5.1 Quaternius tier removed in R6 */
export const DISTRICT_CANOPY_RESTORE: readonly MassingGltfPlacement[] = [];

/** Legacy export name — Kenney orchard block. */
export const ORCHARD_PERIMETER = ORCHARD_BLOCK_KCC;

/** Legacy export name — Kenney park arc. */
export const PARK_RIVER_ARC = PARK_RIVER_ARC_KCC;

/** Legacy export name — Kenney periphery wall. */
export const PERIPHERY_FOREST_FRAME = PERIPHERY_FOREST_FRAME_KCC;

/** Residential dual street-tree lines along cluster edge. */
export const RESIDENTIAL_STREET_TREES_KCC: readonly MassingGltfPlacement[] = buildResidentialStreetTrees();

export function buildKenneyPlacementsForView(cameraView: CameraView): MassingGltfPlacement[] {
  if (WF02_R8_SLICE_MODE) {
    if (!isCompositionTierVisible('core', cameraView) && !isCompositionTierVisible('district', cameraView)) {
      return [];
    }
    return buildR8SliceKenneyPlacements();
  }
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
  if (WF02_R8_SLICE_MODE) {
    if (!isCompositionTierVisible('core', cameraView) && !isCompositionTierVisible('district', cameraView)) {
      return { canopyWarm: [], fieldWarm: [] };
    }
    return buildR8SliceVolumePlacements();
  }
  const canopyWarm: VolumeScatterPoint[] = [];
  const fieldWarm: VolumeScatterPoint[] = [];

  if (isCompositionTierVisible('core', cameraView)) {
    canopyWarm.push(
      ...CIVIC_PLAZA_CVP,
      ...COMMERCIAL_FRONTAGE_CVP,
      ...RESIDENTIAL_GARDEN_CVP,
      ...FUTURE_LOT_GARDEN_CVP,
    );
  }
  if (isCompositionTierVisible('orchard', cameraView)) {
    fieldWarm.push(...ORCHARD_FIELD_BAND_CVP);
  }
  if (isCompositionTierVisible('park', cameraView)) {
    canopyWarm.push(...PARK_PROMENADE_CVP);
  }

  return { canopyWarm, fieldWarm };
}

/** Orchard visual anchor for tests/diagnostics. */
export function getOrchardVisualCenter() {
  return orchardVisualCenter;
}

/** Square center retained for civic reference tests. */
export function getSquareCenter() {
  return CANONICAL_TOWN.square.center;
}
