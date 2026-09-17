/**
 * WF02 R15.3.1 Candidate E — supplementary Kenney massing for footprint framing.
 */
import { Suspense, useMemo } from 'react';
import { SUPPLEMENTARY_MASSING } from '@/world/worldLab/presentationFootprintSpec';
import { KENNEY_ASSETS } from '../assets/EnvironmentAssetRegistry';
import {
  InstancedGltfPlacements,
  type GltfInstancePlacement,
} from '../assets/InstancedGltfPlacements';
import { isFootprintPhase0ProofActive } from './footprintPhase0ProofMode';

const URL_BY_KEY = {
  treeLarge: KENNEY_ASSETS.treeLarge,
  treeSmall: KENNEY_ASSETS.treeSmall,
  fenceLow: KENNEY_ASSETS.fenceLow,
  planter: KENNEY_ASSETS.planter,
} as const;

export function FootprintSupplementaryMassing() {
  const placements = useMemo<GltfInstancePlacement[]>(
    () =>
      SUPPLEMENTARY_MASSING.map((p) => ({
        url: URL_BY_KEY[p.urlKey],
        x: p.x,
        z: p.z,
        rotY: p.rotY,
        scale: p.scale,
      })),
    [],
  );

  if (!isFootprintPhase0ProofActive()) return null;

  return (
    <group name="r15-footprint-supplementary-massing">
      <Suspense fallback={null}>
        <InstancedGltfPlacements placements={placements} />
      </Suspense>
    </group>
  );
}
