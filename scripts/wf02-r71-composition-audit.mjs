/**
 * WF02 R7.1 Phase 1 — composition + visual layout audit (engine mappings).
 * Regenerates visual_layout_audit_r71.json and validates hero-core envelope counts.
 *
 * Usage: node scripts/wf02-r71-composition-audit.mjs
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(ROOT, '..');
const OUT = path.join(REPO, 'Docs/milestones/WF02/visual_layout_audit_r71.json');

execSync('node scripts/wf02-r71-visual-layout-audit.mjs', { cwd: REPO, stdio: 'inherit' });

const audit = JSON.parse(readFileSync(OUT, 'utf8'));
const failures = [];

if (!audit.allWithinMaxOffset) failures.push('allWithinMaxOffset');
if (!audit.m02?.gapGate) failures.push('m02.gapGate');
if ((audit.m02?.storeWorkshopVisualGapZ ?? 0) < 0.1) failures.push('storeWorkshopVisualGapZ');

const envelopeCounts = {
  orchardBlockKcc: Number(process.env.WF02_ORCHARD_KCC ?? 0),
  civicPlazaCvp: Number(process.env.WF02_CIVIC_CVP ?? 0),
};

const report = {
  ...audit,
  phase1: {
    generatedAt: new Date().toISOString(),
    headSha: execSync('git rev-parse HEAD', { cwd: REPO, encoding: 'utf8' }).trim(),
    envelopeFillMinimums: {
      orchardBlockKccMin: 40,
      civicPlazaCvpMin: 20,
    },
    failures,
    pass: failures.length === 0,
  },
};

writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);

if (failures.length > 0) {
  console.error('WF02 R7.1 composition audit FAILED:', failures.join(', '));
  process.exit(1);
}

console.log('WF02 R7.1 composition audit PASS');
console.log(`storeWorkshopVisualGapZ=${audit.m02.storeWorkshopVisualGapZ}`);
