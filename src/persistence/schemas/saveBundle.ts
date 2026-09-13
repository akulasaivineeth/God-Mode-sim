import { z } from 'zod';
import { domainEventSchema } from '@/simulation/core/events';
import { PRNG_ALGORITHM_ID } from '@/simulation/core/prng';
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

const vec2Schema = z.object({ x: z.number(), z: z.number() });

const actionTypeEnum = z.enum(['sleep', 'eat', 'drink', 'toilet', 'shower', 'work', 'idle']);

const needsSchema = z.object({
  hunger: z.number(),
  thirst: z.number(),
  bladder: z.number(),
  energy: z.number(),
  hygiene: z.number(),
});

const actionStateSchema = z
  .object({
    type: actionTypeEnum,
    locationId: z.string(),
    phase: z.enum(['travel', 'perform']),
    path: z.array(vec2Schema),
    performUntil: z.number(),
  })
  .nullable();

const decisionTraceSchema = z
  .object({
    atMinute: z.number(),
    layer: z.enum(['reflex', 'routine']),
    selected: actionTypeEnum,
    candidates: z.array(
      z.object({
        action: actionTypeEnum,
        score: z.number(),
        factors: z.array(z.object({ label: z.string(), value: z.number() })),
        blocked: z.string().optional(),
      }),
    ),
  })
  .nullable();

const citizenStateSchema = z.object({
  id: z.string(),
  name: z.string(),
  homeId: z.string(),
  workId: z.string(),
  storeId: z.string(),
  position: vec2Schema,
  atNode: z.string(),
  facing: z.number(),
  needs: needsSchema,
  personality: z.object({ diligence: z.number(), discipline: z.number() }),
  action: actionStateSchema,
  lastDecision: decisionTraceSchema,
});

export const worldSnapshotSchema = z.object({
  schemaVersion: z.string(),
  worldSeed: z.string(),
  branchId: z.string(),
  clock: simulationClockSchema,
  prng: prngStateSchema,
  toy: toySimStateSchema,
  events: z.array(domainEventSchema),
  citizens: z.array(citizenStateSchema).optional(),
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
