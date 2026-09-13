import { z } from 'zod';

const actionKindSchema = z.enum([
  'idle',
  'travel',
  'sleep',
  'eat',
  'drink',
  'use_toilet',
  'shower',
  'work',
  'shop',
]);

const physiologyNeedsSchema = z.object({
  hunger: z.number(),
  thirst: z.number(),
  bladder: z.number(),
  energy: z.number(),
  hygiene: z.number(),
});

export const citizenStateSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  assignments: z.object({
    homeId: z.string(),
    storeId: z.string(),
    workplaceId: z.string(),
  }),
  needs: physiologyNeedsSchema,
  position: z.object({ x: z.number(), z: z.number() }),
  currentFacilityId: z.string().nullable(),
  activeAction: z.object({
    kind: actionKindSchema,
    targetFacilityId: z.string().nullable(),
    startedAtMinute: z.number().int().nonnegative(),
    durationMinutes: z.number().int().nonnegative(),
    elapsedMinutes: z.number().int().nonnegative(),
    pathNodeIds: z.array(z.string()).optional(),
    traversedDistance: z.number().optional(),
    totalPathDistance: z.number().optional(),
    followUpAction: actionKindSchema.optional(),
  }),
  lastUtilityTrace: z.any().nullable().default(null),
  personality: z.object({
    conscientiousness: z.number(),
    impulsivity: z.number(),
  }),
  appearance: z.object({
    shirtColor: z.string(),
    pantsColor: z.string(),
    skinColor: z.string(),
    hairColor: z.string(),
  }),
  workMinutesToday: z.number().int().nonnegative(),
});
