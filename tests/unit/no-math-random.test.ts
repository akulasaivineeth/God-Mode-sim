import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function listTsFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      files.push(...listTsFiles(fullPath));
    } else if (entry.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

describe('ARCH-003 no Math.random in simulation', () => {
  it('simulation sources do not call Math.random', () => {
    const files = listTsFiles('src/simulation');
    for (const file of files) {
      const content = readFileSync(file, 'utf8');
      expect(content.includes('Math.random')).toBe(false);
    }
  });

  it('ARCH01 Spike T sources do not call Math.random', () => {
    const spikeRoot = 'src/spikes/arch01-t';
    const files = listTsFiles(spikeRoot);
    for (const file of files) {
      const content = readFileSync(file, 'utf8');
      expect(content.includes('Math.random')).toBe(false);
    }
  });
});
