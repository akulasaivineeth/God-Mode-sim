/**
 * WF02 R10 World Lab — district vocabulary orchestrator.
 */
import { Suspense } from 'react';
import { isWorldLabActive } from '@/world/resolver/worldResolver';
import { CivicEnclosure } from './worldLab/CivicEnclosure';
import { CommercialFrontage } from './worldLab/CommercialFrontage';
import { FutureLotFrame } from './worldLab/FutureLotFrame';
import { ResidentialGardens } from './worldLab/ResidentialGardens';
import { VegetationFrame } from './worldLab/VegetationFrame';
import { WorldLabGroundTint } from './worldLab/WorldLabGroundTint';

export function WorldLabCompositionLayer() {
  if (!isWorldLabActive()) return null;

  return (
    <group name="world-lab-composition-r10">
      <WorldLabGroundTint />
      <Suspense fallback={null}>
        <CivicEnclosure />
        <CommercialFrontage />
        <ResidentialGardens />
        <FutureLotFrame />
        <VegetationFrame />
      </Suspense>
    </group>
  );
}
