/**
 * WF02 R7.1 overview-scale presentation composition orchestrator.
 * R9 World Lab uses WorldLabCompositionLayer instead of legacy envelope fills.
 */
import { Suspense } from 'react';
import type { CameraView } from '../cameraPresets';
import { isWorldLabActive } from '@/world/resolver/worldResolver';
import { FutureLotPresentation } from './FutureLotPresentation';
import { CommercialStreetLife } from './CommercialStreetLife';
import { CanopyMassing } from './CanopyMassing';
import { CanopyVolumeLayer } from './CanopyVolumeLayer';
import { ResidentialHedges } from './ResidentialHedges';
import { PresentationTerrainLayer } from './PresentationTerrainLayer';
import { WorldLabCompositionLayer } from './WorldLabCompositionLayer';

export function OverviewCompositionLayer({ cameraView }: { cameraView: CameraView }) {
  if (isWorldLabActive()) {
    return <WorldLabCompositionLayer />;
  }

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
