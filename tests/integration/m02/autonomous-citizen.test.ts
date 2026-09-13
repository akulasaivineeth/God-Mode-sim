import { describe, expect, it } from 'vitest';
import { MINUTES_PER_DAY } from '@/simulation/core/calendar';
import { M02_CANONICAL_CITIZEN_ID } from '@/simulation/core/citizens/createCitizen';
import { createM02WorldSnapshot } from '@/simulation/core/m02Init';
import { runWorldSteps } from '@/simulation/core/worldStep';
import { SCHEMA_VERSION } from '@/shared/version';

const M02_SEED = 'GODMODE_M02_CANONICAL_2026';

describe('M02-GATE autonomous citizen', () => {
  it('completes three simulated days without player commands or deadlock', () => {
    const snapshot = runWorldSteps(createM02WorldSnapshot(M02_SEED, SCHEMA_VERSION), MINUTES_PER_DAY * 3);
    const citizen = snapshot.citizens?.[0];
    expect(citizen).toBeDefined();
    expect(citizen!.id).toBe(M02_CANONICAL_CITIZEN_ID);
    expect(snapshot.clock.simMinute).toBe(MINUTES_PER_DAY * 3);

    const actions = new Set<string>();
    for (const event of snapshot.events) {
      if (event.type === 'CITIZEN_ACTION_SELECTED') {
        const payload = event.payload as { action?: string };
        if (payload.action) actions.add(payload.action);
      }
    }

    expect(actions.has('sleep')).toBe(true);
    expect(actions.has('eat') || actions.has('shop')).toBe(true);
    expect(actions.has('work')).toBe(true);
    expect(citizen!.needs.hunger).toBeLessThan(95);
    expect(citizen!.needs.energy).toBeGreaterThan(5);
  });

  it('records utility score traces for inspector review', () => {
    const snapshot = runWorldSteps(createM02WorldSnapshot(M02_SEED, SCHEMA_VERSION), 240);
    const citizen = snapshot.citizens?.[0];
    expect(citizen?.lastUtilityTrace).not.toBeNull();
    expect(citizen?.lastUtilityTrace?.candidates.length).toBeGreaterThan(0);
    expect(citizen?.lastUtilityTrace?.candidates[0].contributors.length).toBeGreaterThan(0);
  });
});
