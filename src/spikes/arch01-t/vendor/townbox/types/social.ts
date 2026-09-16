// SPDX-License-Identifier: MIT
// Adapted from TownBox (https://github.com/Maudfer/townBox) @ 84c1ba4 — see src/spikes/arch01-t/THIRD_PARTY_NOTICES.md

export enum Genders {
  Male = 'male',
  Female = 'female',
}

export type Gender = Genders;

export enum Relationships {
  Father = 'father',
  Mother = 'mother',
  StepFather = 'stepfather',
  StepMother = 'stepmother',
  Grandfather = 'grandfather',
  Grandmother = 'grandmother',
  Spouse = 'spouse',
  Child = 'child',
  StepChild = 'stepchild',
  Grandchild = 'grandchild',
  Sibling = 'sibling',
  Uncle = 'uncle',
  Aunt = 'aunt',
  Niece = 'niece',
  Nephew = 'nephew',
}

export type Relationship = Relationships;
