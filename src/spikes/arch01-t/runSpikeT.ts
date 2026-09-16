import { createPopulationRng, worldSeedNumeric } from './adapters/seedAdapter.js';
import { restoreSpikeRng } from './adapters/rngAdapter.js';
import {
  facilityIdForDrawSlot,
  householdIdForDrawSlot,
  personIdFromTownBox,
  SPIKE_HOUSE_COUNT,
} from './adapters/idAdapter.js';
import { TICKS_PER_YEAR, tickToSimMinute } from './adapters/timeAdapter.js';
import { normalizeSpikeTOutput } from './normalize.js';
import type { ObjectiveHousehold, ObjectivePerson } from './schema/objectiveTruth.js';
import { SpikeEventLog } from './schema/spikeEvents.js';
import { DEFAULT_DRAW_PARAMS, selectHousehold } from './vendor/townbox/householdDraw.js';
import { DEFAULT_POPULATION_PARAMS, generatePopulation } from './vendor/townbox/populationGenerate.js';
import type { GenPerson, PopulationState } from './vendor/townbox/types/genealogy.js';

export const SPIKE_T_CANONICAL_SEED = 'GODMODE_SPIKE_T_CANONICAL_2026';
export const SPIKE_HOUSE_CAPACITY = 4;

export interface SpikeTResult {
  normalized: string;
  eventSequence: ReturnType<SpikeEventLog['all']>;
  personTable: Record<string, ObjectivePerson>;
  householdTable: ObjectiveHousehold[];
}

function toObjectivePerson(person: GenPerson): ObjectivePerson {
  return {
    id: personIdFromTownBox(person.id),
    givenName: person.firstName,
    familyName: person.familyName,
    gender: person.gender,
    birthSimMinute: tickToSimMinute(person.birthTick),
    deathSimMinute: person.deathTick === null ? null : tickToSimMinute(person.deathTick),
    fatherId: person.fatherId ? personIdFromTownBox(person.fatherId) : null,
    motherId: person.motherId ? personIdFromTownBox(person.motherId) : null,
    partnerships: person.partnerships.map((partnership) => ({
      partnerId: personIdFromTownBox(partnership.partnerId),
      startSimMinute: tickToSimMinute(partnership.startTick),
      endSimMinute: partnership.endTick === null ? null : tickToSimMinute(partnership.endTick),
    })),
  };
}

function buildObjectiveTables(state: PopulationState): Record<string, ObjectivePerson> {
  const table: Record<string, ObjectivePerson> = {};
  for (const person of Object.values(state.people)) {
    table[personIdFromTownBox(person.id)] = toObjectivePerson(person);
  }
  return table;
}

export function runSpikeT(worldSeed: string = SPIKE_T_CANONICAL_SEED): SpikeTResult {
  const params = { ...DEFAULT_POPULATION_PARAMS, ticksPerYear: TICKS_PER_YEAR };
  const populationRng = createPopulationRng(worldSeed);
  const state = generatePopulation(populationRng, params);
  state.worldSeed = worldSeedNumeric(worldSeed);

  const eventLog = new SpikeEventLog();
  const currentTick = 0;
  const populationEvent = eventLog.append(
    'SPIKE_POPULATION_GENERATED',
    tickToSimMinute(currentTick),
    [],
    {
      personCount: Object.keys(state.people).length,
      seedHash: worldSeedNumeric(worldSeed),
    },
  );

  const households: ObjectiveHousehold[] = [];
  const drawRng = restoreSpikeRng(state.drawSeed);

  for (let drawIndex = 0; drawIndex < SPIKE_HOUSE_COUNT; drawIndex++) {
    const peopleBefore = Object.keys(state.people).length;
    const selection = selectHousehold(
      state,
      drawRng,
      currentTick,
      SPIKE_HOUSE_CAPACITY,
      TICKS_PER_YEAR,
      DEFAULT_DRAW_PARAMS,
    );
    state.drawSeed = drawRng.getState();

    const memberIds = selection.memberIds.map(personIdFromTownBox);
    const headId = personIdFromTownBox(selection.headId);
    const household: ObjectiveHousehold = {
      id: householdIdForDrawSlot(drawIndex),
      facilityId: facilityIdForDrawSlot(drawIndex),
      headPersonId: headId,
      memberPersonIds: memberIds,
      arrangement: selection.arrangement,
    };
    households.push(household);

    const drawEvent = eventLog.append(
      'SPIKE_HOUSEHOLD_DRAWN',
      tickToSimMinute(currentTick),
      memberIds,
      {
        householdId: household.id,
        facilityId: household.facilityId,
        arrangement: selection.arrangement,
        memberIds,
      },
      [populationEvent.id],
    );

    if (Object.keys(state.people).length > peopleBefore) {
      eventLog.append(
        'SPIKE_IMMIGRANT_FAMILY_CREATED',
        tickToSimMinute(currentTick),
        memberIds,
        { memberIds, headId },
        [drawEvent.id],
      );
    }

    for (const memberId of memberIds) {
      eventLog.append(
        'SPIKE_PERSON_PLACED',
        tickToSimMinute(currentTick),
        [memberId],
        { personId: memberId, householdId: household.id },
        [drawEvent.id],
      );
    }
  }

  const personTable = buildObjectiveTables(state);
  const events = eventLog.all();
  const normalized = normalizeSpikeTOutput({
    people: Object.values(personTable),
    households,
    events,
  });

  return {
    normalized,
    eventSequence: events,
    personTable,
    householdTable: households,
  };
}
