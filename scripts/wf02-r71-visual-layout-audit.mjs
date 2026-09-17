/**
 * WF02 R7.1 Phase 0 — visual layout plausibility audit (presentation offsets only).
 * Sim entrances unchanged. Uses R7.1 proposed visual centers.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

globalThis.self = globalThis;
globalThis.window = globalThis;

const root = path.dirname(fileURLToPath(import.meta.url));
const publicRoot = path.join(root, '..', 'public');

const VISUAL = [
  { id: 'house-1', url: '/assets/glb/kenney/suburban/home-cottage.glb', width: 11.2, rot: -Math.PI / 2, auth: { x: 11, z: -10 }, visual: { x: 14, z: -8 }, maxM: 4 },
  { id: 'house-2', url: '/assets/glb/kenney/suburban/home-type-a.glb', width: 11.0, rot: -Math.PI / 2, auth: { x: 30, z: -12 }, visual: { x: 28, z: -10 }, maxM: 4 },
  { id: 'house-3', url: '/assets/glb/kenney/suburban/home-type-c.glb', width: 11.0, rot: 0, auth: { x: 11, z: -30 }, visual: { x: 14, z: -28 }, maxM: 4 },
  { id: 'house-4', url: '/assets/glb/kenney/suburban/home-type-d.glb', width: 11.2, rot: -Math.PI / 2, auth: { x: 30, z: -30 }, visual: { x: 28, z: -28 }, maxM: 4 },
  { id: 'apartment', url: '/assets/glb/kenney/suburban/apartment-block.glb', width: 16.0, rot: -Math.PI / 2, auth: { x: 52, z: -22 }, visual: { x: 46, z: -20 }, maxM: 8 },
  { id: 'community-hall', url: '/assets/glb/kenney/commercial/community-hall.glb', width: 16.0, rot: Math.PI, auth: { x: -18, z: -18 }, visual: { x: -16, z: -14 }, maxM: 6 },
  { id: 'clinic', url: '/assets/glb/kenney/commercial/clinic.glb', width: 13.5, rot: Math.PI, auth: { x: -42, z: -14 }, visual: { x: -38, z: -12 }, maxM: 6 },
  { id: 'school', url: '/assets/glb/kenney/commercial/school.glb', width: 17.5, rot: Math.PI, auth: { x: -24, z: -48 }, visual: { x: -22, z: -44 }, maxM: 6 },
  { id: 'store', url: '/assets/glb/kenney/commercial/store-general.glb', width: 13.5, rot: 0, auth: { x: -11, z: 11 }, visual: { x: -10, z: 6 }, maxM: 5.5 },
  { id: 'cafe', url: '/assets/glb/kenney/commercial/cafe-bistro.glb', width: 12.2, rot: Math.PI, auth: { x: -30, z: 12 }, visual: { x: -28, z: 10 }, maxM: 5 },
  { id: 'workshop', url: '/assets/glb/kenney/industrial/workshop-industrial.glb', width: 15.0, rot: 0, auth: { x: -11, z: 23 }, visual: { x: -10, z: 20 }, maxM: 5 },
  { id: 'warehouse', url: '/assets/glb/kenney/industrial/warehouse.glb', width: 19.0, rot: Math.PI, auth: { x: -38, z: 48 }, visual: { x: -36, z: 42 }, maxM: 8 },
  { id: 'utility', url: '/assets/glb/kenney/industrial/utility-station.glb', width: 13.5, rot: Math.PI, auth: { x: -52, z: 30 }, visual: { x: -48, z: 28 }, maxM: 8 },
  { id: 'farmhouse', url: '/assets/glb/kenney/suburban/farmhouse.glb', width: 12.5, rot: -Math.PI / 2, auth: { x: 28, z: 82 }, visual: { x: 32, z: 68 }, maxM: 16 },
];

const SIM_ENTRANCES = {
  'house-1': { x: 11, z: -7.6 },
  store: { x: -11, z: 7.6 },
  workshop: { x: -11, z: 20.2 },
};

const manifest = JSON.parse(
  fs.readFileSync(path.join(root, '..', 'src/rendering/assets/modelLayoutManifest.json'), 'utf8'),
);

function layoutFor(url, targetWidth) {
  const entry = manifest[url];
  const footprint = Math.max(entry.size[0], entry.size[2], 0.001);
  const scale = targetWidth / footprint;
  const min = entry.min.map((v) => v * scale);
  const max = entry.max.map((v) => v * scale);
  return { min, max, height: max[1] - min[1] };
}

function rotatedFootprint(layout, rotY) {
  const corners = [
    [layout.min[0], layout.min[2]],
    [layout.min[0], layout.max[2]],
    [layout.max[0], layout.min[2]],
    [layout.max[0], layout.max[2]],
  ];
  const cos = Math.cos(rotY);
  const sin = Math.sin(rotY);
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (const [x, z] of corners) {
    const rx = x * cos - z * sin;
    const rz = x * sin + z * cos;
    minX = Math.min(minX, rx);
    maxX = Math.max(maxX, rx);
    minZ = Math.min(minZ, rz);
    maxZ = Math.max(maxZ, rz);
  }
  return { halfWidthX: (maxX - minX) / 2, halfWidthZ: (maxZ - minZ) / 2, height: layout.height };
}

function aabb(center, foot) {
  return {
    minX: center.x - foot.halfWidthX,
    maxX: center.x + foot.halfWidthX,
    minZ: center.z - foot.halfWidthZ,
    maxZ: center.z + foot.halfWidthZ,
    height: foot.height,
  };
}

function offsetM(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

async function main() {
  const results = [];
  for (const b of VISUAL) {
    const layout = layoutFor(b.url, b.width);
    const foot = rotatedFootprint(layout, b.rot);
    const authBox = aabb(b.auth, foot);
    const visBox = aabb(b.visual, foot);
    const delta = offsetM(b.auth, b.visual);
    results.push({
      id: b.id,
      auth: b.auth,
      visual: b.visual,
      deltaM: +delta.toFixed(2),
      maxM: b.maxM,
      withinMax: delta <= b.maxM + 0.01,
      visualAabb: {
        x: `[${visBox.minX.toFixed(1)}, ${visBox.maxX.toFixed(1)}]`,
        z: `[${visBox.minZ.toFixed(1)}, ${visBox.maxZ.toFixed(1)}]`,
        heightM: +visBox.height.toFixed(1),
      },
    });
  }

  const store = VISUAL.find((b) => b.id === 'store');
  const workshop = VISUAL.find((b) => b.id === 'workshop');
  const sFoot = rotatedFootprint(layoutFor(store.url, store.width), store.rot);
  const wFoot = rotatedFootprint(layoutFor(workshop.url, workshop.width), workshop.rot);
  const sBox = aabb(store.visual, sFoot);
  const wBox = aabb(workshop.visual, wFoot);
  const gapZ = wBox.minZ - sBox.maxZ;

  const out = {
    mappings: results,
    m02: {
      simEntrancesUnchanged: SIM_ENTRANCES,
      storeWorkshopVisualGapZ: +gapZ.toFixed(2),
      gapGate: gapZ >= 0.1,
      storeEntranceToVisualAabb: SIM_ENTRANCES.store.z - sBox.maxZ,
      workshopEntranceToVisualAabb: SIM_ENTRANCES.workshop.z - wBox.maxZ,
    },
    allWithinMaxOffset: results.every((r) => r.withinMax),
  };

  const outPath = path.join(root, '..', 'Docs/milestones/WF02/visual_layout_audit_r71.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
  console.log(`Wrote ${outPath}`);
}

main();
