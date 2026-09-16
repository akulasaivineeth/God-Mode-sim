/**
 * WF02 R13 Plan Phase 0 — architecture source strategy audit (read-only).
 * Compares Path A (modular), Path B (prefab family), Path C (offline kitbash shells).
 *
 * Usage: npm run audit:wf02-r13-architecture-source
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
const OUT = path.join(ROOT, 'Docs/milestones/WF02/r13_architecture_source_audit_plan.json');
const R12_MANIFEST = path.join(ROOT, 'Docs/milestones/WF02/r12_prototype_manifest.json');
const MODULAR_SRC =
  process.env.KENNEY_MODULAR_SRC ?? '/tmp/kenney-modular/Models/GLB format';

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
    bounds: {
      min: [box.min.x, box.min.y, box.min.z],
      max: [box.max.x, box.max.y, box.max.z],
      size: [size.x, size.y, size.z],
      triangles: Math.round(triangles),
    },
    heightM: size.y,
    widthM: size.x,
    depthM: size.z,
    triangles: Math.round(triangles),
  };
}

const PATH_A = {
  id: 'A-modular-assembly',
  label: 'Continue Kenney Modular Buildings cell assembly',
  verdict: 'reject',
  r11Result: 'FIX_REQUIRED @ 4658dd2 — flat tan wall grids',
  r12Result: 'FIX_REQUIRED @ ab4a8d2 — visually indistinguishable from R11 at Overview/civic',
  moduleCount: 30,
  estimatedPrototypeInstances: 400,
  silhouetteClass: 'coplanar-wall-dominant',
  northStarFit: 'poor',
};

const REGISTERED_PREFABS = [
  {
    role: 'civic-candidate',
    path: 'public/assets/glb/kenney/commercial/community-hall.glb',
    license: 'CC0',
  },
  {
    role: 'civic-alt',
    path: 'public/assets/glb/kenney/commercial/school.glb',
    license: 'CC0',
  },
  {
    role: 'commercial-store',
    path: 'public/assets/glb/kenney/commercial/store-general.glb',
    license: 'CC0',
  },
  {
    role: 'commercial-workshop',
    path: 'public/assets/glb/kenney/industrial/workshop-industrial.glb',
    license: 'CC0',
  },
  {
    role: 'commercial-cafe',
    path: 'public/assets/glb/kenney/commercial/cafe-bistro.glb',
    license: 'CC0',
  },
  {
    role: 'residential-home1',
    path: 'public/assets/glb/kenney/suburban/home-cottage.glb',
    license: 'CC0',
  },
  {
    role: 'residential-home2',
    path: 'public/assets/glb/kenney/suburban/home-type-a.glb',
    license: 'CC0',
  },
];

const KITBASH_SOURCES = [
  'building-sample-house-a.glb',
  'building-sample-house-b.glb',
  'building-sample-house-c.glb',
  'building-sample-tower-a.glb',
  'community-hall.glb (City Kit mesh extract)',
  'store-general.glb + detail-awning.glb (City Kit merge)',
];

const PROPOSED_SHELLS = [
  {
    shellId: 'wf02-civic-enclosure-shell',
    role: 'civic-enclosure-edge',
    sourceDisassembly: ['building-sample-tower-a', 'building-sample-house-c wing', 'steps-narrow-windows-round bake'],
    targetFootprintM: '18×6',
    targetHeightM: 6.5,
    estimatedTris: 1200,
  },
  {
    shellId: 'wf02-commercial-frontage-shell',
    role: 'commercial-frontage-3bay',
    sourceDisassembly: ['building-sample-house-c wide facade', 'store-general door bay', 'awning bake'],
    targetFootprintM: '34×5',
    targetHeightM: 5.5,
    estimatedTris: 1800,
  },
  {
    shellId: 'wf02-residential-cottage-shell',
    role: 'residential-house-1',
    sourceDisassembly: ['building-sample-house-a'],
    targetFootprintM: '6×5',
    targetHeightM: 4.5,
    estimatedTris: 450,
  },
  {
    shellId: 'wf02-residential-gable-shell',
    role: 'residential-house-2',
    sourceDisassembly: ['building-sample-house-b'],
    targetFootprintM: '7×6',
    targetHeightM: 6.0,
    estimatedTris: 500,
  },
];

async function main() {
  const prefabMeasures = {};
  for (const entry of REGISTERED_PREFABS) {
    const full = path.join(ROOT, entry.path);
    if (!existsSync(full)) {
      prefabMeasures[entry.role] = { missing: true };
      continue;
    }
    prefabMeasures[entry.role] = {
      ...entry,
      ...(await measureGlb(full)),
    };
  }

  const sampleMeasures = {};
  for (const file of [
    'building-sample-house-a.glb',
    'building-sample-house-b.glb',
    'building-sample-house-c.glb',
    'building-sample-tower-a.glb',
  ]) {
    const src = path.join(MODULAR_SRC, file);
    if (!existsSync(src)) {
      sampleMeasures[file.replace(/\.glb$/, '')] = { missing: true };
      continue;
    }
    sampleMeasures[file.replace(/\.glb$/, '')] = await measureGlb(src);
  }

  let r12Perf = null;
  if (existsSync(R12_MANIFEST)) {
    const m = JSON.parse(readFileSync(R12_MANIFEST, 'utf8'));
    const dawn = m.shots?.find((s) => s.name === '01_r12_overview_dawn');
    const street = m.shots?.find((s) => s.name === '06_r12_street_portal');
    r12Perf = {
      overviewDc: dawn?.diagnostics?.drawCalls,
      overviewTris: dawn?.diagnostics?.triangles,
      streetDc: street?.diagnostics?.drawCalls,
      streetTris: street?.diagnostics?.triangles,
    };
  }

  const PATH_B = {
    id: 'B-prefab-family',
    label: 'Kenney City Kit finished prefab shells (already registered)',
    verdict: 'reject-for-prototypes',
    r10Result: 'FIX_REQUIRED @ 9c64b9c — disconnected boxes; no continuous frontage/civic enclosure',
    measuredPrefabs: prefabMeasures,
    silhouetteClass: 'finished-monolith-low-rise',
    northStarFit: 'partial — individual reads OK; 3-bay continuity and civic landmark FAIL without merge',
    note: 'Repeats R10 failure class for commercial continuity and civic enclosure at prototype fidelity',
  };

  const PATH_C = {
    id: 'C-offline-kitbash-shells',
    label: 'Bounded offline-authored prototype shells (CC0 Kenney sources only)',
    verdict: 'recommend',
    kitbashSources: KITBASH_SOURCES,
    sampleReferenceMeasures: sampleMeasures,
    proposedShells: PROPOSED_SHELLS,
    estimatedTotalShellTris: PROPOSED_SHELLS.reduce((s, x) => s + x.estimatedTris, 0),
    silhouetteClass: 'authored-finished-form',
    northStarFit: 'best-available-within-license-pipeline',
    license: 'CC0 1.0 — derivative meshes from approved Kenney packs only; no external import',
    rollback: 'WORLD_LAB_PROTOTYPE_SHELL=false restores R12 modular assemblies',
  };

  const report = {
    generatedAt: new Date().toISOString(),
    planRevision: 13,
    investigationBaseSha: 'ab4a8d2a68be55af47d4a042a9d3a63a03d0702b',
    r12Performance: r12Perf,
    strategyComparison: [PATH_A, PATH_B, PATH_C],
    recommendation: {
      selectedPath: 'C-offline-kitbash-shells',
      rationale: [
        'Path A exhausted: R11+R12 consecutive prototype visual FAIL with same modular assembly method',
        'Path B insufficient: registered City Kit prefabs already failed R10 continuous frontage and civic enclosure reads',
        'Path C merges finished-form reference meshes (modular sample houses/tower + selective City Kit extracts) into 4 authored shell GLBs with warm colormap — silhouette-first, not cell stacking',
      ],
      rejectedPaths: ['A-modular-assembly', 'B-prefab-family'],
      externalFamilyHold: 'KayKit and other non-Kenney families remain HOLD unless ChatGPT explicitly approves after Path C prototype FAIL',
    },
    doorHeightTargets: {
      visualDoorHeightM: 2.32,
      simCitizenHeightM: 1.8,
      note: 'Shell door sockets must align to frozen sim entrances within 0.3 m',
    },
    performanceBudget: {
      overviewDcHardCap: 140,
      overviewTrisHardCap: 150000,
      streetDcHardCap: 100,
      shellPrototypeDcEstimate: '4 shells + props ≤ 12 DC vs R12 ~400 instanced modules',
      m03HeadroomNote: 'Shell path preserves ≥50k Overview tri slack; M03 still requires citizen LOD/culling',
    },
  };

  writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Wrote ${OUT}`);
  console.log(`Recommendation: ${report.recommendation.selectedPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
