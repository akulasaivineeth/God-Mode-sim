/**
 * Simulation calendar — SIM-TIME-001 / SIM-TIME-004.
 *
 * Plain English: The authoritative simulation stores a single integer,
 * `simMinute`. Everything humans read on a clock — the hour, the day, the
 * month, the season, whether it is day or night — is DERIVED from that one
 * number here. Because the calendar is derived (never stored), it can never
 * drift out of sync with the counter, it does not bloat save files, and it does
 * not affect the determinism digest.
 *
 * Canonical mapping (spec §5.1): at 1× speed, 1 real second = 1 simulated
 * minute. Pacing (how fast simMinute advances in real time) is a main-thread
 * concern (see SimulationDriver); this module only interprets the counter.
 *
 * The month/year model is a deliberately simple, deterministic fictional
 * calendar (30-day months, 12-month years, 4 three-month seasons). It is not
 * the Gregorian calendar; the spec only requires coherent minutes→years and
 * seasons, not real-world date accuracy.
 */
import type { SimMinute } from './types';

export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_DAY = 24;
export const MINUTES_PER_DAY = MINUTES_PER_HOUR * HOURS_PER_DAY; // 1440
export const DAYS_PER_WEEK = 7;
export const DAYS_PER_MONTH = 30;
export const MONTHS_PER_YEAR = 12;
export const MONTHS_PER_SEASON = 3;
export const DAYS_PER_YEAR = DAYS_PER_MONTH * MONTHS_PER_YEAR; // 360

export const MINUTES_PER_WEEK = MINUTES_PER_DAY * DAYS_PER_WEEK;
export const MINUTES_PER_MONTH = MINUTES_PER_DAY * DAYS_PER_MONTH;
export const MINUTES_PER_YEAR = MINUTES_PER_DAY * DAYS_PER_YEAR;

/**
 * Display offset so simMinute 0 maps to a pleasant world start (Day 1, 06:00)
 * instead of midnight. This is a fixed world constant — deterministic and not
 * part of simulation state — so it never affects the digest.
 */
export const WORLD_START_OFFSET_MINUTES = 6 * MINUTES_PER_HOUR; // 360 → 06:00

export const MONTH_NAMES = [
  'Firstmonth',
  'Secondmonth',
  'Thirdmonth',
  'Fourthmonth',
  'Fifthmonth',
  'Sixthmonth',
  'Seventhmonth',
  'Eighthmonth',
  'Ninthmonth',
  'Tenthmonth',
  'Eleventhmonth',
  'Twelfthmonth',
] as const;

export const WEEKDAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

export const SEASON_NAMES: readonly Season[] = ['Spring', 'Summer', 'Autumn', 'Winter'];

/**
 * Derived, display-only view of the clock. Everything here is a pure function
 * of `simMinute` and the fixed world start offset.
 */
export interface CalendarView {
  /** Authoritative counter this view was derived from. */
  simMinute: SimMinute;
  /** Total displayed minutes including the world start offset. */
  displayMinute: number;
  minuteOfHour: number;
  hourOfDay: number;
  /** 0-based day since world start (offset-adjusted). */
  dayIndex: number;
  /** 1-based day within the current month. */
  dayOfMonth: number;
  weekdayIndex: number;
  weekday: (typeof WEEKDAY_NAMES)[number];
  monthIndex: number;
  monthName: (typeof MONTH_NAMES)[number];
  /** 1-based year (Year 1 at world start). */
  year: number;
  season: Season;
  /** Fraction of the current day in [0, 1): 0 = 00:00, 0.5 = 12:00. */
  timeOfDay: number;
  /** True during daylight hours (06:00 inclusive to 18:00 exclusive). */
  isDaytime: boolean;
  /** Zero-padded HH:MM string for display. */
  clockLabel: string;
}

export const DAY_START_HOUR = 6; // 06:00 sunrise boundary
export const NIGHT_START_HOUR = 18; // 18:00 sunset boundary

function floorDiv(value: number, divisor: number): number {
  return Math.floor(value / divisor);
}

function pad2(value: number): string {
  return value.toString().padStart(2, '0');
}

/**
 * SIM-TIME-001 / SIM-TIME-004 — Derive the full human-readable calendar from
 * the authoritative minute counter. Pure and deterministic.
 */
export function deriveCalendar(
  simMinute: SimMinute,
  startOffsetMinutes: number = WORLD_START_OFFSET_MINUTES,
): CalendarView {
  const displayMinute = simMinute + startOffsetMinutes;

  const minuteOfHour = displayMinute % MINUTES_PER_HOUR;
  const hourOfDay = floorDiv(displayMinute, MINUTES_PER_HOUR) % HOURS_PER_DAY;
  const dayIndex = floorDiv(displayMinute, MINUTES_PER_DAY);

  const dayOfYear = ((dayIndex % DAYS_PER_YEAR) + DAYS_PER_YEAR) % DAYS_PER_YEAR;
  const monthIndex = floorDiv(dayOfYear, DAYS_PER_MONTH);
  const dayOfMonth = (dayOfYear % DAYS_PER_MONTH) + 1;
  const year = floorDiv(dayIndex, DAYS_PER_YEAR) + 1;

  const weekdayIndex = ((dayIndex % DAYS_PER_WEEK) + DAYS_PER_WEEK) % DAYS_PER_WEEK;
  const seasonIndex = floorDiv(monthIndex, MONTHS_PER_SEASON) % SEASON_NAMES.length;

  const minuteWithinDay = ((displayMinute % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const timeOfDay = minuteWithinDay / MINUTES_PER_DAY;
  const isDaytime = hourOfDay >= DAY_START_HOUR && hourOfDay < NIGHT_START_HOUR;

  return {
    simMinute,
    displayMinute,
    minuteOfHour,
    hourOfDay,
    dayIndex,
    dayOfMonth,
    weekdayIndex,
    weekday: WEEKDAY_NAMES[weekdayIndex],
    monthIndex,
    monthName: MONTH_NAMES[monthIndex],
    year,
    season: SEASON_NAMES[seasonIndex],
    timeOfDay,
    isDaytime,
    clockLabel: `${pad2(hourOfDay)}:${pad2(minuteOfHour)}`,
  };
}
