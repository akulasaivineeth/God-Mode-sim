/**
 * WF02 R12 — finished-building prototype evidence capture.
 *
 * Usage: npm run build && npm run preview -- --host 127.0.0.1 --port 4173 &
 *        npm run capture:wf02-r12-prototype
 */
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { execSync } from 'node:child_process';

const WORLD_START_OFFSET_MINUTES = 360;

function clockLabel(simMinute) {
  const displayMinute = simMinute + WORLD_START_OFFSET_MINUTES;
  const hour = Math.floor(displayMinute / 60) % 24;
  const minute = displayMinute % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

const OUT = '/opt/cursor/artifacts/wf02_r12_prototype';
const DOCS_OUT = 'Docs/milestones/WF02';
const BASE = 'http://127.0.0.1:4173/?evidence=1';
const NORTH_STAR = 'Docs/art-direction/references/god-mode-town-north-star.png';
const R10_BEFORE = 'Docs/milestones/WF02/01_r10_overview_dawn.png';
const R11_BEFORE = 'Docs/milestones/WF02/01_r11_overview_dawn.png';
const RELEASE_TAG_PREFIX = 'review-evidence-wf02-r12';

const SHOTS = [
  { name: '01_r12_overview_dawn', cam: 'overview', simMinute: 0, waitMs: 3200, diagnostics: true },
  { name: '01b_r12_overview_noon', cam: 'overview', simMinute: 360, waitMs: 3200, diagnostics: true },
  { name: '02_r12_angled', cam: 'angled', simMinute: 360, waitMs: 3000, diagnostics: true },
  { name: '03_r12_civic_closeup', cam: 'civic', simMinute: 360, waitMs: 2800 },
  { name: '04_r12_commercial_closeup', cam: 'commercial', simMinute: 360, waitMs: 2800 },
  { name: '05_r12_residential_closeup', cam: 'residential', simMinute: 360, waitMs: 2800 },
  { name: '06_r12_street_portal', cam: 'street', simMinute: 360, waitMs: 2800, diagnostics: true },
  { name: '07_r12_home_street', cam: 'home-street', simMinute: 420, waitMs: 3200 },
  { name: '08_r12_store_street', cam: 'store-street', simMinute: 420, waitMs: 3200 },
  { name: '09_r12_workshop_street', cam: 'workshop-street', simMinute: 420, waitMs: 3200 },
  { name: '10_r12_street_scale_proof', cam: 'street', simMinute: 420, waitMs: 3400, diagnostics: true },
  { name: '11_r12_night', cam: 'overview', simMinute: 870, waitMs: 2800 },
];

const SILHOUETTE_CROPS = [
  { name: 'silhouette_civic', source: '03_r12_civic_closeup', width: 128, height: 128 },
  { name: 'silhouette_commercial', source: '04_r12_commercial_closeup', width: 128, height: 128 },
  { name: 'silhouette_residential', source: '05_r12_residential_closeup', width: 128, height: 128 },
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
  await page.evaluate((cam) => window.__GODMODE_EVIDENCE__?.applyPreset(cam), shot.cam);
}

async function buildCompareStrip(panels, outFile, panelWidth = 360) {
  const resized = [];
  for (const panel of panels) {
    if (!existsSync(panel.file)) {
      console.warn(`Compare panel missing: ${panel.file}`);
      continue;
    }
    const buf = await sharp(panel.file)
      .resize(panelWidth, 240, { fit: 'cover' })
      .extend({ top: 28, bottom: 0, left: 0, right: 0, background: { r: 20, g: 24, b: 28 } })
      .composite([
        {
          input: Buffer.from(
            `<svg width="${panelWidth}" height="28"><text x="8" y="20" fill="white" font-size="13" font-family="sans-serif">${panel.label}</text></svg>`,
          ),
          top: 0,
          left: 0,
        },
      ])
      .png()
      .toBuffer();
    resized.push(buf);
  }
  const strip = await sharp({
    create: {
      width: panelWidth * resized.length,
      height: 268,
      channels: 3,
      background: { r: 20, g: 24, b: 28 },
    },
  })
    .composite(resized.map((input, i) => ({ input, left: i * panelWidth, top: 0 })))
    .png()
    .toBuffer();
  await writeFile(outFile, strip);
}

async function main() {
  const sha = gitSha();
  await mkdir(OUT, { recursive: true });
  await mkdir(DOCS_OUT, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const watchers = createAssetWatchers(page);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__GODMODE_EVIDENCE__?.applyPreset);

  const audit = JSON.parse(readFileSync('Docs/milestones/WF02/r12_modular_audit.json', 'utf8'));

  const manifest = {
    sha,
    worldLab: true,
    modularPrototype: true,
    planRevision: 12,
    worldId: 'hero-neighborhood-r12-modular',
    measuredGridUnit: audit.measuredGridUnit,
    moduleCount: audit.moduleCount,
    r12NewModules: audit.r12NewModules,
    shots: [],
    silhouettes: [],
    consoleErrors: [],
    networkAssetErrors: [],
  };

  for (const shot of SHOTS) {
    await page.evaluate((m) => window.__GODMODE_EVIDENCE__?.stepToSimMinute(m), shot.simMinute);
    await applyShotCamera(page, shot);
    await page.waitForTimeout(shot.waitMs);
    await waitFrames(page, 15);
    const out = path.join(OUT, `${shot.name}.png`);
    await page.screenshot({ path: out, fullPage: false });
    const entry = {
      name: shot.name,
      cam: shot.cam,
      simMinute: shot.simMinute,
      clockLabel: clockLabel(shot.simMinute),
      file: out,
      sha256: hashFile(out),
    };
    if (shot.diagnostics) {
      entry.diagnostics = await page.evaluate(
        () => window.__GODMODE_EVIDENCE__?.getRenderDiagnostics?.() ?? null,
      );
    }
    manifest.shots.push(entry);
    console.log(`Captured ${shot.name} @ ${entry.clockLabel}`, entry.diagnostics ?? '');
  }

  assertCleanAssets(watchers);
  manifest.consoleErrors = watchers.consoleErrors;
  manifest.networkAssetErrors = watchers.networkAssetErrors;

  for (const crop of SILHOUETTE_CROPS) {
    const src = path.join(OUT, `${crop.source}.png`);
    const out = path.join(OUT, `${crop.name}.png`);
    await sharp(src)
      .resize(crop.width, crop.height, { fit: 'cover', position: 'centre' })
      .png()
      .toFile(out);
    manifest.silhouettes.push({
      name: crop.name,
      file: out,
      sha256: hashFile(out),
    });
    console.log(`Silhouette ${crop.name}`);
  }

  const comparePath = path.join(OUT, 'compare_r10_r11_r12_northstar.png');
  await buildCompareStrip(
    [
      { label: 'R10 BEFORE', file: R10_BEFORE },
      { label: 'R11 (modular grid)', file: R11_BEFORE },
      { label: 'R12 (finished form)', file: path.join(OUT, '01_r12_overview_dawn.png') },
      { label: 'NORTH STAR', file: NORTH_STAR },
    ],
    comparePath,
    360,
  );

  const manifestPath = path.join(OUT, 'r12_prototype_manifest.json');
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  await copyFile(manifestPath, path.join(DOCS_OUT, 'r12_prototype_manifest.json'));
  await copyFile(comparePath, path.join(DOCS_OUT, 'compare_r10_r11_r12_northstar.png'));
  for (const shot of manifest.shots) {
    await copyFile(shot.file, path.join(DOCS_OUT, `${shot.name}.png`)).catch(() => {});
  }
  for (const sil of manifest.silhouettes) {
    await copyFile(sil.file, path.join(DOCS_OUT, `${sil.name}.png`)).catch(() => {});
  }

  await browser.close();

  const tag = `${RELEASE_TAG_PREFIX}-${sha.slice(0, 7)}`;
  console.log(`\nEvidence complete @ ${sha}`);
  console.log(`Manifest: ${manifestPath}`);
  console.log(`Suggested release tag: ${tag}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
