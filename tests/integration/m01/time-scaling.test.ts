import { describe, expect, it } from 'vitest';
import { digestWorldSnapshot } from '@/debug/worldDigest';
import { deriveCalendar, MINUTES_PER_DAY } from '@/simulation/core/calendar';
import {
  accumulateSimMinutes,
  createPacingState,
  type PacingState,
  type SimSpeed,
} from '@/simulation/core/speed';
import { SCHEMA_VERSION } from '@/shared/version';
import { createWorldSnapshot, runToySteps, type WorldSnapshot } from '@/simulation/core/toySim';

const CANONICAL_M01_SEED = 'GODMODE_M01_CANONICAL_2026';
const ONE_DAY = MINUTES_PER_DAY; // 1440 simulated minutes

function fresh(): WorldSnapshot {
  return createWorldSnapshot(CANONICAL_M01_SEED, SCHEMA_VERSION);
}

function stepInBatches(totalMinutes: number, batch: number): WorldSnapshot {
  let snapshot = fresh();
  let remaining = totalMinutes;
  while (remaining > 0) {
    const count = Math.min(batch, remaining);
    snapshot = runToySteps(snapshot, count);
    remaining -= count;
  }
  return snapshot;
}

/**
 * Turn a real-time pacing scenario at a given speed into the sequence of
 * per-tick STEP counts the SimulationDriver would emit. Used to prove that the
 * emergent state depends only on the total minutes, not the speed (ARCH-005).
 */
function stepCountsForScenario(speed: SimSpeed, frameMs: number, frames: number): number[] {
  let state: PacingState = createPacingState();
  const counts: number[] = [];
  for (let i = 0; i < frames; i += 1) {
    const result = accumulateSimMinutes(state, frameMs, speed);
    state = result.next;
    if (result.minutes > 0) counts.push(result.minutes);
  }
  return counts;
}

function applyCounts(counts: number[]): WorldSnapshot {
  let snapshot = fresh();
  for (const count of counts) {
    snapshot = runToySteps(snapshot, count);
  }
  return snapshot;
}

describe('ARCH-005 / M01-GATE high-speed independence', () => {
  it('produces identical state for the same total minutes regardless of batch size', () => {
    const reference = digestWorldSnapshot(runToySteps(fresh(), ONE_DAY));
    expect(digestWorldSnapshot(stepInBatches(ONE_DAY, 1))).toBe(reference);
    expect(digestWorldSnapshot(stepInBatches(ONE_DAY, 7))).toBe(reference);
    expect(digestWorldSnapshot(stepInBatches(ONE_DAY, 60))).toBe(reference);
    expect(digestWorldSnapshot(stepInBatches(ONE_DAY, ONE_DAY))).toBe(reference);
  });

  it('reaches the same world at 1x and at 1000x for equal simulated duration', () => {
    // 1x for 30 real seconds → 1800 sim-minutes worth of tiny steps.
    const slowCounts = stepCountsForScenario(1, 1000 / 60, 60 * 30);
    // 1000x reaching the same total, paced in large per-frame chunks.
    const totalSlow = slowCounts.reduce((sum, n) => sum + n, 0);
    const fastCounts = stepCountsForScenario(1000, 1000 / 60, Math.ceil(totalSlow / 16));

    const totalFast = fastCounts.reduce((sum, n) => sum + n, 0);
    // Align both to the same total minutes before comparing state.
    const total = Math.min(totalSlow, totalFast);

    const slowDigest = digestWorldSnapshot(stepInBatches(total, 1));
    const slowApplied = digestWorldSnapshot(applyCounts(trimTo(slowCounts, total)));
    const fastApplied = digestWorldSnapshot(applyCounts(trimTo(fastCounts, total)));

    expect(slowApplied).toBe(slowDigest);
    expect(fastApplied).toBe(slowDigest);
  });

  it('advances nothing when paused (zero-minute steps are a no-op)', () => {
    const base = fresh();
    const baseDigest = digestWorldSnapshot(base);
    expect(digestWorldSnapshot(runToySteps(base, 0))).toBe(baseDigest);
  });
});

describe('SIM-TIME-001 clock continuity', () => {
  it('returns to the same wall-clock time after a full simulated day', () => {
    const start = deriveCalendar(0);
    const nextDay = deriveCalendar(ONE_DAY);
    expect(nextDay.clockLabel).toBe(start.clockLabel);
    expect(nextDay.dayIndex).toBe(start.dayIndex + 1);
  });
});

/** Keep only enough leading step counts to reach `targetTotal` minutes exactly. */
function trimTo(counts: number[], targetTotal: number): number[] {
  const trimmed: number[] = [];
  let running = 0;
  for (const count of counts) {
    if (running + count <= targetTotal) {
      trimmed.push(count);
      running += count;
    } else {
      const remainder = targetTotal - running;
      if (remainder > 0) trimmed.push(remainder);
      break;
    }
  }
  return trimmed;
}
