import { describe, expect, it } from 'vitest';
import {
  DAYS_PER_MONTH,
  MINUTES_PER_DAY,
  MINUTES_PER_HOUR,
  MINUTES_PER_MONTH,
  MINUTES_PER_YEAR,
  WORLD_START_OFFSET_MINUTES,
  deriveCalendar,
} from '@/simulation/core/calendar';

/**
 * SIM-TIME-001 / SIM-TIME-004 — the calendar is a pure derivation of the
 * authoritative minute counter. These tests lock the minute→hour→day→month→
 * year→season mapping and the day/night boundary.
 */
describe('SIM-TIME-001 calendar derivation', () => {
  it('maps world start (simMinute 0) to Day 1, 06:00, Spring, Year 1', () => {
    const cal = deriveCalendar(0);
    expect(cal.hourOfDay).toBe(6);
    expect(cal.minuteOfHour).toBe(0);
    expect(cal.clockLabel).toBe('06:00');
    expect(cal.dayOfMonth).toBe(1);
    expect(cal.monthName).toBe('Firstmonth');
    expect(cal.year).toBe(1);
    expect(cal.season).toBe('Spring');
    expect(cal.weekday).toBe('Monday');
    expect(cal.isDaytime).toBe(true);
    expect(cal.timeOfDay).toBeCloseTo(0.25, 6);
  });

  it('rolls hours and minutes within a day', () => {
    const cal = deriveCalendar(90); // 06:00 + 90 min = 07:30
    expect(cal.clockLabel).toBe('07:30');
    expect(cal.hourOfDay).toBe(7);
    expect(cal.minuteOfHour).toBe(30);
  });

  it('advances the day at the day boundary', () => {
    const cal = deriveCalendar(MINUTES_PER_DAY);
    expect(cal.dayIndex).toBe(1);
    expect(cal.dayOfMonth).toBe(2);
    expect(cal.weekday).toBe('Tuesday');
    expect(cal.clockLabel).toBe('06:00');
  });

  it('advances months every 30 days', () => {
    const cal = deriveCalendar(MINUTES_PER_MONTH);
    expect(cal.monthName).toBe('Secondmonth');
    expect(cal.dayOfMonth).toBe(1);
  });

  it('advances the year every 12 months and resets the season to Spring', () => {
    const cal = deriveCalendar(MINUTES_PER_YEAR);
    expect(cal.year).toBe(2);
    expect(cal.monthName).toBe('Firstmonth');
    expect(cal.season).toBe('Spring');
  });

  it('assigns the four seasons across the year', () => {
    const spring = deriveCalendar(0, 0);
    const summer = deriveCalendar(3 * DAYS_PER_MONTH * MINUTES_PER_DAY, 0);
    const autumn = deriveCalendar(6 * DAYS_PER_MONTH * MINUTES_PER_DAY, 0);
    const winter = deriveCalendar(9 * DAYS_PER_MONTH * MINUTES_PER_DAY, 0);
    expect(spring.season).toBe('Spring');
    expect(summer.season).toBe('Summer');
    expect(autumn.season).toBe('Autumn');
    expect(winter.season).toBe('Winter');
  });
});

describe('SIM-TIME-004 day/night boundary', () => {
  it('is night before 06:00 and after 18:00, day between', () => {
    // Use a zero offset so simMinute maps directly to hour-of-day.
    const at = (hour: number) => deriveCalendar(hour * MINUTES_PER_HOUR, 0);
    expect(at(5).isDaytime).toBe(false);
    expect(at(6).isDaytime).toBe(true);
    expect(at(12).isDaytime).toBe(true);
    expect(at(17).isDaytime).toBe(true);
    expect(at(18).isDaytime).toBe(false);
    expect(at(23).isDaytime).toBe(false);
    expect(at(0).isDaytime).toBe(false);
  });

  it('reports timeOfDay as a [0,1) fraction of the day', () => {
    expect(deriveCalendar(0, 0).timeOfDay).toBeCloseTo(0, 6);
    expect(deriveCalendar(12 * MINUTES_PER_HOUR, 0).timeOfDay).toBeCloseTo(0.5, 6);
    expect(deriveCalendar(18 * MINUTES_PER_HOUR, 0).timeOfDay).toBeCloseTo(0.75, 6);
  });

  it('uses a 06:00 default world start offset', () => {
    expect(WORLD_START_OFFSET_MINUTES).toBe(360);
  });
});
