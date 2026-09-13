import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  KENNEY_ASSETS,
  QUATERNIUS_ASSETS,
} from '@/rendering/assets/EnvironmentAssetRegistry';

const PUBLIC = resolve(__dirname, '../../../public');

function publicPath(url: string): string {
  return join(PUBLIC, url.replace(/^\//, ''));
}

/**
 * Asset integrity gate (M02 R7): every referenced 3D asset — and every external
 * URI a .gltf depends on (buffers + images) — must exist on disk, so the running
 * build has zero 404s / white fallback geometry.
 */
describe('M02 asset integrity', () => {
  it('all Kenney GLB assets exist', () => {
    for (const url of Object.values(KENNEY_ASSETS)) {
      expect(existsSync(publicPath(url)), `missing ${url}`).toBe(true);
    }
  });

  it('all Quaternius GLTF assets exist', () => {
    for (const url of Object.values(QUATERNIUS_ASSETS)) {
      expect(existsSync(publicPath(url)), `missing ${url}`).toBe(true);
    }
  });

  it('every GLTF external buffer/image URI resolves on disk', () => {
    for (const url of Object.values(QUATERNIUS_ASSETS)) {
      const gltfPath = publicPath(url);
      const gltf = JSON.parse(readFileSync(gltfPath, 'utf8')) as {
        buffers?: { uri?: string }[];
        images?: { uri?: string }[];
      };
      const dir = dirname(gltfPath);
      const uris = [
        ...(gltf.buffers ?? []).map((b) => b.uri),
        ...(gltf.images ?? []).map((i) => i.uri),
      ].filter((u): u is string => Boolean(u) && !u!.startsWith('data:'));
      for (const uri of uris) {
        expect(existsSync(join(dir, decodeURIComponent(uri))), `missing ${uri} for ${url}`).toBe(true);
      }
    }
  });

  it('each Kenney pack has its own textures colormap', () => {
    const packs = ['characters', 'commercial', 'industrial', 'roads', 'suburban'];
    for (const pack of packs) {
      expect(
        existsSync(join(PUBLIC, `assets/glb/kenney/${pack}/Textures/colormap.png`)),
        `missing colormap for ${pack}`,
      ).toBe(true);
    }
  });

  it('the asset register documents third-party assets', () => {
    expect(existsSync(resolve(__dirname, '../../../Docs/assets/ASSET_REGISTER.md'))).toBe(true);
  });
});
