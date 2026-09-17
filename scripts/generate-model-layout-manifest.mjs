/**
 * Offline generator for modelLayoutManifest.json — WF02 single layout authority.
 * Parses Kenney GLB rest-pose AABBs via Three.js (same as runtime ModelAsset).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { URL as NodeURL } from 'node:url';

// Three.js GLTFLoader expects browser globals when resolving embedded textures.
globalThis.self = globalThis;
globalThis.URL = NodeURL;
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Box3, Vector3 } from 'three';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(ROOT, '..', 'public');
const OUT = path.join(ROOT, '..', 'src', 'rendering', 'assets', 'modelLayoutManifest.json');

const ASSET_URLS = [
  '/assets/glb/kenney/suburban/home-cottage.glb',
  '/assets/glb/kenney/suburban/home-type-a.glb',
  '/assets/glb/kenney/suburban/home-type-c.glb',
  '/assets/glb/kenney/suburban/home-type-d.glb',
  '/assets/glb/kenney/suburban/apartment-block.glb',
  '/assets/glb/kenney/suburban/farmhouse.glb',
  '/assets/glb/kenney/commercial/store-general.glb',
  '/assets/glb/kenney/commercial/detail-awning.glb',
  '/assets/glb/kenney/commercial/cafe-bistro.glb',
  '/assets/glb/kenney/commercial/detail-parasol-a.glb',
  '/assets/glb/kenney/commercial/clinic.glb',
  '/assets/glb/kenney/commercial/school.glb',
  '/assets/glb/kenney/commercial/community-hall.glb',
  '/assets/glb/kenney/industrial/workshop-industrial.glb',
  '/assets/glb/kenney/industrial/warehouse.glb',
  '/assets/glb/kenney/industrial/utility-station.glb',
  '/assets/glb/kenney/suburban/fence-low.glb',
  '/assets/glb/kenney/suburban/path-short.glb',
  '/assets/glb/kenney/suburban/path-long.glb',
  '/assets/glb/kenney/suburban/driveway-short.glb',
  '/assets/glb/kenney/roads/road-driveway-double.glb',
  '/assets/glb/kenney/characters/alex-character.glb',
];

const loader = new GLTFLoader();

async function measureUrl(url) {
  const filePath = path.join(PUBLIC, url.replace(/^\//, ''));
  const buf = readFileSync(filePath);
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  const gltf = await new Promise((resolve, reject) => {
    loader.parse(ab, '', resolve, reject);
  });
  const box = new Box3().setFromObject(gltf.scene);
  const size = box.getSize(new Vector3());
  return {
    min: [box.min.x, box.min.y, box.min.z],
    max: [box.max.x, box.max.y, box.max.z],
    size: [size.x, size.y, size.z],
  };
}

const manifest = {};
for (const url of ASSET_URLS) {
  const bounds = await measureUrl(url);
  manifest[url] = bounds;
  console.log(url.split('/').pop(), bounds.size.map((v) => v.toFixed(3)).join(' × '));
}

writeFileSync(OUT, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Wrote ${OUT}`);
