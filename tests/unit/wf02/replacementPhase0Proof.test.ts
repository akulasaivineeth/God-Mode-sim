import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { isReplacementPhase0ProofActive } from '@/rendering/replacementProof/replacementPhase0ProofMode';
import proofManifest from '@/rendering/replacementProof/replacementPhase0ProofManifest.json';
import { R13_PROTOTYPE_SHELLS } from '@/rendering/prototypeShell/prototypeShellRegistry';
import { getFacilityPoint } from '@/world/facilityPoints';
import { resolveShellDoorWorldPosition } from '@/rendering/prototypeShell/prototypeShellBounds';

describe('WF02 R15 Candidate C replacement Phase 0 proof', () => {
  it('proof mode is inactive without URL param', () => {
    expect(isReplacementPhase0ProofActive()).toBe(false);
  });

  it('registers flattened replacement assemblies for disposable proof', () => {
    expect(proofManifest.integrationMode).toBe('C-replacement-hero-assembly');
    expect(proofManifest.assemblies.length).toBeGreaterThanOrEqual(2);
    for (const asm of proofManifest.assemblies) {
      expect(asm.bounds.triangles).toBeGreaterThan(0);
      expect(asm.meshCount).toBeGreaterThan(0);
      expect(asm.meshCount).toBeLessThanOrEqual(4);
      expect(existsSync(`public${asm.assetUrl}`)).toBe(true);
    }
    const totalMeshes = proofManifest.assemblies.reduce((s, a) => s + a.meshCount, 0);
    expect(totalMeshes + 3).toBeLessThanOrEqual(proofManifest.heroBlockDrawBudget.hardStop);
  });

  it('suppresses competing presentation layers in proof manifest', () => {
    expect(proofManifest.suppressLayers).toContain('PrototypeShellLayer');
    expect(proofManifest.suppressLayers).toContain('WorldLabGroundTint');
    expect(proofManifest.suppressLayers).toContain('VegetationFrame');
  });

  it('assembly provenance resolves to registered Kenney CC0 sources only', () => {
    const provenance = JSON.parse(
      readFileSync('Docs/milestones/WF02/r15_replacement_assembly_provenance.json', 'utf8'),
    );
    for (const asm of Object.values(provenance.assemblies) as Array<{ sourceMeshes: string[] }>) {
      for (const src of asm.sourceMeshes) {
        expect(src.startsWith('/assets/glb/kenney/')).toBe(true);
      }
    }
  });

  it('preserves R14 shell door bindings within 0.3 m for socket markers', () => {
    const commercial = R13_PROTOTYPE_SHELLS.find(
      (s) => s.shellId === 'commercial-frontage-shell',
    )!;
    const cottage = R13_PROTOTYPE_SHELLS.find((s) => s.shellId === 'residential-cottage-shell')!;
    const storeDoor = resolveShellDoorWorldPosition(commercial, 'store-door')!;
    const workDoor = resolveShellDoorWorldPosition(commercial, 'workshop-door')!;
    const homeDoor = resolveShellDoorWorldPosition(cottage, 'home-door')!;
    expect(
      Math.hypot(
        storeDoor.x - getFacilityPoint('store').entrance.x,
        storeDoor.z - getFacilityPoint('store').entrance.z,
      ),
    ).toBeLessThan(0.31);
    expect(
      Math.hypot(
        workDoor.x - getFacilityPoint('workshop').entrance.x,
        workDoor.z - getFacilityPoint('workshop').entrance.z,
      ),
    ).toBeLessThan(0.31);
    expect(
      Math.hypot(
        homeDoor.x - getFacilityPoint('house-1').entrance.x,
        homeDoor.z - getFacilityPoint('house-1').entrance.z,
      ),
    ).toBeLessThan(0.31);
  });
});
