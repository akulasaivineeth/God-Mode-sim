/**
 * WF02 R7.1 overview-scale presentation composition orchestrator.
 * Hero-core envelope fills + modest presentation vertical layering.
 */
import { Suspense } from 'react';
import type { CameraView } from '../cameraPresets';
import { FutureLotPresentation } from './FutureLotPresentation';
import { CommercialStreetLife } from './CommercialStreetLife';
import { CanopyMassing } from './CanopyMassing';
import { CanopyVolumeLayer } from './CanopyVolumeLayer';
import { ResidentialHedges } from './ResidentialHedges';
import { PresentationTerrainLayer } from './PresentationTerrainLayer';

export function OverviewCompositionLayer({ cameraView }: { cameraView: CameraView }) {
  return (
    <group name="overview-composition-layer">
      <PresentationTerrainLayer cameraView={cameraView} />
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
