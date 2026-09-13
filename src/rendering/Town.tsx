/**
 * Town geometry — WORLD-001 / VIS.
 *
 * Plain English: Draws the handcrafted low-poly town from the authored layout
 * (src/world/townLayout.ts): shaded terrain hills, a readable river with banks,
 * roads, sidewalks, pedestrian paths, zones, differentiated low-poly buildings,
 * an instanced forest/tree set, and instanced graves. Display only — it reads
 * immutable authored geometry (including the deterministic terrain heightfield)
 * and never touches simulation state (ARCH-002).
 *
 * Performance: repeated static geometry (trees, graves) uses InstancedMesh so
 * the whole forest costs a couple of draw calls, leaving M2/8GB headroom for the
 * 20 citizens arriving in M02.
 */
import { useLayoutEffect, useMemo, useRef } from 'react';
import {
  BoxGeometry,
  BufferAttribute,
  Color,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  type InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  PlaneGeometry,
  Quaternion,
  Shape,
  Vector3,
} from 'three';
import {
  BUILDING_ARCHETYPES,
  CANONICAL_TOWN,
  collectAllTrees,
  TERRAIN,
  terrainHeightAt,
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

/**
 * Ground with modest terrain elevation (WORLD-001, spec §3.2). A segmented plane
 * displaced by `terrainHeightAt` and tinted by height (green core → dry-grass
 * hills) with flat shading so the peripheral hills read clearly. No physics.
 */
function TerrainGround() {
  const geometry = useMemo(() => {
    const size = CANONICAL_TOWN.groundExtent * 2;
    const segments = 96;
    const geo = new PlaneGeometry(size, size, segments, segments);
    const pos = geo.attributes.position;
    // Three-stop height tint (grass → olive slope → dry-grass hilltop) so the
    // relief reads clearly even at overview framing. Saturates before the peak.
    const grass = new Color(CANONICAL_TOWN.groundColor);
    const slope = new Color('#6f713f');
    const hilltop = new Color('#b0995f');
    const colors = new Float32Array(pos.count * 3);
    const tmp = new Color();
    for (let i = 0; i < pos.count; i += 1) {
      const lx = pos.getX(i);
      const ly = pos.getY(i);
      // After the -90° X rotation below, local (x, y) maps to world (x, -y).
      const h = terrainHeightAt(lx, -ly);
      pos.setZ(i, h);
      const t = Math.min(1, h / (TERRAIN.maxHeight * 0.8));
      if (t < 0.5) {
        tmp.copy(grass).lerp(slope, t / 0.5);
      } else {
        tmp.copy(slope).lerp(hilltop, (t - 0.5) / 0.5);
      }
      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
    }
    pos.needsUpdate = true;
    geo.setAttribute('color', new BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <meshStandardMaterial vertexColors flatShading />
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
  return (
    <mesh geometry={geometry} castShadow>
      <meshStandardMaterial color={color} />
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
  color,
}: {
  x: number;
  y: number;
  depth: number;
  width: number;
  height: number;
  color: string;
}) {
  return (
    <mesh position={[x, y, depth / 2 + 0.03]}>
      <boxGeometry args={[width, height, 0.08]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function BuildingMesh({ building }: { building: Building }) {
  const { position, size, wallColor, roofColor } = building;
  const arch = BUILDING_ARCHETYPES[building.type];
  const baseY = terrainHeightAt(position.x, position.z);
  const roofHeight = arch.roof === 'flat' ? 0.5 : Math.max(1.6, size.height * 0.42);
  const hasTwoWindows = size.width >= 6;

  return (
    <group position={[position.x, baseY, position.z]}>
      {/* Walls */}
      <mesh position={[0, size.height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[size.width, size.height, size.depth]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>

      {/* Roof by archetype */}
      {arch.roof === 'hip' && (
        <mesh
          position={[0, size.height + roofHeight / 2, 0]}
          rotation={[0, Math.PI / 4, 0]}
          castShadow
        >
          <coneGeometry args={[Math.max(size.width, size.depth) * 0.72, roofHeight, 4]} />
          <meshStandardMaterial color={roofColor} />
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
          <meshStandardMaterial color={roofColor} />
        </mesh>
      )}

      {/* Door + windows on the front face */}
      <FrontBlock x={0} y={1} depth={size.depth} width={1.2} height={2} color={arch.accentColor} />
      {hasTwoWindows ? (
        <>
          <FrontBlock x={-size.width * 0.28} y={size.height * 0.6} depth={size.depth} width={1.4} height={1.2} color={arch.windowColor} />
          <FrontBlock x={size.width * 0.28} y={size.height * 0.6} depth={size.depth} width={1.4} height={1.2} color={arch.windowColor} />
        </>
      ) : (
        <FrontBlock x={size.width * 0.22} y={size.height * 0.6} depth={size.depth} width={1.2} height={1.1} color={arch.windowColor} />
      )}

      {/* Storefront awning */}
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
          <meshStandardMaterial color={wallColor} />
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

function River() {
  const { points, width, color, bankWidth, bankColor } = CANONICAL_TOWN.river;
  const banks = [];
  const water = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    banks.push(
      <FlatStrip key={`bank-${i}`} from={points[i]} to={points[i + 1]} width={bankWidth} color={bankColor} y={0.03} />,
    );
    water.push(
      <FlatStrip key={`water-${i}`} from={points[i]} to={points[i + 1]} width={width} color={color} y={0.07} />,
    );
  }
  return (
    <group>
      {banks}
      {water}
    </group>
  );
}

/** All trees (town + forest) as two InstancedMesh draw calls (trunks, canopies). */
function InstancedTrees() {
  const trees = useMemo(() => collectAllTrees(), []);
  const count = trees.length;
  const trunkGeo = useMemo(() => new CylinderGeometry(0.2, 0.28, 1.8, 6), []);
  const canopyGeo = useMemo(() => new ConeGeometry(1.3, 2.6, 7), []);
  const trunkMat = useMemo(() => new MeshStandardMaterial({ color: '#5b4327' }), []);
  const canopyMat = useMemo(() => new MeshStandardMaterial({ color: '#356b34' }), []);
  const trunkRef = useRef<InstancedMesh>(null);
  const canopyRef = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    const trunk = trunkRef.current;
    const canopy = canopyRef.current;
    if (!trunk || !canopy) return;
    const matrix = new Matrix4();
    const quat = new Quaternion();
    trees.forEach((tree, i) => {
      const y = terrainHeightAt(tree.position.x, tree.position.z);
      const s = tree.scale;
      const scale = new Vector3(s, s, s);
      matrix.compose(new Vector3(tree.position.x, y + 0.9 * s, tree.position.z), quat, scale);
      trunk.setMatrixAt(i, matrix);
      matrix.compose(new Vector3(tree.position.x, y + 2.4 * s, tree.position.z), quat, scale);
      canopy.setMatrixAt(i, matrix);
    });
    trunk.instanceMatrix.needsUpdate = true;
    canopy.instanceMatrix.needsUpdate = true;
  }, [trees]);

  return (
    <group>
      <instancedMesh ref={trunkRef} args={[trunkGeo, trunkMat, count]} castShadow receiveShadow />
      <instancedMesh ref={canopyRef} args={[canopyGeo, canopyMat, count]} castShadow receiveShadow />
    </group>
  );
}

/** All graves as a single InstancedMesh. */
function InstancedGraves() {
  const graves = CANONICAL_TOWN.graves;
  const count = graves.length;
  const geometry = useMemo(() => new BoxGeometry(0.5, 0.7, 0.15), []);
  const material = useMemo(() => new MeshStandardMaterial({ color: '#b7bcc2' }), []);
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
        <FlatStrip key={road.id} from={road.from} to={road.to} width={road.width} color="#43454a" y={0.05} />
      ))}

      {/* Pedestrian paths linking key places */}
      {town.paths.map((path) => (
        <FlatStrip key={path.id} from={path.from} to={path.to} width={path.width} color="#c2ac74" y={0.052} />
      ))}

      <River />

      {/* Buildings */}
      {town.buildings.map((building) => (
        <BuildingMesh key={building.id} building={building} />
      ))}

      <InstancedTrees />
      <InstancedGraves />
    </group>
  );
}
