/**
 * WF02 R6 Kenney Canopy Clusters — tier-gated instanced tree mass.
 */
import { useMemo } from 'react';
import type { CameraView } from '../cameraPresets';
import { buildKenneyPlacementsForView } from './massSilhouettePlacements';
import { InstancedGltfPlacements } from '../assets/InstancedGltfPlacements';

export function CanopyMassing({ cameraView }: { cameraView: CameraView }) {
  const placements = useMemo(() => buildKenneyPlacementsForView(cameraView), [cameraView]);
  if (placements.length === 0) return null;
  return <InstancedGltfPlacements placements={placements} />;
}
