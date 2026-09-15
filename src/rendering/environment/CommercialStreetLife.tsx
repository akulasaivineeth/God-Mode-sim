/**
 * WF02 R3 — commercial/work street-life rhythm (presentation only).
 * Benches, lamps, apron pavers and store/workshop separator framing.
 */
import { useMemo } from 'react';
import { terrainHeightAt } from '@/world/townLayout';
import { InstancedScatter, type ScatterPoint } from '../InstancedScatter';
import { SCATTER_GEOM } from '../scatterGeometries';
import { MAT } from '../sharedMaterials';

function buildCommercialBenches(): ScatterPoint[] {
  const zPositions = [12.5, 15.5, 18.5, 22.5];
  return zPositions.map((z, i) => ({
    x: -14.2 + (i % 2) * 0.4,
    z,
    y: terrainHeightAt(-14.2, z),
    rotY: Math.PI / 2,
  }));
}

function buildCommercialLamps(): ScatterPoint[] {
  const zPositions = [13.5, 19.5, 25.5];
  return zPositions.map((z, i) => ({
    x: -15.8 + (i % 2) * 0.3,
    z,
    y: terrainHeightAt(-15.8, z) + 0.1,
    rotY: Math.PI / 2,
  }));
}

function buildSeparatorBushes(): ScatterPoint[] {
  return [
    { x: -13.2, z: 16.8, y: terrainHeightAt(-13.2, 16.8), scale: 1.05, rotY: 0.4 },
    { x: -12.4, z: 17.4, y: terrainHeightAt(-12.4, 17.4), scale: 0.95, rotY: 1.1 },
  ];
}

function buildCommercialAprons(): ScatterPoint[] {
  const zPositions = [13.8, 19.5, 25.2];
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
