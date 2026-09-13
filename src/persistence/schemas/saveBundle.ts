import { z } from 'zod';
import { domainEventSchema } from '@/simulation/core/events';
import { PRNG_ALGORITHM_ID } from '@/simulation/core/prng';
import { citizenStateSchema } from './citizen';
import { branchMetadataSchema } from './branch';

const prngStateSchema = z.object({
  algorithm: z.literal(PRNG_ALGORITHM_ID),
  state: z.number().int().nonnegative(),
});

const toySimStateSchema = z.object({
  tickCount: z.number().int().nonnegative(),
  accumulator: z.number(),
  lastChoice: z.string(),
  visualPhase: z.number(),
  eventSequence: z.number().int().nonnegative(),
});

const simulationClockSchema = z.object({
  simMinute: z.number().int().nonnegative(),
});

export const worldSnapshotSchema = z.object({
  schemaVersion: z.string(),
  worldSeed: z.string(),
  branchId: z.string(),
  clock: simulationClockSchema,
  prng: prngStateSchema,
  toy: toySimStateSchema,
  citizens: z.array(citizenStateSchema).optional(),
  events: z.array(domainEventSchema),
});

export const saveBundleSchema = z.object({
  schemaVersion: z.string(),
  buildVersion: z.string(),
  milestone: z.enum(['M00', 'M01', 'M02']),
  worldSeed: z.string(),
  branch: branchMetadataSchema,
  snapshot: worldSnapshotSchema,
  eventSegment: z.array(domainEventSchema),
  digest: z.string(),
  exportedAt: z.string(),
});

export type SaveBundle = z.infer<typeof saveBundleSchema>;
