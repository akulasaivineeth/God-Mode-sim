/**
 * One-off audit script for WF02 Plan R4.1 — not part of CI.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// GLTFLoader image decode expects browser globals in Node.
globalThis.self = globalThis;
globalThis.window = globalThis;

const root = path.dirname(fileURLToPath(import.meta.url));
const publicRoot = path.join(root, '..', 'public');

const BUILDINGS = [
  { id: 'house-1', url: '/assets/glb/kenney/suburban/home-cottage.glb', width: 11.2, rot: -Math.PI / 2, off: [0, 0, 0], rotD: 0, center: { x: 11, z: -10 } },
  { id: 'house-2', url: '/assets/glb/kenney/suburban/home-type-a.glb', width: 11.0, rot: -Math.PI / 2, off: [0.35, 0, -0.25], rotD: 0.06, center: { x: 30, z: -12 } },
  { id: 'house-3', url: '/assets/glb/kenney/suburban/home-type-c.glb', width: 11.0, rot: 0, off: [0, 0, 0], rotD: 0, center: { x: 11, z: -30 } },
  { id: 'house-4', url: '/assets/glb/kenney/suburban/home-type-d.glb', width: 11.2, rot: -Math.PI / 2, off: [-0.2, 0, 0.3], rotD: -0.04, center: { x: 30, z: -30 } },
  { id: 'apartment', url: '/assets/glb/kenney/suburban/apartment-block.glb', width: 16.0, rot: -Math.PI / 2, off: [0.25, 0, 0.35], rotD: 0.04, center: { x: 52, z: -22 } },
  { id: 'community-hall', url: '/assets/glb/kenney/commercial/community-hall.glb', width: 16.0, rot: Math.PI, off: [0, 0, 0], rotD: 0, center: { x: -18, z: -18 } },
  { id: 'clinic', url: '/assets/glb/kenney/commercial/clinic.glb', width: 13.5, rot: Math.PI, off: [-0.3, 0, 0.2], rotD: -0.03, center: { x: -42, z: -14 } },
  { id: 'school', url: '/assets/glb/kenney/commercial/school.glb', width: 17.5, rot: Math.PI, off: [0, 0, 0], rotD: 0, center: { x: -24, z: -48 } },
  { id: 'store', url: '/assets/glb/kenney/commercial/store-general.glb', width: 13.5, rot: 0, off: [0, 0, 0], rotD: 0, center: { x: -11, z: 11 } },
  { id: 'cafe', url: '/assets/glb/kenney/commercial/cafe-bistro.glb', width: 12.2, rot: Math.PI, off: [0.4, 0, -0.15], rotD: 0.05, center: { x: -30, z: 12 } },
  { id: 'workshop', url: '/assets/glb/kenney/industrial/workshop-industrial.glb', width: 15.0, rot: 0, off: [0.6, 0, 1.8], rotD: -0.03, center: { x: -11, z: 23 } },
  { id: 'warehouse', url: '/assets/glb/kenney/industrial/warehouse.glb', width: 19.0, rot: Math.PI, off: [0, 0, 0], rotD: 0, center: { x: -38, z: 48 } },
  { id: 'utility', url: '/assets/glb/kenney/industrial/utility-station.glb', width: 13.5, rot: Math.PI, off: [-0.35, 0, -0.2], rotD: -0.05, center: { x: -52, z: 30 } },
  { id: 'farmhouse', url: '/assets/glb/kenney/suburban/farmhouse.glb', width: 12.5, rot: -Math.PI / 2, off: [0, 0, 0], rotD: 0, center: { x: 28, z: 82 } },
];

const ENTRANCES = {
  'house-1': { x: 11, z: -7.6 },
  store: { x: -11, z: 7.6 },
  workshop: { x: -11, z: 20.2 },
};

const VACANT = [
  { id: 'plot-1', center: { x: 48, z: -48 } },
  { id: 'plot-2', center: { x: 62, z: -48 } },
  { id: 'plot-3', center: { x: 76, z: -48 } },
  { id: 'plot-4', center: { x: 48, z: -62 } },
  { id: 'plot-5', center: { x: 62, z: -62 } },
  { id: 'plot-6', center: { x: 76, z: -62 } },
  { id: 'plot-7', center: { x: 88, z: -22 } },
  { id: 'plot-8', center: { x: 95, z: -8 } },
];

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
  return {
    halfWidthX: (maxX - minX) / 2,
    halfWidthZ: (maxZ - minZ) / 2,
    height: layout.height,
  };
}

function aabb(center, foot, off) {
  const cx = center.x + off[0];
  const cz = center.z + off[2];
  return {
    minX: cx - foot.halfWidthX,
    maxX: cx + foot.halfWidthX,
    minZ: cz - foot.halfWidthZ,
    maxZ: cz + foot.halfWidthZ,
    height: foot.height,
  };
}

function pointInBox(p, box, margin = 0) {
  return p.x >= box.minX - margin && p.x <= box.maxX + margin && p.z >= box.minZ - margin && p.z <= box.maxZ + margin;
}

const loader = new GLTFLoader();

async function glbStats(relUrl) {
  const abs = path.join(publicRoot, relUrl.replace(/^\//, ''));
  const buffer = fs.readFileSync(abs);
  const gltf = await loader.parseAsync(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength), '');
  const meshes = [];
  let tris = 0;
  gltf.scene.traverse((c) => {
    if (!c.isMesh) return;
    const t = c.geometry.index ? c.geometry.index.count / 3 : c.geometry.attributes.position.count / 3;
    tris += t;
    meshes.push({ name: c.name || '(unnamed)', material: c.material?.name || '?', tris: Math.round(t) });
  });
  return { meshCount: meshes.length, tris: Math.round(tris), meshes };
}

async function main() {
  console.log('=== BUILDING GLB STRUCTURE (roof tint audit) ===');
  for (const b of BUILDINGS) {
    const s = await glbStats(b.url);
    console.log(`${b.id}: meshes=${s.meshCount} tris=${s.tris} ${JSON.stringify(s.meshes)}`);
  }

  console.log('\n=== PROP GLB TRIANGLE COSTS ===');
  const props = [
    '/assets/glb/kenney/suburban/tree-small.glb',
    '/assets/glb/kenney/suburban/tree-large.glb',
    '/assets/glb/kenney/suburban/fence-low.glb',
    '/assets/glb/kenney/suburban/path-short.glb',
    '/assets/glb/kenney/suburban/path-long.glb',
    '/assets/glb/kenney/suburban/driveway-short.glb',
    '/assets/glb/kenney/nature/common-tree-1.glb',
    '/assets/glb/quaternius/CommonTree.glb',
    '/assets/glb/quaternius/PineTree.glb',
    '/assets/glb/quaternius/Bush.glb',
  ];
  for (const url of props) {
    try {
      const s = await glbStats(url);
      console.log(`${url.split('/').pop()}: tris=${s.tris} meshes=${s.meshCount} dc=${s.meshCount}`);
    } catch (e) {
      console.log(`${url}: MISSING`);
    }
  }

  console.log('\n=== 14-FACILITY SCALE TABLE ===');
  const boxes = {};
  for (const b of BUILDINGS) {
    const layout = layoutFor(b.url, b.width);
    const foot = rotatedFootprint(layout, b.rot + b.rotD);
    const box = aabb(b.center, foot, b.off);
    boxes[b.id] = box;
    const ent = ENTRANCES[b.id];
    const entClear = ent
      ? Math.min(
          ent.x - box.minX,
          box.maxX - ent.x,
          ent.z - box.minZ,
          box.maxZ - ent.z,
        )
      : null;
    console.log(
      [
        b.id,
        `w=${b.width}`,
        `center(${b.center.x},${b.center.z})`,
        `off[${b.off.join(',')}] rotD=${b.rotD.toFixed(2)}`,
        `AABB x[${box.minX.toFixed(1)},${box.maxX.toFixed(1)}] z[${box.minZ.toFixed(1)},${box.maxZ.toFixed(1)}] h=${box.height.toFixed(1)}`,
        ent ? `ent(${ent.x},${ent.z}) clear=${entClear?.toFixed(1)}m` : '',
      ].join(' | '),
    );
  }

  const storeBox = boxes.store;
  const workshopBox = boxes.workshop;
  const gapZ =
    Math.abs(23 + 1.8 - 11) -
    (storeBox.maxZ - 11) -
    (workshopBox.maxZ - (23 + 1.8));
  // recompute gap properly
  const storeHalfZ = (storeBox.maxZ - storeBox.minZ) / 2;
  const workshopHalfZ = (workshopBox.maxZ - workshopBox.minZ) / 2;
  const wcz = 23 + 1.8;
  const gap = Math.abs(wcz - 11) - storeHalfZ - workshopHalfZ;
  console.log(`\nstore/workshop presentation gapZ=${gap.toFixed(2)}m storeAABB z[${storeBox.minZ.toFixed(1)},${storeBox.maxZ.toFixed(1)}] workshop z[${workshopBox.minZ.toFixed(1)},${workshopBox.maxZ.toFixed(1)}]`);

  console.log('\n=== R4.1 MASSING OVERLAP AUDIT (planned zones vs entrances) ===');
  const zones = [
    { name: 'civic-frame-trees', circles: [[-14, -14, 2.5], [14, -14, 2.5], [-14, 14, 2.5], [14, 14, 2.5]] },
    { name: 'residential-hedge-band', rect: { minX: 8, maxX: 82, minZ: -65, maxZ: -8 } },
    { name: 'commercial-frontage', rect: { minX: -58, maxX: -2, minZ: 8, maxZ: 52 } },
    { name: 'farm-orchard', rect: { minX: 36, maxX: 70, minZ: 72, maxZ: 103 } },
    { name: 'river-park-edge', rect: { minX: 58, maxX: 96, minZ: 24, maxZ: 52 } },
  ];
  for (const id of ['house-1', 'store', 'workshop']) {
    const ent = ENTRANCES[id];
    for (const z of zones) {
      if (z.rect) {
        const inside = ent.x >= z.rect.minX && ent.x <= z.rect.maxX && ent.z >= z.rect.minZ && ent.z <= z.rect.maxZ;
        if (inside) console.log(`WARN ${id} entrance inside ${z.name}`);
      }
    }
  }
}

main().catch(console.error);
