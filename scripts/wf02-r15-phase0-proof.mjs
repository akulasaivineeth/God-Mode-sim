/**
 * WF02 R15 Phase 0 — disposable hero-block composition proof capture + pixel delta.
 *
 * Uses ?evidence=1&r15Phase0Proof=1 (NOT production path).
 * Compares vs R14 Overview @ frozen camera (1440×900).
 *
 * Usage: npm run build && npm run preview -- --host 127.0.0.1 --port 4173 &
 *        npm run proof:wf02-r15-phase0
 */
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { execSync } from 'node:child_process';

const WORLD_START_OFFSET_MINUTES = 360;
const ARTIFACTS = '/opt/cursor/artifacts/wf02_r15_phase0';
const DOCS_OUT = 'Docs/milestones/WF02';
const R14_BASELINE = `${DOCS_OUT}/01_r14_overview_dawn.png`;
const PROOF_BASE = 'http://127.0.0.1:4173/?evidence=1&r15Phase0Proof=1';
const R14_BASE = 'http://127.0.0.1:4173/?evidence=1';
const PIXEL_THRESHOLD = 5;
const MAE_GATE = 8;
const CHANGED_PCT_GATE = 15;

function hashFile(file) {
  return createHash('sha256').update(readFileSync(file)).digest('hex');
}

function gitSha() {
  return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
}

function docsRel(name) {
  return `${DOCS_OUT}/${name}.png`;
}

async function computePixelDelta(beforePath, afterPath, threshold = PIXEL_THRESHOLD) {
  const before = await sharp(beforePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const after = await sharp(afterPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (before.info.width !== after.info.width || before.info.height !== after.info.height) {
    throw new Error('Dimension mismatch between baseline and proof captures');
  }
  const pixels = before.info.width * before.info.height;
  let changed = 0;
  let absSum = 0;
  for (let i = 0; i < before.data.length; i += 4) {
    const dr = Math.abs(before.data[i] - after.data[i]);
    const dg = Math.abs(before.data[i + 1] - after.data[i + 1]);
    const db = Math.abs(before.data[i + 2] - after.data[i + 2]);
    const delta = (dr + dg + db) / 3;
    absSum += delta;
    if (delta >= threshold) changed += 1;
  }
  return {
    threshold,
    mae: Number((absSum / pixels).toFixed(4)),
    changedPixels: changed,
    changedPct: Number(((changed / pixels) * 100).toFixed(2)),
    passMae8: absSum / pixels >= MAE_GATE,
    passChanged15: (changed / pixels) * 100 >= CHANGED_PCT_GATE,
  };
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

async function waitFrames(page, count = 15) {
  for (let i = 0; i < count; i += 1) {
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(r)));
  }
}

async function captureOverview(page, baseUrl, outPath, waitMs = 3400) {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__GODMODE_EVIDENCE__?.applyPreset);
  await page.evaluate((m) => window.__GODMODE_EVIDENCE__?.stepToSimMinute(m), 0);
  await page.evaluate(() => window.__GODMODE_EVIDENCE__?.applyPreset('overview'));
  await page.waitForTimeout(waitMs);
  await waitFrames(page, 18);
  await page.screenshot({ path: outPath, fullPage: false });
}

async function buildCompareStrip(panels, outFile, panelWidth = 360) {
  const resized = [];
  for (const panel of panels) {
    if (!existsSync(panel.file)) continue;
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
  if (!existsSync(R14_BASELINE)) {
    throw new Error(`Missing R14 baseline: ${R14_BASELINE}`);
  }

  const sha = gitSha();
  await mkdir(ARTIFACTS, { recursive: true });
  await mkdir(DOCS_OUT, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const watchers = createAssetWatchers(page);

  const r14LivePath = path.join(ARTIFACTS, 'r14_live_overview_dawn.png');
  await captureOverview(page, R14_BASE, r14LivePath, 3200);

  let baselinePath = R14_BASELINE;
  if (!existsSync(baselinePath)) {
    baselinePath = r14LivePath;
    await copyFile(r14LivePath, R14_BASELINE);
    console.log('R14 baseline PNG missing — seeded from live production capture:', R14_BASELINE);
  }

  const proofPath = path.join(DOCS_OUT, 'r15_phase0_proof_overview.png');
  await captureOverview(page, PROOF_BASE, proofPath, 3600);
  await copyFile(proofPath, path.join(ARTIFACTS, 'r15_phase0_proof_overview.png')).catch(() => {});

  assertCleanAssets(watchers);

  const diagnostics = await page.evaluate(
    () => window.__GODMODE_EVIDENCE__?.getRenderDiagnostics?.() ?? null,
  );

  const pixelDelta = await computePixelDelta(baselinePath, proofPath);

  const comparePath = path.join(DOCS_OUT, 'compare_r14_r15_phase0_proof.png');
  await buildCompareStrip(
    [
      { label: 'R14 (rollout)', file: R14_BASELINE },
      { label: 'R15 Phase0 proof', file: proofPath },
    ],
    comparePath,
  );

  const manifest = {
    sha,
    planRevision: 15,
    phase: 0,
    authorization: 'PHASE_0_ONLY',
    viewport: { width: 1440, height: 900 },
    camera: 'overview',
    simMinute: 0,
    clockLabel: '06:00',
    baseline: {
      file: docsRel('01_r14_overview_dawn'),
      sha256: hashFile(baselinePath),
      source: baselinePath === R14_BASELINE ? 'committed' : 'live_production_capture',
    },
    proof: {
      name: 'r15_phase0_proof_overview',
      file: docsRel('r15_phase0_proof_overview'),
      sha256: hashFile(proofPath),
      url: PROOF_BASE,
    },
    pixelDelta,
    gates: {
      maeMin: MAE_GATE,
      changedPctMin: CHANGED_PCT_GATE,
      pass: pixelDelta.passMae8 && pixelDelta.passChanged15,
    },
    diagnostics,
    consoleErrors: watchers.consoleErrors,
    networkAssetErrors: watchers.networkAssetErrors,
  };

  const manifestPath = path.join(DOCS_OUT, 'r15_phase0_proof_manifest.json');
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  await copyFile(manifestPath, path.join(ARTIFACTS, 'r15_phase0_proof_manifest.json')).catch(() => {});

  await browser.close();

  console.log('\nR15 Phase 0 proof complete @', sha);
  console.log('Pixel delta:', pixelDelta);
  console.log('Gate PASS:', manifest.gates.pass);
  console.log('Manifest:', manifestPath);

  if (!manifest.gates.pass) {
    console.error('\nPHASE_0_FAIL — STOP for senior arbitration (Path B). Do not implement Phase 1.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
