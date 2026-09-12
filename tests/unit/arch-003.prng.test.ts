import { describe, expect, it } from 'vitest';
import { Mulberry32Prng, PRNG_ALGORITHM_ID, type PrngState } from '@/simulation/core/prng';

describe('ARCH-003 Mulberry32Prng', () => {
  it('produces identical sequences for the same seed', () => {
    const a = new Mulberry32Prng('GODMODE_M00_CANONICAL_2026');
    const b = new Mulberry32Prng('GODMODE_M00_CANONICAL_2026');

    const sequenceA = Array.from({ length: 10 }, () => a.nextFloat());
    const sequenceB = Array.from({ length: 10 }, () => b.nextFloat());

    expect(sequenceA).toEqual(sequenceB);
  });

  it('snapshot and restore continue the same sequence', () => {
    const prng = new Mulberry32Prng('restore-test');
    const first = prng.nextFloat();
    const snapshot = prng.snapshot();
    const second = prng.nextFloat();

    const restored = new Mulberry32Prng(snapshot);
    expect(restored.snapshot().algorithm).toBe(PRNG_ALGORITHM_ID);
    expect(first).not.toBe(second);
    expect(restored.nextFloat()).toBe(second);
  });

  it('rejects unsupported algorithm on restore', () => {
    const prng = new Mulberry32Prng('algo-test');
    const snapshot = prng.snapshot();
    const invalidState = {
      algorithm: 'xoshiro128**',
      state: snapshot.state,
    } as unknown as PrngState;
    expect(() => prng.restore(invalidState)).toThrow(/Cannot restore PRNG algorithm/);
  });

  it('weightedChoice is deterministic', () => {
    const prng = new Mulberry32Prng('weighted-test');
    const choices = Array.from({ length: 5 }, () =>
      prng.weightedChoice([
        { value: 'a', weight: 1 },
        { value: 'b', weight: 2 },
        { value: 'c', weight: 3 },
      ]),
    );
    const replay = new Mulberry32Prng('weighted-test');
    const replayChoices = Array.from({ length: 5 }, () =>
      replay.weightedChoice([
        { value: 'a', weight: 1 },
        { value: 'b', weight: 2 },
        { value: 'c', weight: 3 },
      ]),
    );
    expect(choices).toEqual(replayChoices);
  });
});
