/**
 * Town geometry — WORLD-001 / VIS.
 *
 * Plain English: Draws the handcrafted low-poly town from the authored layout
 * (src/world/townLayout.ts): shaded terrain hills, a readable river with banks,
 * roads, sidewalks, pedestrian paths, zones, differentiated low-poly buildings,
 * instanced vegetation (VegetationLayer), and instanced graves. Display only.
 */
import { useLayoutEffect, useMemo, useRef } from 'react';
import {
  BoxGeometry,
  ExtrudeGeometry,
  type InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  Quaternion,
  Shape,
  Vector3,
} from 'three';
import {
  BUILDING_ARCHETYPES,
  CANONICAL_TOWN,
  terrainHeightAt,
  type AreaRect,
  type Building,
  type RoadSegment,
  type Vec2,
} from '@/world/townLayout';
import { usesDedicatedVisual } from './assets/dedicatedBuildingIds';
import { MAT } from './sharedMaterials';
import { getPooledMaterial } from './materialPool';

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
  material: MeshStandardMaterial;
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

function FlatArea({ area, y }: { area: AreaRect; y: number }) {
  const material = useMemo(() => getPooledMaterial(area.color, { roughness: 0.85 }), [area.color]);
  return (
    <mesh position={[area.center.x, y, area.center.z]} receiveShadow>
      <boxGeometry args={[area.width, 0.05, area.depth]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

function GableRoof({
  width,
  depth,
  height,
  color,
}: {
  width: number;
  depth: number;
  height: number;
  color: string;
}) {
  const geometry = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(-width / 2, 0);
    shape.lineTo(width / 2, 0);
    shape.lineTo(0, height);
    shape.closePath();
    const geo = new ExtrudeGeometry(shape, { depth, bevelEnabled: false });
    geo.translate(0, 0, -depth / 2);
    return geo;
  }, [width, depth, height]);
  const material = useMemo(() => getPooledMaterial(color, { roughness: 0.82 }), [color]);
  return (
    <mesh geometry={geometry} castShadow>
      <primitive object={material} attach="material" />
    </mesh>
  );
}

/** A window or door colour block placed on the front (+Z) face. */
function FrontBlock({
  x,
  y,
  depth,
  width,
  height,
  material,
}: {
  x: number;
  y: number;
  depth: number;
  width: number;
  height: number;
  material: MeshStandardMaterial;
}) {
  return (
    <mesh position={[x, y, depth / 2 + 0.03]}>
      <boxGeometry args={[width, height, 0.08]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

function BuildingMesh({ building }: { building: Building }) {
  const { position, size, wallColor, roofColor } = building;
  const arch = BUILDING_ARCHETYPES[building.type];
  const baseY = terrainHeightAt(position.x, position.z);
  const roofHeight = arch.roof === 'flat' ? 0.5 : Math.max(1.6, size.height * 0.42);
  const wallMat = useMemo(() => getPooledMaterial(wallColor, { roughness: 0.85 }), [wallColor]);
  const roofMat = useMemo(() => getPooledMaterial(roofColor, { roughness: 0.82 }), [roofColor]);

  return (
    <group position={[position.x, baseY, position.z]}>
      {/* Walls */}
      <mesh position={[0, size.height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[size.width, size.height, size.depth]} />
        <primitive object={wallMat} attach="material" />
      </mesh>

      {/* Roof by archetype */}
      {arch.roof === 'hip' && (
        <mesh
          position={[0, size.height + roofHeight / 2, 0]}
          rotation={[0, Math.PI / 4, 0]}
          castShadow
        >
          <coneGeometry args={[Math.max(size.width, size.depth) * 0.72, roofHeight, 4]} />
          <primitive object={roofMat} attach="material" />
        </mesh>
      )}
      {arch.roof === 'gable' && (
        <group position={[0, size.height, 0]}>
          <GableRoof width={size.width} depth={size.depth} height={roofHeight} color={roofColor} />
        </group>
      )}
      {arch.roof === 'flat' && (
        <mesh position={[0, size.height + roofHeight / 2, 0]} castShadow>
          <boxGeometry args={[size.width * 1.04, roofHeight, size.depth * 1.04]} />
          <primitive object={roofMat} attach="material" />
        </mesh>
      )}

      {/* Background (non-dedicated) shells keep a single door accent only, to
          stay within the M2/8GB draw-call budget; dedicated facilities carry the
          detailed facades. */}
      <FrontBlock x={0} y={1} depth={size.depth} width={1.2} height={2} material={MAT.door} />

      {arch.canopy && (
        <mesh position={[0, size.height * 0.55, size.depth / 2 + 0.9]} castShadow>
          <boxGeometry args={[Math.min(size.width, 5), 0.16, 1.8]} />
          <meshStandardMaterial color={arch.accentColor} />
        </mesh>
      )}

      {/* Protruding entry volume (civic) */}
      {arch.entry && (
        <mesh position={[0, size.height * 0.35, size.depth / 2 + 0.8]} castShadow receiveShadow>
          <boxGeometry args={[size.width * 0.42, size.height * 0.7, 1.6]} />
          <primitive object={wallMat} attach="material" />
        </mesh>
      )}

      {/* Rooftop tank/tower (utility) */}
      {arch.tower && (
        <mesh position={[size.width * 0.2, size.height + 1.4, 0]} castShadow>
          <cylinderGeometry args={[1.1, 1.1, 2.6, 10]} />
          <meshStandardMaterial color={arch.accentColor} />
        </mesh>
      )}
    </group>
  );
}

/** All graves as a single InstancedMesh. */
function InstancedGraves() {
  const graves = CANONICAL_TOWN.graves;
  const count = graves.length;
  const geometry = useMemo(() => new BoxGeometry(0.5, 0.7, 0.15), []);
  const material = MAT.grave;
  const ref = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const matrix = new Matrix4();
    const quat = new Quaternion();
    const scale = new Vector3(1, 1, 1);
    graves.forEach((grave, i) => {
      const y = terrainHeightAt(grave.position.x, grave.position.z);
      matrix.compose(new Vector3(grave.position.x, y + 0.35, grave.position.z), quat, scale);
      mesh.setMatrixAt(i, matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [graves]);

  return <instancedMesh ref={ref} args={[geometry, material, count]} castShadow />;
}

export function Town() {
  const town = CANONICAL_TOWN;
  const roads = useMemo(() => town.roads as readonly RoadSegment[], [town.roads]);

  return (
    <group>
      {/* Zones — terrain rendered by TownLandscape unified mesh */}
      {/* Park/square ground handled by TownAmenities (R8 — avoid duplicate overlays). */}
      {town.farmPlots.map((plot) => (
        <FlatArea key={plot.id} area={plot} y={0.03} />
      ))}
      {town.vacantPlots.map((plot) => (
        <FlatArea key={plot.id} area={plot} y={0.03} />
      ))}
      <FlatArea area={town.cemetery} y={0.03} />

      {/* Sidewalks (flanking streets) then roads on top */}
      {town.sidewalks.map((sw) => (
        <FlatStrip key={sw.id} from={sw.from} to={sw.to} width={sw.width} material={MAT.sidewalk} y={0.045} />
      ))}
      {roads.map((road) => (
        <FlatStrip key={road.id} from={road.from} to={road.to} width={road.width} material={MAT.road} y={0.05} />
      ))}

      {/* Pedestrian paths — warm concrete pavers (authored graph unchanged) */}
      {town.paths.map((path) => (
        <FlatStrip key={path.id} from={path.from} to={path.to} width={path.width} material={MAT.stoneLight} y={0.052} />
      ))}

      {/* Generic shell buildings — dedicated M02 facilities use BuildingVisualRegistry */}
      {town.buildings
        .filter((building) => !usesDedicatedVisual(building.id))
        .map((building) => (
          <BuildingMesh key={building.id} building={building} />
        ))}

      <InstancedGraves />
    </group>
  );
}
