/**
 * WF02 R4.1 declarative district composition specs — single presentation authority.
 */
import { CANONICAL_TOWN } from '@/world/townLayout';
import { KENNEY_ASSETS } from '../assets/EnvironmentAssetRegistry';
import { DISTRICT_PALETTE } from '../palette/DistrictPalette';
import { buildOrchardGrid, buildOverlayCells, type KenneyTreePlacement, type OverlayCell } from './compositionMask';

export interface MassingScatterPoint {
  x: number;
  z: number;
  y?: number;
  scale?: number;
  rotY?: number;
  rotX?: number;
}

export interface MassingGltfPlacement {
  url: string;
  x: number;
  z: number;
  rotY?: number;
  scale?: number;
  yOffset?: number;
}

export interface GroundTintZone {
  id: string;
  color: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface DistrictMassingSpec {
  groundZones: GroundTintZone[];
  kenneyTrees: KenneyTreePlacement[];
  fenceSegments: MassingGltfPlacement[];
  frontageScatter: MassingScatterPoint[];
  civicPavers: MassingScatterPoint[];
}

function kenney(url: string, x: number, z: number, scale = 1, rotY = 0): KenneyTreePlacement {
  return { url, x, z, scale, rotY };
}

function fence(x: number, z: number, rotY: number, scale = 2.2): MassingGltfPlacement {
  return { url: KENNEY_ASSETS.fenceLow, x, z, rotY, scale, yOffset: 0.02 };
}

/** Residential lot hedge segments — interior sides only, away from branch roads. */
function buildResidentialHedges(): MassingGltfPlacement[] {
  const segments: MassingGltfPlacement[] = [];
  const houses = [
    { x: 11, z: -10, rot: -Math.PI / 2 },
    { x: 30, z: -12, rot: -Math.PI / 2 },
    { x: 11, z: -30, rot: 0 },
    { x: 30, z: -30, rot: -Math.PI / 2 },
  ];
  for (const h of houses) {
    const offsets = [
      { dx: -4.2, dz: 0, rotY: h.rot + Math.PI / 2 },
      { dx: 4.2, dz: 0, rotY: h.rot + Math.PI / 2 },
      { dx: 0, dz: 4.0, rotY: h.rot },
    ];
    for (const o of offsets) {
      for (let i = -1; i <= 1; i += 1) {
        const along = i * 1.8;
        const x = h.x + o.dx + (o.rotY === h.rot ? along : 0);
        const z = h.z + o.dz + (o.rotY === h.rot + Math.PI / 2 ? along : 0);
        segments.push(fence(x, z, o.rotY));
      }
    }
  }
  for (const plot of CANONICAL_TOWN.vacantPlots) {
    const half = plot.width * 0.38;
    const corners = [
      { x: plot.center.x - half, z: plot.center.z - half, rotY: 0 },
      { x: plot.center.x + half, z: plot.center.z - half, rotY: Math.PI / 2 },
      { x: plot.center.x - half, z: plot.center.z + half, rotY: 0 },
    ];
    for (const c of corners) {
      segments.push(fence(c.x, c.z, c.rotY, 2.0));
    }
  }
  return segments.slice(0, 48);
}

function buildFrontageScatter(): MassingScatterPoint[] {
  const points: MassingScatterPoint[] = [];
  const commercialZ = [12, 18, 26, 34, 42];
  for (const z of commercialZ) {
    points.push({ x: -16.5, z, scale: 0.95, rotY: Math.PI / 2 });
  }
  for (let x = 14; x <= 58; x += 8) {
    points.push({ x, z: -22, scale: 1.0, rotY: 0.5 });
  }
  return points;
}

function buildCivicPavers(): MassingScatterPoint[] {
  const sq = CANONICAL_TOWN.square.center;
  const points: MassingScatterPoint[] = [];
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2;
    const r = 7.2;
    points.push({ x: sq.x + Math.cos(a) * r, z: sq.z + Math.sin(a) * r, rotY: a, scale: 1.05 });
  }
  return points;
}

export function buildDistrictMassingSpec(): DistrictMassingSpec {
  const orchard = CANONICAL_TOWN.farmPlots.find((p) => p.id === 'farm-3')!;
  const kenneyTrees: KenneyTreePlacement[] = [
    ...buildOrchardGrid(orchard.center, 4, 5, 2.4, KENNEY_ASSETS.treeSmall),
    kenney(KENNEY_ASSETS.treeLarge, -14, -14, 1.15),
    kenney(KENNEY_ASSETS.treeLarge, 14, -14, 1.1, 0.5),
    kenney(KENNEY_ASSETS.treeLarge, -14, 14, 1.12, 1.0),
    kenney(KENNEY_ASSETS.treeLarge, 14, 14, 1.08, 1.5),
    kenney(KENNEY_ASSETS.treeLarge, 22, 78, 1.05),
    kenney(KENNEY_ASSETS.treeLarge, 34, 86, 1.1, 0.8),
    kenney(KENNEY_ASSETS.treeSmall, 16, -28, 1.0, 0.8),
    kenney(KENNEY_ASSETS.treeSmall, 28, -31, 0.95, 1.6),
    kenney(KENNEY_ASSETS.treeSmall, 20, -18, 0.92, 0.3),
    kenney(KENNEY_ASSETS.treeSmall, 36, -20, 0.98, 1.1),
    kenney(KENNEY_ASSETS.treeSmall, 48, -24, 1.02, 0.6),
    kenney(KENNEY_ASSETS.treeSmall, 58, -18, 0.96, 1.4),
  ];

  return {
    groundZones: [
      {
        id: 'residential',
        color: DISTRICT_PALETTE.groundResidential,
        minX: 8,
        maxX: 82,
        minZ: -65,
        maxZ: -8,
      },
    ],
    kenneyTrees,
    fenceSegments: buildResidentialHedges(),
    frontageScatter: buildFrontageScatter(),
    civicPavers: buildCivicPavers(),
  };
}

export function resolveGroundTintCells(zones: GroundTintZone[]): Map<string, OverlayCell[]> {
  const map = new Map<string, OverlayCell[]>();
  for (const zone of zones) {
    map.set(zone.id, buildOverlayCells(zone.minX, zone.maxX, zone.minZ, zone.maxZ, 5.0));
  }
  return map;
}

export function toGltfPlacements(trees: KenneyTreePlacement[]): MassingGltfPlacement[] {
  return trees.map((t) => ({
    url: t.url,
    x: t.x,
    z: t.z,
    rotY: t.rotY,
    scale: t.scale,
    yOffset: 0,
  }));
}
