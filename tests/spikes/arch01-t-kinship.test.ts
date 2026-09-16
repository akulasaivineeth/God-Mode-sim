import { describe, expect, test } from 'vitest';
import {
  ageAt,
  childrenOf,
  cousinsOf,
  grandchildrenOf,
  grandparentsOf,
  isAliveAt,
  nephewsNiecesOf,
  parentsOf,
  relationshipLabel,
  siblingsOf,
  spouseAt,
  unclesAuntsOf,
} from '../../src/spikes/arch01-t/vendor/townbox/kinship.js';
import type { GenPerson, Partnership, PersonTable } from '../../src/spikes/arch01-t/vendor/townbox/types/genealogy.js';
import { Genders, Relationships } from '../../src/spikes/arch01-t/vendor/townbox/types/social.js';

const TICKS_PER_YEAR = 10;

function person(overrides: Partial<GenPerson> & Pick<GenPerson, 'id' | 'gender'>): GenPerson {
  return {
    firstName: overrides.id,
    familyName: 'Test',
    birthTick: 0,
    deathTick: null,
    fatherId: null,
    motherId: null,
    partnerships: [],
    ...overrides,
  };
}

function partnership(partnerId: string, startTick: number, endTick: number | null = null): Partnership {
  return { partnerId, startTick, endTick };
}

function buildPool(): PersonTable {
  const people: GenPerson[] = [
    person({ id: 'gf', gender: Genders.Male, birthTick: 0, deathTick: 700 }),
    person({ id: 'gm', gender: Genders.Female, birthTick: 20, deathTick: 720 }),
    person({ id: 'pa', gender: Genders.Male, birthTick: 250, deathTick: 600, fatherId: 'gf', motherId: 'gm', partnerships: [partnership('sc', 460)] }),
    person({ id: 'ab', gender: Genders.Female, birthTick: 270, fatherId: 'gf', motherId: 'gm' }),
    person({ id: 'sc', gender: Genders.Female, birthTick: 260, deathTick: 600, partnerships: [partnership('pa', 460)] }),
    person({ id: 'older', gender: Genders.Male, birthTick: 470, fatherId: 'pa', motherId: 'sc' }),
    person({ id: 'minor', gender: Genders.Male, birthTick: 590, fatherId: 'pa', motherId: 'sc' }),
    person({ id: 'cousin', gender: Genders.Female, birthTick: 480, motherId: 'ab' }),
    person({ id: 'r1', gender: Genders.Female, birthTick: 500 }),
    person({ id: 'r2', gender: Genders.Male, birthTick: 505 }),
  ];

  const pool: PersonTable = {};
  for (const p of people) {
    pool[p.id] = p;
  }
  return pool;
}

const pool = buildPool();
const at = (id: string): GenPerson => pool[id]!;

describe('ARCH01 Spike T kinship (ported TownBox)', () => {
  test('parentsOf resolves both parents that exist', () => {
    expect(parentsOf(pool, 'minor').sort()).toEqual(['pa', 'sc']);
    expect(parentsOf(pool, 'cousin')).toEqual(['ab']);
    expect(parentsOf(pool, 'r1')).toEqual([]);
  });

  test('childrenOf finds all children', () => {
    expect(childrenOf(pool, 'pa').sort()).toEqual(['minor', 'older']);
    expect(childrenOf(pool, 'ab')).toEqual(['cousin']);
  });

  test('derived kinship relations', () => {
    expect(siblingsOf(pool, 'minor')).toEqual(['older']);
    expect(grandparentsOf(pool, 'minor').sort()).toEqual(['gf', 'gm']);
    expect(grandchildrenOf(pool, 'gf').sort()).toEqual(['cousin', 'minor', 'older']);
    expect(unclesAuntsOf(pool, 'minor')).toEqual(['ab']);
    expect(nephewsNiecesOf(pool, 'pa')).toEqual(['cousin']);
    expect(cousinsOf(pool, 'minor')).toEqual(['cousin']);
  });

  test('life state and labels', () => {
    expect(isAliveAt(at('pa'), 590)).toBe(true);
    expect(isAliveAt(at('pa'), 600)).toBe(false);
    expect(ageAt(at('minor'), 650, TICKS_PER_YEAR)).toBe(6);
    expect(spouseAt(pool, 'pa', 500)).toBe('sc');
    expect(relationshipLabel(pool, 'minor', 'pa')).toBe(Relationships.Father);
    expect(relationshipLabel(pool, 'minor', 'cousin')).toBeNull();
  });
});
