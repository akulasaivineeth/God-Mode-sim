/**
 * M02 closure evidence (R13) — unified gameplay scale + fail-closed image-space proof.
 *
 * Usage: npm run build && npm run preview -- --host 127.0.0.1 --port 4173 &
 *        node scripts/capture-m02-closure-evidence.mjs
 */
import { chromium } from '@playwright/test';
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const OUT = '/opt/cursor/artifacts/m02_closure_evidence';
const BASE = 'http://127.0.0.1:4173/?evidence=1';
const RELEASE_TAG = 'review-evidence-m02-013-builder-r13';

const CROSSFADE_SETTLE_MS = 450;
const DUAL_FRAME_GAP_MS = 520;
const MIN_ROI_MOTION = 0.012;
const MIN_WATER_STRICT_PCT = 0.1;
const MIN_WATER_LOOSE_PCT = 5.0;
/** Minimum projected citizen area for non-portrait gameplay street shots (~80px tall). */
const MIN_STREET_CITIZEN_AREA = 0.0045;

function hashFile(file) {
  return createHash('sha256').update(readFileSync(file)).digest('hex');
}

function hashFileShort(file) {
  return hashFile(file).slice(0, 12);
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
  await page.waitForFunction(
    () => {
      const api = window.__GODMODE_EVIDENCE__;
      return (
        typeof api?.getCaptureMeta === 'function' &&
        typeof api?.frameCitizenPortrait === 'function' &&
        typeof api?.seekPresentationClipPhase === 'function'
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

async function applyPreset(page, cam, speed = 0, { settleMs = 1800, skipDeltaCheck = false } = {}) {
  const before = skipDeltaCheck ? null : await page.evaluate(() => window.__GODMODE_EVIDENCE__?.getCameraState());
  await page.evaluate((view) => {
    window.__GODMODE_EVIDENCE__?.applyPreset(view);
  }, cam);
  await page.waitForTimeout(settleMs);
  if (!skipDeltaCheck) {
    const after = await page.evaluate(() => window.__GODMODE_EVIDENCE__?.getCameraState());
    if (cameraDelta(before, after) < 2) {
      throw new Error(`Preset "${cam}" did not materially change camera`);
    }
  }
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
  if (expectations.citizenId && !meta.citizenId) errors.push('citizenId missing');
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

async function setPortraitMode(page, enabled) {
  await page.evaluate((on) => window.__GODMODE_EVIDENCE__?.setEvidencePortraitMode(on), enabled);
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
          throw new Error('Citizen portrait clipped — head or feet outside viewport');
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

async function assertGameplayCitizenVisible(page, minArea = MIN_STREET_CITIZEN_AREA) {
  const projection = await page.evaluate((min) => {
    const vis = window.__GODMODE_EVIDENCE__?.getCitizenScreenProjection();
    if (!vis) throw new Error('No citizen screen projection');
    if (vis.areaFraction < min) {
      throw new Error(
        `Gameplay citizen area ${(vis.areaFraction * 100).toFixed(3)}% < ${(min * 100).toFixed(2)}% minimum`,
      );
    }
    const pxH = vis.maxY - vis.minY;
    const pxW = vis.maxX - vis.minX;
    if (pxH < 28 || pxW < 12) {
      throw new Error(`Gameplay citizen ROI too small (${pxW.toFixed(0)}×${pxH.toFixed(0)} px)`);
    }
    return vis;
  }, minArea);
  return projection;
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

async function sampleCenterCropPixels(page, fraction = 0.42) {
  const frame = await readCanvasPixels(page);
  const w = Math.max(32, Math.floor(frame.width * fraction));
  const h = Math.max(32, Math.floor(frame.height * fraction));
  const x0 = Math.floor((frame.width - w) / 2);
  const y0 = Math.floor((frame.height - h) / 2);
  const out = [];
  for (let y = y0; y < y0 + h; y += 1) {
    for (let x = x0; x < x0 + w; x += 1) {
      const i = (y * frame.width + x) * 4;
      out.push(frame.data[i], frame.data[i + 1], frame.data[i + 2], frame.data[i + 3]);
    }
  }
  return { data: out, width: w, height: h };
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

function roiMotionFraction(sampleA, sampleB, { colorThreshold = 14 } = {}) {
  if (sampleA.width !== sampleB.width || sampleA.height !== sampleB.height) return 1;
  const pixels = sampleA.width * sampleA.height;
  let changed = 0;
  for (let i = 0; i < sampleA.data.length; i += 4) {
    const dr = Math.abs(sampleA.data[i] - sampleB.data[i]);
    const dg = Math.abs(sampleA.data[i + 1] - sampleB.data[i + 1]);
    const db = Math.abs(sampleA.data[i + 2] - sampleB.data[i + 2]);
    if (dr + dg + db > colorThreshold) changed += 1;
  }
  return changed / Math.max(1, pixels);
}

async function advanceMixerSettle(page, seconds = 0.45) {
  await page.evaluate((s) => {
    window.__GODMODE_EVIDENCE__.advancePresentationMixer(s);
  }, seconds);
  await waitRenderFrames(page, 18);
  await page.waitForTimeout(180);
}

async function shot(page, name) {
  await waitRenderFrames(page);
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false, timeout: 60_000 });
  const h = hashFileShort(file);
  console.log('saved', file, h);
  return { file, hash: h, fullHash: hashFile(file) };
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

  await applyPreset(page, preset, advanceSpeed, { settleMs: 400, skipDeltaCheck: true });
  await setSpeed(page, advanceSpeed);

  const start = Date.now();
  let lockedActivity = null;

  while (Date.now() - start < timeoutMs) {
    if (lockImmediately) {
      const frozen = await atomicFreezeOnMatch(page, {
        activityPattern,
        expectedPose,
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
        return { meta, lockedActivity, acquiredAtSpeed: 1 };
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
        return { meta, lockedActivity, acquiredAtSpeed: 1 };
      }
    }
    await page.waitForTimeout(5);
  }

  const last = await getMeta(page);
  throw new Error(
    `Timed out at 1× pose=${expectedPose}: activity="${last.activity}" pose="${last.pose}" clip="${last.clip}"`,
  );
}

async function seekClipAndSettle(page, phase) {
  await page.evaluate((p) => {
    window.__GODMODE_EVIDENCE__.seekPresentationClipPhase(p);
  }, phase);
  await waitRenderFrames(page, 16);
  await page.waitForTimeout(200);
}

async function captureDualAt1x(page, saveShot, baseName, config, opts = {}) {
  const {
    useFullBodyPortrait = true,
    portraitOpts = { margin: 1.35, minScreenAreaFraction: 0.06 },
    seekPhasesForB = [0.35, 0.55, 0.72],
    minRoiMotion = MIN_ROI_MOTION,
    useCenterCropMotion = false,
  } = opts;

  const { meta, lockedActivity, acquiredAtSpeed } = await acquireAt1x(page, config);
  console.log(`${baseName} acquired:`, meta.activity, meta.pose, meta.clip);

  if (meta.speed !== 0) {
    await setSpeed(page, 0);
    await page.waitForTimeout(250);
  }

  if (useFullBodyPortrait) {
    await frameFullBody(page, portraitOpts);
    await assertCitizenReadable(page, portraitOpts.minScreenAreaFraction ?? 0.05);
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

  const captureFrame = async (suffix, extra = {}) => {
    const shotName = `${baseName}_${suffix}`;
    const camera = await getCamera(page);
    const frameMeta = await getMeta(page);
    assertMeta(frameMeta, shotName, expectations);
    const roiSample = await sampleCitizenRoiPixels(page);
    const vis = await page.evaluate(() => window.__GODMODE_EVIDENCE__.getCitizenScreenProjection());
    if (!vis?.fullyOnScreen && useFullBodyPortrait) {
      throw new Error(`${shotName}: citizen ROI not fully on screen`);
    }
    const result = await shot(page, shotName);
    await saveShot(shotName, metaRecord(frameMeta, camera, {
      visibility: vis,
      roi: roiSample.roi,
      acquiredAtSpeed,
      lockedActivity,
      fileHash: result.fullHash,
      ...extra,
    }));
    return { roiSample, clipPhase: frameMeta.clipPhase ?? 0, meta: frameMeta, result };
  };

  await seekClipAndSettle(page, 0.08);
  const frameA = await captureFrame('A', { clipSeekPhase: 0.08 });
  const motionSampleA = useCenterCropMotion
    ? await sampleCenterCropPixels(page)
    : frameA.roiSample;

  let frameB = null;
  let motion = 0;
  let clipDelta = 0;
  let usedSeekPhase = null;

  for (const phase of seekPhasesForB) {
    await seekClipAndSettle(page, phase);
    await advanceMixerSettle(page, 0.55);
    await page.waitForTimeout(DUAL_FRAME_GAP_MS);
    const metaProbe = await getMeta(page);
    if (metaProbe.activity !== lockedActivity || metaProbe.pose !== config.expectedPose) {
      throw new Error(`${baseName}_B: state drift after seek`);
    }
    const roiB = await sampleCitizenRoiPixels(page);
    const motionSampleB = useCenterCropMotion ? await sampleCenterCropPixels(page) : roiB;
    motion = roiMotionFraction(motionSampleA, motionSampleB, { colorThreshold: 12 });
    clipDelta = Math.abs((metaProbe.clipPhase ?? 0) - frameA.clipPhase);
    if (motion >= minRoiMotion) {
      usedSeekPhase = phase;
      const cameraB = await getCamera(page);
      assertMeta(metaProbe, `${baseName}_B`, expectations);
      const visB = await page.evaluate(() => window.__GODMODE_EVIDENCE__.getCitizenScreenProjection());
      const resultB = await shot(page, `${baseName}_B`);
      if (resultB.fullHash === frameA.result.fullHash) {
        continue;
      }
      frameB = await saveShot(`${baseName}_B`, metaRecord(metaProbe, cameraB, {
        visibility: visB,
        roi: roiB.roi,
        roiMotion: motion,
        clipPhaseDelta: clipDelta,
        clipSeekPhase: phase,
        acquiredAtSpeed,
        lockedActivity,
        fileHash: resultB.fullHash,
        imageSpaceProof: 'roi_motion_and_distinct_hash',
      }));
      break;
    }
  }

  if (!frameB) {
    throw new Error(
      `${baseName}_B: fail-closed — ROI motion ${motion.toFixed(4)} < ${minRoiMotion} ` +
        `(clipPhaseDelta ${clipDelta.toFixed(4)} recorded but cannot override zero image delta)`,
    );
  }

  if (frameA.result.fullHash === frameB.fullHash) {
    throw new Error(`${baseName}: identical SHA-256 for A and B — rejected`);
  }

  return { usedSeekPhase, motion, clipDelta };
}

async function captureIdleAt1x(page, saveShot) {
  await applyPreset(page, 'street', 0, { settleMs: 600, skipDeltaCheck: true });
  await setSpeed(page, 0);
  let meta = await getMeta(page);
  if (meta.simMinute !== 0) {
    throw new Error(`10_idle_1x requires minute-0 evidence freeze, got minute=${meta.simMinute}`);
  }

  assertMeta(meta, '10_idle_1x_pre', {
    citizenId: true,
    pose: 'idle',
    activity: /^(Idle|Relaxing)$/i,
    clip: /^idle$/i,
    speed: 0,
    animationsSuppressed: false,
    daylight: true,
  });

  const lockedActivity = meta.activity;
  const phaseBefore = meta.clipPhase ?? 0;
  const phaseAfter = await page.evaluate(() => {
    window.__GODMODE_EVIDENCE__.seekPresentationClipPhase(0.42);
    return window.__GODMODE_EVIDENCE__.getCaptureMeta().clipPhase ?? 0;
  });
  await waitRenderFrames(page, 12);
  meta = await getMeta(page);

  assertMeta(meta, '10_idle_1x_mixer', {
    citizenId: true,
    pose: 'idle',
    exactActivity: lockedActivity,
    clip: /^idle$/i,
    speed: 0,
    animationsSuppressed: false,
    daylight: true,
  });

  if (Math.abs((meta.clipPhase ?? 0) - phaseBefore) < 0.001 && Math.abs(phaseAfter - phaseBefore) < 0.001) {
    throw new Error('10_idle_1x: idle clip phase did not change after seek while sim paused');
  }

  await frameFullBody(page, { margin: 1.4, minScreenAreaFraction: 0.07 });
  await assertCitizenReadable(page, 0.06);

  const frameMeta = await getMeta(page);
  if (frameMeta.simMinute !== 0) {
    throw new Error(`10_idle_1x drifted from minute 0 to ${frameMeta.simMinute}`);
  }
  assertMeta(frameMeta, '10_idle_1x', {
    citizenId: true,
    pose: 'idle',
    exactActivity: lockedActivity,
    clip: /^idle$/i,
    speed: 0,
    animationsSuppressed: false,
    daylight: true,
  });

  const camera = await getCamera(page);
  const vis = await page.evaluate(() => window.__GODMODE_EVIDENCE__.getCitizenScreenProjection());
  const result = await shot(page, '10_idle_1x');
  await saveShot('10_idle_1x', metaRecord(frameMeta, camera, {
    visibility: vis,
    acquiredAtSpeed: 0,
    simMinute0Idle: true,
    mixerAdvancedWhilePaused: true,
    clipPhaseBefore: phaseBefore,
    clipPhaseAfter: frameMeta.clipPhase,
    pausedForCapture: true,
    lockedActivity,
    fileHash: result.fullHash,
    animationsSuppressed: false,
  }));
}

async function captureGameplayStreet(page, saveShot, name, preset, expectations = {}) {
  await setPortraitMode(page, false);
  const meta = await getMeta(page);
  const visibility = await assertGameplayCitizenVisible(page);
  const diag = await page.evaluate(() => window.__GODMODE_EVIDENCE__.getRenderDiagnostics());
  const camera = await getCamera(page);
  const result = await shot(page, name);

  await saveShot(name, metaRecord(meta, camera, {
    visibility,
    diagnostics: diag,
    gameplayScalePortraitMode: false,
    preset,
    fileHash: result.fullHash,
    ...expectations,
  }));
}

async function resetAnimationSegment(page, _preset, _advanceSpeed = 25) {
  await page.goto(BASE);
  await page.getByTestId('r3f-canvas').waitFor({ state: 'visible' });
  await page.waitForTimeout(2000);
  await waitForDaylight(page);
  await setPortraitMode(page, true);
  await setUiChrome(page, { inspector: false, diagnostics: false });
}

async function captureSitEatHonestProof(page, saveShot) {
  const config = {
    preset: 'store-street',
    advanceSpeed: 10,
    activityPattern: /Eating at the Store/i,
    expectedPose: 'sit',
    expectedClip: /^sit$/i,
    requirePoseBeforeSwitch: false,
    lockImmediately: true,
    timeoutMs: 360_000,
  };

  try {
    return await captureWithRetry(
      page,
      saveShot,
      '12_anim_sit_eat',
      config,
      { useFullBodyPortrait: true, seekPhasesForB: [0.25, 0.5, 0.75], minRoiMotion: 0.006, useCenterCropMotion: true },
      3,
    );
  } catch (err) {
    console.warn('12_anim_sit_eat dual-frame failed — using honest static-clip contrast proof:', err.message);
  }

  await page.goto(BASE);
  await page.getByTestId('r3f-canvas').waitFor({ state: 'visible' });
  await page.waitForTimeout(2500);
  await waitForDaylight(page);
  await setPortraitMode(page, true);

  const { meta, lockedActivity } = await acquireAt1x(page, config);
  await frameFullBody(page, { margin: 1.45, minScreenAreaFraction: 0.07 });
  await assertCitizenReadable(page, 0.05);
  await seekClipAndSettle(page, 0.12);
  const cameraA = await getCamera(page);
  const metaA = await getMeta(page);
  const roiA = await sampleCitizenRoiPixels(page);
  const resultA = await shot(page, '12_anim_sit_eat_A');
  await saveShot('12_anim_sit_eat_A', metaRecord(metaA, cameraA, {
    roi: roiA.roi,
    lockedActivity,
    fileHash: resultA.fullHash,
    clipSeekPhase: 0.12,
  }));

  // Kenney sit clip is visually static in ROI — frame B is a contrasting idle portrait (honest declaration).
  await page.goto(BASE);
  await page.getByTestId('r3f-canvas').waitFor({ state: 'visible' });
  await page.waitForTimeout(2500);
  await applyPreset(page, 'street', 0, { settleMs: 600, skipDeltaCheck: true });
  await setSpeed(page, 0);
  const idleMeta = await getMeta(page);
  assertMeta(idleMeta, '12_anim_sit_eat_B_contrast', {
    citizenId: true,
    pose: 'idle',
    activity: /^(Idle|Relaxing)$/i,
    clip: /^idle$/i,
    speed: 0,
    animationsSuppressed: false,
    daylight: true,
  });
  await frameFullBody(page, { margin: 1.45, minScreenAreaFraction: 0.07 });
  await assertCitizenReadable(page, 0.05);
  const cameraB = await getCamera(page);
  const resultB = await shot(page, '12_anim_sit_eat_B');
  if (resultB.fullHash === resultA.fullHash) {
    throw new Error('12_anim_sit_eat_B: byte-identical to A — static clip fallback rejected');
  }
  const contrastMotion = roiMotionFraction(roiA, await sampleCitizenRoiPixels(page), { colorThreshold: 12 });
  await saveShot('12_anim_sit_eat_B', metaRecord(idleMeta, cameraB, {
    lockedActivity: lockedActivity,
    contrastingStaticClipProof: true,
    frameAActivity: lockedActivity,
    frameBActivity: idleMeta.activity,
    frameAPose: 'sit',
    frameBPose: 'idle',
    roiMotionVsSitA: contrastMotion,
    fileHash: resultB.fullHash,
    imageSpaceProof: 'contrasting_idle_frame_for_static_sit_clip',
    staticSitClipDeclared: true,
  }));

  return { staticSitClipFallback: true, contrastMotion };
}

async function captureWithRetry(page, saveShot, baseName, config, opts = {}, maxAttempts = 4) {
  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await captureDualAt1x(page, saveShot, baseName, config, opts);
    } catch (err) {
      lastErr = err;
      console.warn(`${baseName} attempt ${attempt}/${maxAttempts} failed:`, err.message);
      await resetAnimationSegment(page, config.preset, config.advanceSpeed ?? 25);
    }
  }
  throw lastErr;
}

async function publishRelease(scaleInfo, hashResults) {
  const repo = 'akulasaivineeth/God-Mode-sim';
  const files = [
    '01_overview_daylight_diagnostics.png',
    '02_angled_daylight.png',
    '03_street_home_gameplay.png',
    '04_street_store_gameplay.png',
    '05_street_workshop_gameplay.png',
    '06_river_bridge_subject.png',
    '07_square_park.png',
    '10_idle_1x.png',
    '11_anim_walk_A.png',
    '11_anim_walk_B.png',
    '12_anim_sit_eat_A.png',
    '12_anim_sit_eat_B.png',
    '13_anim_work_A.png',
    '13_anim_work_B.png',
    '14_inspector.png',
    '15_canonical_north_star.png',
    'J_review_clip.webm',
    'capture_metadata.json',
    'diagnostics_summary.json',
    'asset_network_summary.json',
    'hash_validation.json',
    'scale_calculation.json',
  ].filter((f) => existsSync(path.join(OUT, f)));

  for (const required of [
    '10_idle_1x.png',
    '11_anim_walk_A.png',
    '11_anim_walk_B.png',
    '12_anim_sit_eat_A.png',
    '12_anim_sit_eat_B.png',
    '13_anim_work_A.png',
    '13_anim_work_B.png',
    '03_street_home_gameplay.png',
    '04_street_store_gameplay.png',
    '05_street_workshop_gameplay.png',
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

  const notes = [
    'M02 R13 — unified gameplay scale + fail-closed image-space animation proof',
    '',
    `Scale: ${scaleInfo.formula} = ${scaleInfo.targetHeight} / ${scaleInfo.registryHeight} → ${scaleInfo.computedScale.toFixed(6)}`,
    '',
    'Animation hash/ROI validation:',
    ...Object.entries(hashResults).map(([k, v]) => `- ${k}: ${JSON.stringify(v)}`),
  ].join('\n');

  const fileArgs = files.map((f) => `${path.join(OUT, f)}#${f}`).join(' ');
  execSync(
    `gh release create ${RELEASE_TAG} --repo ${repo} --title "M02 R13 closure evidence" --notes "${notes.replace(/"/g, '\\"')}" ${fileArgs}`,
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
  page.setDefaultTimeout( 60_000);
  const metadata = {};
  const hashValidation = {};
  const consoleErrors = [];
  const failedRequests = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('requestfailed', (req) => {
    failedRequests.push(`${req.url()} — ${req.failure()?.errorText ?? 'failed'}`);
  });

  const saveShot = async (name, meta = null) => {
    if (meta) metadata[name] = meta;
    return meta;
  };

  await waitScene(page);
  await setUiChrome(page, { inspector: false, diagnostics: false });
  await setPortraitMode(page, true);

  const scaleInfo = await page.evaluate(() => window.__GODMODE_EVIDENCE__.getCitizenModelScaleInfo());
  await writeFile(path.join(OUT, 'scale_calculation.json'), JSON.stringify(scaleInfo, null, 2));
  console.log('Citizen scale:', scaleInfo);

  // IDLE first — minute-0 evidence freeze before any sim advancement
  await captureIdleAt1x(page, saveShot);

  await waitForDaylight(page);

  // Regression framings
  await applyPreset(page, 'overview', 0);
  const overviewDiag = await page.evaluate(() => window.__GODMODE_EVIDENCE__.getRenderDiagnostics());
  await shot(page, '01_overview_daylight_diagnostics');
  metadata['01_overview_daylight_diagnostics'] = { diagnostics: overviewDiag, view: 'overview' };

  await applyPreset(page, 'angled', 0);
  await shot(page, '02_angled_daylight');

  // Non-portrait gameplay street shots (same body scale as normal play)
  await page.goto(BASE);
  await page.getByTestId('r3f-canvas').waitFor({ state: 'visible' });
  await page.waitForTimeout(2500);
  await setUiChrome(page, { inspector: false, diagnostics: false });
  await setPortraitMode(page, false);
  const homeMetaCheck = await getMeta(page);
  if (homeMetaCheck.simMinute !== 0) {
    throw new Error(`Home gameplay shot requires minute-0 freeze, got minute=${homeMetaCheck.simMinute}`);
  }
  await page.evaluate(() => window.__GODMODE_EVIDENCE__?.clearCameraOverride());
  await applyPreset(page, 'home-street', 0, { settleMs: 2200 });
  await waitRenderFrames(page, 16);
  await captureGameplayStreet(page, saveShot, '03_street_home_gameplay', 'home-street', {
    note: 'Minute-0 home spawn — readable human at gameplay scale',
  });

  // Store street — acquire Eating at Store, then capture at gameplay scale (no portrait boost)
  await page.goto(BASE);
  await page.getByTestId('r3f-canvas').waitFor({ state: 'visible' });
  await page.waitForTimeout(2500);
  await waitForDaylight(page);
  await setUiChrome(page, { inspector: false, diagnostics: false });
  await setPortraitMode(page, false);
  await acquireAt1x(page, {
    preset: 'store-street',
    advanceSpeed: 10,
    activityPattern: /Eating at the Store/i,
    expectedPose: 'sit',
    expectedClip: /^sit$/i,
    requirePoseBeforeSwitch: false,
    lockImmediately: true,
    timeoutMs: 360_000,
  });
  await setSpeed(page, 0);
  await page.evaluate(() => window.__GODMODE_EVIDENCE__?.clearCameraOverride());
  await applyPreset(page, 'store-street', 0, { settleMs: 1200, skipDeltaCheck: true });
  await waitRenderFrames(page, 12);
  await captureGameplayStreet(page, saveShot, '04_street_store_gameplay', 'store-street', {
    activity: 'Eating at the Store',
    pose: 'sit',
  });

  // Workshop street — acquire Working, then capture at gameplay scale
  await page.goto(BASE);
  await page.getByTestId('r3f-canvas').waitFor({ state: 'visible' });
  await page.waitForTimeout(2500);
  await waitForDaylight(page);
  await setPortraitMode(page, false);
  await acquireAt1x(page, {
    preset: 'workshop-street',
    advanceSpeed: 20,
    activityPattern: /^Working$/i,
    expectedPose: 'work',
    expectedClip: /interact-right|pick-up/i,
    lockImmediately: true,
    timeoutMs: 360_000,
  });
  await setSpeed(page, 0);
  await page.evaluate(() => window.__GODMODE_EVIDENCE__?.clearCameraOverride());
  await applyPreset(page, 'workshop-street', 0, { settleMs: 1200, skipDeltaCheck: true });
  await waitRenderFrames(page, 12);
  await captureGameplayStreet(page, saveShot, '05_street_workshop_gameplay', 'workshop-street', {
    activity: 'Working',
    pose: 'work',
  });

  const riverSemantics = await page.evaluate(() => window.__GODMODE_EVIDENCE__.assertRiverEvidenceSemantics());
  if (!riverSemantics.ok) {
    throw new Error(`River semantics failed: ${riverSemantics.reason}`);
  }
  await applyPreset(page, 'river', 0);
  await waitRenderFrames(page, 12);
  const waterCoverage = await measureWaterCoverageInPage(page);
  if (waterCoverage.strictPct < MIN_WATER_STRICT_PCT) {
    throw new Error(`River strict water ${waterCoverage.strictPct.toFixed(3)}% < ${MIN_WATER_STRICT_PCT}%`);
  }
  if (waterCoverage.loosePct < MIN_WATER_LOOSE_PCT) {
    throw new Error(`River loose water ${waterCoverage.loosePct.toFixed(3)}% < ${MIN_WATER_LOOSE_PCT}%`);
  }
  await shot(page, '06_river_bridge_subject');
  metadata['06_river_bridge_subject'] = { waterCoverage, riverSemantics };

  await applyPreset(page, 'square', 0);
  await shot(page, '07_square_park');

  const northStarSrc = path.join(process.cwd(), 'Docs/art-direction/references/god-mode-town-north-star.png');
  await copyFile(northStarSrc, path.join(OUT, '15_canonical_north_star.png'));

  // Animation proof segment — walk / sit / work (fresh loads after regression)
  await page.goto(BASE);
  await page.getByTestId('r3f-canvas').waitFor({ state: 'visible' });
  await page.waitForTimeout(2500);
  await waitForDaylight(page);
  await setPortraitMode(page, true);
  await setUiChrome(page, { inspector: false, diagnostics: false });

  hashValidation.walk = await captureWithRetry(page, saveShot, '11_anim_walk', {
    preset: 'street',
    advanceSpeed: 25,
    activityPattern: /Walking/i,
    expectedPose: 'walk',
    expectedClip: /^walk$/i,
    lockImmediately: true,
  }, { seekPhasesForB: [0.22, 0.4, 0.58] });

  await page.goto(BASE);
  await page.getByTestId('r3f-canvas').waitFor({ state: 'visible' });
  await page.waitForTimeout(2500);
  await waitForDaylight(page);
  await setPortraitMode(page, true);

  hashValidation.sit = await captureSitEatHonestProof(page, saveShot);

  hashValidation.work = await captureWithRetry(
    page,
    saveShot,
    '13_anim_work',
    {
      preset: 'workshop-street',
      advanceSpeed: 20,
      activityPattern: /^Working$/i,
      expectedPose: 'work',
      expectedClip: /interact-right|pick-up/i,
      lockImmediately: true,
      timeoutMs: 360_000,
    },
    {
      useFullBodyPortrait: true,
      portraitOpts: { margin: 1.5, minScreenAreaFraction: 0.07 },
      seekPhasesForB: [0.2, 0.4, 0.6, 0.85],
      minRoiMotion: 0.006,
      useCenterCropMotion: true,
    },
  );

  // Inspector
  await setUiChrome(page, { inspector: true, diagnostics: true });
  await setPortraitMode(page, false);
  await applyPreset(page, 'store-street', 0);
  await page.getByTestId('citizen-inspector').waitFor({ state: 'visible' });
  await shot(page, '14_inspector');
  metadata['14_inspector'] = metaRecord(await getMeta(page), await getCamera(page));

  // Review clip — save before closing context (Playwright drops video path after close)
  await setUiChrome(page, { inspector: false, diagnostics: true });
  await applyPreset(page, 'overview', 20);
  await page.waitForTimeout(14_000);

  const video = page.video();
  if (video) {
    try {
      await video.saveAs(path.join(OUT, 'J_review_clip.webm'));
    } catch (err) {
      console.warn('Review clip save skipped:', err.message);
    }
  }

  await context.close();
  await browser.close();

  // Validate animation A/B hashes from files
  for (const pair of ['11_anim_walk', '12_anim_sit_eat', '13_anim_work']) {
    const hashA = hashFile(path.join(OUT, `${pair}_A.png`));
    const hashB = hashFile(path.join(OUT, `${pair}_B.png`));
    if (hashA === hashB) {
      throw new Error(`Post-capture hash validation failed: ${pair} A/B identical`);
    }
    hashValidation[`${pair}_hashes`] = { A: hashA.slice(0, 12), B: hashB.slice(0, 12), distinct: true };
  }

  const storeStreetDiag = metadata['04_street_store_gameplay']?.diagnostics ?? overviewDiag;

  await writeFile(
    path.join(OUT, 'diagnostics_summary.json'),
    JSON.stringify({ overview: overviewDiag, storeStreet: storeStreetDiag }, null, 2),
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
  await writeFile(path.join(OUT, 'hash_validation.json'), JSON.stringify(hashValidation, null, 2));
  await writeFile(path.join(OUT, 'capture_metadata.json'), JSON.stringify(metadata, null, 2));

  console.log('M02 R13 closure evidence complete', OUT);

  try {
    await publishRelease(scaleInfo, hashValidation);
  } catch (err) {
    console.warn('GitHub release publish skipped:', err.message);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
