/**
 * WF02 R15.4 Strategy A Phase 0 — disposable offline-authored hero-neighborhood proof.
 * Active only via ?r15ScenePhase0Proof=1 — NOT production wiring.
 * Replaces parallel hero-neighborhood presentation (shells + scatter modules).
 */
import { Suspense } from 'react';
import { terrainHeightAt } from '@/world/townLayout';
import { ModelAsset } from '../assets/ModelAsset';
import manifest from './heroNeighborhoodSceneManifest.json';
import { isHeroScenePhase0ProofActive } from './heroNeighborhoodSceneProofMode';
import { HeroSceneDoorMarkers } from './HeroSceneDoorMarkers';

export function HeroNeighborhoodSceneProofLayer() {
  if (!isHeroScenePhase0ProofActive()) return null;

  const y = terrainHeightAt(manifest.anchor.x, manifest.anchor.z);

  return (
    <group name="r15-strategy-a-hero-neighborhood-scene">
      <Suspense fallback={null}>
        <group position={[manifest.anchor.x, y, manifest.anchor.z]}>
          <ModelAsset url={manifest.assetUrl} scale={1} castShadow receiveShadow />
        </group>
        <HeroSceneDoorMarkers />
      </Suspense>
    </group>
  );
}
