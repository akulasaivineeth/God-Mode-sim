import { z } from 'zod';

export const ObjectivePersonSchema = z.object({
  id: z.string(),
  givenName: z.string(),
  familyName: z.string(),
  gender: z.enum(['male', 'female']),
  birthSimMinute: z.number(),
  deathSimMinute: z.number().nullable(),
  fatherId: z.string().nullable(),
  motherId: z.string().nullable(),
  partnerships: z.array(
    z.object({
      partnerId: z.string(),
      startSimMinute: z.number(),
      endSimMinute: z.number().nullable(),
    }),
  ),
});

export const ObjectiveHouseholdSchema = z.object({
  id: z.string(),
  facilityId: z.string(),
  headPersonId: z.string(),
  memberPersonIds: z.array(z.string()),
  arrangement: z.string(),
});

export type ObjectivePerson = z.infer<typeof ObjectivePersonSchema>;
export type ObjectiveHousehold = z.infer<typeof ObjectiveHouseholdSchema>;
