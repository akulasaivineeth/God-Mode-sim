/**
 * WF02 R13 — offline kitbash: merge CC0 Kenney sources into 4 prototype shell GLBs.
 *
 * Usage: npm run import:wf02-r13-shells
 */
import { cpSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { URL as NodeURL } from 'node:url';
import { execSync } from 'node:child_process';
import { NodeIO } from '@gltf-transform/core';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Box3, Vector3 } from 'three';

globalThis.self = globalThis;
globalThis.URL = NodeURL;

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHELL_DIR = path.join(ROOT, 'public/assets/glb/wf02/prototype-shells');
const TEXTURES_DIR = path.join(SHELL_DIR, 'Textures');
const TEMP_DIR = path.join(ROOT, '.cache/wf02-r13-shell-parts');
const MANIFEST_OUT = path.join(ROOT, 'src/rendering/prototypeShell/prototypeShellManifest.json');
const AUDIT_OUT = path.join(ROOT, 'Docs/milestones/WF02/r13_shell_provenance.json');
const LAYOUT_MANIFEST = path.join(ROOT, 'src/rendering/assets/modelLayoutManifest.json');
const KENNEY = path.join(ROOT, 'public/assets/glb/kenney');

const io = new NodeIO();
const loader = new GLTFLoader();

function abs(rel) {
  return path.join(ROOT, rel);
}

async function writeShiftedPart(sourceRel, tempName, translation, scale, rotationY = 0) {
  const doc = await io.read(abs(sourceRel));
  const scene = doc.getRoot().listScenes()[0];
  for (const node of scene.listChildren()) {
    node.setTranslation(translation);
    node.setScale(scale);
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

const SHELL_RECIPES = [
  {
    shellId: 'civic-enclosure-shell',
    fileName: 'wf02-civic-enclosure-shell.glb',
    targetWidth: 18,
    provenance: [
      '/assets/glb/kenney/commercial/community-hall.glb',
      '/assets/glb/kenney/commercial/school.glb',
      '/assets/glb/kenney/commercial/clinic.glb',
      '/assets/glb/kenney/commercial/detail-parasol-a.glb',
      '/assets/glb/kenney/suburban/path-stones-short.glb',
    ],
    parts: [
      { src: 'public/assets/glb/kenney/commercial/community-hall.glb', name: 'hall.glb', t: [0, 0, 0], s: [2.4, 1.35, 1.6] },
      { src: 'public/assets/glb/kenney/commercial/school.glb', name: 'tower.glb', t: [0, 2.8, -1.2], s: [1.6, 2.2, 1.4] },
      { src: 'public/assets/glb/kenney/commercial/clinic.glb', name: 'wing.glb', t: [6, 0, 0.5], s: [1.3, 1.1, 1.2] },
      { src: 'public/assets/glb/kenney/commercial/detail-parasol-a.glb', name: 'parasol.glb', t: [-4, 0, 1.5], s: [1.5, 1.5, 1.5] },
      { src: 'public/assets/glb/kenney/suburban/path-stones-short.glb', name: 'portico.glb', t: [0, 0, 1.6], s: [2.5, 1, 2] },
    ],
  },
  {
    shellId: 'commercial-frontage-shell',
    fileName: 'wf02-commercial-frontage-shell.glb',
    targetWidth: 34,
    provenance: [
      '/assets/glb/kenney/commercial/store-general.glb',
      '/assets/glb/kenney/industrial/workshop-industrial.glb',
      '/assets/glb/kenney/commercial/cafe-bistro.glb',
      '/assets/glb/kenney/commercial/detail-awning.glb',
      '/assets/glb/kenney/industrial/warehouse.glb',
    ],
    parts: [
      { src: 'public/assets/glb/kenney/commercial/store-general.glb', name: 'store.glb', t: [-11, 0, 0.4], s: [1.35, 1.15, 1.1] },
      { src: 'public/assets/glb/kenney/industrial/workshop-industrial.glb', name: 'workshop.glb', t: [0, 0, 0], s: [1.05, 1.25, 0.95] },
      { src: 'public/assets/glb/kenney/commercial/cafe-bistro.glb', name: 'cafe.glb', t: [11, 0, 0.5], s: [1.25, 1.1, 1.05] },
      { src: 'public/assets/glb/kenney/commercial/detail-awning.glb', name: 'awning-a.glb', t: [-11, 1.6, 1.2], s: [1.4, 1, 1.2] },
      { src: 'public/assets/glb/kenney/commercial/detail-awning.glb', name: 'awning-b.glb', t: [0, 1.8, 1.3], s: [1.6, 1, 1.3] },
      { src: 'public/assets/glb/kenney/commercial/detail-awning.glb', name: 'awning-c.glb', t: [11, 1.5, 1.1], s: [1.3, 1, 1.1] },
      { src: 'public/assets/glb/kenney/industrial/warehouse.glb', name: 'roof-cap.glb', t: [0, 2.2, -0.5], s: [0.8, 0.6, 0.9] },
    ],
  },
  {
    shellId: 'residential-cottage-shell',
    fileName: 'wf02-residential-cottage-shell.glb',
    targetWidth: 6,
    provenance: [
      '/assets/glb/kenney/suburban/home-cottage.glb',
      '/assets/glb/kenney/suburban/path-stones-short.glb',
      '/assets/glb/kenney/suburban/planter.glb',
      '/assets/glb/kenney/suburban/path-short.glb',
    ],
    parts: [
      { src: 'public/assets/glb/kenney/suburban/home-cottage.glb', name: 'cottage.glb', t: [0, 0, 0], s: [1.15, 1.1, 1.15] },
      { src: 'public/assets/glb/kenney/suburban/path-stones-short.glb', name: 'porch.glb', t: [0.8, 0, 1.1], s: [1.4, 1, 1.3] },
      { src: 'public/assets/glb/kenney/suburban/planter.glb', name: 'planter.glb', t: [-1.2, 0, 1], s: [1.2, 1.2, 1.2] },
      { src: 'public/assets/glb/kenney/suburban/path-short.glb', name: 'stoop.glb', t: [0.2, 0, 1.5], s: [1.1, 1, 1.1] },
    ],
  },
  {
    shellId: 'residential-gable-shell',
    fileName: 'wf02-residential-gable-shell.glb',
    targetWidth: 7,
    provenance: [
      '/assets/glb/kenney/suburban/home-type-a.glb',
      '/assets/glb/kenney/suburban/home-type-c.glb',
      '/assets/glb/kenney/suburban/apartment-block.glb',
      '/assets/glb/kenney/suburban/path-stones-messy.glb',
    ],
    parts: [
      { src: 'public/assets/glb/kenney/suburban/home-type-a.glb', name: 'home.glb', t: [0, 0, 0], s: [1.35, 1.45, 1.25] },
      { src: 'public/assets/glb/kenney/suburban/home-type-c.glb', name: 'upper.glb', t: [0.3, 1.5, 0.2], s: [1.1, 1.2, 1.1] },
      { src: 'public/assets/glb/kenney/suburban/apartment-block.glb', name: 'wing.glb', t: [-2.5, 0.5, 0], s: [0.7, 0.9, 0.8] },
      { src: 'public/assets/glb/kenney/suburban/path-stones-messy.glb', name: 'stoop.glb', t: [-0.5, 0, 1.2], s: [1.3, 1, 1.3] },
    ],
  },
];

const SHELL_REGISTRY = [
  {
    shellId: 'civic-enclosure-shell',
    fileName: 'wf02-civic-enclosure-shell.glb',
    origin: { x: -14, y: 0, z: -3.5 },
    rotY: 0,
    targetWidth: 18,
    doorBindings: [],
    replacesBuildingIds: [],
  },
  {
    shellId: 'commercial-frontage-shell',
    fileName: 'wf02-commercial-frontage-shell.glb',
    origin: { x: -17, y: 0, z: 11 },
    rotY: 0,
    targetWidth: 34,
    doorBindings: [
      { label: 'store-door', localX: 3.5, localZ: 0.5 },
      { label: 'workshop-door', localX: 21.5, localZ: 0.5 },
    ],
    replacesBuildingIds: ['store', 'workshop', 'cafe'],
  },
  {
    shellId: 'residential-cottage-shell',
    fileName: 'wf02-residential-cottage-shell.glb',
    origin: { x: 13, y: 0, z: -6.5 },
    rotY: 0,
    targetWidth: 6,
    doorBindings: [{ label: 'home-door', localX: 2.5, localZ: 0.5 }],
    replacesBuildingIds: ['house-1'],
  },
  {
    shellId: 'residential-gable-shell',
    fileName: 'wf02-residential-gable-shell.glb',
    origin: { x: -19, y: 0, z: -6.5 },
    rotY: 0,
    targetWidth: 7,
    doorBindings: [],
    replacesBuildingIds: ['house-2'],
  },
];

async function main() {
  mkdirSync(SHELL_DIR, { recursive: true });
  mkdirSync(TEXTURES_DIR, { recursive: true });
  mkdirSync(TEMP_DIR, { recursive: true });
  mkdirSync(path.dirname(MANIFEST_OUT), { recursive: true });
  rmSync(TEMP_DIR, { recursive: true, force: true });
  mkdirSync(TEMP_DIR, { recursive: true });

  const textureSources = [
    ['colormap_warm_civic.png', path.join(KENNEY, 'commercial/Textures/colormap.png')],
    ['colormap_warm_commercial.png', path.join(KENNEY, 'commercial/Textures/colormap.png')],
    ['colormap_warm_residential.png', path.join(KENNEY, 'suburban/Textures/colormap.png')],
  ];
  for (const [name, src] of textureSources) {
    if (existsSync(src)) cpSync(src, path.join(TEXTURES_DIR, name));
  }

  const shells = {};
  const provenance = {};
  const layoutManifest = JSON.parse(readFileSync(LAYOUT_MANIFEST, 'utf8'));

  for (const recipe of SHELL_RECIPES) {
    console.log(`Kitbash ${recipe.shellId}…`);
    const tempFiles = [];
    for (const part of recipe.parts) {
      tempFiles.push(
        await writeShiftedPart(part.src, `${recipe.shellId}-${part.name}`, part.t, part.s, part.r ?? 0),
      );
    }
    const outPath = path.join(SHELL_DIR, recipe.fileName);
    await mergeParts(tempFiles, outPath);
    const bounds = await measureGlb(outPath);
    const assetUrl = `/assets/glb/wf02/prototype-shells/${recipe.fileName}`;
    shells[recipe.shellId] = { shellId: recipe.shellId, assetUrl, bounds, targetWidth: recipe.targetWidth };
    provenance[recipe.shellId] = {
      license: 'CC0 1.0 Universal (Kenney derivative)',
      sourceUrl: 'https://kenney.nl/assets',
      sourceMeshes: recipe.provenance,
      measuredBounds: bounds,
    };
    layoutManifest[assetUrl] = bounds;
    console.log(
      `  → ${recipe.fileName}`,
      bounds.size.map((v) => v.toFixed(2)).join('×'),
      `${bounds.triangles} tris`,
    );
  }

  const registryEntries = SHELL_REGISTRY.map((entry) => ({
    ...entry,
    assetUrl: shells[entry.shellId].assetUrl,
    bounds: shells[entry.shellId].bounds,
  }));

  writeFileSync(MANIFEST_OUT, `${JSON.stringify(registryEntries, null, 2)}\n`);
  writeFileSync(
    AUDIT_OUT,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        planRevision: 13,
        license: 'CC0 1.0 Universal (Kenney kitbash derivatives)',
        shellCount: registryEntries.length,
        totalShellTriangles: Object.values(shells).reduce((s, x) => s + x.bounds.triangles, 0),
        shells: provenance,
      },
      null,
      2,
    )}\n`,
  );
  writeFileSync(LAYOUT_MANIFEST, `${JSON.stringify(layoutManifest, null, 2)}\n`);

  console.log(`\nWrote 4 shells → ${SHELL_DIR}`);
  console.log(`Wrote ${MANIFEST_OUT}`);
  console.log(`Wrote ${AUDIT_OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
