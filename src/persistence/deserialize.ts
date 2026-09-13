/**
 * Save bundle import — ARCH-004.
 *
 * Plain English: Parses and validates saved JSON before the worker accepts
 * LOAD_SNAPSHOT. Invalid files throw rather than corrupting simulation state.
 */
import { saveBundleSchema, type SaveBundle } from './schemas/saveBundle';
import type { WorldSnapshot } from '@/simulation/core/toySim';

export function parseSaveBundle(json: string): SaveBundle {
  const parsed = JSON.parse(json) as unknown;
  return saveBundleSchema.parse(parsed);
}

export function restoreSnapshotFromBundle(bundle: SaveBundle): WorldSnapshot {
  return bundle.snapshot as WorldSnapshot;
}
