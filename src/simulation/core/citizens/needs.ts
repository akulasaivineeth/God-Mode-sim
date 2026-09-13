/**
 * Physiology need decay and satisfaction — NPC-NEED-* (M02 subset).
 *
 * Plain English: Needs rise or fall each simulated minute based on activity.
 * Citizens autonomously respond through the planner; the player never micromanages.
 */
import type { ActionKind, CitizenState, PhysiologyNeeds } from './types';

export const NEED_BOUNDS = { min: 0, max: 100 } as const;

export function clampNeed(value: number): number {
  return Math.max(NEED_BOUNDS.min, Math.min(NEED_BOUNDS.max, value));
}

export function createInitialNeeds(): PhysiologyNeeds {
  return {
    hunger: 35,
    thirst: 25,
    bladder: 15,
    energy: 82,
    hygiene: 78,
  };
}

/** Layer-1 reflex thresholds — urgent physiological response. */
export const REFLEX_THRESHOLDS = {
  bladder: 90,
  thirst: 86,
  hunger: 82,
  energyLow: 18,
} as const;

export function isReflexNeed(state: CitizenState): ActionKind | null {
  const { needs } = state;
  if (needs.bladder >= REFLEX_THRESHOLDS.bladder) return 'use_toilet';
  if (needs.thirst >= REFLEX_THRESHOLDS.thirst) return 'drink';
  if (needs.energy <= REFLEX_THRESHOLDS.energyLow) return 'sleep';
  if (needs.hunger >= REFLEX_THRESHOLDS.hunger) return 'eat';
  return null;
}

export function decayNeedsForMinute(state: CitizenState): PhysiologyNeeds {
  const { needs, activeAction } = state;
  const next = { ...needs };

  switch (activeAction.kind) {
    case 'sleep':
      next.energy = clampNeed(next.energy + 1.4);
      next.hunger = clampNeed(next.hunger + 0.08);
      next.thirst = clampNeed(next.thirst + 0.05);
      next.bladder = clampNeed(next.bladder + 0.04);
      break;
    case 'work':
      next.energy = clampNeed(next.energy - 0.35);
      next.hunger = clampNeed(next.hunger + 0.18);
      next.thirst = clampNeed(next.thirst + 0.14);
      next.bladder = clampNeed(next.bladder + 0.08);
      next.hygiene = clampNeed(next.hygiene - 0.06);
      break;
    case 'travel':
      next.energy = clampNeed(next.energy - 0.12);
      next.hunger = clampNeed(next.hunger + 0.12);
      next.thirst = clampNeed(next.thirst + 0.1);
      next.bladder = clampNeed(next.bladder + 0.06);
      break;
    default:
      next.energy = clampNeed(next.energy - 0.08);
      next.hunger = clampNeed(next.hunger + 0.14);
      next.thirst = clampNeed(next.thirst + 0.11);
      next.bladder = clampNeed(next.bladder + 0.07);
      next.hygiene = clampNeed(next.hygiene - 0.03);
      break;
  }

  return next;
}

export function applyNeedSatisfaction(
  needs: PhysiologyNeeds,
  action: ActionKind,
): PhysiologyNeeds {
  const next = { ...needs };
  switch (action) {
    case 'eat':
    case 'shop':
      next.hunger = clampNeed(next.hunger - 55);
      next.thirst = clampNeed(next.thirst + 4);
      break;
    case 'drink':
      next.thirst = clampNeed(next.thirst - 45);
      next.bladder = clampNeed(next.bladder + 8);
      break;
    case 'use_toilet':
      next.bladder = clampNeed(next.bladder - 70);
      break;
    case 'shower':
      next.hygiene = clampNeed(next.hygiene + 55);
      break;
    case 'sleep':
      next.energy = clampNeed(next.energy + 8);
      break;
    case 'work':
      break;
    default:
      break;
  }
  return next;
}
