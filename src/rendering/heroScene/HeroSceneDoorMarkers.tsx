/**
 * WF02 R15.4 Strategy A Phase 0 — thin door socket markers for M02 validation.
 */
import { terrainHeightAt } from '@/world/townLayout';
import manifest from './heroNeighborhoodSceneManifest.json';
import { resolveHeroSceneDoorWorldPosition } from './heroSceneDoorValidation';

const SOCKET_LABELS = ['home-door', 'store-door', 'workshop-door'] as const;

export function HeroSceneDoorMarkers() {
  return (
    <group name="r15-scene-door-sockets">
      {SOCKET_LABELS.map((label) => {
        const socket = manifest.doorSockets.find((s) => s.label === label);
        if (!socket) return null;
        const pos = resolveHeroSceneDoorWorldPosition(socket);
        const y = terrainHeightAt(pos.x, pos.z) + 0.05;
        return (
          <mesh key={label} position={[pos.x, y, pos.z]} castShadow>
            <boxGeometry args={[0.5, 1.0, 0.12]} />
            <meshStandardMaterial color={label === 'home-door' ? '#c8a060' : '#8090b0'} />
          </mesh>
        );
      })}
    </group>
  );
}
