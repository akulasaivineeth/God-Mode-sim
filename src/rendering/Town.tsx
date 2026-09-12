/**
 * Town geometry — WORLD-001 / VIS.
 *
 * Plain English: Draws the handcrafted low-poly town from the authored layout
 * (src/world/townLayout.ts): terrain, roads, sidewalks, pedestrian paths, zones,
 * buildings, trees, a nearby forest on the hills, a river, and graves. This is
 * display only; it reads immutable authored geometry (including the deterministic
 * terrain heightfield) and never touches simulation state (ARCH-002).
 */
import { useMemo } from 'react';
import { PlaneGeometry } from 'three';
import {
  CANONICAL_TOWN,
  terrainHeightAt,
  type AreaRect,
  type Building,
  type RoadSegment,
  type TreeInstance,
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

/**
 * Ground with modest terrain elevation (WORLD-001, spec §3.2). A segmented plane
 * displaced by the deterministic `terrainHeightAt` heightfield — flat in the
 * settled core, gentle hills at the edges. No physics.
 */
function TerrainGround() {
  const geometry = useMemo(() => {
    const size = CANONICAL_TOWN.groundExtent * 2;
    const segments = 72;
    const geo = new PlaneGeometry(size, size, segments, segments);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i += 1) {
      const lx = pos.getX(i);
      const ly = pos.getY(i);
      // After the -90° X rotation below, local (x, y) maps to world (x, -y).
      pos.setZ(i, terrainHeightAt(lx, -ly));
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <meshStandardMaterial color={CANONICAL_TOWN.groundColor} />
    </mesh>
  );
}

function BuildingMesh({ building }: { building: Building }) {
  const { position, size, wallColor, roofColor } = building;
  const roofRadius = Math.max(size.width, size.depth) * 0.72;
  const roofHeight = Math.max(1.4, size.height * 0.35);
  const baseY = terrainHeightAt(position.x, position.z);
  return (
    <group position={[position.x, baseY, position.z]}>
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

function Tree({ position, scale }: TreeInstance) {
  const y = terrainHeightAt(position.x, position.z);
  return (
    <group position={[position.x, y, position.z]} scale={scale}>
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
  const y = terrainHeightAt(position.x, position.z);
  return (
    <mesh position={[position.x, y + 0.35, position.z]} castShadow>
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
      <TerrainGround />

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

      {/* Sidewalks (flanking streets) then roads on top */}
      {town.sidewalks.map((sw) => (
        <FlatStrip key={sw.id} from={sw.from} to={sw.to} width={sw.width} color="#9aa0a6" y={0.045} />
      ))}
      {roads.map((road) => (
        <FlatStrip key={road.id} from={road.from} to={road.to} width={road.width} color="#4a4a4a" y={0.05} />
      ))}

      {/* Pedestrian paths linking key places */}
      {town.paths.map((path) => (
        <FlatStrip key={path.id} from={path.from} to={path.to} width={path.width} color="#b8a67f" y={0.05} />
      ))}

      <River />

      {/* Buildings */}
      {town.buildings.map((building) => (
        <BuildingMesh key={building.id} building={building} />
      ))}

      {/* Town trees (sparse) */}
      {town.trees.map((tree, index) => (
        <Tree key={`tree-${index}`} position={tree.position} scale={tree.scale} />
      ))}

      {/* Nearby forest on the northern hills (denser, distinct) */}
      {town.forest.trees.map((tree, index) => (
        <Tree key={`forest-${index}`} position={tree.position} scale={tree.scale} />
      ))}

      {/* Graves */}
      {town.graves.map((grave, index) => (
        <Grave key={`grave-${index}`} position={grave.position} />
      ))}
    </group>
  );
}
