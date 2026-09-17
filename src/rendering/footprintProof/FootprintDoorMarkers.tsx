/**
 * WF02 R15.3.1 Candidate E — M02 door markers at footprint-adjusted socket positions.
 */
import { terrainHeightAt } from '@/world/townLayout';
import { resolveFootprintShells, resolveFootprintDoorWorldPosition } from '@/world/worldLab/presentationFootprintSpec';

const SOCKET_LABELS = ['home-door', 'store-door', 'workshop-door'] as const;

function resolveSocketPosition(label: (typeof SOCKET_LABELS)[number]): { x: number; z: number } | null {
  const shells = resolveFootprintShells();
  if (label === 'home-door') {
    const cottage = shells.find((s) => s.shellId === 'residential-cottage-shell');
    return cottage ? resolveFootprintDoorWorldPosition(cottage, label) : null;
  }
  const commercial = shells.find((s) => s.shellId === 'commercial-frontage-shell');
  return commercial ? resolveFootprintDoorWorldPosition(commercial, label) : null;
}

export function FootprintDoorMarkers() {
  return (
    <group name="r15-footprint-door-markers">
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
