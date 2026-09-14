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

/** M01 — 3D world and time. */
export const M01_ACCEPTANCE_REQUIREMENTS = [
  'SIM-TIME-001',
  'SIM-TIME-002',
  'SIM-TIME-003',
  'SIM-TIME-004',
  'VIS-002',
  'WORLD-001',
  'ARCH-005',
  'M01-GATE',
] as const;

/** Requirements preserved from M00 that M01 must not regress. */
export const M01_REGRESSION_REQUIREMENTS = [
  'ARCH-001',
  'ARCH-002',
  'ARCH-003',
  'ARCH-004',
  'M00-GATE',
] as const;

export type M01AcceptanceRequirement = (typeof M01_ACCEPTANCE_REQUIREMENTS)[number];

/** M02 — One autonomous citizen. */
export const M02_ACCEPTANCE_REQUIREMENTS = [
  'NPC-ID-001',
  'NPC-NEED-001',
  'NPC-DEC-001',
  'NPC-DEC-010',
  'NPC-MOVE-001',
  'VIS-001',
  'UX-001',
  'M02-GATE',
] as const;

/** Requirements preserved from M00/M01 that M02 must not regress. */
export const M02_REGRESSION_REQUIREMENTS = [
  'ARCH-001',
  'ARCH-002',
  'ARCH-003',
  'ARCH-004',
  'ARCH-005',
  'M00-GATE',
  'M01-GATE',
] as const;

export type M02AcceptanceRequirement = (typeof M02_ACCEPTANCE_REQUIREMENTS)[number];
