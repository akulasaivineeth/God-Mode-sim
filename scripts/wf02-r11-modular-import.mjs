/**
 * WF02 R11 Phase 0 — curated Kenney Modular Buildings import + bounds audit.
 *
 * Usage: npm run import:wf02-r11-modular
 */
import { cpSync, mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { URL as NodeURL } from 'node:url';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Box3, Vector3 } from 'three';

globalThis.self = globalThis;
globalThis.URL = NodeURL;

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC_MODULAR = path.join(ROOT, 'public/assets/glb/kenney/modular');
const TEXTURES_DIR = path.join(PUBLIC_MODULAR, 'Textures');
const MANIFEST_OUT = path.join(ROOT, 'src/rendering/modular/modularModuleManifest.json');
const AUDIT_OUT = path.join(ROOT, 'Docs/milestones/WF02/r11_modular_audit.json');
const LAYOUT_MANIFEST = path.join(ROOT, 'src/rendering/assets/modelLayoutManifest.json');

/** Curated subset for three R11 prototypes (≤24). */
const CURATED_MODULES = [
  'building-block.glb',
  'building-corner.glb',
  'building-window.glb',
  'building-window-wide.glb',
  'building-window-sill.glb',
  'building-door-window.glb',
  'building-door-window-narrow.glb',
  'building-window-awnings.glb',
  'building-edges-door.glb',
  'building-steps-wide.glb',
  'roof-flat-top.glb',
  'roof-flat-border-straight.glb',
  'roof-flat-awning-a.glb',
  'roof-slanted.glb',
  'roof-gable.glb',
  'roof-gable-end.glb',
  'roof-gable-corner.glb',
  'door-white.glb',
];

const SOURCE_ZIP_DIR = process.env.KENNEY_MODULAR_SRC
  ?? '/tmp/kenney-modular/Models/GLB format';

function findSourceDir() {
  if (existsSync(SOURCE_ZIP_DIR)) return SOURCE_ZIP_DIR;
  const alt = path.join(ROOT, '.cache/kenney-modular/Models/GLB format');
  if (existsSync(alt)) return alt;
  throw new Error(
    'Kenney modular source not found. Extract kenney_modular-buildings.zip to /tmp/kenney-modular or set KENNEY_MODULAR_SRC',
  );
}

function patchGlbTextureUri(glbPath) {
  const buf = readFileSync(glbPath);
  const jsonStart = buf.indexOf(Buffer.from('JSON'));
  if (jsonStart < 4) return;
  const jsonLen = buf.readUInt32LE(jsonStart - 4);
  const jsonStr = buf.subarray(jsonStart, jsonStart + jsonLen).toString('utf8');
  const patched = jsonStr.replace(/Textures\/colormap\.png/g, 'Textures/colormap_warm_modular.png');
  if (patched === jsonStr) return;
  const patchedBuf = Buffer.from(patched, 'utf8');
  const out = Buffer.alloc(buf.length - jsonLen + patchedBuf.length);
  buf.copy(out, 0, 0, jsonStart);
  patchedBuf.copy(out, jsonStart);
  buf.copy(out, jsonStart + patchedBuf.length, jsonStart + jsonLen);
  out.writeUInt32LE(patchedBuf.length, jsonStart - 4);
  writeFileSync(glbPath, out);
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

async function main() {
  const srcDir = findSourceDir();
  mkdirSync(TEXTURES_DIR, { recursive: true });
  mkdirSync(path.dirname(MANIFEST_OUT), { recursive: true });

  const srcTex = path.join(srcDir, 'Textures/colormap.png');
  const warmTex = path.join(TEXTURES_DIR, 'colormap_warm_modular.png');
  cpSync(srcTex, warmTex);

  const modules = {};
  let totalTris = 0;

  for (const file of CURATED_MODULES) {
    const src = path.join(srcDir, file);
    if (!existsSync(src)) throw new Error(`Missing curated module: ${file}`);
    const dest = path.join(PUBLIC_MODULAR, file);
    cpSync(src, dest);
    patchGlbTextureUri(dest);
    const url = `/assets/glb/kenney/modular/${file}`;
    const bounds = await measureGlb(dest);
    const moduleId = file.replace(/\.glb$/, '');
    modules[moduleId] = {
      moduleId,
      assetUrl: url,
      gridWidth: bounds.size[0],
      gridDepth: bounds.size[2],
      gridHeight: bounds.size[1],
      bounds,
    };
    totalTris += bounds.triangles;
    console.log(moduleId, bounds.size.map((v) => v.toFixed(3)).join('×'), `${bounds.triangles} tris`);
  }

  const block = modules['building-block'];
  const audit = {
    generatedAt: new Date().toISOString(),
    planRevision: 11,
    sourceUrl: 'https://kenney.nl/assets/modular-buildings',
    license: 'CC0 1.0 Universal',
    moduleCount: CURATED_MODULES.length,
    textureFiles: ['colormap_warm_modular.png'],
    measuredGridUnit: {
      widthM: block.gridWidth,
      depthM: block.gridDepth,
      storyHeightM: block.gridHeight,
    },
    totalModuleTriangles: totalTris,
    modules,
  };

  writeFileSync(MANIFEST_OUT, `${JSON.stringify(modules, null, 2)}\n`);
  writeFileSync(AUDIT_OUT, `${JSON.stringify(audit, null, 2)}\n`);

  const layoutManifest = JSON.parse(readFileSync(LAYOUT_MANIFEST, 'utf8'));
  for (const mod of Object.values(modules)) {
    layoutManifest[mod.assetUrl] = mod.bounds;
  }
  writeFileSync(LAYOUT_MANIFEST, `${JSON.stringify(layoutManifest, null, 2)}\n`);

  console.log(`\nImported ${CURATED_MODULES.length} modules → ${PUBLIC_MODULAR}`);
  console.log(`Measured grid: ${block.gridWidth}m × ${block.gridHeight}m (story) × ${block.gridDepth}m`);
  console.log(`Wrote ${MANIFEST_OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
