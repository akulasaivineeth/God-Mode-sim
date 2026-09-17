/**
 * WF02 R15.4 Strategy A Phase 0 — disposable hero-scene proof capture + multi-part evidence.
 *
 * Uses ?evidence=1&r15ScenePhase0Proof=1 (NOT production path).
 *
 * Usage: npm run build && npm run preview -- --host 127.0.0.1 --port 4173 &
 *        npm run proof:wf02-r15-scene-phase0
 */
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ARTIFACTS = '/opt/cursor/artifacts/wf02_r15_scene_phase0';
const DOCS_OUT = 'Docs/milestones/WF02';
const R14_BASELINE = `${DOCS_OUT}/01_r14_overview_dawn.png`;
const NORTH_STAR = 'Docs/art-direction/references/god-mode-town-north-star.png';
const PROOF_BASE = 'http://127.0.0.1:4173/?evidence=1&r15ScenePhase0Proof=1';
const PIXEL_THRESHOLD = 5;

const SHOTS = [
  { name: 'r15_scene_phase0_overview', cam: 'overview', simMinute: 0, waitMs: 5000, primary: true },
  { name: 'r15_scene_phase0_overview_noon', cam: 'overview', simMinute: 360, waitMs: 4500 },
  { name: 'r15_scene_phase0_civic', cam: 'civic', simMinute: 0, waitMs: 3500 },
  { name: 'r15_scene_phase0_commercial', cam: 'commercial', simMinute: 0, waitMs: 3500 },
  {
    name: 'r15_scene_phase0_residential',
    preset: { position: [0, 12, 32], target: [0, 1, 26] },
    simMinute: 0,
    waitMs: 3500,
  },
  { name: 'r15_scene_phase0_river', cam: 'river', simMinute: 0, waitMs: 3500 },
  { name: 'r15_scene_phase0_street', cam: 'store-workshop', simMinute: 0, waitMs: 3800 },
  { name: 'r15_scene_phase0_angled', cam: 'angled', simMinute: 0, waitMs: 3500 },
  { name: 'r15_scene_phase0_night', cam: 'overview', simMinute: 1080, waitMs: 4500 },
];

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
  let highContrastChanged = 0;
  let roiAbsSum = 0;
  let roiPixels = 0;
  const roiLeft = Math.floor(before.info.width * 0.2);
  const roiRight = Math.floor(before.info.width * 0.8);
  const roiTop = Math.floor(before.info.height * 0.2);
  const roiBottom = Math.floor(before.info.height * 0.8);

  for (let py = 0; py < before.info.height; py += 1) {
    for (let px = 0; px < before.info.width; px += 1) {
      const i = (py * before.info.width + px) * 4;
      const dr = Math.abs(before.data[i] - after.data[i]);
      const dg = Math.abs(before.data[i + 1] - after.data[i + 1]);
      const db = Math.abs(before.data[i + 2] - after.data[i + 2]);
      const delta = (dr + dg + db) / 3;
      absSum += delta;
      if (delta >= threshold) changed += 1;
      if (delta >= 20) highContrastChanged += 1;
      if (px >= roiLeft && px < roiRight && py >= roiTop && py < roiBottom) {
        roiAbsSum += delta;
        roiPixels += 1;
      }
    }
  }

  const mae = absSum / pixels;
  const changedPct = (changed / pixels) * 100;
  return {
    threshold,
    mae: Number(mae.toFixed(4)),
    changedPixels: changed,
    changedPct: Number(changedPct.toFixed(2)),
    learningDiagnostics: {
      roiMae: Number((roiAbsSum / roiPixels).toFixed(4)),
      highContrastChangedPct: Number(((highContrastChanged / pixels) * 100).toFixed(2)),
      note: 'Diagnostic only — not automatic PASS for Strategy A',
    },
  };
}

async function computeFrameOccupancy(imagePath) {
  const { data, info } = await sharp(imagePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const counts = {
    builtMass: 0,
    vegetation: 0,
    roads: 0,
    meadowPeriphery: 0,
    river: 0,
    sky: 0,
  };
  const total = info.width * info.height;

  for (let py = 0; py < info.height; py += 1) {
    for (let px = 0; px < info.width; px += 1) {
      const i = (py * info.width + px) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const isSky = py < info.height * 0.22 && r > 120 && g > 150 && b > 180;
      const isGreen = g > r + 8 && g > b + 4;
      const isBlueWater = b > r + 10 && b > g + 2 && g > 80;
      const isGreyRoad = Math.abs(r - g) < 12 && Math.abs(g - b) < 12 && r > 70 && r < 170;
      const isBuilt =
        !isSky &&
        !isGreen &&
        !isBlueWater &&
        ((r > 110 && g > 90 && b < 120) || (r > 130 && g > 120 && b > 100 && Math.abs(r - g) < 35));

      if (isSky) counts.sky += 1;
      else if (isBlueWater) counts.river += 1;
      else if (isGreyRoad) counts.roads += 1;
      else if (isBuilt) counts.builtMass += 1;
      else if (isGreen) counts.vegetation += 1;
      else counts.meadowPeriphery += 1;
    }
  }

  const pct = (n) => Number(((n / total) * 100).toFixed(1));
  return {
    note: 'Descriptive design metric — not a pass substitute',
    builtMassPct: pct(counts.builtMass),
    vegetationPct: pct(counts.vegetation),
    roadsPct: pct(counts.roads),
    meadowPeripheryPct: pct(counts.meadowPeriphery),
    riverPct: pct(counts.river),
    skyPct: pct(counts.sky),
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

async function captureShot(page, baseUrl, shot, outPath) {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__GODMODE_EVIDENCE__?.applyPreset);
  await page.evaluate((m) => window.__GODMODE_EVIDENCE__?.stepToSimMinute(m), shot.simMinute ?? 0);
  if (shot.preset) {
    await page.evaluate((p) => window.__GODMODE_EVIDENCE__?.setCamera?.(p.position, p.target), shot.preset);
  } else {
    await page.evaluate((cam) => window.__GODMODE_EVIDENCE__?.applyPreset(cam), shot.cam);
  }
  await page.waitForTimeout(shot.waitMs ?? 3200);
  await waitFrames(page, 20);
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

  const sceneManifest = JSON.parse(
    readFileSync('src/rendering/heroScene/heroNeighborhoodSceneManifest.json', 'utf8'),
  );
  const provenance = existsSync(`${DOCS_OUT}/r15_hero_scene_provenance.json`)
    ? JSON.parse(readFileSync(`${DOCS_OUT}/r15_hero_scene_provenance.json`, 'utf8'))
    : null;

  const sha = gitSha();
  await mkdir(ARTIFACTS, { recursive: true });
  await mkdir(DOCS_OUT, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const watchers = createAssetWatchers(page);

  const captures = [];
  for (const shot of SHOTS) {
    const outPath = path.join(DOCS_OUT, `${shot.name}.png`);
    await captureShot(page, PROOF_BASE, shot, outPath);
    await copyFile(outPath, path.join(ARTIFACTS, `${shot.name}.png`)).catch(() => {});
    captures.push({
      name: shot.name,
      file: docsRel(shot.name),
      sha256: hashFile(outPath),
      camera: shot.cam ?? 'custom',
    });
  }

  assertCleanAssets(watchers);

  const overviewPath = path.join(DOCS_OUT, 'r15_scene_phase0_overview.png');
  const diagnosticsOverview = await page.evaluate(
    () => window.__GODMODE_EVIDENCE__?.getRenderDiagnostics?.() ?? null,
  );

  await page.evaluate(() => window.__GODMODE_EVIDENCE__?.applyPreset('store-workshop'));
  await page.waitForTimeout(2000);
  await waitFrames(page, 10);
  const diagnosticsStreet = await page.evaluate(
    () => window.__GODMODE_EVIDENCE__?.getRenderDiagnostics?.() ?? null,
  );

  const pixelDelta = await computePixelDelta(R14_BASELINE, overviewPath);
  const frameOccupancyR14 = await computeFrameOccupancy(R14_BASELINE);
  const frameOccupancyScene = await computeFrameOccupancy(overviewPath);

  const comparePath = path.join(DOCS_OUT, 'compare_r14_scene_a_northstar.png');
  const comparePanels = [
    { label: 'R14 BEFORE', file: R14_BASELINE },
    { label: 'Strategy A', file: overviewPath },
  ];
  if (existsSync(NORTH_STAR)) {
    comparePanels.push({ label: 'North-star', file: NORTH_STAR });
  }
  await buildCompareStrip(comparePanels, comparePath);

  const budget = sceneManifest.performanceBudget;
  const hardAbort = {
    doorDeltaWithin03: sceneManifest.doorValidation.every((d) => d.pass),
    heroSceneMeshCount: sceneManifest.meshCount <= sceneManifest.heroSceneDrawBudget.hardStop,
    zeroAssetErrors:
      watchers.networkAssetErrors.length === 0 &&
      watchers.consoleErrors.filter((l) => /failed to load|404/i.test(l)).length === 0,
    overviewDrawCalls:
      diagnosticsOverview?.drawCalls != null &&
      diagnosticsOverview.drawCalls <= budget.overviewDrawCallsMax,
    overviewTriangles:
      diagnosticsOverview?.triangles != null &&
      diagnosticsOverview.triangles < budget.overviewTrianglesMax,
    streetDrawCalls:
      diagnosticsStreet?.drawCalls != null &&
      diagnosticsStreet.drawCalls <= budget.streetDrawCallsMax,
    headroomDrawCalls:
      diagnosticsOverview?.drawCalls != null &&
      budget.overviewDrawCallsMax - diagnosticsOverview.drawCalls >= budget.headroomDrawCallsMin,
    headroomTriangles:
      diagnosticsOverview?.triangles != null &&
      budget.overviewTrianglesMax - diagnosticsOverview.triangles >= budget.headroomTrianglesMin,
  };

  const productSignals = {
    changedPctDiagnostic: pixelDelta.changedPct,
    maeDiagnostic: pixelDelta.mae,
    roiMaeDiagnostic: pixelDelta.learningDiagnostics.roiMae,
    builtMassDeltaPct: Number(
      (frameOccupancyScene.builtMassPct - frameOccupancyR14.builtMassPct).toFixed(1),
    ),
    vegetationDeltaPct: Number(
      (frameOccupancyScene.vegetationPct - frameOccupancyR14.vegetationPct).toFixed(1),
    ),
    meadowPeripheryDeltaPct: Number(
      (frameOccupancyScene.meadowPeripheryPct - frameOccupancyR14.meadowPeripheryPct).toFixed(1),
    ),
    requiresSeniorQualitativeReview: true,
    note: 'Ordinary-viewer north-star gate requires senior review — not auto-scored here',
  };

  const engineeringPass = Object.values(hardAbort).every(Boolean);

  const manifest = {
    sha,
    planRevision: '15.4',
    phase: 0,
    authorization: 'STRATEGY_A_PHASE0_ONLY',
    integrationMode: 'A-offline-authored-hero-neighborhood-scene',
    viewport: { width: 1440, height: 900 },
    camera: {
      policy: 'frozen-default',
      overview: { position: [0, 46, 36], target: [0, 0, 4] },
      note: 'Candidate D not authorized — unchanged gameplay/evidence cameras',
    },
    simMinute: 0,
    clockLabel: '06:00',
    baseline: {
      file: docsRel('01_r14_overview_dawn'),
      sha256: hashFile(R14_BASELINE),
    },
    proof: {
      url: PROOF_BASE,
      overview: {
        file: docsRel('r15_scene_phase0_overview'),
        sha256: hashFile(overviewPath),
      },
    },
    sceneAsset: {
      url: sceneManifest.assetUrl,
      triangles: sceneManifest.bounds.triangles,
      meshCount: sceneManifest.meshCount,
      materialCount: sceneManifest.materialCount,
      partCount: sceneManifest.partCount,
    },
    recipe: {
      file: 'Docs/milestones/WF02/r15_hero_neighborhood_scene_recipe.json',
      provenanceFile: 'Docs/milestones/WF02/r15_hero_scene_provenance.json',
    },
    doorSockets: sceneManifest.doorSockets,
    doorValidation: sceneManifest.doorValidation,
    captures,
    pixelDelta,
    frameOccupancy: {
      r14Baseline: frameOccupancyR14,
      strategyA: frameOccupancyScene,
      delta: {
        builtMassPct: productSignals.builtMassDeltaPct,
        vegetationPct: productSignals.vegetationDeltaPct,
        meadowPeripheryPct: productSignals.meadowPeripheryDeltaPct,
      },
    },
    productSignals,
    hardAbort,
    engineeringPass,
    diagnostics: {
      overview: diagnosticsOverview,
      street: diagnosticsStreet,
    },
    provenanceSummary: provenance
      ? {
          partCount: provenance.partCount,
          sourceMeshCount: provenance.sourceMeshes?.length,
          flattenPipeline: provenance.flattenPipeline,
          license: provenance.license,
        }
      : null,
    consoleErrors: watchers.consoleErrors,
    networkAssetErrors: watchers.networkAssetErrors,
    compareStrip: docsRel('compare_r14_scene_a_northstar'),
  };

  const manifestPath = path.join(DOCS_OUT, 'r15_scene_phase0_proof_manifest.json');
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  await copyFile(manifestPath, path.join(ARTIFACTS, 'r15_scene_phase0_proof_manifest.json')).catch(
    () => {},
  );
  await copyFile(comparePath, path.join(ARTIFACTS, 'compare_r14_scene_a_northstar.png')).catch(
    () => {},
  );

  await browser.close();

  console.log('\nR15 Strategy A Phase 0 proof complete @', sha);
  console.log('Pixel delta (diagnostic):', pixelDelta);
  console.log('Frame occupancy Strategy A:', frameOccupancyScene);
  console.log('Engineering PASS:', engineeringPass);
  console.log('Hard abort:', hardAbort);
  console.log('Diagnostics overview:', diagnosticsOverview);
  console.log('Manifest:', manifestPath);

  if (!engineeringPass) {
    console.error('\nSTRATEGY_A_PHASE0_ENGINEERING_FAIL — STOP. No production wiring.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
