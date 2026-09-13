import { describe, expect, it } from 'vitest';
import { MINUTES_PER_DAY } from '@/simulation/core/calendar';
import { createM02Citizen } from '@/simulation/core/citizens/createCitizen';
import { buildLayer2Candidates } from '@/simulation/core/citizens/utility';
import { Mulberry32Prng } from '@/simulation/core/prng';

describe('M02 utility candidates', () => {
  it('includes proactive toilet candidate when bladder is elevated', () => {
    const prng = new Mulberry32Prng('test');
    const citizen = createM02Citizen(prng);
    citizen.needs.bladder = 55;
    const candidates = buildLayer2Candidates(citizen, 600);
    expect(candidates.some((entry) => entry.action === 'use_toilet')).toBe(true);
  });

  it('filters to sleep, drink, and toilet at night', () => {
    const prng = new Mulberry32Prng('test');
    const citizen = createM02Citizen(prng);
    citizen.needs.bladder = 55;
    const nightMinute = MINUTES_PER_DAY + 23 * 60;
    const candidates = buildLayer2Candidates(citizen, nightMinute);
    const actions = new Set(candidates.map((entry) => entry.action));
    expect(actions.has('sleep')).toBe(true);
    expect(actions.has('drink')).toBe(true);
    expect(actions.has('use_toilet')).toBe(true);
    expect(actions.has('work')).toBe(false);
  });
});
