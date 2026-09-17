/**
 * WF02 R15 Path B Phase 0 — chunk provenance + exclusion audit.
 */
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const provenance = JSON.parse(
  readFileSync('Docs/milestones/WF02/r15_block_chunk_provenance.json', 'utf8'),
);
const proofManifest = JSON.parse(
  readFileSync('src/rendering/blockChunkProof/blockChunkPhase0ProofManifest.json', 'utf8'),
);
const register = readFileSync('Docs/assets/ASSET_REGISTER.md', 'utf8');
const layoutManifest = JSON.parse(
  readFileSync('src/rendering/assets/modelLayoutManifest.json', 'utf8'),
);

const errors = [];
const ALLOWED = [
  '/assets/glb/kenney/suburban/tree-large.glb',
  '/assets/glb/kenney/suburban/tree-small.glb',
  '/assets/glb/kenney/suburban/fence-low.glb',
  '/assets/glb/kenney/suburban/path-stones-short.glb',
  '/assets/glb/kenney/suburban/path-stones-messy.glb',
  '/assets/glb/kenney/suburban/path-long.glb',
  '/assets/glb/kenney/suburban/planter.glb',
];

function isRegisteredKenneySource(src) {
  if (!ALLOWED.includes(src)) return false;
  const publicPath = `public${src}`;
  if (!existsSync(publicPath)) return false;
  if (layoutManifest[src]) return true;
  const registerKey = src.replace('/assets/glb/kenney/', '');
  if (register.includes(`\`${registerKey}\``)) return true;
  if (src.startsWith('/assets/glb/kenney/suburban/') && register.includes('Suburban props')) {
    return true;
  }
  return false;
}

for (const chunk of Object.values(provenance.chunks)) {
  for (const src of chunk.sourceMeshes) {
    if (!isRegisteredKenneySource(src)) {
      errors.push(`Source not registered (manifest/register/on-disk): ${src}`);
    }
  }
  if (chunk.partCount < 35) errors.push(`Chunk part count too low: ${chunk.partCount}`);
  if (chunk.measuredBounds.triangles > 14000) {
    errors.push(`Chunk exceeds plan tri budget: ${chunk.measuredBounds.triangles}`);
  }
}

for (const chunk of proofManifest.chunks) {
  const glbPath = `public${chunk.assetUrl}`;
  if (!existsSync(glbPath)) errors.push(`Missing chunk GLB: ${glbPath}`);
}

try {
  execSync('node scripts/wf02-r14-shell-rollout-audit.mjs', { stdio: 'pipe' });
} catch {
  errors.push('R14 shell door/origin audit failed — shell bindings must remain <=0.3m');
}

if (errors.length > 0) {
  console.error('Path B chunk audit FAIL:');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log('Path B chunk audit PASS');
console.log(
  JSON.stringify(
    {
      chunkCount: provenance.chunkCount,
      totalChunkTriangles: provenance.totalChunkTriangles,
      partCounts: proofManifest.chunks.map((c) => ({ id: c.chunkId, parts: c.partCount, tris: c.bounds.triangles })),
    },
    null,
    2,
  ),
);
