/**
 * WF02 R15.3 Plan — framing/footprint strategy audit (read-only).
 * Synthesizes Path A/B/C falsification + Candidate C ROI signal for decision planning.
 *
 * Usage: npm run audit:wf02-r15-framing-footprint
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const OUT = 'Docs/milestones/WF02/r15_framing_footprint_audit_plan.json';

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
    id: 'D-bounded-framing-correction',
    label: 'Candidate D — bounded Overview framing correction',
    verdict: 'recommend-primary-analytical-then-phase0',
    method:
      'Analytically measure hero-block frame occupancy; propose bounded camera/target adjustment so hero neighborhood occupies sufficient Overview pixels for town-scale north-star read while preserving Street/M02 portal proofs',
    ownership: 'HERO_NEIGHBORHOOD_DEFINITION.cameras.overview (+ evidence preset registry if split)',
    simulationImpact: 'none — presentation camera only',
    visualHypothesis:
      'Candidate C ROI MAE 14.20 vs full-frame 6.19 implies changed mass is real but under-weighted in frame; framing may unlock full-frame MAE without new geometry',
    abortIf:
      'Framing improves MAE but not ordinary-viewer north-star read; or degrades Street/door proofs; or requires crop-only evidence path',
  },
  {
    id: 'E-presentation-footprint-recomposition',
    label: 'Candidate E — presentation footprint recomposition (sim authority unchanged)',
    verdict: 'recommend-secondary-phase0',
    method:
      'Re-author presentation cluster layout within frozen hero bounds so buildings/mass occupy central Overview weight — separate visual town centroid from sim anchors via presentation-only transforms, not facilityPoints edits',
    ownership: 'WorldLab presentation anchors / shell registry origins / assembly placement spec',
    simulationImpact: 'none — facilityPoints, HERO_NAV, entrances frozen; presentation offsets only',
    visualHypothesis:
      'Town-scale transformation requires hero block to dominate default Overview silhouette, not edge-distributed delta on ~20% of pixels',
    abortIf:
      'Presentation reposition breaks door/socket ≤0.3m visual honesty; or duplicates A/B/C additive dressing pattern',
  },
  {
    id: 'C-replacement-hero-assembly',
    label: 'Candidate C — replacement assemblies (R15.2)',
    verdict: 'reject-falsified',
    phase0Result: 'changed 19.16% PASS; MAE 6.19 FAIL; ROI MAE 14.20; hero-block DC 8 PASS',
    reason: 'Strong local delta, insufficient whole-frame town-scale transformation at frozen framing',
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
      'ROI MAE >> full-frame MAE: hero region materially changed but occupies insufficient frozen Overview composition for town-scale north-star gate',
    maeGate: 8,
    changedPctGate: 15,
    rule: 'Do not relax or reinterpret locked A/B/C gates; do not tune Candidate C',
  };

  const frozenOverview = {
    viewport: { width: 1440, height: 900 },
    camera: { position: [0, 46, 36], target: [0, 0, 4] },
    source: 'HERO_NEIGHBORHOOD_DEFINITION.cameras.overview',
    heroBounds: { minX: -32, maxX: 32, minZ: -24, maxZ: 30 },
    note: 'All A/B/C falsification used this framing — gate failure may be partially framing-weighted',
  };

  const audit = {
    generatedAt: new Date().toISOString(),
    planRevision: '15.3',
    investigationBaseSha: gitSha(),
    seniorDecision: {
      decision: 'FIX_REQUIRED_STRATEGY_CHANGE_REQUIRED',
      reviewSha: 'cee6f3b848bff852c862be4337864e929f29e4aa',
      implementationSha: '85ded0397eb4945b1b36d69cf6dcc4f6e50a7268',
      nextState: 'PLAN_R15.3_REQUIRED',
    },
    falsificationRecord,
    repeatedRootStrategyFailure: {
      experiments: ['A', 'B', 'C'],
      maeSeries: [5.31, 4.59, 6.19],
      changedPctSeries: [20.09, 15.79, 19.16],
      trend: 'MAE improves A→B→C but remains below 8.0; changed-pixel gate passable without town-scale whole-frame transformation',
    },
    roiSignal,
    frozenOverview,
    strategyCandidates: STRATEGY_CANDIDATES,
    recommendation: {
      primary: 'D-bounded-framing-correction',
      secondary: 'E-presentation-footprint-recomposition',
      rationale:
        'Three composition-only strategies falsified at frozen framing. Candidate C proves local hierarchy can change (ROI MAE 14.20) while whole-frame gate fails — next plan must address frame occupancy and/or presentation footprint, not more hero-block dressing.',
      nextGate: 'PLAN_R15.3 approval → Candidate D analytical audit first; Candidate E Phase 0 only if D insufficient',
    },
    proposedPhase0EvidenceProtocol: {
      baseline: 'Docs/milestones/WF02/01_r14_overview_dawn.png',
      comparePanels: ['R14', 'candidate', 'north-star-reference'],
      mandatoryCaptures: ['overview-dawn-1440x900', 'street-m02-doors', 'store-workshop-relationship'],
      antiGamingRules: [
        'No crop-only evidence path',
        'No opacity/tint overlay as primary delta',
        'Full-frame MAE + changed% remain mandatory until explicitly superseded in approval',
        'Framing change must pass Street/M02 portal regression',
        'ROI MAE recorded but cannot substitute full-frame MAE',
      ],
    },
    artifactsPresent: {
      pathAManifest: !!pathA,
      pathBManifest: !!pathB,
      pathCManifest: !!pathC,
      r14Baseline: existsSync('Docs/milestones/WF02/01_r14_overview_dawn.png'),
    },
  };

  writeFileSync(OUT, JSON.stringify(audit, null, 2));
  console.log('R15.3 framing/footprint audit written:', OUT);
  console.log(JSON.stringify(audit.recommendation, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
