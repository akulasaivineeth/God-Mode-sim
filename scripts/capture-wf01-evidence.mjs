/**
 * WF01 Riverside World Foundation evidence capture.
 *
 * Usage: npm run build && npm run preview -- --host 127.0.0.1 --port 4173 &
 *        npm run capture:wf01-evidence
 */
import { chromium } from '@playwright/test';
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

const OUT = '/opt/cursor/artifacts/wf01_evidence';
const BASE = 'http://127.0.0.1:4173/?evidence=1';
const NORTH_STAR = 'Docs/art-direction/references/god-mode-town-north-star.png';

const SHOTS = [
  { name: 'wf01-overview', cam: 'overview', waitMs: 2200 },
  { name: 'wf01-angled', cam: 'angled', waitMs: 2200 },
  { name: 'wf01-civic', cam: 'square', waitMs: 1800 },
  { name: 'wf01-residential', cam: 'home-street', waitMs: 1800 },
  { name: 'wf01-commercial', cam: 'store-street', waitMs: 1800 },
  { name: 'wf01-work', cam: 'workshop-street', waitMs: 1800 },
  { name: 'wf01-river', cam: 'river', waitMs: 2200 },
  { name: 'wf01-street', cam: 'street', waitMs: 1800 },
];

function hashFile(file) {
  return createHash('sha256').update(readFileSync(file)).digest('hex');
}

async function waitScene(page) {
  await page.goto(BASE);
  await page.getByTestId('r3f-canvas').waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForFunction(
    () => window.__GODMODE_EVIDENCE__?.getCaptureMeta()?.citizenPosition != null,
    null,
    { timeout: 30_000 },
  );
}

async function captureShot(page, shot) {
  await page.evaluate((cam) => window.__GODMODE_EVIDENCE__?.applyPreset(cam), shot.cam);
  await page.waitForTimeout(shot.waitMs);
  for (let i = 0; i < 8; i += 1) {
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(r)));
  }
  const file = path.join(OUT, `${shot.name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  const diag = await page.evaluate(() => window.__GODMODE_EVIDENCE__?.getRenderDiagnostics());
  return { file, hash: hashFile(file).slice(0, 12), diagnostics: diag };
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await waitScene(page);

  const results = [];
  for (const shot of SHOTS) {
    results.push({ ...shot, ...(await captureShot(page, shot)) });
  }

  // Night lighting
  await page.evaluate(() => window.__GODMODE_EVIDENCE__?.setTimeOfDay?.(0.82));
  await page.evaluate((cam) => window.__GODMODE_EVIDENCE__?.applyPreset(cam), 'overview');
  await page.waitForTimeout(2500);
  const nightFile = path.join(OUT, 'wf01-night.png');
  await page.screenshot({ path: nightFile, fullPage: false });
  results.push({ name: 'wf01-night', file: nightFile, hash: hashFile(nightFile).slice(0, 12) });

  // Inspector regression — select citizen
  await page.evaluate(() => window.__GODMODE_EVIDENCE__?.setTimeOfDay?.(0.25));
  await page.evaluate(() => window.__GODMODE_EVIDENCE__?.selectCitizen?.('alex-riverside'));
  await page.waitForTimeout(1200);
  const inspectorFile = path.join(OUT, 'wf01-inspector.png');
  await page.screenshot({ path: inspectorFile, fullPage: false });
  results.push({ name: 'wf01-inspector', file: inspectorFile, hash: hashFile(inspectorFile).slice(0, 12) });

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  const networkErrors = [];
  page.on('response', (res) => {
    if (res.status() >= 400 && res.url().includes('/assets/')) {
      networkErrors.push(`${res.status()} ${res.url()}`);
    }
  });

  const overviewDiag = await page.evaluate(async () => {
    await window.__GODMODE_EVIDENCE__?.applyPreset('overview');
    await new Promise((r) => setTimeout(r, 2000));
    return window.__GODMODE_EVIDENCE__?.sampleRenderDiagnosticsAfterFrames?.(12);
  });

  if (existsSync(NORTH_STAR)) {
    await copyFile(NORTH_STAR, path.join(OUT, 'north-star-reference.png'));
  }

  const manifest = {
    capturedAt: new Date().toISOString(),
    shots: results,
    overviewDiagnostics: overviewDiag,
    consoleErrors,
    networkAssetErrors: networkErrors,
  };
  await writeFile(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(JSON.stringify(manifest, null, 2));
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
