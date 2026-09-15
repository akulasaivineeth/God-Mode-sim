import { describe, expect, it, afterEach } from 'vitest';
import { clearMaterialPoolForTests, getPooledMaterial, pooledMaterialCount } from '@/rendering/materialPool';

describe('materialPool', () => {
  afterEach(() => {
    clearMaterialPoolForTests();
  });

  it('reuses materials for identical color keys', () => {
    const a = getPooledMaterial('#ff0000', { roughness: 0.85 });
    const b = getPooledMaterial('#ff0000', { roughness: 0.85 });
    expect(a).toBe(b);
    expect(pooledMaterialCount()).toBe(1);
  });

  it('creates distinct materials for different colors', () => {
    const a = getPooledMaterial('#ff0000');
    const b = getPooledMaterial('#00ff00');
    expect(a).not.toBe(b);
    expect(pooledMaterialCount()).toBe(2);
  });
});
