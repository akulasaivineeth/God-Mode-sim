/**
 * WF02 evidence integrity — manifest sha256 must match committed Docs PNG bytes.
 *
 * Usage: node scripts/wf02-evidence-integrity-audit.mjs [manifest-path]
 */
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

const DOCS_DIR = 'Docs/milestones/WF02';
const DEFAULT_MANIFESTS = [
  'r13_prototype_manifest.json',
  'r14_rollout_manifest.json',
];

function hashFile(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

function auditManifest(manifestPath) {
  if (!existsSync(manifestPath)) {
    return { manifestPath, skipped: true, ok: 0, fail: 0, errors: [] };
  }
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const entries = [
    ...(manifest.shots ?? []).map((s) => ({ name: s.name, expected: s.sha256 })),
    ...(manifest.silhouettes ?? []).map((s) => ({ name: s.name, expected: s.sha256 })),
  ];
  const errors = [];
  let ok = 0;
  for (const entry of entries) {
    const pngPath = path.join(DOCS_DIR, `${entry.name}.png`);
    if (!existsSync(pngPath)) {
      errors.push(`${entry.name}: missing ${pngPath}`);
      continue;
    }
    const actual = hashFile(pngPath);
    if (actual !== entry.expected) {
      errors.push(`${entry.name}: expected ${entry.expected.slice(0, 12)}… actual ${actual.slice(0, 12)}…`);
      continue;
    }
    if (entry.file && entry.file.startsWith('/opt/cursor/')) {
      errors.push(`${entry.name}: file path must be repo-relative, not ${entry.file}`);
      continue;
    }
    ok += 1;
  }
  return { manifestPath, skipped: false, ok, fail: errors.length, errors };
}

const targets =
  process.argv.length > 2
    ? process.argv.slice(2)
    : DEFAULT_MANIFESTS.map((f) => path.join(DOCS_DIR, f));

let totalFail = 0;
for (const manifestPath of targets) {
  const result = auditManifest(manifestPath);
  if (result.skipped) {
    console.log(`SKIP ${manifestPath} (not found)`);
    continue;
  }
  console.log(`${manifestPath}: ok=${result.ok} fail=${result.fail}`);
  for (const err of result.errors) console.error(`  ${err}`);
  totalFail += result.fail;
}

if (totalFail > 0) {
  console.error(`\nEvidence integrity FAIL (${totalFail} mismatches)`);
  process.exit(1);
}
console.log('\nEvidence integrity PASS');
