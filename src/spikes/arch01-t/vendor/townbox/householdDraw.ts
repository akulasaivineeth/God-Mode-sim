// SPDX-License-Identifier: MIT
// Adapted from TownBox (https://github.com/Maudfer/townBox) @ 84c1ba4 — see src/spikes/arch01-t/THIRD_PARTY_NOTICES.md

import { createFamilyNameService } from '../../adapters/nameAdapter.js';
import drawConfig from './config/householdDraw.json';
import { sampleMaxChildren } from './fertility.js';
import {
  ageAt,
  childrenOf,
  isAliveAt,
  parentsOf,
  relationshipLabel,
  siblingsOf,
  spouseAt,
  unclesAuntsOf,
} from './kinship.js';
import type { NameService } from './nameService.js';
import type { SpikeRng } from '../../adapters/rngAdapter.js';
import type { GenPerson, PersonId, PopulationState } from './types/genealogy.js';
import { HouseholdArrangements, type DrawParams, type HouseholdArrangement } from './types/household.js';
import { Genders, type Gender } from './types/social.js';

export const DEFAULT_DRAW_PARAMS: DrawParams = drawConfig as DrawParams;

export interface HouseholdSelection {
  headId: PersonId;
  memberIds: PersonId[];
  arrangement: HouseholdArrangement;
}

export function selectHousehold(
  state: PopulationState,
  rng: SpikeRng,
  currentTick: number,
  capacity: number,
  ticksPerYear: number,
  params: DrawParams = DEFAULT_DRAW_PARAMS,
  createNames: (rng: SpikeRng, salt: number) => NameService = defaultNameFactory,
): HouseholdSelection {
  const pool = state.people;
  const placed = new Set(state.placedIds);
  const cap = Math.max(1, capacity);

  const get = (id: PersonId): GenPerson => pool[id]!;
  const available = (id: PersonId): boolean => {
    const person = pool[id];
    return !!person && isAliveAt(person, currentTick) && !placed.has(id);
  };
  const ageOf = (id: PersonId): number => ageAt(get(id), currentTick, ticksPerYear);
  const isAdult = (id: PersonId): boolean => ageOf(id) >= params.adultAgeYears;

  const availableIds = Object.keys(pool).filter(available);
  if (availableIds.length === 0) {
    return immigrantHousehold(state, rng, currentTick, cap, ticksPerYear, createNames);
  }
  const availableAdults = availableIds.filter(isAdult);

  const take = (ids: PersonId[]): PersonId[] => {
    const seen = new Set<PersonId>();
    const result: PersonId[] = [];
    for (const id of ids) {
      if (!seen.has(id) && result.length < cap) {
        seen.add(id);
        result.push(id);
      }
    }
    return result;
  };

  const buildNuclear = (head: PersonId): PersonId[] => {
    const members = [head];
    const spouse = spouseAt(pool, head, currentTick);
    if (spouse && available(spouse)) {
      members.push(spouse);
    }
    const minorChildren = childrenOf(pool, head).filter((id) => available(id) && !isAdult(id));
    members.push(...minorChildren);
    return take(members);
  };

  const buildSiblings = (head: PersonId): PersonId[] | null => {
    const adultSiblings = siblingsOf(pool, head).filter((id) => available(id) && isAdult(id));
    if (adultSiblings.length === 0) {
      return null;
    }
    return take([head, ...adultSiblings]);
  };

  const buildMultigen = (head: PersonId): PersonId[] | null => {
    const nuclear = buildNuclear(head);
    const spouse = spouseAt(pool, head, currentTick);
    const elderCandidates = [...parentsOf(pool, head), ...(spouse ? parentsOf(pool, spouse) : [])].filter(available);
    if (elderCandidates.length === 0) {
      return null;
    }
    return take([...nuclear, rng.pick(elderCandidates)]);
  };

  const buildGuardianship = (): PersonId[] | null => {
    const orphans = availableIds.filter((id) => {
      if (isAdult(id)) {
        return false;
      }
      const parents = parentsOf(pool, id);
      return parents.length > 0 && parents.every((pid) => !isAliveAt(get(pid), currentTick));
    });
    for (const orphan of orphans) {
      const guardians = [...siblingsOf(pool, orphan), ...unclesAuntsOf(pool, orphan)].filter(
        (id) => available(id) && isAdult(id),
      );
      if (guardians.length > 0) {
        const guardian = rng.pick(guardians);
        return take([guardian, orphan, ...buildNuclear(guardian).filter((id) => id !== guardian)]);
      }
    }
    return null;
  };

  const buildRoommates = (head: PersonId): PersonId[] | null => {
    const unrelated = availableAdults.filter((id) => id !== head && relationshipLabel(pool, head, id) === null);
    if (unrelated.length === 0) {
      return null;
    }
    const count = rng.nextInt(1, Math.min(params.maxRoommates, unrelated.length));
    return take([head, ...shuffle(unrelated, rng).slice(0, count)]);
  };

  const pickAdult = (): PersonId | null => (availableAdults.length ? rng.pick(availableAdults) : null);

  const order = [pickArrangement(rng, params.arrangementWeights), HouseholdArrangements.Nuclear, HouseholdArrangements.Single];
  for (const arrangement of order) {
    let members: PersonId[] | null = null;
    let head: PersonId | null = null;

    switch (arrangement) {
      case HouseholdArrangements.Guardianship:
        members = buildGuardianship();
        head = members ? members[0]! : null;
        break;
      case HouseholdArrangements.Single:
        head = pickAdult() ?? rng.pick(availableIds);
        members = [head];
        break;
      case HouseholdArrangements.Siblings:
        head = pickAdult();
        members = head ? buildSiblings(head) : null;
        break;
      case HouseholdArrangements.Multigen:
        head = pickAdult();
        members = head ? buildMultigen(head) : null;
        break;
      case HouseholdArrangements.Roommates:
        head = pickAdult();
        members = head ? buildRoommates(head) : null;
        break;
      case HouseholdArrangements.Nuclear:
      default:
        head = pickAdult();
        members = head ? buildNuclear(head) : null;
        break;
    }

    if (members && members.length > 0 && head) {
      commitPlacement(state, placed, members);
      return { headId: head, memberIds: members, arrangement };
    }
  }

  return immigrantHousehold(state, rng, currentTick, cap, ticksPerYear, createNames);
}

function defaultNameFactory(rng: SpikeRng, salt: number): NameService {
  return createFamilyNameService(rng, salt);
}

function commitPlacement(state: PopulationState, placed: Set<PersonId>, members: PersonId[]): void {
  for (const id of members) {
    placed.add(id);
  }
  state.placedIds = [...placed];
}

function immigrantHousehold(
  state: PopulationState,
  rng: SpikeRng,
  currentTick: number,
  capacity: number,
  ticksPerYear: number,
  createNames: (rng: SpikeRng, salt: number) => NameService,
): HouseholdSelection {
  const names = createNames(rng, rng.nextInt(1, 0x7fffffff));
  const familyName = names.familyName();
  const yearsToTicks = (years: number): number => Math.round(years * ticksPerYear);

  const makePerson = (gender: Gender, ageYears: number, fatherId: PersonId | null, motherId: PersonId | null): GenPerson => {
    const id = `p${state.nextSeq++}`;
    const person: GenPerson = {
      id,
      firstName: names.firstName(gender),
      familyName,
      gender,
      birthTick: currentTick - yearsToTicks(ageYears),
      deathTick: null,
      fatherId,
      motherId,
      partnerships: [],
      maxChildren: sampleMaxChildren(rng),
    };
    state.people[id] = person;
    return person;
  };

  const headAge = rng.nextInt(24, 55);
  const headGender = rng.chance(0.5) ? Genders.Male : Genders.Female;
  const head = makePerson(headGender, headAge, null, null);
  const members: GenPerson[] = [head];

  let father: GenPerson | null = headGender === Genders.Male ? head : null;
  let mother: GenPerson | null = headGender === Genders.Female ? head : null;

  if (capacity > 1 && rng.chance(0.7)) {
    const spouseGender = headGender === Genders.Male ? Genders.Female : Genders.Male;
    const spouseAge = Math.max(18, headAge + rng.nextInt(-8, 8));
    const spouse = makePerson(spouseGender, spouseAge, null, null);
    const startTick = currentTick - yearsToTicks(rng.nextInt(1, Math.max(2, headAge - 20)));
    head.partnerships.push({ partnerId: spouse.id, startTick, endTick: null });
    spouse.partnerships.push({ partnerId: head.id, startTick, endTick: null });
    members.push(spouse);
    if (spouseGender === Genders.Male) {
      father = spouse;
    } else {
      mother = spouse;
    }
  }

  const childCount = Math.min(rng.nextInt(0, 3), capacity - members.length);
  for (let c = 0; c < childCount; c++) {
    const childAge = rng.nextInt(0, Math.max(1, headAge - 18));
    const childGender = rng.chance(0.5) ? Genders.Male : Genders.Female;
    members.push(makePerson(childGender, childAge, father ? father.id : null, mother ? mother.id : null));
  }

  const memberIds = members.map((person) => person.id);
  const placed = new Set(state.placedIds);
  commitPlacement(state, placed, memberIds);

  return {
    headId: head.id,
    memberIds,
    arrangement: memberIds.length > 1 ? HouseholdArrangements.Nuclear : HouseholdArrangements.Single,
  };
}

function pickArrangement(rng: SpikeRng, weights: Partial<Record<HouseholdArrangement, number>>): HouseholdArrangement {
  const entries = Object.entries(weights) as [HouseholdArrangement, number][];
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = rng.next() * total;
  for (const [arrangement, weight] of entries) {
    roll -= weight;
    if (roll < 0) {
      return arrangement;
    }
  }
  return HouseholdArrangements.Nuclear;
}

function shuffle<T>(items: T[], rng: SpikeRng): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = rng.nextInt(0, i);
    const swap = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = swap;
  }
  return copy;
}
