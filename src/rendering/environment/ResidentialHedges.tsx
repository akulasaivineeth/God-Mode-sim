/**
 * WF02 R4.1 Kenney fence-low residential hedges — instanced segments.
 */
import { useMemo } from 'react';
import { buildDistrictMassingSpec } from './districtMassing';
import { InstancedGltfPlacements } from '../assets/InstancedGltfPlacements';

export function ResidentialHedges() {
  const segments = useMemo(() => buildDistrictMassingSpec().fenceSegments, []);
  return <InstancedGltfPlacements placements={segments} />;
}
