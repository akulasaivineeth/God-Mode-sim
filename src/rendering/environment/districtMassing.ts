/**
 * WF02 R4.1 declarative district composition specs — R6: hedges only; KCC in massSilhouettePlacements.
 */
import { CANONICAL_TOWN } from '@/world/townLayout';
import { KENNEY_ASSETS } from '../assets/EnvironmentAssetRegistry';
import { type OverlayCell, buildOverlayCells } from './compositionMask';

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

export interface KenneyTreePlacement {
  url: string;
  x: number;
  z: number;
  rotY?: number;
  scale?: number;
}

export interface DistrictMassingSpec {
  groundZones: GroundTintZone[];
  kenneyTrees: KenneyTreePlacement[];
  fenceSegments: MassingGltfPlacement[];
  frontageScatter: MassingScatterPoint[];
  civicPavers: MassingScatterPoint[];
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

export function buildDistrictMassingSpec(): DistrictMassingSpec {
  return {
    groundZones: [],
    kenneyTrees: [],
    fenceSegments: buildResidentialHedges(),
    frontageScatter: [],
    civicPavers: [],
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
