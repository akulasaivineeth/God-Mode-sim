import { useCallback, useEffect, useRef, useState } from 'react';
import { Scene } from '@/rendering/Scene';
import { CAMERA_PRESETS, cameraViewFromQuery, type CameraView } from '@/rendering/cameraPresets';
import {
  dollyPlayerCamera,
  getPlayerCameraState,
  recenterOrbitOnPoint,
} from '@/rendering/cameraPlayerControl';
import { terrainHeightAt } from '@/world/townLayout';
import {
  assertCameraOutsideFacilityBuilding,
  computeFacilityStreetPreset,
  type FacilityStreetView,
} from '@/rendering/facilityStreetCamera';
import { getCitizenBody, getCitizenWorldBoundsFromRegistry } from '@/rendering/citizenBoundsRegistry';
import {
  advanceCitizenMixer,
  getCitizenClipDuration,
  seekCitizenClipPhase,
} from '@/rendering/citizenPresentationControl';
import {
  KENNEY_ALEX_MODEL_HEIGHT,
  TARGET_CITIZEN_HEIGHT,
} from '@/rendering/citizenModelScale';
import {
  assertCitizenVisibilityContract,
  computePortraitCameraFromBounds,
  getCitizenWorldBounds,
  hasUnobstructedLineOfSight,
  projectBoundsToScreen,
  type PortraitOpts,
  type ScreenProjection,
} from '@/rendering/evidencePortrait';
import { getEvidenceRendererContext } from '@/rendering/evidenceRendererRegistry';
import {
  assertRiverEvidenceSemantics,
  computeRiverBridgePreset,
  riverFrameVectorsAtBridge,
} from '@/rendering/riverBridgeCamera';
import { SimulationDriver } from '@/simulation/SimulationDriver';
import type { SimSpeed } from '@/simulation/core/speed';
import { CANONICAL_TOWN } from '@/world/townLayout';
import { CitizenInspector } from '@/ui/components/CitizenInspector';
import { CameraControlStrip } from '@/ui/components/CameraControlStrip';
import { DiagnosticsHud } from '@/ui/components/DiagnosticsHud';
import { TimeControls } from '@/ui/components/TimeControls';
import { useDiagnosticsStore } from '@/ui/stores/diagnosticsStore';

export type EvidencePortraitOptions = PortraitOpts;

export interface CitizenBoundsSnapshot {
  min: [number, number, number];
  max: [number, number, number];
  center: [number, number, number];
  radius: number;
}

/** Read-only evidence harness hooks (presentation only — zero simulation authority). */
export interface GodModeEvidenceApi {
  setCamera: (position: [number, number, number], target: [number, number, number]) => void;
  applyPreset: (view: CameraView) => void;
  clearCameraOverride: () => void;
  setSpeed: (speed: SimSpeed) => void;
  /** Headless-safe authoritative clock seek (same worker STEP path as gameplay). */
  stepSimulationMinutes: (count: number) => Promise<void>;
  stepToSimMinute: (targetMinute: number) => Promise<void>;
  setEvidencePortraitMode: (enabled: boolean) => void;
  frameCitizenPortrait: (opts?: EvidencePortraitOptions) => CitizenBoundsSnapshot;
  getCitizenWorldBounds: () => CitizenBoundsSnapshot | null;
  getCitizenScreenProjection: () => ScreenProjection | null;
  assertCitizenVisibility: (minAreaFraction?: number, minPixelHeight?: number) => ScreenProjection;
  assertPortraitLineOfSight: () => { ok: true };
  assertRiverEvidenceSemantics: () => { ok: boolean; reason?: string };
  getRiverBridgeTarget: () => { x: number; z: number };
  getCameraState: () => {
    position: [number, number, number];
    target: [number, number, number];
  } | null;
  getCaptureMeta: () => {
    citizenId: string;
    activity: string;
    pose: string | null;
    clip: string | null;
    clipPhase: number;
    simMinute: number;
    speed: number;
    animationsSuppressed: boolean;
    isDaylight: boolean;
    citizenPosition: { x: number; z: number; facingRadians: number } | null;
  };
  getRenderDiagnostics: () => { drawCalls: number; triangles: number };
  /** Bounds-derived full-body portrait from live rendered citizen (presentation only). */
  frameCitizenSimPortrait: (opts?: {
    margin?: number;
    minScreenAreaFraction?: number;
  }) => void;
  /** Seek active clip to normalized phase while sim is paused (presentation only). */
  seekPresentationClipPhase: (phase: number) => number;
  /** Advance presentation mixer by seconds at speed 0 (dual-frame proof). */
  advancePresentationMixer: (deltaSeconds: number) => void;
  getPresentationClipDuration: () => number;
  getCitizenModelScaleInfo: () => {
    targetHeight: number;
    registryHeight: number;
    computedScale: number;
    formula: string;
  };
  assertStreetCameraGeometry: (view: FacilityStreetView) => { ok: boolean; reason?: string };
  getFacilityStreetPreset: (view: FacilityStreetView) => {
    position: [number, number, number];
    target: [number, number, number];
  };
}

export interface GodModePlayerCameraApi {
  getState: () => ReturnType<typeof getPlayerCameraState>;
  zoomIn: () => boolean;
  zoomOut: () => boolean;
  recenterOnCitizen: () => boolean;
}

declare global {
  interface Window {
    __GODMODE_EVIDENCE__?: GodModeEvidenceApi;
    __GODMODE_PLAYER_CAMERA__?: GodModePlayerCameraApi;
  }
}

export const CANONICAL_M02_SEED = 'GODMODE_M02_CANONICAL_2026';

import { Sphere, Vector3 } from 'three';

function boundsSnapshot(body: NonNullable<ReturnType<typeof getCitizenBody>>): CitizenBoundsSnapshot {
  const box = getCitizenWorldBounds(body);
  const center = new Vector3();
  const sphere = new Sphere();
  box.getCenter(center);
  box.getBoundingSphere(sphere);
  return {
    min: [box.min.x, box.min.y, box.min.z],
    max: [box.max.x, box.max.y, box.max.z],
    center: [center.x, center.y, center.z],
    radius: sphere.radius,
  };
}

function getEvidenceCamera(): ReturnType<typeof getEvidenceRendererContext> {
  return getEvidenceRendererContext();
}

export function App() {
  const driverRef = useRef<SimulationDriver | null>(null);
  const renderSnapshot = useDiagnosticsStore((state) => state.renderSnapshot);
  const animationsSuppressed = useDiagnosticsStore((state) => state.animationsSuppressed);
  const setSeed = useDiagnosticsStore((state) => state.setSeed);
  const recordStep = useDiagnosticsStore((state) => state.recordStep);
  const setDigest = useDiagnosticsStore((state) => state.setDigest);
  const setWorkerReady = useDiagnosticsStore((state) => state.setWorkerReady);
  const setSpeedStatus = useDiagnosticsStore((state) => state.setSpeedStatus);
  const setCitizenSelected = useDiagnosticsStore((state) => state.setCitizenSelected);

  const [cameraView, setCameraView] = useState<CameraView>(
    () => cameraViewFromQuery(window.location.search) ?? 'angled',
  );
  const [cameraNonce, setCameraNonce] = useState(0);

  useEffect(() => {
    const fromQuery = cameraViewFromQuery(window.location.search);
    if (fromQuery) {
      setCameraView(fromQuery);
      setCameraNonce((n) => n + 1);
    }
  }, []);

  useEffect(() => {
    window.__GODMODE_PLAYER_CAMERA__ = {
      getState: () => getPlayerCameraState(),
      zoomIn: () => dollyPlayerCamera(0.82),
      zoomOut: () => dollyPlayerCamera(1.22),
      recenterOnCitizen: () => {
        const citizen = useDiagnosticsStore.getState().renderSnapshot?.citizens?.[0];
        if (!citizen) return false;
        const y = terrainHeightAt(citizen.x, citizen.z) + 0.95;
        return recenterOrbitOnPoint(citizen.x, y, citizen.z, true);
      },
    };
    return () => {
      delete window.__GODMODE_PLAYER_CAMERA__;
    };
  }, []);

  useEffect(() => {
    window.__GODMODE_EVIDENCE__ = {
      setCamera: (position, target) => {
        useDiagnosticsStore.getState().setCameraOverride({ position, target });
      },
      applyPreset: (view) => {
        const store = useDiagnosticsStore.getState();
        store.setCameraOverride(null);
        store.setEvidencePortraitOpts(null);
        store.setActiveCameraView(view);
        setCameraView(view);
        setCameraNonce((n) => n + 1);
      },
      clearCameraOverride: () => {
        useDiagnosticsStore.getState().setCameraOverride(null);
        setCameraNonce((n) => n + 1);
      },
      setSpeed: (speed) => {
        driverRef.current?.setSpeed(speed);
      },
      stepSimulationMinutes: async (count) => {
        const driver = driverRef.current;
        if (!driver) {
          throw new Error('Simulation driver unavailable');
        }
        await driver.stepMinutes(count);
      },
      stepToSimMinute: async (targetMinute) => {
        const driver = driverRef.current;
        if (!driver) {
          throw new Error('Simulation driver unavailable');
        }
        const current = useDiagnosticsStore.getState().renderSnapshot?.simMinute ?? 0;
        const delta = targetMinute - current;
        if (delta > 0) {
          await driver.stepMinutes(delta);
        }
      },
      setEvidencePortraitMode: (enabled) => {
        useDiagnosticsStore.getState().setEvidencePortraitMode(enabled);
      },
      frameCitizenPortrait: (opts = {}) => {
        const state = useDiagnosticsStore.getState();
        const cached = getCitizenWorldBoundsFromRegistry();
        const body = getCitizenBody();
        if ((!cached || cached.isEmpty()) && !body) {
          throw new Error('No citizen body mesh for portrait framing');
        }
        const ctx = getEvidenceCamera();
        if (!ctx) {
          throw new Error('Renderer camera/scene unavailable for portrait framing');
        }
        state.setEvidencePortraitOpts(opts);
        const frame = computePortraitCameraFromBounds(
          body,
          ctx.camera,
          ctx.scene,
          ctx.width,
          ctx.height,
          opts,
        );
        state.setCameraOverride(frame);
        const cachedBounds = getCitizenWorldBoundsFromRegistry();
        if (cachedBounds && !cachedBounds.isEmpty()) {
          const center = new Vector3();
          const sphere = new Sphere();
          cachedBounds.getCenter(center);
          cachedBounds.getBoundingSphere(sphere);
          return {
            min: [cachedBounds.min.x, cachedBounds.min.y, cachedBounds.min.z],
            max: [cachedBounds.max.x, cachedBounds.max.y, cachedBounds.max.z],
            center: [center.x, center.y, center.z],
            radius: sphere.radius,
          };
        }
        if (!body) {
          throw new Error('No citizen bounds available after portrait framing');
        }
        return boundsSnapshot(body);
      },
      getCitizenWorldBounds: () => {
        const cached = getCitizenWorldBoundsFromRegistry();
        if (cached && !cached.isEmpty()) {
          const center = new Vector3();
          const sphere = new Sphere();
          cached.getCenter(center);
          cached.getBoundingSphere(sphere);
          return {
            min: [cached.min.x, cached.min.y, cached.min.z],
            max: [cached.max.x, cached.max.y, cached.max.z],
            center: [center.x, center.y, center.z],
            radius: sphere.radius,
          };
        }
        const body = getCitizenBody();
        if (!body) return null;
        return boundsSnapshot(body);
      },
      getCitizenScreenProjection: () => {
        const body = getCitizenBody();
        const cached = getCitizenWorldBoundsFromRegistry();
        const ctx = getEvidenceCamera();
        if (!ctx) return null;
        const box = body ? getCitizenWorldBounds(body) : cached && !cached.isEmpty() ? cached : null;
        if (!box) return null;
        ctx.camera.updateMatrixWorld();
        return projectBoundsToScreen(box, ctx.camera, ctx.width, ctx.height);
      },
      assertCitizenVisibility: (minAreaFraction = 0.045, minPixelHeight = 72) => {
        const projection = window.__GODMODE_EVIDENCE__?.getCitizenScreenProjection();
        if (!projection) {
          throw new Error('Citizen screen projection unavailable');
        }
        const result = assertCitizenVisibilityContract(projection, minAreaFraction, minPixelHeight);
        if (!result.ok) {
          throw new Error(result.reason);
        }
        return projection;
      },
      assertPortraitLineOfSight: () => {
        const ctx = getEvidenceCamera();
        const body = getCitizenBody();
        if (!ctx || !body) {
          throw new Error('Portrait line-of-sight check requires live renderer context and citizen body');
        }
        const bounds = getCitizenWorldBounds(body);
        const clear = hasUnobstructedLineOfSight(ctx.camera.position, bounds, ctx.scene, body);
        if (!clear) {
          throw new Error('Portrait camera line-of-sight blocked by scene geometry');
        }
        return { ok: true as const };
      },
      assertRiverEvidenceSemantics: () => {
        const river = computeRiverBridgePreset();
        const { bridge } = riverFrameVectorsAtBridge(CANONICAL_TOWN.river.points, 0);
        const check = assertRiverEvidenceSemantics(
          river,
          CAMERA_PRESETS.overview,
          CAMERA_PRESETS.angled,
          bridge.x,
          bridge.z,
        );
        return check.ok ? { ok: true } : { ok: false, reason: check.reason };
      },
      getRiverBridgeTarget: () => {
        const { bridge } = riverFrameVectorsAtBridge(CANONICAL_TOWN.river.points, 0);
        return { x: bridge.x, z: bridge.z };
      },
      getCameraState: () => {
        const state = useDiagnosticsStore.getState();
        if (state.cameraOverride) {
          return state.cameraOverride;
        }
        const preset = CAMERA_PRESETS[state.activeCameraView];
        return { position: [...preset.position], target: [...preset.target] };
      },
      getCaptureMeta: () => {
        const state = useDiagnosticsStore.getState();
        const citizen = state.renderSnapshot?.citizens?.[0] ?? null;
        const calendar = state.renderSnapshot?.calendar;
        return {
          citizenId: citizen?.id ?? '',
          activity: citizen?.activity ?? '',
          pose: citizen?.pose ?? state.citizenPresentationPose,
          clip: state.citizenPresentationClip,
          clipPhase: state.citizenPresentationClipTime,
          simMinute: state.renderSnapshot?.simMinute ?? 0,
          speed: driverRef.current?.getSpeed() ?? state.speed,
          animationsSuppressed: state.animationsSuppressed,
          isDaylight: calendar?.isDaytime ?? true,
          citizenPosition: citizen
            ? { x: citizen.x, z: citizen.z, facingRadians: citizen.facingRadians }
            : null,
        };
      },
      getRenderDiagnostics: () => {
        const state = useDiagnosticsStore.getState();
        return { drawCalls: state.renderCalls, triangles: state.renderTriangles };
      },
      frameCitizenSimPortrait: (opts = {}) => {
        window.__GODMODE_EVIDENCE__?.frameCitizenPortrait({
          margin: opts.margin ?? 1.35,
          minScreenAreaFraction: opts.minScreenAreaFraction ?? 0.06,
        });
      },
      seekPresentationClipPhase: (phase) => seekCitizenClipPhase(phase),
      advancePresentationMixer: (deltaSeconds) => advanceCitizenMixer(deltaSeconds),
      getPresentationClipDuration: () => getCitizenClipDuration(),
      getCitizenModelScaleInfo: () => ({
        targetHeight: TARGET_CITIZEN_HEIGHT,
        registryHeight: KENNEY_ALEX_MODEL_HEIGHT,
        computedScale: TARGET_CITIZEN_HEIGHT / KENNEY_ALEX_MODEL_HEIGHT,
        formula: 'TARGET_CITIZEN_HEIGHT / measuredAlexLocalHeight',
      }),
      assertStreetCameraGeometry: (view: FacilityStreetView) => {
        const state = useDiagnosticsStore.getState();
        const preset = state.cameraOverride ?? computeFacilityStreetPreset(view);
        const check = assertCameraOutsideFacilityBuilding(preset.position, view);
        return check.ok ? { ok: true } : { ok: false, reason: check.reason };
      },
      getFacilityStreetPreset: (view: FacilityStreetView) => {
        const preset = computeFacilityStreetPreset(view);
        return { position: [...preset.position], target: [...preset.target] };
      },
    };
    return () => {
      delete window.__GODMODE_EVIDENCE__;
    };
  }, []);

  useEffect(() => {
    const evidenceCaptureMode = new URLSearchParams(window.location.search).get('evidence') === '1';
    const driver = new SimulationDriver({
      onReady: (seed) => {
        setSeed(seed);
        setWorkerReady(true);
        // Freeze sim at minute 0 before the capture harness attaches (presentation only).
        if (evidenceCaptureMode) {
          driver.setSpeed(0);
        }
      },
      onStepComplete: (snapshot, stepMs) => {
        recordStep(snapshot, stepMs);
      },
      onDigest: (digest) => setDigest(digest),
      onSpeedChange: (status) => setSpeedStatus(status),
      onError: (message) => console.error(message),
    });

    driverRef.current = driver;
    driver.init(CANONICAL_M02_SEED);

    return () => {
      driver.terminate();
      driverRef.current = null;
    };
  }, [recordStep, setDigest, setSeed, setSpeedStatus, setWorkerReady]);

  const handleSelectSpeed = useCallback((speed: SimSpeed) => {
    driverRef.current?.setSpeed(speed);
  }, []);

  const handleSelectView = useCallback((view: CameraView) => {
    const store = useDiagnosticsStore.getState();
    store.setCameraOverride(null);
    store.setEvidencePortraitOpts(null);
    store.setActiveCameraView(view);
    setCameraView(view);
    setCameraNonce((nonce) => nonce + 1);
  }, []);

  const handleResetCamera = useCallback(() => {
    const store = useDiagnosticsStore.getState();
    store.setCameraOverride(null);
    store.setEvidencePortraitOpts(null);
    store.setActiveCameraView(cameraView);
    setCameraNonce((nonce) => nonce + 1);
  }, [cameraView]);

  const handleSelectCitizen = useCallback(() => {
    setCitizenSelected(true);
  }, [setCitizenSelected]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0b0d10' }}>
      <Scene
        renderSnapshot={renderSnapshot}
        cameraView={cameraView}
        cameraNonce={cameraNonce}
        animationsSuppressed={animationsSuppressed}
        onSelectCitizen={handleSelectCitizen}
      />

      <CameraControlStrip
        activeView={cameraView}
        onSelectView={handleSelectView}
        onReset={handleResetCamera}
      />

      <CitizenInspector />
      <TimeControls onSelectSpeed={handleSelectSpeed} />
      <DiagnosticsHud />
    </div>
  );
}
