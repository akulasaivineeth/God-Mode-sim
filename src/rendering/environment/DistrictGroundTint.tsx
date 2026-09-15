/**
 * WF02 R4.1 clipped district ground tint overlays — one instanced draw per zone.
 */
import { useLayoutEffect, useMemo, useRef } from 'react';
import { BoxGeometry, type InstancedMesh, Matrix4, Quaternion, Vector3 } from 'three';
import { terrainHeightAt } from '@/world/townLayout';
import { buildDistrictMassingSpec, resolveGroundTintCells } from './districtMassing';
import { districtOverlayMaterial } from '../palette/DistrictPalette';

function InstancedGroundTintZone({
  zoneId,
  color,
  cells,
}: {
  zoneId: string;
  color: string;
  cells: { x: number; z: number; width: number; depth: number }[];
}) {
  const geometry = useMemo(() => new BoxGeometry(1, 0.04, 1), []);
  const material = useMemo(() => districtOverlayMaterial(color, 0.32), [color]);
  const ref = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh || cells.length === 0) return;
    const matrix = new Matrix4();
    const quat = new Quaternion();
    const pos = new Vector3();
    const scale = new Vector3();
    cells.forEach((cell, i) => {
      const y = terrainHeightAt(cell.x, cell.z) + 0.03;
      pos.set(cell.x, y, cell.z);
      quat.identity();
      scale.set(cell.width, 1, cell.depth);
      matrix.compose(pos, quat, scale);
      mesh.setMatrixAt(i, matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [cells]);

  if (cells.length === 0) return null;

  return (
    <instancedMesh
      ref={ref}
      args={[geometry, material, cells.length]}
      name={`ground-tint-${zoneId}`}
      receiveShadow
      castShadow={false}
    />
  );
}

export function DistrictGroundTint() {
  const spec = useMemo(() => buildDistrictMassingSpec(), []);
  const cellMap = useMemo(() => resolveGroundTintCells(spec.groundZones), [spec.groundZones]);

  return (
    <group name="district-ground-tint">
      {spec.groundZones.map((zone) => (
        <InstancedGroundTintZone
          key={zone.id}
          zoneId={zone.id}
          color={zone.color}
          cells={cellMap.get(zone.id) ?? []}
        />
      ))}
    </group>
  );
}
