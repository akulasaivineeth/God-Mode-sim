/**
 * Continuous river ribbon mesh from authored polyline — presentation only.
 *
 * R4.1: depressed blue channel with narrow vegetated berms outside the water
 * edge. Authored centerline and bridge anchor unchanged.
 */
import { BufferAttribute, BufferGeometry, Color } from 'three';
import { terrainHeightAt } from '@/world/townLayout';

/** Modest visual widening — authored centerline unchanged. */
export const RIVER_PRESENTATION_SCALE = 1.32;

/** Water surface sits below ground so the channel reads as carved terrain. */
export const RIVER_WATER_SURFACE_DROP = 0.1;
/** Channel floor for depth cue — presentation only. */
export const RIVER_WATER_FLOOR_DROP = 0.45;
/** Narrow berm slightly above surrounding grass. */
export const RIVER_BANK_LIFT = 0.04;

export interface RiverRibbonColors {
  waterColor: string;
  bankColor: string;
}

export interface RiverRibbonGeometry {
  water: BufferGeometry;
  waterFloor: BufferGeometry;
  bank: BufferGeometry;
}

export function buildRiverRibbonGeometry(
  points: readonly { x: number; z: number }[],
  waterWidth: number,
  bankWidth: number,
  colors: RiverRibbonColors,
): RiverRibbonGeometry {
  const bankVerts: number[] = [];
  const waterVerts: number[] = [];
  const floorVerts: number[] = [];
  const bankColors: number[] = [];
  const waterColors: number[] = [];
  const floorColors: number[] = [];

  const bankColor = new Color(colors.bankColor);
  const bankDark = bankColor.clone().multiplyScalar(0.78);
  const waterColor = new Color(colors.waterColor);
  const waterDeep = waterColor.clone().multiplyScalar(0.55);

  const visualWaterHalf = (waterWidth * RIVER_PRESENTATION_SCALE) / 2;
  const visualBankHalf = (bankWidth * RIVER_PRESENTATION_SCALE) / 2;

  for (let i = 0; i < points.length; i += 1) {
    const curr = points[i];
    const prev = points[i - 1] ?? points[i];
    const next = points[i + 1] ?? points[i];
    const dx = next.x - prev.x;
    const dz = next.z - prev.z;
    const len = Math.hypot(dx, dz) || 1;
    const nx = -dz / len;
    const nz = dx / len;
    const groundY = terrainHeightAt(curr.x, curr.z);
    const t = i / Math.max(1, points.length - 1);
    const bc = bankColor.clone().lerp(bankDark, t * 0.25);

    const innerL = { x: curr.x + nx * visualWaterHalf, z: curr.z + nz * visualWaterHalf };
    const innerR = { x: curr.x - nx * visualWaterHalf, z: curr.z - nz * visualWaterHalf };
    const outerL = {
      x: curr.x + nx * (visualWaterHalf + visualBankHalf),
      z: curr.z + nz * (visualWaterHalf + visualBankHalf),
    };
    const outerR = {
      x: curr.x - nx * (visualWaterHalf + visualBankHalf),
      z: curr.z - nz * (visualWaterHalf + visualBankHalf),
    };

    const waterY = groundY - RIVER_WATER_SURFACE_DROP;
    const floorY = groundY - RIVER_WATER_FLOOR_DROP;
    const bankY = groundY + RIVER_BANK_LIFT;

    waterVerts.push(innerL.x, waterY, innerL.z, innerR.x, waterY, innerR.z);
    floorVerts.push(innerL.x, floorY, innerL.z, innerR.x, floorY, innerR.z);
    bankVerts.push(outerL.x, bankY, outerL.z, innerL.x, bankY, innerL.z);
    bankVerts.push(innerR.x, bankY, innerR.z, outerR.x, bankY, outerR.z);

    waterColors.push(waterColor.r, waterColor.g, waterColor.b, waterColor.r, waterColor.g, waterColor.b);
    floorColors.push(waterDeep.r, waterDeep.g, waterDeep.b, waterDeep.r, waterDeep.g, waterDeep.b);
    for (let j = 0; j < 4; j += 1) {
      bankColors.push(bc.r, bc.g, bc.b);
    }
  }

  const indices: number[] = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = i * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;
    indices.push(a, c, b, b, c, d);
  }

  const bankIndices: number[] = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = i * 4;
    const b = a + 4;
    bankIndices.push(a, b, a + 1, a + 1, b, b + 1);
    bankIndices.push(a + 2, b + 2, a + 3, a + 3, b + 2, b + 3);
  }

  const bankGeo = new BufferGeometry();
  bankGeo.setAttribute('position', new BufferAttribute(new Float32Array(bankVerts), 3));
  bankGeo.setAttribute('color', new BufferAttribute(new Float32Array(bankColors), 3));
  bankGeo.setIndex(bankIndices);
  bankGeo.computeVertexNormals();

  const waterGeo = new BufferGeometry();
  waterGeo.setAttribute('position', new BufferAttribute(new Float32Array(waterVerts), 3));
  waterGeo.setAttribute('color', new BufferAttribute(new Float32Array(waterColors), 3));
  waterGeo.setIndex(indices);
  waterGeo.computeVertexNormals();

  const floorGeo = new BufferGeometry();
  floorGeo.setAttribute('position', new BufferAttribute(new Float32Array(floorVerts), 3));
  floorGeo.setAttribute('color', new BufferAttribute(new Float32Array(floorColors), 3));
  floorGeo.setIndex(indices);
  floorGeo.computeVertexNormals();

  return { water: waterGeo, waterFloor: floorGeo, bank: bankGeo };
}

/** Bridge placement on the authored polyline at a target Z (presentation only). */
export function bridgePlacementOnRiver(
  points: readonly { x: number; z: number }[],
  targetZ = 0,
): { x: number; z: number; rotY: number } {
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    const spans =
      (a.z <= targetZ && b.z >= targetZ) || (a.z >= targetZ && b.z <= targetZ);
    if (!spans || a.z === b.z) continue;
    const t = (targetZ - a.z) / (b.z - a.z);
    const x = a.x + t * (b.x - a.x);
    const flowAngle = Math.atan2(b.x - a.x, b.z - a.z);
    return { x, z: targetZ, rotY: flowAngle + Math.PI / 2 };
  }
  const mid = points[Math.floor(points.length / 2)];
  return { x: mid.x, z: mid.z, rotY: 0 };
}
