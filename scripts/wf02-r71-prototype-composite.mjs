/**
 * WF02 Plan R7.1 Phase 0b — pixel-composited composition prototypes.
 * Overlays proposed hero core, envelopes, voids, and visual building shifts
 * on frozen-camera R6 evidence frames. No runtime/engine changes.
 *
 * Usage: node scripts/wf02-r71-prototype-composite.mjs
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { PerspectiveCamera, Vector3 } from 'three';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(ROOT, '..');
const OUT_DIR = path.join(REPO, 'Docs/milestones/WF02');
const EVIDENCE = '/opt/cursor/artifacts/wf02_evidence';
const NORTH_STAR = path.join(REPO, 'Docs/art-direction/references/god-mode-town-north-star.png');

const W = 1440;
const H = 900;

const CAMERA_PRESETS = {
  overview: { position: [10, 93, 54], target: [30, 2, 4] },
  angled: { position: [68, 53, 37], target: [28, 3, 2] },
};

/** R7.1 §5.3 — auth → visual (sim truth unchanged) */
export const VISUAL_MAPPINGS = [
  { id: 'community-hall', auth: [-18, -18], visual: [-16, -14], rotY: Math.PI, rotD: 0, maxM: 6 },
  { id: 'clinic', auth: [-42, -14], visual: [-38, -12], rotY: Math.PI, rotD: -0.03, maxM: 6 },
  { id: 'school', auth: [-24, -48], visual: [-22, -44], rotY: Math.PI, rotD: 0, maxM: 6 },
  { id: 'house-1', auth: [11, -10], visual: [14, -8], rotY: -Math.PI / 2, rotD: 0, maxM: 4 },
  { id: 'house-2', auth: [30, -12], visual: [28, -10], rotY: -Math.PI / 2, rotD: 0.06, maxM: 4 },
  { id: 'house-3', auth: [11, -30], visual: [14, -28], rotY: 0, rotD: 0, maxM: 4 },
  { id: 'house-4', auth: [30, -30], visual: [28, -28], rotY: -Math.PI / 2, rotD: -0.04, maxM: 4 },
  { id: 'apartment', auth: [52, -22], visual: [46, -20], rotY: -Math.PI / 2, rotD: 0.04, maxM: 8 },
  { id: 'store', auth: [-11, 11], visual: [-10, 6], rotY: 0, rotD: 0, maxM: 5.5 },
  { id: 'cafe', auth: [-30, 12], visual: [-28, 10], rotY: Math.PI, rotD: 0.05, maxM: 5 },
  { id: 'workshop', auth: [-11, 23], visual: [-10, 20], rotY: 0, rotD: -0.03, maxM: 5 },
  { id: 'warehouse', auth: [-38, 48], visual: [-36, 42], rotY: Math.PI, rotD: 0, maxM: 8 },
  { id: 'utility', auth: [-52, 30], visual: [-48, 28], rotY: Math.PI, rotD: -0.05, maxM: 6 },
  { id: 'farmhouse', auth: [28, 82], visual: [32, 68], rotY: -Math.PI / 2, rotD: 0, maxM: 16 },
];

const TARGET_WIDTHS = {
  'house-1': 11.2, 'house-2': 11.0, 'house-3': 11.0, 'house-4': 11.2,
  apartment: 16.0, 'community-hall': 16.0, clinic: 13.5, school: 17.5,
  store: 13.5, cafe: 12.2, workshop: 15.0, warehouse: 19.0, utility: 13.5, farmhouse: 12.5,
};

const ENVELOPES = [
  { id: 'hero-core', color: 'rgba(255,220,100,0.08)', stroke: '#ffcc33', width: 2, dash: '12,6',
    poly: [[-55, -55], [55, -55], [55, 35], [-55, 35]] },
  { id: 'civic-plaza', color: 'rgba(245,230,200,0.45)', stroke: '#c9a86c', width: 1,
    poly: [[-26, -26], [-6, -26], [-6, -6], [-26, -6]] },
  { id: 'civic-colonnade', color: 'rgba(40,80,45,0.35)', stroke: '#2d5a32', width: 1,
    poly: [[-28, -28], [-4, -28], [-4, -4], [-28, -4]], inset: 3 },
  { id: 'commercial-frontage', color: 'rgba(210,180,140,0.4)', stroke: '#a08050', width: 1,
    poly: [[-48, 2], [-6, 2], [-6, 28], [-48, 28]] },
  { id: 'residential-cluster', color: 'rgba(180,220,160,0.35)', stroke: '#5a8a4a', width: 1,
    poly: [[8, -34], [34, -34], [34, -6], [8, -6]] },
  { id: 'future-lot-row', color: 'rgba(200,210,180,0.3)', stroke: '#7a8a6a', width: 1,
    poly: [[44, -64], [80, -64], [80, -46], [44, -46]] },
  { id: 'orchard-block', color: 'rgba(30,70,35,0.5)', stroke: '#1a4020', width: 2,
    poly: [[52, 58], [88, 58], [88, 78], [52, 78]] },
  { id: 'field-band', color: 'rgba(220,200,120,0.4)', stroke: '#b89850', width: 1,
    poly: [[50, 52], [90, 52], [90, 58], [50, 58]] },
  { id: 'park-u-frame', color: 'rgba(60,120,70,0.35)', stroke: '#3a7040', width: 1,
    poly: [[18, 32], [18, 52], [58, 52], [58, 32], [48, 32], [48, 42], [28, 42], [28, 32]] },
  { id: 'periphery-north', color: 'rgba(25,50,30,0.45)', stroke: '#1a3520', width: 1,
    poly: [[-100, -102], [100, -102], [100, -94], [-100, -94]] },
  { id: 'embankment-civic', color: 'rgba(180,160,130,0.25)', stroke: '#887755', width: 1,
    poly: [[-30, -30], [0, -30], [0, 0], [-30, 0]] },
];

const VOIDS = [
  { id: 'founder-meadow', label: 'Founder growth meadow', poly: [[5, 18], [42, 18], [42, 55], [5, 55]] },
  { id: 'main-cross', label: 'Main cross (road authority)', poly: [[-3, -3], [3, -3], [3, 3], [-3, 3]] },
  { id: 'river-corridor', label: 'River landscape frame', poly: [[74, -20], [110, -20], [110, 60], [74, 60]] },
  { id: 'expansion-east', label: 'Future expansion meadow', poly: [[55, 55], [100, 55], [100, 95], [55, 95]] },
];

function makeCamera(preset) {
  const cam = new PerspectiveCamera(45, W / H, 0.1, 500);
  cam.position.set(...preset.position);
  cam.lookAt(...preset.target);
  cam.updateMatrixWorld(true);
  return cam;
}

function project(cam, x, y, z) {
  const v = new Vector3(x, y, z);
  v.project(cam);
  return {
    x: (v.x * 0.5 + 0.5) * W,
    y: (-v.y * 0.5 + 0.5) * H,
    visible: v.z <= 1,
  };
}

function polyPath(cam, points, y = 0) {
  const pts = points.map(([x, z]) => project(cam, x, y, z));
  if (pts.some((p) => !p.visible)) return null;
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';
}

function insetRect(poly, inset) {
  const xs = poly.map((p) => p[0]);
  const zs = poly.map((p) => p[1]);
  const minX = Math.min(...xs) + inset;
  const maxX = Math.max(...xs) - inset;
  const minZ = Math.min(...zs) + inset;
  const maxZ = Math.max(...zs) - inset;
  return [[minX, minZ], [maxX, minZ], [maxX, maxZ], [minX, maxZ]];
}

function dist2d(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function buildSvg(cam, title) {
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;

  for (const env of ENVELOPES) {
    const pts = env.inset ? insetRect(env.poly, env.inset) : env.poly;
    const d = polyPath(cam, pts, env.id.includes('embankment') ? 0.3 : 0);
    if (!d) continue;
    svg += `<path d="${d}" fill="${env.color}" stroke="${env.stroke}" stroke-width="${env.width}"${env.dash ? ` stroke-dasharray="${env.dash}"` : ''}/>`;
  }

  for (const v of VOIDS) {
    const d = polyPath(cam, v.poly, 0.05);
    if (!d) continue;
    svg += `<path d="${d}" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.35)" stroke-width="1" stroke-dasharray="4,4"/>`;
    const c = project(cam, (v.poly[0][0] + v.poly[2][0]) / 2, 0.2, (v.poly[0][1] + v.poly[2][1]) / 2);
    if (c.visible) {
      svg += `<text x="${c.x.toFixed(1)}" y="${c.y.toFixed(1)}" fill="rgba(255,255,255,0.85)" font-size="11" font-family="sans-serif" text-anchor="middle">${v.label}</text>`;
    }
  }

  for (const m of VISUAL_MAPPINGS) {
    const a = project(cam, m.auth[0], 1, m.auth[1]);
    const v = project(cam, m.visual[0], 1, m.visual[1]);
    if (!a.visible || !v.visible) continue;
    const w = TARGET_WIDTHS[m.id] ?? 12;
    svg += `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${v.x.toFixed(1)}" y2="${v.y.toFixed(1)}" stroke="rgba(255,100,100,0.7)" stroke-width="1.5" marker-end="url(#arrow)"/>`;
    svg += `<circle cx="${a.x.toFixed(1)}" cy="${a.y.toFixed(1)}" r="4" fill="rgba(255,80,80,0.5)" stroke="#ff4444" stroke-width="1"/>`;
    svg += `<rect x="${(v.x - w * 2).toFixed(1)}" y="${(v.y - w).toFixed(1)}" width="${(w * 4).toFixed(1)}" height="${(w * 2).toFixed(1)}" fill="rgba(255,180,100,0.25)" stroke="#ff9933" stroke-width="1.5" rx="2"/>`;
    svg += `<text x="${v.x.toFixed(1)}" y="${(v.y - w * 1.2).toFixed(1)}" fill="#ffcc66" font-size="10" font-family="monospace" text-anchor="middle">${m.id}</text>`;
  }

  svg += `<defs><marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,100,100,0.9)"/></marker></defs>`;
  svg += `<text x="20" y="32" fill="rgba(255,255,255,0.9)" font-size="18" font-family="sans-serif" font-weight="bold">${title}</text>`;
  svg += `<text x="20" y="52" fill="rgba(255,255,255,0.7)" font-size="12" font-family="sans-serif">R7.1 Phase 0 composited prototype — sim centers (red) → visual (orange)</text>`;
  svg += '</svg>';
  return svg;
}

async function composite(basePath, camKey, outName, title) {
  const cam = makeCamera(CAMERA_PRESETS[camKey]);
  const svg = buildSvg(cam, title);
  const svgBuf = Buffer.from(svg);

  const base = sharp(basePath).ensureAlpha();
  const overlay = sharp(svgBuf).png();
  const meta = await base.metadata();

  const composed = await base
    .composite([{ input: await overlay.toBuffer(), top: 0, left: 0 }])
    .png()
    .toBuffer();

  const outPath = path.join(OUT_DIR, outName);
  writeFileSync(outPath, composed);
  console.log(`Wrote ${outPath} (${meta.width}x${meta.height})`);
  return outPath;
}

async function compareStrip() {
  const panels = [
    { file: path.join(EVIDENCE, '01_wf02_overview_dawn.png'), label: 'R6 blocked @ 743a259' },
    { file: path.join(OUT_DIR, 'prototype_overview_r71.png'), label: 'R7.1 prototype' },
    { file: NORTH_STAR, label: 'North star' },
  ];

  const resized = [];
  for (const p of panels) {
    const buf = await sharp(p.file)
      .resize(480, 300, { fit: 'cover' })
      .extend({ top: 28, bottom: 0, left: 0, right: 0, background: { r: 20, g: 24, b: 28 } })
      .composite([{
        input: Buffer.from(
          `<svg width="480" height="28"><text x="8" y="20" fill="white" font-size="14" font-family="sans-serif">${p.label}</text></svg>`,
        ),
        top: 0,
        left: 0,
      }])
      .png()
      .toBuffer();
    resized.push(buf);
  }

  const strip = await sharp({
    create: { width: 480 * 3, height: 328, channels: 4, background: { r: 16, g: 18, b: 22 } },
  })
    .composite([
      { input: resized[0], left: 0, top: 0 },
      { input: resized[1], left: 480, top: 0 },
      { input: resized[2], left: 960, top: 0 },
    ])
    .png()
    .toBuffer();

  const out = path.join(OUT_DIR, 'compare_r6_prototype_northstar_r71.png');
  writeFileSync(out, strip);
  console.log(`Wrote ${out}`);
}

function writeCompositionMapSvg() {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <rect width="800" height="600" fill="#3a5a3a"/>
  <text x="400" y="24" text-anchor="middle" fill="#fff" font-size="16" font-family="sans-serif">WF02 R7.1 Hero Core Map (world X/Z, Y up) — frozen Overview camera subject</text>
  <!-- Hero core -->
  <rect x="120" y="180" width="280" height="220" fill="rgba(255,220,100,0.15)" stroke="#ffcc33" stroke-width="2" stroke-dasharray="8,4"/>
  <text x="260" y="200" text-anchor="middle" fill="#ffcc33" font-size="11">HERO CORE ~120m</text>
  <!-- Districts -->
  <rect x="130" y="200" width="80" height="70" fill="rgba(245,230,200,0.5)" stroke="#c9a86c"/><text x="170" y="240" text-anchor="middle" fill="#333" font-size="9">Civic</text>
  <rect x="130" y="280" width="120" height="50" fill="rgba(210,180,140,0.5)" stroke="#a08050"/><text x="190" y="308" text-anchor="middle" fill="#333" font-size="9">Commercial/work</text>
  <rect x="260" y="210" width="120" height="100" fill="rgba(180,220,160,0.5)" stroke="#5a8a4a"/><text x="320" y="265" text-anchor="middle" fill="#333" font-size="9">Residential cluster</text>
  <rect x="280" y="320" width="100" height="40" fill="rgba(200,210,180,0.4)" stroke="#7a8a6a"/><text x="330" y="345" text-anchor="middle" fill="#333" font-size="8">Future lots</text>
  <!-- Outer -->
  <rect x="420" y="120" width="100" height="60" fill="rgba(30,70,35,0.6)" stroke="#1a4020"/><text x="470" y="155" text-anchor="middle" fill="#fff" font-size="9">Orchard block</text>
  <path d="M400,160 L400,200 L480,200 L480,160 Z" fill="rgba(60,120,70,0.5)" stroke="#3a7040"/><text x="440" y="185" text-anchor="middle" fill="#fff" font-size="8">Park U-frame</text>
  <rect x="100" y="80" width="600" height="20" fill="rgba(25,50,30,0.6)" stroke="#1a3520"/><text x="400" y="94" text-anchor="middle" fill="#ccc" font-size="9">Periphery forest band</text>
  <!-- Voids -->
  <rect x="300" y="240" width="80" height="60" fill="none" stroke="rgba(255,255,255,0.5)" stroke-dasharray="4,4"/><text x="340" y="275" text-anchor="middle" fill="#eee" font-size="8">Founder meadow</text>
  <rect x="230" y="260" width="30" height="30" fill="none" stroke="#fff" stroke-width="2"/><text x="245" y="278" text-anchor="middle" fill="#fff" font-size="7">Cross</text>
  <!-- River -->
  <rect x="520" y="100" width="40" height="400" fill="rgba(60,140,200,0.4)" stroke="#3080b0"/><text x="540" y="300" fill="#fff" font-size="10" transform="rotate(90 540 300)">River</text>
  <text x="400" y="580" text-anchor="middle" fill="#aaa" font-size="10">Presentation-only envelopes — simulation geography unchanged</text>
</svg>`;
  writeFileSync(path.join(OUT_DIR, 'composition_map_r71.svg'), svg);
}

function writeFailureOverlaySvg() {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" width="1440" height="900">
  <image href="prototype_overview_r71.png" width="1440" height="900" opacity="0.85"/>
  <text x="720" y="40" text-anchor="middle" fill="#ff6666" font-size="20" font-weight="bold">R6 failure diagnosis @ 743a259</text>
  <text x="200" y="520" fill="#ffcc00" font-size="14">Orchard: dispersed dots → solid block</text>
  <text x="350" y="380" fill="#ffcc00" font-size="14">Civic: empty plaza → warm pad + ring</text>
  <text x="550" y="450" fill="#ffcc00" font-size="14">Residential: islands → cluster bands</text>
  <text x="150" y="350" fill="#ffcc00" font-size="14">Commercial: float → frontage band</text>
  <text x="450" y="280" fill="#ffcc00" font-size="14">240m board reads unused → hero core</text>
</svg>`;
  writeFileSync(path.join(OUT_DIR, 'r6_failure_overlay_r71.svg'), svg);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const overviewBase = path.join(EVIDENCE, '01_wf02_overview_dawn.png');
  const angledBase = path.join(EVIDENCE, '02_wf02_angled.png');

  await composite(overviewBase, 'overview', 'prototype_overview_r71.png', 'Overview 06:00 — R7.1 Composition Prototype');
  await composite(angledBase, 'angled', 'prototype_angled_r71.png', 'Angled — R7.1 Composition Prototype');

  writeCompositionMapSvg();
  writeFailureOverlaySvg();
  await compareStrip();

  const manifest = {
    phase: '0b',
    baseSha: '743a2599409bfa0531807f2dc574aa25c475bc1b',
    cameras: CAMERA_PRESETS,
    visualMappings: VISUAL_MAPPINGS,
    performanceLedger: {
      r6Baseline: { overviewDc: '117-120', overviewTris: '45536-45872' },
      prototypeEstimate: {
        optionA_visualLayout: { dc: 0, tris: 0 },
        optionB_envelopeFills: { dc: '+6..+12', tris: '+18k..+35k' },
        optionC_verticalLayer: { dc: '+1..+2', tris: '+4k..+10k' },
        optionD_curatedProps: { dc: '+1..+2', tris: '+2k..+6k' },
        target: { overviewDc: 125, overviewTris: 100000, hardCapDc: 135, hardCapTris: 118000 },
        m03Reserve: { dc: 5, tris: 8000, note: 'LOD/culling required per M03_HEADROOM.md' },
      },
    },
    verticalLayerDecision: {
      selected: true,
      mechanism: 'PresentationTerrainLayer embankment skirts + CVP retaining edges',
      maxHeightM: 0.8,
      rollback: 'Remove PresentationTerrainLayer from OverviewCompositionLayer; revert envelopeFillBuilders heights',
      simTerrainUnchanged: true,
    },
    assetImports: { phase0: 0, proposedPhase2: GAP_CANDIDATES?.length ?? 5 },
  };

  writeFileSync(path.join(OUT_DIR, 'phase0_manifest_r71.json'), JSON.stringify(manifest, null, 2));
  console.log('Phase 0b composite complete');
}

const GAP_CANDIDATES = 5;

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
