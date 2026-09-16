// SPDX-License-Identifier: MIT
// Adapted from TownBox (https://github.com/Maudfer/townBox) @ 84c1ba4 — see src/spikes/arch01-t/THIRD_PARTY_NOTICES.md

import { SeededRandom, hashStringToSeed } from './seededRandom.js';

export const DEFAULT_CHILDREN_WILLINGNESS: readonly number[] = [0.04, 0.1, 0.24, 0.24, 0.22, 0.1, 0.06];

export function sampleMaxChildren(rng: SeededRandom, weights: readonly number[] = DEFAULT_CHILDREN_WILLINGNESS): number {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let roll = rng.next() * total;
  for (let i = 0; i < weights.length; i++) {
    roll -= weights[i]!;
    if (roll < 0) {
      return i;
    }
  }
  return weights.length - 1;
}

export function maxChildrenForPerson(
  worldSeed: number,
  personId: string,
  weights: readonly number[] = DEFAULT_CHILDREN_WILLINGNESS,
): number {
  return sampleMaxChildren(new SeededRandom((worldSeed ^ hashStringToSeed(personId)) >>> 0), weights);
}
