/**
 * Render snapshot boundary — ADR-003 / ARCH-002.
 *
 * Plain English: The 3D layer may only read these fields. It must never write
 * back into simulation state. M02 adds a compact, read-only `citizen` summary
 * (position, action label, needs, and the last decision trace for the inspector);
 * full internal state stays in the worker.
 */
import { deriveCalendar, type CalendarView } from '@/simulation/core/calendar';
import type { WorldSnapshot } from '@/simulation/core/toySim';
import type { SimMinute } from '@/simulation/core/types';
import type { ActionType, DecisionTrace, NeedsState } from '@/simulation/model/types';
import type { Vec2 } from '@/world/townLayout';

export interface RenderCitizen {
  id: string;
  name: string;
  position: Vec2;
  facing: number;
  action: ActionType;
  phase: 'travel' | 'perform' | 'idle';
  /** Human-readable current-activity label. */
  activity: string;
  needs: NeedsState;
  lastDecision: DecisionTrace | null;
}

/** Read-only render DTO — no simulation authority. */
export interface RenderSnapshot {
  simMinute: SimMinute;
  visualPhase: number;
  tickCount: number;
  lastChoice: string;
  accumulator: number;
  calendar: CalendarView;
  timeOfDay: number;
  isDaytime: boolean;
  citizen: RenderCitizen | null;
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

export function toRenderSnapshot(input: Pick<WorldSnapshot, 'clock' | 'toy' | 'citizens'>): RenderSnapshot {
  const calendar = deriveCalendar(input.clock.simMinute);
  const first = input.citizens?.[0] ?? null;
  const citizen: RenderCitizen | null = first
    ? {
        id: first.id,
        name: first.name,
        position: first.position,
        facing: first.facing,
        action: first.action?.type ?? 'idle',
        phase: first.action ? first.action.phase : 'idle',
        activity: first.action
          ? activityLabel(first.action.type, first.action.phase, first.action.locationId)
          : 'Idle',
        needs: first.needs,
        lastDecision: first.lastDecision,
      }
    : null;

  return {
    simMinute: input.clock.simMinute,
    visualPhase: input.toy.visualPhase,
    tickCount: input.toy.tickCount,
    lastChoice: input.toy.lastChoice,
    accumulator: input.toy.accumulator,
    calendar,
    timeOfDay: calendar.timeOfDay,
    isDaytime: calendar.isDaytime,
    citizen,
  };
}
