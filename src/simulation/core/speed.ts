/**
 * Simulation speed + real-time pacing — SIM-TIME-002 / SIM-TIME-003 / ARCH-005.
 *
 * Plain English: The player picks a speed (Pause … 1000×). The speed only
 * decides HOW MANY simulated minutes should elapse per real second. It never
 * changes WHAT happens in a given simulated minute. That separation is what
 * makes high-speed runs produce the same world as slow runs (ARCH-005): the
 * authoritative state is a function of the total number of simulated minutes
 * stepped, not of wall-clock pacing or batching.
 *
 * Canonical mapping (spec §5.1): 1 real second = 1 simulated minute at 1×.
 */

export const SIM_SPEEDS = [0, 0.25, 1, 5, 20, 100, 1000] as const;
export type SimSpeed = (typeof SIM_SPEEDS)[number];

export const DEFAULT_SPEED: SimSpeed = 1;

/** Speeds at/above this collapse animation into snapped state (spec §5.2). */
export const ANIMATION_SUPPRESSION_SPEED = 100;

/** 1 simulated minute == 1000 real milliseconds at 1× speed. */
export const REAL_MS_PER_SIM_MINUTE = 1000;

/**
 * Safety clamp on the real delta fed into pacing. If the tab was backgrounded
 * or a frame stalled, we do not try to "catch up" an unbounded backlog in a
 * single tick (which would freeze the UI). One real second of catch-up per tick
 * preserves the canonical "1 real second = 1 sim minute at 1×" mapping for
 * normal frames while bounding worst-case work; simulated *state* remains
 * correct for whatever minutes are actually stepped.
 */
export const MAX_REAL_DELTA_MS = 1000;

export interface PacingState {
  /** Sub-minute real-ms-equivalent carried to the next tick. */
  remainderMs: number;
}

export interface PacingResult {
  /** Whole simulated minutes to step this tick (>= 0). */
  minutes: number;
  /** Updated pacing state to carry forward. */
  next: PacingState;
}

export function createPacingState(): PacingState {
  return { remainderMs: 0 };
}

export function isPaused(speed: SimSpeed): boolean {
  return speed === 0;
}

export function isAnimationSuppressed(speed: SimSpeed): boolean {
  return speed >= ANIMATION_SUPPRESSION_SPEED;
}

/**
 * SIM-TIME-002 / SIM-TIME-003 / ARCH-005 — Pure pacing math.
 *
 * Converts an elapsed real-time delta at a given speed into a whole number of
 * simulated minutes to advance, carrying the fractional remainder forward so
 * slow speeds (e.g. 0.25×) accumulate correctly and no time is lost.
 *
 * Pause (speed 0) always yields 0 minutes, so the authoritative clock freezes
 * while the UI/camera loop keeps running (UAT-TIME-001).
 */
export function accumulateSimMinutes(
  state: PacingState,
  elapsedRealMs: number,
  speed: SimSpeed,
): PacingResult {
  if (speed === 0 || elapsedRealMs <= 0) {
    return { minutes: 0, next: state };
  }

  const clampedElapsed = Math.min(elapsedRealMs, MAX_REAL_DELTA_MS);
  const progressMs = state.remainderMs + clampedElapsed * speed;
  const minutes = Math.floor(progressMs / REAL_MS_PER_SIM_MINUTE);
  const remainderMs = progressMs - minutes * REAL_MS_PER_SIM_MINUTE;

  return { minutes, next: { remainderMs } };
}
