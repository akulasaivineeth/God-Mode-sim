/**
 * Continuous river ribbon mesh from authored polyline — presentation only.
 *
 * Presentation width may exceed authored simulation width (1.15–1.35×) so the
 * water reads clearly in Overview/Angled without moving canonical river nodes.
 */
import { BufferAttribute, BufferGeometry, Color } from 'three';
import { terrainHeightAt } from '@/world/townLayout';

/** Modest visual widening — authored centerline unchanged (R8). */
export const RIVER_PRESENTATION_SCALE = 1.28;

export interface RiverRibbonColors {
  waterColor: string;
  bankColor: string;
}

export function buildRiverRibbonGeometry(
  points: readonly { x: number; z: number }[],
  waterWidth: number,
  bankWidth: number,
  colors: RiverRibbonColors,
): { water: BufferGeometry; bank: BufferGeometry } {
  const bankVerts: number[] = [];
  const waterVerts: number[] = [];
  const bankColors: number[] = [];
  const waterColors: number[] = [];

  const bankColor = new Color(colors.bankColor);
  const bankDark = bankColor.clone().multiplyScalar(0.82);
  const waterColor = new Color(colors.waterColor);

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
    const bc = bankColor.clone().lerp(bankDark, t * 0.35);

    bankVerts.push(
      curr.x + nx * visualBankHalf, groundY + 0.05, curr.z + nz * visualBankHalf,
      curr.x - nx * visualBankHalf, groundY + 0.05, curr.z - nz * visualBankHalf,
    );
    waterVerts.push(
      curr.x + nx * visualWaterHalf, groundY - 0.08, curr.z + nz * visualWaterHalf,
      curr.x - nx * visualWaterHalf, groundY - 0.08, curr.z - nz * visualWaterHalf,
    );
    bankColors.push(bc.r, bc.g, bc.b, bc.r, bc.g, bc.b);
    waterColors.push(waterColor.r, waterColor.g, waterColor.b, waterColor.r, waterColor.g, waterColor.b);
  }

  const indices: number[] = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = i * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;
    indices.push(a, c, b, b, c, d);
  }

  const bankGeo = new BufferGeometry();
  bankGeo.setAttribute('position', new BufferAttribute(new Float32Array(bankVerts), 3));
  bankGeo.setAttribute('color', new BufferAttribute(new Float32Array(bankColors), 3));
  bankGeo.setIndex(indices);
  bankGeo.computeVertexNormals();

  const waterGeo = new BufferGeometry();
  waterGeo.setAttribute('position', new BufferAttribute(new Float32Array(waterVerts), 3));
  waterGeo.setAttribute('color', new BufferAttribute(new Float32Array(waterColors), 3));
  waterGeo.setIndex(indices);
  waterGeo.computeVertexNormals();

  return { water: waterGeo, bank: bankGeo };
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
