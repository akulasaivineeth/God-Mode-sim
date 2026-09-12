/**
 * Save bundle export — ARCH-004.
 *
 * Plain English: Packages worker snapshot + metadata into versioned JSON validated
 * by Zod. digest field fingerprints logical state for reviewer checks.
 * exportedAt is metadata only and does not affect simulation determinism.
 */
import { digestCanonical } from '@/debug/digest';
import { BUILD_VERSION, MILESTONE, SCHEMA_VERSION } from '@/shared/version';
import type { DomainEvent } from '@/simulation/core/events';
import type { WorldSnapshot } from '@/simulation/core/toySim';
import { DEFAULT_BRANCH_ID } from '@/simulation/core/toySim';
import { saveBundleSchema, type SaveBundle } from './schemas/saveBundle';

export interface SaveBundleInput {
  snapshot: WorldSnapshot;
  exportedAt?: string;
}

export function buildSaveBundle(input: SaveBundleInput): SaveBundle {
  const snapshot = {
    ...input.snapshot,
    schemaVersion: SCHEMA_VERSION,
  };

  const digestPayload = {
    schemaVersion: SCHEMA_VERSION,
    worldSeed: snapshot.worldSeed,
    branchId: snapshot.branchId,
    clock: snapshot.clock,
    prng: snapshot.prng,
    toy: snapshot.toy,
    eventIds: snapshot.events.map((event: DomainEvent) => event.id),
  };

  const bundle = saveBundleSchema.parse({
    schemaVersion: SCHEMA_VERSION,
    buildVersion: BUILD_VERSION,
    milestone: MILESTONE,
    worldSeed: snapshot.worldSeed,
    branch: {
      branchId: snapshot.branchId ?? DEFAULT_BRANCH_ID,
    },
    snapshot,
    eventSegment: snapshot.events,
    digest: digestCanonical(digestPayload),
    exportedAt: input.exportedAt ?? new Date(0).toISOString(),
  });

  return bundle;
}

export function serializeSaveBundle(bundle: SaveBundle): string {
  return JSON.stringify(bundle, null, 2);
}
