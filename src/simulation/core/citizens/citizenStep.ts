/**
 * Per-minute citizen simulation step — M02 autonomy core.
 */
import { deriveCalendar } from '../calendar';
import type { Mulberry32Prng } from '../prng';
import { getFacilityPoint } from '@/world/facilityPoints';
import { positionAlongPath } from '@/world/navigation';
import { createM02Citizen } from './createCitizen';
import {
  applyNeedSatisfaction,
  decayNeedsForMinute,
  isReflexNeed,
} from './needs';
import type { CitizenState } from './types';
import { WALK_SPEED_UNITS_PER_MINUTE } from './types';
import {
  buildIndoorAction,
  buildLayer2Candidates,
  buildTravelAction,
  chooseLayer1Action,
  isAtFacility,
  scoreDecision,
} from './utility';

export function ensureCitizens(snapshotCitizens: CitizenState[] | undefined, prng: Mulberry32Prng): CitizenState[] {
  if (snapshotCitizens && snapshotCitizens.length > 0) {
    return snapshotCitizens;
  }
  return [createM02Citizen(prng)];
}

function resetDailyWork(state: CitizenState, simMinute: number): CitizenState {
  const calendar = deriveCalendar(simMinute);
  if (calendar.minuteOfHour === 0 && calendar.hourOfDay === 0) {
    return { ...state, workMinutesToday: 0 };
  }
  return state;
}

function completeAction(state: CitizenState): CitizenState {
  let next = { ...state, needs: applyNeedSatisfaction(state.needs, state.activeAction.kind) };
  if (state.activeAction.kind === 'work') {
    next = { ...next, workMinutesToday: next.workMinutesToday + state.activeAction.durationMinutes };
  }
  return next;
}

function advanceTravel(state: CitizenState, simMinute: number, prng: Mulberry32Prng): CitizenState {
  const action = state.activeAction;
  const pathNodeIds = action.pathNodeIds ?? [];
  const totalDistance = action.totalPathDistance ?? 0;
  const traversed = (action.traversedDistance ?? 0) + WALK_SPEED_UNITS_PER_MINUTE;
  const position = positionAlongPath(pathNodeIds, traversed);
  const elapsedMinutes = action.elapsedMinutes + 1;
  const arrived = traversed >= totalDistance || elapsedMinutes >= action.durationMinutes;

  if (!arrived) {
    return {
      ...state,
      position,
      currentFacilityId: null,
      activeAction: {
        ...action,
        traversedDistance: traversed,
        elapsedMinutes,
      },
    };
  }

  const targetFacilityId = action.targetFacilityId;
  if (!targetFacilityId) {
    return planNextAction(state, simMinute, prng);
  }

  const interior = getFacilityPoint(targetFacilityId).interior;
  const followUp = action.followUpAction ?? 'idle';
  return {
    ...state,
    position: { x: interior.x, z: interior.z },
    currentFacilityId: targetFacilityId,
    activeAction: buildIndoorAction(followUp, targetFacilityId, simMinute),
    lastUtilityTrace: state.lastUtilityTrace,
  };
}

function advanceIndoor(state: CitizenState, simMinute: number, prng: Mulberry32Prng): CitizenState {
  const completed = completeAction(state);
  return planNextAction(completed, simMinute, prng);
}

export function planNextAction(
  state: CitizenState,
  simMinute: number,
  prng: Mulberry32Prng,
): CitizenState {
  const reflex = isReflexNeed(state);
  const decisionId = `decision-${state.id}-${simMinute}`;

  if (reflex) {
    const candidate = chooseLayer1Action(state, reflex);
    const { trace } = scoreDecision(state, simMinute, 1, [candidate], prng, decisionId);
    if (!isAtFacility(state, candidate.targetFacilityId)) {
      return {
        ...state,
        lastUtilityTrace: trace,
        activeAction: buildTravelAction(state, candidate.targetFacilityId!, simMinute, candidate.action),
      };
    }
    return {
      ...state,
      lastUtilityTrace: trace,
      activeAction: buildIndoorAction(candidate.action, candidate.targetFacilityId!, simMinute),
    };
  }

  const candidates = buildLayer2Candidates(state, simMinute);
  const { selected, trace } = scoreDecision(state, simMinute, 2, candidates, prng, decisionId);

  if (!isAtFacility(state, selected.targetFacilityId)) {
    return {
      ...state,
      lastUtilityTrace: trace,
      activeAction: buildTravelAction(state, selected.targetFacilityId!, simMinute, selected.action),
    };
  }

  return {
    ...state,
    lastUtilityTrace: trace,
    activeAction: buildIndoorAction(selected.action, selected.targetFacilityId!, simMinute),
  };
}

export function stepCitizen(state: CitizenState, simMinute: number, prng: Mulberry32Prng): CitizenState {
  let next = resetDailyWork(state, simMinute);
  next = { ...next, needs: decayNeedsForMinute(next) };

  const action = next.activeAction;

  if (action.kind === 'travel') {
    return advanceTravel(next, simMinute, prng);
  }

  if (action.elapsedMinutes + 1 >= action.durationMinutes) {
    return advanceIndoor(next, simMinute, prng);
  }

  const interrupted = isReflexNeed(next);
  if (interrupted && action.kind !== interrupted && action.kind !== 'sleep') {
    return planNextAction(next, simMinute, prng);
  }

  return {
    ...next,
    activeAction: { ...action, elapsedMinutes: action.elapsedMinutes + 1 },
  };
}

export function stepCitizens(
  citizens: CitizenState[] | undefined,
  simMinute: number,
  prng: Mulberry32Prng,
): CitizenState[] {
  const list = ensureCitizens(citizens, prng);
  return list.map((citizen) => stepCitizen(citizen, simMinute, prng));
}
