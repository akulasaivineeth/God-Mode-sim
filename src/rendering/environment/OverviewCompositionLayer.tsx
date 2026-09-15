/**
 * WF02 R4.1 overview-scale presentation composition orchestrator.
 * Integrates R3 modules + district massing without a second layout authority.
 */
import { Suspense } from 'react';
import type { CameraView } from '../cameraPresets';
import { FutureLotPresentation } from './FutureLotPresentation';
import { CommercialStreetLife } from './CommercialStreetLife';
import { CanopyMassing } from './CanopyMassing';
import { FrontageBands } from './FrontageBands';
import { DistrictGroundTint } from './DistrictGroundTint';
import { ResidentialHedges } from './ResidentialHedges';
import { NatureMassLayer } from './NatureMassLayer';

export function OverviewCompositionLayer({ cameraView }: { cameraView: CameraView }) {
  return (
    <group name="overview-composition-layer">
      <DistrictGroundTint />
      <Suspense fallback={null}>
        <CanopyMassing />
        <ResidentialHedges />
        <NatureMassLayer cameraView={cameraView} />
      </Suspense>
      <FrontageBands />
      <FutureLotPresentation />
      <CommercialStreetLife />
    </group>
  );
}
