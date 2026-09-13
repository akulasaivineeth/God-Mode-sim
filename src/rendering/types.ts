/**
 * Render snapshot boundary — ADR-003 / ARCH-002.
 *
 * Plain English: The 3D layer may only read these fields. It must never write
 * back into simulation state. M02 exposes a compact, read-only citizen list
 * (position, facing, pose, activity, needs, last decision). Full internal state
 * stays in the worker.
 */
import { deriveCalendar, type CalendarView } from '@/simulation/core/calendar';
import type { WorldSnapshot } from '@/simulation/core/toySim';
import type { SimMinute } from '@/simulation/core/types';
import type { ActionType, DecisionTrace, NeedsState } from '@/simulation/model/types';
import { poseForAction, type CitizenPose } from './citizenPresentation';

export interface RenderCitizen {
  id: string;
  name: string;
  x: number;
  z: number;
  facingRadians: number;
  pose: CitizenPose;
  action: ActionType;
  phase: 'travel' | 'perform' | 'idle';
  /** Human-readable current-activity label (inspector + labels). */
  activity: string;
  needs: NeedsState;
  lastDecision: DecisionTrace | null;
}

export interface RenderSnapshot {
  simMinute: SimMinute;
  visualPhase: number;
  tickCount: number;
  lastChoice: string;
  accumulator: number;
  calendar: CalendarView;
  timeOfDay: number;
  isDaytime: boolean;
  citizens: RenderCitizen[];
}

const LOCATION_LABEL: Record<string, string> = {
  home: 'Home',
  store: 'the Store',
  work: 'the Workshop',
};

const PERFORM_LABEL: Record<ActionType, string> = {
  sleep: 'Sleeping',
  eat: 'Eating at the Store',
  drink: 'Drinking at Home',
  toilet: 'Using the bathroom',
  shower: 'Showering',
  work: 'Working',
  idle: 'Relaxing',
};

function activityLabel(
  action: ActionType,
  phase: 'travel' | 'perform' | 'idle',
  locationId: string,
): string {
  if (phase === 'travel') {
    return `Walking to ${LOCATION_LABEL[locationId] ?? locationId}`;
  }
  return PERFORM_LABEL[action];
}

export function toRenderSnapshot(
  input: Pick<WorldSnapshot, 'clock' | 'toy' | 'citizens'>,
): RenderSnapshot {
  const calendar = deriveCalendar(input.clock.simMinute);
  const citizens: RenderCitizen[] = (input.citizens ?? []).map((c) => {
    const action = c.action?.type ?? 'idle';
    const phase: 'travel' | 'perform' | 'idle' = c.action ? c.action.phase : 'idle';
    const locationId = c.action?.locationId ?? c.atNode;
    return {
      id: c.id,
      name: c.name,
      x: c.position.x,
      z: c.position.z,
      facingRadians: c.facing,
      pose: poseForAction(action, phase),
      action,
      phase,
      activity: c.action ? activityLabel(action, phase, locationId) : 'Idle',
      needs: c.needs,
      lastDecision: c.lastDecision,
    };
  });

  return {
    simMinute: input.clock.simMinute,
    visualPhase: input.toy.visualPhase,
    tickCount: input.toy.tickCount,
    lastChoice: input.toy.lastChoice,
    accumulator: input.toy.accumulator,
    calendar,
    timeOfDay: calendar.timeOfDay,
    isDaytime: calendar.isDaytime,
    citizens,
  };
}
