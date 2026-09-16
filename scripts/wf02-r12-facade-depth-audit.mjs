/**
 * WF02 R12 Plan Phase 0 — read-only facade-depth audit of Kenney Modular Buildings.
 * Does NOT import assets. Writes plan artifact for PLAN_R12.md approval gate.
 *
 * Usage: npm run audit:wf02-r12-facade-depth
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { URL as NodeURL } from 'node:url';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Box3, Vector3 } from 'three';

globalThis.self = globalThis;
globalThis.URL = NodeURL;

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const R11_AUDIT = path.join(ROOT, 'Docs/milestones/WF02/r11_modular_audit.json');
const OUT = path.join(ROOT, 'Docs/milestones/WF02/r12_facade_depth_audit_plan.json');

const SOURCE_ZIP_DIR =
  process.env.KENNEY_MODULAR_SRC ?? '/tmp/kenney-modular/Models/GLB format';

/** R12 plan — depth-capable candidates from same Kenney pack (import only after approval). */
const R12_CANDIDATE_MODULES = [
  'building-window-balcony.glb',
  'building-window-large-left.glb',
  'building-window-large-middle.glb',
  'building-window-large-right.glb',
  'building-steps-narrow-windows.glb',
  'building-steps-narrow-windows-round.glb',
  'building-corner-window-top-round.glb',
  'building-windows-high-middle.glb',
  'building-windows-high-top-round.glb',
  'roof-flat-detail-a.glb',
  'roof-flat-detail-b.glb',
  'roof-slanted-detail.glb',
  'roof-slanted-window.glb',
  'detail-ac-a.glb',
  'detail-ac-b.glb',
];

/** Reference finished forms — disassembly guides only; not runtime monolith imports. */
const REFERENCE_SAMPLES = [
  'building-sample-house-a.glb',
  'building-sample-house-b.glb',
  'building-sample-house-c.glb',
  'building-sample-tower-a.glb',
];

function findSourceDir() {
  if (existsSync(SOURCE_ZIP_DIR)) return SOURCE_ZIP_DIR;
  const alt = path.join(ROOT, '.cache/kenney-modular/Models/GLB format');
  if (existsSync(alt)) return alt;
  throw new Error(
    'Kenney modular source not found. Extract kenney_modular-buildings.zip to /tmp/kenney-modular or set KENNEY_MODULAR_SRC',
  );
}

const loader = new GLTFLoader();

async function measureGlb(filePath) {
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
    min: [box.min.x, box.min.y, box.min.z],
    max: [box.max.x, box.max.y, box.max.z],
    size: [size.x, size.y, size.z],
    triangles: Math.round(triangles),
  };
}

function classifyDepth(bounds) {
  const depthZ = bounds.size[2];
  const heightY = bounds.size[1];
  if (depthZ >= 1.15) return 'strong-projection';
  if (depthZ >= 1.05) return 'moderate-projection';
  if (depthZ > 1.01) return 'shallow-projection';
  return 'coplanar';
}

async function main() {
  const srcDir = findSourceDir();
  const r11 = JSON.parse(readFileSync(R11_AUDIT, 'utf8'));
  const r11Ids = new Set(Object.keys(r11.modules));

  const importedAudit = {};
  for (const [moduleId, meta] of Object.entries(r11.modules)) {
    importedAudit[moduleId] = {
      ...meta,
      depthClass: classifyDepth(meta.bounds),
      facadeDepthM: meta.bounds.size[2],
    };
  }

  const candidates = {};
  let candidateTris = 0;
  for (const file of R12_CANDIDATE_MODULES) {
    const src = path.join(srcDir, file);
    if (!existsSync(src)) {
      candidates[file.replace(/\.glb$/, '')] = { missing: true };
      continue;
    }
    const bounds = await measureGlb(src);
    const moduleId = file.replace(/\.glb$/, '');
    candidates[moduleId] = {
      moduleId,
      alreadyImported: r11Ids.has(moduleId),
      bounds,
      depthClass: classifyDepth(bounds),
      facadeDepthM: bounds.size[2],
      triangles: bounds.triangles,
    };
    candidateTris += bounds.triangles;
  }

  const references = {};
  for (const file of REFERENCE_SAMPLES) {
    const src = path.join(srcDir, file);
    if (!existsSync(src)) continue;
    const bounds = await measureGlb(src);
    references[file.replace(/\.glb$/, '')] = {
      bounds,
      triangles: bounds.triangles,
      note: 'Disassembly reference only — do not import as runtime monolith in R12',
    };
  }

  const depthCapableImported = Object.values(importedAudit).filter(
    (m) => m.depthClass !== 'coplanar',
  );
  const depthCapableCandidates = Object.values(candidates).filter(
    (m) => m.depthClass && m.depthClass !== 'coplanar',
  );

  const report = {
    generatedAt: new Date().toISOString(),
    planRevision: 12,
    sourceUrl: 'https://kenney.nl/assets/modular-buildings',
    license: 'CC0 1.0 Universal',
    r11ImportedCount: r11.moduleCount,
    r11CoplanarCount: Object.values(importedAudit).filter((m) => m.depthClass === 'coplanar')
      .length,
    r11DepthCapableImported: depthCapableImported.map((m) => ({
      moduleId: m.moduleId,
      depthClass: m.depthClass,
      facadeDepthM: m.facadeDepthM,
      triangles: m.bounds.triangles,
    })),
    r12CandidateModules: candidates,
    r12CandidateTriangleBudget: candidateTris,
    r12RecommendedImportCap: 12,
    referenceSamples: references,
    missingForms: [
      'continuous storefront triple-window bay (requires window-large L/M/R)',
      'second-floor balcony rhythm (requires building-window-balcony)',
      'porch/stoop with side windows (requires building-steps-narrow-windows*)',
      'civic corner tower cap (requires corner-window-top-round + tower sample disassembly)',
      'roof parapet/AC silhouette (requires roof-flat-detail-* + detail-ac-*)',
      'dormer/window-on-roof mass (requires roof-slanted-window)',
    ],
    complementaryFamilyFallback: {
      required: false,
      condition:
        'Only if Kenney pack candidates fail visual DoD after authored assembly rewrite',
      proposal: 'Reversible offline kitbash: merge ≤4 Kenney depth modules into 2 authored porch/bay GLBs with warm colormap — no new license',
      externalCc0Family: 'Hold — Kenney same-pack expansion preferred first',
    },
  };

  writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Wrote ${OUT}`);
  console.log(
    `R11 depth-capable: ${depthCapableImported.length}/${r11.moduleCount}; R12 candidates measured: ${Object.keys(candidates).length}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
