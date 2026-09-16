/**
 * Spike-local RNG compatibility layer backed exclusively by GOD MODE Mulberry32Prng.
 * TownBox vendored code consumes SpikeRng — never TownBox SeededRandom in executable paths.
 */
import { Mulberry32Prng, PRNG_ALGORITHM_ID, type PrngState } from '@/simulation/core/prng';

export interface SpikeRng {
  next(): number;
  nextInt(minInclusive: number, maxInclusive: number): number;
  chance(probability: number): boolean;
  pick<T>(items: readonly T[]): T;
  snapshot(): PrngState;
  getState(): number;
}

export function deriveSeedDomain(...parts: (string | number)[]): string {
  return parts.join('|');
}

function wrapPrng(prng: Mulberry32Prng): SpikeRng {
  return {
    next: () => prng.nextFloat(),
    nextInt: (minInclusive, maxInclusive) => prng.int(minInclusive, maxInclusive),
    chance: (probability) => prng.nextFloat() < probability,
    pick<T>(items: readonly T[]): T {
      if (items.length === 0) {
        throw new Error('[SpikeRng] Cannot pick from an empty list');
      }
      return items[prng.int(0, items.length - 1)]!;
    },
    snapshot: () => prng.snapshot(),
    getState: () => prng.snapshot().state,
  };
}

export function createSpikeRng(seedDomain: string): SpikeRng {
  return wrapPrng(new Mulberry32Prng(seedDomain));
}

export function restoreSpikeRng(state: number | PrngState): SpikeRng {
  const prngState: PrngState =
    typeof state === 'number'
      ? { algorithm: PRNG_ALGORITHM_ID, state: state >>> 0 }
      : state;
  return wrapPrng(new Mulberry32Prng(prngState));
}

export function forkSpikeRng(parent: SpikeRng, salt: number): SpikeRng {
  return createSpikeRng(deriveSeedDomain('fork', parent.snapshot().state, salt));
}

export function createPopulationRng(worldSeed: string): SpikeRng {
  return createSpikeRng(deriveSeedDomain(worldSeed, 'spike-t', 'population'));
}
