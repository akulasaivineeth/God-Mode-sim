/**
 * WF02 R10 — presentation-world AABB from manifest + prefab placement.
 * Used by street portal cameras; simulation centers unchanged.
 */
import { terrainHeightAt } from '@/world/townLayout';
import { resolveVisualTransform } from '../environment/VisualTownLayout';
import {
  facadeOffset,
  resolveFacadeDirection,
  resolveNormalizedLayout,
  resolveRotatedFootprint,
  type FacadeDirection,
} from './modelLayout';
import { BUILDING_PREFABS, getBuildingPosition } from './buildings/buildingPrefabConfig';

export interface PresentationWorldAabb {
  buildingId: string;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
  centerX: number;
  centerY: number;
  centerZ: number;
  facade: FacadeDirection;
  /** Unit outward normal on XZ plane (Y = 0). */
  facadeNormalX: number;
  facadeNormalZ: number;
}

function rotateXZ(x: number, z: number, rotationY: number): [number, number] {
  const cos = Math.cos(rotationY);
  const sin = Math.sin(rotationY);
  return [x * cos - z * sin, x * sin + z * cos];
}

import { isModularPrototypeActive } from '../modular/modularMode';
import { findAssemblyForBuilding } from '../modular/modularAssemblies';
import { resolveModularAssemblyAabb } from '../modular/modularPresentationBounds';

export function resolvePresentationWorldAabb(buildingId: string): PresentationWorldAabb {
  if (isModularPrototypeActive()) {
    const assembly = findAssemblyForBuilding(buildingId);
    if (assembly) return resolveModularAssemblyAabb(assembly);
  }

  const config = BUILDING_PREFABS.find((entry) => entry.buildingId === buildingId);
  if (!config) throw new Error(`Unknown building prefab: ${buildingId}`);

  const auth = getBuildingPosition(buildingId);
  const presentation = resolveVisualTransform(buildingId);
  const rotationY = (config.rotationY ?? 0) + presentation.rotationDelta;
  const cx = auth.x + presentation.positionOffset[0];
  const cz = auth.z + presentation.positionOffset[2];
  const groundY = terrainHeightAt(cx, cz);

  const layout = resolveNormalizedLayout(config.assetUrl, config.targetWidth);
  const footprint = resolveRotatedFootprint(layout, rotationY);
  const facade = resolveFacadeDirection(rotationY);
  const [localNx, , localNz] = facadeOffset(facade, 1);
  const [facadeNormalX, facadeNormalZ] = rotateXZ(localNx, localNz, rotationY);

  const minY = groundY + layout.localBounds.min[1];
  const maxY = groundY + layout.localBounds.max[1];

  return {
    buildingId,
    minX: cx - footprint.halfWidthX,
    maxX: cx + footprint.halfWidthX,
    minY,
    maxY,
    minZ: cz - footprint.halfWidthZ,
    maxZ: cz + footprint.halfWidthZ,
    centerX: cx,
    centerY: (minY + maxY) / 2,
    centerZ: cz,
    facade,
    facadeNormalX,
    facadeNormalZ,
  };
}

export function isInsidePresentationAabb(
  x: number,
  y: number,
  z: number,
  aabb: PresentationWorldAabb,
  padding = 0.5,
): boolean {
  return (
    x >= aabb.minX - padding &&
    x <= aabb.maxX + padding &&
    z >= aabb.minZ - padding &&
    z <= aabb.maxZ + padding &&
    y >= aabb.minY - padding &&
    y <= aabb.maxY + padding
  );
}

export function isInsideAnyPresentationAabb(
  x: number,
  y: number,
  z: number,
  buildingIds: readonly string[],
  padding = 0.5,
): boolean {
  return buildingIds.some((id) =>
    isInsidePresentationAabb(x, y, z, resolvePresentationWorldAabb(id), padding),
  );
}
