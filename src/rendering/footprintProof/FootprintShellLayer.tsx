/**
 * WF02 R15.3.1 Candidate E — footprint-adjusted prototype shells (disposable proof only).
 */
import { Suspense } from 'react';
import { terrainHeightAt } from '@/world/townLayout';
import { ModelAsset } from '../assets/ModelAsset';
import { resolveFootprintShells } from '@/world/worldLab/presentationFootprintSpec';
import type { PrototypeShellSpec } from '../prototypeShell/prototypeShellTypes';
import { isFootprintPhase0ProofActive } from './footprintPhase0ProofMode';

function ShellPlacement({ spec }: { spec: PrototypeShellSpec }) {
  const y = terrainHeightAt(spec.origin.x, spec.origin.z);
  return (
    <group position={[spec.origin.x, y, spec.origin.z]} rotation={[0, spec.rotY, 0]}>
      <ModelAsset url={spec.assetUrl} targetWidth={spec.targetWidth} castShadow receiveShadow />
    </group>
  );
}

export function FootprintShellLayer() {
  if (!isFootprintPhase0ProofActive()) return null;
  const shells = resolveFootprintShells();

  return (
    <group name="r15-footprint-adjusted-shells">
      <Suspense fallback={null}>
        {shells.map((spec) => (
          <ShellPlacement key={spec.shellId} spec={spec} />
        ))}
      </Suspense>
    </group>
  );
}
