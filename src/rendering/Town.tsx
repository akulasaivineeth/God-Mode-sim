/**
 * Town geometry — WORLD-001 / VIS.
 *
 * Plain English: Draws the handcrafted low-poly town from the authored layout
 * (src/world/townLayout.ts). This is display only; it reads immutable authored
 * geometry and never touches simulation state (ARCH-002).
 */
import { useMemo } from 'react';
import {
  CANONICAL_TOWN,
  type AreaRect,
  type Building,
  type RoadSegment,
  type Vec2,
} from '@/world/townLayout';

function segmentTransform(from: Vec2, to: Vec2) {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const length = Math.hypot(dx, dz);
  const angle = Math.atan2(dz, dx);
  const center: [number, number] = [(from.x + to.x) / 2, (from.z + to.z) / 2];
  return { length, angle, center };
}

function FlatStrip({
  from,
  to,
  width,
  color,
  y,
}: {
  from: Vec2;
  to: Vec2;
  width: number;
  color: string;
  y: number;
}) {
  const { length, angle, center } = segmentTransform(from, to);
  return (
    <mesh position={[center[0], y, center[1]]} rotation={[0, -angle, 0]} receiveShadow>
      <boxGeometry args={[length, 0.06, width]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function FlatArea({ area, y }: { area: AreaRect; y: number }) {
  return (
    <mesh position={[area.center.x, y, area.center.z]} receiveShadow>
      <boxGeometry args={[area.width, 0.05, area.depth]} />
      <meshStandardMaterial color={area.color} />
    </mesh>
  );
}

function BuildingMesh({ building }: { building: Building }) {
  const { position, size, wallColor, roofColor } = building;
  const roofRadius = Math.max(size.width, size.depth) * 0.72;
  const roofHeight = Math.max(1.4, size.height * 0.35);
  return (
    <group position={[position.x, 0, position.z]}>
      <mesh position={[0, size.height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[size.width, size.height, size.depth]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      {/* Pyramid roof (4-sided cone) for a readable low-poly silhouette. */}
      <mesh position={[0, size.height + roofHeight / 2, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[roofRadius, roofHeight, 4]} />
        <meshStandardMaterial color={roofColor} />
      </mesh>
    </group>
  );
}

function Tree({ position, scale }: { position: Vec2; scale: number }) {
  return (
    <group position={[position.x, 0, position.z]} scale={scale}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.28, 1.8, 6]} />
        <meshStandardMaterial color="#5b4327" />
      </mesh>
      <mesh position={[0, 2.4, 0]} castShadow>
        <coneGeometry args={[1.3, 2.6, 7]} />
        <meshStandardMaterial color="#356b34" />
      </mesh>
    </group>
  );
}

function Grave({ position }: { position: Vec2 }) {
  return (
    <mesh position={[position.x, 0.35, position.z]} castShadow>
      <boxGeometry args={[0.5, 0.7, 0.15]} />
      <meshStandardMaterial color="#b7bcc2" />
    </mesh>
  );
}

function River() {
  const { points, width, color } = CANONICAL_TOWN.river;
  const strips = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    strips.push(
      <FlatStrip key={`river-${i}`} from={points[i]} to={points[i + 1]} width={width} color={color} y={0.04} />,
    );
  }
  return <group>{strips}</group>;
}

export function Town() {
  const town = CANONICAL_TOWN;
  const roads = useMemo(() => town.roads as readonly RoadSegment[], [town.roads]);

  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[town.groundExtent * 2, town.groundExtent * 2]} />
        <meshStandardMaterial color={town.groundColor} />
      </mesh>

      {/* Zones */}
      <FlatArea area={town.park} y={0.03} />
      <FlatArea area={town.square} y={0.035} />
      {town.farmPlots.map((plot) => (
        <FlatArea key={plot.id} area={plot} y={0.03} />
      ))}
      {town.vacantPlots.map((plot) => (
        <FlatArea key={plot.id} area={plot} y={0.03} />
      ))}
      <FlatArea area={town.cemetery} y={0.03} />

      {/* Roads */}
      {roads.map((road) => (
        <FlatStrip key={road.id} from={road.from} to={road.to} width={road.width} color="#4a4a4a" y={0.05} />
      ))}

      <River />

      {/* Buildings */}
      {town.buildings.map((building) => (
        <BuildingMesh key={building.id} building={building} />
      ))}

      {/* Trees */}
      {town.trees.map((tree, index) => (
        <Tree key={`tree-${index}`} position={tree.position} scale={tree.scale} />
      ))}

      {/* Graves */}
      {town.graves.map((grave, index) => (
        <Grave key={`grave-${index}`} position={grave.position} />
      ))}
    </group>
  );
}
