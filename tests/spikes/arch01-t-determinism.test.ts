import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { canonicalize } from '@/debug/canonicalize';
import { runSpikeT, SPIKE_T_CANONICAL_SEED } from '../../src/spikes/arch01-t/runSpikeT.js';

const FIXTURE_PATH = join('tests/spikes/fixtures/spike-t-canonical-2026.json');

describe('ARCH01 Spike T determinism (P1/P2)', () => {
  it('canonical seed is stable across 3 headless runs and matches golden fixture', () => {
    const runs = [runSpikeT(SPIKE_T_CANONICAL_SEED), runSpikeT(SPIKE_T_CANONICAL_SEED), runSpikeT(SPIKE_T_CANONICAL_SEED)];

    expect(runs[0].normalized).toBe(runs[1].normalized);
    expect(runs[1].normalized).toBe(runs[2].normalized);

    expect(runs[0].eventSequence.map((event) => event.id)).toEqual(runs[1].eventSequence.map((event) => event.id));
    expect(canonicalize(runs[0].eventSequence)).toBe(canonicalize(runs[1].eventSequence));

    const fixture = readFileSync(FIXTURE_PATH, 'utf8').trim();
    expect(runs[0].normalized).toBe(fixture);
  });
});
