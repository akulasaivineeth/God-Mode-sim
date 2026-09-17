/**
 * WF02 R15 Path B Phase 0 — offline kitbash neighborhood mass chunks (C1 + C2).
 *
 * Usage: npm run import:wf02-r15-block-chunks
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { URL as NodeURL } from 'node:url';
import { execSync } from 'node:child_process';
import { NodeIO } from '@gltf-transform/core';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Box3, Vector3 } from 'three';
import { assignChunkId, isChunkPartExcluded } from './wf02-r15-chunk-exclusion.mjs';

globalThis.self = globalThis;
globalThis.URL = NodeURL;

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHUNK_DIR = path.join(ROOT, 'public/assets/glb/wf02/block-chunks');
const TEMP_DIR = path.join(ROOT, '.cache/wf02-r15-block-chunks');
const PROVENANCE_OUT = path.join(ROOT, 'Docs/milestones/WF02/r15_block_chunk_provenance.json');
const PROOF_MANIFEST_OUT = path.join(
  ROOT,
  'src/rendering/blockChunkProof/blockChunkPhase0ProofManifest.json',
);
const LAYOUT_MANIFEST = path.join(ROOT, 'src/rendering/assets/modelLayoutManifest.json');

const io = new NodeIO();
const loader = new GLTFLoader();

const SOURCES = {
  treeLarge: 'public/assets/glb/kenney/suburban/tree-large.glb',
  treeSmall: 'public/assets/glb/kenney/suburban/tree-small.glb',
  fenceLow: 'public/assets/glb/kenney/suburban/fence-low.glb',
  pathStonesShort: 'public/assets/glb/kenney/suburban/path-stones-short.glb',
  pathStonesMessy: 'public/assets/glb/kenney/suburban/path-stones-messy.glb',
  pathLong: 'public/assets/glb/kenney/suburban/path-long.glb',
  planter: 'public/assets/glb/kenney/suburban/planter.glb',
};

const CHUNK_ANCHORS = {
  west: { x: 0, y: 0, z: 4 },
  east: { x: 8, y: 0, z: 6 },
};

function abs(rel) {
  return path.join(ROOT, rel);
}

function pushPart(out, chunkId, srcKey, wx, wz, scale, rotY = 0, buildingMargin = 0.9) {
  if (isChunkPartExcluded(wx, wz, buildingMargin)) return;
  const assigned = assignChunkId(wx, wz);
  if (assigned !== chunkId) return;
  const anchor = CHUNK_ANCHORS[chunkId];
  out.push({
    src: SOURCES[srcKey],
    name: `${chunkId}-${out.length}.glb`,
    t: [wx - anchor.x, 0, wz - anchor.z],
    s: [scale, scale, scale],
    r: rotY,
    world: { x: wx, z: wz },
    sourceKey: srcKey,
  });
}

function generateChunkParts() {
  const parts = { west: [], east: [] };

  for (let x = -28; x <= 28; x += 1.8) {
    pushPart(parts.west, 'west', 'treeLarge', x, -20, 2.8, (x + 28) * 0.04);
    pushPart(parts.west, 'west', 'treeSmall', x, -17.5, 2.4, (x + 28) * 0.02);
    pushPart(parts.west, 'west', 'treeLarge', x, -15.5, 2.5, 0.15);
  }

  for (let z = -18; z <= 22; z += 2.2) {
    pushPart(parts.west, 'west', 'treeLarge', -28, z, 2.6, Math.PI / 2);
    pushPart(parts.west, 'west', 'treeSmall', -26, z + 1.1, 2.2, 0.2);
    if (z % 3 === 0) pushPart(parts.west, 'west', 'treeLarge', -24, z, 2.3, 0.35);
  }

  const sq = { x: 0, z: -10 };
  for (let i = 0; i < 18; i += 1) {
    const a = (i / 18) * Math.PI * 2;
    const radius = 4.2 + (i % 4) * 0.55;
    pushPart(
      parts.west,
      'west',
      i % 2 === 0 ? 'pathStonesShort' : 'pathStonesMessy',
      sq.x + Math.cos(a) * radius,
      sq.z + Math.sin(a) * radius,
      1.65,
      a,
      0.45,
    );
  }
  for (const offset of [
    { x: -2.5, z: 0.5 },
    { x: 2.5, z: -0.5 },
    { x: 0, z: 2.2 },
    { x: -3.5, z: -1.5 },
    { x: 3.2, z: 1.2 },
  ]) {
    pushPart(parts.west, 'west', 'planter', sq.x + offset.x, sq.z + offset.z, 1.55, offset.x * 0.1, 0.4);
  }

  for (const house of [
    { x: 16, z: -4, side: 1 },
    { x: -16, z: -4, side: -1 },
  ]) {
    for (let i = -3; i <= 3; i += 1) {
      pushPart(
        parts.west,
        'west',
        'fenceLow',
        house.x + house.side * 4.5,
        house.z + i * 1.15,
        2.35,
        house.side > 0 ? Math.PI / 2 : -Math.PI / 2,
        0.55,
      );
    }
    pushPart(parts.west, 'west', 'treeLarge', house.x - house.side * 3.5, house.z + 4, 2.05, house.side * 0.35);
    pushPart(parts.west, 'west', 'treeSmall', house.x + house.side * 2, house.z - 2.8, 1.8, 0.2);
  }

  const lot = { x: 0, z: 26 };
  for (let t = 0; t <= 1; t += 0.11) {
    const a = t * Math.PI * 2;
    pushPart(
      parts.west,
      'west',
      'fenceLow',
      lot.x + Math.cos(a) * 3.8,
      lot.z + Math.sin(a) * 3.6,
      2.4,
      a + Math.PI / 2,
      0.45,
    );
  }
  for (let t = 0; t <= 1; t += 0.18) {
    pushPart(parts.west, 'west', 'pathStonesShort', lot.x, lot.z - 3.6 + t * 8, 1.45, 0, 0.4);
  }
  pushPart(parts.west, 'west', 'treeLarge', lot.x - 3.2, lot.z + 2.5, 1.95, 0.2);
  pushPart(parts.west, 'west', 'treeLarge', lot.x + 3.2, lot.z + 2.5, 1.95, -0.15);

  for (let x = -18; x <= 18; x += 1.4) {
    for (const z of [11.5, 13, 14.5, 16, 17.5]) {
      pushPart(
        parts.east,
        'east',
        z >= 15 ? 'pathStonesMessy' : 'pathStonesShort',
        x,
        z,
        2.0,
        Math.PI / 2,
        0.5,
      );
    }
    if (x % 3 === 0) {
      pushPart(parts.east, 'east', 'planter', x + 0.8, 16.5, 1.85, 0.1, 0.5);
    }
  }
  for (const x of [-14, -6, 2, 10, 16]) {
    pushPart(parts.east, 'east', 'pathLong', x, 12.5, 2.2, Math.PI / 2, 0.5);
    pushPart(parts.east, 'east', 'treeLarge', x + 1.5, 14.5, 2.5, 0.25, 0.5);
    pushPart(parts.east, 'east', 'treeSmall', x - 1, 15.8, 2.1, -0.1, 0.5);
  }

  for (let z = -14; z <= 18; z += 1.6) {
    pushPart(parts.east, 'east', 'treeLarge', 15, z, 2.8, 0.1 + (z % 5) * 0.08);
    pushPart(parts.east, 'east', 'treeSmall', 17.5, z + 0.9, 2.4, -0.2);
    pushPart(parts.east, 'east', 'treeLarge', 13.5, z + 1.4, 2.3, 0.35);
  }
  for (let z = -10; z <= 14; z += 3.2) {
    pushPart(parts.east, 'east', 'pathStonesShort', 14.5, z, 1.4, 0.25, 0.35);
    pushPart(parts.east, 'east', 'planter', 16.8, z + 1, 1.35, 0.1, 0.35);
  }

  for (let z = -14; z <= 20; z += 2.5) {
    pushPart(parts.east, 'east', 'treeLarge', 19, z, 2.6, -0.15);
    pushPart(parts.east, 'east', 'treeSmall', 18, z + 1.2, 2.2, 0.1);
  }

  for (let x = -16; x <= 16; x += 3.5) {
    pushPart(parts.east, 'east', 'treeLarge', x, 10.5, 2.4, 0.3, 0.5);
  }

  for (let z = -2; z <= 8; z += 2) {
    pushPart(parts.east, 'east', 'treeSmall', -4, z, 2.0, 0.2, 0.4);
    pushPart(parts.east, 'east', 'treeSmall', 4, z, 2.0, -0.15, 0.4);
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

const CHUNK_RECIPES = [
  {
    chunkId: 'hero-block-mass-west',
    fileName: 'wf02-hero-block-mass-west.glb',
    anchor: CHUNK_ANCHORS.west,
    key: 'west',
  },
  {
    chunkId: 'hero-block-mass-east',
    fileName: 'wf02-hero-block-mass-east.glb',
    anchor: CHUNK_ANCHORS.east,
    key: 'east',
  },
];

async function main() {
  mkdirSync(CHUNK_DIR, { recursive: true });
  mkdirSync(TEMP_DIR, { recursive: true });
  mkdirSync(path.dirname(PROOF_MANIFEST_OUT), { recursive: true });
  rmSync(TEMP_DIR, { recursive: true, force: true });
  mkdirSync(TEMP_DIR, { recursive: true });

  const generated = generateChunkParts();
  const layoutManifest = JSON.parse(readFileSync(LAYOUT_MANIFEST, 'utf8'));
  const provenanceChunks = {};
  const proofChunks = [];

  for (const recipe of CHUNK_RECIPES) {
    const parts = generated[recipe.key];
    console.log(`Kitbash ${recipe.chunkId} (${parts.length} parts)…`);
    if (parts.length < 35) {
      throw new Error(`${recipe.chunkId} has only ${parts.length} parts — expected dense structural mass`);
    }

    const SOURCE_URL = {
      treeLarge: '/assets/glb/kenney/suburban/tree-large.glb',
      treeSmall: '/assets/glb/kenney/suburban/tree-small.glb',
      fenceLow: '/assets/glb/kenney/suburban/fence-low.glb',
      pathStonesShort: '/assets/glb/kenney/suburban/path-stones-short.glb',
      pathStonesMessy: '/assets/glb/kenney/suburban/path-stones-messy.glb',
      pathLong: '/assets/glb/kenney/suburban/path-long.glb',
      planter: '/assets/glb/kenney/suburban/planter.glb',
    };

    const tempFiles = [];
    const sourceMeshes = new Set();
    for (const part of parts) {
      sourceMeshes.add(SOURCE_URL[part.sourceKey]);
      tempFiles.push(await writeShiftedPart(part.src, part.name, part.t, part.s, part.r ?? 0));
    }

    const outPath = path.join(CHUNK_DIR, recipe.fileName);
    await mergeParts(tempFiles, outPath);
    const bounds = await measureGlb(outPath);
    const assetUrl = `/assets/glb/wf02/block-chunks/${recipe.fileName}`;

    layoutManifest[assetUrl] = bounds;
    provenanceChunks[recipe.chunkId] = {
      license: 'CC0 1.0 Universal (Kenney derivative)',
      sourceUrl: 'https://kenney.nl/assets',
      sourceMeshes: [...sourceMeshes].sort(),
      partCount: parts.length,
      measuredBounds: bounds,
    };

    proofChunks.push({
      chunkId: recipe.chunkId,
      fileName: recipe.fileName,
      assetUrl,
      anchor: recipe.anchor,
      bounds,
      partCount: parts.length,
    });

    console.log(
      `  → ${recipe.fileName}`,
      bounds.size.map((v) => v.toFixed(1)).join('×'),
      `${bounds.triangles} tris`,
      `(${parts.length} parts)`,
    );
  }

  const totalTris = proofChunks.reduce((s, c) => s + c.bounds.triangles, 0);
  writeFileSync(
    PROVENANCE_OUT,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        planRevision: '15.1',
        phase: 0,
        authorization: 'PATH_B_PHASE_0_ONLY',
        license: 'CC0 1.0 Universal (Kenney kitbash derivatives)',
        chunkCount: proofChunks.length,
        totalChunkTriangles: totalTris,
        chunks: provenanceChunks,
      },
      null,
      2,
    )}\n`,
  );
  writeFileSync(
    PROOF_MANIFEST_OUT,
    `${JSON.stringify(
      {
        planRevision: 15.1,
        phase: 0,
        authorization: 'PATH_B_PHASE_0_ONLY',
        integrationMode: 'B1-mass-chunk-plus-shells',
        chunks: proofChunks,
      },
      null,
      2,
    )}\n`,
  );
  writeFileSync(LAYOUT_MANIFEST, `${JSON.stringify(layoutManifest, null, 2)}\n`);

  console.log(`\nWrote chunks → ${CHUNK_DIR}`);
  console.log(`Total chunk tris: ${totalTris}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
