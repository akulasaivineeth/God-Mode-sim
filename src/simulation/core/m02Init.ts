/**
 * M02 world bootstrap — creates the single canonical citizen world.
 */
import { createDomainEvent } from './events';
import { Mulberry32Prng } from './prng';
import { createInitialToyState, DEFAULT_BRANCH_ID, type WorldSnapshot } from './toySim';
import { createM02Citizen } from './citizens/createCitizen';

export function createM02WorldSnapshot(
  worldSeed: string,
  schemaVersion: string,
  branchId = DEFAULT_BRANCH_ID,
): WorldSnapshot {
  const prng = new Mulberry32Prng(worldSeed);
  const citizen = createM02Citizen(prng);

  return {
    schemaVersion,
    worldSeed,
    branchId,
    clock: { simMinute: 0 },
    prng: prng.snapshot(),
    toy: createInitialToyState(),
    citizens: [citizen],
    events: [
      createDomainEvent({
        id: 'evt_init',
        branchId,
        simTime: 0,
        type: 'WORLD_INITIALIZED',
        actorIds: ['world-system'],
        payload: { worldSeed, citizenId: citizen.id },
        visibility: 'god-only',
      }),
    ],
  };
}
