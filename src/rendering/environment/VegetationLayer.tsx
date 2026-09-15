/**
 * Real Quaternius/Kenney vegetation — grouped instancing, no cone prototypes.
 */
import { useMemo } from 'react';
import { CANONICAL_TOWN } from '@/world/townLayout';
import {
  buildDistrictCompositionPlacements,
  buildPeripheryForest,
  M02_CORRIDOR_VEGETATION,
  RIVERBANK_VEGETATION,
  type VegetationPlacement,
} from '../assets/EnvironmentAssetRegistry';
import { InstancedVegetation } from '../assets/InstancedVegetation';

export function VegetationLayer() {
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

  const districtComposition = useMemo(() => buildDistrictCompositionPlacements(), []);

  const allPlacements = useMemo(
    () => [
      ...M02_CORRIDOR_VEGETATION,
      ...buildPeripheryForest(),
      ...RIVERBANK_VEGETATION,
      ...parkAndSquare,
      ...districtComposition,
    ],
    [parkAndSquare, districtComposition],
  );

  return <InstancedVegetation placements={allPlacements} />;
}
