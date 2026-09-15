/**
 * WF01 Kenney road network — instanced straight tiles + authored intersection pieces.
 * Replaces dominant FlatStrip road presentation (presentation only).
 */
import { useMemo } from 'react';
import { CANONICAL_TOWN, terrainHeightAt, type RoadSegment, type Vec2 } from '@/world/townLayout';
import { ModelAsset } from '../assets/ModelAsset';
import { KENNEY_ASSETS } from '../assets/EnvironmentAssetRegistry';
import { InstancedRoadStraights } from './InstancedRoadStraights';
import { MAT } from '../sharedMaterials';

/** Kenney road-straight module length at scale 1.5 (metres). */
const TILE_LENGTH = 5.8;
const TILE_SCALE = 1.5;

export interface RoadTilePlacement {
  x: number;
  z: number;
  rotY: number;
  scale?: number;
}

function segmentTransform(from: Vec2, to: Vec2) {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const length = Math.hypot(dx, dz);
  const angle = Math.atan2(dz, dx);
  const center: [number, number] = [(from.x + to.x) / 2, (from.z + to.z) / 2];
  return { length, angle, center };
}

function buildStraightTiles(road: RoadSegment): RoadTilePlacement[] {
  const dx = road.to.x - road.from.x;
  const dz = road.to.z - road.from.z;
  const length = Math.hypot(dx, dz);
  if (length < 0.5) return [];
  const angle = Math.atan2(dz, dx);
  const count = Math.max(1, Math.floor(length / TILE_LENGTH));
  const tiles: RoadTilePlacement[] = [];
  for (let i = 0; i < count; i += 1) {
    const t = (i + 0.5) / count;
    tiles.push({
      x: road.from.x + dx * t,
      z: road.from.z + dz * t,
      rotY: -angle + Math.PI / 2,
      scale: TILE_SCALE,
    });
  }
  return tiles;
}

function FlatStrip({
  from,
  to,
  width,
  material,
  y,
}: {
  from: Vec2;
  to: Vec2;
  width: number;
  material: typeof MAT.sidewalk;
  y: number;
}) {
  const { length, angle, center } = segmentTransform(from, to);
  return (
    <mesh position={[center[0], y, center[1]]} rotation={[0, -angle, 0]} receiveShadow>
      <boxGeometry args={[length, 0.06, width]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

export function RoadNetwork() {
  const town = CANONICAL_TOWN;
  const straightTiles = useMemo(
    () => town.roads.flatMap((road) => buildStraightTiles(road)),
    [town.roads],
  );
  const crossY = terrainHeightAt(0, 0);
  const bridge = useMemo(() => {
    const pts = town.river.points;
    for (let i = 0; i < pts.length - 1; i += 1) {
      const a = pts[i];
      const b = pts[i + 1];
      if ((a.z <= 0 && b.z >= 0) || (a.z >= 0 && b.z <= 0)) {
        const t = (0 - a.z) / (b.z - a.z);
        const x = a.x + t * (b.x - a.x);
        const flowAngle = Math.atan2(b.x - a.x, b.z - a.z);
        return { x, z: 0, rotY: flowAngle + Math.PI / 2 };
      }
    }
    return { x: 88, z: 0, rotY: Math.PI / 2 };
  }, [town.river.points]);

  return (
    <group>
      <InstancedRoadStraights tiles={straightTiles} />
      {/* Centre intersection */}
      <ModelAsset
        url={KENNEY_ASSETS.roadCrossing}
        position={[0, crossY + 0.04, 0]}
        scale={TILE_SCALE}
        castShadow={false}
      />
      {/* Residential bend */}
      <ModelAsset
        url={KENNEY_ASSETS.roadBend}
        position={[8, terrainHeightAt(8, -30) + 0.04, -30]}
        rotation={[0, Math.PI * 0.25, 0]}
        scale={TILE_SCALE}
        castShadow={false}
      />
      <ModelAsset
        url={KENNEY_ASSETS.roadCurvePavement}
        position={[78, terrainHeightAt(78, -42) + 0.04, -42]}
        rotation={[0, -Math.PI / 2, 0]}
        scale={TILE_SCALE}
        castShadow={false}
      />
      {/* Bridge on main east-west artery */}
      <ModelAsset
        url={KENNEY_ASSETS.roadBridge}
        position={[bridge.x, terrainHeightAt(bridge.x, bridge.z) + 0.08, bridge.z]}
        rotation={[0, bridge.rotY, 0]}
        scale={2.6}
        castShadow={false}
      />
      {/* Sidewalks — curb/edge strips (primitive allowed) */}
      {town.sidewalks.map((sw) => (
        <FlatStrip key={sw.id} from={sw.from} to={sw.to} width={sw.width} material={MAT.sidewalk} y={0.045} />
      ))}
    </group>
  );
}
