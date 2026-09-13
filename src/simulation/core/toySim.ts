/**
 * M00 toy simulation — determinism proof only, not gameplay.
 *
 * Plain English: Steps counters forward using the PRNG so tests can prove
 * same seed → same outcome. Replace toy logic with real systems in later
 * milestones without moving authority out of the worker.
 *
 * WorldSnapshot is the full authoritative state; never send this entire object
 * to React except for explicit save/export (ARCH-002).
 */
import { advanceClock, type SimulationClock } from './clock';
import { createDomainEvent, type DomainEvent } from './events';
import { Mulberry32Prng, type PrngState } from './prng';
import type { WorldSeed } from './types';

import type { CitizenState } from './citizens/types';

/** Minimal toy state — proves determinism only, not gameplay. */
export interface ToySimState {
  tickCount: number;
  accumulator: number;
  lastChoice: string;
  visualPhase: number;
  eventSequence: number;
}

export interface WorldSnapshot {
  schemaVersion: string;
  worldSeed: WorldSeed;
  branchId: string;
  clock: SimulationClock;
  prng: PrngState;
  toy: ToySimState;
  /** M02+ authoritative citizen records; omitted in pure M00 snapshots. */
  citizens?: CitizenState[];
  events: DomainEvent[];
}

export const DEFAULT_BRANCH_ID = 'main';

export function createInitialToyState(): ToySimState {
  return {
    tickCount: 0,
    accumulator: 0,
    lastChoice: 'init',
    visualPhase: 0,
    eventSequence: 0,
  };
}

export function createWorldSnapshot(
  worldSeed: WorldSeed,
  schemaVersion: string,
  branchId = DEFAULT_BRANCH_ID,
): WorldSnapshot {
  const prng = new Mulberry32Prng(worldSeed);
  return {
    schemaVersion,
    worldSeed,
    branchId,
    clock: { simMinute: 0 },
    prng: prng.snapshot(),
    toy: createInitialToyState(),
    events: [
      createDomainEvent({
        id: 'evt_init',
        branchId,
        simTime: 0,
        type: 'TOY_WORLD_INITIALIZED',
        actorIds: ['toy-system'],
        payload: { worldSeed },
        visibility: 'god-only',
      }),
    ],
  };
}

export function restorePrngFromSnapshot(snapshot: WorldSnapshot): Mulberry32Prng {
  return new Mulberry32Prng(snapshot.prng);
}

export interface ToyStepResult {
  snapshot: WorldSnapshot;
  emittedEvent?: DomainEvent;
}

const TOY_CHOICES = [
  { value: 'alpha', weight: 3 },
  { value: 'beta', weight: 2 },
  { value: 'gamma', weight: 1 },
];

/** Deterministic single-step toy simulation. */
export function stepToySimulation(snapshot: WorldSnapshot): ToyStepResult {
  const prng = restorePrngFromSnapshot(snapshot);
  const choice = prng.weightedChoice(TOY_CHOICES);
  const increment = prng.int(1, 5);
  const nextSequence = snapshot.toy.eventSequence + 1;
  const nextSimMinute = snapshot.clock.simMinute + 1;

  const nextToy: ToySimState = {
    tickCount: snapshot.toy.tickCount + 1,
    accumulator: snapshot.toy.accumulator + increment,
    lastChoice: choice,
    visualPhase: prng.nextFloat(),
    eventSequence: nextSequence,
  };

  const emittedEvent = createDomainEvent({
    id: `evt_toy_${nextSequence}`,
    branchId: snapshot.branchId,
    simTime: nextSimMinute,
    type: 'TOY_STEP',
    actorIds: ['toy-system'],
    payload: {
      choice,
      increment,
      accumulator: nextToy.accumulator,
    },
  });

  const nextSnapshot: WorldSnapshot = {
    ...snapshot,
    clock: advanceClock(snapshot.clock),
    prng: prng.snapshot(),
    toy: nextToy,
    events: [...snapshot.events, emittedEvent],
  };

  return { snapshot: nextSnapshot, emittedEvent };
}

export function runToySteps(snapshot: WorldSnapshot, steps: number): WorldSnapshot {
  let current = snapshot;
  for (let i = 0; i < steps; i += 1) {
    current = stepToySimulation(current).snapshot;
  }
  return current;
}
