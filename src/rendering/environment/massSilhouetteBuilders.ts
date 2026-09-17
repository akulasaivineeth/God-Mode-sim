/**
 * WF02 R6 Mass Silhouette System — pure placement builders with exclusion rules.
 */
import { CANONICAL_TOWN, type Vec2 } from '@/world/townLayout';
import { KENNEY_ASSETS } from '../assets/EnvironmentAssetRegistry';
import { buildOrchardGrid, isOverlayExcluded } from './compositionMask';
import { isInsideRiverCorridor, R5_RIVER_CROSS_SECTION } from './riverCrossSection';
import type { MassingGltfPlacement } from './districtMassing';

export interface VolumeScatterPoint {
  x: number;
  z: number;
  scale?: number;
  rotY?: number;
}

const { river } = CANONICAL_TOWN;
const RIVER_SECTION = R5_RIVER_CROSS_SECTION;

function distToSegment(px: number, pz: number, ax: number, az: number, bx: number, bz: number): number {
  const dx = bx - ax;
  const dz = bz - az;
  const lenSq = dx * dx + dz * dz;
  if (lenSq < 1e-6) return Math.hypot(px - ax, pz - az);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / lenSq));
  return Math.hypot(px - (ax + t * dx), pz - (az + t * dz));
}

function nearFarmRoad(x: number, z: number, margin = 2.0): boolean {
  for (const road of CANONICAL_TOWN.roads) {
    if (road.id !== 'road-farm') continue;
    const half = road.width / 2 + margin;
    if (distToSegment(x, z, road.from.x, road.from.z, road.to.x, road.to.z) <= half) return true;
  }
  return false;
}

function nearFarmhouse(x: number, z: number, margin = 3.0): boolean {
  const farmhouse = CANONICAL_TOWN.buildings.find((b) => b.id === 'farmhouse')!;
  return Math.hypot(x - farmhouse.position.x, z - farmhouse.position.z) < margin + 8;
}

function nearRiverWater(x: number, z: number, margin = 2.5): boolean {
  if (isInsideRiverCorridor(x, z, river.points, RIVER_SECTION)) return true;
  for (let i = 0; i < river.points.length - 1; i += 1) {
    const a = river.points[i]!;
    const b = river.points[i + 1]!;
    const d = distToSegment(x, z, a.x, a.z, b.x, b.z);
    const half =
      (RIVER_SECTION.waterHalfWidth + RIVER_SECTION.bankHalfWidth) * RIVER_SECTION.presentationScale +
      margin;
    if (d <= half) return true;
  }
  return false;
}

function kenneyTree(
  url: string,
  x: number,
  z: number,
  scale = 1,
  rotY = 0,
): MassingGltfPlacement {
  return { url, x, z, rotY, scale, yOffset: 0 };
}

export function buildArcKenneyPlacements(
  center: Vec2,
  radius: number,
  arcDeg: number,
  startAngleDeg: number,
  count: number,
  url: string,
  scale = 1.05,
): MassingGltfPlacement[] {
  const out: MassingGltfPlacement[] = [];
  const start = (startAngleDeg * Math.PI) / 180;
  const arc = (arcDeg * Math.PI) / 180;
  for (let i = 0; i < count; i += 1) {
    const t = count <= 1 ? 0.5 : i / (count - 1);
    const a = start + arc * t;
    const x = center.x + Math.cos(a) * radius;
    const z = center.z + Math.sin(a) * radius;
    if (isOverlayExcluded(x, z)) continue;
    if (nearRiverWater(x, z)) continue;
    out.push(kenneyTree(url, x, z, scale + (i % 3) * 0.06, a + Math.PI / 2));
  }
  return out;
}

export function buildArcVolumePlacements(
  center: Vec2,
  radius: number,
  arcDeg: number,
  startAngleDeg: number,
  count: number,
  scale = 0.55,
): VolumeScatterPoint[] {
  const out: VolumeScatterPoint[] = [];
  const start = (startAngleDeg * Math.PI) / 180;
  const arc = (arcDeg * Math.PI) / 180;
  for (let i = 0; i < count; i += 1) {
    const t = count <= 1 ? 0.5 : i / (count - 1);
    const a = start + arc * t;
    const x = center.x + Math.cos(a) * radius;
    const z = center.z + Math.sin(a) * radius;
    if (isOverlayExcluded(x, z)) continue;
    if (nearRiverWater(x, z, 1.5)) continue;
    out.push({ x, z, scale: scale + (i % 2) * 0.08, rotY: a });
  }
  return out;
}

export function buildFieldBandRows(
  center: Vec2,
  rows: number,
  cols: number,
  spacing: number,
  rowOffsetZ = 10,
): VolumeScatterPoint[] {
  const out: VolumeScatterPoint[] = [];
  const startX = center.x - ((cols - 1) * spacing) / 2;
  for (let r = 0; r < rows; r += 1) {
    const z = center.z + rowOffsetZ + r * spacing * 0.85;
    for (let c = 0; c < cols; c += 1) {
      const x = startX + c * spacing;
      if (isOverlayExcluded(x, z)) continue;
      if (nearFarmRoad(x, z)) continue;
      if (nearFarmhouse(x, z)) continue;
      out.push({ x, z, scale: 0.35, rotY: (c + r) * 0.15 });
    }
  }
  return out;
}

export function buildWallLine(
  fixedAxis: 'x' | 'z',
  fixedValue: number,
  start: number,
  end: number,
  step: number,
  url: string,
  scaleMin = 1.1,
  scaleMax = 1.25,
  largeEvery = 0,
): MassingGltfPlacement[] {
  const out: MassingGltfPlacement[] = [];
  let idx = 0;
  for (let v = start; v <= end + 0.01; v += step) {
    const x = fixedAxis === 'z' ? v : fixedValue;
    const z = fixedAxis === 'z' ? fixedValue : v;
    if (isOverlayExcluded(x, z)) {
      idx += 1;
      continue;
    }
    const useLarge = largeEvery > 0 && idx % largeEvery === 0;
    const treeUrl = useLarge ? KENNEY_ASSETS.treeLarge : url;
    const t = (v - start) / Math.max(end - start, 1);
    const scale = scaleMin + (scaleMax - scaleMin) * (0.35 + 0.65 * Math.sin(t * Math.PI));
    out.push(kenneyTree(treeUrl, x, z, scale, (idx % 5) * 0.35));
    idx += 1;
  }
  return out;
}

export function buildRingKenneyPlacements(
  center: Vec2,
  radius: number,
  count: number,
  url: string,
  scale = 1.1,
): MassingGltfPlacement[] {
  const out: MassingGltfPlacement[] = [];
  for (let i = 0; i < count; i += 1) {
    const a = (i / count) * Math.PI * 2;
    const x = center.x + Math.cos(a) * radius;
    const z = center.z + Math.sin(a) * radius;
    if (isOverlayExcluded(x, z)) continue;
    out.push(kenneyTree(url, x, z, scale + (i % 2) * 0.05, a + Math.PI / 2));
  }
  return out;
}

export function buildOrchardBlockKenney(center: Vec2): MassingGltfPlacement[] {
  const interior = buildOrchardGrid(center, 8, 6, 2.2, KENNEY_ASSETS.treeSmall).filter((t) => {
    if (isOverlayExcluded(t.x, t.z)) return false;
    if (nearFarmRoad(t.x, t.z)) return false;
    if (nearFarmhouse(t.x, t.z)) return false;
    return true;
  });
  const perimeter: MassingGltfPlacement[] = [];
  const corners = [
    { dx: -16, dz: -14 },
    { dx: 16, dz: -14 },
    { dx: -16, dz: 14 },
    { dx: 16, dz: 14 },
  ];
  for (const c of corners) {
    const x = center.x + c.dx;
    const z = center.z + c.dz;
    if (isOverlayExcluded(x, z) || nearFarmhouse(x, z)) continue;
    perimeter.push(kenneyTree(KENNEY_ASSETS.treeLarge, x, z, 1.12));
  }
  const edgeSteps = [
    { dx: 0, dz: -14, count: 2, along: 'x' as const },
    { dx: 0, dz: 14, count: 2, along: 'x' as const },
    { dx: -16, dz: 0, count: 2, along: 'z' as const },
    { dx: 16, dz: 0, count: 2, along: 'z' as const },
  ];
  for (const edge of edgeSteps) {
    for (let i = 0; i < edge.count; i += 1) {
      const t = edge.count <= 1 ? 0 : (i / (edge.count - 1)) * 2 - 1;
      const x = center.x + edge.dx + (edge.along === 'x' ? t * 8 : 0);
      const z = center.z + edge.dz + (edge.along === 'z' ? t * 8 : 0);
      if (isOverlayExcluded(x, z) || nearFarmhouse(x, z)) continue;
      perimeter.push(kenneyTree(KENNEY_ASSETS.treeLarge, x, z, 1.08));
    }
  }
  return [
    ...interior.map((t) => kenneyTree(t.url, t.x, t.z, t.scale ?? 1.05, t.rotY ?? 0)),
    ...perimeter,
  ];
}

export function buildResidentialStreetTrees(): MassingGltfPlacement[] {
  const out: MassingGltfPlacement[] = [];
  for (const x of [14, 48]) {
    for (let z = -18; z >= -62; z -= 6) {
      if (isOverlayExcluded(x, z)) continue;
      out.push(kenneyTree(KENNEY_ASSETS.treeSmall, x, z, 0.98 + ((x + z) % 4) * 0.02, 0.4));
    }
  }
  return out;
}

export function buildCivicVolumePlacements(): VolumeScatterPoint[] {
  const sq = CANONICAL_TOWN.square.center;
  const corners = [
    { dx: -6.5, dz: -6.5 },
    { dx: 6.5, dz: -6.5 },
    { dx: -6.5, dz: 6.5 },
    { dx: 6.5, dz: 6.5 },
    { dx: -8, dz: 0 },
    { dx: 8, dz: 0 },
    { dx: 0, dz: -8 },
    { dx: 0, dz: 8 },
  ];
  return corners
    .map(({ dx, dz }) => ({ x: sq.x + dx, z: sq.z + dz, scale: 1.15, rotY: Math.atan2(dz, dx) }))
    .filter((p) => !isOverlayExcluded(p.x, p.z));
}

export function buildResidentialGardenVolumes(): VolumeScatterPoint[] {
  const houses = [
    { x: 11, z: -10 },
    { x: 30, z: -12 },
    { x: 11, z: -30 },
    { x: 30, z: -30 },
  ];
  const out: VolumeScatterPoint[] = [];
  for (const h of houses) {
    const offsets = [
      { dx: -2.2, dz: -1.8 },
      { dx: 2.0, dz: -1.6 },
      { dx: -1.8, dz: 2.0 },
      { dx: 2.2, dz: 1.8 },
      { dx: 0, dz: -2.4 },
      { dx: -2.4, dz: 0.5 },
      { dx: 2.4, dz: 0.4 },
      { dx: 0.2, dz: 2.2 },
    ];
    for (const o of offsets) {
      const x = h.x + o.dx;
      const z = h.z + o.dz;
      if (isOverlayExcluded(x, z)) continue;
      out.push({ x, z, scale: 0.55 + ((h.x + h.z) % 3) * 0.06, rotY: (h.x + h.z) * 0.1 });
    }
  }
  return out;
}

export function buildFutureLotGardenVolumes(): VolumeScatterPoint[] {
  const out: VolumeScatterPoint[] = [];
  for (const plot of CANONICAL_TOWN.vacantPlots) {
    const offsets = [
      { dx: -2, dz: -1.5 },
      { dx: 1.5, dz: -2 },
      { dx: 2, dz: 1.5 },
      { dx: -1.5, dz: 2 },
    ];
    for (const o of offsets) {
      const x = plot.center.x + o.dx;
      const z = plot.center.z + o.dz;
      if (isOverlayExcluded(x, z)) continue;
      out.push({ x, z, scale: 0.5, rotY: plot.center.x * 0.05 });
    }
  }
  return out;
}

export function buildPeripheryForestKenney(): MassingGltfPlacement[] {
  const north = buildWallLine('z', -102, -88, 88, 4, KENNEY_ASSETS.treeSmall, 1.1, 1.25);
  const west = buildWallLine('x', -104, -90, 70, 5, KENNEY_ASSETS.treeSmall, 1.05, 1.2, 4);
  const accents = [
    { x: 92, z: -96 },
    { x: 98, z: -88 },
    { x: 95, z: 58 },
    { x: 100, z: 48 },
  ]
    .filter(({ x, z }) => !isOverlayExcluded(x, z))
    .map(({ x, z }, i) => kenneyTree(KENNEY_ASSETS.treeLarge, x, z, 1.1, i * 0.4));
  return [...north, ...west, ...accents];
}

export function buildParkRiverArcKenney(): MassingGltfPlacement[] {
  const park = CANONICAL_TOWN.park;
  const out: MassingGltfPlacement[] = [];
  const westX = park.center.x - park.width * 0.5 - 1.2;
  const northZ = park.center.z + park.depth * 0.5 + 1.0;
  const southZ = park.center.z - park.depth * 0.5 - 1.0;
  const eastX = park.center.x + park.width * 0.42;
  const zMin = park.center.z - park.depth * 0.45;
  const zMax = park.center.z + park.depth * 0.45;
  const xMin = park.center.x - park.width * 0.42;
  const xMax = park.center.x + park.width * 0.38;
  const roadBand = 2.2;

  for (let z = zMin; z <= zMax; z += 2.0) {
    if (Math.abs(z - park.center.z) < roadBand) continue;
    if (!isOverlayExcluded(westX, z) && !nearRiverWater(westX, z, 1.5)) {
      out.push(kenneyTree(KENNEY_ASSETS.treeSmall, westX, z, 1.08, 0.2));
    }
    const westInnerX = westX + 2.4;
    if (!isOverlayExcluded(westInnerX, z) && !nearRiverWater(westInnerX, z, 1.5)) {
      out.push(kenneyTree(KENNEY_ASSETS.treeSmall, westInnerX, z, 1.02, 0.4));
    }
  }
  for (let x = xMin; x <= xMax; x += 2.2) {
    if (!isOverlayExcluded(x, northZ) && !nearRiverWater(x, northZ, 1.5)) {
      out.push(kenneyTree(KENNEY_ASSETS.treeSmall, x, northZ, 1.06, 0.6));
    }
    if (!isOverlayExcluded(x, southZ) && !nearRiverWater(x, southZ, 1.5)) {
      out.push(kenneyTree(KENNEY_ASSETS.treeSmall, x, southZ, 1.04, 1.0));
    }
  }
  for (let z = park.center.z + roadBand + 1; z <= zMax; z += 2.0) {
    if (!isOverlayExcluded(eastX, z) && !nearRiverWater(eastX, z, 1.2)) {
      out.push(kenneyTree(KENNEY_ASSETS.treeSmall, eastX, z, 1.05, 1.4));
    }
  }
  for (let z = zMin; z <= park.center.z - roadBand - 1; z += 2.0) {
    if (!isOverlayExcluded(eastX, z) && !nearRiverWater(eastX, z, 1.2)) {
      out.push(kenneyTree(KENNEY_ASSETS.treeSmall, eastX, z, 1.03, 0.8));
    }
  }
  return out;
}

export function buildParkPromenadeVolumes(): VolumeScatterPoint[] {
  const park = CANONICAL_TOWN.park;
  const out: VolumeScatterPoint[] = [];
  const westX = park.center.x - park.width * 0.5 - 0.8;
  const northZ = park.center.z + park.depth * 0.5 + 0.6;
  const southZ = park.center.z - park.depth * 0.5 - 0.6;
  const zMin = park.center.z - park.depth * 0.45;
  const zMax = park.center.z + park.depth * 0.45;
  const xMin = park.center.x - park.width * 0.4;
  const xMax = park.center.x + park.width * 0.3;
  const roadBand = 2.2;

  for (let z = zMin; z <= zMax; z += 2.2) {
    if (Math.abs(z - park.center.z) < roadBand) continue;
    if (!isOverlayExcluded(westX, z) && !nearRiverWater(westX, z, 1.5)) {
      out.push({ x: westX, z, scale: 0.5, rotY: z * 0.08 });
    }
  }
  for (let x = xMin; x <= xMax; x += 2.5) {
    if (!isOverlayExcluded(x, northZ) && !nearRiverWater(x, northZ, 1.5)) {
      out.push({ x, z: northZ, scale: 0.48, rotY: x * 0.06 });
    }
    if (!isOverlayExcluded(x, southZ) && !nearRiverWater(x, southZ, 1.5)) {
      out.push({ x, z: southZ, scale: 0.5, rotY: x * 0.07 });
    }
  }
  return out;
}
