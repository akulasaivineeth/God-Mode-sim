/**
 * Authoritative river cross-section + centerline distance math — presentation only.
 *
 * WF01 R5: single geometric source consumed by terrain carve, water ribbon, and
 * bridge alignment. Does NOT modify simulation terrainHeightAt().
 */
import type { Vec2 } from '@/world/townLayout';

export interface RiverCrossSection {
  /** Half-width of exposed water surface (metres, before presentation scale). */
  waterHalfWidth: number;
  /** Half-width of thin bank lip outside water edge (metres). */
  bankHalfWidth: number;
  /** Depth terrain is carved inside the corridor envelope (metres). */
  carveDepth: number;
  /** Water surface offset below carved lip (negative = below lip). */
  waterSurfaceOffset: number;
  /** Bank mesh lift above carved channel floor at lip (metres). */
  bankLift: number;
  /** Blend distance from bank outer edge back to base terrain (metres). */
  blendFalloff: number;
  /** Modest visual widening — authored centerline unchanged. */
  presentationScale: number;
}

/** R5 canonical cross-section — tuned for Overview projected water band. */
export const R5_RIVER_CROSS_SECTION: RiverCrossSection = {
  waterHalfWidth: 10,
  bankHalfWidth: 1.75,
  carveDepth: 1.0,
  waterSurfaceOffset: -0.05,
  bankLift: 0.12,
  blendFalloff: 2.5,
  presentationScale: 1.15,
};

export interface RiverPolylineSample {
  /** Perpendicular distance to nearest centerline segment (metres). */
  distance: number;
  /** Nearest point on the polyline. */
  nearest: Vec2;
  /** Segment index for continuity checks. */
  segmentIndex: number;
  /** Parametric position along segment [0,1]. */
  segmentT: number;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Distance from world XZ to the authored river polyline. */
export function distanceToRiverPolyline(
  x: number,
  z: number,
  points: readonly Vec2[],
): RiverPolylineSample {
  let bestDist = Infinity;
  let bestPoint: Vec2 = points[0] ?? { x, z };
  let bestSeg = 0;
  let bestT = 0;

  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    const abx = b.x - a.x;
    const abz = b.z - a.z;
    const lenSq = abx * abx + abz * abz;
    const t = lenSq > 0 ? Math.max(0, Math.min(1, ((x - a.x) * abx + (z - a.z) * abz) / lenSq)) : 0;
    const px = a.x + abx * t;
    const pz = a.z + abz * t;
    const dist = Math.hypot(x - px, z - pz);
    if (dist < bestDist) {
      bestDist = dist;
      bestPoint = { x: px, z: pz };
      bestSeg = i;
      bestT = t;
    }
  }

  return { distance: bestDist, nearest: bestPoint, segmentIndex: bestSeg, segmentT: bestT };
}

export function visualWaterHalfWidth(section: RiverCrossSection): number {
  return section.waterHalfWidth * section.presentationScale;
}

export function visualBankHalfWidth(section: RiverCrossSection): number {
  return section.bankHalfWidth * section.presentationScale;
}

export function corridorEnvelopeHalfWidth(section: RiverCrossSection): number {
  return visualWaterHalfWidth(section) + visualBankHalfWidth(section) + section.blendFalloff;
}

/** Carved lip height at a world point — reference for water/bank placement. */
export function carvedLipHeightAt(
  x: number,
  z: number,
  baseTerrainY: number,
  points: readonly Vec2[],
  section: RiverCrossSection,
): number {
  const { distance } = distanceToRiverPolyline(x, z, points);
  const waterHalf = visualWaterHalfWidth(section);
  const bankHalf = visualBankHalfWidth(section);
  const envelope = corridorEnvelopeHalfWidth(section);

  if (distance >= envelope) return baseTerrainY;
  if (distance <= waterHalf + bankHalf) {
    return baseTerrainY - section.carveDepth * 0.2;
  }
  const blendT = smoothstep(waterHalf + bankHalf, envelope, distance);
  return baseTerrainY - section.carveDepth * 0.2 * (1 - blendT);
}

/** Presentation-only terrain height with river carve (rendering/tests only). */
export function presentationTerrainHeightAt(
  x: number,
  z: number,
  baseTerrainY: number,
  points: readonly Vec2[],
  section: RiverCrossSection,
): number {
  const { distance } = distanceToRiverPolyline(x, z, points);
  const waterHalf = visualWaterHalfWidth(section);
  const bankHalf = visualBankHalfWidth(section);
  const envelope = corridorEnvelopeHalfWidth(section);

  if (distance >= envelope) return baseTerrainY;

  const lipY = baseTerrainY - section.carveDepth * 0.2;
  const channelFloorY = baseTerrainY - section.carveDepth;

  if (distance <= waterHalf) {
    return channelFloorY;
  }
  if (distance <= waterHalf + bankHalf) {
    const t = (distance - waterHalf) / Math.max(bankHalf, 0.001);
    return channelFloorY + t * (lipY + section.bankLift - channelFloorY);
  }
  const blendT = smoothstep(waterHalf + bankHalf, envelope, distance);
  return channelFloorY + blendT * (baseTerrainY - channelFloorY);
}

/** Water surface Y at a world point — must sit above carved terrain in channel. */
export function waterSurfaceHeightAt(
  x: number,
  z: number,
  baseTerrainY: number,
  points: readonly Vec2[],
  section: RiverCrossSection,
): number {
  const lipY = carvedLipHeightAt(x, z, baseTerrainY, points, section);
  return lipY + section.waterSurfaceOffset;
}

/** True when terrain carve should darken vertex albedo (inside corridor). */
export function isInsideRiverCorridor(
  x: number,
  z: number,
  points: readonly Vec2[],
  section: RiverCrossSection,
): boolean {
  const { distance } = distanceToRiverPolyline(x, z, points);
  return distance < corridorEnvelopeHalfWidth(section);
}

/** Water surface must remain above carved presentation terrain in channel samples. */
export function assertWaterAboveCarvedTerrain(
  x: number,
  z: number,
  baseTerrainY: number,
  points: readonly Vec2[],
  section: RiverCrossSection,
): boolean {
  const terrainY = presentationTerrainHeightAt(x, z, baseTerrainY, points, section);
  const waterY = waterSurfaceHeightAt(x, z, baseTerrainY, points, section);
  const { distance } = distanceToRiverPolyline(x, z, points);
  if (distance > visualWaterHalfWidth(section)) return true;
  return waterY > terrainY + 0.02;
}
