import type { RenderSnapshot } from '@/rendering/types';
import type { WorldSnapshot } from './core/toySim';

export type WorkerRequest =
  | { type: 'INIT'; seed: string }
  | { type: 'STEP'; count?: number }
  | { type: 'GET_SNAPSHOT' }
  | { type: 'GET_DIGEST' }
  | { type: 'LOAD_SNAPSHOT'; snapshot: WorldSnapshot };

export type WorkerResponse =
  | { type: 'READY'; seed: string }
  | { type: 'STEP_COMPLETE'; renderSnapshot: RenderSnapshot; stepMs: number }
  | { type: 'SNAPSHOT'; snapshot: WorldSnapshot }
  | { type: 'DIGEST'; digest: string }
  | { type: 'ERROR'; message: string };

export interface WorkerMetrics {
  lastStepMs: number;
  totalSteps: number;
}
