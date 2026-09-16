import type { NameService } from '../vendor/townbox/nameService.js';
import { forkSpikeRng, type SpikeRng } from './rngAdapter.js';
import { Genders, type Gender } from '../vendor/townbox/types/social.js';

const MALE_GIVEN = [
  'Noah', 'Elias', 'Mateo', 'Lucas', 'Theo', 'Henrik', 'Jonas', 'Felix', 'Owen', 'Leo',
  'Arlo', 'Milan', 'Silas', 'Ezra', 'Caleb', 'Adrian', 'Nico', 'Rafael', 'Ivan', 'Oscar',
];

const FEMALE_GIVEN = [
  'Maya', 'Lena', 'Sofia', 'Nora', 'Clara', 'Elena', 'Isla', 'Ada', 'Mira', 'Zoe',
  'Iris', 'Freya', 'Luna', 'Vera', 'Hana', 'Ava', 'Nina', 'Rosa', 'Tara', 'Yara',
];

const FAMILY = [
  'Ashford', 'Bennett', 'Caldwell', 'Donovan', 'Ellison', 'Fairchild', 'Granger', 'Holloway',
  'Iverson', 'Kensington', 'Langford', 'Mercer', 'Northcott', 'Oakley', 'Prescott', 'Quincy',
  'Redmond', 'Sterling', 'Thornton', 'Underwood', 'Vance', 'Whitmore', 'York', 'Zimmerman',
];

export function createNameService(rng: SpikeRng, salt = 0): NameService {
  const stream = salt ? forkSpikeRng(rng, salt) : rng;

  return {
    firstName(gender: Gender): string {
      const pool = gender === Genders.Male ? MALE_GIVEN : FEMALE_GIVEN;
      return pool[stream.nextInt(0, pool.length - 1)]!;
    },
    familyName(): string {
      return FAMILY[stream.nextInt(0, FAMILY.length - 1)]!;
    },
  };
}

export function createFamilyNameService(rng: SpikeRng, salt: number): NameService {
  const stream = forkSpikeRng(rng, salt);
  const familyName = FAMILY[stream.nextInt(0, FAMILY.length - 1)]!;
  return {
    firstName(gender: Gender): string {
      const pool = gender === Genders.Male ? MALE_GIVEN : FEMALE_GIVEN;
      const nameStream = forkSpikeRng(stream, gender === Genders.Male ? 1 : 2);
      return pool[nameStream.nextInt(0, pool.length - 1)]!;
    },
    familyName(): string {
      return familyName;
    },
  };
}
