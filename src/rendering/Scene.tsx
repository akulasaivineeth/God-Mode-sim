/**
 * 3D scene composition — VIS / WORLD-001 / M02 (asset-backed presentation).
 *
 * Plain English: Assembles the town from real CC0 assets (dedicated facility
 * buildings, instanced vegetation, roads/curbs/crossings, continuous terrain +
 * river, town square + park), day/night + practical lighting, the free camera,
 * and the shared GLB citizen. It reads a read-only RenderSnapshot and never
 * writes simulation state (ARCH-002). Asset loaders are wrapped in <Suspense>.
 */
import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useDiagnosticsStore } from '@/ui/stores/diagnosticsStore';
import { CameraControls } from './CameraControls';
import { CAMERA_PRESETS, type CameraView } from './cameraPresets';
import { DayNightLighting } from './DayNightLighting';
import { FacilityInteractionSpots } from './FacilityInteractionSpots';
import { Town } from './Town';
import { DedicatedBuildings } from './assets/BuildingVisualRegistry';
import { CitizenVisual } from './assets/CitizenVisual';
import { CorridorPresentation } from './environment/CorridorPresentation';
import { OverviewCompositionLayer } from './environment/OverviewCompositionLayer';
import { RoadNetwork } from './environment/RoadNetwork';
import { PracticalLighting } from './environment/PracticalLighting';
import { TownAmenities } from './environment/TownAmenities';
import { TownLandscape } from './environment/TownLandscape';
import { VegetationLayer } from './environment/VegetationLayer';
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

function SceneContent({
  renderSnapshot,
  cameraView,
  cameraNonce,
  animationsSuppressed,
  onSelectCitizen,
}: SceneProps) {
  const timeOfDay = renderSnapshot?.timeOfDay ?? 0.25;
  const citizens = renderSnapshot?.citizens ?? [];
  const citizenSelected = useDiagnosticsStore((state) => state.citizenSelected);

  return (
    <>
      <FpsTracker />
      <CameraControls view={cameraView} applyNonce={cameraNonce} />
      <DayNightLighting timeOfDay={timeOfDay} />
      <PracticalLighting timeOfDay={timeOfDay} />
      <TownLandscape />
      <RoadNetwork />
      <Town />
      <CorridorPresentation />
      <OverviewCompositionLayer />
      <TownAmenities />
      <DedicatedBuildings />
      <VegetationLayer />
      <FacilityInteractionSpots />
      {citizens.map((citizen) => (
        <CitizenVisual
          key={citizen.id}
          citizen={citizen}
          selected={citizenSelected}
          animationsSuppressed={animationsSuppressed}
          onSelect={onSelectCitizen}
        />
      ))}
    </>
  );
}

export function Scene({
  renderSnapshot,
  cameraView,
  cameraNonce,
  animationsSuppressed,
  onSelectCitizen,
}: SceneProps) {
  return (
    <Canvas
      data-testid="r3f-canvas"
      style={{ width: '100%', height: '100%' }}
      gl={{ preserveDrawingBuffer: true }}
      camera={{ position: CAMERA_PRESETS.angled.position, fov: 45, near: 0.1, far: 500 }}
      shadows
    >
      <Suspense fallback={null}>
        <SceneContent
          renderSnapshot={renderSnapshot}
          cameraView={cameraView}
          cameraNonce={cameraNonce}
          animationsSuppressed={animationsSuppressed}
          onSelectCitizen={onSelectCitizen}
        />
      </Suspense>
    </Canvas>
  );
}
