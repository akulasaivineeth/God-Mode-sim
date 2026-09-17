/**
 * WF02 R15 Phase 0 — disposable hero-block composition envelope spec.
 * Authored neighborhood-scale masses using registered Kenney props only.
 */
import { CANONICAL_TOWN } from '@/world/townLayout';
import { DISTRICT_PALETTE } from '@/rendering/palette/DistrictPalette';
import { isProofPlacementExcluded } from './heroBlockPhase0ProofMask';

export interface ProofGroundEnvelope {
  id: string;
  color: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  opacity: number;
}

export interface ProofGltfPlacement {
  urlKey: 'planter' | 'pathStonesShort' | 'pathStonesMessy' | 'pathShort' | 'pathLong' | 'fenceLow' | 'treeLarge' | 'treeSmall';
  x: number;
  z: number;
  rotY?: number;
  scale?: number;
}

const sq = CANONICAL_TOWN.square;
const park = CANONICAL_TOWN.park;
const plot = CANONICAL_TOWN.vacantPlots[0];

function pushTree(out: ProofGltfPlacement[], x: number, z: number, large: boolean, rotY = 0, scale = 1.15) {
  if (isProofPlacementExcluded(x, z, 0.85)) return;
  out.push({
    urlKey: large ? 'treeLarge' : 'treeSmall',
    x,
    z,
    rotY,
    scale,
  });
}

function pushFence(out: ProofGltfPlacement[], x: number, z: number, rotY: number, scale = 2.2) {
  if (isProofPlacementExcluded(x, z, 0.45)) return;
  out.push({ urlKey: 'fenceLow', x, z, rotY, scale });
}

function pushProp(
  out: ProofGltfPlacement[],
  urlKey: ProofGltfPlacement['urlKey'],
  x: number,
  z: number,
  rotY = 0,
  scale = 1.1,
  buildingMargin = 0.55,
) {
  if (isProofPlacementExcluded(x, z, buildingMargin)) return;
  out.push({ urlKey, x, z, rotY, scale });
}

/** Continuous district ground roles — zone-limited, not full-frame wash. */
export function buildProofGroundEnvelopes(): ProofGroundEnvelope[] {
  return [
    {
      id: 'civic-plaza-mass',
      color: DISTRICT_PALETTE.accentWarm,
      minX: sq.center.x - 9,
      maxX: sq.center.x + 9,
      minZ: sq.center.z - 9,
      maxZ: sq.center.z + 5,
      opacity: 0.56,
    },
    {
      id: 'commercial-frontage-mass',
      color: DISTRICT_PALETTE.groundCommercial,
      minX: -22,
      maxX: 22,
      minZ: 5,
      maxZ: 17,
      opacity: 0.5,
    },
    {
      id: 'residential-block-mass',
      color: DISTRICT_PALETTE.groundResidential,
      minX: -24,
      maxX: 24,
      minZ: -10,
      maxZ: 3,
      opacity: 0.48,
    },
    {
      id: 'future-lot-frame-mass',
      color: DISTRICT_PALETTE.groundGarden,
      minX: plot.center.x - 5,
      maxX: plot.center.x + 5,
      minZ: plot.center.z - 4.5,
      maxZ: plot.center.z + 4.5,
      opacity: 0.54,
    },
    {
      id: 'park-river-edge-mass',
      color: DISTRICT_PALETTE.canopyLight,
      minX: 12,
      maxX: 20,
      minZ: -16,
      maxZ: 20,
      opacity: 0.58,
    },
    {
      id: 'spine-canopy-belt-mass',
      color: DISTRICT_PALETTE.groundFarm,
      minX: -28,
      maxX: 28,
      minZ: -22,
      maxZ: -12,
      opacity: 0.46,
    },
  ];
}

export function buildProofGltfPlacements(): ProofGltfPlacement[] {
  const out: ProofGltfPlacement[] = [];

  // Civic plaza mass — radial pavers + center amenity
  for (let i = 0; i < 16; i += 1) {
    const a = (i / 16) * Math.PI * 2;
    const radius = 3.8 + (i % 4) * 0.55;
    const x = sq.center.x + Math.cos(a) * radius;
    const z = sq.center.z + Math.sin(a) * radius;
    pushProp(
      out,
      i % 2 === 0 ? 'pathStonesShort' : 'pathStonesMessy',
      x,
      z,
      a + Math.PI / 2,
      1.12 + (i % 3) * 0.04,
      0.35,
    );
  }
  for (const offset of [
    { x: 0, z: 0 },
    { x: -1.8, z: 1.4 },
    { x: 1.8, z: -1.2 },
    { x: 0, z: -2.2 },
    { x: -2.6, z: -0.8 },
    { x: 2.4, z: 0.6 },
  ]) {
    pushProp(out, 'planter', sq.center.x + offset.x, sq.center.z + offset.z, offset.x * 0.2, 1.18, 0.35);
  }
  for (let z = sq.center.z - 5; z <= sq.center.z + 3; z += 1.8) {
    pushProp(out, 'pathLong', sq.center.x - 5.5, z, Math.PI / 2, 1.15, 0.35);
    pushProp(out, 'pathLong', sq.center.x + 5.5, z, Math.PI / 2, 1.15, 0.35);
  }

  // Commercial frontage mass — sidewalk rhythm + building-front strips (z=11–17 band)
  for (let x = -20; x <= 20; x += 2) {
    for (const z of [11.5, 13, 14.5, 16, 17.5]) {
      pushProp(
        out,
        z >= 14 ? 'pathStonesMessy' : 'pathStonesShort',
        x,
        z,
        Math.PI / 2,
        1.02 + (Math.abs(x) % 3) * 0.03,
        0.5,
      );
    }
  }
  for (const x of [-18, -10, -2, 6, 14]) {
    pushProp(out, 'pathLong', x, 12.5, Math.PI / 2, 1.22, 0.5);
    pushProp(out, 'planter', x + 1.2, 15.8, 0.15, 1.08, 0.5);
  }

  // Residential block mass — garden hedges + accent trees
  for (const house of CANONICAL_TOWN.buildings.filter((b) => b.type === 'house')) {
    const side = house.position.x > 0 ? 1 : -1;
    for (let i = -3; i <= 3; i += 1) {
      pushFence(out, house.position.x + side * 4.2, house.position.z + i * 1.2, side > 0 ? Math.PI / 2 : -Math.PI / 2, 2.25);
      pushFence(out, house.position.x - side * 2.8, house.position.z + i * 1.35, side > 0 ? -Math.PI / 2 : Math.PI / 2, 2.1);
    }
    pushTree(out, house.position.x - side * 3.2, house.position.z + 3.8, true, side * 0.35, 1.28);
    pushTree(out, house.position.x + side * 1.8, house.position.z - 2.5, false, 0.2, 1.1);
    pushTree(out, house.position.x + side * 4.8, house.position.z + 1.5, false, 0.45, 1.05);
    pushProp(out, 'pathShort', house.position.x, house.position.z - 1.5, side > 0 ? -Math.PI / 2 : Math.PI / 2, 1.2, 0.45);
    for (const dz of [-2.5, 0, 2.5]) {
      pushProp(out, 'pathStonesShort', house.position.x + side * 1.2, house.position.z + dz, side * 0.3, 1.05, 0.45);
    }
  }

  // Future lot frame mass — intentional pad framing
  if (plot) {
    const hw = plot.width * 0.46;
    const hd = plot.depth * 0.46;
    for (let t = 0; t <= 1; t += 0.125) {
      const angle = t * Math.PI * 2;
      pushFence(out, plot.center.x + Math.cos(angle) * hw, plot.center.z + Math.sin(angle) * hd, angle + Math.PI / 2, 2.35);
    }
    for (let t = 0; t <= 1; t += 0.2) {
      const x = plot.center.x;
      const z = plot.center.z - hd + (hd * 2 + 3) * t;
      pushProp(out, 'pathStonesShort', x, z, 0, 1.08, 0.4);
    }
    for (const dx of [-2.4, -1.2, 0, 1.2, 2.4]) {
      pushProp(out, 'planter', plot.center.x + dx, plot.center.z, dx * 0.15, 1.05, 0.4);
      pushProp(out, 'pathStonesMessy', plot.center.x + dx, plot.center.z + 2.2, dx * 0.1, 1.02, 0.4);
    }
    pushTree(out, plot.center.x - 3.5, plot.center.z + 2.8, true, 0.2, 1.12);
    pushTree(out, plot.center.x + 3.5, plot.center.z + 2.8, true, -0.15, 1.1);
  }

  // Park / river edge mass — west-of-corridor shelf (river envelope ~16 m half-width)
  if (park && park.width > 0) {
    for (let z = -14; z <= 18; z += 2.2) {
      pushTree(out, 16, z, true, 0.1 + (z % 5) * 0.08, 1.3);
      pushTree(out, 18, z + 0.9, false, -0.2, 1.1);
      if (z % 3 === 0) pushTree(out, 14.5, z + 1.4, false, 0.35, 1.06);
    }
    for (let z = -10; z <= 14; z += 3.5) {
      pushProp(out, 'pathStonesShort', 15.5, z, 0.25, 1.05, 0.35);
      pushProp(out, 'planter', 17.2, z + 1.1, 0.1, 1.04, 0.35);
    }
  }
  const river = CANONICAL_TOWN.river;
  for (let i = 0; i < river.points.length; i += 1) {
    const pt = river.points[i];
    pushTree(out, pt.x - 17, pt.z, i % 2 === 0, 0.5 + i * 0.25, 1.15);
    pushTree(out, pt.x - 18.5, pt.z + 1.2, true, 0.3, 1.2);
    pushProp(out, 'pathStonesMessy', pt.x - 16.2, pt.z - 0.8, 0.4, 1.04, 0.35);
  }

  // Spine canopy belt — north + west/east perimeter closure
  for (let x = -30; x <= 30; x += 2.8) {
    pushTree(out, x, -21, x % 3 === 0, (x + 30) * 0.04, 1.25);
    pushTree(out, x, -18.5, false, (x + 30) * 0.02, 1.08);
    if (x % 5 === 0) pushTree(out, x, -16.5, true, 0.15, 1.12);
  }
  for (let z = -18; z <= 22; z += 3.2) {
    pushTree(out, -29, z, z % 4 === 0, Math.PI / 2, 1.2);
    pushTree(out, -27, z + 1.1, false, 0.2, 1.06);
    pushTree(out, 13, z, z % 3 === 0, -0.15, 1.08);
  }

  // Civic cluster connector trees along spine approach
  for (let z = -8; z <= 6; z += 2) {
    pushTree(out, -6, z, false, 0.2, 1.05);
    pushTree(out, 6, z, z % 2 === 0, -0.1, 1.08);
    pushProp(out, 'pathStonesShort', -4.5, z + 0.5, 0.3, 1.02, 0.35);
    pushProp(out, 'pathStonesShort', 4.5, z + 0.5, -0.3, 1.02, 0.35);
  }

  return out;
}

export const PROOF_GROUND_ENVELOPE_COUNT = buildProofGroundEnvelopes().length;
