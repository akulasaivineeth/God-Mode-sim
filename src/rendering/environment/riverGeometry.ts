/**
 * Continuous river ribbon mesh from authored polyline — presentation only.
 *
 * WF01 R5: consumes riverCrossSection as the single geometric authority.
 */
import { BufferAttribute, BufferGeometry, Color } from 'three';
import { terrainHeightAt, type Vec2 } from '@/world/townLayout';
import {
  carvedLipHeightAt,
  distanceToRiverPolyline,
  type RiverCrossSection,
  R5_RIVER_CROSS_SECTION,
  visualBankHalfWidth,
  visualWaterHalfWidth,
  waterSurfaceHeightAt,
} from './riverCrossSection';

export interface RiverRibbonColors {
  waterColor: string;
  bankColor: string;
}

export interface RiverRibbonGeometry {
  water: BufferGeometry;
  bank: BufferGeometry;
}

export function buildRiverRibbonGeometry(
  points: readonly { x: number; z: number }[],
  section: RiverCrossSection,
  colors: RiverRibbonColors,
): RiverRibbonGeometry {
  const bankVerts: number[] = [];
  const waterVerts: number[] = [];
  const bankColors: number[] = [];
  const waterColors: number[] = [];

  const bankColor = new Color(colors.bankColor);
  const bankDark = bankColor.clone().multiplyScalar(0.72);
  const waterColor = new Color(colors.waterColor);

  const visualWaterHalf = visualWaterHalfWidth(section);
  const visualBankHalf = visualBankHalfWidth(section);

  for (let i = 0; i < points.length; i += 1) {
    const curr = points[i];
    const prev = points[i - 1] ?? points[i];
    const next = points[i + 1] ?? points[i];
    const dx = next.x - prev.x;
    const dz = next.z - prev.z;
    const len = Math.hypot(dx, dz) || 1;
    const nx = -dz / len;
    const nz = dx / len;
    const baseY = terrainHeightAt(curr.x, curr.z);
    const t = i / Math.max(1, points.length - 1);
    const bc = bankColor.clone().lerp(bankDark, t * 0.2);

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

    const centerWaterY = waterSurfaceHeightAt(curr.x, curr.z, baseY, points, section);
    const bankY = carvedLipHeightAt(curr.x, curr.z, baseY, points, section) + section.bankLift;

    const waterYL = waterSurfaceHeightAt(innerL.x, innerL.z, terrainHeightAt(innerL.x, innerL.z), points, section);
    const waterYR = waterSurfaceHeightAt(innerR.x, innerR.z, terrainHeightAt(innerR.x, innerR.z), points, section);

    waterVerts.push(innerL.x, waterYL, innerL.z, innerR.x, waterYR, innerR.z);
    bankVerts.push(outerL.x, bankY, outerL.z, innerL.x, bankY, innerL.z);
    bankVerts.push(innerR.x, bankY, innerR.z, outerR.x, bankY, outerR.z);

    waterColors.push(waterColor.r, waterColor.g, waterColor.b, waterColor.r, waterColor.g, waterColor.b);
    for (let j = 0; j < 4; j += 1) {
      bankColors.push(bc.r, bc.g, bc.b);
    }
    void centerWaterY;
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

  return { water: waterGeo, bank: bankGeo };
}

/** Default section for ribbon builds — re-export for tests. */
export { R5_RIVER_CROSS_SECTION };

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

/** Projected half-width of water corridor at bridge under canonical camera (screen fraction). */
export function projectRiverCorridorScreenHalfWidth(
  camera: {
    position: { x: number; y: number; z: number };
    lookAt: (x: number, y: number, z: number) => void;
    updateMatrixWorld: () => void;
    projectionMatrix: { elements: number[] };
    matrixWorldInverse: { elements: number[] };
  },
  viewportWidth: number,
  points: readonly Vec2[],
  section: RiverCrossSection,
  sampleX: number,
  sampleZ: number,
): number {
  const baseY = terrainHeightAt(sampleX, sampleZ);
  const { nearest } = distanceToRiverPolyline(sampleX, sampleZ, points);
  const next = points[Math.min(points.length - 1, 1)];
  const prev = points[0];
  const dx = (next?.x ?? prev.x) - prev.x;
  const dz = (next?.z ?? prev.z) - prev.z;
  const len = Math.hypot(dx, dz) || 1;
  const nx = -dz / len;
  const nz = dx / len;
  const half = visualWaterHalfWidth(section);
  const left = {
    x: nearest.x + nx * half,
    z: nearest.z + nz * half,
    y: waterSurfaceHeightAt(nearest.x + nx * half, nearest.z + nz * half, baseY, points, section),
  };
  const right = {
    x: nearest.x - nx * half,
    z: nearest.z - nz * half,
    y: waterSurfaceHeightAt(nearest.x - nx * half, nearest.z - nz * half, baseY, points, section),
  };

  const project = (wx: number, wy: number, wz: number) => {
    const e = camera.matrixWorldInverse.elements;
    const p = camera.projectionMatrix.elements;
    const cx = e[0] * wx + e[4] * wy + e[8] * wz + e[12];
    const cy = e[1] * wx + e[5] * wy + e[9] * wz + e[13];
    const cz = e[2] * wx + e[6] * wy + e[10] * wz + e[14];
    const cw = e[3] * wx + e[7] * wy + e[11] * wz + e[15];
    const clipX = p[0] * cx + p[4] * cy + p[8] * cz + p[12] * cw;
    const clipW = p[3] * cx + p[7] * cy + p[11] * cz + p[15] * cw;
    const ndcX = clipX / clipW;
    return ((ndcX + 1) / 2) * viewportWidth;
  };

  camera.updateMatrixWorld();
  const leftSx = project(left.x, left.y, left.z);
  const rightSx = project(right.x, right.y, right.z);
  return Math.abs(leftSx - rightSx) / 2;
}
