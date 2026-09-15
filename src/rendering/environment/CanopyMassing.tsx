/**
 * WF02 R4.1 Kenney-first canopy massing — orchard grid, civic frame, residential pairs.
 */
import { useMemo } from 'react';
import { buildDistrictMassingSpec, toGltfPlacements } from './districtMassing';
import { InstancedGltfPlacements } from '../assets/InstancedGltfPlacements';

export function CanopyMassing() {
  const placements = useMemo(() => toGltfPlacements(buildDistrictMassingSpec().kenneyTrees), []);
  return <InstancedGltfPlacements placements={placements} />;
}
