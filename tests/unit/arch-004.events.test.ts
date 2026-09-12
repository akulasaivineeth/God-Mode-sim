import { describe, expect, it } from 'vitest';
import { createDomainEvent, domainEventSchema } from '@/simulation/core/events';

describe('ARCH-004 domain events', () => {
  it('creates a valid domain event envelope', () => {
    const event = createDomainEvent({
      id: 'evt_1',
      branchId: 'main',
      simTime: 3,
      type: 'TOY_STEP',
      actorIds: ['toy-system'],
      payload: { choice: 'alpha', increment: 2 },
    });

    expect(domainEventSchema.safeParse(event).success).toBe(true);
    expect(event.branchId).toBe('main');
    expect(event.simTime).toBe(3);
  });

  it('rejects invalid envelopes', () => {
    const result = domainEventSchema.safeParse({
      id: 'evt_bad',
      branchId: 'main',
      simTime: -1,
      type: 'TOY_STEP',
      actorIds: [],
      payload: {},
    });
    expect(result.success).toBe(false);
  });
});
