import { describe, expect, it } from 'vitest';
import { SCHEMA_VERSION } from '@/shared/version';
import { createCitizenWorld, stepCitizenWorld } from '@/simulation/model/world';
import { toRenderSnapshot } from '@/rendering/types';

const SEED = 'GODMODE_M02_CANONICAL_2026';

/** Minutes used by scripts/capture-m02-closure-evidence.mjs — keep in sync. */
export const CANONICAL_EVIDENCE_MINUTES = {
  firstDaytimeStoreEatPerform: 2057,
  firstDaytimeWorkPerform: 506,
  firstDaytimeWalkTravel: 481,
} as const;

function scanSchedule(maxMinutes = 2880) {
  let world = createCitizenWorld(SEED, SCHEMA_VERSION);
  let firstDaytimeStoreEatPerform: number | null = null;
  let firstDaytimeWorkPerform: number | null = null;
  let firstDaytimeWalkTravel: number | null = null;

  for (let i = 0; i < maxMinutes; i += 1) {
    world = stepCitizenWorld(world);
    const snap = toRenderSnapshot(world);
    const c = snap.citizens[0]!;
    if (!snap.isDaytime) continue;
    if (
      firstDaytimeStoreEatPerform === null &&
      /Eating at the Store/i.test(c.activity) &&
      c.pose === 'sit'
    ) {
      firstDaytimeStoreEatPerform = snap.simMinute;
    }
    if (firstDaytimeWorkPerform === null && /^Working$/i.test(c.activity) && c.pose === 'work') {
      firstDaytimeWorkPerform = snap.simMinute;
    }
    if (
      firstDaytimeWalkTravel === null &&
      /Walking/i.test(c.activity) &&
      c.pose === 'walk'
    ) {
      firstDaytimeWalkTravel = snap.simMinute;
    }
  }

  return { firstDaytimeStoreEatPerform, firstDaytimeWorkPerform, firstDaytimeWalkTravel };
}

describe('M02 canonical evidence schedule', () => {
  it('pins deterministic seek minutes for the capture harness', () => {
    const schedule = scanSchedule();
    expect(schedule.firstDaytimeStoreEatPerform).toBe(CANONICAL_EVIDENCE_MINUTES.firstDaytimeStoreEatPerform);
    expect(schedule.firstDaytimeWorkPerform).toBe(CANONICAL_EVIDENCE_MINUTES.firstDaytimeWorkPerform);
    expect(schedule.firstDaytimeWalkTravel).toBe(CANONICAL_EVIDENCE_MINUTES.firstDaytimeWalkTravel);
  });
});
