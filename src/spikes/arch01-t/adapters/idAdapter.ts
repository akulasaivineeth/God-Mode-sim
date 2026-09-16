/**
 * Spike-local ID mapping. Does NOT import production world facility registry.
 * Future M03 facility binding to Riverside dwellings remains unproven by this spike.
 */

export type EntityId = string;

const SPIKE_HOUSE_SLOTS = 6;

export function personIdFromTownBox(id: string): EntityId {
  const match = /^p(\d+)$/.exec(id);
  if (!match) {
    return `person-${id}`;
  }
  return `person-${match[1].padStart(5, '0')}`;
}

export function personIdToTownBox(entityId: EntityId): string {
  const match = /^person-(\d+)$/.exec(entityId);
  if (!match) {
    return entityId;
  }
  return `p${Number.parseInt(match[1], 10)}`;
}

/** Spike-local fixture: draw slot index → synthetic facility id (not production world registry). */
export function facilityIdForDrawSlot(slotIndex: number): string {
  if (slotIndex < 0 || slotIndex >= SPIKE_HOUSE_SLOTS) {
    throw new Error(`Spike house slot out of range: ${slotIndex}`);
  }
  return `house-${slotIndex + 1}`;
}

export function householdIdForDrawSlot(slotIndex: number): string {
  return `household-${String(slotIndex + 1).padStart(3, '0')}`;
}

export const SPIKE_HOUSE_COUNT = SPIKE_HOUSE_SLOTS;
