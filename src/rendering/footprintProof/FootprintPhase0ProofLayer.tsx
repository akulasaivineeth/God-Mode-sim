/**
 * WF02 R15.3.1 Candidate E Phase 0 — disposable presentation footprint proof layer.
 * Active only via ?r15FootprintPhase0Proof=1 — NOT production wiring.
 */
import { Suspense } from 'react';
import { CivicEnclosure } from '../environment/worldLab/CivicEnclosure';
import { FutureLotFrame } from '../environment/worldLab/FutureLotFrame';
import { ResidentialGardens } from '../environment/worldLab/ResidentialGardens';
import { VegetationFrame } from '../environment/worldLab/VegetationFrame';
import { WorldLabGroundTint } from '../environment/worldLab/WorldLabGroundTint';
import { FootprintClusterRoot } from './FootprintClusterRoot';
import { FootprintDoorMarkers } from './FootprintDoorMarkers';
import { FootprintShellLayer } from './FootprintShellLayer';
import { FootprintSupplementaryMassing } from './FootprintSupplementaryMassing';
import { isFootprintPhase0ProofActive } from './footprintPhase0ProofMode';

export function FootprintPhase0ProofLayer() {
  if (!isFootprintPhase0ProofActive()) return null;

  return (
    <group name="world-lab-r15-candidate-e-footprint-proof">
      <FootprintClusterRoot clusterId="ground-tint">
        <WorldLabGroundTint />
      </FootprintClusterRoot>
      <Suspense fallback={null}>
        <FootprintShellLayer />
        <FootprintClusterRoot clusterId="civic">
          <CivicEnclosure />
        </FootprintClusterRoot>
        <FootprintClusterRoot clusterId="residential">
          <ResidentialGardens />
        </FootprintClusterRoot>
        <FootprintClusterRoot clusterId="future-lot">
          <FutureLotFrame />
        </FootprintClusterRoot>
        <FootprintClusterRoot clusterId="vegetation-frame">
          <VegetationFrame />
        </FootprintClusterRoot>
        <FootprintSupplementaryMassing />
        <FootprintDoorMarkers />
      </Suspense>
    </group>
  );
}
