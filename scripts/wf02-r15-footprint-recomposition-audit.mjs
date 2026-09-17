/**
 * WF02 R15.3.1 Plan — presentation footprint recomposition audit (read-only).
 * Supersedes R15.3 framing-first recommendation per PLAN_CHANGES_REQUIRED @ b936779.
 *
 * Usage: npm run audit:wf02-r15-footprint-recomposition
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const OUT = 'Docs/milestones/WF02/r15_footprint_recomposition_audit_plan.json';

const MANIFESTS = {
  pathA: 'Docs/milestones/WF02/r15_phase0_proof_manifest.json',
  pathB: 'Docs/milestones/WF02/r15_pathb_phase0_proof_manifest.json',
  pathC: 'Docs/milestones/WF02/r15_replacement_phase0_proof_manifest.json',
};

function readJson(path) {
  return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null;
}

function gitSha() {
  return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
}

const STRATEGY_CANDIDATES = [
  {
    id: 'E-presentation-footprint-recomposition',
    label: 'Candidate E — presentation footprint recomposition (sim authority unchanged)',
    verdict: 'recommend-primary-analytical-then-phase0',
    method:
      'Re-author presentation cluster layout within frozen hero bounds plus bounded district massing inside existing geography. Single presentation-offset/massing authority. Use replacement/shell vocabulary from C lessons — not disposable proof wiring.',
    ownership:
      'presentationFootprintSpec (new) + prototypeShellManifest origins + WorldLabCompositionLayer module roots',
    simulationImpact: 'none — facilityPoints, HERO_NAV, entrances frozen; presentation offsets only',
    visualHypothesis:
      'Town-scale north-star read requires hero block + district massing to dominate default Overview silhouette — sparse surround is root cause, not unfair MAE',
    abortIf:
      'Composition still reads sparse at default camera; success requires camera crop; door/socket >0.3m; duplicates A/B additive dressing',
  },
  {
    id: 'D-bounded-camera-calibration',
    label: 'Candidate D — bounded camera calibration (secondary only)',
    verdict: 'recommend-secondary-after-footprint',
    method:
      'Propose bounded Overview camera adjustment ONLY after analytically composed footprint exists. Justify independently of MAE — default gameplay readability.',
    ownership: 'HERO_NEIGHBORHOOD_DEFINITION.cameras.* (reference context; secondary in build)',
    simulationImpact: 'none — presentation camera only',
    visualHypothesis:
      'Camera exposes sparse composition; reframing without footprint fix hides sparsity without fixing product read',
    abortIf:
      'Proposed before footprint complete; evidence-only camera for MAE; degrades Street/M02 portal proofs; crop-only evidence path',
  },
  {
    id: 'D-primary-framing-correction-r15.3',
    label: 'Candidate D primary (R15.3 — rejected framing)',
    verdict: 'reject-plan-framing',
    reason:
      'Drifts toward optimizing evidence camera to make local C delta carry more weight; product problem is live composition, not crop score',
  },
  {
    id: 'C-replacement-hero-assembly',
    label: 'Candidate C — replacement assemblies (R15.2)',
    verdict: 'reject-falsified',
    phase0Result: 'changed 19.16% PASS; MAE 6.19 FAIL; ROI MAE 14.20; hero-block DC 8 PASS',
    reason: 'Strong local delta; insufficient whole-frame town-scale transformation — lessons reusable, wiring not',
  },
  {
    id: 'B1-mass-chunk-plus-shells',
    label: 'Path B B1 — additive offline chunks',
    verdict: 'reject-falsified',
    phase0Result: 'changed 15.79% PASS; MAE 4.59 FAIL; proof DC 206',
  },
  {
    id: 'A-runtime-envelopes',
    label: 'Path A — runtime declarative envelopes',
    verdict: 'reject-falsified',
    phase0Result: 'changed 20.09% PASS; MAE 5.31 FAIL',
  },
];

const MULTI_PART_RUBRIC = [
  { id: 'R1', component: 'Qualitative north-star comparison', role: 'product-acceptance', hardFail: true },
  { id: 'R2', component: 'District silhouette/massing proof', role: 'product-acceptance', hardFail: true },
  { id: 'R3', component: 'Street readability (M02 doors/paths)', role: 'product-acceptance', hardFail: true },
  { id: 'R4', component: 'Gameplay camera honesty', role: 'product-acceptance', hardFail: true },
  { id: 'R5', component: 'Whole-frame changed % vs R14', role: 'diagnostic', hardFail: false },
  { id: 'R6', component: 'Whole-frame MAE vs R14', role: 'diagnostic', hardFail: false },
  { id: 'R7', component: 'Frame-occupancy before→proposed', role: 'descriptive-design', hardFail: false },
  { id: 'R8', component: 'Performance budget (DC/tris)', role: 'product-acceptance', hardFail: true },
  { id: 'R9', component: 'Simulation invariants + zero asset errors', role: 'product-acceptance', hardFail: true },
];

const FRAME_OCCUPANCY_TARGETS = {
  note: 'Descriptive design metric — not a pass substitute',
  categories: ['builtMass', 'vegetation', 'roads', 'meadowPeriphery', 'river', 'sky'],
  r14EstimatePct: {
    builtMass: '12-15',
    vegetation: '8-10',
    roads: '18-22',
    meadowPeriphery: '45-50',
    river: '5-8',
    sky: '8-12',
  },
  candidateETargetDirection: {
    builtMass: 'up to 22-30',
    vegetation: 'up to 15-20',
    roads: 'stable 15-18',
    meadowPeriphery: 'down to 25-35',
    river: 'stable 6-10',
    sky: 'stable 8-10',
  },
};

async function main() {
  const pathA = readJson(MANIFESTS.pathA);
  const pathB = readJson(MANIFESTS.pathB);
  const pathC = readJson(MANIFESTS.pathC);

  const falsificationRecord = {
    pathA: pathA && {
      sha: pathA.sha,
      changedPct: pathA.pixelDelta.changedPct,
      mae: pathA.pixelDelta.mae,
      overallPass: pathA.gates.pass,
    },
    pathB: pathB && {
      sha: pathB.sha,
      changedPct: pathB.pixelDelta.changedPct,
      mae: pathB.pixelDelta.mae,
      overallPass: pathB.gates.pass,
    },
    pathC: pathC && {
      sha: pathC.sha,
      changedPct: pathC.pixelDelta.changedPct,
      mae: pathC.pixelDelta.mae,
      roiMae: pathC.pixelDelta.learningDiagnostics?.roiMae,
      highContrastChangedPct: pathC.pixelDelta.learningDiagnostics?.highContrastChangedPct,
      heroBlockDrawEstimate: pathC.assemblyProvenance?.heroBlockDrawEstimate,
      overallPass: pathC.gates.pass,
    },
  };

  const roiSignal = {
    candidateCFullFrameMae: pathC?.pixelDelta.mae ?? null,
    candidateCRoiMae: pathC?.pixelDelta.learningDiagnostics?.roiMae ?? null,
    interpretation:
      'ROI MAE >> full-frame MAE: hero region materially changed but live composition outside ROI remains sparse — dilutes whole-frame gate, not unfair MAE',
    maeGate: 8,
    changedPctGate: 15,
    rule: 'Do not relax or reinterpret locked A/B/C gates; do not tune Candidate C',
    forwardLookingNote:
      'Whole-frame MAE remains diagnostic for future E/D work — not sole product-acceptance gate (multi-part rubric)',
  };

  const frozenOverview = {
    viewport: { width: 1440, height: 900 },
    camera: { position: [0, 46, 36], target: [0, 0, 4] },
    source: 'HERO_NEIGHBORHOOD_DEFINITION.cameras.overview',
    heroBounds: { minX: -32, maxX: 32, minZ: -24, maxZ: 30 },
    note: 'Frozen until D secondary approved with independent gameplay-readability justification — not MAE justification',
  };

  const audit = {
    generatedAt: new Date().toISOString(),
    planRevision: '15.3.1',
    supersedesPlanRevision: '15.3',
    supersedesPlanSha: 'b936779c95ceaeb353cff09b93821692c7a55937',
    investigationBaseSha: gitSha(),
    seniorDecision: {
      decision: 'PLAN_CHANGES_REQUIRED',
      planSha: 'b936779c95ceaeb353cff09b93821692c7a55937',
      rejectedFraming: 'Candidate D primary — evidence-camera optimization drift',
      nextState: 'PLAN_R15.3.1_WAITING_FOR_CHATGPT_PLAN_APPROVAL',
    },
    falsificationRecord,
    repeatedRootStrategyFailure: {
      experiments: ['A', 'B', 'C'],
      maeSeries: [5.31, 4.59, 6.19],
      changedPctSeries: [20.09, 15.79, 19.16],
      trend:
        'Local hierarchy can change (C ROI 14.20) while whole-frame gate fails because sparse surround dominates — footprint recomposition required',
    },
    roiSignal,
    frozenOverview,
    frameOccupancyTargets: FRAME_OCCUPANCY_TARGETS,
    strategyCandidates: STRATEGY_CANDIDATES,
    multiPartEvidenceRubric: MULTI_PART_RUBRIC,
    recommendation: {
      primary: 'E-presentation-footprint-recomposition',
      secondary: 'D-bounded-camera-calibration',
      rejected: 'D-primary-framing-correction-r15.3',
      rationale:
        'Product problem is live town composition/readability, not crop score. Recompose presentation footprint + bounded district massing first; camera calibration only after footprint exists and only for gameplay readability.',
      nextGate:
        'PLAN_R15.3.1 approval → Candidate E analytical audit + footprint spec → E Phase 0; D only if footprint complete and readability still insufficient',
    },
    proposedPhase0EvidenceProtocol: {
      baseline: 'Docs/milestones/WF02/01_r14_overview_dawn.png',
      comparePanels: ['R14', 'candidate', 'north-star-reference'],
      mandatoryCaptures: [
        'overview-dawn-1440x900',
        'civic',
        'commercial-residential',
        'river-park',
        'street-m02-doors',
        'angled',
        'diagnostics-dc-tris',
      ],
      antiGamingRules: [
        'No evidence-only camera preset for MAE',
        'No crop-only evidence path',
        'No opacity/tint overlay as primary delta',
        'Camera change only after footprint composition exists',
        'Whole-frame MAE/changed% diagnostic — not sole gate for future work',
        'ROI MAE recorded but cannot substitute product acceptance',
        'Do not production-wire A/B/C proof layers',
      ],
    },
    predeclaredProofRequirements: [
      'presentation-footprint-before-after-with-door-delta',
      'district-massing-vegetation-rendering-path',
      'default-camera-values-with-d-secondary-justification',
      'frame-occupancy-analysis-before-proposed',
      'same-view-evidence-suite',
      'deterministic-simulation-invariants',
      'performance-budget-overview-street-tris',
      'rollback-abort-if-sparse-or-camera-crop-required',
    ],
    artifactsPresent: {
      pathAManifest: !!pathA,
      pathBManifest: !!pathB,
      pathCManifest: !!pathC,
      r14Baseline: existsSync('Docs/milestones/WF02/01_r14_overview_dawn.png'),
      planR1531: existsSync('Docs/milestones/WF02/PLAN_R15.3.1.md'),
    },
  };

  writeFileSync(OUT, JSON.stringify(audit, null, 2));
  console.log('R15.3.1 footprint recomposition audit written:', OUT);
  console.log(JSON.stringify(audit.recommendation, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
