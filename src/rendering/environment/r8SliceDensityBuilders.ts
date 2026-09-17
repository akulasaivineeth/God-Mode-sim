/**
 * WF02 R8 Phase 0b — high-density slice massing (registered Kenney + CVP only).
 * Suppresses orchard/park/periphery; targets PLAN_R8 §7–§8 image-space hierarchy.
 */
import { KENNEY_ASSETS } from '../assets/EnvironmentAssetRegistry';
import { isOverlayExcluded } from './compositionMask';
import { getCompositionEnvelope, insetEnvelopePoly } from './compositionEnvelopes';
import type { MassingGltfPlacement } from './districtMassing';
import {
  buildArcKenneyPlacements,
  type VolumeScatterPoint,
} from './massSilhouetteBuilders';
import { envelopePoly, pointInPolygon } from './envelopeFillBuilders';
import { getVisualFacilityMapping } from './VisualTownLayout';
import { isInAnyR8SliceZone, isInR8SliceZone } from './r8SliceBounds';

/** Civic plaza anchor for R8 slice — near community-hall visual, inside civic zone bounds. */
export function getR8CivicPlazaCenter() {
  const hall = getVisualFacilityMapping('community-hall');
  return { x: hall.visualCenter.x, z: hall.visualCenter.z - 2 };
}

function fillEnvelopeCvpSlice(
  envId: string,
  spacing: number,
  scale: number,
  zoneFilter?: 'civic' | 'commercial' | 'residential',
): VolumeScatterPoint[] {
  const env = getCompositionEnvelope(envId);
  const poly = envelopePoly(env);
  const xs = poly.map((p) => p[0]);
  const zs = poly.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minZ = Math.min(...zs);
  const maxZ = Math.max(...zs);
  const out: VolumeScatterPoint[] = [];
  for (let x = minX; x <= maxX; x += spacing) {
    for (let z = minZ; z <= maxZ; z += spacing) {
      if (!pointInPolygon(x, z, poly)) continue;
      if (isOverlayExcluded(x, z)) continue;
      if (zoneFilter && !isInR8SliceZone(x, z, zoneFilter)) continue;
      if (!zoneFilter && !isInAnyR8SliceZone(x, z)) continue;
      out.push({
        x,
        z,
        scale: scale + ((x * 7 + z * 13) % 5) * 0.05,
        rotY: (x + z) * 0.05,
      });
    }
  }
  return out;
}

function fillEnvelopeKenneySlice(
  envId: string,
  spacing: number,
  url: string,
  scaleBase: number,
  zoneFilter?: 'civic' | 'commercial' | 'residential',
): MassingGltfPlacement[] {
  const env = getCompositionEnvelope(envId);
  const poly = envelopePoly(env);
  const xs = poly.map((p) => p[0]);
  const zs = poly.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minZ = Math.min(...zs);
  const maxZ = Math.max(...zs);
  const out: MassingGltfPlacement[] = [];
  for (let x = minX; x <= maxX; x += spacing) {
    for (let z = minZ; z <= maxZ; z += spacing) {
      if (!pointInPolygon(x, z, poly)) continue;
      if (isOverlayExcluded(x, z)) continue;
      if (zoneFilter && !isInR8SliceZone(x, z, zoneFilter)) continue;
      if (!zoneFilter && !isInAnyR8SliceZone(x, z)) continue;
      out.push({
        url,
        x,
        z,
        scale: scaleBase + ((x + z) % 4) * 0.04,
        rotY: (x + z) * 0.08,
        yOffset: 0,
      });
    }
  }
  return out;
}

/** Civic plaza warm pad + embankment — dense CVP within civic slice. */
export function buildR8CivicPlazaCvp(): VolumeScatterPoint[] {
  return [
    ...fillEnvelopeCvpSlice('civic-plaza', 1.35, 0.92, 'civic'),
    ...fillEnvelopeCvpSlice('embankment-civic', 2.4, 0.88, 'civic'),
  ];
}

/** Colonnade ring — scaled tree-large framing civic plaza. */
export function buildR8CivicColonnadeKcc(): MassingGltfPlacement[] {
  const plaza = getR8CivicPlazaCenter();
  const ring = buildArcKenneyPlacements(
    plaza,
    9.5,
    300,
    -30,
    28,
    KENNEY_ASSETS.treeLarge,
    3.05,
  );
  const inner = fillEnvelopeKenneySlice('civic-colonnade', 2.2, KENNEY_ASSETS.treeLarge, 2.85, 'civic');
  return [...ring, ...inner];
}

/** Commercial/work frontage shrub band. */
export function buildR8CommercialFrontageCvp(): VolumeScatterPoint[] {
  return fillEnvelopeCvpSlice('commercial-frontage', 1.55, 0.62, 'commercial');
}

/** Residential cluster garden mounds at visual house centers. */
export function buildR8ResidentialGardenCvp(): VolumeScatterPoint[] {
  const houseIds = ['house-1', 'house-2', 'house-3', 'house-4'] as const;
  const out: VolumeScatterPoint[] = [];
  for (const id of houseIds) {
    const { visualCenter } = getVisualFacilityMapping(id);
    const offsets = [
      { dx: -3.2, dz: -2.6 },
      { dx: 3.0, dz: -2.4 },
      { dx: -2.8, dz: 2.8 },
      { dx: 3.2, dz: 2.6 },
      { dx: 0, dz: -3.4 },
      { dx: -3.4, dz: 0.6 },
      { dx: 3.4, dz: 0.5 },
      { dx: 0.2, dz: 3.2 },
      { dx: -1.6, dz: -1.2 },
      { dx: 1.8, dz: 1.4 },
    ];
    for (const o of offsets) {
      const x = visualCenter.x + o.dx;
      const z = visualCenter.z + o.dz;
      if (!isInR8SliceZone(x, z, 'residential')) continue;
      if (isOverlayExcluded(x, z)) continue;
      out.push({ x, z, scale: 0.78 + ((x + z) % 3) * 0.06, rotY: visualCenter.x * 0.08 });
    }
  }
  return out;
}

/** L-shaped street-tree framing for residential cluster. */
export function buildR8ResidentialStreetTreesKcc(): MassingGltfPlacement[] {
  const out: MassingGltfPlacement[] = [];
  const pushTree = (x: number, z: number, scale = 2.75) => {
    if (!isInR8SliceZone(x, z, 'residential')) return;
    if (isOverlayExcluded(x, z)) return;
    out.push({
      url: KENNEY_ASSETS.treeLarge,
      x,
      z,
      scale: scale + ((x + z) % 3) * 0.08,
      rotY: 0.35,
      yOffset: 0,
    });
  };
  for (let z = -30; z <= -6; z += 2.8) {
    pushTree(10, z, 2.65);
    pushTree(34, z, 2.55);
  }
  for (let x = 12; x <= 48; x += 3.2) {
    pushTree(x, -7.5, 2.7);
  }
  return out;
}

/** Fence-low L-band around residential visual centers. */
export function buildR8ResidentialFenceKcc(): MassingGltfPlacement[] {
  const out: MassingGltfPlacement[] = [];
  const houseIds = ['house-1', 'house-2', 'house-3', 'house-4'] as const;
  for (const id of houseIds) {
    const { visualCenter } = getVisualFacilityMapping(id);
    const segments = [
      { dx: -5.5, dz: 0, rotY: Math.PI / 2, count: 4 },
      { dx: 5.5, dz: 0, rotY: Math.PI / 2, count: 4 },
      { dx: 0, dz: 5.0, rotY: 0, count: 3 },
    ];
    for (const seg of segments) {
      for (let i = 0; i < seg.count; i += 1) {
        const along = (i - (seg.count - 1) / 2) * 1.6;
        const x = visualCenter.x + seg.dx + (seg.rotY === 0 ? along : 0);
        const z = visualCenter.z + seg.dz + (seg.rotY === Math.PI / 2 ? along : 0);
        if (!isInR8SliceZone(x, z, 'residential')) continue;
        if (isOverlayExcluded(x, z)) continue;
        out.push({
          url: KENNEY_ASSETS.fenceLow,
          x,
          z,
          rotY: seg.rotY,
          scale: 2.65,
          yOffset: 0.02,
        });
      }
    }
  }
  return out;
}

/** Kenney planter + path-stones — civic anchor and frontage rhythm. */
export function buildR8SliceDetailProps(): MassingGltfPlacement[] {
  const plaza = getR8CivicPlazaCenter();
  const out: MassingGltfPlacement[] = [];

  out.push({
    url: KENNEY_ASSETS.planter,
    x: plaza.x,
    z: plaza.z,
    scale: 3.6,
    rotY: 0,
    yOffset: 0,
  });

  for (const [dx, dz, rotY] of [
    [0, -1.4, 0],
    [0, 1.4, Math.PI],
    [-1.4, 0, Math.PI / 2],
    [1.4, 0, -Math.PI / 2],
  ] as const) {
    for (let t = 1; t <= 5; t += 1) {
      const x = plaza.x + dx * t;
      const z = plaza.z + dz * t;
      if (!isInR8SliceZone(x, z, 'civic')) continue;
      out.push({
        url: KENNEY_ASSETS.pathStonesShort,
        x,
        z,
        scale: 2.4,
        rotY,
        yOffset: 0.02,
      });
    }
  }

  for (let z = 6; z <= 22; z += 3.5) {
    const x = -14.8;
    if (!isInR8SliceZone(x, z, 'commercial')) continue;
    out.push({
      url: KENNEY_ASSETS.planter,
      x,
      z,
      scale: 1.35 + (z % 2) * 0.1,
      rotY: Math.PI / 2,
      yOffset: 0,
    });
  }

  const houseIds = ['house-1', 'house-2', 'house-3', 'house-4'] as const;
  for (const id of houseIds) {
    const { visualCenter } = getVisualFacilityMapping(id);
    for (const o of [
      { dx: -4.2, dz: 3.8 },
      { dx: 4.0, dz: 3.6 },
    ]) {
      const x = visualCenter.x + o.dx;
      const z = visualCenter.z + o.dz;
      if (!isInR8SliceZone(x, z, 'residential')) continue;
      if (isOverlayExcluded(x, z)) continue;
      out.push({
        url: KENNEY_ASSETS.planter,
        x,
        z,
        scale: 1.25,
        rotY: 0.2,
        yOffset: 0,
      });
    }
  }

  const commercialPoly = insetEnvelopePoly(getCompositionEnvelope('commercial-frontage').poly, 2);
  const cx = (commercialPoly[0]![0] + commercialPoly[1]![0]) / 2;
  const cz = (commercialPoly[0]![1] + commercialPoly[2]![1]) / 2;
  out.push({
    url: KENNEY_ASSETS.pathStonesMessy,
    x: cx,
    z: cz + 2,
    scale: 3.2,
    rotY: 0.15,
    yOffset: 0.02,
  });

  return out;
}

export function buildR8SliceKenneyPlacements(): MassingGltfPlacement[] {
  return [
    ...buildR8CivicColonnadeKcc(),
    ...buildR8ResidentialStreetTreesKcc(),
    ...buildR8ResidentialFenceKcc(),
    ...buildR8SliceDetailProps(),
  ];
}

export function buildR8SliceVolumePlacements(): {
  canopyWarm: VolumeScatterPoint[];
  fieldWarm: VolumeScatterPoint[];
} {
  return {
    canopyWarm: [
      ...buildR8CivicPlazaCvp(),
      ...buildR8CommercialFrontageCvp(),
      ...buildR8ResidentialGardenCvp(),
    ],
    fieldWarm: [],
  };
}

/** Diagnostics — instance counts for slice manifest. */
export function getR8SliceCompositionCounts() {
  const kenney = buildR8SliceKenneyPlacements();
  const vol = buildR8SliceVolumePlacements();
  return {
    kenneyInstances: kenney.length,
    cvpCanopyWarm: vol.canopyWarm.length,
    civicColonnade: buildR8CivicColonnadeKcc().length,
    civicPlazaCvp: buildR8CivicPlazaCvp().length,
    commercialFrontageCvp: buildR8CommercialFrontageCvp().length,
    residentialGardenCvp: buildR8ResidentialGardenCvp().length,
    residentialStreetTrees: buildR8ResidentialStreetTreesKcc().length,
    detailProps: buildR8SliceDetailProps().length,
  };
}
