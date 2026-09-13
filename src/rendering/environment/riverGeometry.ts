/**
 * Continuous river ribbon mesh from authored polyline — presentation only.
 */
import { BufferAttribute, BufferGeometry, Color } from 'three';
import { terrainHeightAt } from '@/world/townLayout';

export function buildRiverRibbonGeometry(
  points: readonly { x: number; z: number }[],
  waterWidth: number,
  bankWidth: number,
): { water: BufferGeometry; bank: BufferGeometry } {
  const bankVerts: number[] = [];
  const waterVerts: number[] = [];
  const bankColors: number[] = [];
  const waterColors: number[] = [];

  const bankColor = new Color('#7c8a5b');
  const bankDark = new Color('#6a7850');
  const waterColor = new Color('#4a8ab0');

  for (let i = 0; i < points.length; i += 1) {
    const curr = points[i];
    const prev = points[i - 1] ?? points[i];
    const next = points[i + 1] ?? points[i];
    const dx = next.x - prev.x;
    const dz = next.z - prev.z;
    const len = Math.hypot(dx, dz) || 1;
    const nx = -dz / len;
    const nz = dx / len;
    const y = terrainHeightAt(curr.x, curr.z);
    const t = i / Math.max(1, points.length - 1);
    const bc = bankColor.clone().lerp(bankDark, t * 0.3);

    const bankHalf = bankWidth / 2;
    const waterHalf = waterWidth / 2;

    bankVerts.push(
      curr.x + nx * bankHalf, y + 0.02, curr.z + nz * bankHalf,
      curr.x - nx * bankHalf, y + 0.02, curr.z - nz * bankHalf,
    );
    waterVerts.push(
      curr.x + nx * waterHalf, y + 0.01, curr.z + nz * waterHalf,
      curr.x - nx * waterHalf, y + 0.01, curr.z - nz * waterHalf,
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
