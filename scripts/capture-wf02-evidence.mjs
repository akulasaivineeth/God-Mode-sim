/**
 * WF02 North-Star Scale & Aesthetic Calibration evidence capture.
 *
 * Usage: npm run build && npm run preview -- --host 127.0.0.1 --port 4173 &
 *        npm run capture:wf02-evidence
 */
import { chromium } from '@playwright/test';
import { copyFile, mkdir, writeFile, unlink } from 'node:fs/promises';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { execSync } from 'node:child_process';

const OUT = '/opt/cursor/artifacts/wf02_evidence';
const BASE = 'http://127.0.0.1:4173/?evidence=1';
const NORTH_STAR = 'Docs/art-direction/references/god-mode-town-north-star.png';
const RELEASE_TAG = 'review-evidence-wf02-r51-builder';
const R41_BLOCKED_URL =
  'https://github.com/akulasaivineeth/God-Mode-sim/releases/download/review-evidence-wf02-r41-6dbd8b5/01_wf02_overview_dawn.png';
const R2_OVERVIEW_URL =
  'https://github.com/akulasaivineeth/God-Mode-sim/releases/download/review-evidence-wf02-r2-builder/01_wf02_overview_dawn.png';
const R3_OVERVIEW_URL =
  'https://github.com/akulasaivineeth/God-Mode-sim/releases/download/review-evidence-wf02-r3-8be181c/01_wf02_overview_dawn.png';
const REPO = 'akulasaivineeth/God-Mode-sim';
const WF01_OVERVIEW_URL =
  'https://github.com/akulasaivineeth/God-Mode-sim/releases/download/review-evidence-wf01-builder-r5/01_wf01_overview.png';

const SHOTS = [
  { name: '01_wf02_overview_dawn', cam: 'overview', simMinute: 360, waitMs: 2400, diagnostics: true },
  { name: '01b_wf02_overview_noon', cam: 'overview', simMinute: 720, waitMs: 2400, diagnostics: true },
  { name: '02_wf02_angled', cam: 'angled', simMinute: 720, waitMs: 2400, diagnostics: true },
  { name: '03_wf02_civic', cam: 'square', simMinute: 720, waitMs: 2200 },
  { name: '04_wf02_residential_lots', preset: { position: [58, 52, -38], target: [62, 0, -55] }, simMinute: 720, waitMs: 2000 },
  { name: '05_wf02_commercial_work', cam: 'store-street', simMinute: 720, waitMs: 2200 },
  { name: '05b_wf02_store_workshop', cam: 'store-workshop', simMinute: 720, waitMs: 2200 },
  { name: '06_wf02_farm_edge', preset: { position: [38, 38, 108], target: [48, 2, 86] }, simMinute: 720, waitMs: 2200 },
  { name: '07_wf02_river_park', cam: 'river', simMinute: 720, waitMs: 2400 },
  { name: '08_wf02_street_lived_in', cam: 'street', simMinute: 720, waitMs: 2200, diagnostics: true },
  { name: '09_attachment_house1', preset: { position: [18, 6, -14], target: [11, 2, -8] }, simMinute: 720, waitMs: 1800 },
  { name: '10_attachment_store', cam: 'store-street', simMinute: 720, waitMs: 2000 },
  { name: '11_attachment_workshop', cam: 'workshop-street', simMinute: 720, waitMs: 2000 },
  { name: '12_attachment_community', preset: { position: [-28, 12, -8], target: [-18, 3, -18] }, simMinute: 720, waitMs: 1800 },
  { name: '13_attachment_farmhouse', preset: { position: [58, 10, 92], target: [48, 2, 86] }, simMinute: 720, waitMs: 1800 },
  { name: '14_silhouette_residential', preset: { position: [42, 28, -22], target: [30, 1, -22] }, simMinute: 720, waitMs: 1800 },
  { name: '15_organic_commercial', preset: { position: [-24, 14, 28], target: [-8, 2, 14] }, simMinute: 720, waitMs: 1800 },
];

function hashFile(file) {
  return createHash('sha256').update(readFileSync(file)).digest('hex');
}

function gitSha() {
  return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
}

function createAssetWatchers(page) {
  const consoleErrors = [];
  const pageErrors = [];
  const networkAssetErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => pageErrors.push(String(err)));
  page.on('response', (res) => {
    const url = res.url();
    if (url.includes('/assets/') && res.status() >= 400) {
      networkAssetErrors.push(`${res.status()} ${url}`);
    }
  });
  page.on('requestfailed', (req) => {
    const url = req.url();
    if (url.includes('/assets/')) {
      networkAssetErrors.push(`FAILED ${url} ${req.failure()?.errorText ?? 'unknown'}`);
    }
  });
  return { consoleErrors, pageErrors, networkAssetErrors };
}

function assertCleanAssets(watchers) {
  const loaderErrors = watchers.consoleErrors.filter((line) =>
    /gltf|glb|texture|failed to load|404|could not load/i.test(line),
  );
  const failures = [...watchers.networkAssetErrors, ...loaderErrors, ...watchers.pageErrors];
  if (failures.length > 0) throw new Error(`Asset/network errors:\n${failures.join('\n')}`);
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
  if (shot.simMinute != null) {
    await page.evaluate((minute) => window.__GODMODE_EVIDENCE__?.stepToSimMinute(minute), shot.simMinute);
    await page.waitForTimeout(400);
  }
  await applyShotCamera(page, shot);
  await page.waitForTimeout(shot.waitMs ?? 2000);
  await waitFrames(page, 10);
  const file = path.join(OUT, `${shot.name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  const result = { name: shot.name, file, hash: hashFile(file).slice(0, 12) };
  if (shot.diagnostics) {
    result.diagnostics = await page.evaluate(() =>
      window.__GODMODE_EVIDENCE__?.sampleRenderDiagnosticsAfterFrames?.(12),
    );
  }
  return result;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const staleOverview = path.join(OUT, '01_wf02_overview.png');
  if (existsSync(staleOverview)) {
    await unlink(staleOverview);
  }
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

  await page.evaluate(() => window.__GODMODE_EVIDENCE__?.applyPreset('overview'));
  await page.evaluate(() => window.__GODMODE_EVIDENCE__?.stepToSimMinute(1230));
  await page.waitForTimeout(2500);
  await waitFrames(page, 10);
  const nightFile = path.join(OUT, '16_wf02_night.png');
  await page.screenshot({ path: nightFile, fullPage: false });
  results.push({ name: '16_wf02_night', file: nightFile, hash: hashFile(nightFile).slice(0, 12) });

  const overviewDiagnostics = await page.evaluate(async () => {
    window.__GODMODE_EVIDENCE__?.applyPreset('overview');
    window.__GODMODE_EVIDENCE__?.stepToSimMinute(360);
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

  if (existsSync(staleOverview)) {
    throw new Error('Stale evidence file 01_wf02_overview.png must not be generated');
  }

  const wf01File = path.join(OUT, '00_before_wf01_overview.png');
  execSync(`curl -fsSL "${WF01_OVERVIEW_URL}" -o "${wf01File}"`, { stdio: 'inherit' });
  const r41Blocked = path.join(OUT, '00_prior_r41_blocked_overview_dawn.png');
  try {
    execSync(`curl -fsSL "${R41_BLOCKED_URL}" -o "${r41Blocked}"`, { stdio: 'pipe' });
  } catch {
    console.warn(`R4.1 blocked reference unavailable: ${R41_BLOCKED_URL}`);
  }
  const r2File = path.join(OUT, '00_wf02_r2_overview_dawn.png');
  const r3File = path.join(OUT, '00_wf02_r3_overview_dawn.png');
  for (const [url, dest] of [
    [R2_OVERVIEW_URL, r2File],
    [R3_OVERVIEW_URL, r3File],
  ]) {
    try {
      execSync(`curl -fsSL "${url}" -o "${dest}"`, { stdio: 'pipe' });
    } catch {
      console.warn(`Optional compare asset unavailable: ${url}`);
    }
  }
  const northStarDest = path.join(OUT, '00_north_star_reference.png');
  if (existsSync(NORTH_STAR)) await copyFile(NORTH_STAR, northStarDest);

  const compareHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>WF02 Visual Gate</title>
<style>body{font-family:system-ui;background:#1a1a1a;color:#eee;padding:16px}
.row{display:grid;grid-template-columns:repeat(6,1fr);gap:10px}.col{background:#2a2a2a;padding:8px;border-radius:8px}
img{width:100%;border-radius:4px}.label{font-weight:600;margin-bottom:6px;font-size:12px}</style></head><body>
<h1>WF02 — WF01 → R4.1 blocked → R5.1 CURRENT → North Star (Overview dawn)</h1><div class="row">
<div class="col"><div class="label">WF01 BEFORE</div><img src="00_before_wf01_overview.png"/></div>
<div class="col"><div class="label">R4.1 blocked</div><img src="00_prior_r41_blocked_overview_dawn.png"/></div>
<div class="col"><div class="label">R5.1 CURRENT</div><img src="01_wf02_overview_dawn.png"/></div>
<div class="col"><div class="label">R5.1 noon</div><img src="01b_wf02_overview_noon.png"/></div>
<div class="col"><div class="label">North Star</div><img src="00_north_star_reference.png"/></div>
</div></body></html>`;
  await writeFile(path.join(OUT, 'compare_before_after_northstar.html'), compareHtml);

  const manifest = {
    workItem: 'WF02',
    planRevision: '5.1',
    sha: gitSha(),
    overviewDiagnostics,
    overviewNoonDiagnostics: results.find((r) => r.name === '01b_wf02_overview_noon')?.diagnostics,
    streetDiagnostics,
    angledDiagnostics,
    networkAssetErrors: watchers.networkAssetErrors,
    consoleErrors: watchers.consoleErrors.filter((l) => /gltf|glb|asset|404/i.test(l)),
    shots: results.map(({ name, hash, diagnostics }) => ({ name, hash, diagnostics })),
    performanceGate: {
      overviewDrawCallsMax: 140,
      streetDrawCallsMax: 100,
      overviewDrawCalls: overviewDiagnostics?.drawCalls,
      streetDrawCalls: streetDiagnostics?.drawCalls,
      overviewTriangles: overviewDiagnostics?.triangles,
      streetTriangles: streetDiagnostics?.triangles,
    },
    notes: [
      'WF02 R5.1 warm atlas + nature mass + preset-tier visibility (presentation-only)',
      'Authoritative Overview: 01_wf02_overview_dawn.png / 01b_wf02_overview_noon.png only',
      'Simulation authority and facilityPoints unchanged from WF01',
      'RGB diagnostics supplementary — not visual acceptance proxy',
    ],
  };
  await writeFile(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
  await browser.close();
  console.log(JSON.stringify(manifest, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
