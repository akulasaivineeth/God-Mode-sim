/**
 * M02 physical needs — NPC-NEED-001 (spec §7.1).
 *
 * Plain English: each simulated minute the citizen's needs drift down (they get
 * hungrier, thirstier, more tired, etc.). While performing an action the matching
 * need is restored, with plausible side effects (e.g. drinking fills the
 * bladder; working tires and dirties you). Values are 0..100 (100 = satisfied).
 * All arithmetic is deterministic — no randomness here.
 */
import type { ActionState, ActionType, Need, NeedsState } from './types';

export const NEEDS: readonly Need[] = ['hunger', 'thirst', 'bladder', 'energy', 'hygiene'];

/** Baseline per-minute decay while awake. */
export const NEED_DECAY: NeedsState = {
  hunger: 0.1,
  thirst: 0.14,
  bladder: 0.12,
  energy: 0.07,
  hygiene: 0.03,
};

/** Needs decay slower while asleep (except energy, which restores). */
export const SLEEP_DECAY_FACTOR = 0.4;

/** Extra per-minute effects applied while performing an action. */
export const ACTION_EFFECT: Record<ActionType, Partial<NeedsState>> = {
  sleep: { energy: 0.4 },
  eat: { hunger: 6 },
  drink: { thirst: 12, bladder: -3 },
  toilet: { bladder: 25 },
  shower: { hygiene: 8 },
  work: { hunger: -0.1, thirst: -0.15, hygiene: -0.05, energy: -0.03 },
  idle: {},
};

/** Perform-phase duration (simulated minutes) for each action. */
export const ACTION_DURATION: Record<ActionType, number> = {
  sleep: 480,
  eat: 30,
  drink: 5,
  toilet: 5,
  shower: 15,
  work: 240,
  idle: 20,
};

export function pressure(value: number): number {
  return 100 - value;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function initialNeeds(): NeedsState {
  return { hunger: 80, thirst: 75, bladder: 85, energy: 70, hygiene: 80 };
}

/** Advance needs by one simulated minute given the current action (if any). */
export function stepNeeds(needs: NeedsState, action: ActionState | null): NeedsState {
  const asleep = action?.type === 'sleep' && action.phase === 'perform';
  const performing = action?.phase === 'perform';
  const next: NeedsState = { ...needs };

  for (const need of NEEDS) {
    let decay = NEED_DECAY[need];
    if (asleep) {
      decay = need === 'energy' ? 0 : decay * SLEEP_DECAY_FACTOR;
    }
    next[need] -= decay;
  }

  if (performing && action) {
    const effect = ACTION_EFFECT[action.type];
    for (const need of NEEDS) {
      const delta = effect[need];
      if (delta !== undefined) {
        next[need] += delta;
      }
    }
  }

  for (const need of NEEDS) {
    next[need] = clamp(next[need]);
  }
  return next;
}
