/**
 * 3D scene composition — VIS / WORLD-001 / SIM-TIME-004 / ARCH-002.
 *
 * Plain English: Assembles the town, day/night lighting, and free camera. It
 * reads a small read-only RenderSnapshot (time of day, visual phase) and never
 * writes back to simulation truth. At high speed, animation smoothing is
 * suppressed while the authoritative time still drives lighting exactly.
 */
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import { useDiagnosticsStore } from '@/ui/stores/diagnosticsStore';
import { CameraControls } from './CameraControls';
import { CAMERA_PRESETS, type CameraView } from './cameraPresets';
import { DayNightLighting } from './DayNightLighting';
import { Town } from './Town';
import type { RenderSnapshot } from './types';

interface SceneProps {
  renderSnapshot: RenderSnapshot | null;
  cameraView: CameraView;
  cameraNonce: number;
  animationsSuppressed: boolean;
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

/**
 * A small floating marker over the town square that visibly demonstrates the
 * M01 gate: at low speed it eases smoothly; at high speed animation is
 * suppressed and it snaps directly to the authoritative visual phase. Either
 * way it carries no simulation authority.
 */
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
      mesh.rotation.y = targetRotation; // snap — no interpolation at high speed
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
}: SceneProps) {
  const timeOfDay = renderSnapshot?.timeOfDay ?? 0.25;
  const visualPhase = renderSnapshot?.visualPhase ?? 0;

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
      <SimBeacon visualPhase={visualPhase} suppressed={animationsSuppressed} />
    </Canvas>
  );
}
