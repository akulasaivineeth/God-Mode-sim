/**
 * WF01 Riverside World Foundation evidence capture + GitHub release publish.
 *
 * Usage: npm run build && npm run preview -- --host 127.0.0.1 --port 4173 &
 *        npm run capture:wf01-evidence
 */
import { chromium } from '@playwright/test';
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { execSync } from 'node:child_process';

const OUT = '/opt/cursor/artifacts/wf01_evidence';
const BASE = 'http://127.0.0.1:4173/?evidence=1';
const NORTH_STAR = 'Docs/art-direction/references/god-mode-town-north-star.png';
const RELEASE_TAG = 'review-evidence-wf01-builder-r5';
const REPO = 'akulasaivineeth/God-Mode-sim';
const R4_OVERVIEW_URL =
  'https://github.com/akulasaivineeth/God-Mode-sim/releases/download/review-evidence-wf01-builder-r4/01_wf01_overview.png';

const RIVER_EVIDENCE_THRESHOLDS = {
  g1OverviewRoiWater: 0.02,
  g2Continuity: 0.35,
  g3RiverObliqueWater: 0.04,
};

const SHOTS = [
  { name: '01_wf01_overview', cam: 'overview', waitMs: 2400, diagnostics: true },
  { name: '02_wf01_angled', cam: 'angled', waitMs: 2400, diagnostics: true },
  { name: '03_wf01_civic', cam: 'square', waitMs: 2000 },
  { name: '04_wf01_residential_lots', preset: { position: [58, 52, -38], target: [62, 0, -55] }, waitMs: 2000 },
  { name: '05_wf01_commercial_work', cam: 'store-street', waitMs: 2000 },
  { name: '06_wf01_farm_edge', preset: { position: [38, 38, 108], target: [48, 2, 86] }, waitMs: 2200 },
  { name: '07_wf01_river_bridge_park', cam: 'river', waitMs: 2400 },
  { name: '08_wf01_street', cam: 'street', waitMs: 2000, diagnostics: true },
  { name: '09_road_topology_topdown', preset: { position: [0, 165, 0.1], target: [0, 0, 0] }, waitMs: 2200 },
  { name: '10_road_junction_center', preset: { position: [-12, 18, 18], target: [0, 0, 0] }, waitMs: 1800 },
  { name: '11_road_junction_residential', preset: { position: [22, 16, -28], target: [8, 0, -30] }, waitMs: 1800 },
  { name: '12_road_junction_commercial', preset: { position: [-18, 14, 32], target: [0, 0, 18] }, waitMs: 1800 },
  { name: '13_road_junction_bridge', preset: { position: [58, 14, 18], target: [74, 0, 0] }, waitMs: 1800 },
];

function hashFile(file) {
  return createHash('sha256').update(readFileSync(file)).digest('hex');
}

function createAssetWatchers(page) {
  const consoleErrors = [];
  const pageErrors = [];
  const networkAssetErrors = [];
  const assetRequests = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => {
    pageErrors.push(String(err));
  });
  page.on('response', (res) => {
    const url = res.url();
    if (!url.includes('/assets/')) return;
    assetRequests.push({ url, status: res.status() });
    if (res.status() >= 400) networkAssetErrors.push(`${res.status()} ${url}`);
  });
  page.on('requestfailed', (req) => {
    const url = req.url();
    if (url.includes('/assets/')) {
      networkAssetErrors.push(`FAILED ${url} ${req.failure()?.errorText ?? 'unknown'}`);
    }
  });

  return { consoleErrors, pageErrors, networkAssetErrors, assetRequests };
}

function assertCleanAssets(watchers) {
  const loaderErrors = watchers.consoleErrors.filter((line) =>
    /gltf|glb|texture|failed to load|404|could not load/i.test(line),
  );
  const failures = [
    ...watchers.networkAssetErrors,
    ...loaderErrors,
    ...watchers.pageErrors.filter((line) => /gltf|glb|texture|asset/i.test(line)),
  ];
  if (failures.length > 0) {
    throw new Error(`Asset/network errors detected:\n${failures.join('\n')}`);
  }
}

async function waitFrames(page, count = 10) {
  for (let i = 0; i < count; i += 1) {
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(r)));
  }
}

async function applyShotCamera(page, shot) {
  if (shot.cam) {
    await page.evaluate((cam) => window.__GODMODE_EVIDENCE__?.applyPreset(cam), shot.cam);
  } else if (shot.preset) {
    await page.evaluate(
      ({ position, target }) => window.__GODMODE_EVIDENCE__?.setCamera(position, target),
      shot.preset,
    );
  }
}

async function captureShot(page, shot) {
  await applyShotCamera(page, shot);
  await page.waitForTimeout(shot.waitMs ?? 2000);
  await waitFrames(page, 10);
  const file = path.join(OUT, `${shot.name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  const result = { name: shot.name, file, hash: hashFile(file).slice(0, 12) };
  if (shot.diagnostics) {
    const diag = await page.evaluate(() =>
      window.__GODMODE_EVIDENCE__?.sampleRenderDiagnosticsAfterFrames?.(12),
    );
    result.diagnostics = diag;
  }
  return result;
}

async function downloadReferenceOverview(url, dest) {
  execSync(`curl -fsSL "${url}" -o "${dest}"`, { stdio: 'inherit' });
}

function buildCompareHtml(r4Url, r5Url, northStarUrl) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>WF01 Visual Gate R5</title>
<style>
body{font-family:system-ui,sans-serif;background:#1a1a1a;color:#eee;margin:0;padding:16px}
h1{font-size:1.1rem} .row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
.col{background:#2a2a2a;padding:8px;border-radius:8px} img{width:100%;height:auto;border-radius:4px}
.label{font-weight:600;margin-bottom:6px;font-size:0.85rem}
</style></head><body>
<h1>WF01 Visual Gate — R4.1 → R5 → North Star</h1>
<div class="row">
  <div class="col"><div class="label">R4.1 BEFORE Overview</div><img src="${r4Url}" alt="r4"/></div>
  <div class="col"><div class="label">R5 CURRENT Overview</div><img src="${r5Url}" alt="r5"/></div>
  <div class="col"><div class="label">North Star Reference</div><img src="${northStarUrl}" alt="north-star"/></div>
</div>
</body></html>`;
}

async function analysePngRiverMetrics(page, pngBuffer) {
  return page.evaluate(
    async ({ buffer, thresholds }) => {
      const blob = new Blob([new Uint8Array(buffer)], { type: 'image/png' });
      const bitmap = await createImageBitmap(blob);
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(bitmap, 0, 0);
      const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const isWater = (r, g, b) => {
        if (b < 90 || b <= r + 15) return false;
        if (g > b + 10) return false;
        if (r > 140) return false;
        const saturation = b - Math.min(r, g);
        return saturation >= 18 && b > g;
      };
      const rx0 = Math.floor(width * 0.55);
      const ry0 = 0;
      const rx1 = width;
      const ry1 = height;
      let roiTotal = 0;
      let roiWater = 0;
      let frameTotal = 0;
      let frameWater = 0;
      const midY = Math.floor((ry0 + ry1) / 2);
      let currentRun = 0;
      let maxRun = 0;
      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const i = (y * width + x) * 4;
          const water = isWater(data[i], data[i + 1], data[i + 2]);
          frameTotal += 1;
          if (water) frameWater += 1;
          if (x >= rx0 && x < rx1 && y >= ry0 && y < ry1) {
            roiTotal += 1;
            if (water) roiWater += 1;
            if (y === midY) {
              if (water) {
                currentRun += 1;
                maxRun = Math.max(maxRun, currentRun);
              } else {
                currentRun = 0;
              }
            }
          }
        }
      }
      const roiWidth = rx1 - rx0;
      return {
        waterFraction: roiTotal > 0 ? roiWater / roiTotal : 0,
        fullFrameWaterFraction: frameTotal > 0 ? frameWater / frameTotal : 0,
        continuityFraction: roiWidth > 0 ? maxRun / roiWidth : 0,
        thresholds,
        g1: roiTotal > 0 ? roiWater / roiTotal >= thresholds.g1OverviewRoiWater : false,
        g2: roiWidth > 0 ? maxRun / roiWidth >= thresholds.g2Continuity : false,
        g3: frameTotal > 0 ? frameWater / frameTotal >= thresholds.g3RiverObliqueWater : false,
      };
    },
    { buffer: [...pngBuffer], thresholds: RIVER_EVIDENCE_THRESHOLDS },
  );
}

async function publishRelease(files, manifest) {
  try {
    execSync(`gh release view ${RELEASE_TAG} --repo ${REPO}`, { stdio: 'ignore' });
    execSync(`gh release delete ${RELEASE_TAG} --repo ${REPO} --yes`, { stdio: 'inherit' });
  } catch {
    /* first publish */
  }
  const notes = [
    'WF01 Revision 5 — terrain carve river corridor + district massing + image-space diagnostics',
    '',
    `Overview: ${manifest.overviewDiagnostics?.drawCalls} draw calls / ${manifest.overviewDiagnostics?.triangles} triangles`,
    `Street: ${manifest.streetDiagnostics?.drawCalls} draw calls / ${manifest.streetDiagnostics?.triangles} triangles`,
    `Asset errors: ${manifest.networkAssetErrors.length} network / ${manifest.consoleErrors.length} console`,
    '',
    'Includes BEFORE→WF01→north-star compare panel and road topology proof shots.',
  ].join('\n');
  const fileArgs = files.map((f) => `${path.join(OUT, f)}#${f}`).join(' ');
  execSync(
    `gh release create ${RELEASE_TAG} --repo ${REPO} --title "WF01 builder evidence (Revision 5)" --notes "${notes.replace(/"/g, '\\"')}" ${fileArgs}`,
    { stdio: 'inherit' },
  );
  return `https://github.com/${REPO}/releases/tag/${RELEASE_TAG}`;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const watchers = createAssetWatchers(page);

  await page.goto(BASE);
  await page.getByTestId('r3f-canvas').waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForFunction(
    () => window.__GODMODE_EVIDENCE__?.getCaptureMeta()?.citizenPosition != null,
    null,
    { timeout: 30_000 },
  );
  await waitFrames(page, 15);

  const results = [];
  for (const shot of SHOTS) {
    results.push(await captureShot(page, shot));
  }

  // Night — seek sim clock to ~20:30 so practical lamps read.
  await page.evaluate(() => window.__GODMODE_EVIDENCE__?.applyPreset('overview'));
  await page.evaluate(() => window.__GODMODE_EVIDENCE__?.stepToSimMinute(1230));
  await page.waitForTimeout(2500);
  await waitFrames(page, 10);
  const nightFile = path.join(OUT, '14_wf01_night.png');
  await page.screenshot({ path: nightFile, fullPage: false });
  results.push({ name: '14_wf01_night', file: nightFile, hash: hashFile(nightFile).slice(0, 12) });

  // Inspector / citizen regression — home-street shows Alex + HUD inspector panel
  await page.evaluate(() => window.__GODMODE_EVIDENCE__?.stepToSimMinute(480));
  await page.evaluate(() => window.__GODMODE_EVIDENCE__?.applyPreset('home-street'));
  await page.waitForTimeout(2000);
  await waitFrames(page, 8);
  const inspectorFile = path.join(OUT, '15_wf01_inspector.png');
  await page.screenshot({ path: inspectorFile, fullPage: false });
  results.push({ name: '15_wf01_inspector', file: inspectorFile, hash: hashFile(inspectorFile).slice(0, 12) });

  const overviewDiagnostics = await page.evaluate(async () => {
    window.__GODMODE_EVIDENCE__?.applyPreset('overview');
    await new Promise((r) => setTimeout(r, 2000));
    return window.__GODMODE_EVIDENCE__?.sampleRenderDiagnosticsAfterFrames?.(12);
  });
  const streetDiagnostics = await page.evaluate(async () => {
    window.__GODMODE_EVIDENCE__?.applyPreset('street');
    await new Promise((r) => setTimeout(r, 2000));
    return window.__GODMODE_EVIDENCE__?.sampleRenderDiagnosticsAfterFrames?.(12);
  });
  const angledDiagnostics = await page.evaluate(async () => {
    window.__GODMODE_EVIDENCE__?.applyPreset('angled');
    await new Promise((r) => setTimeout(r, 2000));
    return window.__GODMODE_EVIDENCE__?.sampleRenderDiagnosticsAfterFrames?.(12);
  });

  assertCleanAssets(watchers);

  const r4File = path.join(OUT, '00_before_r4_overview.png');
  await downloadReferenceOverview(R4_OVERVIEW_URL, r4File);

  const northStarOut = path.join(OUT, '00_north_star_reference.png');
  if (existsSync(NORTH_STAR)) {
    await copyFile(NORTH_STAR, northStarOut);
  }

  const overviewPng = readFileSync(path.join(OUT, '01_wf01_overview.png'));
  const riverPng = readFileSync(path.join(OUT, '07_wf01_river_bridge_park.png'));
  const overviewRiverMetrics = await analysePngRiverMetrics(page, overviewPng);
  const riverObliqueMetrics = await analysePngRiverMetrics(page, riverPng);

  const releaseBase = `https://github.com/${REPO}/releases/download/${RELEASE_TAG}`;
  const compareHtml = buildCompareHtml(
    `${releaseBase}/00_before_r4_overview.png`,
    `${releaseBase}/01_wf01_overview.png`,
    `${releaseBase}/00_north_star_reference.png`,
  );
  await writeFile(path.join(OUT, 'compare_visual_gate.html'), compareHtml);

  const manifest = {
    capturedAt: new Date().toISOString(),
    releaseTag: RELEASE_TAG,
    shots: results,
    overviewDiagnostics,
    streetDiagnostics,
    angledDiagnostics,
    riverReadability: {
      overview: overviewRiverMetrics,
      riverOblique: riverObliqueMetrics,
      gates: {
        g1_overviewRoiWater: overviewRiverMetrics.g1,
        g2_continuity: overviewRiverMetrics.g2,
        g3_riverObliqueWater: riverObliqueMetrics.g3,
      },
    },
    consoleErrors: watchers.consoleErrors,
    pageErrors: watchers.pageErrors,
    networkAssetErrors: watchers.networkAssetErrors,
    assetRequestCount: watchers.assetRequests.length,
    r4OverviewUrl: R4_OVERVIEW_URL,
  };
  await writeFile(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));

  const releaseFiles = [
    '00_before_r4_overview.png',
    '00_north_star_reference.png',
    '01_wf01_overview.png',
    '02_wf01_angled.png',
    '03_wf01_civic.png',
    '04_wf01_residential_lots.png',
    '05_wf01_commercial_work.png',
    '06_wf01_farm_edge.png',
    '07_wf01_river_bridge_park.png',
    '08_wf01_street.png',
    '09_road_topology_topdown.png',
    '10_road_junction_center.png',
    '11_road_junction_residential.png',
    '12_road_junction_commercial.png',
    '13_road_junction_bridge.png',
    '14_wf01_night.png',
    '15_wf01_inspector.png',
    'compare_visual_gate.html',
    'manifest.json',
  ].filter((f) => existsSync(path.join(OUT, f)));

  const releaseUrl = await publishRelease(releaseFiles, manifest);
  manifest.releaseUrl = releaseUrl;
  await writeFile(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));

  console.log(JSON.stringify({ ...manifest, releaseUrl }, null, 2));
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
