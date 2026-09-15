import { describe, expect, it } from 'vitest';
import { parseSaveBundle } from '@/persistence/deserialize';
import { buildSaveBundle, serializeSaveBundle } from '@/persistence/serialize';
import { digestCitizenWorld } from '@/debug/worldDigest';
import { SCHEMA_VERSION } from '@/shared/version';
import { createCitizenWorld, runCitizenSteps } from '@/simulation/model/world';

describe('Foundation — M02 citizen save compatibility', () => {
  it('round-trips citizen snapshot through save bundle JSON', () => {
    const snapshot = runCitizenSteps(createCitizenWorld('save-compat-test', SCHEMA_VERSION), 480);
    const beforeDigest = digestCitizenWorld(snapshot);
    const bundle = buildSaveBundle({ snapshot, exportedAt: '2026-01-01T00:00:00.000Z' });
    const parsed = parseSaveBundle(serializeSaveBundle(bundle));
    const restored = parsed.snapshot;

    expect(restored.citizens).toHaveLength(1);
    expect(restored.clock.simMinute).toBe(480);
    expect(restored.citizens?.[0]?.needs.hunger).toBe(snapshot.citizens?.[0]?.needs.hunger);
    expect(digestCitizenWorld(restored)).toBe(beforeDigest);
  });
});
