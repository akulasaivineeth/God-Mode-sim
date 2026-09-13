import { describe, expect, it } from 'vitest';
import { Mulberry32Prng } from '@/simulation/core/prng';
import { createCitizen } from '@/simulation/model/citizen';
import { decideAction } from '@/simulation/model/decision';
import type { CitizenState } from '@/simulation/model/types';

function citizenWith(overrides: Partial<CitizenState>): CitizenState {
  const base = createCitizen(new Mulberry32Prng('gen'));
  return { ...base, ...overrides, needs: { ...base.needs, ...(overrides.needs ?? {}) } };
}

/** NPC-DEC-001 / NPC-DEC-010 — layered utility decisions with a trace. */
describe('NPC-DEC decision architecture', () => {
  it('Layer-1 reflex: a critical need overrides routine', () => {
    const citizen = citizenWith({ needs: { hunger: 70, thirst: 70, bladder: 5, energy: 70, hygiene: 70 } });
    const { trace, selected } = decideAction(citizen, 10, new Mulberry32Prng('r'));
    expect(selected).toBe('toilet');
    expect(trace.layer).toBe('reflex');
  });

  it('routine: chooses sleep at night when tired', () => {
    const citizen = citizenWith({ needs: { hunger: 70, thirst: 70, bladder: 70, energy: 35, hygiene: 70 } });
    const { trace, selected } = decideAction(citizen, 23, new Mulberry32Prng('n'));
    expect(selected).toBe('sleep');
    expect(trace.layer).toBe('routine');
  });

  it('competing need vs goal: defers a moderate need to work during work hours (UAT-NPC-002)', () => {
    const citizen = citizenWith({
      personality: { diligence: 85, discipline: 60 },
      needs: { hunger: 55, thirst: 70, bladder: 70, energy: 70, hygiene: 70 },
    });
    const { selected, trace } = decideAction(citizen, 10, new Mulberry32Prng('w'));
    expect(selected).toBe('work');
    // Eating was a real option but scored lower — the need did not force action.
    expect(trace.candidates.some((c) => c.action === 'eat')).toBe(true);
  });

  it('produces a full inspectable candidate set with factor breakdowns', () => {
    const citizen = citizenWith({});
    const { trace } = decideAction(citizen, 12, new Mulberry32Prng('t'));
    expect(trace.candidates).toHaveLength(7);
    for (const c of trace.candidates) {
      expect(c.factors.length).toBeGreaterThan(0);
    }
    expect(trace.candidates.some((c) => c.action === trace.selected)).toBe(true);
  });
});
