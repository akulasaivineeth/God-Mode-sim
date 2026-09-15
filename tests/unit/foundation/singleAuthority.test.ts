import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Source-level inventory proving four single live paths (Foundation Hardening).
 */
describe('Foundation — single authority inventory', () => {
  const root = path.join(process.cwd(), 'src');

  it('has exactly one live citizen renderer (CitizenVisual)', () => {
    expect(existsSync(path.join(root, 'rendering/assets/CitizenVisual.tsx'))).toBe(true);
    expect(existsSync(path.join(root, 'rendering/Citizen.tsx'))).toBe(false);
    expect(existsSync(path.join(root, 'rendering/CitizenMesh.tsx'))).toBe(false);
  });

  it('routes citizen registration through citizenPresentationRegistry', () => {
    const registry = readFileSync(path.join(root, 'rendering/citizenPresentationRegistry.ts'), 'utf8');
    expect(registry).toContain('registerCitizenBody');
    expect(registry).toContain('registerPresentationControls');
    const boundsShim = readFileSync(path.join(root, 'rendering/citizenBoundsRegistry.ts'), 'utf8');
    expect(boundsShim).toContain("from './citizenPresentationRegistry'");
  });

  it('uses one GLTF pipeline module for loaders', () => {
    const pipeline = readFileSync(path.join(root, 'rendering/assets/gltfPipeline.ts'), 'utf8');
    expect(pipeline).toContain('GLTFLoader');
    expect(pipeline).toContain('prepareStaticGltfRoot');
    expect(pipeline).toContain('prepareSkinnedCitizenRoot');
    for (const consumer of ['ModelAsset.tsx', 'CitizenVisual.tsx', 'InstancedVegetation.tsx']) {
      const src = readFileSync(path.join(root, 'rendering/assets', consumer), 'utf8');
      expect(src).toContain('./gltfPipeline');
    }
  });

  it('has one save bundle schema path', () => {
    expect(existsSync(path.join(root, 'persistence/schemas/saveBundle.ts'))).toBe(true);
    expect(existsSync(path.join(root, 'persistence/schemas/saveBundleV2.ts'))).toBe(false);
    expect(existsSync(path.join(root, 'persistence/save.ts'))).toBe(false);
  });

  it('has one authoritative evidence harness outside archive', () => {
    const scripts = readdirSync(path.join(process.cwd(), 'scripts'));
    const liveCapture = scripts.filter((f) => f.startsWith('capture-') && f.endsWith('.mjs'));
    expect(liveCapture).toEqual(['capture-m02-closure-evidence.mjs', 'capture-wf01-evidence.mjs']);
    const archived = readdirSync(path.join(process.cwd(), 'scripts/archive'));
    expect(archived.filter((f) => f.startsWith('capture-r'))).toHaveLength(5);
  });

  it('keeps worker simulation authoritative', () => {
    const worker = readFileSync(path.join(root, 'simulation/worker/simulation.worker.ts'), 'utf8');
    expect(worker).toContain('createCitizenWorld');
    expect(worker).toContain('stepCitizenWorld');
    expect(worker).not.toContain('Math.random');
  });
});
