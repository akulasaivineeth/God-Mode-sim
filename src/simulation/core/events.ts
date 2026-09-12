import { z } from 'zod';
import type { EntityId, SimMinute } from './types';

/** ARCH-004 — Domain event envelope (meaningful state changes only). */
export const domainEventSchema = z.object({
  id: z.string(),
  branchId: z.string(),
  simTime: z.number().int().nonnegative(),
  type: z.string(),
  actorIds: z.array(z.string()),
  locationId: z.string().optional(),
  payload: z.unknown(),
  causes: z.array(z.string()).optional(),
  visibility: z.enum(['public', 'private', 'god-only']).optional(),
  historicalWeight: z.number().optional(),
});

export type DomainEvent = z.infer<typeof domainEventSchema>;

export interface CreateDomainEventInput {
  id: EntityId;
  branchId: string;
  simTime: SimMinute;
  type: string;
  actorIds: EntityId[];
  payload: unknown;
  locationId?: string;
  causes?: string[];
  visibility?: DomainEvent['visibility'];
  historicalWeight?: number;
}

export function createDomainEvent(input: CreateDomainEventInput): DomainEvent {
  return domainEventSchema.parse({
    id: input.id,
    branchId: input.branchId,
    simTime: input.simTime,
    type: input.type,
    actorIds: input.actorIds,
    locationId: input.locationId,
    payload: input.payload,
    causes: input.causes,
    visibility: input.visibility,
    historicalWeight: input.historicalWeight,
  });
}
