/**
 * M02 citizen lifecycle — NPC-ID-001 + per-minute autonomy.
 *
 * Plain English: builds the one citizen deterministically from the seed, then
 * advances them one simulated minute at a time — decaying needs, walking along
 * paths, performing actions, and deciding what to do next when free. Urgent needs
 * can interrupt the current action (Layer-1 reflex). Fully deterministic and
 * animation-independent (state depends only on simulated minutes).
 */
import type { RandomService } from '@/simulation/core/prng';
import type { Vec2 } from '@/world/townLayout';
import { decideAction } from './decision';
import { ACTION_LOCATION, LOCATIONS, NAV_NODES } from './locations';
import { ACTION_DURATION, initialNeeds, stepNeeds } from './needs';
import { pathWaypoints } from './pathfinding';
import type { ActionState, ActionType, CitizenState, Need } from './types';

export const WALK_SPEED = 2.5; // world units per simulated minute
const REFLEX_NEEDS: Need[] = ['bladder', 'thirst', 'energy', 'hunger'];
const CRITICAL_VALUE = 12;

const NEED_FOR_ACTION: Partial<Record<ActionType, Need>> = {
  eat: 'hunger',
  drink: 'thirst',
  toilet: 'bladder',
  sleep: 'energy',
  shower: 'hygiene',
};

function dist(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

export function createCitizen(prng: RandomService): CitizenState {
  const diligence = 40 + prng.int(0, 40);
  const discipline = 30 + prng.int(0, 40);
  return {
    id: 'citizen-noah',
    name: 'Noah',
    homeId: 'home',
    workId: 'work',
    storeId: 'store',
    position: { ...LOCATIONS.home.point },
    atNode: 'home',
    facing: 0,
    needs: initialNeeds(),
    personality: { diligence, discipline },
    action: null,
    lastDecision: null,
  };
}

/** Does the current action address a currently-critical reflex need? */
function currentActionServesCritical(citizen: CitizenState): boolean {
  const action = citizen.action;
  if (!action) return false;
  const served = NEED_FOR_ACTION[action.type];
  return served !== undefined && citizen.needs[served] <= CRITICAL_VALUE;
}

function hasCriticalNeed(citizen: CitizenState): Need | null {
  let worst: Need | null = null;
  let worstValue = CRITICAL_VALUE + 1;
  for (const need of REFLEX_NEEDS) {
    if (citizen.needs[need] <= CRITICAL_VALUE && citizen.needs[need] < worstValue) {
      worst = need;
      worstValue = citizen.needs[need];
    }
  }
  return worst;
}

function beginAction(citizen: CitizenState, action: ActionType, simMinute: number): ActionState {
  const targetId = ACTION_LOCATION[action];
  if (!targetId || targetId === citizen.atNode) {
    // Perform in place (idle or already at the right location).
    return {
      type: action,
      locationId: targetId ?? citizen.atNode,
      phase: 'perform',
      path: [],
      performUntil: simMinute + ACTION_DURATION[action],
    };
  }
  return {
    type: action,
    locationId: targetId,
    phase: 'travel',
    path: pathWaypoints(citizen.atNode, targetId),
    performUntil: 0,
  };
}

function advanceTravel(citizen: CitizenState): CitizenState {
  const action = citizen.action;
  if (!action || action.phase !== 'travel') return citizen;

  let remaining = WALK_SPEED;
  let pos: Vec2 = { ...citizen.position };
  let facing = citizen.facing;
  const path = action.path.map((p) => ({ ...p }));

  while (remaining > 0 && path.length > 0) {
    const target = path[0];
    const d = dist(pos, target);
    facing = Math.atan2(target.z - pos.z, target.x - pos.x);
    if (d <= remaining) {
      pos = { ...target };
      remaining -= d;
      path.shift();
    } else {
      const t = remaining / d;
      pos = { x: pos.x + (target.x - pos.x) * t, z: pos.z + (target.z - pos.z) * t };
      remaining = 0;
    }
  }

  if (path.length === 0) {
    // Arrived at the destination.
    return {
      ...citizen,
      position: { ...NAV_NODES[action.locationId] },
      atNode: action.locationId,
      facing,
      action: { ...action, phase: 'perform', path: [], performUntil: 0 },
    };
  }

  return { ...citizen, position: pos, facing, action: { ...action, path } };
}

/**
 * Advance the citizen by one simulated minute.
 * `simMinute` is the minute being entered; `hour` is the derived hour-of-day.
 */
export function stepCitizenMinute(
  citizen: CitizenState,
  simMinute: number,
  hour: number,
  prng: RandomService,
): CitizenState {
  // 1. Needs decay / action effects for this minute.
  let next: CitizenState = { ...citizen, needs: stepNeeds(citizen.needs, citizen.action) };

  // 2. Layer-1 reflex interruption: drop a non-critical action for a critical need.
  if (next.action && !currentActionServesCritical(next) && hasCriticalNeed(next)) {
    next = { ...next, action: null };
  }

  // 3. Progress the current action.
  if (next.action) {
    if (next.action.phase === 'travel') {
      next = advanceTravel(next);
      if (next.action && next.action.phase === 'perform' && next.action.performUntil === 0) {
        next = {
          ...next,
          action: { ...next.action, performUntil: simMinute + ACTION_DURATION[next.action.type] },
        };
      }
    } else if (next.action.phase === 'perform' && simMinute >= next.action.performUntil) {
      next = { ...next, action: null };
    }
  }

  // 4. Decide when idle.
  if (!next.action) {
    const { trace, selected } = decideAction(next, hour, prng);
    next = {
      ...next,
      action: beginAction(next, selected, simMinute),
      lastDecision: { ...trace, atMinute: simMinute },
    };
  }

  return next;
}
