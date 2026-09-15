/**
 * WF01 road junction metadata — gap carving for straight tiles + dedicated pieces.
 * Presentation only; pathing graph remains in townLayout roads array.
 */
import type { RoadSegment, Vec2 } from '@/world/townLayout';
import { KENNEY_ASSETS } from '../assets/EnvironmentAssetRegistry';

export const TILE_LENGTH = 5.8;
export const TILE_SCALE = 1.5;

export interface RoadJunction {
  id: string;
  position: Vec2;
  /** Skip instanced straight tiles within this radius (metres). */
  exclusionRadius: number;
  asset: string;
  scale: number;
  rotY: number;
  yLift: number;
}

/** Authored joins — each gets a dedicated Kenney module; straights are carved around them. */
export const ROAD_JUNCTIONS: readonly RoadJunction[] = [
  { id: 'center-crossing', position: { x: 0, z: 0 }, exclusionRadius: 6.2, asset: KENNEY_ASSETS.roadCrossing, scale: TILE_SCALE, rotY: 0, yLift: 0.04 },
  { id: 'commercial-tee', position: { x: 0, z: 18 }, exclusionRadius: 4.8, asset: KENNEY_ASSETS.roadCurvePavement, scale: TILE_SCALE, rotY: Math.PI / 2, yLift: 0.04 },
  { id: 'industrial-tee', position: { x: 0, z: 38 }, exclusionRadius: 4.8, asset: KENNEY_ASSETS.roadCurvePavement, scale: TILE_SCALE, rotY: 0, yLift: 0.04 },
  { id: 'riverside-tee', position: { x: 24, z: 38 }, exclusionRadius: 4.5, asset: KENNEY_ASSETS.roadBend, scale: TILE_SCALE, rotY: -Math.PI / 2, yLift: 0.04 },
  { id: 'farm-tee', position: { x: 0, z: 58 }, exclusionRadius: 4.8, asset: KENNEY_ASSETS.roadCurvePavement, scale: TILE_SCALE, rotY: -Math.PI / 2, yLift: 0.04 },
  { id: 'residential-tee', position: { x: 8, z: -18 }, exclusionRadius: 4.5, asset: KENNEY_ASSETS.roadBend, scale: TILE_SCALE, rotY: Math.PI * 0.75, yLift: 0.04 },
  { id: 'residential-corner', position: { x: 8, z: -42 }, exclusionRadius: 4.5, asset: KENNEY_ASSETS.roadBend, scale: TILE_SCALE, rotY: Math.PI * 0.25, yLift: 0.04 },
  { id: 'residential-loop-ne', position: { x: 78, z: -42 }, exclusionRadius: 4.5, asset: KENNEY_ASSETS.roadCurvePavement, scale: TILE_SCALE, rotY: -Math.PI / 2, yLift: 0.04 },
  { id: 'residential-loop-sw', position: { x: 45, z: -58 }, exclusionRadius: 4.5, asset: KENNEY_ASSETS.roadBend, scale: TILE_SCALE, rotY: Math.PI, yLift: 0.04 },
  { id: 'residential-loop-w', position: { x: 8, z: -58 }, exclusionRadius: 4.2, asset: KENNEY_ASSETS.roadBend, scale: TILE_SCALE, rotY: Math.PI / 2, yLift: 0.04 },
];

export interface RoadTilePlacement {
  x: number;
  z: number;
  rotY: number;
  scale?: number;
}

/** Bridge span on main east-west artery — straights omitted, bridge module placed here. */
export interface BridgePlacement {
  x: number;
  z: number;
  rotY: number;
  exclusion: { minX: number; maxX: number; minZ: number; maxZ: number };
}

export function bridgePlacementOnMainRoad(
  riverPoints: readonly Vec2[],
  targetZ = 0,
): BridgePlacement {
  for (let i = 0; i < riverPoints.length - 1; i += 1) {
    const a = riverPoints[i];
    const b = riverPoints[i + 1];
    const spans = (a.z <= targetZ && b.z >= targetZ) || (a.z >= targetZ && b.z <= targetZ);
    if (!spans || a.z === b.z) continue;
    const t = (targetZ - a.z) / (b.z - a.z);
    const x = a.x + t * (b.x - a.x);
    const flowAngle = Math.atan2(b.x - a.x, b.z - a.z);
    return {
      x,
      z: targetZ,
      rotY: flowAngle + Math.PI / 2,
      exclusion: { minX: x - 7, maxX: x + 7, minZ: -4.5, maxZ: 4.5 },
    };
  }
  return {
    x: 88,
    z: 0,
    rotY: Math.PI / 2,
    exclusion: { minX: 81, maxX: 95, minZ: -4.5, maxZ: 4.5 },
  };
}

function isExcluded(x: number, z: number, bridge: BridgePlacement): boolean {
  if (x >= bridge.exclusion.minX && x <= bridge.exclusion.maxX && z >= bridge.exclusion.minZ && z <= bridge.exclusion.maxZ) {
    return true;
  }
  for (const junction of ROAD_JUNCTIONS) {
    const dist = Math.hypot(x - junction.position.x, z - junction.position.z);
    if (dist < junction.exclusionRadius) return true;
  }
  return false;
}

export function buildStraightTiles(
  roads: readonly RoadSegment[],
  bridge: BridgePlacement,
): RoadTilePlacement[] {
  const tiles: RoadTilePlacement[] = [];
  for (const road of roads) {
    const dx = road.to.x - road.from.x;
    const dz = road.to.z - road.from.z;
    const length = Math.hypot(dx, dz);
    if (length < 0.5) continue;
    const angle = Math.atan2(dz, dx);
    const count = Math.max(1, Math.floor(length / TILE_LENGTH));
    for (let i = 0; i < count; i += 1) {
      const t = (i + 0.5) / count;
      const x = road.from.x + dx * t;
      const z = road.from.z + dz * t;
      if (isExcluded(x, z, bridge)) continue;
      tiles.push({
        x,
        z,
        rotY: -angle + Math.PI / 2,
        scale: TILE_SCALE,
      });
    }
  }
  return tiles;
}
