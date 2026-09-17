/**
 * WF02 R15 Candidate C Phase 0 — disposable replacement hero-block proof layer.
 * Active only via ?r15ReplacementPhase0Proof=1 — NOT production wiring.
 */
import { Suspense } from 'react';
import { terrainHeightAt } from '@/world/townLayout';
import { ModelAsset } from '../assets/ModelAsset';
import manifest from './replacementPhase0ProofManifest.json';
import { isReplacementPhase0ProofActive } from './replacementPhase0ProofMode';
import { DoorSocketMarkers } from './DoorSocketMarkers';

interface AssemblySpec {
  assemblyId: string;
  assetUrl: string;
  anchor: { x: number; y: number; z: number };
}

const PROOF_ASSEMBLIES = manifest.assemblies as AssemblySpec[];

function AssemblyPlacement({ spec }: { spec: AssemblySpec }) {
  const y = terrainHeightAt(spec.anchor.x, spec.anchor.z);
  return (
    <group position={[spec.anchor.x, y, spec.anchor.z]}>
      <ModelAsset url={spec.assetUrl} scale={1} castShadow receiveShadow />
    </group>
  );
}

export function ReplacementPhase0ProofLayer() {
  if (!isReplacementPhase0ProofActive()) return null;

  return (
    <group name="r15-candidate-c-replacement-assemblies">
      <Suspense fallback={null}>
        {PROOF_ASSEMBLIES.map((spec) => (
          <AssemblyPlacement key={spec.assemblyId} spec={spec} />
        ))}
        <DoorSocketMarkers />
      </Suspense>
    </group>
  );
}
