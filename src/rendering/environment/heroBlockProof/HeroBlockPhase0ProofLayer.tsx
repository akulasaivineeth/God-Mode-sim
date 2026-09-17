/**
 * WF02 R15 Phase 0 — disposable hero-block composition proof layer.
 * Active only via ?r15Phase0Proof=1 — NOT production HeroBlockCompositionLayer.
 */
import { Suspense, useMemo } from 'react';
import { KENNEY_ASSETS } from '../../assets/EnvironmentAssetRegistry';
import {
  InstancedGltfPlacements,
  type GltfInstancePlacement,
} from '../../assets/InstancedGltfPlacements';
import { isHeroBlockPhase0ProofActive } from './heroBlockPhase0ProofMode';
import { buildProofGltfPlacements, buildProofGroundEnvelopes } from './heroBlockPhase0ProofSpec';
import { HeroBlockPhase0ProofGround } from './HeroBlockPhase0ProofGround';

const URL_BY_KEY: Record<string, string> = {
  planter: KENNEY_ASSETS.planter,
  pathStonesShort: KENNEY_ASSETS.pathStonesShort,
  pathStonesMessy: KENNEY_ASSETS.pathStonesMessy,
  pathShort: KENNEY_ASSETS.pathShort,
  pathLong: KENNEY_ASSETS.pathLong,
  fenceLow: KENNEY_ASSETS.fenceLow,
  treeLarge: KENNEY_ASSETS.treeLarge,
  treeSmall: KENNEY_ASSETS.treeSmall,
};

export function HeroBlockPhase0ProofLayer() {
  const active = isHeroBlockPhase0ProofActive();

  const gltfPlacements = useMemo<GltfInstancePlacement[]>(
    () =>
      buildProofGltfPlacements().map((p) => ({
        url: URL_BY_KEY[p.urlKey],
        x: p.x,
        z: p.z,
        rotY: p.rotY,
        scale: p.scale,
      })),
    [],
  );

  if (!active) return null;

  return (
    <group name="r15-hero-block-phase0-proof">
      <HeroBlockPhase0ProofGround />
      <Suspense fallback={null}>
        <InstancedGltfPlacements placements={gltfPlacements} />
      </Suspense>
    </group>
  );
}

export function getProofCompositionStats() {
  return {
    groundEnvelopes: buildProofGroundEnvelopes().length,
    gltfPlacements: buildProofGltfPlacements().length,
  };
}
