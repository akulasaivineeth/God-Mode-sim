/**
 * WF02 R10 World Lab — district vocabulary orchestrator.
 * R15 Phase 0: disposable proof branches via URL params only (not production).
 */
import { Suspense } from 'react';
import { isWorldLabActive } from '@/world/resolver/worldResolver';
import { CivicEnclosure } from './worldLab/CivicEnclosure';
import { CommercialFrontage } from './worldLab/CommercialFrontage';
import { FutureLotFrame } from './worldLab/FutureLotFrame';
import { ResidentialGardens } from './worldLab/ResidentialGardens';
import { VegetationFrame } from './worldLab/VegetationFrame';
import { WorldLabGroundTint } from './worldLab/WorldLabGroundTint';
import { ModularAssemblyLayer } from '@/rendering/modular/ModularAssemblyLayer';
import { PrototypeShellLayer } from '@/rendering/prototypeShell/PrototypeShellLayer';
import { BlockChunkPhase0ProofLayer } from '@/rendering/blockChunkProof/BlockChunkPhase0ProofLayer';
import { isBlockChunkPhase0ProofActive } from '@/rendering/blockChunkProof/blockChunkPhase0ProofMode';
import { ReplacementPhase0ProofLayer } from '@/rendering/replacementProof/ReplacementPhase0ProofLayer';
import { isReplacementPhase0ProofActive } from '@/rendering/replacementProof/replacementPhase0ProofMode';
import { HeroBlockPhase0ProofLayer } from './heroBlockProof/HeroBlockPhase0ProofLayer';
import { isHeroBlockPhase0ProofActive } from './heroBlockProof/heroBlockPhase0ProofMode';
import { FootprintPhase0ProofLayer } from '@/rendering/footprintProof/FootprintPhase0ProofLayer';
import { isFootprintPhase0ProofActive } from '@/rendering/footprintProof/footprintPhase0ProofMode';

export function WorldLabCompositionLayer() {
  if (!isWorldLabActive()) return null;

  if (isFootprintPhase0ProofActive()) {
    return (
      <group name="world-lab-r15-candidate-e-footprint-proof-root">
        <Suspense fallback={null}>
          <FootprintPhase0ProofLayer />
        </Suspense>
      </group>
    );
  }

  if (isReplacementPhase0ProofActive()) {
    return (
      <group name="world-lab-r15-candidate-c-replacement-proof">
        <Suspense fallback={null}>
          <ReplacementPhase0ProofLayer />
        </Suspense>
      </group>
    );
  }

  if (isBlockChunkPhase0ProofActive()) {
    return (
      <group name="world-lab-r15-pathb-phase0-proof">
        <Suspense fallback={null}>
          <BlockChunkPhase0ProofLayer />
          <PrototypeShellLayer />
        </Suspense>
      </group>
    );
  }

  if (isHeroBlockPhase0ProofActive()) {
    return (
      <group name="world-lab-r15-phase0-proof">
        <Suspense fallback={null}>
          <PrototypeShellLayer />
          <HeroBlockPhase0ProofLayer />
        </Suspense>
      </group>
    );
  }

  return (
    <group name="world-lab-composition-r10">
      <WorldLabGroundTint />
      <Suspense fallback={null}>
        <PrototypeShellLayer />
        <ModularAssemblyLayer />
        <CivicEnclosure />
        <CommercialFrontage />
        <ResidentialGardens />
        <FutureLotFrame />
        <VegetationFrame />
      </Suspense>
    </group>
  );
}
