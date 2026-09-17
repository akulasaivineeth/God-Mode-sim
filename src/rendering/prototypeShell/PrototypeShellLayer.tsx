/**
 * WF02 R13 — single-mesh finished architecture shells (offline kitbash).
 */
import { Suspense } from 'react';
import { terrainHeightAt } from '@/world/townLayout';
import { ModelAsset } from '../assets/ModelAsset';
import { isPrototypeShellActive } from './prototypeShellMode';
import { R13_PROTOTYPE_SHELLS } from './prototypeShellRegistry';

function ShellPlacement({ spec }: { spec: (typeof R13_PROTOTYPE_SHELLS)[number] }) {
  const y = terrainHeightAt(spec.origin.x, spec.origin.z);
  return (
    <group position={[spec.origin.x, y, spec.origin.z]} rotation={[0, spec.rotY, 0]}>
      <ModelAsset url={spec.assetUrl} targetWidth={spec.targetWidth} />
    </group>
  );
}

export function PrototypeShellLayer() {
  if (!isPrototypeShellActive()) return null;

  return (
    <group name="world-lab-prototype-shells-r13">
      <Suspense fallback={null}>
        {R13_PROTOTYPE_SHELLS.map((spec) => (
          <ShellPlacement key={spec.shellId} spec={spec} />
        ))}
      </Suspense>
    </group>
  );
}
