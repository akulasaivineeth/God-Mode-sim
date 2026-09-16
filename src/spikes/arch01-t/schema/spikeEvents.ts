import { z } from 'zod';

export const SPIKE_BRANCH_ID = 'spike-t-main';

export const SpikeEventTypeSchema = z.enum([
  'SPIKE_POPULATION_GENERATED',
  'SPIKE_HOUSEHOLD_DRAWN',
  'SPIKE_IMMIGRANT_FAMILY_CREATED',
  'SPIKE_PERSON_PLACED',
]);

export const SpikeDomainEventSchema = z.object({
  id: z.string(),
  branchId: z.literal(SPIKE_BRANCH_ID),
  simTime: z.number(),
  type: SpikeEventTypeSchema,
  actorIds: z.array(z.string()),
  payload: z.unknown(),
  causes: z.array(z.string()).optional(),
});

export type SpikeEventType = z.infer<typeof SpikeEventTypeSchema>;
export type SpikeDomainEvent = z.infer<typeof SpikeDomainEventSchema>;

export class SpikeEventLog {
  private seq = 0;
  private events: SpikeDomainEvent[] = [];

  append(
    type: SpikeEventType,
    simTime: number,
    actorIds: string[],
    payload: unknown,
    causes?: string[],
  ): SpikeDomainEvent {
    this.seq += 1;
    const event: SpikeDomainEvent = {
      id: `spike_evt_${String(this.seq).padStart(6, '0')}`,
      branchId: SPIKE_BRANCH_ID,
      simTime,
      type,
      actorIds,
      payload,
      causes,
    };
    this.events.push(event);
    return event;
  }

  all(): SpikeDomainEvent[] {
    return [...this.events];
  }
}
