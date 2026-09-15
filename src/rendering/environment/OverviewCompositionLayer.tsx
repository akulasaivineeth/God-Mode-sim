/**
 * WF02 R4.1 overview-scale presentation composition orchestrator.
 * R6: MSS — Kenney Canopy Clusters + Canopy Volume Primitives.
 */
import { Suspense } from 'react';
import type { CameraView } from '../cameraPresets';
import { FutureLotPresentation } from './FutureLotPresentation';
import { CommercialStreetLife } from './CommercialStreetLife';
import { CanopyMassing } from './CanopyMassing';
import { CanopyVolumeLayer } from './CanopyVolumeLayer';
import { ResidentialHedges } from './ResidentialHedges';

export function OverviewCompositionLayer({ cameraView }: { cameraView: CameraView }) {
  return (
    <group name="overview-composition-layer">
      <Suspense fallback={null}>
        <CanopyMassing cameraView={cameraView} />
        <CanopyVolumeLayer cameraView={cameraView} />
        <ResidentialHedges />
      </Suspense>
      <FutureLotPresentation />
      <CommercialStreetLife />
    </group>
  );
}
