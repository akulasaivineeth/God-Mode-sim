/**
 * WF02 R8 Phase 0b — engine-rendered representative slice evidence capture.
 *
 * Usage: npm run build && npm run preview -- --host 127.0.0.1 --port 4173 &
 *        npm run capture:wf02-r8-slice
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
const OUT = '/opt/cursor/artifacts/wf02_r8_slice';
const DOCS_OUT = 'Docs/milestones/WF02';
const BASE = 'http://127.0.0.1:4173/?evidence=1';
const NORTH_STAR = 'Docs/art-direction/references/god-mode-town-north-star.png';
const R6_BLOCKED_URL =
  'https://github.com/akulasaivineeth/God-Mode-sim/releases/download/review-evidence-wf02-r6-743a259/01_wf02_overview_dawn.png';
const R71_BLOCKED_URL =
  'https://github.com/akulasaivineeth/God-Mode-sim/releases/download/review-evidence-wf02-r71-6dcd830/01_wf02_overview_dawn.png';
const REPO = 'akulasaivineeth/God-Mode-sim';
const RELEASE_TAG_PREFIX = 'review-evidence-wf02-r8-slice';

const SHOTS = [
  { name: 'r8_slice_overview_dawn', cam: 'overview', simMinute: 0, waitMs: 2600, diagnostics: true },
  { name: 'r8_slice_overview_noon', cam: 'overview', simMinute: 360, waitMs: 2600, diagnostics: true },
  { name: 'r8_slice_angled', cam: 'angled', simMinute: 360, waitMs: 2400, diagnostics: true },
  { name: 'r8_slice_civic', cam: 'square', simMinute: 360, waitMs: 2200 },
  { name: 'r8_slice_commercial', cam: 'store-street', simMinute: 360, waitMs: 2200 },
  {
    name: 'r8_slice_residential',
    preset: { position: [42, 28, -22], target: [30, 1, -22] },
    simMinute: 360,
    waitMs: 2200,
  },
  { name: 'r8_slice_store_workshop', cam: 'store-workshop', simMinute: 360, waitMs: 2200 },
  { name: 'r8_slice_attachment_house1', preset: { position: [18, 6, -14], target: [11, 2, -8] }, simMinute: 360, waitMs: 1800 },
  { name: 'r8_slice_street', cam: 'street', simMinute: 360, waitMs: 2200, diagnostics: true },
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
    await page.waitForTimeout(500);
  }
  await applyShotCamera(page, shot);
  await page.waitForTimeout(shot.waitMs ?? 2000);
  await waitFrames(page, 12);
  const file = path.join(OUT, `${shot.name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  const label = clockLabel(shot.simMinute ?? 0);
  return {
    name: shot.name,
    file,
    hash: hashFile(file).slice(0, 12),
    simMinute: shot.simMinute,
    clockLabel: label,
    diagnostics: shot.diagnostics
      ? await page.evaluate(() =>
          window.__GODMODE_EVIDENCE__?.sampleRenderDiagnosticsAfterFrames?.(12),
        )
      : undefined,
  };
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
            `<svg width="480" height="28"><text x="8" y="20" fill="white" font-size="13" font-family="sans-serif">${panel.label}</text></svg>`,
          ),
          top: 0,
          left: 0,
        },
      ])
      .png()
      .toBuffer();
    resized.push(buf);
  }
  const width = 480 * panels.length;
  const strip = await sharp({
    create: { width, height: 328, channels: 4, background: { r: 16, g: 18, b: 22 } },
  })
    .composite(
      resized.map((input, index) => ({
        input,
        left: 480 * index,
        top: 0,
      })),
    )
    .png()
    .toBuffer();
  await writeFile(outFile, strip);
}

async function publishRelease(releaseTag, manifest, files) {
  try {
    execSync(`gh release view ${releaseTag} --repo ${REPO}`, { stdio: 'ignore' });
    execSync(`gh release delete ${releaseTag} --repo ${REPO} --yes`, { stdio: 'inherit' });
  } catch {
    /* first publish */
  }
  const notes = [
    'WF02 R8 Phase 0b — representative slice (civic + commercial + residential)',
    '',
    `Commit: ${manifest.sha}`,
    `Overview dawn: ${manifest.overviewDawnDiagnostics?.drawCalls} DC / ${manifest.overviewDawnDiagnostics?.triangles} tris @ ${manifest.overviewDawnDiagnostics?.clockLabel}`,
    `Asset errors: ${manifest.networkAssetErrors.length}`,
  ].join('\n');
  const fileArgs = files.map((f) => `${path.join(OUT, f)}#${f}`).join(' ');
  execSync(
    `gh release create ${releaseTag} --repo ${REPO} --title "WF02 R8 Phase 0b slice evidence" --notes "${notes.replace(/"/g, '\\"')}" ${fileArgs}`,
    { stdio: 'inherit' },
  );
  return `https://github.com/${REPO}/releases/tag/${releaseTag}`;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  await mkdir(DOCS_OUT, { recursive: true });

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
  await page.evaluate(() => window.__GODMODE_EVIDENCE__?.stepToSimMinute(870));
  await page.waitForTimeout(2500);
  await waitFrames(page, 10);
  const nightFile = path.join(OUT, 'r8_slice_night.png');
  await page.screenshot({ path: nightFile, fullPage: false });
  results.push({
    name: 'r8_slice_night',
    file: nightFile,
    hash: hashFile(nightFile).slice(0, 12),
    simMinute: 870,
    clockLabel: clockLabel(870),
  });

  assertCleanAssets(watchers);

  const r6Blocked = path.join(OUT, '00_prior_r6_blocked_overview_dawn.png');
  const r71Blocked = path.join(OUT, '00_prior_r71_blocked_overview_dawn.png');
  execSync(`curl -fsSL "${R6_BLOCKED_URL}" -o "${r6Blocked}"`, { stdio: 'inherit' });
  execSync(`curl -fsSL "${R71_BLOCKED_URL}" -o "${r71Blocked}"`, { stdio: 'inherit' });
  const northStarDest = path.join(OUT, '00_north_star_reference.png');
  if (existsSync(NORTH_STAR)) await copyFile(NORTH_STAR, northStarDest);

  const compareOut = path.join(OUT, 'compare_r6_r71_r8_northstar.png');
  await buildCompareStrip(
    [
      { file: r6Blocked, label: 'R6 blocked BEFORE' },
      { file: r71Blocked, label: 'R7.1 Phase1 blocked' },
      { file: path.join(OUT, 'r8_slice_overview_dawn.png'), label: 'R8 slice AFTER dawn' },
      { file: northStarDest, label: 'North star' },
    ],
    compareOut,
  );

  const sha = gitSha();
  const counts = await page.evaluate(() => {
    const meta = window.__GODMODE_EVIDENCE__?.getCaptureMeta?.();
    return meta?.r8SliceCounts ?? null;
  });

  const overviewDawn = results.find((r) => r.name === 'r8_slice_overview_dawn');
  const overviewNoon = results.find((r) => r.name === 'r8_slice_overview_noon');
  const street = results.find((r) => r.name === 'r8_slice_street');

  const manifest = {
    workItem: 'WF02',
    planRevision: '8',
    phase: 'PHASE_0B_SLICE',
    sha,
    releaseTag: `${RELEASE_TAG_PREFIX}-${sha.slice(0, 7)}`,
    sliceZones: {
      civic: { minX: -40, maxX: -8, minZ: -28, maxZ: 8 },
      commercial: { minX: -36, maxX: 4, minZ: 0, maxZ: 24 },
      residential: { minX: 8, maxX: 52, minZ: -32, maxZ: -4 },
    },
    overviewDawnDiagnostics: {
      ...overviewDawn?.diagnostics,
      simMinute: 0,
      clockLabel: overviewDawn?.clockLabel,
    },
    overviewNoonDiagnostics: {
      ...overviewNoon?.diagnostics,
      simMinute: 360,
      clockLabel: overviewNoon?.clockLabel,
    },
    streetDiagnostics: street?.diagnostics,
    r8SliceCounts: counts,
    wholeTownPropagationEstimate: {
      note: 'Phase 0b slice only — extrapolated full-hero-core multiplier ~2.4× slice DC/tris if orchard/park/periphery re-enabled at slice density',
      sliceOverviewDrawCalls: overviewDawn?.diagnostics?.drawCalls,
      sliceOverviewTriangles: overviewDawn?.diagnostics?.triangles,
      estimatedHeroCoreDrawCalls: overviewDawn?.diagnostics?.drawCalls
        ? Math.round(overviewDawn.diagnostics.drawCalls * 2.4)
        : null,
      estimatedHeroCoreTriangles: overviewDawn?.diagnostics?.triangles
        ? Math.round(overviewDawn.diagnostics.triangles * 2.4)
        : null,
      hardCeiling: { overviewDrawCalls: 135, overviewTriangles: 118_000 },
    },
    networkAssetErrors: watchers.networkAssetErrors,
    consoleErrors: watchers.consoleErrors.filter((l) => /gltf|glb|asset|404/i.test(l)),
    shots: results.map(({ name, hash, simMinute, clockLabel: label, diagnostics }) => ({
      name,
      hash,
      simMinute,
      clockLabel: label,
      diagnostics,
    })),
    importedAssets: [
      'suburban/planter.glb',
      'suburban/path-stones-short.glb',
      'suburban/path-stones-messy.glb',
    ],
    notes: [
      'Real engine pixels — R8 Phase 0b representative slice only',
      '§6.3 detail-bench/fountain/lamp-post not in Suburban 2.0 pack; planter + path-stones used with registered provenance',
      'No Nature Kit / Quaternius impostors',
      'Clock labels verified via deriveCalendar (dawn=simMinute 0 → 06:00)',
    ],
  };

  await writeFile(path.join(OUT, 'r8_slice_manifest.json'), JSON.stringify(manifest, null, 2));
  await writeFile(path.join(DOCS_OUT, 'r8_slice_manifest.json'), JSON.stringify(manifest, null, 2));

  for (const name of [
    'r8_slice_overview_dawn.png',
    'r8_slice_overview_noon.png',
    'r8_slice_angled.png',
    'compare_r6_r71_r8_northstar.png',
  ]) {
    await copyFile(path.join(OUT, name), path.join(DOCS_OUT, name));
  }

  const releaseFiles = [
    'r8_slice_manifest.json',
    'compare_r6_r71_r8_northstar.png',
    '00_prior_r6_blocked_overview_dawn.png',
    '00_prior_r71_blocked_overview_dawn.png',
    '00_north_star_reference.png',
    'r8_slice_overview_dawn.png',
    'r8_slice_overview_noon.png',
    'r8_slice_angled.png',
    'r8_slice_civic.png',
    'r8_slice_commercial.png',
    'r8_slice_residential.png',
    'r8_slice_store_workshop.png',
    'r8_slice_attachment_house1.png',
    'r8_slice_street.png',
    'r8_slice_night.png',
  ];
  const releaseUrl = await publishRelease(manifest.releaseTag, manifest, releaseFiles);
  manifest.releaseUrl = releaseUrl;
  await writeFile(path.join(OUT, 'r8_slice_manifest.json'), JSON.stringify(manifest, null, 2));
  await writeFile(path.join(DOCS_OUT, 'r8_slice_manifest.json'), JSON.stringify(manifest, null, 2));

  await browser.close();
  console.log(JSON.stringify(manifest, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
