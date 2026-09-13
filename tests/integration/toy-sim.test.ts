import { describe, expect, it } from 'vitest';
import { digestWorldSnapshot } from '@/debug/worldDigest';
import { createWorldSnapshot, runToySteps } from '@/simulation/core/toySim';

const CANONICAL_SEED = 'GODMODE_M00_CANONICAL_2026';
/**
 * M00-GATE golden digest — regression-locked; do not change without a schema
 * migration. The schema version is pinned to the literal M00 value (`m00.1`)
 * rather than the live SCHEMA_VERSION constant so this historical lock is
 * unaffected by later milestones bumping build/schema identifiers.
 */
const M00_LOCKED_SCHEMA_VERSION = 'm00.1';
const CANONICAL_DIGEST_100_STEPS = 'fac095d1';

describe('M00 toy simulation integration', () => {
  it('produces a stable digest after 100 steps', () => {
    const snapshot = runToySteps(
      createWorldSnapshot(CANONICAL_SEED, M00_LOCKED_SCHEMA_VERSION),
      100,
    );
    const digest = digestWorldSnapshot(snapshot);

    expect(snapshot.toy.tickCount).toBe(100);
    expect(snapshot.clock.simMinute).toBe(100);
    expect(digest).toBe(CANONICAL_DIGEST_100_STEPS);

    const replay = runToySteps(
      createWorldSnapshot(CANONICAL_SEED, M00_LOCKED_SCHEMA_VERSION),
      100,
    );
    expect(digestWorldSnapshot(replay)).toBe(digest);
  });
});
