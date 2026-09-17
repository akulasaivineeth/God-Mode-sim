/**
 * WF02 R15.1 Plan — Path B neighborhood chunk audit (read-only).
 * Extends R13 shell audit from building scale → block scale.
 *
 * Usage: npm run audit:wf02-r15-path-b
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { URL as NodeURL } from 'node:url';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Box3, Vector3 } from 'three';
import { execSync } from 'node:child_process';

globalThis.self = globalThis;
globalThis.URL = NodeURL;

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'Docs/milestones/WF02/r15_path_b_audit_plan.json');
const PHASE0_MANIFEST = path.join(ROOT, 'Docs/milestones/WF02/r15_phase0_proof_manifest.json');
const SHELL_PROVENANCE = path.join(ROOT, 'Docs/milestones/WF02/r13_shell_provenance.json');
const SHELL_MANIFEST = path.join(ROOT, 'src/rendering/prototypeShell/prototypeShellManifest.json');
const R14_MANIFEST = path.join(ROOT, 'Docs/milestones/WF02/r14_rollout_manifest.json');

const loader = new GLTFLoader();

function gitSha() {
  return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
}

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

async function measureGlb(filePath) {
  if (!existsSync(filePath)) return { missing: true, path: filePath };
  const buf = readFileSync(filePath);
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  const gltf = await new Promise((resolve, reject) => {
    loader.parse(ab, '', resolve, reject);
  });
  const box = new Box3().setFromObject(gltf.scene);
  const size = box.getSize(new Vector3());
  let triangles = 0;
  gltf.scene.traverse((child) => {
    if (child.isMesh && child.geometry) {
      const idx = child.geometry.index;
      triangles += idx ? idx.count / 3 : child.geometry.attributes.position.count / 3;
    }
  });
  return {
    path: filePath.replace(`${ROOT}/`, ''),
    bounds: {
      min: [box.min.x, box.min.y, box.min.z],
      max: [box.max.x, box.max.y, box.max.z],
      size: [size.x, size.y, size.z],
      triangles: Math.round(triangles),
    },
    triangles: Math.round(triangles),
  };
}

const BLOCK_SOURCE_CANDIDATES = [
  { role: 'canopy-large', path: 'public/assets/glb/kenney/nature/tree-large.glb' },
  { role: 'canopy-small', path: 'public/assets/glb/kenney/nature/tree-small.glb' },
  { role: 'hedge-fence', path: 'public/assets/glb/kenney/suburban/fence-low.glb' },
  { role: 'ground-paver-short', path: 'public/assets/glb/kenney/suburban/path-stones-short.glb' },
  { role: 'ground-paver-messy', path: 'public/assets/glb/kenney/suburban/path-stones-messy.glb' },
  { role: 'ground-path-long', path: 'public/assets/glb/kenney/suburban/path-long.glb' },
  { role: 'amenity-planter', path: 'public/assets/glb/kenney/suburban/planter.glb' },
  { role: 'shell-civic', path: 'public/assets/glb/wf02/prototype-shells/wf02-civic-enclosure-shell.glb' },
  { role: 'shell-commercial', path: 'public/assets/glb/wf02/prototype-shells/wf02-commercial-frontage-shell.glb' },
  { role: 'shell-cottage', path: 'public/assets/glb/wf02/prototype-shells/wf02-residential-cottage-shell.glb' },
  { role: 'shell-gable', path: 'public/assets/glb/wf02/prototype-shells/wf02-residential-gable-shell.glb' },
];

const INTEGRATION_MODES = [
  {
    id: 'B1-mass-chunk-plus-shells',
    label: '1–2 offline mass chunks + retained separate R13/R14 shells',
    verdict: 'recommend',
    doorAuthority: 'shell doorBindings + frozen HERO_NAV entrances',
    shellRelationship: 'shells separate; chunks fill ground/canopy/edge mass around shells',
    doorDriftRisk: 'low',
    rollbackGranularity: 'high',
    visualCoherencePotential: 'high-if-chunks-encode-continuous-mass-not-scatter',
  },
  {
    id: 'B2-monolithic-block-with-sockets',
    label: 'Single offline block GLB with baked shell silhouettes + external door sockets',
    verdict: 'fallback',
    doorAuthority: 'socket metadata re-derived from shellManifest + visual re-audit ≤0.3m',
    shellRelationship: 'shells visually baked/subordinate; semantic doors external',
    doorDriftRisk: 'high',
    rollbackGranularity: 'medium',
    visualCoherencePotential: 'highest',
  },
  {
    id: 'A-runtime-envelopes',
    label: 'Path A runtime declarative envelopes (Phase 0 falsified)',
    verdict: 'reject',
    phase0Result: 'changedPixels 20.09% PASS; MAE 5.31 FAIL (<8.0)',
    reason: 'breadth without structural mass / low aggregate visual energy',
  },
];

async function main() {
  const measuredSources = {};
  for (const src of BLOCK_SOURCE_CANDIDATES) {
    measuredSources[src.role] = await measureGlb(path.join(ROOT, src.path));
  }

  const phase0 = existsSync(PHASE0_MANIFEST) ? readJson(PHASE0_MANIFEST) : null;
  const shellProvenance = existsSync(SHELL_PROVENANCE) ? readJson(SHELL_PROVENANCE) : null;
  const shellManifest = existsSync(SHELL_MANIFEST) ? readJson(SHELL_MANIFEST) : null;
  const r14Manifest = existsSync(R14_MANIFEST) ? readJson(R14_MANIFEST) : null;

  const shellTriTotal = shellManifest
    ? shellManifest.reduce((sum, s) => sum + (s.bounds?.triangles ?? 0), 0)
    : 0;

  const audit = {
    generatedAt: new Date().toISOString(),
    planRevision: '15.1',
    investigationBaseSha: gitSha(),
    pathAPhase0Falsification: phase0
      ? {
          sha: phase0.sha,
          changedPct: phase0.pixelDelta?.changedPct,
          mae: phase0.pixelDelta?.mae,
          passChanged15: phase0.pixelDelta?.passChanged15,
          passMae8: phase0.pixelDelta?.passMae8,
          overallPass: phase0.gates?.pass,
          proofDiagnostics: phase0.diagnostics,
        }
      : null,
    heroNeighborhoodBounds: { minX: -32, maxX: 32, minZ: -24, maxZ: 30 },
    r14Performance: r14Manifest?.diagnostics ?? null,
    r13ShellInventory: {
      shellCount: shellManifest?.length ?? 0,
      totalShellTriangles: shellTriTotal,
      provenanceLicense: shellProvenance?.license ?? null,
    },
    integrationModeComparison: INTEGRATION_MODES,
    recommendedIntegrationMode: 'B1-mass-chunk-plus-shells',
    proposedChunks: [
      {
        id: 'hero-block-mass-west',
        label: 'West/civic-residential mass chunk',
        footprint: { minX: -30, maxX: 8, minZ: -22, maxZ: 30 },
        encodes: ['civic plaza ground', 'residential block framing', 'future lot pad edge', 'north spine canopy belt'],
        excludes: ['road corridors', 'river water envelope', 'M02 entrance buffers', 'shell door volumes'],
        estimatedTrisBudget: 12000,
        estimatedDrawCalls: 1,
      },
      {
        id: 'hero-block-mass-east',
        label: 'East/commercial-park-river mass chunk',
        footprint: { minX: -8, maxX: 20, minZ: -16, maxZ: 22 },
        encodes: ['commercial frontage ground/canopy', 'park-river edge shelf', 'east perimeter trees'],
        excludes: ['road corridors', 'river water envelope', 'commercial shell door sockets'],
        estimatedTrisBudget: 14000,
        estimatedDrawCalls: 1,
      },
    ],
    measuredSourceAssets: measuredSources,
    renderBudgetTargets: {
      pathBPhase0ProofOverviewDcMax: 95,
      pathBPhase0ProofOverviewTrisMax: 55000,
      productionOverviewDcHardCap: 140,
      productionOverviewTrisHardCap: 150000,
      preserveM03HeadroomDc: 5,
      preserveM03HeadroomTris: 8000,
    },
    phase0Gates: {
      baseline: 'Docs/milestones/WF02/01_r14_overview_dawn.png',
      viewport: { width: 1440, height: 900 },
      camera: 'overview @ HERO_NEIGHBORHOOD_DEFINITION.cameras.overview',
      maeMin: 8.0,
      changedPctMin: 15.0,
      threshold: 5,
      note: 'Gates unchanged from R15 Path A Phase 0; metrics necessary not sufficient',
    },
    phase0PathADiscardMatrix: [
      { component: 'heroBlockPhase0ProofMode.ts', disposition: 'discard', reason: 'Path A proof gate only' },
      { component: 'heroBlockPhase0ProofSpec.ts', disposition: 'discard', reason: 'runtime envelope scatter falsified' },
      { component: 'HeroBlockPhase0ProofLayer.tsx', disposition: 'discard', reason: 'not production composition authority' },
      { component: 'compositionMask clipping helpers', disposition: 'retain-neutral', reason: 'reusable for chunk road/water exclusions' },
      { component: 'wf02-r15-phase0-proof.mjs', disposition: 'retain-neutral', reason: 'reuse capture/compare harness for Path B Phase 0' },
      { component: 'wf02-r15-pixel-delta.mjs', disposition: 'retain-neutral', reason: 'metric utility unchanged' },
      { component: 'r15_phase0_proof_manifest.json', disposition: 'retain-diagnostic', reason: 'Path A falsification record' },
    ],
    recommendation: {
      selectedPath: 'B1-mass-chunk-plus-shells',
      rationale:
        'Path A Phase 0 proved runtime envelopes increase pixel breadth (20.09%) but not aggregate visual energy (MAE 5.31). Extend proven R13 offline kitbash to 1–2 neighborhood mass chunks while retaining separate R13 shells for M02 door authority and rollback granularity.',
      nextGate: 'PLAN_R15.1 approval → Path B Phase 0 disposable prototype only',
    },
  };

  writeFileSync(OUT, JSON.stringify(audit, null, 2));
  console.log('Wrote', OUT);
  console.log('Recommended:', audit.recommendation.selectedPath);
  if (phase0) {
    console.log('Path A Phase 0:', phase0.pixelDelta?.changedPct, '% changed, MAE', phase0.pixelDelta?.mae);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
