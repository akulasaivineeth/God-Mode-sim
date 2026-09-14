import { describe, expect, it } from 'vitest';
import { SCHEMA_VERSION } from '@/shared/version';
import type { Need } from '@/simulation/model/types';
import { createCitizenWorld, stepCitizenWorld } from '@/simulation/model/world';

const SEED = 'GODMODE_M02_CANONICAL_2026';
const NEEDS: Need[] = ['hunger', 'thirst', 'bladder', 'energy', 'hygiene'];

/**
 * M02-GATE — the citizen must live autonomously for several simulated days with
 * no player commands: needs stay survivable, every action type is used, and it
 * never gets permanently stuck.
 */
describe('M02-GATE autonomous multi-day life', () => {
  it('survives 3 simulated days without deadlock or starvation', () => {
    let snapshot = createCitizenWorld(SEED, SCHEMA_VERSION);
    const minNeed: Record<Need, number> = { hunger: 100, thirst: 100, bladder: 100, energy: 100, hygiene: 100 };
    const maxNeed: Record<Need, number> = { hunger: 0, thirst: 0, bladder: 0, energy: 0, hygiene: 0 };
    const actionsSeen = new Set<string>();

    const minutes = 3 * 1440;
    for (let i = 0; i < minutes; i += 1) {
      snapshot = stepCitizenWorld(snapshot);
      const citizen = snapshot.citizens![0];
      for (const need of NEEDS) {
        minNeed[need] = Math.min(minNeed[need], citizen.needs[need]);
        maxNeed[need] = Math.max(maxNeed[need], citizen.needs[need]);
      }
      if (citizen.lastDecision) {
        actionsSeen.add(citizen.lastDecision.selected);
      }
    }

    // No need ever fully bottomed out (reflex kept the citizen alive).
    for (const need of NEEDS) {
      expect(minNeed[need]).toBeGreaterThan(0);
      // Each need was actively satisfied at some point (rose high again).
      expect(maxNeed[need]).toBeGreaterThan(70);
    }

    // Every routine + reflex action type was exercised across the days.
    for (const action of ['sleep', 'eat', 'drink', 'toilet', 'shower', 'work']) {
      expect(actionsSeen.has(action)).toBe(true);
    }

    // Still actively living (not stuck) at the end.
    expect(snapshot.citizens![0].action).not.toBeNull();
  });
});
