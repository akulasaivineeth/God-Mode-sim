/**
 * Render snapshot boundary — ADR-003 / ARCH-002.
 *
 * Plain English: The 3D layer may only read these fields. It must never write
 * back into simulation state. visualPhase is 0..1 and drives placeholder motion only.
 *
 * M01 adds a derived, display-only `calendar` plus `timeOfDay`/`isDaytime` so
 * the renderer can draw day/night lighting and the HUD can show the date/clock.
 * These are pure derivations of the authoritative `simMinute` (see calendar.ts);
 * the renderer still cannot influence simulation truth.
 */
import { deriveCalendar, type CalendarView } from '@/simulation/core/calendar';
import type { SimMinute } from '@/simulation/core/types';

/** Read-only render DTO — no simulation authority. */
export interface RenderSnapshot {
  simMinute: SimMinute;
  visualPhase: number;
  tickCount: number;
  lastChoice: string;
  accumulator: number;
  /** Derived calendar (display only). */
  calendar: CalendarView;
  /** Fraction of the current day in [0,1) — drives day/night lighting. */
  timeOfDay: number;
  isDaytime: boolean;
}

export function toRenderSnapshot(input: {
  clock: { simMinute: SimMinute };
  toy: {
    visualPhase: number;
    tickCount: number;
    lastChoice: string;
    accumulator: number;
  };
}): RenderSnapshot {
  const calendar = deriveCalendar(input.clock.simMinute);
  return {
    simMinute: input.clock.simMinute,
    visualPhase: input.toy.visualPhase,
    tickCount: input.toy.tickCount,
    lastChoice: input.toy.lastChoice,
    accumulator: input.toy.accumulator,
    calendar,
    timeOfDay: calendar.timeOfDay,
    isDaytime: calendar.isDaytime,
  };
}
