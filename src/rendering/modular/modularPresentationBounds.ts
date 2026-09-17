/**
 * WF02 R11 — presentation AABB for modular assemblies (street portal + occlusion).
 */
import { terrainHeightAt } from '@/world/townLayout';
import type { PresentationWorldAabb } from '../assets/presentationBounds';
import type { ModularAssemblySpec } from './modularAssemblyTypes';
import { resolveModularInstances } from './modularLayout';
import { getModularModule, getGridDepth, getGridWidth, getStoryHeight } from './modularModuleRegistry';

function rotateXZ(x: number, z: number, rotY: number): [number, number] {
  const cos = Math.cos(rotY);
  const sin = Math.sin(rotY);
  return [x * cos - z * sin, x * sin + z * cos];
}

export function resolveModularAssemblyAabb(spec: ModularAssemblySpec): PresentationWorldAabb {
  const instances = resolveModularInstances(spec);
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;

  for (const inst of instances) {
    const mod = getModularModule(inst.moduleId);
    const halfW = mod.bounds.size[0] / 2;
    const halfD = mod.bounds.size[2] / 2;
    const height = mod.bounds.size[1];
    minX = Math.min(minX, inst.x - halfW);
    maxX = Math.max(maxX, inst.x + halfW);
    minY = Math.min(minY, inst.y);
    maxY = Math.max(maxY, inst.y + height);
    minZ = Math.min(minZ, inst.z - halfD);
    maxZ = Math.max(maxZ, inst.z + halfD);
  }

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const centerZ = (minZ + maxZ) / 2;

  return {
    buildingId: spec.replacesBuildingIds[0] ?? spec.assemblyId,
    minX,
    maxX,
    minY,
    maxY,
    minZ,
    maxZ,
    centerX,
    centerY,
    centerZ,
    facade: '+Z',
    facadeNormalX: 0,
    facadeNormalZ: 1,
  };
}

/** Footprint envelope from grid extents (diagnostic / tests). */
export function resolveModularGridFootprint(spec: ModularAssemblySpec): {
  widthM: number;
  depthM: number;
  heightM: number;
} {
  let maxGx = 0;
  let maxGy = 0;
  let maxGz = 0;
  for (const p of spec.placements) {
    maxGx = Math.max(maxGx, p.gx);
    maxGy = Math.max(maxGy, p.gy);
    maxGz = Math.max(maxGz, p.gz);
  }
  return {
    widthM: (maxGx + 1) * getGridWidth(),
    depthM: (maxGz + 1) * getGridDepth(),
    heightM: (maxGy + 1) * getStoryHeight(),
  };
}

export function resolveModularDoorWorldPosition(
  spec: ModularAssemblySpec,
  label: string,
): { x: number; z: number } | null {
  const binding = spec.doorBindings?.find((d) => d.label === label);
  if (!binding) return null;
  const groundY = spec.origin.y || terrainHeightAt(spec.origin.x, spec.origin.z);
  void groundY;
  const [dx, dz] = rotateXZ(binding.localX, binding.localZ, spec.rotY);
  return { x: spec.origin.x + dx, z: spec.origin.z + dz };
}
