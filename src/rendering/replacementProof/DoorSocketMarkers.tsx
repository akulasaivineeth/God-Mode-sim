/**
 * WF02 R15 Candidate C Phase 0 — thin door socket markers (semantic authority separate from assembly mass).
 */
import { terrainHeightAt } from '@/world/townLayout';
import { R13_PROTOTYPE_SHELLS } from '@/rendering/prototypeShell/prototypeShellRegistry';
import { resolveShellDoorWorldPosition } from '@/rendering/prototypeShell/prototypeShellBounds';

const SOCKET_LABELS = ['home-door', 'store-door', 'workshop-door'] as const;

function resolveSocketPosition(label: (typeof SOCKET_LABELS)[number]): { x: number; z: number } | null {
  if (label === 'home-door') {
    const cottage = R13_PROTOTYPE_SHELLS.find((s) => s.shellId === 'residential-cottage-shell');
    return cottage ? resolveShellDoorWorldPosition(cottage, label) : null;
  }
  const commercial = R13_PROTOTYPE_SHELLS.find((s) => s.shellId === 'commercial-frontage-shell');
  return commercial ? resolveShellDoorWorldPosition(commercial, label) : null;
}

export function DoorSocketMarkers() {
  return (
    <group name="r15-replacement-door-sockets">
      {SOCKET_LABELS.map((label) => {
        const pos = resolveSocketPosition(label);
        if (!pos) return null;
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
