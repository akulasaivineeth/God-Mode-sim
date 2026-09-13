import { describe, expect, it } from 'vitest';
import { digestWorldSnapshot } from '@/debug/worldDigest';
import { createM02WorldSnapshot } from '@/simulation/core/m02Init';
import { runWorldSteps } from '@/simulation/core/worldStep';
import { SCHEMA_VERSION } from '@/shared/version';

const M02_SEED = 'GODMODE_M02_CANONICAL_2026';

describe('M02 determinism', () => {
  it('produces a stable digest after 480 steps with one citizen', () => {
    const steps = 480;
    const a = runWorldSteps(createM02WorldSnapshot(M02_SEED, SCHEMA_VERSION), steps);
    const b = runWorldSteps(createM02WorldSnapshot(M02_SEED, SCHEMA_VERSION), steps);
    expect(digestWorldSnapshot(a)).toBe(digestWorldSnapshot(b));
    expect(a.clock.simMinute).toBe(steps);
  });
});
