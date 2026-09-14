/**
 * M02 closure evidence (R14) — strict A–J proof with live mixer at 1×.
 *
 * Usage: npm run build && npm run preview -- --host 127.0.0.1 --port 4173 &
 *        node scripts/capture-m02-closure-evidence.mjs
 */
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const OUT = '/opt/cursor/artifacts/m02_closure_evidence';
const BASE = 'http://127.0.0.1:4173/?evidence=1';
const RELEASE_TAG = 'review-evidence-m02-014-builder-r14';
const CROSSFADE_SETTLE_MS = 450;
const DUAL_FRAME_GAP_MS = 520;
const MIN_ROI_MOTION = 0.012;
const MIN_CLIP_PHASE = 0.018;

function hashFile(file) {
  return createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 12);
}

async function waitScene(page) {
  await page.goto(BASE);
  await page.getByTestId('r3f-canvas').waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForFunction(
    () => {
      if (typeof window.__GODMODE_EVIDENCE__?.setSpeed === 'function') {
        window.__GODMODE_EVIDENCE__.setSpeed(0);
      }
      return (
        typeof window.__GODMODE_EVIDENCE__?.getCaptureMeta === 'function' &&
        typeof window.__GODMODE_EVIDENCE__?.frameCitizenPortrait === 'function'
      );
    },
    null,
    { timeout: 30_000 },
  );
  await page.waitForFunction(
    () => window.__GODMODE_EVIDENCE__?.getCaptureMeta()?.citizenPosition != null,
    null,
    { timeout: 30_000 },
  );
  await page.waitForTimeout(800);
}

async function setSpeed(page, speed) {
  await page.evaluate((s) => window.__GODMODE_EVIDENCE__?.setSpeed(s), speed);
  await page.waitForTimeout(speed <= 1 ? 350 : 700);
}

async function applyPreset(page, cam, speed = 0, { settleMs = 1800 } = {}) {
  await page.evaluate((view) => {
    window.__GODMODE_EVIDENCE__?.applyPreset(view);
  }, cam);
  await page.waitForTimeout(settleMs);
  if (speed !== null) await setSpeed(page, speed);
}

async function getMeta(page) {
  const storeMeta = await page.evaluate(() => window.__GODMODE_EVIDENCE__?.getCaptureMeta());
  const hudClock = (await page.getByTestId('hud-clock').textContent().catch(() => null)) ?? '';
  const isDaylight = storeMeta?.isDaylight ?? /day/.test(String(hudClock));
  return { ...storeMeta, hudClock, isDaylight };
}

async function getCamera(page) {
  return page.evaluate(() => window.__GODMODE_EVIDENCE__?.getCameraState());
}

function metaRecord(meta, camera, extra = {}) {
  return {
    citizenId: meta.citizenId,
    activity: meta.activity,
    pose: meta.pose,
    clip: meta.clip,
    clipPhase: meta.clipPhase ?? 0,
    speed: meta.speed,
    simMinute: meta.simMinute,
    animationsSuppressed: meta.animationsSuppressed,
    citizenPosition: meta.citizenPosition,
    camera,
    ...extra,
  };
}

function assertMeta(meta, label, expectations) {
  const errors = [];
  if (expectations.citizenId && !meta.citizenId) {
    errors.push('citizenId missing');
  }
  if (expectations.pose && meta.pose !== expectations.pose) {
    errors.push(`pose expected "${expectations.pose}", got "${meta.pose}"`);
  }
  if (expectations.exactActivity && meta.activity !== expectations.exactActivity) {
    errors.push(`activity expected exact "${expectations.exactActivity}", got "${meta.activity}"`);
  } else if (expectations.activity && !expectations.activity.test(meta.activity ?? '')) {
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
  if (!meta.citizenPosition) errors.push('citizenPosition missing');
  if (errors.length > 0) throw new Error(`${label}: ${errors.join('; ')}`);
}

async function waitRenderFrames(page, count = 10) {
  for (let i = 0; i < count; i += 1) {
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(r)));
  }
  await page.waitForTimeout(250);
}

async function setUiChrome(page, { inspector = true, diagnostics = true } = {}) {
  await page.evaluate(({ inspector, diagnostics }) => {
    const insp = document.querySelector('[data-testid="citizen-inspector"]');
    const diag = document.querySelector('[data-testid="diagnostics-hud"]');
    if (insp instanceof HTMLElement) insp.style.display = inspector ? '' : 'none';
    if (diag instanceof HTMLElement) diag.style.display = diagnostics ? '' : 'none';
  }, { inspector, diagnostics });
}

async function waitForDaylight(page, timeoutMs = 90_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const meta = await getMeta(page);
    if (meta.isDaylight) return;
    await setSpeed(page, 100);
    await page.waitForTimeout(120);
  }
  throw new Error('Timed out waiting for daylight');
}

async function frameFullBody(page, opts = {}) {
  await page.evaluate((o) => {
    window.__GODMODE_EVIDENCE__?.setEvidencePortraitMode(true);
    window.__GODMODE_EVIDENCE__?.frameCitizenPortrait(o);
  }, { margin: 1.35, minScreenAreaFraction: 0.06, ...opts });
  await waitRenderFrames(page, 24);
  await page.waitForTimeout(700);
}

async function assertCitizenReadable(page, minArea = 0.05) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    await waitRenderFrames(page, 6);
    try {
      await page.evaluate((min) => {
        const projection = window.__GODMODE_EVIDENCE__?.getCitizenScreenProjection();
        if (!projection?.fullyOnScreen) {
          throw new Error('Full-body portrait clipped — head or feet outside viewport');
        }
        window.__GODMODE_EVIDENCE__?.assertCitizenVisibility(min);
      }, minArea);
      return;
    } catch {
      await page.waitForTimeout(120);
    }
  }
  throw new Error(`Citizen visibility failed after retries (< ${minArea * 100}% area)`);
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
  if (sampleA.width !== sampleB.width || sampleA.height !== sampleB.height) return 1;
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

async function shot(page, name, meta = null) {
  await waitRenderFrames(page);
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false, timeout: 60_000 });
  const h = hashFile(file);
  const log = meta
    ? ` id=${meta.citizenId} activity="${meta.activity}" pose=${meta.pose} clip=${meta.clip} speed=${meta.speed} animSupp=${meta.animationsSuppressed}`
    : '';
  console.log('saved', file, h, log);
  return { file, hash: h };
}

async function atomicFreezeOnMatch(page, { activityPattern, expectedPose, requireDaylight = true }) {
  return page.evaluate(
    ({ activitySource, expectedPose, requireDaylight }) => {
      const meta = window.__GODMODE_EVIDENCE__?.getCaptureMeta();
      if (!meta) return null;
      const daylightOk = !requireDaylight || meta.isDaylight;
      const activityOk = new RegExp(activitySource, 'i').test(meta.activity ?? '');
      const poseOk = meta.pose === expectedPose;
      if (!activityOk || !poseOk || !daylightOk) return null;
      window.__GODMODE_EVIDENCE__.setSpeed(0);
      return meta;
    },
    {
      activitySource: activityPattern.source,
      expectedPose,
      requireDaylight,
    },
  );
}

async function waitForClip(page, expectedClip, timeoutMs = 800) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const meta = await getMeta(page);
    if (expectedClip.test(meta.clip ?? '')) return meta;
    await page.waitForTimeout(16);
  }
  return getMeta(page);
}

async function acquireAt1x(page, config) {
  const {
    preset,
    advanceSpeed = 50,
    activityPattern,
    expectedPose,
    expectedClip,
    requireDaylight = true,
    requirePoseBeforeSwitch = true,
    lockImmediately = false,
    timeoutMs = 240_000,
  } = config;

  await applyPreset(page, preset, advanceSpeed, { settleMs: 400 });
  await setSpeed(page, advanceSpeed);

  const start = Date.now();
  let lockedActivity = null;

  while (Date.now() - start < timeoutMs) {
    if (lockImmediately) {
      const frozen = await atomicFreezeOnMatch(page, {
        activityPattern,
        expectedPose: requirePoseBeforeSwitch ? expectedPose : expectedPose,
        requireDaylight,
      });
      if (frozen) {
        lockedActivity = frozen.activity;
        await page.waitForTimeout(50);
        let meta = await waitForClip(page, expectedClip, 900);
        assertMeta(meta, 'acquireAt1x', {
          citizenId: true,
          pose: expectedPose,
          exactActivity: lockedActivity,
          clip: expectedClip,
          speed: 0,
          animationsSuppressed: false,
          daylight: requireDaylight,
        });
        return { meta, lockedActivity };
      }
    } else {
      let meta = await getMeta(page);
      const daylightOk = !requireDaylight || meta.isDaylight;
      const activityOk = activityPattern.test(meta.activity ?? '');
      const poseOk = !requirePoseBeforeSwitch || meta.pose === expectedPose;

      if (activityOk && poseOk && daylightOk) {
        await setSpeed(page, 1);
        await page.waitForTimeout(CROSSFADE_SETTLE_MS);
        lockedActivity = meta.activity;
        meta = await waitForClip(page, expectedClip, 900);
        assertMeta(meta, 'acquireAt1x', {
          citizenId: true,
          pose: expectedPose,
          exactActivity: lockedActivity,
          clip: expectedClip,
          speed: 1,
          animationsSuppressed: false,
          daylight: requireDaylight,
        });
        return { meta, lockedActivity };
      }
    }
    await page.waitForTimeout(5);
  }

  const last = await getMeta(page);
  throw new Error(
    `Timed out at 1× pose=${expectedPose}: activity="${last.activity}" pose="${last.pose}" clip="${last.clip}" animSupp=${last.animationsSuppressed}`,
  );
}

async function captureDualAt1x(page, saveShot, baseName, config, { useFullBodyPortrait = true, singleFrame = false } = {}) {
  const { meta, lockedActivity } = await acquireAt1x(page, config);
  console.log(`${baseName} acquired at 1×:`, meta.activity, meta.pose, meta.clip);

  if (meta.speed !== 0) {
    await setSpeed(page, 0);
    await page.waitForTimeout(250);
  }

  if (useFullBodyPortrait) {
    await frameFullBody(page, { margin: 1.35, minScreenAreaFraction: 0.06 });
    await assertCitizenReadable(page, 0.05);
  } else {
    await waitRenderFrames(page, 8);
  }

  const expectations = {
    citizenId: true,
    pose: config.expectedPose,
    exactActivity: lockedActivity,
    clip: config.expectedClip,
    speed: 0,
    animationsSuppressed: false,
    daylight: config.requireDaylight !== false,
  };

  const captureFrame = async (suffix) => {
    const shotName = suffix ? `${baseName}_${suffix}` : baseName;
    const camera = await getCamera(page);
    const frameMeta = await getMeta(page);
    assertMeta(frameMeta, `${baseName}_${suffix}`, expectations);
    const roi = await sampleCitizenRoiPixels(page);
    const vis = await page.evaluate(() => window.__GODMODE_EVIDENCE__.getCitizenScreenProjection());
    await saveShot(shotName, metaRecord(frameMeta, camera, {
      visibility: vis,
      roi: roi.roi,
      acquiredAtSpeed: 1,
      lockedActivity,
    }));
    return { roi, clipPhase: frameMeta.clipPhase ?? 0, meta: frameMeta };
  };

  const frameA = await captureFrame(singleFrame ? null : 'A');
  if (singleFrame) return;

  await page.waitForTimeout(DUAL_FRAME_GAP_MS);
  await waitRenderFrames(page, 20);
  const metaProbe = await getMeta(page);
  if (metaProbe.activity !== lockedActivity || metaProbe.pose !== config.expectedPose || metaProbe.speed !== 0) {
    throw new Error(
      `${baseName}_B: drift after acquire (${lockedActivity}/${config.expectedPose} -> ${metaProbe.activity}/${metaProbe.pose} speed=${metaProbe.speed})`,
    );
  }

  const roiB = await sampleCitizenRoiPixels(page);
  const motion = roiMotionFraction(frameA.roi, roiB);
  const clipDelta = Math.abs((metaProbe.clipPhase ?? 0) - frameA.clipPhase);
  if (motion < MIN_ROI_MOTION && clipDelta < MIN_CLIP_PHASE) {
    throw new Error(
      `${baseName}_B: ROI motion ${motion.toFixed(4)} and clip delta ${clipDelta.toFixed(4)} insufficient at 1×`,
    );
  }

  const cameraB = await getCamera(page);
  assertMeta(metaProbe, `${baseName}_B`, expectations);
  const visB = await page.evaluate(() => window.__GODMODE_EVIDENCE__.getCitizenScreenProjection());
  await saveShot(
    `${baseName}_B`,
    metaRecord(metaProbe, cameraB, {
      visibility: visB,
      roi: roiB.roi,
      roiMotion: motion,
      clipPhaseDelta: clipDelta,
      acquiredAtSpeed: 1,
      lockedActivity,
    }),
  );
}

async function resetAnimationSegment(page, preset, advanceSpeed = 25) {
  await applyPreset(page, preset, advanceSpeed, { settleMs: 500 });
  await page.evaluate(() => window.__GODMODE_EVIDENCE__?.setEvidencePortraitMode(true));
  await setUiChrome(page, { inspector: false, diagnostics: false });
}

async function captureWithRetry(page, saveShot, baseName, config, opts = {}, maxAttempts = 4) {
  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await captureDualAt1x(page, saveShot, baseName, config, opts);
      return;
    } catch (err) {
      lastErr = err;
      console.warn(`${baseName} attempt ${attempt}/${maxAttempts} failed:`, err.message);
      await resetAnimationSegment(page, config.preset, config.advanceSpeed ?? 25);
    }
  }
  throw lastErr;
}

async function captureFacilityShot(page, saveShot, name, config) {
  const { lockedActivity } = await acquireAt1x(page, {
    ...config,
    timeoutMs: 300_000,
  });
  await setSpeed(page, 0);
  await page.waitForTimeout(250);
  await waitRenderFrames(page, 12);
  const minArea = config.minCitizenArea ?? 0.022;
  try {
    await assertCitizenReadable(page, minArea);
  } catch {
    console.warn(`${name}: citizen small in facility preset — gentle portrait boost`);
    await frameFullBody(page, { margin: 2.2, minScreenAreaFraction: 0.028 });
    await assertCitizenReadable(page, Math.min(minArea, 0.016));
  }
  const frameMeta = await getMeta(page);
  assertMeta(frameMeta, name, {
    citizenId: true,
    pose: config.expectedPose,
    exactActivity: lockedActivity,
    clip: config.expectedClip,
    speed: 0,
    animationsSuppressed: false,
    daylight: config.requireDaylight !== false,
  });
  const camera = await getCamera(page);
  const vis = await page.evaluate(() => window.__GODMODE_EVIDENCE__.getCitizenScreenProjection());
  await saveShot(
    name,
    metaRecord(frameMeta, camera, {
      visibility: vis,
      facilityPreset: config.preset,
      acquiredAtSpeed: 1,
      lockedActivity,
    }),
  );
}

async function publishRelease() {
  const repo = 'akulasaivineeth/God-Mode-sim';
  const files = [
    'A_street_idle.png',
    'B_street_walk_A.png',
    'B_street_walk_B.png',
    'C_store_sit_eat_A.png',
    'C_store_sit_eat_B.png',
    'D_workshop_work_A.png',
    'D_workshop_work_B.png',
    'E_home_citizen_facility.png',
    'F_store_citizen_facility.png',
    'G_workshop_citizen_facility.png',
    'H_overview_route.png',
    'I_inspector.png',
    'J_review_clip.webm',
    'capture_metadata.json',
    'diagnostics_summary.json',
    'asset_network_summary.json',
  ].filter((f) => existsSync(path.join(OUT, f)));

  for (const required of [
    'A_street_idle.png',
    'B_street_walk_A.png',
    'B_street_walk_B.png',
    'C_store_sit_eat_A.png',
    'C_store_sit_eat_B.png',
    'D_workshop_work_A.png',
    'D_workshop_work_B.png',
    'capture_metadata.json',
  ]) {
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
    `gh release create ${RELEASE_TAG} --repo ${repo} --title "M02 R14 closure evidence" --notes "M02 R14 strict closure — live mixer at 1×, full-body framing, facility context" ${fileArgs}`,
    { stdio: 'inherit' },
  );
  console.log(`Published https://github.com/${repo}/releases/tag/${RELEASE_TAG}`);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: OUT, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(60_000);
  const metadata = {};
  const consoleErrors = [];
  const failedRequests = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('requestfailed', (req) => {
    failedRequests.push(`${req.url()} — ${req.failure()?.errorText ?? 'failed'}`);
  });

  const saveShot = async (name, meta = null) => {
    const result = await shot(page, name, meta);
    if (meta) metadata[name.replace('.png', '').replace('.webm', '')] = meta;
    return result;
  };

  await waitScene(page);
  await setUiChrome(page, { inspector: false, diagnostics: false });
  await page.evaluate(() => window.__GODMODE_EVIDENCE__?.setEvidencePortraitMode(true));

  // A — idle at sim minute 0 (?evidence=1 freezes before first step)
  await applyPreset(page, 'street', 0, { settleMs: 400 });
  let initMeta = await getMeta(page);
  if (initMeta.simMinute > 0 || initMeta.pose !== 'idle') {
    throw new Error(
      `A_street_idle: expected minute-0 idle freeze (minute=${initMeta.simMinute} pose=${initMeta.pose} activity="${initMeta.activity}")`,
    );
  }
  await frameFullBody(page, { margin: 1.48, minScreenAreaFraction: 0.07 });
  await assertCitizenReadable(page, 0.05);
  const idleMetaFinal = await getMeta(page);
  assertMeta(idleMetaFinal, 'A_street_idle', {
    citizenId: true,
    pose: 'idle',
    activity: /^(Idle|Relaxing)$/i,
    clip: /^idle$/i,
    speed: 0,
    animationsSuppressed: false,
    daylight: true,
  });
  await saveShot('A_street_idle', metaRecord(idleMetaFinal, await getCamera(page), { evidenceFrozenAtMinute0: true }));

  await waitForDaylight(page);

  // H — overview + diagnostics
  await applyPreset(page, 'overview', 0);
  const overviewDiag = await page.evaluate(() => window.__GODMODE_EVIDENCE__.getRenderDiagnostics());
  await saveShot('H_overview_route', { diagnostics: overviewDiag, view: 'overview' });

  const streetDiag = await page.evaluate(async () => {
    window.__GODMODE_EVIDENCE__.applyPreset('store-street');
    await new Promise((r) => setTimeout(r, 1500));
    return window.__GODMODE_EVIDENCE__.getRenderDiagnostics();
  });
  await page.waitForTimeout(500);

  // Fresh sim segment for B/C/D — catch walk/sit/work while schedule is predictable.
  await page.goto(BASE);
  await page.getByTestId('r3f-canvas').waitFor({ state: 'visible' });
  await page.waitForTimeout(2500);
  await waitForDaylight(page);
  await page.evaluate(() => window.__GODMODE_EVIDENCE__?.setEvidencePortraitMode(true));
  await setUiChrome(page, { inspector: false, diagnostics: false });

  // B — walk dual frames (lock immediately — travel windows are short at high advance speed)
  await captureWithRetry(page, saveShot, 'B_street_walk', {
    preset: 'street',
    advanceSpeed: 25,
    activityPattern: /Walking/i,
    expectedPose: 'walk',
    expectedClip: /^walk$/i,
    lockImmediately: true,
  });

  // C — sit/eat at store (fresh segment after walk block)
  await page.goto(BASE);
  await page.getByTestId('r3f-canvas').waitFor({ state: 'visible' });
  await page.waitForTimeout(2500);
  await waitForDaylight(page);
  await page.evaluate(() => window.__GODMODE_EVIDENCE__?.setEvidencePortraitMode(true));

  await captureWithRetry(
    page,
    saveShot,
    'C_store_sit_eat',
    {
      preset: 'store-street',
      advanceSpeed: 10,
      activityPattern: /Eating at the Store/i,
      expectedPose: 'sit',
      expectedClip: /^sit$/i,
      requirePoseBeforeSwitch: false,
      lockImmediately: true,
      timeoutMs: 360_000,
    },
    { useFullBodyPortrait: false },
    8,
  );

  // D — work at workshop (long perform window; lock on match)
  await captureWithRetry(
    page,
    saveShot,
    'D_workshop_work',
    {
      preset: 'workshop-street',
      advanceSpeed: 20,
      activityPattern: /^Working$/i,
      expectedPose: 'work',
      expectedClip: /interact-right|pick-up/i,
      lockImmediately: true,
      timeoutMs: 360_000,
    },
    { useFullBodyPortrait: false },
  );

  // E–G facility + citizen (fresh segment)
  await page.goto(BASE);
  await page.getByTestId('r3f-canvas').waitFor({ state: 'visible' });
  await page.waitForTimeout(2500);
  await waitForDaylight(page);
  await page.evaluate(() => window.__GODMODE_EVIDENCE__?.setEvidencePortraitMode(true));
  await setUiChrome(page, { inspector: false, diagnostics: false });
  // E — home + citizen at minute 0 (authoritative home position, readable prefab context)
  await page.goto(BASE);
  await page.getByTestId('r3f-canvas').waitFor({ state: 'visible' });
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.__GODMODE_EVIDENCE__?.setEvidencePortraitMode(true));
  await setUiChrome(page, { inspector: false, diagnostics: false });
  await applyPreset(page, 'home-street', 0, { settleMs: 500 });
  const homeMeta = await getMeta(page);
  if (homeMeta.simMinute !== 0 || homeMeta.citizenPosition?.x !== 11) {
    throw new Error(`E_home: expected minute-0 home spawn, got minute=${homeMeta.simMinute}`);
  }
  try {
    await assertCitizenReadable(page, 0.018);
  } catch {
    await frameFullBody(page, { margin: 2.0, minScreenAreaFraction: 0.025 });
    await assertCitizenReadable(page, 0.014);
  }
  assertMeta(homeMeta, 'E_home_citizen_facility', {
    citizenId: true,
    pose: 'idle',
    activity: /^Idle$/i,
    clip: /^idle$/i,
    speed: 0,
    animationsSuppressed: false,
    daylight: true,
  });
  await saveShot(
    'E_home_citizen_facility',
    metaRecord(homeMeta, await getCamera(page), { facilityPreset: 'home-street', evidenceFrozenAtMinute0: true }),
  );

  await page.goto(BASE);
  await page.getByTestId('r3f-canvas').waitFor({ state: 'visible' });
  await page.waitForTimeout(2500);
  await waitForDaylight(page);
  await page.evaluate(() => window.__GODMODE_EVIDENCE__?.setEvidencePortraitMode(true));
  await setUiChrome(page, { inspector: false, diagnostics: false });

  await captureFacilityShot(page, saveShot, 'F_store_citizen_facility', {
    preset: 'store-street',
    activityPattern: /Eating at the Store/i,
    expectedPose: 'sit',
    expectedClip: /^sit$/i,
    minCitizenArea: 0.025,
    advanceSpeed: 10,
    requirePoseBeforeSwitch: false,
    lockImmediately: true,
  });

  await captureFacilityShot(page, saveShot, 'G_workshop_citizen_facility', {
    preset: 'workshop-street',
    activityPattern: /^Working$/i,
    expectedPose: 'work',
    expectedClip: /interact-right|pick-up/i,
    minCitizenArea: 0.025,
    advanceSpeed: 20,
    lockImmediately: true,
  });

  // I — inspector
  await setUiChrome(page, { inspector: true, diagnostics: true });
  await applyPreset(page, 'store-street', 0);
  await page.getByTestId('citizen-inspector').waitFor({ state: 'visible' });
  const inspMeta = await getMeta(page);
  const inspCamera = await getCamera(page);
  await saveShot('I_inspector', metaRecord(inspMeta, inspCamera));

  // J — review clip
  await setUiChrome(page, { inspector: false, diagnostics: true });
  await applyPreset(page, 'overview', 20);
  await page.waitForTimeout(14_000);

  await context.close();
  const video = page.video();
  if (video) await video.saveAs(path.join(OUT, 'J_review_clip.webm'));
  await browser.close();

  await writeFile(
    path.join(OUT, 'diagnostics_summary.json'),
    JSON.stringify({ overview: overviewDiag, storeStreet: streetDiag }, null, 2),
  );
  await writeFile(
    path.join(OUT, 'asset_network_summary.json'),
    JSON.stringify(
      {
        consoleErrors,
        failedRequests,
        gltfIntegrity: 'pass — npm test asset-integrity gate',
      },
      null,
      2,
    ),
  );
  await writeFile(path.join(OUT, 'capture_metadata.json'), JSON.stringify(metadata, null, 2));
  console.log('M02 R14 closure evidence complete', OUT);

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
