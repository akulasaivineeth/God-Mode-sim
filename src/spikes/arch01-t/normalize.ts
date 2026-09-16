import { canonicalize } from '@/debug/canonicalize';
import type { ObjectiveHousehold, ObjectivePerson } from './schema/objectiveTruth.js';
import type { SpikeDomainEvent } from './schema/spikeEvents.js';

export interface SpikeTNormalizedInput {
  people: ObjectivePerson[];
  households: ObjectiveHousehold[];
  events: SpikeDomainEvent[];
}

export function normalizeSpikeTOutput(input: SpikeTNormalizedInput): string {
  const sortedPeople = [...input.people].sort((a, b) => a.id.localeCompare(b.id));
  const sortedHouseholds = [...input.households].sort((a, b) => a.id.localeCompare(b.id));
  const sortedEvents = [...input.events].sort((a, b) => a.id.localeCompare(b.id));

  return canonicalize({
    events: sortedEvents,
    households: sortedHouseholds,
    people: sortedPeople,
  });
}
