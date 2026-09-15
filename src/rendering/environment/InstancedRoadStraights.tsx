/**
 * Instanced Kenney road-straight modules — one draw call per mesh part.
 */
import { useCallback, useMemo } from 'react';
import { Matrix4, Quaternion, Vector3 } from 'three';
import { KENNEY_ASSETS } from '../assets/EnvironmentAssetRegistry';
import { terrainHeightAt } from '@/world/townLayout';
import type { RoadTilePlacement } from './roadTopology';
import {
  InstancedGltfPlacements,
  type GltfInstancePlacement,
} from '../assets/InstancedGltfPlacements';

export function InstancedRoadStraights({ tiles }: { tiles: readonly RoadTilePlacement[] }) {
  const placements = useMemo<GltfInstancePlacement[]>(
    () =>
      tiles.map((tile) => ({
        url: KENNEY_ASSETS.roadStraight,
        x: tile.x,
        z: tile.z,
        rotY: tile.rotY,
        scale: tile.scale ?? 1.5,
        yOffset: 0.04,
      })),
    [tiles],
  );

  const resolveMatrix = useCallback((placement: GltfInstancePlacement, matrix: Matrix4) => {
    const quat = new Quaternion();
    const pos = new Vector3();
    const scale = new Vector3();
    const y = terrainHeightAt(placement.x, placement.z) + (placement.yOffset ?? 0);
    const s = placement.scale ?? 1;
    pos.set(placement.x, y, placement.z);
    quat.setFromAxisAngle(new Vector3(0, 1, 0), placement.rotY ?? 0);
    scale.set(s, s, s);
    matrix.compose(pos, quat, scale);
  }, []);

  return <InstancedGltfPlacements placements={placements} resolveMatrix={resolveMatrix} />;
}
