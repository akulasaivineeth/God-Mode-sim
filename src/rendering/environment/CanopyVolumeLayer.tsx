/**
 * WF02 R6 low-poly canopy/garden/field volume mass — max 2 draw calls.
 */
import { useMemo } from 'react';
import { Color, MeshStandardMaterial } from 'three';
import type { CameraView } from '../cameraPresets';
import { terrainHeightAt } from '@/world/townLayout';
import { InstancedScatter } from '../InstancedScatter';
import { SCATTER_GEOM } from '../scatterGeometries';
import { DISTRICT_PALETTE } from '../palette/DistrictPalette';
import { buildVolumePlacementsForView } from './massSilhouettePlacements';

const canopyWarmMaterial = new MeshStandardMaterial({
  color: new Color(DISTRICT_PALETTE.canopyLight),
  roughness: 0.9,
});

const fieldWarmMaterial = new MeshStandardMaterial({
  color: new Color(DISTRICT_PALETTE.groundFarm),
  roughness: 0.94,
});

export function CanopyVolumeLayer({ cameraView }: { cameraView: CameraView }) {
  const { canopyWarm, fieldWarm } = useMemo(
    () => buildVolumePlacementsForView(cameraView),
    [cameraView],
  );

  const canopyPoints = useMemo(
    () => canopyWarm.map((p) => ({ ...p, y: terrainHeightAt(p.x, p.z) })),
    [canopyWarm],
  );
  const fieldPoints = useMemo(
    () => fieldWarm.map((p) => ({ ...p, y: terrainHeightAt(p.x, p.z) })),
    [fieldWarm],
  );

  return (
    <group name="canopy-volume-layer">
      {canopyPoints.length > 0 ? (
        <InstancedScatter
          points={canopyPoints}
          geometry={SCATTER_GEOM.gardenMound}
          material={canopyWarmMaterial}
          castShadow={false}
        />
      ) : null}
      {fieldPoints.length > 0 ? (
        <InstancedScatter
          points={fieldPoints}
          geometry={SCATTER_GEOM.fieldBand}
          material={fieldWarmMaterial}
          castShadow={false}
        />
      ) : null}
    </group>
  );
}
