import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { isBlockChunkPhase0ProofActive } from '@/rendering/blockChunkProof/blockChunkPhase0ProofMode';
import proofManifest from '@/rendering/blockChunkProof/blockChunkPhase0ProofManifest.json';
import { isProofPlacementExcluded } from '@/rendering/environment/heroBlockProof/heroBlockPhase0ProofMask';
import { R13_PROTOTYPE_SHELLS } from '@/rendering/prototypeShell/prototypeShellRegistry';
import { getFacilityPoint } from '@/world/facilityPoints';
import { resolveShellDoorWorldPosition } from '@/rendering/prototypeShell/prototypeShellBounds';

describe('WF02 R15 Path B block chunk Phase 0 proof', () => {
  it('proof mode is inactive without URL param', () => {
    expect(isBlockChunkPhase0ProofActive()).toBe(false);
  });

  it('registers two offline mass chunks for disposable proof', () => {
    expect(proofManifest.chunks).toHaveLength(2);
    expect(proofManifest.integrationMode).toBe('B1-mass-chunk-plus-shells');
    for (const chunk of proofManifest.chunks) {
      expect(chunk.partCount).toBeGreaterThanOrEqual(35);
      expect(chunk.bounds.triangles).toBeGreaterThan(0);
      expect(existsSync(`public${chunk.assetUrl}`)).toBe(true);
    }
  });

  it('chunk provenance resolves to registered Kenney CC0 sources only', () => {
    const provenance = JSON.parse(
      readFileSync('Docs/milestones/WF02/r15_block_chunk_provenance.json', 'utf8'),
    );
    const allowed = new Set([
      '/assets/glb/kenney/suburban/tree-large.glb',
      '/assets/glb/kenney/suburban/tree-small.glb',
      '/assets/glb/kenney/suburban/fence-low.glb',
      '/assets/glb/kenney/suburban/path-stones-short.glb',
      '/assets/glb/kenney/suburban/path-stones-messy.glb',
      '/assets/glb/kenney/suburban/path-long.glb',
      '/assets/glb/kenney/suburban/planter.glb',
    ]);
    for (const chunk of Object.values(provenance.chunks) as Array<{ sourceMeshes: string[] }>) {
      for (const src of chunk.sourceMeshes) {
        expect(allowed.has(src)).toBe(true);
      }
    }
  });

  it('preserves R14 shell door bindings within 0.3 m', () => {
    const commercial = R13_PROTOTYPE_SHELLS.find(
      (s) => s.shellId === 'commercial-frontage-shell',
    )!;
    const cottage = R13_PROTOTYPE_SHELLS.find((s) => s.shellId === 'residential-cottage-shell')!;
    const storeDoor = resolveShellDoorWorldPosition(commercial, 'store-door')!;
    const workDoor = resolveShellDoorWorldPosition(commercial, 'workshop-door')!;
    const homeDoor = resolveShellDoorWorldPosition(cottage, 'home-door')!;
    expect(
      Math.hypot(storeDoor.x - getFacilityPoint('store').entrance.x, storeDoor.z - getFacilityPoint('store').entrance.z),
    ).toBeLessThan(0.31);
    expect(
      Math.hypot(workDoor.x - getFacilityPoint('workshop').entrance.x, workDoor.z - getFacilityPoint('workshop').entrance.z),
    ).toBeLessThan(0.31);
    expect(
      Math.hypot(homeDoor.x - getFacilityPoint('house-1').entrance.x, homeDoor.z - getFacilityPoint('house-1').entrance.z),
    ).toBeLessThan(0.31);
  });

  it('exclusion helper rejects road and river sample points', () => {
    expect(isProofPlacementExcluded(0, 0)).toBe(true);
    expect(isProofPlacementExcluded(33, 4)).toBe(true);
    expect(isProofPlacementExcluded(16, 4, 1.0)).toBe(false);
  });
});
