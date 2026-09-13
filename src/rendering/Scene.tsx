/**
 * 3D scene composition — VIS / WORLD-001 / M02 citizens.
 */
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import { useDiagnosticsStore } from '@/ui/stores/diagnosticsStore';
import { CameraControls } from './CameraControls';
import { CAMERA_PRESETS, type CameraView } from './cameraPresets';
import { CitizenMesh } from './CitizenMesh';
import { DayNightLighting } from './DayNightLighting';
import { FacilityInteractionSpots } from './FacilityInteractionSpots';
import { RouteMarkers } from './RouteMarkers';
import { Town } from './Town';
import type { RenderSnapshot } from './types';

interface SceneProps {
  renderSnapshot: RenderSnapshot | null;
  cameraView: CameraView;
  cameraNonce: number;
  animationsSuppressed: boolean;
  onSelectCitizen: (citizenId: string) => void;
}

function FpsTracker() {
  const setFps = useDiagnosticsStore((state) => state.setFps);
  const setRenderStats = useDiagnosticsStore((state) => state.setRenderStats);
  const frames = useRef({ count: 0, lastAt: performance.now() });

  useFrame((state) => {
    frames.current.count += 1;
    const now = performance.now();
    if (now - frames.current.lastAt >= 1000) {
      setFps(frames.current.count);
      const info = state.gl.info.render;
      setRenderStats(info.calls, info.triangles);
      frames.current.count = 0;
      frames.current.lastAt = now;
    }
  });

  return null;
}

function SimBeacon({
  visualPhase,
  suppressed,
}: {
  visualPhase: number;
  suppressed: boolean;
}) {
  const meshRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const targetRotation = visualPhase * Math.PI * 2;
    if (suppressed) {
      mesh.rotation.y = targetRotation;
    } else {
      mesh.rotation.y += delta * (0.6 + visualPhase);
    }
    mesh.position.y = 16 + Math.sin(visualPhase * Math.PI * 2) * 0.4;
  });

  return (
    <mesh ref={meshRef} position={[0, 16, 0]} castShadow>
      <octahedronGeometry args={[1.1, 0]} />
      <meshStandardMaterial color="#e8c15a" emissive="#7a5f10" emissiveIntensity={0.4} />
    </mesh>
  );
}

export function Scene({
  renderSnapshot,
  cameraView,
  cameraNonce,
  animationsSuppressed,
  onSelectCitizen,
}: SceneProps) {
  const timeOfDay = renderSnapshot?.timeOfDay ?? 0.25;
  const visualPhase = renderSnapshot?.visualPhase ?? 0;
  const citizens = renderSnapshot?.citizens ?? [];

  return (
    <Canvas
      data-testid="r3f-canvas"
      style={{ width: '100%', height: '100%' }}
      camera={{ position: CAMERA_PRESETS.angled.position, fov: 45, near: 0.1, far: 500 }}
      shadows
    >
      <FpsTracker />
      <CameraControls view={cameraView} applyNonce={cameraNonce} />
      <DayNightLighting timeOfDay={timeOfDay} />
      <Town />
      <FacilityInteractionSpots />
      <RouteMarkers />
      {citizens.map((citizen) => (
        <CitizenMesh
          key={citizen.id}
          citizen={citizen}
          animationsSuppressed={animationsSuppressed}
          onSelect={onSelectCitizen}
        />
      ))}
      <SimBeacon visualPhase={visualPhase} suppressed={animationsSuppressed} />
    </Canvas>
  );
}
