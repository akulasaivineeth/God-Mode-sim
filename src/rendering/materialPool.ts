/**
 * Shared material pool — Foundation Hardening.
 *
 * Reuses MeshStandardMaterial instances keyed by color (+ optional roughness/metalness)
 * so repeated town/building geometry does not allocate one material per mesh draw batch.
 */
import { MeshStandardMaterial } from 'three';

export interface PooledMaterialOpts {
  roughness?: number;
  metalness?: number;
  transparent?: boolean;
  opacity?: number;
}

const pool = new Map<string, MeshStandardMaterial>();

function poolKey(color: string, opts: PooledMaterialOpts): string {
  return [
    color,
    opts.roughness ?? 0.85,
    opts.metalness ?? 0,
    opts.transparent ? 1 : 0,
    opts.opacity ?? 1,
  ].join('|');
}

export function getPooledMaterial(color: string, opts: PooledMaterialOpts = {}): MeshStandardMaterial {
  const key = poolKey(color, opts);
  let mat = pool.get(key);
  if (!mat) {
    mat = new MeshStandardMaterial({
      color,
      roughness: opts.roughness ?? 0.85,
      metalness: opts.metalness ?? 0,
      ...(opts.transparent != null ? { transparent: opts.transparent } : {}),
      ...(opts.opacity != null ? { opacity: opts.opacity } : {}),
    });
    pool.set(key, mat);
  }
  return mat;
}

/** Test-only: number of unique pooled materials currently allocated. */
export function pooledMaterialCount(): number {
  return pool.size;
}

/** Test-only: reset pool between tests. */
export function clearMaterialPoolForTests(): void {
  for (const mat of pool.values()) {
    mat.dispose();
  }
  pool.clear();
}
