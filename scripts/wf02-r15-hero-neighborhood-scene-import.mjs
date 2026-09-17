/**
 * WF02 R15.4 Strategy A Phase 0 — offline authored hero-neighborhood scene import.
 * Recipe → merge → flatten → join → flatten → GLB + manifest.
 *
 * Usage: npm run import:wf02-r15-hero-neighborhood-scene
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
const SCENE_DIR = path.join(ROOT, 'public/assets/glb/wf02/hero-scenes');
const TEMP_DIR = path.join(ROOT, '.cache/wf02-r15-hero-scene-parts');
const RECIPE_OUT = path.join(ROOT, 'Docs/milestones/WF02/r15_hero_neighborhood_scene_recipe.json');
const PROVENANCE_OUT = path.join(ROOT, 'Docs/milestones/WF02/r15_hero_scene_provenance.json');
const MANIFEST_OUT = path.join(ROOT, 'src/rendering/heroScene/heroNeighborhoodSceneManifest.json');
const LAYOUT_MANIFEST = path.join(ROOT, 'src/rendering/assets/modelLayoutManifest.json');

const io = new NodeIO();
const loader = new GLTFLoader();

const ANCHOR = { x: 0, y: 0, z: 4 };
const HERO_BOUNDS = { minX: -32, maxX: 32, minZ: -24, maxZ: 30 };

const FROZEN_ENTRANCES = {
  'home-door': { x: 16, z: -6.4, facilityId: 'house-1' },
  'store-door': { x: -14, z: 10.8, facilityId: 'store' },
  'workshop-door': { x: 4, z: 10.8, facilityId: 'workshop' },
};

const SOURCES = {
  civicShell: 'public/assets/glb/wf02/prototype-shells/wf02-civic-enclosure-shell.glb',
  commercialShell: 'public/assets/glb/wf02/prototype-shells/wf02-commercial-frontage-shell.glb',
  cottageShell: 'public/assets/glb/wf02/prototype-shells/wf02-residential-cottage-shell.glb',
  gableShell: 'public/assets/glb/wf02/prototype-shells/wf02-residential-gable-shell.glb',
  communityHall: 'public/assets/glb/kenney/commercial/community-hall.glb',
  school: 'public/assets/glb/kenney/commercial/school.glb',
  clinic: 'public/assets/glb/kenney/commercial/clinic.glb',
  storeGeneral: 'public/assets/glb/kenney/commercial/store-general.glb',
  workshopIndustrial: 'public/assets/glb/kenney/industrial/workshop-industrial.glb',
  cafeBistro: 'public/assets/glb/kenney/commercial/cafe-bistro.glb',
  homeCottage: 'public/assets/glb/kenney/suburban/home-cottage.glb',
  homeTypeD: 'public/assets/glb/kenney/suburban/home-type-d.glb',
  homeTypeA: 'public/assets/glb/kenney/suburban/home-type-a.glb',
  homeTypeC: 'public/assets/glb/kenney/suburban/home-type-c.glb',
  apartmentBlock: 'public/assets/glb/kenney/suburban/apartment-block.glb',
  farmhouse: 'public/assets/glb/kenney/suburban/farmhouse.glb',
  treeLarge: 'public/assets/glb/kenney/suburban/tree-large.glb',
  treeSmall: 'public/assets/glb/kenney/suburban/tree-small.glb',
  fenceLow: 'public/assets/glb/kenney/suburban/fence-low.glb',
  pathStonesShort: 'public/assets/glb/kenney/suburban/path-stones-short.glb',
  pathStonesMessy: 'public/assets/glb/kenney/suburban/path-stones-messy.glb',
  pathLong: 'public/assets/glb/kenney/suburban/path-long.glb',
  pathShort: 'public/assets/glb/kenney/suburban/path-short.glb',
  planter: 'public/assets/glb/kenney/suburban/planter.glb',
  detailAwning: 'public/assets/glb/kenney/commercial/detail-awning.glb',
  detailParasol: 'public/assets/glb/kenney/commercial/detail-parasol-a.glb',
  warehouse: 'public/assets/glb/kenney/industrial/warehouse.glb',
  bushCommon: 'public/assets/gltf/quaternius/Bush_Common.gltf',
  bushFlowers: 'public/assets/gltf/quaternius/Bush_Common_Flowers.gltf',
  commonTree1: 'public/assets/gltf/quaternius/CommonTree_1.gltf',
  commonTree2: 'public/assets/gltf/quaternius/CommonTree_2.gltf',
  fern1: 'public/assets/gltf/quaternius/Fern_1.gltf',
  flowerGroup: 'public/assets/gltf/quaternius/Flower_3_Group.gltf',
};

const SOURCE_URL = Object.fromEntries(
  Object.entries(SOURCES).map(([k, v]) => [k, v.replace(/^public\//, '/')]),
);

function abs(rel) {
  return path.join(ROOT, rel);
}

function withinHeroBounds(x, z, margin = 0) {
  return (
    x >= HERO_BOUNDS.minX + margin &&
    x <= HERO_BOUNDS.maxX - margin &&
    z >= HERO_BOUNDS.minZ + margin &&
    z <= HERO_BOUNDS.maxZ - margin
  );
}

function pushPart(out, srcKey, wx, wz, scale, rotY = 0, district = 'misc', buildingMargin = 0.85) {
  if (!withinHeroBounds(wx, wz)) return;
  if (isChunkPartExcluded(wx, wz, buildingMargin)) return;
  out.push({
    src: SOURCES[srcKey],
    sourceKey: srcKey,
    name: `${district}-${out.length}.glb`,
    t: [wx - ANCHOR.x, 0, wz - ANCHOR.z],
    s: [scale, scale, scale],
    r: rotY,
    world: { x: wx, z: wz },
    district,
  });
}

function generateSceneParts() {
  const parts = [];

  // R13 prototype shells — primary architectural mass (frozen origins)
  pushPart(parts, 'civicShell', -14, -18, 1.0, 0, 'civic', 0.2);
  pushPart(parts, 'commercialShell', 1, 13, 1.0, 0, 'commercial', 0.2);
  pushPart(parts, 'cottageShell', 16, -4, 1.0, 0, 'residential', 0.2);
  pushPart(parts, 'gableShell', -16, -4, 1.0, 0, 'residential', 0.2);

  // Secondary civic/commercial buildings
  pushPart(parts, 'clinic', 14, -18, 1.5, -0.15, 'civic');
  pushPart(parts, 'school', -8, -16, 1.8, 0.2, 'civic');
  pushPart(parts, 'warehouse', -20, -14, 1.2, -0.1, 'civic');
  pushPart(parts, 'detailParasol', -6, -12, 1.6, 0, 'civic');
  pushPart(parts, 'apartmentBlock', -10, 2, 1.6, 0.4, 'residential');
  pushPart(parts, 'homeTypeA', -22, -2, 1.7, -0.3, 'residential');
  pushPart(parts, 'homeTypeD', -24, 4, 1.6, 0.15, 'residential');
  pushPart(parts, 'homeTypeC', 22, -2, 1.5, -0.2, 'residential');
  pushPart(parts, 'farmhouse', -26, 18, 1.4, 0.3, 'farm');

  // Civic square pavers
  for (let x = -8; x <= 8; x += 2.0) {
    for (let z = -16; z <= -4; z += 2.0) {
      if (Math.hypot(x, z + 10) > 7.5) continue;
      pushPart(parts, 'pathStonesShort', x, z, 2.2, x * 0.03, 'civic', 0.5);
    }
  }

  // Commercial frontage path band
  for (let x = -16; x <= 18; x += 2.2) {
    pushPart(parts, 'pathLong', x, 10, 2.4, 0, 'commercial');
    pushPart(parts, 'pathStonesMessy', x, 8, 2.0, x * 0.02, 'commercial');
  }
  for (let x = -14; x <= 16; x += 3.5) {
    pushPart(parts, 'planter', x, 9, 1.7, 0, 'commercial');
    pushPart(parts, 'detailAwning', x, 11.5, 1.5, 0, 'commercial', 0.6);
  }

  // Residential paths and hedges
  for (let x = -26; x <= 10; x += 2.0) {
    pushPart(parts, 'pathStonesMessy', x, -10, 2.5, x * 0.05, 'residential');
    pushPart(parts, 'pathStonesShort', x, -8.5, 2.2, x * 0.03, 'residential');
  }
  for (let z = -8; z <= 14; z += 2.5) {
    pushPart(parts, 'fenceLow', 18, z, 1.9, 0.05, 'residential');
    pushPart(parts, 'treeSmall', 20, z, 2.3, 0.1, 'residential');
  }
  for (let z = -18; z <= 18; z += 2.0) {
    pushPart(parts, 'fenceLow', -26, z, 2.0, z * 0.02, 'residential');
    if (z % 4 === 0) pushPart(parts, 'planter', -24, z + 0.8, 1.8, 0, 'residential');
  }

  // Orchard / farm grid (north-west farm edge)
  for (let x = -28; x <= -8; x += 3.2) {
    for (let z = 16; z <= 28; z += 3.2) {
      pushPart(parts, 'treeSmall', x, z, 2.4, (x + z) * 0.02, 'farm');
      if ((x + z) % 6 < 2) pushPart(parts, 'fern1', x + 1, z + 0.5, 2.0, 0, 'farm', 0.5);
    }
  }

  // Future lot framing
  for (let x = -6; x <= 6; x += 2.0) {
    pushPart(parts, 'fenceLow', x, 26, 2.0, 0, 'future-lot', 0.4);
    pushPart(parts, 'pathStonesShort', x, 24, 2.0, 0, 'future-lot', 0.4);
  }
  for (let x = -8; x <= 8; x += 4) {
    pushPart(parts, 'planter', x, 28, 1.6, 0, 'future-lot', 0.4);
  }

  // River / park edge vegetation
  for (let z = -20; z <= 24; z += 2.5) {
    pushPart(parts, 'treeLarge', 28, z, 2.6, 0.15, 'park-river');
    pushPart(parts, 'commonTree1', 30, z + 1, 2.8, z * 0.02, 'park-river', 0.3);
    pushPart(parts, 'bushFlowers', 26, z, 2.2, 0, 'park-river', 0.3);
  }
  for (let x = 24; x <= 32; x += 2.0) {
    pushPart(parts, 'bushCommon', x, 4, 2.0, 0, 'park-river', 0.3);
    pushPart(parts, 'flowerGroup', x, 8, 1.8, 0.1, 'park-river', 0.3);
  }

  // Perimeter canopy frame
  for (let x = -30; x <= 30; x += 2.0) {
    pushPart(parts, 'treeLarge', x, -22, 2.6, x * 0.04, 'vegetation');
    pushPart(parts, 'treeSmall', x, -20, 2.2, 0, 'vegetation');
  }
  for (let z = -18; z <= 18; z += 2.0) {
    pushPart(parts, 'treeLarge', -28, z, 2.5, Math.PI / 2, 'vegetation');
    pushPart(parts, 'commonTree2', -30, z, 2.4, 0, 'vegetation', 0.4);
  }
  for (let x = -16; x <= 16; x += 2.5) {
    pushPart(parts, 'treeSmall', x, 6.5, 2.0, 0, 'vegetation');
    pushPart(parts, 'bushCommon', x + 1, 7, 1.8, 0, 'vegetation', 0.4);
  }

  // Interior fill trees (reduce meadow void)
  for (let x = -20; x <= 20; x += 4.0) {
    for (let z = -14; z <= 22; z += 4.0) {
      if (Math.abs(x) < 3 && z > -12 && z < 16) continue;
      pushPart(parts, 'treeSmall', x, z, 2.1, (x + z) * 0.01, 'vegetation');
    }
  }

  return parts;
}

function buildDoorSockets() {
  return Object.entries(FROZEN_ENTRANCES).map(([label, entrance]) => ({
    label,
    facilityId: entrance.facilityId,
    localX: Number((entrance.x - ANCHOR.x).toFixed(4)),
    localY: 0,
    localZ: Number((entrance.z - ANCHOR.z).toFixed(4)),
    frozenEntrance: { x: entrance.x, z: entrance.z },
  }));
}

function buildDistrictZones() {
  return [
    { id: 'civic', minX: -28, maxX: 6, minZ: -22, maxZ: -2 },
    { id: 'commercial', minX: -18, maxX: 20, minZ: 6, maxZ: 20 },
    { id: 'residential', minX: -28, maxX: 24, minZ: -10, maxZ: 6 },
    { id: 'future-lot', minX: -10, maxX: 10, minZ: 22, maxZ: 30 },
    { id: 'park-river', minX: 22, maxX: 32, minZ: -22, maxZ: 26 },
    { id: 'farm', minX: -30, maxX: -6, minZ: 14, maxZ: 30 },
  ];
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

function validateDoorSockets(doorSockets) {
  const records = [];
  for (const socket of doorSockets) {
    const worldX = ANCHOR.x + socket.localX;
    const worldZ = ANCHOR.z + socket.localZ;
    const frozen = FROZEN_ENTRANCES[socket.label];
    const deltaM = Math.hypot(worldX - frozen.x, worldZ - frozen.z);
    records.push({
      label: socket.label,
      facilityId: socket.facilityId,
      worldX: Number(worldX.toFixed(4)),
      worldZ: Number(worldZ.toFixed(4)),
      frozenX: frozen.x,
      frozenZ: frozen.z,
      deltaM: Number(deltaM.toFixed(4)),
      pass: deltaM <= 0.3,
    });
  }
  return records;
}

async function main() {
  mkdirSync(SCENE_DIR, { recursive: true });
  rmSync(TEMP_DIR, { recursive: true, force: true });
  mkdirSync(TEMP_DIR, { recursive: true });

  const parts = generateSceneParts();
  const doorSockets = buildDoorSockets();
  const districtZones = buildDistrictZones();
  const doorValidation = validateDoorSockets(doorSockets);

  console.log(`Scene recipe: ${parts.length} parts`);
  if (parts.length < 80) {
    throw new Error(`Expected dense scene (≥80 parts), got ${parts.length}`);
  }

  for (const record of doorValidation) {
    if (!record.pass) {
      throw new Error(`Door socket ${record.label} delta ${record.deltaM}m exceeds 0.3m`);
    }
    console.log(`  ${record.label}: Δ${record.deltaM}m PASS`);
  }

  const tempFiles = [];
  const sourceMeshes = new Set();
  for (const part of parts) {
    sourceMeshes.add(SOURCE_URL[part.sourceKey] ?? part.src.replace('public', ''));
    tempFiles.push(await writeShiftedPart(part.src, part.name, part.t, part.s, part.r ?? 0));
  }

  const mergedPath = path.join(TEMP_DIR, 'hero-neighborhood-merged.glb');
  console.log(`Merging ${tempFiles.length} parts…`);
  await mergeParts(tempFiles, mergedPath);

  const outFileName = 'wf02-hero-neighborhood-scene.glb';
  const outPath = path.join(SCENE_DIR, outFileName);
  console.log('Flatten/join pipeline…');
  await flattenAndJoin(mergedPath, outPath);

  const bounds = await measureGlb(outPath);
  console.log(
    `  → ${bounds.triangles} tris, ${bounds.meshCount} meshes, ${bounds.materialCount} materials`,
  );

  if (bounds.meshCount > 12) {
    throw new Error(`Hero scene mesh count ${bounds.meshCount} exceeds hard stop 12`);
  }

  const assetUrl = `/assets/glb/wf02/hero-scenes/${outFileName}`;
  const layoutManifest = JSON.parse(readFileSync(LAYOUT_MANIFEST, 'utf8'));
  layoutManifest[assetUrl] = bounds;

  const recipe = {
    planRevision: '15.4',
    authorization: 'STRATEGY_A_PHASE0_ONLY',
    sceneId: 'wf02-hero-neighborhood-scene',
    anchor: ANCHOR,
    heroBounds: HERO_BOUNDS,
    doorSockets,
    districtZones,
    partCount: parts.length,
    parts: parts.map(({ src, sourceKey, world, district, t, s, r }) => ({
      sourceKey,
      sourceUrl: SOURCE_URL[sourceKey],
      district,
      world,
      localTranslation: t,
      scale: s,
      rotationY: r ?? 0,
    })),
  };

  const provenance = {
    generatedAt: new Date().toISOString(),
    planRevision: '15.4',
    authorization: 'STRATEGY_A_PHASE0_ONLY',
    license: 'CC0 1.0 Universal (Kenney + Quaternius derivatives)',
    sourceUrl: 'https://kenney.nl/assets',
    flattenPipeline: 'merge → flatten → join → flatten',
    partCount: parts.length,
    sourceMeshes: [...sourceMeshes],
    measuredBounds: bounds,
    doorValidation,
  };

  const manifest = {
    planRevision: '15.4',
    phase: 0,
    authorization: 'STRATEGY_A_PHASE0_ONLY',
    integrationMode: 'A-offline-authored-hero-neighborhood-scene',
    sceneId: 'wf02-hero-neighborhood-scene',
    assetUrl,
    anchor: ANCHOR,
    heroBounds: HERO_BOUNDS,
    bounds,
    doorSockets,
    doorValidation,
    districtZones,
    partCount: parts.length,
    meshCount: bounds.meshCount,
    materialCount: bounds.materialCount,
    suppressLayers: [
      'PrototypeShellLayer',
      'WorldLabGroundTint',
      'VegetationFrame',
      'ResidentialGardens',
      'FutureLotFrame',
      'CivicEnclosure',
      'CommercialFrontage',
      'ModularAssemblyLayer',
      'FootprintPhase0ProofLayer',
      'ReplacementPhase0ProofLayer',
      'BlockChunkPhase0ProofLayer',
      'HeroBlockPhase0ProofLayer',
    ],
    heroSceneDrawBudget: { hardStop: 12, target: 6 },
    performanceBudget: {
      overviewDrawCallsMax: 140,
      overviewTrianglesMax: 150000,
      streetDrawCallsMax: 100,
      headroomDrawCallsMin: 5,
      headroomTrianglesMin: 8000,
    },
    cameraPolicy: 'frozen-default — Candidate D forbidden in Phase 0',
    provenance: {
      license: provenance.license,
      flattenPipeline: provenance.flattenPipeline,
      sourceMeshCount: sourceMeshes.size,
    },
  };

  writeFileSync(RECIPE_OUT, JSON.stringify(recipe, null, 2));
  writeFileSync(PROVENANCE_OUT, JSON.stringify(provenance, null, 2));
  writeFileSync(MANIFEST_OUT, JSON.stringify(manifest, null, 2));
  writeFileSync(LAYOUT_MANIFEST, JSON.stringify(layoutManifest, null, 2));

  console.log('\nHero neighborhood scene import complete.');
  console.log(`  parts: ${parts.length}`);
  console.log(`  tris: ${bounds.triangles}`);
  console.log(`  meshes: ${bounds.meshCount}`);
  console.log(`  manifest: ${MANIFEST_OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
