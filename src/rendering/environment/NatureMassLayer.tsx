/**
 * WF02 R5.1 tier-gated Quaternius nature mass — single instanced batch per preset.
 */
import { useMemo } from 'react';
import type { CameraView } from '../cameraPresets';
import { InstancedVegetation } from '../assets/InstancedVegetation';
import { isCompositionTierVisible } from './compositionVisibility';
import {
  DISTRICT_CANOPY_RESTORE,
  ORCHARD_PERIMETER,
  PARK_RIVER_ARC,
  PERIPHERY_FOREST_FRAME,
} from './natureMassPlacements';

export function NatureMassLayer({ cameraView }: { cameraView: CameraView }) {
  const placements = useMemo(() => {
    const all = [];
    if (isCompositionTierVisible('district', cameraView)) all.push(...DISTRICT_CANOPY_RESTORE);
    if (isCompositionTierVisible('orchard', cameraView)) all.push(...ORCHARD_PERIMETER);
    if (isCompositionTierVisible('park', cameraView)) all.push(...PARK_RIVER_ARC);
    if (isCompositionTierVisible('periphery', cameraView)) all.push(...PERIPHERY_FOREST_FRAME);
    return all;
  }, [cameraView]);

  if (placements.length === 0) return null;
  return <InstancedVegetation placements={placements} />;
}
