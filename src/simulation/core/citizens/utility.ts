/**
 * Layer-1/Layer-2 utility scoring — NPC-DEC-001 (M02 subset).
 *
 * Plain English: When choosing what to do next, the citizen scores each candidate
 * action from need pressure, schedule goals, travel cost, and small seeded noise.
 * The full breakdown is stored for the God inspector.
 */
import { deriveCalendar } from '../calendar';
import type { Mulberry32Prng } from '../prng';
import { getFacilityPoint } from '@/world/facilityPoints';
import { findPath, nearestNodeId, pathDistance } from '@/world/navigation';
import { REFLEX_THRESHOLDS } from './needs';
import type {
  ActionKind,
  ActiveAction,
  CitizenState,
  UtilityCandidateScore,
  UtilityContributor,
  UtilityTrace,
} from './types';
import { ACTION_DURATIONS } from './types';

export interface ActionCandidate {
  action: ActionKind;
  targetFacilityId: string | null;
}

function facilityForAction(state: CitizenState, action: ActionKind): string | null {
  switch (action) {
    case 'sleep':
    case 'use_toilet':
    case 'shower':
    case 'drink':
      return state.assignments.homeId;
    case 'eat':
    case 'shop':
      return state.assignments.storeId;
    case 'work':
      return state.assignments.workplaceId;
    default:
      return null;
  }
}

function travelCostMinutes(state: CitizenState, targetFacilityId: string | null): number {
  if (!targetFacilityId) return 0;
  if (state.currentFacilityId === targetFacilityId) return 0;
  const fromNode = state.currentFacilityId
    ? `facility-${state.currentFacilityId}`
    : nearestNodeId(state.position);
  const toNode = `facility-${targetFacilityId}`;
  const path = findPath(fromNode, toNode);
  if (!path) return 999;
  return Math.ceil(path.totalDistance / 3.5);
}

function needPressure(state: CitizenState, action: ActionKind): number {
  const { needs } = state;
  switch (action) {
    case 'use_toilet':
      return Math.max(0, needs.bladder - 20) * 1.4;
    case 'drink':
      return Math.max(0, needs.thirst - 15) * 1.2;
    case 'eat':
    case 'shop':
      return Math.max(0, needs.hunger - 10) * 1.1;
    case 'sleep':
      return Math.max(0, 100 - needs.energy - 10) * 1.0;
    case 'shower':
      return Math.max(0, 70 - needs.hygiene) * 0.7;
    case 'work':
      // Fatigue penalty only when energy is genuinely low — keeps work viable on a full day.
      return Math.max(0, 45 - needs.energy) * -0.2;
    default:
      return 0;
  }
}

/** Target work minutes per weekday — NPC-DEC-001 schedule pressure (M02). */
const DAILY_WORK_TARGET_MINUTES = 240;

function isWorkHours(hour: number, weekday: number): boolean {
  return hour >= 9 && hour < 17 && weekday < 5;
}

function goalValue(state: CitizenState, action: ActionKind, simMinute: number): number {
  const calendar = deriveCalendar(simMinute);
  const hour = calendar.hourOfDay;
  const weekday = calendar.weekdayIndex;
  const workHours = isWorkHours(hour, weekday);

  if (action === 'work') {
    const conscientiousBoost = state.personality.conscientiousness / 100;
    if (!workHours) return -15;
    const quotaGap = Math.max(0, DAILY_WORK_TARGET_MINUTES - state.workMinutesToday);
    const quotaBoost = (quotaGap / DAILY_WORK_TARGET_MINUTES) * 48;
    return 34 * conscientiousBoost + quotaBoost;
  }

  if (action === 'sleep') {
    const night = hour >= 22 || hour < 6;
    return night ? 22 : hour >= 20 ? 8 : -6;
  }

  if (action === 'eat' || action === 'shop') {
    const mealTime =
      (hour >= 7 && hour < 9) || (hour >= 12 && hour < 14) || (hour >= 18 && hour < 20);
    if (mealTime) return 16;
    if (workHours) return -3;
    return 4;
  }

  if (action === 'shower') {
    if (workHours) return -5;
    return hour >= 6 && hour < 9 ? 10 : 1;
  }

  if (action === 'drink' && workHours) {
    return -2;
  }

  if (action === 'use_toilet') {
    return Math.max(0, state.needs.bladder - 40) * 0.35;
  }

  return 0;
}

function scoreCandidate(
  state: CitizenState,
  candidate: ActionCandidate,
  simMinute: number,
  prng: Mulberry32Prng,
): UtilityCandidateScore {
  const contributors: UtilityContributor[] = [];
  const need = needPressure(state, candidate.action);
  contributors.push({ factor: 'needPressure', value: need });

  const goal = goalValue(state, candidate.action, simMinute);
  contributors.push({ factor: 'goalValue', value: goal });

  const travel = travelCostMinutes(state, candidate.targetFacilityId);
  const travelPenalty = -travel * 1.6;
  contributors.push({ factor: 'travelCost', value: travelPenalty });

  const duration =
    candidate.action === 'travel' || candidate.action === 'idle'
      ? 5
      : ACTION_DURATIONS[candidate.action as keyof typeof ACTION_DURATIONS] ?? 10;
  contributors.push({ factor: 'timeCost', value: -duration * 0.04 });

  const noise = (prng.nextFloat() - 0.5) * state.personality.impulsivity * 0.08;
  contributors.push({ factor: 'seededNoise', value: noise });

  const total = contributors.reduce((sum, entry) => sum + entry.value, 0);
  return {
    action: candidate.action,
    targetFacilityId: candidate.targetFacilityId,
    total,
    contributors,
  };
}

export function buildLayer2Candidates(state: CitizenState, simMinute: number): ActionCandidate[] {
  const calendar = deriveCalendar(simMinute);
  const candidates: ActionCandidate[] = [
    { action: 'work', targetFacilityId: state.assignments.workplaceId },
    { action: 'eat', targetFacilityId: state.assignments.storeId },
    { action: 'drink', targetFacilityId: state.assignments.homeId },
    { action: 'sleep', targetFacilityId: state.assignments.homeId },
    { action: 'shower', targetFacilityId: state.assignments.homeId },
    { action: 'shop', targetFacilityId: state.assignments.storeId },
  ];

  if (state.needs.bladder >= 50) {
    candidates.push({
      action: 'use_toilet',
      targetFacilityId: state.assignments.homeId,
    });
  }

  if (calendar.hourOfDay >= 22 || calendar.hourOfDay < 6) {
    return candidates.filter(
      (entry) =>
        entry.action === 'sleep' || entry.action === 'use_toilet' || entry.action === 'drink',
    );
  }

  return candidates;
}

export function chooseLayer1Action(
  state: CitizenState,
  reflexAction: ActionKind,
): ActionCandidate {
  return {
    action: reflexAction,
    targetFacilityId: facilityForAction(state, reflexAction),
  };
}

export function scoreDecision(
  state: CitizenState,
  simMinute: number,
  layer: 1 | 2,
  candidates: ActionCandidate[],
  prng: Mulberry32Prng,
  decisionId: string,
): { selected: ActionCandidate; trace: UtilityTrace } {
  const scored = candidates.map((candidate) => scoreCandidate(state, candidate, simMinute, prng));
  scored.sort((a, b) => b.total - a.total);
  const best = scored[0];
  const selected: ActionCandidate = {
    action: best.action,
    targetFacilityId: best.targetFacilityId,
  };

  return {
    selected,
    trace: {
      decisionId,
      simMinute,
      layer,
      selectedAction: selected.action,
      targetFacilityId: selected.targetFacilityId,
      candidates: scored,
    },
  };
}

export function isAtFacility(state: CitizenState, facilityId: string | null): boolean {
  return facilityId !== null && state.currentFacilityId === facilityId;
}

export function buildTravelAction(
  state: CitizenState,
  targetFacilityId: string,
  simMinute: number,
  followUpAction: ActionKind,
): ActiveAction {
  const fromNode = state.currentFacilityId
    ? `facility-${state.currentFacilityId}`
    : nearestNodeId(state.position);
  const toNode = `facility-${targetFacilityId}`;
  const path = findPath(fromNode, toNode);
  const nodeIds = path?.nodeIds ?? [fromNode, toNode];
  const totalDistance = path?.totalDistance ?? pathDistance(nodeIds);
  const travelMinutes = Math.max(1, Math.ceil(totalDistance / 3.5));

  return {
    kind: 'travel',
    targetFacilityId,
    startedAtMinute: simMinute,
    durationMinutes: travelMinutes,
    elapsedMinutes: 0,
    pathNodeIds: nodeIds,
    traversedDistance: 0,
    totalPathDistance: totalDistance,
    followUpAction,
  };
}

export function buildIndoorAction(
  action: ActionKind,
  facilityId: string,
  simMinute: number,
): ActiveAction {
  const duration =
    action === 'idle'
      ? 5
      : ACTION_DURATIONS[action as keyof typeof ACTION_DURATIONS] ?? 10;
  return {
    kind: action,
    targetFacilityId: facilityId,
    startedAtMinute: simMinute,
    durationMinutes: duration,
    elapsedMinutes: 0,
  };
}

export function facilityEntrancePosition(facilityId: string) {
  return getFacilityPoint(facilityId).entrance;
}

export { REFLEX_THRESHOLDS };
