/**
 * M02 citizen world — authoritative create/step (worker-owned).
 *
 * Plain English: builds the world that contains the one citizen and advances it
 * one simulated minute per step. Reuses the shared WorldSnapshot (clock + PRNG +
 * events) so saves and the M01 time model keep working; the M00 toy state is left
 * untouched/static (its golden digest is preserved separately).
 *
 * Determinism: every step restores the seeded PRNG, advances exactly one minute,
 * and snapshots the PRNG back — so state depends only on the number of minutes
 * stepped, never on real-time pacing or rendering (ARCH-003/005).
 */
import { advanceClock } from '@/simulation/core/clock';
import { deriveCalendar } from '@/simulation/core/calendar';
import { createDomainEvent } from '@/simulation/core/events';
import { Mulberry32Prng } from '@/simulation/core/prng';
import {
  createInitialToyState,
  DEFAULT_BRANCH_ID,
  type WorldSnapshot,
} from '@/simulation/core/toySim';
import { createCitizen, stepCitizenMinute } from './citizen';

export function createCitizenWorld(
  seed: string,
  schemaVersion: string,
  branchId = DEFAULT_BRANCH_ID,
): WorldSnapshot {
  const prng = new Mulberry32Prng(seed);
  const citizen = createCitizen(prng);
  return {
    schemaVersion,
    worldSeed: seed,
    branchId,
    clock: { simMinute: 0 },
    prng: prng.snapshot(),
    toy: createInitialToyState(),
    events: [
      createDomainEvent({
        id: 'evt_citizen_init',
        branchId,
        simTime: 0,
        type: 'CITIZEN_WORLD_INITIALIZED',
        actorIds: [citizen.id],
        payload: { seed },
        visibility: 'god-only',
      }),
    ],
    citizens: [citizen],
  };
}

/** Advance the citizen world by exactly one simulated minute. */
export function stepCitizenWorld(snapshot: WorldSnapshot): WorldSnapshot {
  const prng = new Mulberry32Prng(snapshot.prng);
  const nextMinute = snapshot.clock.simMinute + 1;
  const hour = deriveCalendar(nextMinute).hourOfDay;

  const citizens = (snapshot.citizens ?? []).map((citizen) =>
    stepCitizenMinute(citizen, nextMinute, hour, prng),
  );

  // Emit a domain event for citizens that made a fresh decision this minute
  // (meaningful state changes only — not every minute).
  let events = snapshot.events;
  const decided = citizens.filter((c) => c.lastDecision?.atMinute === nextMinute);
  if (decided.length > 0) {
    events = [
      ...events,
      ...decided.map((c) =>
        createDomainEvent({
          id: `evt_dec_${c.id}_${nextMinute}`,
          branchId: snapshot.branchId,
          simTime: nextMinute,
          type: 'CITIZEN_DECISION',
          actorIds: [c.id],
          payload: { selected: c.lastDecision!.selected, layer: c.lastDecision!.layer },
        }),
      ),
    ];
  }

  return {
    ...snapshot,
    clock: advanceClock(snapshot.clock),
    prng: prng.snapshot(),
    citizens,
    events,
  };
}

export function runCitizenSteps(snapshot: WorldSnapshot, steps: number): WorldSnapshot {
  let current = snapshot;
  for (let i = 0; i < steps; i += 1) {
    current = stepCitizenWorld(current);
  }
  return current;
}
