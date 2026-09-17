/**
 * Active town layout facade — WF02 R9 World Lab resolver.
 * Legacy 240 m shell preserved in townLayoutLegacy.ts for parity/rollback.
 */
export type {
  BuildingType,
  Vec2,
  Building,
  RoadSegment,
  AreaRect,
  RiverPoint,
  TreeInstance,
  GraveInstance,
  Forest,
  TerrainConfig,
  TownLayout,
  RoofStyle,
  BuildingArchetype,
} from './townLayoutLegacy';

export { BUILDING_ARCHETYPES } from './townLayoutLegacy';
export { LEGACY_CANONICAL_TOWN } from './townLayoutLegacy';

import { resolveActiveLayout } from './resolver/worldResolver';
import { WORLD_LAB_MODE } from './worldLabMode';
import { TERRAIN as LEGACY_TERRAIN } from './townLayoutLegacy';

/** Active presentation/sim geography — World Lab or legacy based on flag. */
export const CANONICAL_TOWN = resolveActiveLayout();

export const TERRAIN = CANONICAL_TOWN.terrain;

export function terrainHeightAt(x: number, z: number): number {
  const terrain = CANONICAL_TOWN.terrain;
  const north = Math.max(0, -z - terrain.flatRadius);
  const west = Math.max(0, -x - terrain.flatRadius);
  const south = Math.max(0, z - terrain.flatRadius);
  const east = Math.max(0, x - terrain.flatRadius);
  let reach = Math.min(1, Math.max(north, west, south, east) / terrain.blend);
  if (reach <= 0) return 0;
  if (WORLD_LAB_MODE && x > 28) {
    reach *= Math.max(0, 1 - (x - 28) / 10);
  } else if (!WORLD_LAB_MODE && x > 55) {
    reach *= Math.max(0, 1 - (x - 55) / 28);
  }
  if (reach <= 0) return 0;
  const ridge = reach * reach * (3 - 2 * reach);
  const undulation = 0.5 * (Math.sin(x * 0.09) * Math.cos(z * 0.08) + Math.sin((x + z) * 0.04));
  return ridge * terrain.maxHeight * (0.82 + 0.18 * undulation);
}

export function collectAllTrees(): import('./townLayoutLegacy').TreeInstance[] {
  return [...CANONICAL_TOWN.trees, ...CANONICAL_TOWN.forest.trees];
}

/** Legacy terrain constants for regression tests. */
export { LEGACY_TERRAIN };
