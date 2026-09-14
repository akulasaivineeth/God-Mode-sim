import { describe, expect, it } from 'vitest';
import { Mulberry32Prng } from '@/simulation/core/prng';
import { createCitizen, stepCitizenMinute } from '@/simulation/model/citizen';

/** NPC-ID-001 — deterministic citizen generation + stepping. */
describe('NPC-ID-001 citizen', () => {
  it('generates deterministically from the seed', () => {
    const a = createCitizen(new Mulberry32Prng('same'));
    const b = createCitizen(new Mulberry32Prng('same'));
    expect(a).toEqual(b);
    const c = createCitizen(new Mulberry32Prng('other'));
    expect(c.personality).not.toEqual(a.personality);
  });

  it('starts at home with an identity and needs', () => {
    const c = createCitizen(new Mulberry32Prng('id'));
    expect(c.id).toBeTruthy();
    expect(c.atNode).toBe('home');
    expect(c.action).toBeNull();
    expect(Object.keys(c.needs)).toHaveLength(5);
  });

  it('chooses an action on the first step and progresses over time', () => {
    const prng = new Mulberry32Prng('step');
    let c = createCitizen(prng);
    c = stepCitizenMinute(c, 1, 6, prng);
    expect(c.action).not.toBeNull();
    // Run a while; the citizen must keep acting (never permanently idle/stuck).
    for (let m = 2; m < 400; m += 1) {
      c = stepCitizenMinute(c, m, Math.floor((m / 60) % 24), prng);
    }
    expect(c.action).not.toBeNull();
    expect(c.lastDecision).not.toBeNull();
  });
});
