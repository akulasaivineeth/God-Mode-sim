/**
 * WF02 R11 — instanced modular assembly renderer.
 */
import { useMemo } from 'react';
import { Matrix4, Quaternion, Vector3 } from 'three';
import {
  InstancedGltfPlacements,
  type GltfInstancePlacement,
} from '../assets/InstancedGltfPlacements';
import { isModularPrototypeActive } from './modularMode';
import { R12_MODULAR_ASSEMBLIES } from './modularAssemblies';
import { resolveAllModularInstances } from './modularLayout';

function ModularInstances() {
  const instances = useMemo(
    () => resolveAllModularInstances(R12_MODULAR_ASSEMBLIES),
    [],
  );

  const placements: GltfInstancePlacement[] = useMemo(
    () =>
      instances.map((inst) => ({
        url: inst.url,
        x: inst.x,
        z: inst.z,
        rotY: inst.rotY,
        yOffset: inst.y - 0,
      })),
    [instances],
  );

  const resolveMatrix = (placement: GltfInstancePlacement, matrix: Matrix4) => {
    const y = placement.yOffset ?? 0;
    matrix.compose(
      new Vector3(placement.x, y, placement.z),
      new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), placement.rotY ?? 0),
      new Vector3(1, 1, 1),
    );
  };

  return <InstancedGltfPlacements placements={placements} resolveMatrix={resolveMatrix} />;
}

export function ModularAssemblyLayer() {
  if (!isModularPrototypeActive()) return null;

  return (
    <group name="world-lab-modular-r12">
      <ModularInstances />
    </group>
  );
}
