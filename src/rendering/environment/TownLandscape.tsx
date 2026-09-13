/**
 * Unified terrain + river ribbon + bridge — presentation only (M02 R6/R8).
 */
import { useMemo } from 'react';
import { BufferAttribute, Color, PlaneGeometry } from 'three';
import { CANONICAL_TOWN, TERRAIN, terrainHeightAt } from '@/world/townLayout';
import { ModelAsset } from '../assets/ModelAsset';
import { KENNEY_ASSETS } from '../assets/EnvironmentAssetRegistry';
import { bridgePlacementOnRiver, buildRiverRibbonGeometry } from './riverGeometry';

function UnifiedTerrain() {
  const geometry = useMemo(() => {
    const extent = CANONICAL_TOWN.groundExtent;
    const size = extent * 2.8;
    const segments = 40;
    const geo = new PlaneGeometry(size, size, segments, segments);
    const pos = geo.attributes.position;
    const grass = new Color(CANONICAL_TOWN.groundColor);
    const slope = new Color('#6f713f');
    const hilltop = new Color('#b0995f');
    const colors = new Float32Array(pos.count * 3);
    const tmp = new Color();
    const edgeFade = extent * 2.2;

    for (let i = 0; i < pos.count; i += 1) {
      const lx = pos.getX(i);
      const ly = pos.getY(i);
      const wx = lx;
      const wz = -ly;
      const dist = Math.hypot(wx, wz);
      const edgeLift = Math.max(0, (dist - edgeFade * 0.55) / (edgeFade * 0.45));
      const h = terrainHeightAt(wx, wz) + edgeLift * TERRAIN.maxHeight * 0.35;
      pos.setZ(i, h - 0.08 * edgeLift);

      const t = Math.min(1, h / (TERRAIN.maxHeight * 0.85));
      if (t < 0.5) tmp.copy(grass).lerp(slope, t / 0.5);
      else tmp.copy(slope).lerp(hilltop, (t - 0.5) / 0.5);
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
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.05, 0]}>
      <meshStandardMaterial vertexColors flatShading />
    </mesh>
  );
}

function RiverRibbon() {
  const { points, width, bankWidth, color, bankColor } = CANONICAL_TOWN.river;
  const { water, bank } = useMemo(
    () =>
      buildRiverRibbonGeometry(points, width, bankWidth, {
        waterColor: color,
        bankColor,
      }),
    [points, width, bankWidth, color, bankColor],
  );

  return (
    <group>
      <mesh geometry={bank} receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.96} metalness={0.01} />
      </mesh>
      <mesh geometry={water} receiveShadow>
        <meshStandardMaterial
          color={color}
          roughness={0.12}
          metalness={0.14}
          emissive={color}
          emissiveIntensity={0.14}
        />
      </mesh>
    </group>
  );
}

export function TownLandscape() {
  const bridge = useMemo(
    () => bridgePlacementOnRiver(CANONICAL_TOWN.river.points, 0),
    [],
  );
  const bridgeY = terrainHeightAt(bridge.x, bridge.z);

  return (
    <group>
      <UnifiedTerrain />
      <RiverRibbon />
      <ModelAsset
        url={KENNEY_ASSETS.roadBridge}
        position={[bridge.x, bridgeY + 0.08, bridge.z]}
        rotation={[0, bridge.rotY, 0]}
        scale={2.35}
        castShadow={false}
      />
    </group>
  );
}
