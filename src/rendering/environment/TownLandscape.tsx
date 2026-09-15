/**
 * Unified terrain + river ribbon — presentation only (WF01 R5 terrain carve).
 *
 * River carve is applied ONLY in this renderer. Simulation terrainHeightAt() is unchanged.
 */
import { useMemo } from 'react';
import { BufferAttribute, Color, PlaneGeometry } from 'three';
import { CANONICAL_TOWN, TERRAIN, terrainHeightAt } from '@/world/townLayout';
import { buildRiverRibbonGeometry } from './riverGeometry';
import {
  isInsideRiverCorridor,
  presentationTerrainHeightAt,
  R5_RIVER_CROSS_SECTION,
} from './riverCrossSection';

const TERRAIN_SEGMENTS = 20;

function UnifiedTerrain() {
  const { points } = CANONICAL_TOWN.river;
  const section = R5_RIVER_CROSS_SECTION;

  const geometry = useMemo(() => {
    const extent = CANONICAL_TOWN.groundExtent;
    const size = extent * 2.8;
    const geo = new PlaneGeometry(size, size, TERRAIN_SEGMENTS, TERRAIN_SEGMENTS);
    const pos = geo.attributes.position;
    const grass = new Color('#5a7348');
    const slope = new Color('#8a9a58');
    const hilltop = new Color('#c4a868');
    const valley = new Color('#4a5a38');
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
      const baseH = terrainHeightAt(wx, wz);
      const carvedH = presentationTerrainHeightAt(wx, wz, baseH, points, section);
      const h = carvedH + edgeLift * TERRAIN.maxHeight * 0.35;
      pos.setZ(i, h - 0.08 * edgeLift);

      const inCorridor = isInsideRiverCorridor(wx, wz, points, section);
      const t = Math.min(1, h / (TERRAIN.maxHeight * 0.85));
      if (inCorridor) tmp.copy(valley);
      else if (t < 0.5) tmp.copy(grass).lerp(slope, t / 0.5);
      else tmp.copy(slope).lerp(hilltop, (t - 0.5) / 0.5);
      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
    }
    pos.needsUpdate = true;
    geo.setAttribute('color', new BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, [points, section]);

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.05, 0]}>
      <meshStandardMaterial vertexColors flatShading />
    </mesh>
  );
}

function RiverRibbon() {
  const { points, color, bankColor } = CANONICAL_TOWN.river;
  const section = R5_RIVER_CROSS_SECTION;
  const { water, bank } = useMemo(
    () =>
      buildRiverRibbonGeometry(points, section, {
        waterColor: color,
        bankColor,
      }),
    [points, color, bankColor, section],
  );

  return (
    <group>
      <mesh geometry={bank} receiveShadow renderOrder={1}>
        <meshStandardMaterial vertexColors roughness={0.92} metalness={0.02} />
      </mesh>
      <mesh geometry={water} receiveShadow renderOrder={3}>
        <meshStandardMaterial
          color={color}
          roughness={0.08}
          metalness={0.18}
          emissive="#0d4a78"
          emissiveIntensity={0.08}
        />
      </mesh>
    </group>
  );
}

export function TownLandscape() {
  return (
    <group>
      <UnifiedTerrain />
      <RiverRibbon />
    </group>
  );
}
