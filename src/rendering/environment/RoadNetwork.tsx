/**
 * WF01 Kenney road network — junction-aware instanced straights + dedicated modules.
 * R9 World Lab uses compact neighborhood junction set without main-road bridge.
 */
import { useMemo } from 'react';
import { CANONICAL_TOWN, terrainHeightAt, type Vec2 } from '@/world/townLayout';
import { isWorldLabActive } from '@/world/resolver/worldResolver';
import { HERO_ROAD_JUNCTIONS } from '@/world/worldLab/roadTopologyWorldLab';
import { ModelAsset } from '../assets/ModelAsset';
import { KENNEY_ASSETS } from '../assets/EnvironmentAssetRegistry';
import { InstancedRoadStraights } from './InstancedRoadStraights';
import { MAT } from '../sharedMaterials';
import {
  ROAD_JUNCTIONS,
  bridgePlacementOnMainRoad,
  buildStraightTiles,
  type BridgePlacement,
} from './roadTopology';

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

const OFFSCREEN_BRIDGE: BridgePlacement = {
  x: 999,
  z: 999,
  rotY: 0,
  exclusion: { minX: 992, maxX: 1006, minZ: 995, maxZ: 1003 },
};

export function RoadNetwork() {
  const town = CANONICAL_TOWN;
  const worldLab = isWorldLabActive();
  const junctions = worldLab ? HERO_ROAD_JUNCTIONS : ROAD_JUNCTIONS;
  const bridge = useMemo(
    () => (worldLab ? OFFSCREEN_BRIDGE : bridgePlacementOnMainRoad(town.river.points, 0)),
    [town.river.points, worldLab],
  );
  const straightTiles = useMemo(
    () => buildStraightTiles(town.roads, bridge),
    [town.roads, bridge],
  );

  return (
    <group>
      <InstancedRoadStraights tiles={straightTiles} />
      {junctions.map((junction) => {
        const y = terrainHeightAt(junction.position.x, junction.position.z) + junction.yLift;
        return (
          <ModelAsset
            key={junction.id}
            url={junction.asset}
            position={[junction.position.x, y, junction.position.z]}
            rotation={[0, junction.rotY, 0]}
            scale={junction.scale}
            castShadow={false}
          />
        );
      })}
      {!worldLab && (
        <ModelAsset
          url={KENNEY_ASSETS.roadBridge}
          position={[bridge.x, terrainHeightAt(bridge.x, bridge.z) + 0.08, bridge.z]}
          rotation={[0, bridge.rotY, 0]}
          scale={2.6}
          castShadow={false}
        />
      )}
      {town.sidewalks.map((sw) => (
        <FlatStrip key={sw.id} from={sw.from} to={sw.to} width={sw.width} material={MAT.sidewalk} y={0.045} />
      ))}
    </group>
  );
}
