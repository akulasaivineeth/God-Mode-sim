import { useCallback, useEffect, useRef, useState } from 'react';
import { Scene } from '@/rendering/Scene';
import { cameraViewFromQuery, type CameraView } from '@/rendering/cameraPresets';
import { SimulationDriver } from '@/simulation/SimulationDriver';
import type { SimSpeed } from '@/simulation/core/speed';
import { CitizenInspector } from '@/ui/components/CitizenInspector';
import { DiagnosticsHud } from '@/ui/components/DiagnosticsHud';
import { TimeControls } from '@/ui/components/TimeControls';
import { useDiagnosticsStore } from '@/ui/stores/diagnosticsStore';

/** Read-only evidence harness hooks (presentation only — zero simulation authority). */
export interface GodModeEvidenceApi {
  setCamera: (position: [number, number, number], target: [number, number, number]) => void;
  applyPreset: (view: CameraView) => void;
  clearCameraOverride: () => void;
  getCaptureMeta: () => {
    activity: string;
    pose: string | null;
    clip: string | null;
    simMinute: number;
    speed: number;
    animationsSuppressed: boolean;
    citizenPosition: { x: number; z: number; facingRadians: number } | null;
  };
}

declare global {
  interface Window {
    __GODMODE_EVIDENCE__?: GodModeEvidenceApi;
  }
}

export const CANONICAL_M02_SEED = 'GODMODE_M02_CANONICAL_2026';

const CAMERA_VIEWS: { id: CameraView; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'angled', label: 'Angled' },
  { id: 'street', label: 'Street' },
];

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
    window.__GODMODE_EVIDENCE__ = {
      setCamera: (position, target) => {
        useDiagnosticsStore.getState().setCameraOverride({ position, target });
      },
      applyPreset: (view) => {
        useDiagnosticsStore.getState().setCameraOverride(null);
        setCameraView(view);
        setCameraNonce((n) => n + 1);
      },
      clearCameraOverride: () => {
        useDiagnosticsStore.getState().setCameraOverride(null);
        setCameraNonce((n) => n + 1);
      },
      getCaptureMeta: () => {
        const state = useDiagnosticsStore.getState();
        const citizen = state.renderSnapshot?.citizens?.[0] ?? null;
        return {
          activity: citizen?.activity ?? '',
          pose: state.citizenPresentationPose,
          clip: state.citizenPresentationClip,
          simMinute: state.renderSnapshot?.simMinute ?? 0,
          speed: state.speed,
          animationsSuppressed: state.animationsSuppressed,
          citizenPosition: citizen
            ? { x: citizen.x, z: citizen.z, facingRadians: citizen.facingRadians }
            : null,
        };
      },
    };
    return () => {
      delete window.__GODMODE_EVIDENCE__;
    };
  }, []);

  useEffect(() => {
    const driver = new SimulationDriver({
      onReady: (seed) => {
        setSeed(seed);
        setWorkerReady(true);
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
    setCameraView(view);
    setCameraNonce((nonce) => nonce + 1);
  }, []);

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

      <div
        data-testid="camera-controls"
        style={{
          position: 'fixed',
          top: 12,
          left: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          padding: 8,
          background: 'rgba(12, 14, 18, 0.88)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8,
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 11,
            color: '#9aa3ab',
          }}
        >
          Camera
        </div>
        {CAMERA_VIEWS.map((view) => {
          const active = view.id === cameraView;
          return (
            <button
              key={view.id}
              data-testid={`camera-${view.id}`}
              onClick={() => handleSelectView(view.id)}
              style={{
                padding: '5px 10px',
                cursor: 'pointer',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: 12,
                color: active ? '#0b0d10' : '#d8dee9',
                background: active ? '#8fb6e0' : 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 6,
                fontWeight: active ? 700 : 500,
              }}
            >
              {view.label}
            </button>
          );
        })}
        <div
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 10,
            color: '#6b7480',
            maxWidth: 120,
          }}
        >
          Drag to rotate · right-drag to pan · scroll to zoom
        </div>
      </div>

      <CitizenInspector />
      <TimeControls onSelectSpeed={handleSelectSpeed} />
      <DiagnosticsHud />
    </div>
  );
}
