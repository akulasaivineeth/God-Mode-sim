/**
 * WF02 R4.1 overview-scale presentation composition orchestrator.
 * Integrates R3 modules + district massing without a second layout authority.
 */
import { Suspense } from 'react';
import { FutureLotPresentation } from './FutureLotPresentation';
import { CommercialStreetLife } from './CommercialStreetLife';
import { CanopyMassing } from './CanopyMassing';
import { FrontageBands } from './FrontageBands';
import { DistrictGroundTint } from './DistrictGroundTint';
import { ResidentialHedges } from './ResidentialHedges';

export function OverviewCompositionLayer() {
  return (
    <group name="overview-composition-layer">
      <DistrictGroundTint />
      <Suspense fallback={null}>
        <CanopyMassing />
        <ResidentialHedges />
      </Suspense>
      <FrontageBands />
      <FutureLotPresentation />
      <CommercialStreetLife />
    </group>
  );
}
