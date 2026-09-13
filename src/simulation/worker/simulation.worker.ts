/**
 * Authoritative simulation worker (ARCH-002).
 */
/// <reference lib="webworker" />
import { digestWorldSnapshot } from '@/debug/worldDigest';
import { toRenderSnapshot } from '@/rendering/types';
import { createM02WorldSnapshot } from '@/simulation/core/m02Init';
import { SCHEMA_VERSION } from '@/shared/version';
import type { WorkerRequest, WorkerResponse } from '../messages';
import { createWorldSnapshot, type WorldSnapshot } from '../core/toySim';
import { stepWorldSimulation } from '../core/worldStep';

let snapshot: WorldSnapshot | null = null;
let selectedCitizenId: string | null = 'citizen-alex';

function post(response: WorkerResponse): void {
  self.postMessage(response);
}

function ensureSnapshot(): WorldSnapshot {
  if (!snapshot) {
    throw new Error('Simulation not initialized');
  }
  return snapshot;
}

function handleInit(seed: string): void {
  snapshot = createM02WorldSnapshot(seed, SCHEMA_VERSION);
  selectedCitizenId = 'citizen-alex';
  post({ type: 'READY', seed });
  post({
    type: 'STEP_COMPLETE',
    renderSnapshot: toRenderSnapshot(snapshot, selectedCitizenId),
    stepMs: 0,
  });
}

function handleStep(count = 1): void {
  const started = performance.now();
  const current = ensureSnapshot();
  let next = current;
  for (let i = 0; i < count; i += 1) {
    next = stepWorldSimulation(next).snapshot;
  }
  snapshot = next;
  const stepMs = performance.now() - started;
  post({
    type: 'STEP_COMPLETE',
    renderSnapshot: toRenderSnapshot(snapshot, selectedCitizenId),
    stepMs,
  });
}

function handleLoadSnapshot(loaded: WorldSnapshot): void {
  snapshot = loaded;
  post({
    type: 'STEP_COMPLETE',
    renderSnapshot: toRenderSnapshot(snapshot, selectedCitizenId),
    stepMs: 0,
  });
}

function handleSelectCitizen(citizenId: string | null): void {
  selectedCitizenId = citizenId;
  post({
    type: 'INSPECTOR_UPDATED',
    renderSnapshot: toRenderSnapshot(ensureSnapshot(), selectedCitizenId),
  });
}

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  try {
    const request = event.data;
    switch (request.type) {
      case 'INIT':
        handleInit(request.seed);
        break;
      case 'STEP':
        handleStep(request.count ?? 1);
        break;
      case 'GET_SNAPSHOT':
        post({ type: 'SNAPSHOT', snapshot: ensureSnapshot() });
        break;
      case 'GET_DIGEST':
        post({ type: 'DIGEST', digest: digestWorldSnapshot(ensureSnapshot()) });
        break;
      case 'LOAD_SNAPSHOT':
        handleLoadSnapshot(request.snapshot);
        break;
      case 'SELECT_CITIZEN':
        handleSelectCitizen(request.citizenId);
        break;
      default:
        post({ type: 'ERROR', message: 'Unknown request type' });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown worker error';
    post({ type: 'ERROR', message });
  }
};

// Re-export for tests that still need pure M00 snapshots.
export { createWorldSnapshot };
