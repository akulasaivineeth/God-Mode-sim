import { describe, expect, it } from 'vitest';
import { parseSaveBundle } from '@/persistence/deserialize';
import { buildSaveBundle, serializeSaveBundle } from '@/persistence/serialize';
import { SCHEMA_VERSION } from '@/shared/version';
import { createWorldSnapshot, runToySteps } from '@/simulation/core/toySim';

describe('ARCH-004 save bundle', () => {
  it('round-trips through JSON with schema validation', () => {
    const snapshot = runToySteps(createWorldSnapshot('bundle-test', SCHEMA_VERSION), 5);
    const bundle = buildSaveBundle({ snapshot, exportedAt: '2026-01-01T00:00:00.000Z' });
    const json = serializeSaveBundle(bundle);
    const parsed = parseSaveBundle(json);

    expect(parsed.snapshot.toy.tickCount).toBe(5);
    expect(parsed.milestone).toBe('M00');
    expect(parsed.digest).toBe(bundle.digest);
  });
});
