/**
 * WF02 R15 Candidate C Phase 0 — replacement assembly provenance + draw budget audit.
 */
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const provenance = JSON.parse(
  readFileSync('Docs/milestones/WF02/r15_replacement_assembly_provenance.json', 'utf8'),
);
const proofManifest = JSON.parse(
  readFileSync('src/rendering/replacementProof/replacementPhase0ProofManifest.json', 'utf8'),
);
const layoutManifest = JSON.parse(
  readFileSync('src/rendering/assets/modelLayoutManifest.json', 'utf8'),
);
const register = readFileSync('Docs/assets/ASSET_REGISTER.md', 'utf8');

const errors = [];
const HERO_BLOCK_DRAW_HARD_STOP = 12;
const DOOR_SOCKET_DRAWS = 3;

function isRegisteredKenneySource(src) {
  const publicPath = `public${src}`;
  if (!existsSync(publicPath)) return false;
  if (layoutManifest[src]) return true;
  const registerKey = src.replace('/assets/glb/kenney/', '');
  if (register.includes(`\`${registerKey}\``)) return true;
  if (src.startsWith('/assets/glb/kenney/') && register.includes('City Kit')) return true;
  if (src.startsWith('/assets/glb/kenney/suburban/') && register.includes('Suburban props')) {
    return true;
  }
  return false;
}

for (const asm of Object.values(provenance.assemblies)) {
  for (const src of asm.sourceMeshes) {
    if (!isRegisteredKenneySource(src)) {
      errors.push(`Source not registered: ${src}`);
    }
  }
}

for (const asm of proofManifest.assemblies) {
  const glbPath = `public${asm.assetUrl}`;
  if (!existsSync(glbPath)) errors.push(`Missing assembly GLB: ${glbPath}`);
  if (asm.meshCount > 3) {
    console.warn(`  WARN: ${asm.assemblyId} has ${asm.meshCount} meshes (plan target ≤3 per assembly)`);
  }
}

const assemblyDrawEstimate =
  proofManifest.assemblies.reduce((sum, a) => sum + a.meshCount, 0) + DOOR_SOCKET_DRAWS;

if (assemblyDrawEstimate > HERO_BLOCK_DRAW_HARD_STOP) {
  errors.push(
    `Hero-block draw estimate ${assemblyDrawEstimate} exceeds hard stop ${HERO_BLOCK_DRAW_HARD_STOP}`,
  );
}

try {
  execSync('node scripts/wf02-r14-shell-rollout-audit.mjs', { stdio: 'pipe' });
} catch {
  errors.push('R14 shell door/origin audit failed — door bindings must remain <=0.3m');
}

if (errors.length > 0) {
  console.error('Candidate C replacement audit FAIL:');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log('Candidate C replacement audit PASS');
console.log(
  JSON.stringify(
    {
      assemblyCount: proofManifest.assemblies.length,
      totalAssemblyTriangles: provenance.totalAssemblyTriangles,
      totalAssemblyMeshes: provenance.totalMeshCount,
      heroBlockDrawEstimate: assemblyDrawEstimate,
      heroBlockDrawHardStop: HERO_BLOCK_DRAW_HARD_STOP,
      assemblies: proofManifest.assemblies.map((a) => ({
        id: a.assemblyId,
        meshes: a.meshCount,
        materials: a.materialCount,
        tris: a.bounds.triangles,
      })),
    },
    null,
    2,
  ),
);
