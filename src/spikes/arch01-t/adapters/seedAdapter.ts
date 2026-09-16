import { Mulberry32Prng } from '@/simulation/core/prng';
import { createPopulationRng } from './rngAdapter.js';

export { createPopulationRng };

export function worldSeedNumeric(worldSeed: string): number {
  return new Mulberry32Prng(worldSeed).snapshot().state;
}
