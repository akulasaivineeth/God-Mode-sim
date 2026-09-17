import { terrainHeightAt } from '@/world/townLayout';
import type { ModularAssemblySpec, ResolvedModularInstance } from './modularAssemblyTypes';
import { getGridDepth, getGridWidth, getModularModule, getStoryHeight } from './modularModuleRegistry';

function rotateXZ(x: number, z: number, rotY: number): [number, number] {
  const cos = Math.cos(rotY);
  const sin = Math.sin(rotY);
  return [x * cos - z * sin, x * sin + z * cos];
}

/** Expand grid placements to world-space instances (deterministic). */
export function resolveModularInstances(spec: ModularAssemblySpec): ResolvedModularInstance[] {
  const gridW = getGridWidth();
  const gridD = getGridDepth();
  const storyH = getStoryHeight();
  const groundY = spec.origin.y || terrainHeightAt(spec.origin.x, spec.origin.z);

  return spec.placements.map((p) => {
    const mod = getModularModule(p.moduleId);
    const localX = p.gx * gridW + mod.gridWidth / 2;
    const localY = p.gy * storyH;
    const localZ = p.gz * gridD + mod.gridDepth / 2;
    const [dx, dz] = rotateXZ(localX, localZ, spec.rotY);
    const rotY = spec.rotY + (p.rotY ?? 0);
    return {
      moduleId: p.moduleId,
      url: mod.assetUrl,
      x: spec.origin.x + dx,
      y: groundY + localY,
      z: spec.origin.z + dz,
      rotY,
    };
  });
}

export function resolveAllModularInstances(
  assemblies: readonly ModularAssemblySpec[],
): ResolvedModularInstance[] {
  return assemblies.flatMap(resolveModularInstances);
}
