/**
 * WF02 R12 Phase 0 — expand Kenney Modular Buildings import (+12 modules, 30 total).
 *
 * Usage: npm run import:wf02-r12-modular
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
const AUDIT_OUT = path.join(ROOT, 'Docs/milestones/WF02/r12_modular_audit.json');
const LAYOUT_MANIFEST = path.join(ROOT, 'src/rendering/assets/modelLayoutManifest.json');

/** R11 base (18) + R12 approved expansion (12) = 30 modules. */
const R11_MODULES = [
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

const R12_NEW_MODULES = [
  'building-window-balcony.glb',
  'building-steps-narrow-windows.glb',
  'building-steps-narrow-windows-round.glb',
  'building-window-large-left.glb',
  'building-window-large-middle.glb',
  'building-window-large-right.glb',
  'building-windows-high-middle.glb',
  'building-corner-window-top-round.glb',
  'roof-flat-detail-a.glb',
  'roof-flat-detail-b.glb',
  'roof-slanted-window.glb',
  'roof-slanted-detail.glb',
];

const ALL_MODULES = [...R11_MODULES, ...R12_NEW_MODULES];

const SOURCE_ZIP_DIR =
  process.env.KENNEY_MODULAR_SRC ?? '/tmp/kenney-modular/Models/GLB format';

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
  if (existsSync(srcTex)) cpSync(srcTex, warmTex);

  const modules = {};
  let totalTris = 0;

  for (const file of ALL_MODULES) {
    const src = path.join(srcDir, file);
    if (!existsSync(src)) throw new Error(`Missing module: ${file}`);
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
    const tag = R12_NEW_MODULES.includes(file) ? ' [R12]' : '';
    console.log(moduleId + tag, bounds.size.map((v) => v.toFixed(3)).join('×'), `${bounds.triangles} tris`);
  }

  const block = modules['building-block'];
  const audit = {
    generatedAt: new Date().toISOString(),
    planRevision: 12,
    sourceUrl: 'https://kenney.nl/assets/modular-buildings',
    license: 'CC0 1.0 Universal',
    moduleCount: ALL_MODULES.length,
    r11ModuleCount: R11_MODULES.length,
    r12NewModuleCount: R12_NEW_MODULES.length,
    r12NewModules: R12_NEW_MODULES.map((f) => f.replace(/\.glb$/, '')),
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

  console.log(`\nImported ${ALL_MODULES.length} modules (${R12_NEW_MODULES.length} new) → ${PUBLIC_MODULAR}`);
  console.log(`Wrote ${MANIFEST_OUT}`);
  console.log(`Wrote ${AUDIT_OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
