import { describe, expect, it } from 'vitest';
import { digestWorldSnapshot } from '@/debug/worldDigest';
import { buildSaveBundle } from '@/persistence/serialize';
import { SCHEMA_VERSION } from '@/shared/version';
import { createWorldSnapshot, runToySteps } from '@/simulation/core/toySim';

const CANONICAL_SEED = 'GODMODE_M00_CANONICAL_2026';

describe('M00-GATE determinism', () => {
  it('matches full run after save/restore mid-sequence', () => {
    const full = runToySteps(createWorldSnapshot(CANONICAL_SEED, SCHEMA_VERSION), 100);
    const fullDigest = digestWorldSnapshot(full);

    const partial = runToySteps(createWorldSnapshot(CANONICAL_SEED, SCHEMA_VERSION), 50);
    const restored = runToySteps(
      buildSaveBundle({ snapshot: partial, exportedAt: '2026-01-01T00:00:00.000Z' }).snapshot,
      50,
    );

    expect(digestWorldSnapshot(restored)).toBe(fullDigest);
  });

  it('differs when seed changes', () => {
    const a = runToySteps(createWorldSnapshot(CANONICAL_SEED, SCHEMA_VERSION), 25);
    const b = runToySteps(createWorldSnapshot('OTHER_SEED', SCHEMA_VERSION), 25);
    expect(digestWorldSnapshot(a)).not.toBe(digestWorldSnapshot(b));
  });
});
