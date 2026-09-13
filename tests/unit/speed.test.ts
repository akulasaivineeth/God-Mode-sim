import { describe, expect, it } from 'vitest';
import {
  ANIMATION_SUPPRESSION_SPEED,
  MAX_REAL_DELTA_MS,
  REAL_MS_PER_SIM_MINUTE,
  SIM_SPEEDS,
  accumulateSimMinutes,
  createPacingState,
  isAnimationSuppressed,
  isPaused,
  type PacingState,
} from '@/simulation/core/speed';

/** SIM-TIME-002 — canonical speed set. */
describe('SIM-TIME-002 speed set', () => {
  it('offers exactly the canonical speeds', () => {
    expect([...SIM_SPEEDS]).toEqual([0, 0.25, 1, 5, 20, 100, 1000]);
  });

  it('classifies pause and animation suppression', () => {
    expect(isPaused(0)).toBe(true);
    expect(isPaused(1)).toBe(false);
    expect(isAnimationSuppressed(20)).toBe(false);
    expect(isAnimationSuppressed(ANIMATION_SUPPRESSION_SPEED)).toBe(true);
    expect(isAnimationSuppressed(1000)).toBe(true);
  });
});

/** SIM-TIME-003 / ARCH-005 — pure real-time → sim-minute pacing math. */
describe('SIM-TIME pacing math', () => {
  it('maps 1 real second to 1 sim minute at 1x', () => {
    const result = accumulateSimMinutes(createPacingState(), REAL_MS_PER_SIM_MINUTE, 1);
    expect(result.minutes).toBe(1);
    expect(result.next.remainderMs).toBe(0);
  });

  it('advances zero minutes and preserves state while paused', () => {
    const state: PacingState = { remainderMs: 123 };
    const result = accumulateSimMinutes(state, 100000, 0);
    expect(result.minutes).toBe(0);
    expect(result.next).toBe(state);
  });

  it('accumulates fractional minutes at 0.25x without losing time', () => {
    let state = createPacingState();
    let total = 0;
    for (let i = 0; i < 4; i += 1) {
      const result = accumulateSimMinutes(state, 1000, 0.25);
      total += result.minutes;
      state = result.next;
    }
    // 4 real seconds at 0.25x = exactly 1 sim minute.
    expect(total).toBe(1);
  });

  it('batches many minutes per tick at 1000x (within the delta clamp)', () => {
    // 100ms of real time under the clamp → 100 sim minutes in one tick.
    const result = accumulateSimMinutes(createPacingState(), 100, 1000);
    expect(result.minutes).toBe(100);
  });

  it('sums to real-time rate across many frames at 1x', () => {
    let state = createPacingState();
    let total = 0;
    const frameMs = 20; // 50 frames × 20ms = exactly 1000ms
    for (let i = 0; i < 50; i += 1) {
      const result = accumulateSimMinutes(state, frameMs, 1);
      total += result.minutes;
      state = result.next;
    }
    expect(total).toBe(1);
  });

  it('clamps oversized real deltas to avoid runaway catch-up', () => {
    const result = accumulateSimMinutes(createPacingState(), 10_000_000, 1000);
    // Clamped to MAX_REAL_DELTA_MS before scaling by speed.
    expect(result.minutes).toBe((MAX_REAL_DELTA_MS * 1000) / REAL_MS_PER_SIM_MINUTE);
  });
});
