import { describe, expect, test } from 'vitest';
import { createSpikeRng, restoreSpikeRng } from '../../src/spikes/arch01-t/adapters/rngAdapter.js';
import { DEFAULT_DRAW_PARAMS, selectHousehold } from '../../src/spikes/arch01-t/vendor/townbox/householdDraw.js';
import { generatePopulation } from '../../src/spikes/arch01-t/vendor/townbox/populationGenerate.js';
import type { GenPerson, PersonTable, PopulationParams, PopulationState } from '../../src/spikes/arch01-t/vendor/townbox/types/genealogy.js';
import { HouseholdArrangements, type DrawParams } from '../../src/spikes/arch01-t/vendor/townbox/types/household.js';
import { Genders, type Gender } from '../../src/spikes/arch01-t/vendor/townbox/types/social.js';
import { isAliveAt, relationshipLabel } from '../../src/spikes/arch01-t/vendor/townbox/kinship.js';

const TICKS_PER_YEAR = 360;
const NOW = 0;
const CAPACITY = 8;

function person(id: string, gender: Gender, ageYears: number, extra: Partial<GenPerson> = {}): GenPerson {
  return {
    id,
    firstName: id,
    familyName: 'Fix',
    gender,
    birthTick: NOW - ageYears * TICKS_PER_YEAR,
    deathTick: null,
    fatherId: null,
    motherId: null,
    partnerships: [],
    ...extra,
  };
}

function makeState(people: GenPerson[], drawSeed = 1): PopulationState {
  const table: PersonTable = {};
  for (const p of people) {
    table[p.id] = p;
  }
  return { worldSeed: 0, people: table, drawSeed, placedIds: [], nextSeq: people.length, lastSimulatedYear: 0 };
}

function weights(only: HouseholdArrangements): DrawParams {
  const base: Record<HouseholdArrangements, number> = {
    [HouseholdArrangements.Nuclear]: 0,
    [HouseholdArrangements.Single]: 0,
    [HouseholdArrangements.Multigen]: 0,
    [HouseholdArrangements.Siblings]: 0,
    [HouseholdArrangements.Guardianship]: 0,
    [HouseholdArrangements.Roommates]: 0,
    [HouseholdArrangements.Homeless]: 0,
  };
  base[only] = 1;
  return { adultAgeYears: 18, maxRoommates: 3, arrangementWeights: base };
}

describe('ARCH01 Spike T household draw (ported TownBox)', () => {
  test('guardianship: orphaned minor placed with adult sibling', () => {
    const dad = person('dad', Genders.Male, 60, { deathTick: NOW - 500 });
    const mom = person('mom', Genders.Female, 58, { deathTick: NOW - 400 });
    const orphan = person('orphan', Genders.Male, 8, { fatherId: 'dad', motherId: 'mom' });
    const bigSib = person('bigSib', Genders.Female, 27, { fatherId: 'dad', motherId: 'mom' });
    const state = makeState([dad, mom, orphan, bigSib]);

    const selection = selectHousehold(state, createSpikeRng('test-guardianship:5'), NOW, CAPACITY, TICKS_PER_YEAR, weights(HouseholdArrangements.Guardianship));

    expect(selection.arrangement).toBe(HouseholdArrangements.Guardianship);
    expect(selection.memberIds.sort()).toEqual(['bigSib', 'orphan']);
  });

  test('roommates: unrelated adults co-reside', () => {
    const people = [person('a', Genders.Male, 25), person('b', Genders.Female, 31), person('c', Genders.Male, 28), person('d', Genders.Female, 40)];
    const state = makeState(people);
    const selection = selectHousehold(state, createSpikeRng('test-roommates:3'), NOW, CAPACITY, TICKS_PER_YEAR, weights(HouseholdArrangements.Roommates));

    expect(selection.arrangement).toBe(HouseholdArrangements.Roommates);
    expect(selection.memberIds.length).toBeGreaterThanOrEqual(2);
    for (const a of selection.memberIds) {
      for (const b of selection.memberIds) {
        if (a !== b) {
          expect(relationshipLabel(state.people, a, b)).toBeNull();
        }
      }
    }
  });

  test('immigrant fallback when pool is empty', () => {
    const state = makeState([]);
    const selection = selectHousehold(state, createSpikeRng('test-immigrant:9'), NOW, CAPACITY, TICKS_PER_YEAR);

    expect(selection.memberIds.length).toBeGreaterThanOrEqual(1);
    for (const id of selection.memberIds) {
      expect(isAliveAt(state.people[id]!, NOW)).toBe(true);
    }
    expect(state.placedIds).toEqual(expect.arrayContaining(selection.memberIds));
  });

  test('repeated draws never reuse placed or dead members', () => {
    const params: PopulationParams = {
      ticksPerYear: TICKS_PER_YEAR,
      founderCouples: 40,
      generations: 3,
      childDistribution: [0.05, 0.15, 0.3, 0.3, 0.15, 0.05],
      pairingProbability: 0.82,
      immigrantSpouseProbability: 0.5,
      spouseMaxAgeGapYears: 12,
      parentMinAgeYears: 20,
      parentMaxAgeYears: 42,
      generationGapYears: 31,
      lifespanMeanYears: 78,
      lifespanSpreadYears: 16,
      maxPopulation: 5000,
    };
    const populationRng = createSpikeRng('test-integration:98765');
    const state = generatePopulation(populationRng, params);
    const drawRng = restoreSpikeRng(state.drawSeed);

    const seen = new Set<string>();
    for (let i = 0; i < 40; i++) {
      const selection = selectHousehold(state, drawRng, NOW, CAPACITY, TICKS_PER_YEAR, DEFAULT_DRAW_PARAMS);
      for (const id of selection.memberIds) {
        expect(seen.has(id)).toBe(false);
        seen.add(id);
        expect(isAliveAt(state.people[id]!, NOW)).toBe(true);
      }
    }
    expect(state.placedIds).toEqual(expect.arrayContaining([...seen]));
  });
});
