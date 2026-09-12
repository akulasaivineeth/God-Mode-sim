import { useEffect, useRef } from 'react';
import { Scene } from '@/rendering/Scene';
import { SimulationClient } from '@/simulation/SimulationClient';
import { DiagnosticsHud } from '@/ui/components/DiagnosticsHud';
import { useDiagnosticsStore } from '@/ui/stores/diagnosticsStore';

export const CANONICAL_M00_SEED = 'GODMODE_M00_CANONICAL_2026';

export function App() {
  const clientRef = useRef<SimulationClient | null>(null);
  const renderSnapshot = useDiagnosticsStore((state) => state.renderSnapshot);
  const setSeed = useDiagnosticsStore((state) => state.setSeed);
  const recordStep = useDiagnosticsStore((state) => state.recordStep);
  const setDigest = useDiagnosticsStore((state) => state.setDigest);
  const setWorkerReady = useDiagnosticsStore((state) => state.setWorkerReady);

  useEffect(() => {
    const client = new SimulationClient({
      onReady: (seed) => {
        setSeed(seed);
        setWorkerReady(true);
        client.getDigest();
      },
      onStepComplete: (snapshot, stepMs) => {
        recordStep(snapshot, stepMs);
        client.getDigest();
      },
      onDigest: (digest) => setDigest(digest),
      onError: (message) => console.error(message),
    });

    clientRef.current = client;
    client.init(CANONICAL_M00_SEED);

    const interval = window.setInterval(() => {
      client.step(1);
    }, 500);

    return () => {
      window.clearInterval(interval);
      client.terminate();
      clientRef.current = null;
    };
  }, [recordStep, setDigest, setSeed, setWorkerReady]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0b0d10' }}>
      <Scene renderSnapshot={renderSnapshot} />
      <DiagnosticsHud />
    </div>
  );
}
