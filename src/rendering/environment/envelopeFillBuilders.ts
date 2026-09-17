/**
 * WF02 R7.1 — connected envelope band/polygon fills → KCC/CVP placements.
 * Scoped to hero core; respects compositionMask exclusions.
 */
import { KENNEY_ASSETS } from '../assets/EnvironmentAssetRegistry';
import { isOverlayExcluded } from './compositionMask';
import {
  COMPOSITION_ENVELOPES,
  getCompositionEnvelope,
  insetEnvelopePoly,
  type CompositionEnvelope,
} from './compositionEnvelopes';
import type { MassingGltfPlacement } from './districtMassing';
import type { VolumeScatterPoint } from './massSilhouetteBuilders';
import { getVisualFacilityMapping } from './VisualTownLayout';

function pointInPolygon(x: number, z: number, poly: readonly (readonly [number, number])[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i, i += 1) {
    const xi = poly[i]![0];
    const zi = poly[i]![1];
    const xj = poly[j]![0];
    const zj = poly[j]![1];
    const intersect =
      zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi + 1e-9) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function envelopePoly(env: CompositionEnvelope): readonly (readonly [number, number])[] {
  return env.insetM ? insetEnvelopePoly(env.poly, env.insetM) : env.poly;
}

function envelopeBounds(poly: readonly (readonly [number, number])[]) {
  const xs = poly.map((p) => p[0]);
  const zs = poly.map((p) => p[1]);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minZ: Math.min(...zs),
    maxZ: Math.max(...zs),
  };
}

function fillEnvelopeCvp(
  env: CompositionEnvelope,
  spacing: number,
  scale: number,
): VolumeScatterPoint[] {
  const poly = envelopePoly(env);
  const { minX, maxX, minZ, maxZ } = envelopeBounds(poly);
  const out: VolumeScatterPoint[] = [];
  for (let x = minX; x <= maxX; x += spacing) {
    for (let z = minZ; z <= maxZ; z += spacing) {
      if (!pointInPolygon(x, z, poly)) continue;
      if (isOverlayExcluded(x, z)) continue;
      out.push({
        x,
        z,
        scale: scale + ((x * 7 + z * 13) % 5) * 0.04,
        rotY: (x + z) * 0.05,
      });
    }
  }
  return out;
}

function fillEnvelopeKenney(
  env: CompositionEnvelope,
  spacing: number,
  url: string,
  scaleBase = 1.05,
): MassingGltfPlacement[] {
  const poly = envelopePoly(env);
  const { minX, maxX, minZ, maxZ } = envelopeBounds(poly);
  const out: MassingGltfPlacement[] = [];
  for (let x = minX; x <= maxX; x += spacing) {
    for (let z = minZ; z <= maxZ; z += spacing) {
      if (!pointInPolygon(x, z, poly)) continue;
      if (isOverlayExcluded(x, z)) continue;
      out.push({
        url,
        x,
        z,
        scale: scaleBase + ((x + z) % 4) * 0.03,
        rotY: (x + z) * 0.08,
        yOffset: 0,
      });
    }
  }
  return out;
}

/** Dense civic plaza warm pad + colonnade ring trees. */
export function buildCivicHeroEnvelopeFills(): {
  plazaCvp: VolumeScatterPoint[];
  colonnadeKcc: MassingGltfPlacement[];
} {
  const plazaCvp = fillEnvelopeCvp(getCompositionEnvelope('civic-plaza'), 2.4, 0.62);
  const colonnadeKcc = fillEnvelopeKenney(
    getCompositionEnvelope('civic-colonnade'),
    3.5,
    KENNEY_ASSETS.treeLarge,
    1.14,
  );
  return { plazaCvp, colonnadeKcc };
}

/** Commercial/work frontage shrub band. */
export function buildCommercialFrontageCvp(): VolumeScatterPoint[] {
  return fillEnvelopeCvp(getCompositionEnvelope('commercial-frontage'), 2.8, 0.48);
}

/** Residential cluster garden beds at visual house centers. */
export function buildResidentialClusterCvp(): VolumeScatterPoint[] {
  const env = getCompositionEnvelope('residential-cluster');
  const poly = envelopePoly(env);
  const houseIds = ['house-1', 'house-2', 'house-3', 'house-4'] as const;
  const out: VolumeScatterPoint[] = [];
  for (const id of houseIds) {
    const { visualCenter } = getVisualFacilityMapping(id);
    const offsets = [
      { dx: -2.4, dz: -2.0 },
      { dx: 2.2, dz: -1.8 },
      { dx: -2.0, dz: 2.2 },
      { dx: 2.4, dz: 2.0 },
      { dx: 0, dz: -2.6 },
      { dx: -2.6, dz: 0.4 },
    ];
    for (const o of offsets) {
      const x = visualCenter.x + o.dx;
      const z = visualCenter.z + o.dz;
      if (!pointInPolygon(x, z, poly)) continue;
      if (isOverlayExcluded(x, z)) continue;
      out.push({ x, z, scale: 0.58, rotY: visualCenter.x * 0.08 });
    }
  }
  return out;
}

/** Solid orchard block inside hero envelope. */
export function buildOrchardBlockEnvelopeKcc(): MassingGltfPlacement[] {
  return fillEnvelopeKenney(getCompositionEnvelope('orchard-block'), 2.2, KENNEY_ASSETS.treeSmall, 1.06);
}

/** Field band warm strip south of orchard. */
export function buildFieldBandEnvelopeCvp(): VolumeScatterPoint[] {
  return fillEnvelopeCvp(getCompositionEnvelope('field-band'), 2.2, 0.38);
}

/** Park U-frame promenade mass. */
export function buildParkUFrameCvp(): VolumeScatterPoint[] {
  return fillEnvelopeCvp(getCompositionEnvelope('park-u-frame'), 2.6, 0.52);
}

/** Embankment skirt edge CVP retaining band. */
export function buildEmbankmentEdgeCvp(): VolumeScatterPoint[] {
  return fillEnvelopeCvp(getCompositionEnvelope('embankment-civic'), 3.2, 0.72);
}

export function listCompositionEnvelopeIds(): string[] {
  return COMPOSITION_ENVELOPES.map((e) => e.id);
}

export { pointInPolygon, envelopePoly };
