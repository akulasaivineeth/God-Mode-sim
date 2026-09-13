/**
 * Digest payload for WorldSnapshot — used in tests and GET_DIGEST worker command.
 * Includes event IDs (ordered) but not full event payloads to keep M00 gate stable.
 */
import type { DomainEvent } from '@/simulation/core/events';
import type { WorldSnapshot } from '@/simulation/core/toySim';
import { digestCanonical } from './digest';

export function digestWorldSnapshot(snapshot: WorldSnapshot): string {
  const payload = {
    schemaVersion: snapshot.schemaVersion,
    worldSeed: snapshot.worldSeed,
    branchId: snapshot.branchId,
    clock: snapshot.clock,
    prng: snapshot.prng,
    toy: snapshot.toy,
    eventIds: snapshot.events.map((event: DomainEvent) => event.id),
  };
  return digestCanonical(payload);
}

/**
 * M02 citizen-world digest. Hashes the authoritative citizen state + clock + PRNG
 * so determinism/high-speed-independence tests can prove same-minutes → same
 * world. Kept separate from `digestWorldSnapshot` so the M00 golden digest
 * (`fac095d1`) is never affected by citizen state.
 */
export function digestCitizenWorld(snapshot: WorldSnapshot): string {
  const payload = {
    schemaVersion: snapshot.schemaVersion,
    worldSeed: snapshot.worldSeed,
    branchId: snapshot.branchId,
    clock: snapshot.clock,
    prng: snapshot.prng,
    citizens: snapshot.citizens ?? [],
    eventCount: snapshot.events.length,
  };
  return digestCanonical(payload);
}
