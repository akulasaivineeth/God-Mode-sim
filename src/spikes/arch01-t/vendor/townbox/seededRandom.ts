// SPDX-License-Identifier: MIT
// Adapted from TownBox (https://github.com/Maudfer/townBox) @ 84c1ba4 — see src/spikes/arch01-t/THIRD_PARTY_NOTICES.md

const UINT32 = 0x100000000;
const imul = Math.imul;

export class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = imul(t ^ (t >>> 15), t | 1);
    t ^= t + imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / UINT32;
  }

  nextInt(minInclusive: number, maxInclusive: number): number {
    if (maxInclusive <= minInclusive) {
      return minInclusive;
    }
    const span = maxInclusive - minInclusive + 1;
    return minInclusive + Math.floor(this.next() * span);
  }

  chance(probability: number): boolean {
    return this.next() < probability;
  }

  pick<T>(items: readonly T[]): T {
    if (items.length === 0) {
      throw new Error('[SeededRandom] Cannot pick from an empty list');
    }
    return items[this.nextInt(0, items.length - 1)]!;
  }

  fork(salt: number): SeededRandom {
    return new SeededRandom((imul(this.state ^ (salt >>> 0), 0x9e3779b1) >>> 0));
  }

  getState(): number {
    return this.state;
  }

  setState(state: number): void {
    this.state = state >>> 0;
  }
}

export function hashStringToSeed(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = imul(hash, 0x01000193);
  }
  return hash >>> 0;
}
