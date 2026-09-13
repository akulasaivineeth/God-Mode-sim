/**
 * Main-thread bridge to the simulation worker (ARCH-002).
 *
 * Plain English: React talks to this class, not to worker globals. Keeps
 * postMessage types in one place so UI cannot accidentally mutate snapshots.
 */
import type { RenderSnapshot } from '@/rendering/types';
import type { WorkerRequest, WorkerResponse } from './messages';
import type { WorldSnapshot } from './core/toySim';
import SimulationWorker from './worker/simulation.worker?worker';

export interface SimulationClientCallbacks {
  onReady?: (seed: string) => void;
  onStepComplete?: (renderSnapshot: RenderSnapshot, stepMs: number) => void;
  onInspectorUpdated?: (renderSnapshot: RenderSnapshot) => void;
  onSnapshot?: (snapshot: WorldSnapshot) => void;
  onDigest?: (digest: string) => void;
  onError?: (message: string) => void;
}

export class SimulationClient {
  private readonly worker: Worker;
  private readonly callbacks: SimulationClientCallbacks;

  constructor(callbacks: SimulationClientCallbacks = {}) {
    this.callbacks = callbacks;
    this.worker = new SimulationWorker();
    this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      this.handleMessage(event.data);
    };
    this.worker.onerror = () => {
      this.callbacks.onError?.('Simulation worker crashed');
    };
  }

  init(seed: string): void {
    this.post({ type: 'INIT', seed });
  }

  step(count = 1): void {
    this.post({ type: 'STEP', count });
  }

  getSnapshot(): void {
    this.post({ type: 'GET_SNAPSHOT' });
  }

  getDigest(): void {
    this.post({ type: 'GET_DIGEST' });
  }

  loadSnapshot(snapshot: WorldSnapshot): void {
    this.post({ type: 'LOAD_SNAPSHOT', snapshot });
  }

  selectCitizen(citizenId: string | null): void {
    this.post({ type: 'SELECT_CITIZEN', citizenId });
  }

  terminate(): void {
    this.worker.terminate();
  }

  private post(message: WorkerRequest): void {
    this.worker.postMessage(message);
  }

  private handleMessage(response: WorkerResponse): void {
    switch (response.type) {
      case 'READY':
        this.callbacks.onReady?.(response.seed);
        break;
      case 'STEP_COMPLETE':
        this.callbacks.onStepComplete?.(response.renderSnapshot, response.stepMs);
        break;
      case 'INSPECTOR_UPDATED':
        this.callbacks.onInspectorUpdated?.(response.renderSnapshot);
        break;
      case 'SNAPSHOT':
        this.callbacks.onSnapshot?.(response.snapshot);
        break;
      case 'DIGEST':
        this.callbacks.onDigest?.(response.digest);
        break;
      case 'ERROR':
        this.callbacks.onError?.(response.message);
        break;
      default:
        break;
    }
  }
}
