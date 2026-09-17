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
import { HeroBlockPhase0ProofLayer } from './heroBlockProof/HeroBlockPhase0ProofLayer';
import { isHeroBlockPhase0ProofActive } from './heroBlockProof/heroBlockPhase0ProofMode';

export function WorldLabCompositionLayer() {
  if (!isWorldLabActive()) return null;

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
