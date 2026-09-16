// SPDX-License-Identifier: MIT
// Adapted from TownBox (https://github.com/Maudfer/townBox) @ 84c1ba4 — see src/spikes/arch01-t/THIRD_PARTY_NOTICES.md

export enum HouseholdArrangements {
  Nuclear = 'nuclear',
  Single = 'single',
  Siblings = 'siblings',
  Guardianship = 'guardianship',
  Roommates = 'roommates',
  Multigen = 'multigen',
  Homeless = 'homeless',
}

export type HouseholdArrangement = HouseholdArrangements;

export interface DrawParams {
  adultAgeYears: number;
  maxRoommates: number;
  arrangementWeights: Partial<Record<HouseholdArrangement, number>>;
}
