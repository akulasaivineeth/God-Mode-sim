/**
 * WF02 R9 Phase 1 — hero neighborhood evidence capture.
 *
 * Usage: npm run build && npm run preview -- --host 127.0.0.1 --port 4173 &
 *        npm run capture:wf02-r9-neighborhood
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

const OUT = '/opt/cursor/artifacts/wf02_r9_neighborhood';
const DOCS_OUT = 'Docs/milestones/WF02';
const BASE = 'http://127.0.0.1:4173/?evidence=1';
const NORTH_STAR = 'Docs/art-direction/references/god-mode-town-north-star.png';
const R8_SLICE_URL =
  'https://github.com/akulasaivineeth/God-Mode-sim/releases/download/review-evidence-wf02-r8-slice-314d57c/r8_slice_overview_dawn.png';
const REPO = 'akulasaivineeth/God-Mode-sim';
const RELEASE_TAG_PREFIX = 'review-evidence-wf02-r9';

const SHOTS = [
  { name: '01_r9_overview_dawn', cam: 'overview', simMinute: 0, waitMs: 2600, diagnostics: true },
  { name: '01b_r9_overview_noon', cam: 'overview', simMinute: 360, waitMs: 2600, diagnostics: true },
  { name: '02_r9_angled', cam: 'angled', simMinute: 360, waitMs: 2400, diagnostics: true },
  { name: '03_r9_street', cam: 'street', simMinute: 360, waitMs: 2200, diagnostics: true },
  { name: '04_r9_civic', cam: 'civic', simMinute: 360, waitMs: 2200 },
  { name: '05_r9_residential', cam: 'residential', simMinute: 360, waitMs: 2200 },
  { name: '06_r9_commercial', cam: 'commercial', simMinute: 360, waitMs: 2200 },
  { name: '07_r9_store_workshop', cam: 'store-workshop', simMinute: 360, waitMs: 2200 },
  { name: '08_r9_home_street', cam: 'home-street', simMinute: 360, waitMs: 2200 },
  { name: '09_r9_store_street', cam: 'store-street', simMinute: 360, waitMs: 2200 },
  { name: '10_r9_workshop_street', cam: 'workshop-street', simMinute: 360, waitMs: 2200 },
  { name: '11_r9_river_edge', cam: 'river', simMinute: 360, waitMs: 2200 },
  { name: '12_r9_future_lot', preset: { position: [0, 12, 32], target: [0, 1, 26] }, simMinute: 360, waitMs: 1800 },
  { name: '13_r9_night', cam: 'overview', simMinute: 870, waitMs: 2400 },
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

async function buildCompareStrip(panels, outFile) {
  const resized = [];
  for (const panel of panels) {
    const buf = await sharp(panel.file)
      .resize(480, 300, { fit: 'cover' })
      .extend({ top: 28, bottom: 0, left: 0, right: 0, background: { r: 20, g: 24, b: 28 } })
      .composite([
        {
          input: Buffer.from(
            `<svg width="480" height="28"><text x="8" y="20" fill="white" font-size="14" font-family="sans-serif">${panel.label}</text></svg>`,
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
      width: 480 * resized.length,
      height: 328,
      channels: 3,
      background: { r: 20, g: 24, b: 28 },
    },
  })
    .composite(resized.map((input, i) => ({ input, left: i * 480, top: 0 })))
    .png()
    .toBuffer();
  await writeFile(outFile, strip);
}

async function fetchPanel(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
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

  const manifest = {
    sha,
    worldLab: true,
    worldId: 'hero-neighborhood-r9',
    shots: [],
    consoleErrors: [],
    networkAssetErrors: [],
  };

  for (const shot of SHOTS) {
    await page.evaluate((m) => window.__GODMODE_EVIDENCE__?.stepToSimMinute(m), shot.simMinute);
    await applyShotCamera(page, shot);
    await page.waitForTimeout(shot.waitMs);
    await waitFrames(page, 12);
    const out = path.join(OUT, `${shot.name}.png`);
    await page.screenshot({ path: out, fullPage: false });
    const entry = {
      name: shot.name,
      cam: shot.cam ?? 'custom',
      simMinute: shot.simMinute,
      clockLabel: clockLabel(shot.simMinute),
      file: out,
      sha256: hashFile(out),
    };
    if (shot.diagnostics) {
      const diag = await page.evaluate(() => {
        const api = window.__GODMODE_EVIDENCE__;
        return api?.getRenderDiagnostics?.() ?? null;
      });
      entry.diagnostics = diag;
    }
    manifest.shots.push(entry);
    console.log(`Captured ${shot.name} @ ${entry.clockLabel}`, entry.diagnostics ?? '');
  }

  assertCleanAssets(watchers);
  manifest.consoleErrors = watchers.consoleErrors;
  manifest.networkAssetErrors = watchers.networkAssetErrors;

  const comparePath = path.join(OUT, 'compare_r8_r9_northstar.png');
  const r8Panel = path.join(OUT, '_r8_slice_dawn.png');
  try {
    await fetchPanel(R8_SLICE_URL, r8Panel);
  } catch {
    await copyFile(path.join(DOCS_OUT, 'r8_slice_overview_dawn.png'), r8Panel).catch(() => {});
  }
  await buildCompareStrip(
    [
      { label: 'R8 SLICE BLOCKED', file: existsSync(r8Panel) ? r8Panel : path.join(OUT, '01_r9_overview_dawn.png') },
      { label: 'R9 HERO NEIGHBORHOOD', file: path.join(OUT, '01_r9_overview_dawn.png') },
      { label: 'NORTH STAR', file: NORTH_STAR },
    ],
    comparePath,
  );

  const manifestPath = path.join(OUT, 'r9_neighborhood_manifest.json');
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  await copyFile(manifestPath, path.join(DOCS_OUT, 'r9_neighborhood_manifest.json'));
  await copyFile(comparePath, path.join(DOCS_OUT, 'compare_r8_r9_northstar.png'));
  for (const shot of manifest.shots) {
    await copyFile(shot.file, path.join(DOCS_OUT, `${shot.name}.png`)).catch(() => {});
  }

  await browser.close();

  const tag = `${RELEASE_TAG_PREFIX}-${sha.slice(0, 7)}`;
  console.log(`\nEvidence complete @ ${sha}`);
  console.log(`Manifest: ${manifestPath}`);
  console.log(`Suggested release tag: ${tag}`);
  console.log(`Create with: gh release create ${tag} ${OUT}/* --repo ${REPO}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
