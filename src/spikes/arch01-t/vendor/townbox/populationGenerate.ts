// SPDX-License-Identifier: MIT
// Adapted from TownBox (https://github.com/Maudfer/townBox) @ 84c1ba4 — see src/spikes/arch01-t/THIRD_PARTY_NOTICES.md
// Contains `generatePopulation` only from src/app/game/population/Population.ts

import { createNameService } from '../../adapters/nameAdapter.js';
import { sampleMaxChildren } from './fertility.js';
import { isAliveAt } from './kinship.js';
import type { NameService } from './nameService.js';
import populationConfig from './config/population.json';
import type { SpikeRng } from '../../adapters/rngAdapter.js';
import type { GenPerson, PersonId, PersonTable, PopulationParams, PopulationState } from './types/genealogy.js';
import { Genders, type Gender } from './types/social.js';

export const DEFAULT_POPULATION_PARAMS: PopulationParams = populationConfig as PopulationParams;

const PRESENT_TICK = 0;

interface Couple {
  maleId: PersonId;
  femaleId: PersonId;
}

export function generatePopulation(
  rng: SpikeRng,
  params: PopulationParams,
  createNames: (rng: SpikeRng) => NameService = (rng) => createNameService(rng),
): PopulationState {
  const names = createNames(rng);

  const people: PersonTable = {};
  let counter = 0;

  const yearsToTicks = (years: number): number => Math.round(years * params.ticksPerYear);
  const ageGapYears = (a: GenPerson, b: GenPerson): number => Math.abs(a.birthTick - b.birthTick) / params.ticksPerYear;
  const atCap = (): boolean => counter >= params.maxPopulation;

  function createPerson(
    gender: Gender,
    birthTick: number,
    fatherId: PersonId | null,
    motherId: PersonId | null,
    familyName: string,
  ): GenPerson {
    const id = `p${counter++}`;
    const person: GenPerson = {
      id,
      firstName: names.firstName(gender),
      familyName,
      gender,
      birthTick,
      deathTick: null,
      fatherId,
      motherId,
      partnerships: [],
      maxChildren: sampleMaxChildren(rng),
    };
    people[id] = person;
    return person;
  }

  function assignLifespanDeath(person: GenPerson): void {
    const lifespanYears = Math.max(1, params.lifespanMeanYears + (rng.next() + rng.next() - 1) * params.lifespanSpreadYears);
    const deathCandidate = person.birthTick + yearsToTicks(lifespanYears);
    if (deathCandidate <= PRESENT_TICK) {
      person.deathTick = deathCandidate;
    }
  }

  function sampleChildCount(): number {
    const weights = params.childDistribution;
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    let roll = rng.next() * total;
    for (let i = 0; i < weights.length; i++) {
      roll -= weights[i]!;
      if (roll < 0) {
        return i;
      }
    }
    return weights.length - 1;
  }

  function shareParent(a: GenPerson, b: GenPerson): boolean {
    return (
      (a.fatherId !== null && a.fatherId === b.fatherId) ||
      (a.motherId !== null && a.motherId === b.motherId)
    );
  }

  function shuffle<T>(items: T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = rng.nextInt(0, i);
      const swap = copy[i]!;
      copy[i] = copy[j]!;
      copy[j] = swap;
    }
    return copy;
  }

  function marry(a: GenPerson, b: GenPerson, startTick: number): void {
    const deaths = [a.deathTick, b.deathTick].filter((d): d is number => d !== null);
    let endTick: number | null = deaths.length ? Math.min(...deaths) : null;
    if (endTick !== null && endTick <= startTick) {
      endTick = startTick;
    }
    a.partnerships.push({ partnerId: b.id, startTick, endTick });
    b.partnerships.push({ partnerId: a.id, startTick, endTick });
  }

  function marriageTick(a: GenPerson, b: GenPerson): number | null {
    const tick = Math.max(a.birthTick, b.birthTick) + yearsToTicks(rng.nextInt(params.parentMinAgeYears, params.parentMinAgeYears + 6));
    if (!isAliveAt(a, tick) || !isAliveAt(b, tick)) {
      return null;
    }
    return tick;
  }

  function pairUp(individuals: GenPerson[]): Couple[] {
    const couples: Couple[] = [];
    const paired = new Set<PersonId>();
    const shuffled = shuffle(individuals);
    const females = shuffled.filter((person) => person.gender === Genders.Female);

    for (const male of shuffled) {
      if (male.gender !== Genders.Male || paired.has(male.id)) {
        continue;
      }
      if (!rng.chance(params.pairingProbability)) {
        continue;
      }

      let matched: GenPerson | null = null;
      for (const female of females) {
        if (paired.has(female.id) || shareParent(male, female)) {
          continue;
        }
        if (ageGapYears(male, female) > params.spouseMaxAgeGapYears) {
          continue;
        }
        const tick = marriageTick(male, female);
        if (tick === null) {
          continue;
        }
        marry(male, female, tick);
        matched = female;
        break;
      }

      if (matched) {
        paired.add(male.id);
        paired.add(matched.id);
        couples.push({ maleId: male.id, femaleId: matched.id });
      } else if (!atCap() && rng.chance(params.immigrantSpouseProbability)) {
        const gapYears = rng.nextInt(-params.spouseMaxAgeGapYears, params.spouseMaxAgeGapYears);
        const immigrant = createPerson(Genders.Female, male.birthTick + yearsToTicks(gapYears), null, null, names.familyName());
        assignLifespanDeath(immigrant);
        const tick = marriageTick(male, immigrant);
        if (tick !== null) {
          marry(male, immigrant, tick);
          paired.add(male.id);
          paired.add(immigrant.id);
          couples.push({ maleId: male.id, femaleId: immigrant.id });
        }
      }
    }

    return couples;
  }

  function birthChildren(couples: Couple[]): GenPerson[] {
    const children: GenPerson[] = [];
    for (const couple of couples) {
      const father = people[couple.maleId]!;
      const mother = people[couple.femaleId]!;
      const count = sampleChildCount();
      for (let c = 0; c < count; c++) {
        if (atCap()) {
          return children;
        }
        const parentAge = rng.nextInt(params.parentMinAgeYears, params.parentMaxAgeYears);
        const birthTick = Math.max(father.birthTick, mother.birthTick) + yearsToTicks(parentAge);
        if (birthTick > PRESENT_TICK) {
          continue;
        }
        if (!isAliveAt(father, birthTick) || !isAliveAt(mother, birthTick)) {
          continue;
        }
        const gender = rng.chance(0.5) ? Genders.Male : Genders.Female;
        const child = createPerson(gender, birthTick, father.id, mother.id, father.familyName);
        assignLifespanDeath(child);
        children.push(child);
      }
    }
    return children;
  }

  const founderBirthYear = -(params.generations * params.generationGapYears);
  let couples: Couple[] = [];
  for (let i = 0; i < params.founderCouples && !atCap(); i++) {
    const husbandBirth = yearsToTicks(founderBirthYear + (rng.next() - 0.5) * params.generationGapYears);
    const husband = createPerson(Genders.Male, husbandBirth, null, null, names.familyName());
    assignLifespanDeath(husband);

    if (atCap()) {
      break;
    }
    const wifeGap = rng.nextInt(-params.spouseMaxAgeGapYears, params.spouseMaxAgeGapYears);
    const wife = createPerson(Genders.Female, husbandBirth + yearsToTicks(wifeGap), null, null, names.familyName());
    assignLifespanDeath(wife);

    const tick = marriageTick(husband, wife);
    if (tick !== null) {
      marry(husband, wife, tick);
    }
    couples.push({ maleId: husband.id, femaleId: wife.id });
  }

  for (let generation = 1; generation <= params.generations && !atCap(); generation++) {
    const children = birthChildren(couples);
    couples = pairUp(children);
  }

  return {
    worldSeed: rng.getState(),
    people,
    drawSeed: rng.getState(),
    placedIds: [],
    nextSeq: counter,
    lastSimulatedYear: 0,
  };
}
