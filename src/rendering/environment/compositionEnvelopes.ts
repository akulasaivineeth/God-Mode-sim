/**
 * WF02 R7.1 hero-core connected envelope specs (presentation-only).
 * Validated in Phase 0 composited prototype @ COMPOSITION_PROTOTYPE_R71.md
 */
import { HERO_CORE_BOUNDS } from './VisualTownLayout';

export interface CompositionEnvelope {
  id: string;
  /** Closed polygon vertices [x, z] in world space. */
  poly: readonly (readonly [number, number])[];
  /** Optional inset shrink for inner bands (e.g. colonnade ring). */
  insetM?: number;
  tier: 'core' | 'district' | 'orchard' | 'park' | 'periphery';
}

export const HERO_CORE_ENVELOPE: CompositionEnvelope = {
  id: 'hero-core',
  poly: [
    [HERO_CORE_BOUNDS.minX, HERO_CORE_BOUNDS.minZ],
    [HERO_CORE_BOUNDS.maxX, HERO_CORE_BOUNDS.minZ],
    [HERO_CORE_BOUNDS.maxX, HERO_CORE_BOUNDS.maxZ],
    [HERO_CORE_BOUNDS.minX, HERO_CORE_BOUNDS.maxZ],
  ],
  tier: 'core',
};

export const COMPOSITION_ENVELOPES: readonly CompositionEnvelope[] = [
  HERO_CORE_ENVELOPE,
  {
    id: 'civic-plaza',
    poly: [
      [-26, -26],
      [-6, -26],
      [-6, -6],
      [-26, -6],
    ],
    tier: 'core',
  },
  {
    id: 'civic-colonnade',
    poly: [
      [-28, -28],
      [-4, -28],
      [-4, -4],
      [-28, -4],
    ],
    insetM: 3,
    tier: 'core',
  },
  {
    id: 'commercial-frontage',
    poly: [
      [-48, 2],
      [-6, 2],
      [-6, 28],
      [-48, 28],
    ],
    tier: 'core',
  },
  {
    id: 'residential-cluster',
    poly: [
      [8, -34],
      [34, -34],
      [34, -6],
      [8, -6],
    ],
    tier: 'district',
  },
  {
    id: 'future-lot-row',
    poly: [
      [44, -64],
      [80, -64],
      [80, -46],
      [44, -46],
    ],
    tier: 'district',
  },
  {
    id: 'orchard-block',
    poly: [
      [52, 58],
      [88, 58],
      [88, 78],
      [52, 78],
    ],
    tier: 'orchard',
  },
  {
    id: 'field-band',
    poly: [
      [50, 52],
      [90, 52],
      [90, 58],
      [50, 58],
    ],
    tier: 'orchard',
  },
  {
    id: 'park-u-frame',
    poly: [
      [18, 32],
      [18, 52],
      [58, 52],
      [58, 32],
      [48, 32],
      [48, 42],
      [28, 42],
      [28, 32],
    ],
    tier: 'park',
  },
  {
    id: 'periphery-north',
    poly: [
      [-100, -102],
      [100, -102],
      [100, -94],
      [-100, -94],
    ],
    tier: 'periphery',
  },
  {
    id: 'embankment-civic',
    poly: [
      [-30, -30],
      [0, -30],
      [0, 0],
      [-30, 0],
    ],
    tier: 'core',
  },
] as const;

export function getCompositionEnvelope(id: string): CompositionEnvelope {
  const env = COMPOSITION_ENVELOPES.find((e) => e.id === id);
  if (!env) throw new Error(`Unknown composition envelope: ${id}`);
  return env;
}

export function insetEnvelopePoly(
  poly: readonly (readonly [number, number])[],
  insetM: number,
): [number, number][] {
  const xs = poly.map((p) => p[0]);
  const zs = poly.map((p) => p[1]);
  const minX = Math.min(...xs) + insetM;
  const maxX = Math.max(...xs) - insetM;
  const minZ = Math.min(...zs) + insetM;
  const maxZ = Math.max(...zs) - insetM;
  return [
    [minX, minZ],
    [maxX, minZ],
    [maxX, maxZ],
    [minX, maxZ],
  ];
}
