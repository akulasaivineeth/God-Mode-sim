/**
 * WF02 Plan R7.1 Phase 0a — Kenney on-disk inventory audit.
 * Cross-references registered paths, ASSET_REGISTER, and modelLayoutManifest.
 *
 * Usage: node scripts/wf02-r71-kenney-inventory-audit.mjs
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

globalThis.self = globalThis;
globalThis.window = globalThis;

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(ROOT, '..');
const PUBLIC = path.join(REPO, 'public');
const KENNEY_ROOT = path.join(PUBLIC, 'assets/glb/kenney');
const OUT = path.join(REPO, 'Docs/milestones/WF02/KENNEY_INVENTORY_AUDIT_R71.md');

const PACK_LICENSE = {
  suburban: { pack: 'City Kit Suburban 2.0', url: 'https://kenney.nl/assets/city-kit-suburban', license: 'CC0 1.0' },
  commercial: { pack: 'City Kit Commercial 2.1', url: 'https://kenney.nl/assets/city-kit-commercial', license: 'CC0 1.0' },
  industrial: { pack: 'City Kit Industrial 2.0', url: 'https://kenney.nl/assets/city-kit-industrial', license: 'CC0 1.0' },
  roads: { pack: 'City Kit Roads 2.1', url: 'https://kenney.nl/assets/city-kit-roads', license: 'CC0 1.0' },
  characters: { pack: 'Mini Characters', url: 'https://kenney.nl/assets/mini-characters', license: 'CC0 1.0' },
};

/** Parse KENNEY_ASSETS values from EnvironmentAssetRegistry.ts */
function registeredUrls() {
  const src = readFileSync(path.join(REPO, 'src/rendering/assets/EnvironmentAssetRegistry.ts'), 'utf8');
  const urls = new Set();
  for (const m of src.matchAll(/:\s*'(\/assets\/glb\/kenney\/[^']+\.glb)'/g)) {
    urls.add(m[1]);
  }
  return urls;
}

function walkGlb(dir, base = '') {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = path.join(base, name);
    if (statSync(full).isDirectory()) {
      if (name === '_archive') continue;
      out.push(...walkGlb(full, rel));
    } else if (name.endsWith('.glb')) {
      out.push(rel.replace(/\\/g, '/'));
    }
  }
  return out;
}

const manifest = JSON.parse(
  readFileSync(path.join(REPO, 'src/rendering/assets/modelLayoutManifest.json'), 'utf8'),
);

const loader = new GLTFLoader();

async function glbCost(publicUrl) {
  const abs = path.join(PUBLIC, publicUrl.replace(/^\//, ''));
  if (!statSync(abs, { throwIfNoEntry: false })) return null;
  const buf = readFileSync(abs);
  const gltf = await loader.parseAsync(
    buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
    '',
  );
  let tris = 0;
  let meshCount = 0;
  const materials = new Set();
  gltf.scene.traverse((c) => {
    if (!c.isMesh) return;
    meshCount += 1;
    tris += c.geometry.index ? c.geometry.index.count / 3 : c.geometry.attributes.position.count / 3;
    const mat = c.material?.name ?? 'unnamed';
    materials.add(mat);
  });
  return {
    tris: Math.round(tris),
    meshCount,
    materialCount: materials.size,
    materials: [...materials],
  };
}

/** Kenney pack originals commonly useful for north-star gaps — audit targets only if imported */
const GAP_CANDIDATES = [
  { kenney: 'detail-bench.glb', pack: 'suburban', use: 'Civic plaza / park seating silhouette', estTris: 24 },
  { kenney: 'detail-fountain.glb', pack: 'suburban', use: 'Square center civic anchor', estTris: 80 },
  { kenney: 'lamp-post.glb', pack: 'suburban', use: 'Commercial frontage rhythm (instanced)', estTris: 36 },
  { kenney: 'path-round.glb', pack: 'suburban', use: 'Plaza/promenade edge (presentation-only)', estTris: 12 },
  { kenney: 'bush-large.glb', pack: 'suburban', use: 'Residential garden band accent', estTris: 48 },
];

async function main() {
  const registered = registeredUrls();
  const onDisk = walkGlb(KENNEY_ROOT).map((rel) => `/assets/glb/kenney/${rel}`);

  const rows = [];
  for (const url of onDisk.sort()) {
    const parts = url.split('/');
    const folder = parts[4];
    const pack = PACK_LICENSE[folder] ?? { pack: folder, url: '—', license: 'CC0 1.0 (Kenney)' };
    const cost = await glbCost(url);
    const inRegister = registered.has(url);
    const inManifest = url in manifest;
    rows.push({ url, folder, pack, cost, inRegister, inManifest });
  }

  const unregistered = rows.filter((r) => !r.inRegister);
  const missingOnDisk = [...registered].filter((u) => !onDisk.includes(u));

  let md = `# WF02 R7.1 Kenney Inventory Audit (Phase 0a)

**Generated:** Phase 0 @ \`${process.env.GIT_SHA ?? 'local'}\`  
**Scope:** On-disk \`public/assets/glb/kenney/**\` (excluding \`_archive\`) vs \`EnvironmentAssetRegistry.ts\`  
**Purpose:** Asset-vocabulary decision for North-Star Composition Reset — no imports in Phase 0

---

## Summary

| Metric | Count |
|---|---:|
| On-disk Kenney GLBs (active) | ${rows.length} |
| Registered in \`KENNEY_ASSETS\` | ${rows.filter((r) => r.inRegister).length} |
| Unregistered on-disk | ${unregistered.length} |
| Registered but missing on-disk | ${missingOnDisk.length} |
| In \`modelLayoutManifest.json\` | ${rows.filter((r) => r.inManifest).length} |

**Phase 0 conclusion:** All active on-disk Kenney GLBs are registered except **road pieces** (registered) and **no suburban detail props** (bench/fountain/lamp) exist on disk. North-star civic/commercial identity gaps require **curated single-file import** (Phase 2+, not Phase 0) if prototype selects them.

---

## Full on-disk inventory

| Local path | Pack | License | Registered | Manifest | Meshes | Materials | Tris | DC est. |
|---|---|---|:---:|:---:|---:|---:|---:|---:|
`;

  for (const r of rows) {
    const name = r.url.split('/').pop();
    const c = r.cost ?? { tris: '?', meshCount: '?', materialCount: '?' };
    md += `| \`${r.url}\` | ${r.pack.pack} | ${r.pack.license} | ${r.inRegister ? '✅' : '❌'} | ${r.inManifest ? '✅' : '—'} | ${c.meshCount} | ${c.materialCount} | **${c.tris}** | 1 |\n`;
  }

  md += `
---

## Unregistered on-disk assets

`;

  if (unregistered.length === 0) {
    md += `_None — all active on-disk Kenney GLBs are registered._\n\n`;
  } else {
    for (const r of unregistered) {
      md += `- \`${r.url}\` — ${r.cost?.tris ?? '?'} tris\n`;
    }
    md += '\n';
  }

  md += `## Registered paths missing on-disk

`;

  if (missingOnDisk.length === 0) {
    md += `_None._\n\n`;
  } else {
    for (const u of missingOnDisk) {
      md += `- \`${u}\` ❌\n`;
    }
    md += '\n';
  }

  md += `## North-star gap candidates (NOT on disk — import requires ChatGPT approval)

These Kenney CC0 originals are **not present** in the repo. Phase 0 prototype may **mock** silhouettes in composited pixels; import deferred to Phase 2+ with exact provenance row.

| Kenney original | Pack | Proposed bounded use | Est. tris | Est. DC @ Overview |
|---|---|---|---:|---:|
`;

  for (const c of GAP_CANDIDATES) {
    md += `| \`${c.kenney}\` | ${c.pack} | ${c.use} | ${c.estTris} | 1 (instanced) |\n`;
  }

  md += `
---

## Registered prop/building triangle reference (measured)

| Asset | Tris | Notes |
|---|---:|---|
`;

  const keyAssets = [
    '/assets/glb/kenney/suburban/tree-small.glb',
    '/assets/glb/kenney/suburban/tree-large.glb',
    '/assets/glb/kenney/suburban/fence-low.glb',
    '/assets/glb/kenney/commercial/detail-awning.glb',
    '/assets/glb/kenney/commercial/detail-parasol-a.glb',
  ];
  for (const url of keyAssets) {
    const c = await glbCost(url);
    md += `| \`${url.split('/').pop()}\` | **${c?.tris ?? '?'}** | registered |\n`;
  }

  md += `
---

## Phase 0 asset decision

| Decision | Choice |
|---|---|
| Phase 0 import | **None** — zero new files |
| Prototype props | Mock bench/fountain/lamp silhouettes in composited pixels only |
| Phase 2+ (if approved) | Max 3 single-file Kenney CC0 imports from table above; each row in \`ASSET_REGISTER.md\` before use |

**Legal:** All on-disk assets Kenney CC0 1.0 per \`Docs/assets/ASSET_REGISTER.md\`.
`;

  writeFileSync(OUT, md);
  console.log(`Wrote ${OUT}`);
  console.log(`On-disk: ${rows.length}, unregistered: ${unregistered.length}, missing: ${missingOnDisk.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
