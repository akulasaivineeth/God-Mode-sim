/**
 * WF02 R10 World Lab — district vocabulary orchestrator.
 * R15 Phase 0: disposable proof branch via ?r15Phase0Proof=1 only (not production).
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
import { HeroBlockPhase0ProofLayer } from './heroBlockProof/HeroBlockPhase0ProofLayer';
import { isHeroBlockPhase0ProofActive } from './heroBlockProof/heroBlockPhase0ProofMode';

export function WorldLabCompositionLayer() {
  if (!isWorldLabActive()) return null;

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
