import { execSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const SPIKE_ROOT = 'src/spikes/arch01-t';
const TOWNBOX_SEEDED_RANDOM_REFERENCE = join(SPIKE_ROOT, 'vendor/townbox/seededRandom.ts');
const PROTECTED_PREFIXES = [
  'src/simulation/',
  'src/rendering/',
  'src/world/',
  'src/persistence/',
];

const FORBIDDEN_IMPORT_PATTERNS = [
  /@\/simulation\/(?!core\/prng)/,
  /@\/rendering\//,
  /@\/world\//,
  /@\/persistence\//,
  /@faker-js\/faker/,
  /\buuid\b/,
  /\bphaser\b/i,
  /from ['"]react/,
  /from ['"]three/,
];

const FORBIDDEN_RUNTIME_PATTERNS = [
  'Math.random',
  'Date.now',
  'performance.now',
];

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

describe('ARCH01 Spike T production wall (P3/P4/P7/P8)', () => {
  it('spike tree has no forbidden imports', () => {
    const files = listTsFiles(SPIKE_ROOT);
    for (const file of files) {
      const content = readFileSync(file, 'utf8');
      for (const pattern of FORBIDDEN_IMPORT_PATTERNS) {
        expect(content).not.toMatch(pattern);
      }
    }
  });

  it('executable spike paths do not import or construct TownBox SeededRandom', () => {
    const files = listTsFiles(SPIKE_ROOT).filter((file) => file !== TOWNBOX_SEEDED_RANDOM_REFERENCE);
    for (const file of files) {
      const content = readFileSync(file, 'utf8');
      expect(content).not.toMatch(/from ['"].*seededRandom/);
      expect(content).not.toMatch(/\bnew\s+SeededRandom\s*\(/);
    }
  });

  it('spike RNG adapter is backed by GOD MODE Mulberry32Prng', () => {
    const content = readFileSync(join(SPIKE_ROOT, 'adapters/rngAdapter.ts'), 'utf8');
    expect(content).toContain("from '@/simulation/core/prng'");
    expect(content).toContain('Mulberry32Prng');
  });

  it('spike tree has no unseeded randomness or wall clock', () => {
    const files = listTsFiles(SPIKE_ROOT);
    for (const file of files) {
      const content = readFileSync(file, 'utf8');
      for (const pattern of FORBIDDEN_RUNTIME_PATTERNS) {
        expect(content.includes(pattern)).toBe(false);
      }
    }
  });

  it('protected production paths have zero diff from origin/main', () => {
    const diff = execSync('git diff --name-only origin/main...HEAD', { encoding: 'utf8' }).trim();
    const changed = diff ? diff.split('\n') : [];
    for (const file of changed) {
      for (const prefix of PROTECTED_PREFIXES) {
        expect(file.startsWith(prefix)).toBe(false);
      }
      expect(file).not.toBe('package.json');
    }
  });

  it('spike does not import production world facility registry module', () => {
    const files = listTsFiles(SPIKE_ROOT);
    for (const file of files) {
      const content = readFileSync(file, 'utf8');
      expect(content).not.toMatch(/from ['"]@\/world\//);
      expect(content).not.toMatch(/from ['"].*facilityPoints/);
    }
  });
});
