import { create } from 'zustand';
import type { CitizenPose } from '@/rendering/citizenPresentation';
import type { RenderSnapshot } from '@/rendering/types';
import { DEFAULT_SPEED, type SimSpeed } from '@/simulation/core/speed';

/** Presentation-only camera override (evidence harness / in-place reframing). */
export interface CameraOverride {
  position: [number, number, number];
  target: [number, number, number];
}

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
  /** Whether the citizen inspector is open (UX-001). */
  citizenSelected: boolean;
  /** Active Kenney clip name on the live citizen (presentation only, not sim authority). */
  citizenPresentationClip: string | null;
  /** Presentation pose mirrored from render snapshot for evidence harness. */
  citizenPresentationPose: CitizenPose | null;
  /** In-place camera override — bypasses named preset without reload. */
  cameraOverride: CameraOverride | null;
  cameraOverrideNonce: number;
  setCitizenSelected: (selected: boolean) => void;
  setCitizenPresentationClip: (clip: string | null) => void;
  setCitizenPresentationPose: (pose: CitizenPose | null) => void;
  setCameraOverride: (override: CameraOverride | null) => void;
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
  citizenSelected: true,
  citizenPresentationClip: null,
  citizenPresentationPose: null,
  cameraOverride: null,
  cameraOverrideNonce: 0,
  setCitizenSelected: (selected) => set({ citizenSelected: selected }),
  setCitizenPresentationClip: (clip) => set({ citizenPresentationClip: clip }),
  setCitizenPresentationPose: (pose) => set({ citizenPresentationPose: pose }),
  setCameraOverride: (override) =>
    set((state) => ({
      cameraOverride: override,
      cameraOverrideNonce: state.cameraOverrideNonce + 1,
    })),
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
