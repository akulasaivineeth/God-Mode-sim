/**
 * Seeded pseudo-random number generator — ARCH-003.
 *
 * Plain English: Simulation "luck" must be reproducible from a seed. This module
 * is the only approved source of randomness for simulation outcomes.
 *
 * Algorithm ID `mulberry32-v1` is frozen in save files. Changing the algorithm
 * or state shape without a schema migration would invalidate existing worlds.
 *
 * State is one unsigned 32-bit integer; snapshot/restore must preserve it exactly.
 */
import type { Weighted } from './types';

/**
 * ARCH-003 — Canonical deterministic PRNG for GOD MODE.
 * Algorithm: mulberry32-v1 (fixed; changing this breaks seeded worlds).
 */
export const PRNG_ALGORITHM_ID = 'mulberry32-v1';

export interface PrngState {
  algorithm: typeof PRNG_ALGORITHM_ID;
  state: number;
}

export interface RandomService {
  nextFloat(): number;
  int(min: number, max: number): number;
  weightedChoice<T>(items: Weighted<T>[]): T;
  normal(mean: number, sd: number): number;
  snapshot(): PrngState;
  restore(state: PrngState): void;
}

function hashSeedToUint32(seed: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function mulberry32Step(state: number): [number, number] {
  let next = (state + 0x6d2b79f5) >>> 0;
  next = Math.imul(next ^ (next >>> 15), next | 1);
  next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
  const value = ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  return [next >>> 0, value];
}

export class Mulberry32Prng implements RandomService {
  private state: number;

  constructor(seed: string | PrngState) {
    if (typeof seed === 'string') {
      this.state = hashSeedToUint32(seed);
      if (this.state === 0) {
        this.state = 0x9e3779b9;
      }
    } else {
      if (seed.algorithm !== PRNG_ALGORITHM_ID) {
        throw new Error(`Unsupported PRNG algorithm: ${seed.algorithm}`);
      }
      this.state = seed.state >>> 0;
    }
  }

  nextFloat(): number {
    const [next, value] = mulberry32Step(this.state);
    this.state = next;
    return value;
  }

  int(min: number, max: number): number {
    if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) {
      throw new Error(`Invalid int range: ${min}..${max}`);
    }
    const span = max - min + 1;
    return min + Math.floor(this.nextFloat() * span);
  }

  weightedChoice<T>(items: Weighted<T>[]): T {
    if (items.length === 0) {
      throw new Error('weightedChoice requires at least one item');
    }
    const total = items.reduce((sum, item) => sum + item.weight, 0);
    if (total <= 0) {
      throw new Error('weightedChoice requires positive total weight');
    }
    let threshold = this.nextFloat() * total;
    for (const item of items) {
      threshold -= item.weight;
      if (threshold <= 0) {
        return item.value;
      }
    }
    return items[items.length - 1].value;
  }

  normal(mean: number, sd: number): number {
    const u1 = this.nextFloat();
    const u2 = this.nextFloat();
    const mag = Math.sqrt(-2 * Math.log(Math.max(u1, 1e-12))) * Math.cos(2 * Math.PI * u2);
    return mean + sd * mag;
  }

  snapshot(): PrngState {
    return {
      algorithm: PRNG_ALGORITHM_ID,
      state: this.state >>> 0,
    };
  }

  restore(state: PrngState): void {
    if (state.algorithm !== PRNG_ALGORITHM_ID) {
      throw new Error(`Cannot restore PRNG algorithm ${state.algorithm}`);
    }
    this.state = state.state >>> 0;
  }
}
