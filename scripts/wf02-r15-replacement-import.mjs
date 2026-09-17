/**
 * WF02 R15 Candidate C Phase 0 — offline replacement hero-block assemblies.
 * Replaces dominant presentation mass (not additive dressing). Flattened/batched output.
 *
 * Usage: npm run import:wf02-r15-replacement-assemblies
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { URL as NodeURL } from 'node:url';
import { execSync } from 'node:child_process';
import { NodeIO } from '@gltf-transform/core';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Box3, Vector3 } from 'three';
import { isChunkPartExcluded } from './wf02-r15-chunk-exclusion.mjs';

globalThis.self = globalThis;
globalThis.URL = NodeURL;

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSEMBLY_DIR = path.join(ROOT, 'public/assets/glb/wf02/hero-assemblies');
const TEMP_DIR = path.join(ROOT, '.cache/wf02-r15-replacement-assemblies');
const PROVENANCE_OUT = path.join(ROOT, 'Docs/milestones/WF02/r15_replacement_assembly_provenance.json');
const PROOF_MANIFEST_OUT = path.join(
  ROOT,
  'src/rendering/replacementProof/replacementPhase0ProofManifest.json',
);
const LAYOUT_MANIFEST = path.join(ROOT, 'src/rendering/assets/modelLayoutManifest.json');

const io = new NodeIO();
const loader = new GLTFLoader();

const SOURCES = {
  communityHall: 'public/assets/glb/kenney/commercial/community-hall.glb',
  school: 'public/assets/glb/kenney/commercial/school.glb',
  clinic: 'public/assets/glb/kenney/commercial/clinic.glb',
  storeGeneral: 'public/assets/glb/kenney/commercial/store-general.glb',
  workshopIndustrial: 'public/assets/glb/kenney/industrial/workshop-industrial.glb',
  cafeBistro: 'public/assets/glb/kenney/commercial/cafe-bistro.glb',
  homeCottage: 'public/assets/glb/kenney/suburban/home-cottage.glb',
  homeTypeD: 'public/assets/glb/kenney/suburban/home-type-d.glb',
  homeTypeA: 'public/assets/glb/kenney/suburban/home-type-a.glb',
  apartmentBlock: 'public/assets/glb/kenney/suburban/apartment-block.glb',
  treeLarge: 'public/assets/glb/kenney/suburban/tree-large.glb',
  treeSmall: 'public/assets/glb/kenney/suburban/tree-small.glb',
  fenceLow: 'public/assets/glb/kenney/suburban/fence-low.glb',
  pathStonesShort: 'public/assets/glb/kenney/suburban/path-stones-short.glb',
  pathStonesMessy: 'public/assets/glb/kenney/suburban/path-stones-messy.glb',
  pathLong: 'public/assets/glb/kenney/suburban/path-long.glb',
  planter: 'public/assets/glb/kenney/suburban/planter.glb',
  detailAwning: 'public/assets/glb/kenney/commercial/detail-awning.glb',
  detailParasol: 'public/assets/glb/kenney/commercial/detail-parasol-a.glb',
};

const SOURCE_URL = Object.fromEntries(
  Object.entries(SOURCES).map(([k, v]) => [k, `/assets/glb/${v.replace('public/assets/glb/', '')}`]),
);

const ASSEMBLY_ANCHORS = {
  west: { x: 0, y: 0, z: 4 },
  east: { x: 8, y: 0, z: 6 },
};

function abs(rel) {
  return path.join(ROOT, rel);
}

function pushPart(out, assemblyId, srcKey, wx, wz, scale, rotY = 0, buildingMargin = 0.85) {
  if (isChunkPartExcluded(wx, wz, buildingMargin)) return;
  const anchor = ASSEMBLY_ANCHORS[assemblyId];
  out.push({
    src: SOURCES[srcKey],
    sourceKey: srcKey,
    name: `${assemblyId}-${out.length}.glb`,
    t: [wx - anchor.x, 0, wz - anchor.z],
    s: [scale, scale, scale],
    r: rotY,
    world: { x: wx, z: wz },
  });
}

function generateWestParts() {
  const parts = [];

  pushPart(parts, 'west', 'communityHall', -14, -18, 2.2);
  pushPart(parts, 'west', 'school', -8, -16, 1.8, 0.2);
  pushPart(parts, 'west', 'clinic', -20, -14, 1.5, -0.15);
  pushPart(parts, 'west', 'detailParasol', -6, -12, 1.6);
  pushPart(parts, 'west', 'homeCottage', 16, -4, 2.0);
  pushPart(parts, 'west', 'homeTypeD', -16, -4, 1.9, 0.1);
  pushPart(parts, 'west', 'homeTypeA', -22, -2, 1.7, -0.3);
  pushPart(parts, 'west', 'apartmentBlock', -10, 2, 1.6, 0.4);

  for (let x = -26; x <= 10; x += 2.0) {
    pushPart(parts, 'west', 'pathStonesMessy', x, -10, 2.5, x * 0.05);
    pushPart(parts, 'west', 'pathStonesShort', x, -8.5, 2.2, x * 0.03);
  }
  for (let x = -28; x <= 12; x += 1.6) {
    pushPart(parts, 'west', 'treeLarge', x, -20, 2.6, x * 0.04);
    pushPart(parts, 'west', 'treeSmall', x, -17, 2.2);
  }
  for (let z = -18; z <= 18; z += 2.0) {
    pushPart(parts, 'west', 'treeLarge', -28, z, 2.5, Math.PI / 2);
    pushPart(parts, 'west', 'fenceLow', -26, z, 2.0, z * 0.02);
    if (z % 4 === 0) pushPart(parts, 'west', 'planter', -24, z + 0.8, 1.8);
  }
  for (let z = -8; z <= 14; z += 2.5) {
    pushPart(parts, 'west', 'treeSmall', 20, z, 2.3, 0.1);
    pushPart(parts, 'west', 'fenceLow', 18, z, 1.9, 0.05);
  }

  return parts;
}

function generateEastParts() {
  const parts = [];

  pushPart(parts, 'east', 'storeGeneral', -14, 14, 2.4);
  pushPart(parts, 'east', 'workshopIndustrial', 4, 14, 2.2);
  pushPart(parts, 'east', 'cafeBistro', 16, 14, 2.0);
  pushPart(parts, 'east', 'detailAwning', -14, 12, 2.0);
  pushPart(parts, 'east', 'clinic', 14, -18, 1.6, 0.25);

  for (let x = -16; x <= 18; x += 2.2) {
    pushPart(parts, 'east', 'pathLong', x, 10, 2.4, 0);
    pushPart(parts, 'east', 'pathStonesMessy', x, 8, 2.0, x * 0.02);
  }
  for (let x = -12; x <= 20; x += 1.8) {
    pushPart(parts, 'east', 'treeLarge', x, 18, 2.7, x * 0.03);
    pushPart(parts, 'east', 'treeSmall', x, 16, 2.3);
  }
  for (let z = -14; z <= 20; z += 2.0) {
    pushPart(parts, 'east', 'treeLarge', 22, z, 2.6, 0.15);
    pushPart(parts, 'east', 'treeSmall', 24, z, 2.2, 0.2);
    if (z % 3 === 0) pushPart(parts, 'east', 'planter', 20, z, 1.7);
  }
  for (let z = 0; z <= 22; z += 2.5) {
    pushPart(parts, 'east', 'fenceLow', -6, z, 2.0, 0.1);
    pushPart(parts, 'east', 'pathStonesShort', -4, z, 1.8, z * 0.04);
  }

  return parts;
}

async function writeShiftedPart(sourceRel, tempName, translation, scale, rotationY = 0) {
  const doc = await io.read(abs(sourceRel));
  const scene = doc.getRoot().listScenes()[0];
  for (const node of scene.listChildren()) {
    node.setTranslation(translation);
    node.setScale(Array.isArray(scale) ? scale : [scale, scale, scale]);
    if (rotationY !== 0) {
      node.setRotation([0, Math.sin(rotationY / 2), 0, Math.cos(rotationY / 2)]);
    }
  }
  const out = path.join(TEMP_DIR, tempName);
  await io.write(out, doc);
  return out;
}

async function mergeParts(tempFiles, outPath) {
  const args = [...tempFiles, outPath, '--merge-scenes'].map((p) => JSON.stringify(p)).join(' ');
  execSync(`npx --yes @gltf-transform/cli merge ${args}`, { stdio: 'inherit' });
}

async function flattenAndJoin(inputPath, outputPath) {
  const flatPath = inputPath.replace('.glb', '.flat.glb');
  const joinedPath = inputPath.replace('.glb', '.joined.glb');
  execSync(
    `npx --yes @gltf-transform/cli flatten ${JSON.stringify(inputPath)} ${JSON.stringify(flatPath)}`,
    { stdio: 'inherit' },
  );
  execSync(
    `npx --yes @gltf-transform/cli join ${JSON.stringify(flatPath)} ${JSON.stringify(joinedPath)}`,
    { stdio: 'inherit' },
  );
  execSync(
    `npx --yes @gltf-transform/cli flatten ${JSON.stringify(joinedPath)} ${JSON.stringify(outputPath)}`,
    { stdio: 'inherit' },
  );
}

async function measureGlb(filePath) {
  const buf = readFileSync(filePath);
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  const gltf = await new Promise((resolve, reject) => {
    loader.parse(ab, '', resolve, reject);
  });
  const box = new Box3().setFromObject(gltf.scene);
  const size = box.getSize(new Vector3());
  let triangles = 0;
  let meshCount = 0;
  let materialCount = 0;
  const materials = new Set();
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
  return {
    min: [box.min.x, box.min.y, box.min.z],
    max: [box.max.x, box.max.y, box.max.z],
    size: [size.x, size.y, size.z],
    triangles: Math.round(triangles),
    meshCount,
    materialCount,
  };
}

const ASSEMBLY_RECIPES = [
  {
    assemblyId: 'hero-replacement-west',
    fileName: 'wf02-hero-replacement-west.glb',
    anchor: ASSEMBLY_ANCHORS.west,
    generate: generateWestParts,
  },
  {
    assemblyId: 'hero-replacement-east',
    fileName: 'wf02-hero-replacement-east.glb',
    anchor: ASSEMBLY_ANCHORS.east,
    generate: generateEastParts,
  },
];

async function main() {
  mkdirSync(ASSEMBLY_DIR, { recursive: true });
  mkdirSync(TEMP_DIR, { recursive: true });
  rmSync(TEMP_DIR, { recursive: true, force: true });
  mkdirSync(TEMP_DIR, { recursive: true });

  const layoutManifest = JSON.parse(readFileSync(LAYOUT_MANIFEST, 'utf8'));
  const provenanceAssemblies = {};
  const proofAssemblies = [];

  for (const recipe of ASSEMBLY_RECIPES) {
    const parts = recipe.generate();
    console.log(`Kitbash ${recipe.assemblyId} (${parts.length} parts)…`);
    if (parts.length < 25) {
      throw new Error(`${recipe.assemblyId} has only ${parts.length} parts — expected dense replacement mass`);
    }

    const tempFiles = [];
    const sourceMeshes = new Set();
    for (const part of parts) {
      sourceMeshes.add(SOURCE_URL[part.sourceKey]);
      tempFiles.push(await writeShiftedPart(part.src, part.name, part.t, part.s, part.r ?? 0));
    }

    const mergedPath = path.join(TEMP_DIR, `${recipe.assemblyId}-merged.glb`);
    await mergeParts(tempFiles, mergedPath);

    const outPath = path.join(ASSEMBLY_DIR, recipe.fileName);
    await flattenAndJoin(mergedPath, outPath);

    const bounds = await measureGlb(outPath);
    if (bounds.meshCount > 3) {
      console.warn(
        `  WARN: ${recipe.assemblyId} has ${bounds.meshCount} meshes after flatten (target ≤3); continuing if hero-block total ≤12`,
      );
    }

    const assetUrl = `/assets/glb/wf02/hero-assemblies/${recipe.fileName}`;
    layoutManifest[assetUrl] = bounds;
    provenanceAssemblies[recipe.assemblyId] = {
      license: 'CC0 1.0 Universal (Kenney derivative)',
      sourceUrl: 'https://kenney.nl/assets',
      sourceMeshes: [...sourceMeshes],
      partCount: parts.length,
      measuredBounds: bounds,
      flattenPipeline: 'merge → flatten → join',
    };

    proofAssemblies.push({
      assemblyId: recipe.assemblyId,
      fileName: recipe.fileName,
      assetUrl,
      anchor: recipe.anchor,
      bounds,
      partCount: parts.length,
      meshCount: bounds.meshCount,
      materialCount: bounds.materialCount,
    });

    console.log(
      `  → ${bounds.triangles} tris, ${bounds.meshCount} meshes, ${bounds.materialCount} materials`,
    );
  }

  const provenance = {
    generatedAt: new Date().toISOString(),
    planRevision: 15.2,
    authorization: 'CANDIDATE_C_PHASE_0_ONLY',
    integrationMode: 'C-replacement-hero-assembly',
    assemblyCount: proofAssemblies.length,
    totalAssemblyTriangles: proofAssemblies.reduce((s, a) => s + a.bounds.triangles, 0),
    totalMeshCount: proofAssemblies.reduce((s, a) => s + a.meshCount, 0),
    assemblies: provenanceAssemblies,
  };

  const proofManifest = {
    planRevision: 15.2,
    phase: 0,
    authorization: 'CANDIDATE_C_PHASE_0_ONLY',
    integrationMode: 'C-replacement-hero-assembly',
    suppressLayers: [
      'PrototypeShellLayer',
      'WorldLabGroundTint',
      'VegetationFrame',
      'ResidentialGardens',
      'FutureLotFrame',
      'CivicEnclosure',
      'CommercialFrontage',
      'ModularAssemblyLayer',
    ],
    assemblies: proofAssemblies,
    doorSocketLabels: ['home-door', 'store-door', 'workshop-door'],
    heroBlockDrawBudget: { hardStop: 12, target: 6 },
  };

  writeFileSync(PROVENANCE_OUT, JSON.stringify(provenance, null, 2));
  writeFileSync(PROOF_MANIFEST_OUT, JSON.stringify(proofManifest, null, 2));
  writeFileSync(LAYOUT_MANIFEST, JSON.stringify(layoutManifest, null, 2));

  console.log('\nReplacement assembly import complete.');
  console.log(`  assemblies: ${proofAssemblies.length}`);
  console.log(`  total tris: ${provenance.totalAssemblyTriangles}`);
  console.log(`  total meshes: ${provenance.totalMeshCount}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
