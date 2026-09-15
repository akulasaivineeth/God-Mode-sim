/**
 * Real Quaternius/Kenney vegetation — tier-gated @ R6 (zero Quaternius on Overview/Angled).
 */
import { useMemo } from 'react';
import { CANONICAL_TOWN } from '@/world/townLayout';
import type { CameraView } from '../cameraPresets';
import {
  M02_CORRIDOR_VEGETATION,
  RIVERBANK_VEGETATION,
  type VegetationPlacement,
} from '../assets/EnvironmentAssetRegistry';
import { InstancedVegetation } from '../assets/InstancedVegetation';
import { isBaselineVegetationVisible } from './compositionVisibility';

export function VegetationLayer({ cameraView }: { cameraView: CameraView }) {
  const parkAndSquare: VegetationPlacement[] = useMemo(() => {
    const sq = CANONICAL_TOWN.square;
    const park = CANONICAL_TOWN.park;
    return [
      { position: { x: sq.center.x - 6, z: sq.center.z + 5 }, asset: 'bush', scale: 1.0, source: 'quaternius' },
      { position: { x: sq.center.x + 6, z: sq.center.z - 5 }, asset: 'bushFlowers', scale: 0.9, source: 'quaternius' },
      { position: { x: park.center.x - 5, z: park.center.z + 4 }, asset: 'commonTree1', scale: 0.85, source: 'quaternius' },
      { position: { x: park.center.x + 6, z: park.center.z - 3 }, asset: 'commonTree2', scale: 0.75, source: 'quaternius' },
      { position: { x: park.center.x - 3, z: park.center.z - 5 }, asset: 'pine1', scale: 0.7, source: 'quaternius' },
      { position: { x: park.center.x + 4, z: park.center.z + 5 }, asset: 'flowers', scale: 0.9, source: 'quaternius' },
    ];
  }, []);

  const allPlacements = useMemo(() => {
    if (!isBaselineVegetationVisible(cameraView)) {
      return [];
    }
    return [...M02_CORRIDOR_VEGETATION, ...RIVERBANK_VEGETATION, ...parkAndSquare];
  }, [cameraView, parkAndSquare]);

  if (allPlacements.length === 0) return null;
  return <InstancedVegetation placements={allPlacements} />;
}
