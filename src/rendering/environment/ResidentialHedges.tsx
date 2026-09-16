/**
 * WF02 R4.1 Kenney fence-low residential hedges — instanced segments.
 */
import { useMemo } from 'react';
import { buildDistrictMassingSpec } from './districtMassing';
import { InstancedGltfPlacements } from '../assets/InstancedGltfPlacements';
import { WF02_R8_SLICE_MODE } from './r8SliceMode';

export function ResidentialHedges() {
  const segments = useMemo(() => {
    if (WF02_R8_SLICE_MODE) return [];
    return buildDistrictMassingSpec().fenceSegments;
  }, []);
  return <InstancedGltfPlacements placements={segments} />;
}
