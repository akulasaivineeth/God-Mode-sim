/**
 * Repair WF02 evidence manifest sha256 from committed Docs PNG bytes.
 *
 * Usage: node scripts/wf02-repair-evidence-manifest.mjs Docs/milestones/WF02/r13_prototype_manifest.json
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { execSync } from 'node:child_process';

const manifestPath = process.argv[2];
if (!manifestPath) {
  console.error('Usage: node scripts/wf02-repair-evidence-manifest.mjs <manifest-path>');
  process.exit(1);
}

const DOCS_DIR = 'Docs/milestones/WF02';

function hashFile(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
manifest.sha = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();

for (const collection of ['shots', 'silhouettes']) {
  if (!manifest[collection]) continue;
  for (const entry of manifest[collection]) {
    const docsRel = `Docs/milestones/WF02/${entry.name}.png`;
    const docsAbs = path.join(DOCS_DIR, `${entry.name}.png`);
    if (!existsSync(docsAbs)) {
      console.warn(`Missing ${docsAbs} — skipping ${entry.name}`);
      continue;
    }
    entry.file = docsRel;
    entry.sha256 = hashFile(docsAbs);
  }
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`Repaired ${manifestPath} @ ${manifest.sha}`);
