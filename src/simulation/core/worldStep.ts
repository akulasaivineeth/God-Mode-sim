/**
 * Unified simulation step — M02 extends M00 toy proof without breaking its digest.
 *
 * Plain English: Each simulated minute advances the clock once, runs the toy
 * counters (M00 regression lock), then updates citizens when present.
 */
import { advanceClock } from './clock';
import { createDomainEvent } from './events';
import { restorePrngFromSnapshot } from './toySim';
import type { WorldSnapshot } from './toySim';
import { stepCitizens } from './citizens/citizenStep';
import { M02_CANONICAL_CITIZEN_ID } from './citizens/createCitizen';

const TOY_CHOICES = [
  { value: 'alpha', weight: 3 },
  { value: 'beta', weight: 2 },
  { value: 'gamma', weight: 1 },
];

export interface WorldStepResult {
  snapshot: WorldSnapshot;
  emittedEvents: ReturnType<typeof createDomainEvent>[];
}

export function stepWorldSimulation(snapshot: WorldSnapshot): WorldStepResult {
  const prng = restorePrngFromSnapshot(snapshot);
  const nextSequence = snapshot.toy.eventSequence + 1;
  const nextSimMinute = snapshot.clock.simMinute + 1;

  const choice = prng.weightedChoice(TOY_CHOICES);
  const increment = prng.int(1, 5);

  const nextToy = {
    tickCount: snapshot.toy.tickCount + 1,
    accumulator: snapshot.toy.accumulator + increment,
    lastChoice: choice,
    visualPhase: prng.nextFloat(),
    eventSequence: nextSequence,
  };

  const citizens = snapshot.citizens
    ? stepCitizens(snapshot.citizens, nextSimMinute, prng)
    : undefined;

  const emittedEvents = [
    createDomainEvent({
      id: `evt_toy_${nextSequence}`,
      branchId: snapshot.branchId,
      simTime: nextSimMinute,
      type: 'TOY_STEP',
      actorIds: ['toy-system'],
      payload: { choice, increment, accumulator: nextToy.accumulator },
    }),
  ];

  if (citizens && citizens.length > 0) {
    const citizen = citizens[0];
    if (citizen.lastUtilityTrace && citizen.lastUtilityTrace.simMinute === nextSimMinute) {
      emittedEvents.push(
        createDomainEvent({
          id: `evt_citizen_decision_${nextSequence}`,
          branchId: snapshot.branchId,
          simTime: nextSimMinute,
          type: 'CITIZEN_ACTION_SELECTED',
          actorIds: [M02_CANONICAL_CITIZEN_ID],
          locationId: citizen.currentFacilityId ?? undefined,
          payload: {
            action: citizen.lastUtilityTrace.selectedAction,
            targetFacilityId: citizen.lastUtilityTrace.targetFacilityId,
            trace: citizen.lastUtilityTrace,
          },
          causes: ['utility-scoring'],
        }),
      );
    }
  }

  const nextSnapshot: WorldSnapshot = {
    ...snapshot,
    clock: advanceClock(snapshot.clock),
    prng: prng.snapshot(),
    toy: nextToy,
    citizens,
    events: [...snapshot.events, ...emittedEvents],
  };

  return { snapshot: nextSnapshot, emittedEvents };
}

export function runWorldSteps(snapshot: WorldSnapshot, steps: number): WorldSnapshot {
  let current = snapshot;
  for (let i = 0; i < steps; i += 1) {
    current = stepWorldSimulation(current).snapshot;
  }
  return current;
}

