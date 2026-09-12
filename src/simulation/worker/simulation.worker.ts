/// <reference lib="webworker" />
import { digestWorldSnapshot } from '@/debug/worldDigest';
import { toRenderSnapshot } from '@/rendering/types';
import { SCHEMA_VERSION } from '@/shared/version';
import type { WorkerRequest, WorkerResponse } from '../messages';
import {
  createWorldSnapshot,
  stepToySimulation,
  type WorldSnapshot,
} from '../core/toySim';

let snapshot: WorldSnapshot | null = null;

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
  snapshot = createWorldSnapshot(seed, SCHEMA_VERSION);
  post({ type: 'READY', seed });
}

function handleStep(count = 1): void {
  const started = performance.now();
  const current = ensureSnapshot();
  let next = current;
  for (let i = 0; i < count; i += 1) {
    next = stepToySimulation(next).snapshot;
  }
  snapshot = next;
  const stepMs = performance.now() - started;
  post({
    type: 'STEP_COMPLETE',
    renderSnapshot: toRenderSnapshot(snapshot),
    stepMs,
  });
}

function handleLoadSnapshot(loaded: WorldSnapshot): void {
  snapshot = loaded;
  post({
    type: 'STEP_COMPLETE',
    renderSnapshot: toRenderSnapshot(snapshot),
    stepMs: 0,
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
      default:
        post({ type: 'ERROR', message: `Unknown request type` });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown worker error';
    post({ type: 'ERROR', message });
  }
};
