/**
 * WF02 R10 — clipped district ground tints for World Lab hero neighborhood.
 */
import { useLayoutEffect, useMemo, useRef } from 'react';
import { BoxGeometry, type InstancedMesh, Matrix4, Quaternion, Vector3 } from 'three';
import { terrainHeightAt } from '@/world/townLayout';
import { districtOverlayMaterial } from '@/rendering/palette/DistrictPalette';
import { WORLD_LAB_GROUND_ZONES } from '@/world/worldLab/districtCompositionSpec';

function GroundTintZone({
  zoneId,
  color,
  minX,
  maxX,
  minZ,
  maxZ,
}: {
  zoneId: string;
  color: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}) {
  const geometry = useMemo(() => new BoxGeometry(1, 0.05, 1), []);
  const material = useMemo(() => districtOverlayMaterial(color, 0.38), [color]);
  const ref = useRef<InstancedMesh>(null);
  const cellSize = 2.2;
  const cells = useMemo(() => {
    const out: { x: number; z: number }[] = [];
    for (let x = minX; x <= maxX; x += cellSize) {
      for (let z = minZ; z <= maxZ; z += cellSize) {
        out.push({ x, z });
      }
    }
    return out;
  }, [minX, maxX, minZ, maxZ]);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh || cells.length === 0) return;
    const matrix = new Matrix4();
    const quat = new Quaternion();
    const pos = new Vector3();
    const scale = new Vector3();
    cells.forEach((cell, i) => {
      pos.set(cell.x, terrainHeightAt(cell.x, cell.z) + 0.025, cell.z);
      quat.identity();
      scale.set(cellSize * 0.92, 1, cellSize * 0.92);
      matrix.compose(pos, quat, scale);
      mesh.setMatrixAt(i, matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [cells, cellSize]);

  if (cells.length === 0) return null;

  return (
    <instancedMesh
      ref={ref}
      args={[geometry, material, cells.length]}
      name={`world-lab-tint-${zoneId}`}
      receiveShadow
      castShadow={false}
    />
  );
}

export function WorldLabGroundTint() {
  return (
    <group name="world-lab-ground-tint">
      {WORLD_LAB_GROUND_ZONES.map((zone) => (
        <GroundTintZone
          key={zone.id}
          zoneId={zone.id}
          color={zone.color}
          minX={zone.minX}
          maxX={zone.maxX}
          minZ={zone.minZ}
          maxZ={zone.maxZ}
        />
      ))}
    </group>
  );
}
