/**
 * WF02 R7.1 Phase 0 — write handoff manifest (metadata only).
 *
 * Pins pixel evidence at phase0EvidenceSha. Authoritative handoff identity is the
 * full 40-char git rev-parse HEAD cited in [GOD-MODE:BUILDER] (not embedded here —
 * embedding it would desync on every metadata commit).
 *
 * Usage: node scripts/wf02-r71-phase0-manifest.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(ROOT, '..');
const OUT_DIR = path.join(REPO, 'Docs/milestones/WF02');
const MANIFEST_PATH = path.join(OUT_DIR, 'phase0_manifest_r71.json');

const PHASE0_EVIDENCE_SHA = '107df225ee70d4358a06462e1dbc2dfe797b4f30';

const PHASE0_ARTIFACT_HASHES = [
  'compare_r6_prototype_northstar_r71.png',
  'composition_map_r71.svg',
  'prototype_angled_r71.png',
  'prototype_overview_r71.png',
  'r6_failure_overlay_r71.svg',
  'visual_layout_audit_r71.json',
];

function sha256File(abs) {
  return createHash('sha256').update(readFileSync(abs)).digest('hex');
}

function main() {
  const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: REPO, encoding: 'utf8' }).trim();

  const artifactManifest = PHASE0_ARTIFACT_HASHES.map((rel) => {
    const abs = path.join(OUT_DIR, rel);
    if (!existsSync(abs)) throw new Error(`Missing Phase 0 artifact: ${rel}`);
    return { path: `Docs/milestones/WF02/${rel}`, sha256: sha256File(abs) };
  });

  const existing = existsSync(MANIFEST_PATH)
    ? JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'))
    : {};

  const manifest = {
    phase: existing.phase ?? '0b',
    baseSha: existing.baseSha,
    cameras: existing.cameras,
    visualMappings: existing.visualMappings,
    verticalLayerDecision: existing.verticalLayerDecision,
    review: 'WF02-R71-PHASE0',
    phase0EvidenceSha: PHASE0_EVIDENCE_SHA,
    branch,
    state: 'PHASE_0_COMPLETE_STOP',
    networkErrors: 0,
    assetImports: existing.assetImports ?? { phase0: 0, proposedPhase2: 5 },
    artifactManifest,
    verify: {
      command: 'git rev-parse HEAD',
      note: '[GOD-MODE:BUILDER] must cite the full 40-char output as authoritative PR head.',
    },
    generatedAt: new Date().toISOString(),
  };

  writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);

  const protoPath = path.join(OUT_DIR, 'COMPOSITION_PROTOTYPE_R71.md');
  let proto = readFileSync(protoPath, 'utf8');
  const headLine =
    '**Canonical PR head:** full 40-char `git rev-parse HEAD` on branch `cursor/wf02-scale-calibration-754a` (cite in [GOD-MODE:BUILDER])  ';
  if (proto.includes('**Canonical PR head:**')) {
    proto = proto.replace(/\*\*Canonical PR head:\*\*[^\n]*\n/, `${headLine}\n`);
  } else {
    proto = proto.replace('**Cameras frozen:**', `${headLine}\n**Cameras frozen:**`);
  }
  writeFileSync(protoPath, proto);

  const auditPath = path.join(OUT_DIR, 'KENNEY_INVENTORY_AUDIT_R71.md');
  let audit = readFileSync(auditPath, 'utf8');
  const genLine = `**Generated:** Phase 0 metadata @ evidence \`${PHASE0_EVIDENCE_SHA}\`  `;
  if (audit.includes('**Generated:** Phase 0')) {
    audit = audit.replace(/\*\*Generated:\*\* Phase 0[^\n]*\n/, `${genLine}\n`);
  } else {
    audit = audit.replace('**Scope:**', `${genLine}\n**Scope:**`);
  }
  writeFileSync(auditPath, audit);

  const handoffSha = execSync('git rev-parse HEAD', { cwd: REPO, encoding: 'utf8' }).trim();
  console.log(`builderHandoffSha=${handoffSha}`);
  console.log(`phase0EvidenceSha=${PHASE0_EVIDENCE_SHA}`);
  console.log(`Wrote ${MANIFEST_PATH}`);
}

main();
