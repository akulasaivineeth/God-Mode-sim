import { describe, expect, it } from 'vitest';
import { digestCitizenWorld } from '@/debug/worldDigest';
import { SCHEMA_VERSION } from '@/shared/version';
import { createCitizenWorld, runCitizenSteps } from '@/simulation/model/world';

const SEED = 'GODMODE_M02_CANONICAL_2026';

function fresh() {
  return createCitizenWorld(SEED, SCHEMA_VERSION);
}

function inBatches(total: number, batch: number) {
  let snapshot = fresh();
  let remaining = total;
  while (remaining > 0) {
    const count = Math.min(batch, remaining);
    snapshot = runCitizenSteps(snapshot, count);
    remaining -= count;
  }
  return snapshot;
}

/** ARCH-005 / M01-GATE preserved for the citizen sim: state = f(total minutes). */
describe('M02 citizen determinism / high-speed independence', () => {
  it('reaches identical state for the same minutes regardless of batch size', () => {
    const reference = digestCitizenWorld(runCitizenSteps(fresh(), 1440));
    expect(digestCitizenWorld(inBatches(1440, 1))).toBe(reference);
    expect(digestCitizenWorld(inBatches(1440, 7))).toBe(reference);
    expect(digestCitizenWorld(inBatches(1440, 60))).toBe(reference);
    expect(digestCitizenWorld(inBatches(1440, 1440))).toBe(reference);
  });

  it('is a no-op when paused (zero steps)', () => {
    expect(digestCitizenWorld(runCitizenSteps(fresh(), 0))).toBe(digestCitizenWorld(fresh()));
  });

  it('diverges for a different seed', () => {
    const a = digestCitizenWorld(runCitizenSteps(fresh(), 300));
    const b = digestCitizenWorld(runCitizenSteps(createCitizenWorld('OTHER_SEED', SCHEMA_VERSION), 300));
    expect(a).not.toBe(b);
  });
});
