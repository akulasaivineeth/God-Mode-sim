/**
 * M02 decision architecture — NPC-DEC-001 / NPC-DEC-010 (spec §14).
 *
 * Plain English: each time the citizen is free to choose, we score every possible
 * action from need pressure, time of day, personality, and travel cost, plus a
 * little seeded noise, and pick the best. Urgent needs trigger a Layer-1 reflex
 * that overrides the routine Layer-2 score. Every decision keeps a full,
 * inspectable breakdown of why each option scored what it did.
 */
import type { RandomService } from '@/simulation/core/prng';
import { NAV_NODES, ACTION_LOCATION } from './locations';
import { pathLength, pathWaypoints } from './pathfinding';
import { pressure } from './needs';
import type {
  ActionType,
  CitizenState,
  DecisionCandidate,
  DecisionFactor,
  DecisionTrace,
  Need,
} from './types';

const NEED_ACTION: Record<Need, ActionType> = {
  hunger: 'eat',
  thirst: 'drink',
  bladder: 'toilet',
  energy: 'sleep',
  hygiene: 'shower',
};

const NEED_WEIGHT: Record<Need, number> = {
  hunger: 1.0,
  thirst: 1.05,
  bladder: 1.1,
  energy: 1.0,
  hygiene: 0.85,
};

/** Needs whose pressure triggers a Layer-1 reflex (spec §14.1). */
const REFLEX_NEEDS: Need[] = ['bladder', 'thirst', 'energy', 'hunger'];
const CRITICAL_VALUE = 12;
const REFLEX_URGENCY = 1000;

function travelUnits(citizen: CitizenState, targetNode: string | null): number {
  if (!targetNode || targetNode === citizen.atNode) {
    return 0;
  }
  const waypoints = pathWaypoints(citizen.atNode, targetNode);
  return pathLength(NAV_NODES[citizen.atNode], waypoints);
}

function sleepTimeBonus(hour: number): number {
  if (hour >= 22 || hour < 6) return 55;
  if (hour >= 20 || hour < 8) return 15;
  return -45;
}

function workTimeBonus(hour: number): number {
  return hour >= 9 && hour < 17 ? 65 : -60;
}

function mealBonus(hour: number): number {
  return [8, 12, 18].some((h) => Math.abs(hour - h) <= 1) ? 12 : 0;
}

function scoreNeedAction(
  need: Need,
  citizen: CitizenState,
  hour: number,
  noise: number,
): DecisionCandidate {
  const action = NEED_ACTION[need];
  const p = pressure(citizen.needs[need]);
  const weight = NEED_WEIGHT[need];
  const base = p * weight;
  const travel = travelUnits(citizen, ACTION_LOCATION[action]) * 0.1;
  // Disciplined citizens act less on low-pressure needs (tolerate discomfort).
  const disciplineHold = -(citizen.personality.discipline / 100) * Math.max(0, 45 - p) * 0.35;

  const factors: DecisionFactor[] = [
    { label: `need pressure (${need})`, value: round(base) },
  ];

  let time = 0;
  if (action === 'sleep') {
    time = sleepTimeBonus(hour);
    factors.push({ label: 'time of day (sleep)', value: time });
  } else if (action === 'eat') {
    time = mealBonus(hour);
    factors.push({ label: 'meal time', value: time });
  }

  factors.push({ label: 'travel cost', value: round(-travel) });
  if (disciplineHold !== 0) {
    factors.push({ label: 'discipline (tolerate low need)', value: round(disciplineHold) });
  }
  factors.push({ label: 'seeded noise', value: round(noise) });

  const score = base + time - travel + disciplineHold + noise;
  return { action, score: round(score), factors };
}

function scoreWork(citizen: CitizenState, hour: number, noise: number): DecisionCandidate {
  const time = workTimeBonus(hour);
  const diligence = 0.6 + (citizen.personality.diligence / 100) * 0.8;
  const base = time * diligence;
  const travel = travelUnits(citizen, ACTION_LOCATION.work) * 0.1;
  const score = base - travel + noise;
  return {
    action: 'work',
    score: round(score),
    factors: [
      { label: 'work hours suitability', value: round(time) },
      { label: 'diligence factor', value: round(diligence) },
      { label: 'travel cost', value: round(-travel) },
      { label: 'seeded noise', value: round(noise) },
    ],
  };
}

function scoreIdle(noise: number): DecisionCandidate {
  return {
    action: 'idle',
    score: round(6 + noise),
    factors: [
      { label: 'baseline fallback', value: 6 },
      { label: 'seeded noise', value: round(noise) },
    ],
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Decide the next action. Returns the full trace (all candidate scores) and the
 * selected action. Layer-1 reflex overrides routine when a need is critical.
 */
export function decideAction(
  citizen: CitizenState,
  hour: number,
  prng: RandomService,
): { trace: DecisionTrace; selected: ActionType } {
  const candidates: DecisionCandidate[] = [];
  // Draw noise per candidate in a fixed order for determinism.
  for (const need of ['hunger', 'thirst', 'bladder', 'energy', 'hygiene'] as Need[]) {
    const noise = prng.nextFloat() * 6 - 3;
    candidates.push(scoreNeedAction(need, citizen, hour, noise));
  }
  candidates.push(scoreWork(citizen, hour, prng.nextFloat() * 6 - 3));
  candidates.push(scoreIdle(prng.nextFloat() * 6 - 3));

  // Layer-1 reflex: boost any action serving a critical need.
  let reflex = false;
  let mostUrgent = Infinity;
  for (const need of REFLEX_NEEDS) {
    if (citizen.needs[need] <= CRITICAL_VALUE) {
      const action = NEED_ACTION[need];
      const candidate = candidates.find((c) => c.action === action);
      if (candidate && citizen.needs[need] < mostUrgent) {
        mostUrgent = citizen.needs[need];
      }
      if (candidate) {
        candidate.factors.push({ label: `reflex: critical ${need}`, value: REFLEX_URGENCY });
        candidate.score = round(candidate.score + REFLEX_URGENCY);
        reflex = true;
      }
    }
  }

  let selected = candidates[0];
  for (const candidate of candidates) {
    if (candidate.score > selected.score) {
      selected = candidate;
    }
  }

  const trace: DecisionTrace = {
    atMinute: 0, // filled in by caller
    layer: reflex ? 'reflex' : 'routine',
    selected: selected.action,
    candidates: [...candidates].sort((a, b) => b.score - a.score),
  };

  return { trace, selected: selected.action };
}
