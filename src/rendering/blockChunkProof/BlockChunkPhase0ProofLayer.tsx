/**
 * WF02 R15 Path B Phase 0 — disposable block chunk proof layer.
 * Active only via ?r15PathBPhase0Proof=1 — NOT production HeroBlockChunkLayer.
 */
import { Suspense } from 'react';
import { terrainHeightAt } from '@/world/townLayout';
import { ModelAsset } from '../assets/ModelAsset';
import manifest from './blockChunkPhase0ProofManifest.json';
import { isBlockChunkPhase0ProofActive } from './blockChunkPhase0ProofMode';

interface ProofChunkSpec {
  chunkId: string;
  assetUrl: string;
  anchor: { x: number; y: number; z: number };
}

const PROOF_CHUNKS = manifest.chunks as ProofChunkSpec[];

function ChunkPlacement({ spec }: { spec: ProofChunkSpec }) {
  const y = terrainHeightAt(spec.anchor.x, spec.anchor.z);
  return (
    <group position={[spec.anchor.x, y, spec.anchor.z]}>
      <ModelAsset url={spec.assetUrl} scale={1} castShadow receiveShadow />
    </group>
  );
}

export function BlockChunkPhase0ProofLayer() {
  if (!isBlockChunkPhase0ProofActive()) return null;

  return (
    <group name="r15-pathb-phase0-block-chunks">
      <Suspense fallback={null}>
        {PROOF_CHUNKS.map((spec) => (
          <ChunkPlacement key={spec.chunkId} spec={spec} />
        ))}
      </Suspense>
    </group>
  );
}
