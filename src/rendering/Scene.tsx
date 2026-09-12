import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useDiagnosticsStore } from '@/ui/stores/diagnosticsStore';
import type { RenderSnapshot } from './types';
import { WorldPlaceholder } from './WorldPlaceholder';

interface SceneProps {
  renderSnapshot: RenderSnapshot | null;
}

function FpsTracker() {
  const setFps = useDiagnosticsStore((state) => state.setFps);
  const frames = useRef({ count: 0, lastAt: performance.now() });

  useFrame(() => {
    frames.current.count += 1;
    const now = performance.now();
    if (now - frames.current.lastAt >= 1000) {
      setFps(frames.current.count);
      frames.current.count = 0;
      frames.current.lastAt = now;
    }
  });

  return null;
}

export function Scene({ renderSnapshot }: SceneProps) {
  return (
    <Canvas
      data-testid="r3f-canvas"
      style={{ width: '100%', height: '100%' }}
      camera={{ position: [4, 4, 6], fov: 45 }}
      shadows
    >
      <FpsTracker />
      <WorldPlaceholder renderSnapshot={renderSnapshot} />
    </Canvas>
  );
}
