/**
 * WF02 R15.4 Plan — authoring pipeline reset audit (read-only).
 * Synthesizes A/B/C/E falsification + Strategy A/B/C comparison.
 *
 * Usage: npm run audit:wf02-r15-authoring-pipeline
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const OUT = 'Docs/milestones/WF02/r15_authoring_pipeline_audit_plan.json';

const MANIFESTS = {
  pathA: 'Docs/milestones/WF02/r15_phase0_proof_manifest.json',
  pathB: 'Docs/milestones/WF02/r15_pathb_phase0_proof_manifest.json',
  pathC: 'Docs/milestones/WF02/r15_replacement_phase0_proof_manifest.json',
  pathE: 'Docs/milestones/WF02/r15_footprint_phase0_proof_manifest.json',
};

function readJson(path) {
  return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null;
}

function gitSha() {
  return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
}

const STRATEGIES = [
  {
    id: 'A-offline-authored-hero-neighborhood-scene',
    label: 'Strategy A — offline authored hero-neighborhood scene/chunk',
    verdict: 'recommend-primary-phase0',
    method:
      'One deliberately authored presentation chunk from registered R13/Kenney/Quaternius vocabulary. Offline recipe + flatten/join pipeline. Semantic door sockets; sim not render authority.',
    license: 'CC0 Kenney + Quaternius derivatives (already registered)',
    visualHypothesis:
      'R13 kitbash + C flatten proved at building/block scale; E proved placement alone cannot add screen-space mass — author scene as unit',
    abortIf: 'Qualitative north-star unchanged at frozen camera; occupancy flat like E',
  },
  {
    id: 'B-external-cc0-source-audit',
    label: 'Strategy B — audit stronger finished CC0 environment source',
    verdict: 'recommend-audit-only-fallback',
    method:
      'File-level audit of one external CC0 neighborhood/environment source (KayKit reconfirm, OpenGameArt screening). Disposable import proof plan only — no import in plan gate.',
    license: 'Must verify LICENSE file — no ambiguous Sketchfab',
    visualHypothesis: 'Unknown until audit — may supply pre-composed neighborhood read',
    abortIf: 'Repeats R10/R11 monolith failure; insufficient civic/commercial/residential/park vocabulary',
  },
  {
    id: 'C-stop-wf02-visual-rebuild',
    label: 'Strategy C — stop WF02 visual rebuild / change north-star requirement',
    verdict: 'recommend-explicit-product-tradeoff',
    method:
      'Stop iteration loop at R14 best; document north-star as aspirational reference not mechanical gate. Requires explicit Product Owner decision.',
    license: 'N/A',
    visualHypothesis: 'Accept current readable town; defer densification',
    abortIf: 'Chosen silently without Product Owner — forbidden',
  },
  {
    id: 'E-presentation-footprint-recomposition',
    label: 'Candidate E — footprint recomposition (R15.3.1)',
    verdict: 'reject-falsified',
    phase0Result: 'changed 19.02%; MAE 6.39; built mass occupancy Δ0%; engineering PASS; visual FAIL',
    disposition: 'presentationFootprintSpec.ts — disposable research only; do not production-wire',
  },
  {
    id: 'D-bounded-camera-calibration',
    label: 'Candidate D — camera calibration',
    verdict: 'forbidden-until-composition-passes',
    reason: 'E proved under-authored composition; camera would crop sparse scene without creating mass',
  },
];

const EXTERNAL_SOURCE_AUDIT = [
  {
    id: 'kenney-registered-inventory',
    license: 'CC0 1.0',
    verdict: 'insufficient-alone',
    note: 'Parts not composed neighborhood scenes — Strategy A composes them offline',
  },
  {
    id: 'quaternius-stylized-nature-megakit',
    sourceUrl: 'https://opengameart.org/content/stylized-nature-megakit',
    license: 'CC0 1.0',
    verdict: 'nature-only',
    note: 'Vegetation/rocks — no civic/commercial/residential building vocabulary',
  },
  {
    id: 'kaykit-city-builder-bits',
    sourceUrl: 'https://kaylousberg.itch.io/city-builder-bits',
    license: 'CC0 1.0 (verify LICENSE file)',
    verdict: 'prior-reject-r11',
    note: 'Pre-assembled monoliths — R10/R11 failure class; audit-only reconfirmation',
  },
];

async function main() {
  const pathA = readJson(MANIFESTS.pathA);
  const pathB = readJson(MANIFESTS.pathB);
  const pathC = readJson(MANIFESTS.pathC);
  const pathE = readJson(MANIFESTS.pathE);

  const falsificationRecord = {
    pathA: pathA && {
      sha: pathA.sha,
      changedPct: pathA.pixelDelta?.changedPct,
      mae: pathA.pixelDelta?.mae,
      overallPass: pathA.gates?.pass,
    },
    pathB: pathB && {
      sha: pathB.sha,
      changedPct: pathB.pixelDelta?.changedPct,
      mae: pathB.pixelDelta?.mae,
      proofDc: pathB.diagnostics?.drawCalls,
      overallPass: pathB.gates?.pass,
    },
    pathC: pathC && {
      sha: pathC.sha,
      changedPct: pathC.pixelDelta?.changedPct,
      mae: pathC.pixelDelta?.mae,
      roiMae: pathC.pixelDelta?.learningDiagnostics?.roiMae,
      overallPass: pathC.gates?.pass,
    },
    pathE: pathE && {
      sha: pathE.sha,
      changedPct: pathE.pixelDelta?.changedPct,
      mae: pathE.pixelDelta?.mae,
      roiMae: pathE.pixelDelta?.learningDiagnostics?.roiMae,
      frameOccupancyDelta: pathE.frameOccupancy?.delta,
      engineeringPass: pathE.engineeringPass,
      overallPass: false,
      seniorVerdict: 'FIX_REQUIRED — footprint hypothesis falsified; occupancy flat',
    },
  };

  const audit = {
    generatedAt: new Date().toISOString(),
    planRevision: '15.4',
    supersedesPlanRevision: '15.3.1',
    supersedesReviewSha: 'bc1d41a55b8e03dc4a07d9e6e802fe0cb3563e6f',
    investigationBaseSha: gitSha(),
    seniorDecision: {
      decision: 'FIX_REQUIRED',
      review: 'WF02-R15-SENIOR',
      reviewSha: 'bc1d41a55b8e03dc4a07d9e6e802fe0cb3563e6f',
      nextState: 'PLAN_R15.4_WAITING_FOR_CHATGPT_PLAN_APPROVAL',
      rootCause: 'Authored environment composition at neighborhood scale — not coordinate optimizer/metric/camera',
    },
    falsificationRecord,
    candidateEOccupancyFailure: {
      builtMassDeltaPct: pathE?.frameOccupancy?.delta?.builtMassPct ?? 0,
      vegetationDeltaPct: pathE?.frameOccupancy?.delta?.vegetationPct ?? -0.8,
      meadowPeripheryDeltaPct: pathE?.frameOccupancy?.delta?.meadowPeripheryPct ?? 1.1,
      interpretation: 'Footprint offset changed coordinates but not screen-space mass — hierarchy unchanged',
    },
    rejectedApproaches: [
      'procedural scatter/tint (R4.1)',
      'runtime envelopes (Path A)',
      'additive chunks (Path B)',
      'local replacement only (Candidate C)',
      'footprint coordinate optimization (Candidate E)',
      'standalone camera calibration (Candidate D)',
      'R15.5/R15.6 micro-patches without authored scene',
    ],
    strategies: STRATEGIES,
    externalSourceAudit: EXTERNAL_SOURCE_AUDIT,
    recommendation: {
      primary: 'A-offline-authored-hero-neighborhood-scene',
      fallback: 'B-external-cc0-source-audit',
      stopAlternative: 'C-stop-wf02-visual-rebuild',
      rejected: ['E-production', 'D-standalone', 'procedural-iteration'],
      rationale:
        'Offline authored scene from proven kitbash/flatten pipeline is highest-credibility path within registered CC0 vocabulary. E falsified placement-only hypothesis.',
      stopRecommendation:
        'If Strategy A Phase 0 fails qualitative gate AND Strategy B finds no credible source, recommend Strategy C (explicit Product Owner tradeoff) — not R15.5 micro-patches',
      nextGate: 'PLAN_R15.4 approval → Strategy A scene recipe + import + disposable Phase 0 proof',
    },
    compositionProofPrecommit: {
      camera: { position: [0, 46, 36], target: [0, 0, 4] },
      viewport: { width: 1440, height: 900 },
      qualitativeDecisive: true,
      occupancyDiagnosticOnly: true,
      candidateDForbiddenUntilPass: true,
      noCropGaming: true,
    },
    performanceBudget: {
      overviewDrawCallsMax: 135,
      overviewDrawCallsHardCap: 140,
      streetDrawCallsMax: 100,
      overviewTrianglesMax: 150000,
      reserveDrawCallsMin: 5,
      reserveTrianglesMin: 8000,
      heroSceneMeshHardStop: 12,
    },
    artifactsPresent: {
      pathAManifest: !!pathA,
      pathBManifest: !!pathB,
      pathCManifest: !!pathC,
      pathEManifest: !!pathE,
      planR154: existsSync('Docs/milestones/WF02/PLAN_R15.4.md'),
      r14Baseline: existsSync('Docs/milestones/WF02/01_r14_overview_dawn.png'),
      northStarReference: existsSync('Docs/art-direction/references/god-mode-town-north-star.png'),
    },
  };

  writeFileSync(OUT, JSON.stringify(audit, null, 2));
  console.log('R15.4 authoring pipeline audit written:', OUT);
  console.log(JSON.stringify(audit.recommendation, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
