import { create } from 'zustand';
import type { RenderSnapshot } from '@/rendering/types';
import { DEFAULT_SPEED, type SimSpeed } from '@/simulation/core/speed';

interface DiagnosticsState {
  seed: string;
  fps: number;
  lastWorkerStepMs: number;
  totalSteps: number;
  renderSnapshot: RenderSnapshot | null;
  lastDigest: string | null;
  workerReady: boolean;
  /** UI-only mirror of the driver speed (not simulation authority). */
  speed: SimSpeed;
  paused: boolean;
  animationsSuppressed: boolean;
  /** Renderer draw calls in the last frame (perf evidence). */
  renderCalls: number;
  /** Rendered triangles in the last frame (perf evidence). */
  renderTriangles: number;
  setSeed: (seed: string) => void;
  setFps: (fps: number) => void;
  setRenderStats: (calls: number, triangles: number) => void;
  recordStep: (renderSnapshot: RenderSnapshot, stepMs: number) => void;
  setDigest: (digest: string) => void;
  setWorkerReady: (ready: boolean) => void;
  setSpeedStatus: (status: {
    speed: SimSpeed;
    paused: boolean;
    animationsSuppressed: boolean;
  }) => void;
}

export const useDiagnosticsStore = create<DiagnosticsState>((set) => ({
  seed: '',
  fps: 0,
  lastWorkerStepMs: 0,
  totalSteps: 0,
  renderSnapshot: null,
  lastDigest: null,
  workerReady: false,
  speed: DEFAULT_SPEED,
  paused: false,
  animationsSuppressed: false,
  renderCalls: 0,
  renderTriangles: 0,
  setSeed: (seed) => set({ seed }),
  setFps: (fps) => set({ fps }),
  setRenderStats: (calls, triangles) => set({ renderCalls: calls, renderTriangles: triangles }),
  recordStep: (renderSnapshot, stepMs) =>
    set((state) => ({
      renderSnapshot,
      lastWorkerStepMs: stepMs,
      totalSteps: state.totalSteps + 1,
    })),
  setDigest: (digest) => set({ lastDigest: digest }),
  setWorkerReady: (ready) => set({ workerReady: ready }),
  setSpeedStatus: (status) =>
    set({
      speed: status.speed,
      paused: status.paused,
      animationsSuppressed: status.animationsSuppressed,
    }),
}));
