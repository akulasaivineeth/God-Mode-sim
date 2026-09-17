/**
 * WF02 R13 — presentation AABB + door positions for prototype shells.
 */
import { terrainHeightAt } from '@/world/townLayout';
import type { PresentationWorldAabb } from '../assets/presentationBounds';
import { resolveNormalizedLayout, resolveRotatedFootprint } from '../assets/modelLayout';
import type { PrototypeShellSpec } from './prototypeShellTypes';

function rotateXZ(x: number, z: number, rotY: number): [number, number] {
  const cos = Math.cos(rotY);
  const sin = Math.sin(rotY);
  return [x * cos - z * sin, x * sin + z * cos];
}

export function resolvePrototypeShellAabb(spec: PrototypeShellSpec): PresentationWorldAabb {
  const groundY = terrainHeightAt(spec.origin.x, spec.origin.z);
  const layout = resolveNormalizedLayout(spec.assetUrl, spec.targetWidth);
  const footprint = resolveRotatedFootprint(layout, spec.rotY);
  const buildingId = spec.replacesBuildingIds[0] ?? spec.shellId;
  const minY = groundY + layout.localBounds.min[1];
  const maxY = groundY + layout.localBounds.max[1];

  return {
    buildingId,
    minX: spec.origin.x - footprint.halfWidthX,
    maxX: spec.origin.x + footprint.halfWidthX,
    minY,
    maxY,
    minZ: spec.origin.z - footprint.halfWidthZ,
    maxZ: spec.origin.z + footprint.halfWidthZ,
    centerX: spec.origin.x,
    centerY: (minY + maxY) / 2,
    centerZ: spec.origin.z,
    facade: '+Z',
    facadeNormalX: 0,
    facadeNormalZ: 1,
  };
}

export function resolveShellDoorWorldPosition(
  spec: PrototypeShellSpec,
  label: string,
): { x: number; z: number } | null {
  const binding = spec.doorBindings.find((d) => d.label === label);
  if (!binding) return null;
  const [dx, dz] = rotateXZ(binding.localX, binding.localZ, spec.rotY);
  return { x: spec.origin.x + dx, z: spec.origin.z + dz };
}
