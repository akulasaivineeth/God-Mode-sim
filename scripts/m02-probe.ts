import { MINUTES_PER_DAY } from '../src/simulation/core/calendar';
import { createM02WorldSnapshot } from '../src/simulation/core/m02Init';
import { runWorldSteps } from '../src/simulation/core/worldStep';
import { SCHEMA_VERSION } from '../src/shared/version';
import { digestWorldSnapshot } from '../src/debug/worldDigest';
import { runToySteps, createWorldSnapshot } from '../src/simulation/core/toySim';

const M02_SEED = 'GODMODE_M02_CANONICAL_2026';
const M00_SEED = 'GODMODE_M00_CANONICAL_2026';

const snapshot = runWorldSteps(createM02WorldSnapshot(M02_SEED, SCHEMA_VERSION), MINUTES_PER_DAY * 3);
const counts: Record<string, number> = {};
for (const event of snapshot.events) {
  if (event.type === 'CITIZEN_ACTION_SELECTED') {
    const action = (event.payload as { action?: string }).action;
    if (action) counts[action] = (counts[action] ?? 0) + 1;
  }
}
const m00 = digestWorldSnapshot(runToySteps(createWorldSnapshot(M00_SEED, 'm00.1'), 100));
console.log(JSON.stringify({ histogram: counts, m00Digest: m00 }, null, 2));
