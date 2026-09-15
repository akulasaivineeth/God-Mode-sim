/**
 * WF02 R4.1 presentation overlay exclusion — roads, paths, river, M02 corridor.
 * Pure functions for unit tests and DistrictGroundTint clipping.
 */
import { CANONICAL_TOWN, type Vec2 } from '@/world/townLayout';
import { isInsideRiverCorridor, R5_RIVER_CROSS_SECTION } from './riverCrossSection';

const { river } = CANONICAL_TOWN;
const RIVER_SECTION = R5_RIVER_CROSS_SECTION;

function distToSegment(px: number, pz: number, ax: number, az: number, bx: number, bz: number): number {
  const dx = bx - ax;
  const dz = bz - az;
  const lenSq = dx * dx + dz * dz;
  if (lenSq < 1e-6) return Math.hypot(px - ax, pz - az);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / lenSq));
  const nx = ax + t * dx;
  const nz = az + t * dz;
  return Math.hypot(px - nx, pz - nz);
}

function nearRoad(x: number, z: number, margin = 0.35): boolean {
  for (const road of CANONICAL_TOWN.roads) {
    const half = road.width / 2 + margin;
    const d = distToSegment(x, z, road.from.x, road.from.z, road.to.x, road.to.z);
    if (d <= half) return true;
  }
  return false;
}

function nearPath(x: number, z: number, margin = 0.25): boolean {
  for (const path of CANONICAL_TOWN.paths) {
    const half = path.width / 2 + margin;
    const d = distToSegment(x, z, path.from.x, path.from.z, path.to.x, path.to.z);
    if (d <= half) return true;
  }
  return false;
}

function nearRiver(x: number, z: number): boolean {
  return isInsideRiverCorridor(x, z, river.points, RIVER_SECTION);
}

/** Main cross exclusion for civic square fountain disc. */
function inSquareFountain(x: number, z: number, radius = 3.8): boolean {
  const sq = CANONICAL_TOWN.square.center;
  return Math.hypot(x - sq.x, z - sq.z) < radius;
}

export function isOverlayExcluded(x: number, z: number): boolean {
  if (nearRiver(x, z)) return true;
  if (nearRoad(x, z)) return true;
  if (nearPath(x, z)) return true;
  if (inSquareFountain(x, z)) return true;
  return false;
}

export interface OverlayCell {
  x: number;
  z: number;
  width: number;
  depth: number;
}

/** Grid cells for ground tint within bounds, skipping exclusion corridors. */
export function buildOverlayCells(
  minX: number,
  maxX: number,
  minZ: number,
  maxZ: number,
  cellSize = 3.5,
): OverlayCell[] {
  const cells: OverlayCell[] = [];
  for (let x = minX; x < maxX; x += cellSize) {
    for (let z = minZ; z < maxZ; z += cellSize) {
      const cx = x + cellSize / 2;
      const cz = z + cellSize / 2;
      if (isOverlayExcluded(cx, cz)) continue;
      cells.push({ x: cx, z: cz, width: cellSize * 0.96, depth: cellSize * 0.96 });
    }
  }
  return cells;
}

export interface KenneyTreePlacement {
  url: string;
  x: number;
  z: number;
  rotY?: number;
  scale?: number;
}

export function buildOrchardGrid(
  center: Vec2,
  cols: number,
  rows: number,
  spacing: number,
  url: string,
): KenneyTreePlacement[] {
  const out: KenneyTreePlacement[] = [];
  const startX = center.x - ((cols - 1) * spacing) / 2;
  const startZ = center.z - ((rows - 1) * spacing) / 2;
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const x = startX + c * spacing;
      const z = startZ + r * spacing;
      if (isOverlayExcluded(x, z)) continue;
      out.push({ url, x, z, scale: 1.05 + (r % 2) * 0.08, rotY: (c + r) * 0.4 });
    }
  }
  return out;
}
