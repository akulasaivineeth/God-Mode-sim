/**
 * WF02 R3 — commercial/work street-life rhythm (presentation only).
 * R9 World Lab uses hero neighborhood commercial frontage coordinates.
 */
import { useMemo } from 'react';
import { CANONICAL_TOWN, terrainHeightAt } from '@/world/townLayout';
import { isWorldLabActive } from '@/world/resolver/worldResolver';
import { InstancedScatter, type ScatterPoint } from '../InstancedScatter';
import { SCATTER_GEOM } from '../scatterGeometries';
import { MAT } from '../sharedMaterials';
import { WF02_R8_SLICE_MODE } from './r8SliceMode';

function buildCommercialBenches(): ScatterPoint[] {
  if (isWorldLabActive()) {
    return [-16, -8, 0, 8, 16].map((x, i) => ({
      x,
      z: 11.2 + (i % 2) * 0.3,
      y: terrainHeightAt(x, 11.2),
      rotY: 0,
    }));
  }
  const zPositions = WF02_R8_SLICE_MODE
    ? [8, 10.5, 13, 15.5, 18, 20.5, 23]
    : [12.5, 15.5, 18.5, 22.5];
  return zPositions.map((z, i) => ({
    x: -14.2 + (i % 2) * 0.4,
    z,
    y: terrainHeightAt(-14.2, z),
    rotY: Math.PI / 2,
  }));
}

function buildCommercialLamps(): ScatterPoint[] {
  if (isWorldLabActive()) {
    return [-18, -10, -2, 6, 14, 18].map((x, i) => ({
      x,
      z: 10.4 + (i % 2) * 0.2,
      y: terrainHeightAt(x, 10.4) + 0.1,
      rotY: 0,
    }));
  }
  const zPositions = WF02_R8_SLICE_MODE
    ? [7, 9.5, 12, 14.5, 17, 19.5, 22, 24.5]
    : [13.5, 19.5, 25.5];
  return zPositions.map((z, i) => ({
    x: -15.8 + (i % 2) * 0.3,
    z,
    y: terrainHeightAt(-15.8, z) + 0.1,
    rotY: Math.PI / 2,
  }));
}

function buildSeparatorBushes(): ScatterPoint[] {
  if (isWorldLabActive()) {
    const out: ScatterPoint[] = [];
    for (let x = -8; x <= -2; x += 1.5) {
      out.push({
        x,
        z: 13.8,
        y: terrainHeightAt(x, 13.8),
        scale: 1.05,
        rotY: 0.4,
      });
    }
    return out;
  }
  if (WF02_R8_SLICE_MODE) {
    const out: ScatterPoint[] = [];
    for (let z = 8; z <= 22; z += 2.2) {
      out.push({
        x: -12.8,
        z,
        y: terrainHeightAt(-12.8, z),
        scale: 1.15 + (z % 2) * 0.08,
        rotY: 0.35,
      });
    }
    return out;
  }
  return [
    { x: -13.2, z: 16.8, y: terrainHeightAt(-13.2, 16.8), scale: 1.05, rotY: 0.4 },
    { x: -12.4, z: 17.4, y: terrainHeightAt(-12.4, 17.4), scale: 0.95, rotY: 1.1 },
  ];
}

function buildCommercialAprons(): ScatterPoint[] {
  if (isWorldLabActive()) {
    return CANONICAL_TOWN.buildings
      .filter((b) => b.type === 'store' || b.type === 'workshop' || b.type === 'cafe')
      .map((b, i) => ({
        x: b.position.x,
        z: b.position.z - 1.8,
        y: terrainHeightAt(b.position.x, b.position.z - 1.8) + 0.03,
        rotY: i * 0.2,
        scale: 1.05,
      }));
  }
  const zPositions = WF02_R8_SLICE_MODE
    ? [8, 11, 14, 17, 20, 23]
    : [13.8, 19.5, 25.2];
  return zPositions.map((z, i) => ({
    x: -11,
    z,
    y: terrainHeightAt(-11, z) + 0.03,
    rotY: i * 0.2,
    scale: 1.05,
  }));
}

export function CommercialStreetLife() {
  const benches = useMemo(() => buildCommercialBenches(), []);
  const lamps = useMemo(() => buildCommercialLamps(), []);
  const separator = useMemo(() => buildSeparatorBushes(), []);
  const aprons = useMemo(() => buildCommercialAprons(), []);

  return (
    <group>
      <InstancedScatter points={benches} geometry={SCATTER_GEOM.benchSeat} material={MAT.wood} castShadow={false} />
      <InstancedScatter points={lamps} geometry={SCATTER_GEOM.lampPost} material={MAT.metalDark} castShadow={false} />
      <InstancedScatter points={separator} geometry={SCATTER_GEOM.shrub} material={MAT.foliageLight} castShadow={false} />
      <InstancedScatter points={aprons} geometry={SCATTER_GEOM.paver} material={MAT.path} castShadow={false} />
    </group>
  );
}
