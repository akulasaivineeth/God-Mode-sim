/**
 * WF02 R4.1 frontage bands — instanced shrub scatter along commercial/residential edges.
 */
import { useMemo } from 'react';
import { terrainHeightAt } from '@/world/townLayout';
import { buildDistrictMassingSpec } from './districtMassing';
import { InstancedScatter } from '../InstancedScatter';
import { SCATTER_GEOM } from '../scatterGeometries';
import { MAT } from '../sharedMaterials';
import { DISTRICT_PALETTE } from '../palette/DistrictPalette';
import { MeshStandardMaterial } from 'three';

const canopyLight = new MeshStandardMaterial({
  color: DISTRICT_PALETTE.canopyLight,
  roughness: 0.88,
});

export function FrontageBands() {
  const spec = useMemo(() => buildDistrictMassingSpec(), []);
  const frontage = useMemo(
    () =>
      spec.frontageScatter.map((p) => ({
        ...p,
        y: terrainHeightAt(p.x, p.z),
      })),
    [spec.frontageScatter],
  );
  const civic = useMemo(
    () =>
      spec.civicPavers.map((p) => ({
        ...p,
        y: terrainHeightAt(p.x, p.z) + 0.04,
      })),
    [spec.civicPavers],
  );

  return (
    <group name="frontage-bands">
      <InstancedScatter points={frontage} geometry={SCATTER_GEOM.shrub} material={canopyLight} castShadow={false} />
      <InstancedScatter points={civic} geometry={SCATTER_GEOM.paver} material={MAT.path} castShadow={false} />
    </group>
  );
}
