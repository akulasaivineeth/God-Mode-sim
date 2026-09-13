import { describe, expect, it } from 'vitest';
import {
  ACTION_DURATION,
  initialNeeds,
  NEED_DECAY,
  pressure,
  stepNeeds,
} from '@/simulation/model/needs';
import type { ActionState } from '@/simulation/model/types';

/** NPC-NEED-001 — needs decay over time and are restored by actions. */
describe('NPC-NEED-001 needs dynamics', () => {
  it('decays all needs each minute when idle', () => {
    const before = initialNeeds();
    const after = stepNeeds(before, null);
    expect(after.hunger).toBeCloseTo(before.hunger - NEED_DECAY.hunger, 6);
    expect(after.thirst).toBeCloseTo(before.thirst - NEED_DECAY.thirst, 6);
    expect(after.energy).toBeLessThan(before.energy);
  });

  it('clamps needs into [0,100]', () => {
    const empty = { hunger: 0.05, thirst: 0.05, bladder: 0.05, energy: 0.05, hygiene: 0.05 };
    const after = stepNeeds(empty, null);
    for (const v of Object.values(after)) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
  });

  it('restores the target need while performing (eating raises fullness)', () => {
    const needs = { ...initialNeeds(), hunger: 40 };
    const eat: ActionState = { type: 'eat', locationId: 'store', phase: 'perform', path: [], performUntil: 100 };
    const after = stepNeeds(needs, eat);
    expect(after.hunger).toBeGreaterThan(needs.hunger);
  });

  it('sleep restores energy and does not decay energy', () => {
    const needs = { ...initialNeeds(), energy: 20 };
    const sleep: ActionState = { type: 'sleep', locationId: 'home', phase: 'perform', path: [], performUntil: 500 };
    const after = stepNeeds(needs, sleep);
    expect(after.energy).toBeGreaterThan(needs.energy);
  });

  it('drinking fills the bladder (side effect)', () => {
    const needs = { ...initialNeeds(), thirst: 30, bladder: 80 };
    const drink: ActionState = { type: 'drink', locationId: 'home', phase: 'perform', path: [], performUntil: 10 };
    const after = stepNeeds(needs, drink);
    expect(after.thirst).toBeGreaterThan(needs.thirst);
    expect(after.bladder).toBeLessThan(needs.bladder);
  });

  it('pressure is the inverse of satisfaction', () => {
    expect(pressure(100)).toBe(0);
    expect(pressure(30)).toBe(70);
  });

  it('has a positive perform duration for every action', () => {
    for (const d of Object.values(ACTION_DURATION)) {
      expect(d).toBeGreaterThan(0);
    }
  });
});
