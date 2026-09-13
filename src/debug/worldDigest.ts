/**
 * Digest payload for WorldSnapshot — used in tests and GET_DIGEST worker command.
 * Includes event IDs (ordered) but not full event payloads to keep M00 gate stable.
 */
import type { DomainEvent } from '@/simulation/core/events';
import type { WorldSnapshot } from '@/simulation/core/toySim';
import { digestCanonical } from './digest';

export function digestWorldSnapshot(snapshot: WorldSnapshot): string {
  const payload: Record<string, unknown> = {
    schemaVersion: snapshot.schemaVersion,
    worldSeed: snapshot.worldSeed,
    branchId: snapshot.branchId,
    clock: snapshot.clock,
    prng: snapshot.prng,
    toy: snapshot.toy,
    eventIds: snapshot.events.map((event: DomainEvent) => event.id),
  };

  if (snapshot.citizens && snapshot.citizens.length > 0) {
    payload.citizens = snapshot.citizens.map((citizen) => ({
      id: citizen.id,
      needs: citizen.needs,
      position: citizen.position,
      currentFacilityId: citizen.currentFacilityId,
      activeAction: {
        kind: citizen.activeAction.kind,
        targetFacilityId: citizen.activeAction.targetFacilityId,
        elapsedMinutes: citizen.activeAction.elapsedMinutes,
        startedAtMinute: citizen.activeAction.startedAtMinute,
      },
      workMinutesToday: citizen.workMinutesToday,
    }));
  }

  return digestCanonical(payload);
}
