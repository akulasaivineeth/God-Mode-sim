/**
 * Real-time simulation pacing driver — SIM-TIME-002 / SIM-TIME-003 / ARCH-005.
 *
 * Plain English: The worker owns the clock but has no concept of real time. This
 * main-thread driver runs an animation loop, and each frame it converts elapsed
 * real time × the selected speed into a whole number of simulated minutes, then
 * asks the worker to advance exactly that many minutes via STEP { count }.
 *
 * Because the worker's state depends only on the TOTAL minutes stepped (not on
 * how they were paced or batched), 1× and 1000× produce identical worlds for the
 * same simulated duration (ARCH-005). Pause simply advances zero minutes while
 * the loop — and therefore the camera/UI — keeps running (UAT-TIME-001).
 */
import { SimulationClient, type SimulationClientCallbacks } from './SimulationClient';
import {
  accumulateSimMinutes,
  createPacingState,
  DEFAULT_SPEED,
  isAnimationSuppressed,
  isPaused,
  type PacingState,
  type SimSpeed,
} from './core/speed';

export interface SpeedStatus {
  speed: SimSpeed;
  paused: boolean;
  animationsSuppressed: boolean;
}

export interface SimulationDriverCallbacks extends SimulationClientCallbacks {
  onSpeedChange?: (status: SpeedStatus) => void;
}

export class SimulationDriver {
  private readonly client: SimulationClient;
  private readonly callbacks: SimulationDriverCallbacks;
  private speed: SimSpeed = DEFAULT_SPEED;
  private pacing: PacingState = createPacingState();
  private ready = false;
  private rafId: number | null = null;
  private lastFrameAt = 0;
  private pendingStepResolve: (() => void) | null = null;
  private pendingStepReject: ((error: Error) => void) | null = null;
  private pendingStepTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(callbacks: SimulationDriverCallbacks = {}) {
    this.callbacks = callbacks;
    this.client = new SimulationClient({
      ...callbacks,
      onStepComplete: (snapshot, stepMs) => {
        callbacks.onStepComplete?.(snapshot, stepMs);
        if (this.pendingStepResolve) {
          const resolve = this.pendingStepResolve;
          this.clearPendingStep();
          resolve();
        }
      },
      onError: (message) => {
        if (this.pendingStepReject) {
          const reject = this.pendingStepReject;
          this.clearPendingStep();
          reject(new Error(message));
        }
        callbacks.onError?.(message);
      },
      onReady: (seed) => {
        this.ready = true;
        this.pacing = createPacingState();
        this.lastFrameAt = now();
        callbacks.onReady?.(seed);
        this.startLoop();
      },
    });
  }

  init(seed: string): void {
    this.client.init(seed);
  }

  getSpeed(): SimSpeed {
    return this.speed;
  }

  status(): SpeedStatus {
    return {
      speed: this.speed,
      paused: isPaused(this.speed),
      animationsSuppressed: isAnimationSuppressed(this.speed),
    };
  }

  setSpeed(speed: SimSpeed): void {
    this.speed = speed;
    // Reset the frame timer so real time that elapsed under the previous speed
    // (or while paused) is not retroactively applied at the new speed.
    this.lastFrameAt = now();
    this.callbacks.onSpeedChange?.(this.status());
  }

  /**
   * Evidence / test helper — advance the authoritative clock by exactly `count`
   * simulated minutes without relying on rAF pacing (headless-safe).
   */
  stepMinutes(count: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.ready) {
        reject(new Error('Simulation driver not ready'));
        return;
      }
      if (count <= 0) {
        resolve();
        return;
      }
      if (this.pendingStepResolve) {
        reject(new Error('Concurrent stepMinutes call'));
        return;
      }
      this.pendingStepResolve = resolve;
      this.pendingStepReject = reject;
      this.pendingStepTimer = setTimeout(() => {
        this.clearPendingStep();
        reject(new Error(`stepMinutes(${count}) timed out`));
      }, 120_000);
      this.client.step(count);
    });
  }

  private clearPendingStep(): void {
    if (this.pendingStepTimer) {
      clearTimeout(this.pendingStepTimer);
      this.pendingStepTimer = null;
    }
    this.pendingStepResolve = null;
    this.pendingStepReject = null;
  }

  terminate(): void {
    this.clearPendingStep();
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.client.terminate();
  }

  private startLoop(): void {
    if (this.rafId !== null) {
      return;
    }
    const tick = () => {
      const current = now();
      const elapsed = current - this.lastFrameAt;
      this.lastFrameAt = current;

      if (this.ready && !isPaused(this.speed)) {
        const result = accumulateSimMinutes(this.pacing, elapsed, this.speed);
        this.pacing = result.next;
        if (result.minutes > 0) {
          this.client.step(result.minutes);
        }
      }

      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }
}

function now(): number {
  return performance.now();
}
