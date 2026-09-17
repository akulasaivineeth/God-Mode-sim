/**
 * WF02 R15.2 Plan — composition reset audit (read-only).
 * Synthesizes Path A + Path B Phase 0 falsification evidence for decision planning.
 *
 * Usage: npm run audit:wf02-r15-composition-reset
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { URL as NodeURL } from 'node:url';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { execSync } from 'node:child_process';

globalThis.self = globalThis;
globalThis.URL = NodeURL;

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'Docs/milestones/WF02/r15_composition_reset_audit_plan.json');

const PATH_A_MANIFEST = path.join(ROOT, 'Docs/milestones/WF02/r15_phase0_proof_manifest.json');
const PATH_B_MANIFEST = path.join(ROOT, 'Docs/milestones/WF02/r15_pathb_phase0_proof_manifest.json');
const R14_BASELINE = path.join(ROOT, 'Docs/milestones/WF02/01_r14_overview_dawn.png');
const CHUNK_WEST = path.join(ROOT, 'public/assets/glb/wf02/block-chunks/wf02-hero-block-mass-west.glb');
const CHUNK_EAST = path.join(ROOT, 'public/assets/glb/wf02/block-chunks/wf02-hero-block-mass-east.glb');
const SHELL_MANIFEST = path.join(ROOT, 'src/rendering/prototypeShell/prototypeShellManifest.json');

const loader = new GLTFLoader();

function gitSha() {
  return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
}

function readJson(file) {
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, 'utf8'));
}

async function countGlbMeshes(filePath) {
  if (!existsSync(filePath)) return { missing: true, path: filePath };
  const buf = readFileSync(filePath);
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  const gltf = await new Promise((resolve, reject) => {
    loader.parse(ab, '', resolve, reject);
  });
  let meshCount = 0;
  let materialCount = 0;
  const materials = new Set();
  let triangles = 0;
  gltf.scene.traverse((child) => {
    if (child.isMesh && child.geometry) {
      meshCount += 1;
      const idx = child.geometry.index;
      triangles += idx ? idx.count / 3 : child.geometry.attributes.position.count / 3;
      const mat = child.material?.name ?? 'unnamed';
      materials.add(mat);
    }
  });
  materialCount = materials.size;
  return { meshCount, materialCount, triangles: Math.round(triangles) };
}

const STRATEGY_CANDIDATES = [
  {
    id: 'C-replacement-hero-assembly',
    label: 'Replacement-based hero-block assembly (offline batched mass replaces dominant presentation)',
    verdict: 'recommend-phase0',
    method:
      'Author 1–3 offline merged assemblies that REPLACE (not surround) R14 scatter + shell visual mass in hero neighborhood; retain thin semantic door/socket layer only',
    doorAuthority: 'Separate socket markers + frozen HERO_NAV; shells optional hidden in proof',
    drawCallStrategy: 'gltf-transform flatten/join/palette → ≤3 materials, ≤1 mesh per assembly',
    productionDcTarget: 'hero block ≤8 DC total (assemblies + door sockets)',
    visualHypothesis:
      'Changes block silhouette, roofline hierarchy, and street-wall rhythm because macro mass authority shifts',
    abortIf:
      'Phase 0 MAE <8 AND qualitative hierarchy unchanged OR hero block DC >12 in proof mode',
  },
  {
    id: 'D-framing-feasibility-audit',
    label: 'Framing feasibility audit + bounded gameplay framing correction',
    verdict: 'recommend-analytical-phase0',
    method:
      'Analytically test whether frozen Overview [0,46,36]→[0,0,4] at 64×54 m hero bounds makes north-star perceptual delta unreachable without replacing macro mass',
    doorAuthority: 'Unchanged — framing only if gameplay benefit proven',
    drawCallStrategy: 'No new geometry required for audit phase',
    productionDcTarget: 'unchanged until framing approved',
    visualHypothesis:
      'May reveal metric/camera mismatch rather than composition technique gap; correction must improve normal gameplay not metric gaming',
    abortIf:
      'Framing change improves MAE but not ordinary-viewer north-star read OR degrades Street/M02 portal proofs',
  },
  {
    id: 'B1-mass-chunk-plus-shells',
    label: 'Path B B1 — additive mass chunks + separate shells (R15.1)',
    verdict: 'reject-falsified',
    phase0Result: 'changedPct 15.79% PASS; MAE 4.59 FAIL; proof DC 206',
    reason: 'Additive dressing around unchanged shells; draw multiplication from 82+58 chunk meshes',
  },
  {
    id: 'A-runtime-envelopes',
    label: 'Path A — runtime declarative envelopes (R15)',
    verdict: 'reject-falsified',
    phase0Result: 'changedPct 20.09% PASS; MAE 5.31 FAIL; proof DC 87',
    reason: 'Breadth without decisive hierarchy shift; low-amplitude distributed dressing',
  },
  {
    id: 'B2-monolithic-block-with-sockets',
    label: 'Path B B2 — monolithic block with baked shells + external sockets',
    verdict: 'hold-pending-C-fail',
    reason: 'High door drift risk; only if Candidate C Phase 0 fails with qualitative improvement',
  },
];

async function main() {
  const pathA = readJson(PATH_A_MANIFEST);
  const pathB = readJson(PATH_B_MANIFEST);
  const shells = readJson(SHELL_MANIFEST);

  const westStats = await countGlbMeshes(CHUNK_WEST);
  const eastStats = await countGlbMeshes(CHUNK_EAST);

  const maeGate = 8;
  const changedGate = 15;

  const falsificationRecord = {
    pathA: pathA
      ? {
          sha: pathA.sha,
          changedPct: pathA.pixelDelta.changedPct,
          mae: pathA.pixelDelta.mae,
          passChanged15: pathA.pixelDelta.passChanged15,
          passMae8: pathA.pixelDelta.passMae8,
          overallPass: pathA.gates.pass,
          proofDiagnostics: pathA.diagnostics,
        }
      : null,
    pathB: pathB
      ? {
          sha: pathB.sha,
          changedPct: pathB.pixelDelta.changedPct,
          mae: pathB.pixelDelta.mae,
          passChanged15: pathB.pixelDelta.passChanged15,
          passMae8: pathB.pixelDelta.passMae8,
          overallPass: pathB.gates.pass,
          proofDiagnostics: pathB.diagnostics,
          chunkMeshCounts: { west: westStats, east: eastStats },
        }
      : null,
  };

  const metricAnalysis = {
    frozenGates: { maeMin: maeGate, changedPctMin: changedGate, perPixelThreshold: 5 },
    patternObserved:
      'Both experiments pass changed-pixel breadth while failing MAE magnitude — low-amplitude displacement on many pixels, dominant R14 anchors unchanged',
    maeCorrelationNote:
      'Global MAE averages over all pixels; ~80% unchanged pixels dilute aggregate. Changed-pixel % alone rewards distributed faint deltas, not decisive hierarchy shifts.',
    illustrativeMath: {
      pathA: {
        impliedAvgDeltaOnChangedPixels: pathA
          ? Number((pathA.pixelDelta.mae / (pathA.pixelDelta.changedPct / 100)).toFixed(2))
          : null,
      },
      pathB: {
        impliedAvgDeltaOnChangedPixels: pathB
          ? Number((pathB.pixelDelta.mae / (pathB.pixelDelta.changedPct / 100)).toFixed(2))
          : null,
      },
      mae8At15PctChangedRequiresAvgDeltaOnChanged: Number((maeGate / 0.15).toFixed(2)),
    },
    proposedSupplementaryMetrics: [
      {
        id: 'roi-mae',
        label: 'Hero-block ROI MAE (central 60% crop)',
        purpose: 'Weight pixels where neighborhood hierarchy should change',
        retroactiveRescore: false,
      },
      {
        id: 'high-contrast-changed-pct',
        label: 'Changed pixels at threshold ≥20',
        purpose: 'Detect decisive contrast shifts vs faint tint/scatter',
        retroactiveRescore: false,
      },
      {
        id: 'silhouette-edge-delta',
        label: 'Edge-map occupancy delta vs north-star reference',
        purpose: 'Perceptual mass/shape change independent of color wash',
        retroactiveRescore: false,
      },
    ],
    rule: 'Existing MAE≥8 + changed≥15% gates remain locked for A/B comparison; new metrics require plan approval before next experiment',
  };

  const drawCallDiagnosis = {
    r14ProductionApprox: { overviewDc: 90, overviewTris: 34000 },
    pathAProof: pathA?.diagnostics ?? null,
    pathBProof: pathB?.diagnostics ?? null,
    pathBChunkMeshMultiplication: {
      westMeshes: westStats.meshCount,
      eastMeshes: eastStats.meshCount,
      shellDraws: shells?.shells?.length ?? 4,
      explanation:
        'B1 kitbash merge retained one mesh per instanced part (82+58) — additive scatter authored offline but still multi-draw at runtime',
    },
    productionBudgetBeforeNextExperiment: {
      overviewDcPreferred: 140,
      overviewDcHeroBlockTarget: 110,
      heroBlockAssemblyDcMax: 8,
      streetDcPreferred: 100,
      overviewTrisHardCap: 150000,
      preserveM03HeadroomDc: 5,
      preserveM03HeadroomTris: 8000,
    },
  };

  const layerOwnership = {
    dominantHeroBlockMassingToday: [
      'PrototypeShellLayer (4 shell GLBs — visual centroid + roofline hierarchy)',
      'WorldLabGroundTint / VegetationFrame / ResidentialGardens / FutureLotFrame / CivicEnclosure (parallel scatter modules)',
    ],
    proofModeBranches: [
      'HeroBlockPhase0ProofLayer (?r15Phase0Proof=1) — additive runtime scatter',
      'BlockChunkPhase0ProofLayer (?r15PathBPhase0Proof=1) — additive offline chunk scatter',
    ],
    replacementBoundary:
      'Candidate C must suppress parallel scatter modules AND replace shell visual read with batched assemblies while preserving semantic door/socket authority separately',
    mustNotReplace: [
      'facilityPoints.ts / HERO_NAV / simulation/**',
      'terrain / roads / river carve truth',
      'M02 entrance coordinates',
    ],
  };

  const audit = {
    generatedAt: new Date().toISOString(),
    planRevision: '15.2',
    investigationBaseSha: gitSha(),
    seniorDecision: {
      decision: 'FIX_REQUIRED',
      nextState: 'PLAN_R15.2_REQUIRED',
      headSha: gitSha(),
    },
    falsificationRecord,
    metricAnalysis,
    drawCallDiagnosis,
    layerOwnership,
    strategyCandidates: STRATEGY_CANDIDATES,
    recommendation: {
      primary: 'C-replacement-hero-assembly',
      secondary: 'D-framing-feasibility-audit',
      rationale:
        'A and B1 falsified additive dressing around unchanged macro hierarchy. Next experiment must replace dominant presentation authority or prove framing/metric mismatch analytically before any new geometry.',
      nextGate: 'PLAN_R15.2 approval → Candidate C Phase 0 disposable prototype OR Candidate D analytical audit first',
    },
    phase0ProofRequirements: {
      baseline: 'Docs/milestones/WF02/01_r14_overview_dawn.png',
      viewport: { width: 1440, height: 900 },
      camera: 'overview @ HERO_NEIGHBORHOOD_DEFINITION.cameras.overview',
      unchangedQuantitativeGates: { maeMin: 8, changedPctMin: 15, threshold: 5 },
      mandatoryEvidence: [
        'BEFORE→candidate→north-star same-view strip',
        'Hero-block close + Street door/road proof',
        'Silhouette/ROI diagnostic (approved metric)',
        'Live draw/triangle measurements',
        'Zero asset/network errors',
        'Rollback flag proof',
      ],
      abortCriteria: [
        'MAE <8 OR changed <15% without approved metric substitution',
        'Qualitative hierarchy unchanged (ordinary viewer cannot distinguish from R14)',
        'Hero-block proof DC >12 OR production path cannot meet ≤140 Overview DC',
        'Door/socket drift >0.3 m',
      ],
    },
    artifactsPresent: {
      r14Baseline: existsSync(R14_BASELINE),
      pathAManifest: !!pathA,
      pathBManifest: !!pathB,
      chunkGlbs: existsSync(CHUNK_WEST) && existsSync(CHUNK_EAST),
    },
  };

  writeFileSync(OUT, JSON.stringify(audit, null, 2));
  console.log('R15.2 composition reset audit written:', OUT);
  console.log(JSON.stringify(audit.recommendation, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
