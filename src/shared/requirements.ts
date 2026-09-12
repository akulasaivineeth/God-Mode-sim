/** Stable canonical requirement IDs referenced in tests and review artifacts. */
export const M00_ACCEPTANCE_REQUIREMENTS = [
  'ARCH-001',
  'ARCH-002',
  'ARCH-003',
  'ARCH-004',
  'M00-GATE',
] as const;

export const M00_SCAFFOLDED_REQUIREMENTS = [
  'EXP-001',
  'HIST-001',
  'HIST-002',
] as const;

export type M00AcceptanceRequirement = (typeof M00_ACCEPTANCE_REQUIREMENTS)[number];
export type M00ScaffoldedRequirement = (typeof M00_SCAFFOLDED_REQUIREMENTS)[number];
