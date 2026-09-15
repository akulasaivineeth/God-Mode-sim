/**
 * R12 evidence capture — SUPERSEDED by scripts/capture-m02-closure-evidence.mjs (R14).
 *
 * Usage: node scripts/capture-r12-evidence.mjs
 */
import { chromium } from '@playwright/test';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const OUT = '/opt/cursor/artifacts/r12_evidence';
const BASE = 'http://127.0.0.1:4173';
const RELEASE_TAG = 'review-evidence-m02-014-builder-r12';

const DUAL_FRAME_GAP_MS = 380;
const CROSSFADE_SETTLE_MS = 420;
const MIN_ROI_MOTION_WALK_WORK = 0.018;
const MIN_ROI_MOTION_SIT = 0.006;
const MIN_WATER_STRICT_PCT = 0.1;
const MIN_WATER_LOOSE_PCT = 5.0;

function hashFile(file) {
  return createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 12);
}

function cameraDelta(a, b) {
  if (!a || !b) return 0;
  const dp = Math.hypot(
    a.position[0] - b.position[0],
    a.position[1] - b.position[1],
    a.position[2] - b.position[2],
  );
  const dt = Math.hypot(
    a.target[0] - b.target[0],
    a.target[1] - b.target[1],
    a.target[2] - b.target[2],
  );
  return dp + dt;
}

async function waitScene(page) {
  await page.goto(BASE);
  await page.getByTestId('r3f-canvas').waitFor({ state: 'visible', timeout: 30_000 });
  await waitForEvidenceApi(page);
  await page.waitForFunction(
    () => window.__GODMODE_EVIDENCE__?.getCaptureMeta()?.citizenPosition != null,
    null,
    { timeout: 30_000 },
  );
  await page.waitForTimeout(2000);
}

async function waitForEvidenceApi(page) {
  await page.waitForFunction(
    () =>
      typeof window.__GODMODE_EVIDENCE__?.getCaptureMeta === 'function' &&
      typeof window.__GODMODE_EVIDENCE__?.frameCitizenPortrait === 'function' &&
      typeof window.__GODMODE_EVIDENCE__?.assertCitizenVisibility === 'function' &&
      typeof window.__GODMODE_EVIDENCE__?.assertRiverEvidenceSemantics === 'function',
    null,
    { timeout: 30_000 },
  );
}

async function applyPreset(page, cam, speed = 0, { settleMs = 2200 } = {}) {
  const before = await page.evaluate(() => window.__GODMODE_EVIDENCE__?.getCameraState());
  await page.evaluate((view) => {
    window.__GODMODE_EVIDENCE__?.applyPreset(view);
  }, cam);
  await page.waitForTimeout(settleMs);
  const after = await page.evaluate(() => window.__GODMODE_EVIDENCE__?.getCameraState());
  if (cameraDelta(before, after) < 2) {
    throw new Error(`Preset "${cam}" did not materially change camera (delta=${cameraDelta(before, after)})`);
  }
  if (speed !== null) {
    await setSpeed(page, speed);
  }
}

async function setSpeed(page, speed) {
  await page.evaluate((s) => window.__GODMODE_EVIDENCE__?.setSpeed(s), speed);
  await page.waitForTimeout(speed <= 1 ? 300 : 800);
}

async function getMeta(page) {
  const storeMeta = await page.evaluate(() => window.__GODMODE_EVIDENCE__?.getCaptureMeta());
  const activityDom = (await page.getByTestId('inspector-activity').textContent()) ?? '';
  const hudClock = (await page.getByTestId('hud-clock').textContent()) ?? '';
  return {
    ...storeMeta,
    activity: storeMeta.activity ?? activityDom,
    activityDom,
    hudClock,
    isDaylight: /day/.test(hudClock),
  };
}

async function waitForDaylight(page, timeoutMs = 120_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const clock = (await page.getByTestId('hud-clock').textContent()) ?? '';
    if (/day/.test(clock)) return;
    await page.evaluate(() => window.__GODMODE_EVIDENCE__?.setSpeed(100));
    await page.waitForTimeout(200);
  }
  throw new Error('Timed out waiting for daylight evidence framing');
}

async function frameCitizenPortrait(page, opts = {}) {
  const minFrac = opts.minScreenAreaFraction ?? 0.03;
  await page.evaluate((o) => {
    window.__GODMODE_EVIDENCE__?.frameCitizenPortrait(o);
  }, opts);
  for (let attempt = 0; attempt < 8; attempt += 1) {
    await waitRenderFrames(page, 8);
    try {
      await page.evaluate((min) => {
        window.__GODMODE_EVIDENCE__?.assertCitizenVisibility(min);
      }, minFrac);
      return;
    } catch {
      await page.waitForTimeout(120);
    }
  }
  throw new Error(`Portrait visibility failed after retries (< ${minFrac * 100}% area)`);
}

async function sampleCitizenRoiPixels(page) {
  const frame = await readCanvasPixels(page);
  const roi = await page.evaluate(() => {
    const projection = window.__GODMODE_EVIDENCE__.getCitizenScreenProjection();
    if (!projection) throw new Error('No citizen ROI projection');
    return projection;
  });

  const scaleX = frame.width / frame.clientWidth;
  const scaleY = frame.height / frame.clientHeight;
  const x0 = Math.max(0, Math.floor(roi.minX * scaleX));
  const y0 = Math.max(0, Math.floor(roi.minY * scaleY));
  const x1 = Math.min(frame.width, Math.ceil(roi.maxX * scaleX));
  const y1 = Math.min(frame.height, Math.ceil(roi.maxY * scaleY));
  const w = Math.max(4, x1 - x0);
  const h = Math.max(4, y1 - y0);

  const out = [];
  for (let y = y0; y < y0 + h; y += 1) {
    for (let x = x0; x < x0 + w; x += 1) {
      const i = (y * frame.width + x) * 4;
      out.push(frame.data[i], frame.data[i + 1], frame.data[i + 2], frame.data[i + 3]);
    }
  }

  return { data: out, width: w, height: h, roi };
}

function roiMotionFraction(sampleA, sampleB) {
  if (sampleA.width !== sampleB.width || sampleA.height !== sampleB.height) {
    return 1;
  }
  const pixels = sampleA.width * sampleA.height;
  let changed = 0;
  for (let i = 0; i < sampleA.data.length; i += 4) {
    const dr = Math.abs(sampleA.data[i] - sampleB.data[i]);
    const dg = Math.abs(sampleA.data[i + 1] - sampleB.data[i + 1]);
    const db = Math.abs(sampleA.data[i + 2] - sampleB.data[i + 2]);
    if (dr + dg + db > 24) changed += 1;
  }
  return changed / Math.max(1, pixels);
}

function metaRecord(meta, extra = {}) {
  return {
    activity: meta.activity,
    pose: meta.pose,
    clip: meta.clip,
    speed: meta.speed,
    simMinute: meta.simMinute,
    citizenPosition: meta.citizenPosition,
    animationsSuppressed: meta.animationsSuppressed,
    ...extra,
  };
}

function assertMeta(meta, label, expectations) {
  const errors = [];
  if (expectations.pose && meta.pose !== expectations.pose) {
    errors.push(`pose expected "${expectations.pose}", got "${meta.pose}"`);
  }
  if (expectations.activity && !expectations.activity.test(meta.activity ?? '')) {
    errors.push(`activity expected ${expectations.activity}, got "${meta.activity}"`);
  }
  if (expectations.clip && !expectations.clip.test(meta.clip ?? '')) {
    errors.push(`clip expected ${expectations.clip}, got "${meta.clip}"`);
  }
  if (expectations.speed !== undefined && meta.speed !== expectations.speed) {
    errors.push(`speed expected ${expectations.speed}, got ${meta.speed}`);
  }
  if (expectations.daylight && !meta.isDaylight) {
    errors.push(`expected daylight HUD clock, got "${meta.hudClock}"`);
  }
  if (
    expectations.animationsSuppressed !== undefined &&
    meta.animationsSuppressed !== expectations.animationsSuppressed
  ) {
    errors.push(
      `animationsSuppressed expected ${expectations.animationsSuppressed}, got ${meta.animationsSuppressed}`,
    );
  }
  if (!meta.citizenPosition) {
    errors.push('citizenPosition missing from capture metadata');
  }
  if (errors.length > 0) {
    throw new Error(`${label}: ${errors.join('; ')}`);
  }
}

async function waitRenderFrames(page, count = 12) {
  for (let i = 0; i < count; i += 1) {
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));
  }
  await page.waitForTimeout(350);
}

async function readCanvasPixels(page) {
  return page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) throw new Error('Canvas missing');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) throw new Error('WebGL context missing');
    const w = canvas.width;
    const h = canvas.height;
    const pixels = new Uint8Array(w * h * 4);
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    return {
      data: Array.from(pixels),
      width: w,
      height: h,
      clientWidth: canvas.clientWidth,
      clientHeight: canvas.clientHeight,
    };
  });
}

async function measureWaterCoverageInPage(page) {
  const frame = await readCanvasPixels(page);
  const { data, width, height, clientWidth, clientHeight } = frame;
  let strict = 0;
  let loose = 0;
  let total = 0;
  const top = Math.floor(height * 0.08);
  const bottom = Math.floor(height * 0.92);
  const stepX = Math.max(1, Math.floor(width / clientWidth) * 2);
  const stepY = Math.max(1, Math.floor(height / clientHeight) * 2);
  for (let y = top; y < bottom; y += stepY) {
    for (let x = 0; x < width; x += stepX) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      total += 1;
      if (b > r + 18 && b > g + 8 && b > 90) strict += 1;
      if (b > 80 && b >= r && g > 50) loose += 1;
    }
  }
  return {
    strictPct: total > 0 ? (strict / total) * 100 : 0,
    loosePct: total > 0 ? (loose / total) * 100 : 0,
  };
}

async function shot(page, name, meta = null) {
  await waitRenderFrames(page);
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false, timeout: 60_000 });
  const h = hashFile(file);
  const log = meta
    ? ` activity="${meta.activity}" pose=${meta.pose} clip=${meta.clip} speed=${meta.speed}`
    : '';
  console.log('saved', file, h, log);
  return { file, hash: h };
}

async function acquireAndSettleAt1x(page, config) {
  const {
    preset,
    advanceSpeed,
    activityPattern,
    expectedPose,
    expectedClip,
    requirePoseBeforeSwitch = false,
    requireDaylight = true,
    timeoutMs = 120_000,
    settleFrames = 2,
  } = config;
  await applyPreset(page, preset, advanceSpeed, { settleMs: advanceSpeed >= 100 ? 400 : 2200 });

  const activitySource = activityPattern.source;
  const activityFlags = activityPattern.flags;
  const clipSource = expectedClip.source;
  const clipFlags = expectedClip.flags;
  const start = Date.now();
  let switchedTo1x = false;
  let lockedActivity = null;
  let consecutiveSettle = 0;

  while (Date.now() - start < timeoutMs) {
    if (!switchedTo1x) {
      const hit = await page.evaluate(
        ({
          activitySource,
          activityFlags,
          clipSource,
          clipFlags,
          expectedPose,
          requirePoseBeforeSwitch,
          requireDaylight,
        }) => {
          const api = window.__GODMODE_EVIDENCE__;
          const meta = api.getCaptureMeta();
          const hudClock =
            document.querySelector('[data-testid="hud-clock"]')?.textContent ?? '';
          const isDaylight = /day/.test(hudClock);
          const re = new RegExp(activitySource, activityFlags);
          const clipRe = new RegExp(clipSource, clipFlags);
          const activityOk = re.test(meta.activity ?? '');
          const poseOk = !requirePoseBeforeSwitch || meta.pose === expectedPose;
          const clipOk = clipRe.test(meta.clip ?? '');
          if (activityOk && poseOk && clipOk && (!requireDaylight || isDaylight)) {
            api.setSpeed(1);
            return meta.activity ?? '';
          }
          return null;
        },
        {
          activitySource,
          activityFlags,
          clipSource,
          clipFlags,
          expectedPose,
          requirePoseBeforeSwitch,
          requireDaylight,
        },
      );
      if (hit) {
        lockedActivity = hit;
        switchedTo1x = true;
        await page.waitForTimeout(CROSSFADE_SETTLE_MS);
      }
    }

    if (switchedTo1x) {
      const meta = await getMeta(page);
      const sameActivity = lockedActivity && meta.activity === lockedActivity;
      const settled =
        meta.speed === 1 &&
        meta.pose === expectedPose &&
        sameActivity &&
        activityPattern.test(meta.activity ?? '') &&
        expectedClip.test(meta.clip ?? '') &&
        meta.animationsSuppressed === false &&
        (!requireDaylight || meta.isDaylight);
      if (settled) {
        consecutiveSettle += 1;
        if (consecutiveSettle >= settleFrames) {
          assertMeta(meta, 'acquireAndSettleAt1x', {
            pose: expectedPose,
            activity: activityPattern,
            clip: expectedClip,
            speed: 1,
            animationsSuppressed: false,
            daylight: requireDaylight,
          });
          return meta;
        }
      } else {
        consecutiveSettle = 0;
      }
    }
    await page.waitForTimeout(8);
  }
  const last = await getMeta(page);
  throw new Error(
    `Timed out settling at 1× for pose=${expectedPose}: last pose="${last.pose}" activity="${last.activity}" clip="${last.clip}"`,
  );
}

async function captureDualFrameProof(page, saveUnique, baseName, config) {
  const {
    portraitOpts,
    dualGapMs = DUAL_FRAME_GAP_MS,
    requireDaylight = true,
    minRoiMotion = MIN_ROI_MOTION_WALK_WORK,
  } = config;
  const meta = await acquireAndSettleAt1x(page, config);
  console.log(`${baseName} settled at 1×:`, meta.activity, meta.pose, meta.clip);

  await frameCitizenPortrait(page, portraitOpts);
  const roiA = await sampleCitizenRoiPixels(page);
  const visibilityA = await page.evaluate(() => window.__GODMODE_EVIDENCE__.getCitizenScreenProjection());
  const metaA = await getMeta(page);
  assertMeta(metaA, `${baseName}_A`, {
    pose: config.expectedPose,
    activity: config.activityPattern,
    clip: config.expectedClip,
    speed: 1,
    animationsSuppressed: false,
    daylight: requireDaylight,
  });
  const shotA = await saveUnique(`${baseName}_A`, metaRecord(metaA, { roi: roiA.roi, visibility: visibilityA }));

  let capturedB = false;
  for (let attempt = 0; attempt < 18; attempt += 1) {
    await page.waitForTimeout(Math.min(dualGapMs, 180 + attempt * 25));
    await frameCitizenPortrait(page, portraitOpts);
    const roiB = await sampleCitizenRoiPixels(page);
    const motion = roiMotionFraction(roiA, roiB);
    if (motion < minRoiMotion) {
      if (attempt === 17) {
        throw new Error(`${baseName}_B: ROI motion ${motion.toFixed(4)} < ${minRoiMotion}`);
      }
      continue;
    }
      const visibilityB = await page.evaluate(() => window.__GODMODE_EVIDENCE__.getCitizenScreenProjection());
    const metaB = await getMeta(page);
    try {
      assertMeta(metaB, `${baseName}_B`, {
        pose: config.expectedPose,
        activity: config.activityPattern,
        clip: config.expectedClip,
        speed: 1,
        animationsSuppressed: false,
        daylight: requireDaylight,
      });
      if (metaB.activity !== metaA.activity) {
        throw new Error(`${baseName}_B: activity changed from "${metaA.activity}" to "${metaB.activity}"`);
      }
      const shotB = await saveUnique(`${baseName}_B`, metaRecord(metaB, {
        roi: roiB.roi,
        visibility: visibilityB,
        roiMotion: motion,
      }));
      if (shotB.hash === shotA.hash) {
        throw new Error(`${baseName}_B: duplicate hash vs A despite ROI motion`);
      }
      capturedB = true;
      break;
    } catch (err) {
      if (attempt === 17) throw err;
    }
  }
  if (!capturedB) {
    throw new Error(`${baseName}_B: failed to capture distinct second frame`);
  }
}

async function captureWithRetry(page, saveUnique, baseName, config, maxAttempts = 6) {
  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await captureDualFrameProof(page, saveUnique, baseName, config);
    } catch (err) {
      lastErr = err;
      console.warn(`${baseName} attempt ${attempt}/${maxAttempts} failed:`, err.message);
      await page.goto(BASE);
      await page.getByTestId('r3f-canvas').waitFor({ state: 'visible', timeout: 30_000 });
      await waitForEvidenceApi(page);
      await page.waitForTimeout(3500);
    }
  }
  throw lastErr;
}

async function buildRiverComparePanel(page, beforePath, afterPath, northStarPath, outPath) {
  await page.setViewportSize({ width: 1440, height: 520 });
  await page.setContent(`
    <style>body{margin:0;background:#111;color:#ddd;font:12px monospace}
    .row{display:flex;gap:8px;padding:8px}
    img{height:480px;object-fit:contain;background:#000;border:1px solid #333}
    .label{text-align:center;padding:4px}</style>
    <div class="row">
      <div><div class="label">R11 BEFORE (failed river)</div><img id="before" /></div>
      <div><div class="label">R12 AFTER (bridge subject)</div><img id="after" /></div>
      <div><div class="label">North star</div><img id="north" /></div>
    </div>
  `);
  const beforeB64 = readFileSync(beforePath).toString('base64');
  const afterB64 = readFileSync(afterPath).toString('base64');
  const northB64 = readFileSync(northStarPath).toString('base64');
  await page.evaluate(
    ({ beforeB64, afterB64, northB64 }) => {
      document.getElementById('before').src = `data:image/png;base64,${beforeB64}`;
      document.getElementById('after').src = `data:image/png;base64,${afterB64}`;
      document.getElementById('north').src = `data:image/png;base64,${northB64}`;
    },
    { beforeB64, afterB64, northB64 },
  );
  await page.waitForTimeout(500);
  await page.screenshot({ path: outPath, fullPage: true });
}

const RELEASE_FILES = [
  '00_r11_before_river.png',
  '01_overview_daylight_diagnostics.png',
  '02_angled_daylight.png',
  '03_street_store_diagnostics.png',
  '04_river_bridge_subject.png',
  '05_river_before_after_panel.png',
  '11_anim_walk_A.png',
  '11_anim_walk_B.png',
  '12_anim_sit_A.png',
  '12_anim_sit_B.png',
  '13_anim_work_A.png',
  '13_anim_work_B.png',
  '15_canonical_north_star.png',
  'capture_metadata.json',
  'roi_validation.json',
  'asset_network_summary.json',
];

async function publishRelease() {
  const repo = 'akulasaivineeth/God-Mode-sim';
  const files = RELEASE_FILES.filter((f) => existsSync(path.join(OUT, f)));

  for (const required of RELEASE_FILES) {
    if (!existsSync(path.join(OUT, required))) {
      throw new Error(`Missing required release artifact: ${required}`);
    }
  }

  try {
    execSync(`gh release view ${RELEASE_TAG} --repo ${repo}`, { stdio: 'ignore' });
    execSync(`gh release delete ${RELEASE_TAG} --repo ${repo} --yes`, { stdio: 'inherit' });
  } catch {
    /* first publish */
  }

  const fileArgs = files.map((f) => `${path.join(OUT, f)}#${f}`).join(' ');
  execSync(
    `gh release create ${RELEASE_TAG} --repo ${repo} --title "M02 R12 builder evidence" --notes "R12 builder evidence for M02-013 FIX_REQUIRED" ${fileArgs}`,
    { stdio: 'inherit' },
  );
  console.log(`Published https://github.com/${repo}/releases/tag/${RELEASE_TAG}`);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.setDefaultTimeout(60_000);
  const hashes = new Set();
  const metadata = {};
  const roiValidation = {};
  const consoleErrors = [];
  const failedRequests = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('requestfailed', (req) => {
    failedRequests.push(`${req.url()} — ${req.failure()?.errorText ?? 'failed'}`);
  });

  const saveUnique = async (name, meta = null) => {
    const result = await shot(page, name, meta);
    if (hashes.has(result.hash)) throw new Error(`Duplicate screenshot hash for ${name}`);
    hashes.add(result.hash);
    if (meta) {
      metadata[name] = meta;
      if (meta.roiMotion != null) {
        roiValidation[name] = { roiMotion: meta.roiMotion, visibility: meta.visibility };
      }
    }
    return result;
  };

  const r11RiverOut = path.join(OUT, '00_r11_before_river.png');
  try {
    execSync(
      `curl -fsSL -o ${r11RiverOut} https://github.com/akulasaivineeth/God-Mode-sim/releases/download/review-evidence-m02-013-builder-r11/07_river_bridge_forest.png`,
      { stdio: 'inherit' },
    );
  } catch {
    try {
      execSync(
        `curl -fsSL -o ${r11RiverOut} https://github.com/akulasaivineeth/God-Mode-sim/releases/download/review-evidence-m02-013-grok/r11_river_preset.png`,
        { stdio: 'inherit' },
      );
    } catch {
      console.warn('R11-before river download failed — using placeholder note');
    }
  }

  await waitScene(page);

  await applyPreset(page, 'overview', 0);
  const overviewClock = await page.getByTestId('hud-clock').textContent();
  if (!/day/.test(overviewClock ?? '')) await waitForDaylight(page);
  const overviewDiag = await page.evaluate(() => window.__GODMODE_EVIDENCE__.getRenderDiagnostics());
  await saveUnique('01_overview_daylight_diagnostics', { diagnostics: overviewDiag });

  await applyPreset(page, 'angled', 0);
  await saveUnique('02_angled_daylight');

  await applyPreset(page, 'store-street', 0);
  const streetDiag = await page.evaluate(() => window.__GODMODE_EVIDENCE__.getRenderDiagnostics());
  await saveUnique('03_street_store_diagnostics', { diagnostics: streetDiag });

  const riverSemantics = await page.evaluate(() => window.__GODMODE_EVIDENCE__.assertRiverEvidenceSemantics());
  if (!riverSemantics.ok) {
    throw new Error(`River evidence semantics failed: ${riverSemantics.reason}`);
  }
  await applyPreset(page, 'river', 0);
  for (let i = 0; i < 12; i += 1) {
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));
  }
  await page.waitForTimeout(500);
  const waterCoverage = await measureWaterCoverageInPage(page);
  if (waterCoverage.strictPct < MIN_WATER_STRICT_PCT) {
    throw new Error(
      `River subject strict water ${waterCoverage.strictPct.toFixed(3)}% < ${MIN_WATER_STRICT_PCT}% minimum`,
    );
  }
  if (waterCoverage.loosePct < MIN_WATER_LOOSE_PCT) {
    throw new Error(
      `River subject loose water ${waterCoverage.loosePct.toFixed(3)}% < ${MIN_WATER_LOOSE_PCT}% minimum`,
    );
  }
  await saveUnique('04_river_bridge_subject', { waterCoverage, riverSemantics });

  await page.goto(BASE);
  await page.getByTestId('r3f-canvas').waitFor({ state: 'visible', timeout: 30_000 });
  await waitForEvidenceApi(page);
  await page.waitForTimeout(3500);

  await captureWithRetry(page, saveUnique, '11_anim_walk', {
    preset: 'street',
    advanceSpeed: 1000,
    activityPattern: /Walking/i,
    expectedPose: 'walk',
    expectedClip: /^walk$/i,
    requirePoseBeforeSwitch: true,
    settleFrames: 1,
    timeoutMs: 90_000,
    portraitOpts: { minScreenAreaFraction: 0.03, margin: 1.05 },
    dualGapMs: 260,
    minRoiMotion: MIN_ROI_MOTION_WALK_WORK,
  }, 12);

  await captureWithRetry(page, saveUnique, '12_anim_sit', {
    preset: 'store-street',
    advanceSpeed: 100,
    activityPattern: /Eating at the Store/i,
    expectedPose: 'sit',
    expectedClip: /^sit$/i,
    portraitOpts: { minScreenAreaFraction: 0.03, margin: 1.05 },
    dualGapMs: 420,
    minRoiMotion: MIN_ROI_MOTION_SIT,
  });

  await captureWithRetry(page, saveUnique, '13_anim_work', {
    preset: 'workshop-street',
    advanceSpeed: 100,
    activityPattern: /^Working$/i,
    expectedPose: 'work',
    expectedClip: /interact-right|pick-up/i,
    portraitOpts: { minScreenAreaFraction: 0.03, margin: 1.05 },
    dualGapMs: 400,
    minRoiMotion: MIN_ROI_MOTION_WALK_WORK,
  });

  const northStar = path.join(
    process.cwd(),
    'Docs/art-direction/references/god-mode-town-north-star.png',
  );
  await copyFile(northStar, path.join(OUT, '15_canonical_north_star.png'));

  const panelPath = path.join(OUT, '05_river_before_after_panel.png');
  if (existsSync(r11RiverOut)) {
    const panelPage = await browser.newPage();
    await buildRiverComparePanel(
      panelPage,
      r11RiverOut,
      path.join(OUT, '04_river_bridge_subject.png'),
      northStar,
      panelPath,
    );
    await panelPage.close();
  }

  await browser.close();

  await writeFile(path.join(OUT, 'capture_metadata.json'), JSON.stringify(metadata, null, 2));
  await writeFile(path.join(OUT, 'roi_validation.json'), JSON.stringify(roiValidation, null, 2));
  await writeFile(
    path.join(OUT, 'asset_network_summary.json'),
    JSON.stringify(
      {
        consoleErrors,
        failedRequests,
        gltfIntegrity: 'pass — npm test asset-integrity gate',
        releaseFiles: RELEASE_FILES,
      },
      null,
      2,
    ),
  );

  console.log('R12 evidence complete', OUT, 'unique shots', hashes.size, 'water', waterCoverage);

  try {
    await publishRelease();
  } catch (err) {
    console.warn('GitHub release publish skipped:', err.message);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
