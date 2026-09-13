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

  constructor(callbacks: SimulationDriverCallbacks = {}) {
    this.callbacks = callbacks;
    this.client = new SimulationClient({
      ...callbacks,
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

  selectCitizen(citizenId: string | null): void {
    this.client.selectCitizen(citizenId);
  }

  terminate(): void {
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
