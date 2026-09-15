/**
 * Groups vegetation placements by asset URL and instances real GLTF geometry.
 */
import { useMemo } from 'react';
import type { VegetationPlacement } from './EnvironmentAssetRegistry';
import { resolveVegetationUrl } from './EnvironmentAssetRegistry';
import {
  InstancedGltfPlacements,
  type GltfInstancePlacement,
} from './InstancedGltfPlacements';

export function groupPlacementsByUrl(
  placements: readonly VegetationPlacement[],
): Map<string, VegetationPlacement[]> {
  const groups = new Map<string, VegetationPlacement[]>();
  for (const p of placements) {
    const url = resolveVegetationUrl(p);
    const list = groups.get(url) ?? [];
    list.push(p);
    groups.set(url, list);
  }
  return groups;
}

function toGltfPlacements(placements: readonly VegetationPlacement[]): GltfInstancePlacement[] {
  return placements.map((p) => ({
    url: resolveVegetationUrl(p),
    x: p.position.x,
    z: p.position.z,
    rotY: p.rotY,
    scale: p.scale,
  }));
}

export function InstancedVegetation({ placements }: { placements: readonly VegetationPlacement[] }) {
  const gltfPlacements = useMemo(() => toGltfPlacements(placements), [placements]);
  return <InstancedGltfPlacements placements={gltfPlacements} />;
}
