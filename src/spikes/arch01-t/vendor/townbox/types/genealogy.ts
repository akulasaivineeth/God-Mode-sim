// SPDX-License-Identifier: MIT
// Adapted from TownBox (https://github.com/Maudfer/townBox) @ 84c1ba4 — see src/spikes/arch01-t/THIRD_PARTY_NOTICES.md

import type { Gender } from './social.js';

export type PersonId = string;

export interface Partnership {
  partnerId: PersonId;
  startTick: number;
  endTick: number | null;
}

export interface GenPerson {
  id: PersonId;
  firstName: string;
  familyName: string;
  gender: Gender;
  birthTick: number;
  deathTick: number | null;
  fatherId: PersonId | null;
  motherId: PersonId | null;
  partnerships: Partnership[];
  maxChildren?: number;
}

export type PersonTable = Record<PersonId, GenPerson>;

export interface PopulationState {
  worldSeed: number;
  people: PersonTable;
  drawSeed: number;
  placedIds: PersonId[];
  nextSeq: number;
  lastSimulatedYear: number;
}

export interface PopulationParams {
  ticksPerYear: number;
  founderCouples: number;
  generations: number;
  childDistribution: number[];
  pairingProbability: number;
  immigrantSpouseProbability: number;
  spouseMaxAgeGapYears: number;
  parentMinAgeYears: number;
  parentMaxAgeYears: number;
  generationGapYears: number;
  lifespanMeanYears: number;
  lifespanSpreadYears: number;
  maxPopulation: number;
}
