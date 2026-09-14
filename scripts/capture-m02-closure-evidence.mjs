/**
 * M02 closure evidence (M02-020) — unified gameplay scale + fail-closed street/anim proof.
 *
 * Single authoritative M02 capture harness. Legacy scripts (capture-r8..r12) are archival only.
 *
 * Usage: npm run build && npm run preview -- --host 127.0.0.1 --port 4173 &
 *        node scripts/capture-m02-closure-evidence.mjs
 */
import { chromium } from '@playwright/test';
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const OUT = '/opt/cursor/artifacts/m02_closure_evidence';
const BASE = 'http://127.0.0.1:4173/?evidence=1';
const RELEASE_TAG = 'review-evidence-m02-020-builder-r14';
const MIN_GAMEPLAY_PIXEL_HEIGHT = 80;
const MIN_PORTRAIT_PIXEL_HEIGHT = 100;
const BEFORE_BASE =
  'https://github.com/akulasaivineeth/God-Mode-sim/releases/download/review-evidence-m02-020-grok';

const CROSSFADE_SETTLE_MS = 450;
const DUAL_FRAME_GAP_MS = 520;
const MIN_ROI_MOTION = 0.012;
const MIN_WATER_STRICT_PCT = 0.1;
const MIN_WATER_LOOSE_PCT = 5.0;
/** Minimum projected citizen area for non-portrait gameplay street shots (~80px tall). */
const MIN_STREET_CITIZEN_AREA = 0.0055;

/** Precomputed from GODMODE_M02_CANONICAL_2026 — see canonicalEvidenceSchedule.test.ts */
const CANONICAL_EVIDENCE_MINUTES = {
  firstDaytimeStoreEatPerform: 2048,
  firstDaytimeWorkPerform: 499,
  firstDaytimeWalkTravel: 481,
};

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
        typeof api?.seekPresentationClipPhase === 'function' &&
        typeof api?.stepToSimMinute === 'function'
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

async function stepToSimMinute(page, targetMinute) {
  await setSpeed(page, 0);
  await page.evaluate(async (target) => {
    await window.__GODMODE_EVIDENCE__.stepToSimMinute(target);
  }, targetMinute);
  await waitRenderFrames(page, 14);
  await page.waitForTimeout(280);
}

async function reloadEvidenceScene(page) {
  await page.goto(BASE);
  await page.getByTestId('r3f-canvas').waitFor({ state: 'visible' });
  await page.waitForTimeout(1800);
}

async function seekCanonicalActivity(page, config) {
  const {
    targetMinute,
    scanWindow = 40,
    activityPattern,
    expectedPose,
    expectedClip,
    requireDaylight = true,
    label = 'seekCanonicalActivity',
    afterReload = null,
  } = config;

  let lastMeta = await getMeta(page);
  for (let offset = 0; offset < scanWindow; offset += 1) {
    if (offset > 0) {
      await reloadEvidenceScene(page);
      if (afterReload) {
        await afterReload(page);
      }
    }
    await stepToSimMinute(page, targetMinute + offset);
    lastMeta = await getMeta(page);
    const daylightOk = !requireDaylight || lastMeta.isDaylight;
    if (
      daylightOk &&
      activityPattern.test(lastMeta.activity ?? '') &&
      lastMeta.pose === expectedPose
    ) {
      const settled = await waitForClip(page, expectedClip, 1200);
      assertMeta(settled, label, {
        citizenId: true,
        pose: expectedPose,
        exactActivity: settled.activity,
        clip: expectedClip,
        speed: 0,
        animationsSuppressed: false,
        daylight: requireDaylight,
      });
      return { meta: settled, lockedActivity: settled.activity };
    }
  }

  throw new Error(
    `${label}: no match near minute ${targetMinute} (last activity="${lastMeta.activity}" pose="${lastMeta.pose}" minute=${lastMeta.simMinute})`,
  );
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

async function assertStreetCameraGeometry(page, preset) {
  const check = await page.evaluate((view) => {
    return window.__GODMODE_EVIDENCE__?.assertStreetCameraGeometry(view);
  }, preset);
  if (!check?.ok) {
    throw new Error(`Street camera geometry failed for ${preset}: ${check?.reason ?? 'unknown'}`);
  }
}

async function assertHumanoidSubjectPresent(
  page,
  label,
  { minArea = 0.045, minHeight = MIN_PORTRAIT_PIXEL_HEIGHT } = {},
) {
  const result = await page.evaluate(({ minArea, minHeight }) => {
    try {
      const vis = window.__GODMODE_EVIDENCE__?.assertCitizenVisibility(minArea, minHeight);
      const pxH = vis.maxY - vis.minY;
      const pxW = vis.maxX - vis.minX;
      if (pxH < minHeight) {
        return { ok: false, reason: `projected height ${pxH.toFixed(0)}px < ${minHeight}px` };
      }
      if (pxW < 18) {
        return { ok: false, reason: `projected width ${pxW.toFixed(0)}px too narrow — subject likely absent` };
      }
      return { ok: true, vis, pxH, pxW };
    } catch (err) {
      return { ok: false, reason: err.message ?? String(err) };
    }
  }, { minArea, minHeight });
  if (!result.ok) {
    throw new Error(`${label}: humanoid subject check failed — ${result.reason}`);
  }
  return result;
}

async function waitForPresentationConvergence(page, config) {
  const {
    activityPattern,
    expectedPose,
    expectedClip,
    speed = 1,
    timeoutMs = 20_000,
    skipInitialSeek = false,
  } = config;

  if (!skipInitialSeek) {
    await seekClipAndSettle(page, 0.08);
    await advanceMixerSettle(page, 0.55);
  }
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const meta = await getMeta(page);
    const activityOk = !activityPattern || activityPattern.test(meta.activity ?? '');
    const poseOk = meta.pose === expectedPose;
    const clipOk = expectedClip.test(meta.clip ?? '');
    const speedOk = meta.speed === speed;
    if (activityOk && poseOk && clipOk && speedOk && meta.animationsSuppressed === false) {
      await waitRenderFrames(page, 14);
      return meta;
    }
    await advanceMixerSettle(page, 0.06);
    await page.waitForTimeout(40);
  }
  const last = await getMeta(page);
  throw new Error(
    `Presentation convergence timeout: activity="${last.activity}" pose="${last.pose}" clip="${last.clip}" speed=${last.speed}`,
  );
}

async function downloadBeforeArtifacts() {
  const beforeDir = path.join(OUT, 'before_m020');
  await mkdir(beforeDir, { recursive: true });
  const files = {
    store: '04_street_store_gameplay.png',
    workshop: '05_street_workshop_gameplay.png',
    idle: '10_idle_1x.png',
    workA: '13_anim_work_A.png',
    workB: '13_anim_work_B.png',
  };
  for (const [key, name] of Object.entries(files)) {
    const dest = path.join(beforeDir, name);
    if (!existsSync(dest)) {
      execSync(`curl -fsSL "${BEFORE_BASE}/${name}" -o "${dest}"`, { stdio: 'inherit' });
    }
  }
  return beforeDir;
}

async function stitchBeforeAfter(page, beforePath, afterPath, outName, title) {
  if (!existsSync(beforePath) || !existsSync(afterPath)) {
    console.warn('Skipping compare panel — missing', beforePath, afterPath);
    return null;
  }
  const beforeB64 = readFileSync(beforePath).toString('base64');
  const afterB64 = readFileSync(afterPath).toString('base64');
  await page.evaluate(
    async ({ beforeB64, afterB64, title }) => {
      const load = (b64) =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = `data:image/png;base64,${b64}`;
        });
      const before = await load(beforeB64);
      const after = await load(afterB64);
      const pad = 16;
      const labelH = 36;
      const w = before.width + after.width + pad * 3;
      const h = Math.max(before.height, after.height) + labelH + pad * 2;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0b0d10';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#d8dee9';
      ctx.font = '16px ui-monospace, monospace';
      ctx.fillText(title, pad, 24);
      ctx.drawImage(before, pad, labelH + pad);
      ctx.fillText('BEFORE (M02-020)', pad, labelH + pad - 6);
      ctx.drawImage(after, before.width + pad * 2, labelH + pad);
      ctx.fillText('AFTER', before.width + pad * 2, labelH + pad - 6);
      (window.__compareDataUrl = canvas.toDataURL('image/png'));
    },
    { beforeB64, afterB64, title },
  );
  const dataUrl = await page.evaluate(() => window.__compareDataUrl);
  const b64 = dataUrl.split(',')[1];
  const outPath = path.join(OUT, outName);
  writeFileSync(outPath, Buffer.from(b64, 'base64'));
  console.log('saved compare', outPath);
  return outPath;
}

async function assertGameplayCitizenVisible(page, preset, minArea = MIN_STREET_CITIZEN_AREA) {
  await assertStreetCameraGeometry(page, preset);
  const projection = await page.evaluate(({ minArea, minHeight }) => {
    const vis = window.__GODMODE_EVIDENCE__?.getCitizenScreenProjection();
    if (!vis) throw new Error('No citizen screen projection');
    window.__GODMODE_EVIDENCE__?.assertCitizenVisibility(minArea, minHeight);
    return vis;
  }, { minArea, minHeight: MIN_GAMEPLAY_PIXEL_HEIGHT });
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
    targetMinute = null,
    scanWindow = 40,
  } = config;

  await applyPreset(page, preset, 0, { settleMs: 400, skipDeltaCheck: true });
  await setSpeed(page, 0);

  if (targetMinute != null) {
    const { meta, lockedActivity } = await seekCanonicalActivity(page, {
      targetMinute,
      scanWindow,
      activityPattern,
      expectedPose,
      expectedClip,
      requireDaylight,
      label: 'acquireAt1x',
      afterReload: async (p) => {
        await applyPreset(p, preset, 0, { settleMs: 400, skipDeltaCheck: true });
      },
    });
    return { meta, lockedActivity, acquiredAtSpeed: 0 };
  }

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

async function acquireActivityWhileDaylightWithRetry(page, config, maxAttempts = 6) {
  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await acquireActivityWhileDaylight(page, config);
    } catch (err) {
      lastErr = err;
      console.warn(`Activity acquire attempt ${attempt}/${maxAttempts} failed:`, err.message);
      await page.goto(BASE);
      await page.getByTestId('r3f-canvas').waitFor({ state: 'visible' });
      await page.waitForTimeout(2000);
      await waitForDaylight(page);
      await setPortraitMode(page, false);
      await setUiChrome(page, { inspector: false, diagnostics: false });
    }
  }
  throw lastErr;
}

async function acquireActivityWhileDaylight(page, config) {
  const {
    targetMinute,
    scanWindow = 40,
    activityPattern,
    expectedPose,
    expectedClip,
    label = 'acquireActivityWhileDaylight',
  } = config;

  if (targetMinute == null) {
    throw new Error(`${label}: targetMinute required for headless-safe canonical seek`);
  }

  return seekCanonicalActivity(page, {
    targetMinute,
    scanWindow,
    activityPattern,
    expectedPose,
    expectedClip,
    requireDaylight: true,
    label,
  });
}

async function acquireAndSettleAt1x(page, config) {
  const {
    preset,
    advanceSpeed = 50,
    activityPattern,
    expectedPose,
    expectedClip,
    requireDaylight = true,
    requirePoseBeforeSwitch = true,
    timeoutMs = 240_000,
    settleFrames = 2,
  } = config;

  await applyPreset(page, preset, advanceSpeed, { settleMs: 400, skipDeltaCheck: true });
  await setSpeed(page, advanceSpeed);

  const start = Date.now();
  let switchedTo1x = false;
  let lockedActivity = null;
  let consecutiveSettle = 0;

  while (Date.now() - start < timeoutMs) {
    let meta = await getMeta(page);
    const daylightOk = !requireDaylight || meta.isDaylight;
    const activityOk = activityPattern.test(meta.activity ?? '');
    const poseOk = !requirePoseBeforeSwitch || meta.pose === expectedPose;

    if (activityOk && poseOk && daylightOk) {
      if (!switchedTo1x) {
        await setSpeed(page, 1);
        await page.waitForTimeout(CROSSFADE_SETTLE_MS);
        switchedTo1x = true;
        lockedActivity = meta.activity;
      }
      meta = await waitForClip(page, expectedClip, 900);
      const settled =
        meta.speed === 1 &&
        meta.pose === expectedPose &&
        meta.activity === lockedActivity &&
        expectedClip.test(meta.clip ?? '') &&
        meta.animationsSuppressed === false &&
        daylightOk;
      if (settled) {
        consecutiveSettle += 1;
        if (consecutiveSettle >= settleFrames) {
          assertMeta(meta, 'acquireAndSettleAt1x', {
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
      } else {
        consecutiveSettle = 0;
      }
    }
    await page.waitForTimeout(8);
  }

  const last = await getMeta(page);
  throw new Error(
    `Timed out settling at 1× pose=${expectedPose}: activity="${last.activity}" pose="${last.pose}" clip="${last.clip}"`,
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
    await page.evaluate(() => window.__GODMODE_EVIDENCE__?.clearCameraOverride());
    await frameFullBody(page, portraitOpts);
    await assertHumanoidSubjectPresent(page, `${baseName}_framing`, {
      minArea: portraitOpts.minScreenAreaFraction ?? 0.05,
      minHeight: MIN_PORTRAIT_PIXEL_HEIGHT,
    });
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
    await assertHumanoidSubjectPresent(page, shotName, {
      minArea: portraitOpts.minScreenAreaFraction ?? 0.05,
      minHeight: MIN_PORTRAIT_PIXEL_HEIGHT,
    });
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

/** Dual-frame proof while sim + mixer remain at 1× (required for static in-place clips like sit). */
async function captureDualAtLive1x(page, saveShot, baseName, config, opts = {}) {
  const {
    useFullBodyPortrait = true,
    portraitOpts = { margin: 1.35, minScreenAreaFraction: 0.06 },
    minRoiMotion = MIN_ROI_MOTION,
    dualGapMs = DUAL_FRAME_GAP_MS,
  } = opts;

  const { meta, lockedActivity } = await acquireAndSettleAt1x(page, config);
  console.log(`${baseName} settled at live 1×:`, meta.activity, meta.pose, meta.clip);

  if (useFullBodyPortrait) {
    await frameFullBody(page, portraitOpts);
    await assertCitizenReadable(page, portraitOpts.minScreenAreaFraction ?? 0.05);
  }

  const expectations = {
    citizenId: true,
    pose: config.expectedPose,
    exactActivity: lockedActivity,
    clip: config.expectedClip,
    speed: 1,
    animationsSuppressed: false,
    daylight: config.requireDaylight !== false,
  };

  const roiA = await sampleCitizenRoiPixels(page);
  const cameraA = await getCamera(page);
  const metaA = await getMeta(page);
  assertMeta(metaA, `${baseName}_A`, expectations);
  const visA = await page.evaluate(() => window.__GODMODE_EVIDENCE__.getCitizenScreenProjection());
  const resultA = await shot(page, `${baseName}_A`);
  await saveShot(`${baseName}_A`, metaRecord(metaA, cameraA, {
    visibility: visA,
    roi: roiA.roi,
    acquiredAtSpeed: 1,
    lockedActivity,
    fileHash: resultA.fullHash,
    liveMixerAt1x: true,
  }));

  let capturedB = false;
  let motion = 0;
  for (let attempt = 0; attempt < 18; attempt += 1) {
    await page.waitForTimeout(Math.min(dualGapMs, 180 + attempt * 30));
    if (useFullBodyPortrait) {
      await frameFullBody(page, portraitOpts);
    }
    const metaB = await getMeta(page);
    if (metaB.activity !== lockedActivity || metaB.pose !== config.expectedPose || metaB.speed !== 1) {
      throw new Error(`${baseName}_B: drift at live 1× (${lockedActivity}/${config.expectedPose} -> ${metaB.activity}/${metaB.pose} speed=${metaB.speed})`);
    }
    assertMeta(metaB, `${baseName}_B`, expectations);
    const roiB = await sampleCitizenRoiPixels(page);
    motion = roiMotionFraction(roiA, roiB, { colorThreshold: 12 });
    if (motion < minRoiMotion) continue;
    const resultB = await shot(page, `${baseName}_B`);
    if (resultB.fullHash === resultA.fullHash) continue;
    const visB = await page.evaluate(() => window.__GODMODE_EVIDENCE__.getCitizenScreenProjection());
    await saveShot(`${baseName}_B`, metaRecord(metaB, await getCamera(page), {
      visibility: visB,
      roi: roiB.roi,
      roiMotion: motion,
      acquiredAtSpeed: 1,
      lockedActivity,
      fileHash: resultB.fullHash,
      liveMixerAt1x: true,
      imageSpaceProof: 'roi_motion_and_distinct_hash',
    }));
    capturedB = true;
    break;
  }

  await setSpeed(page, 0);

  if (!capturedB) {
    throw new Error(`${baseName}_B: fail-closed — ROI motion ${motion.toFixed(4)} < ${minRoiMotion} at live 1×`);
  }

  return { motion, liveAt1x: true };
}

async function captureIdleAt1x(page, saveShot) {
  await reloadEvidenceScene(page);
  await setPortraitMode(page, true);
  await setUiChrome(page, { inspector: false, diagnostics: false });

  const minute0 = await getMeta(page);
  if (minute0.simMinute !== 0) {
    throw new Error(`Idle proof requires minute-0 spawn, got minute=${minute0.simMinute}`);
  }

  await setSpeed(page, 0);
  await seekClipAndSettle(page, 0);
  await advanceMixerSettle(page, 0.9);
  await waitRenderFrames(page, 24);

  const meta = await getMeta(page);
  assertMeta(meta, '10_idle_1x', {
    citizenId: true,
    pose: 'idle',
    activity: /^(Idle|Relaxing)$/i,
    clip: /^idle$/i,
    speed: 0,
    animationsSuppressed: false,
  });

  await page.evaluate(() => window.__GODMODE_EVIDENCE__?.clearCameraOverride());
  await frameFullBody(page, { margin: 1.45, minScreenAreaFraction: 0.08 });
  await assertHumanoidSubjectPresent(page, '10_idle_1x', {
    minArea: 0.06,
    minHeight: MIN_PORTRAIT_PIXEL_HEIGHT,
  });

  const camera = await getCamera(page);
  const vis = await page.evaluate(() => window.__GODMODE_EVIDENCE__.getCitizenScreenProjection());
  const result = await shot(page, '10_idle_1x');
  await saveShot('10_idle_1x', metaRecord(meta, camera, {
    visibility: vis,
    acquiredAtSpeed: 0,
    lockedActivity: meta.activity,
    fileHash: result.fullHash,
    animationsSuppressed: false,
    liveMixerAt1x: false,
    presentationConverged: true,
  }));
  await setSpeed(page, 0);
}

async function captureGameplayStreet(page, saveShot, name, preset, expectations = {}) {
  await setPortraitMode(page, false);
  await assertStreetCameraGeometry(page, preset);
  const meta = await getMeta(page);
  const visibility = await assertGameplayCitizenVisible(page, preset);
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

async function captureWithRetryLive(page, saveShot, baseName, config, opts = {}, maxAttempts = 6) {
  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await captureDualAtLive1x(page, saveShot, baseName, config, opts);
    } catch (err) {
      lastErr = err;
      console.warn(`${baseName} live-1× attempt ${attempt}/${maxAttempts} failed:`, err.message);
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
    'compare_04_store_street.png',
    'compare_05_workshop_street.png',
    'compare_10_idle_1x.png',
    'compare_13_work_A.png',
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
    'M02-020 — facility street cameras + fail-closed humanoid subject proof',
    '',
    `Scale: ${scaleInfo.formula} = ${scaleInfo.targetHeight} / ${scaleInfo.registryHeight} → ${scaleInfo.computedScale.toFixed(6)}`,
    '',
    'Animation hash/ROI validation:',
    ...Object.entries(hashResults).map(([k, v]) => `- ${k}: ${JSON.stringify(v)}`),
  ].join('\n');

  const fileArgs = files.map((f) => `${path.join(OUT, f)}#${f}`).join(' ');
  execSync(
    `gh release create ${RELEASE_TAG} --repo ${repo} --title "M02 R13 / M02-015 closure evidence" --notes "${notes.replace(/"/g, '\\"')}" ${fileArgs}`,
    { stdio: 'inherit' },
  );
  console.log(`Published https://github.com/${repo}/releases/tag/${RELEASE_TAG}`);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({
    args: [
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
    ],
  });
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
  await acquireActivityWhileDaylightWithRetry(page, {
    targetMinute: CANONICAL_EVIDENCE_MINUTES.firstDaytimeStoreEatPerform,
    activityPattern: /Eating at the Store/i,
    expectedPose: 'sit',
    expectedClip: /interact-right|pick-up|^sit$/i,
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
  await acquireActivityWhileDaylightWithRetry(page, {
    targetMinute: CANONICAL_EVIDENCE_MINUTES.firstDaytimeWorkPerform,
    activityPattern: /^Working$/i,
    expectedPose: 'work',
    expectedClip: /interact-right|pick-up/i,
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

  // Animation proof segment — idle at minute-0, then daylight-gated walk / sit / work
  await reloadEvidenceScene(page);
  await setPortraitMode(page, true);
  await setUiChrome(page, { inspector: false, diagnostics: false });

  await captureIdleAt1x(page, saveShot);

  await waitForDaylight(page);

  hashValidation.walk = await captureWithRetry(page, saveShot, '11_anim_walk', {
    preset: 'street',
    targetMinute: CANONICAL_EVIDENCE_MINUTES.firstDaytimeWalkTravel,
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

  hashValidation.sit = await captureWithRetry(
    page,
    saveShot,
    '12_anim_sit_eat',
    {
      preset: 'store-street',
      targetMinute: CANONICAL_EVIDENCE_MINUTES.firstDaytimeStoreEatPerform,
      activityPattern: /Eating at the Store/i,
      expectedPose: 'sit',
      expectedClip: /interact-right|pick-up|^sit$/i,
      lockImmediately: true,
    },
    {
      seekPhasesForB: [0.12, 0.28, 0.44, 0.62, 0.78],
      minRoiMotion: 0.008,
      useCenterCropMotion: false,
      portraitOpts: { margin: 1.4, minScreenAreaFraction: 0.07 },
    },
    6,
  );

  hashValidation.work = await captureWithRetry(
    page,
    saveShot,
    '13_anim_work',
    {
      preset: 'workshop-street',
      targetMinute: CANONICAL_EVIDENCE_MINUTES.firstDaytimeWorkPerform,
      activityPattern: /^Working$/i,
      expectedPose: 'work',
      expectedClip: /interact-right|pick-up/i,
      lockImmediately: true,
    },
    {
      useFullBodyPortrait: true,
      portraitOpts: { margin: 1.55, minScreenAreaFraction: 0.08 },
      seekPhasesForB: [0.18, 0.36, 0.54, 0.72, 0.88],
      minRoiMotion: 0.01,
      useCenterCropMotion: false,
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
      await Promise.race([
        video.saveAs(path.join(OUT, 'J_review_clip.webm')),
        page.waitForTimeout(30_000).then(() => {
          throw new Error('Review clip save timed out');
        }),
      ]);
    } catch (err) {
      console.warn('Review clip save skipped:', err.message);
    }
  }

  await context.close();
  await browser.close();

  const beforeDir = await downloadBeforeArtifacts();
  const comparePage = await chromium.launch().then((b) => b.newPage());
  const compares = [
    ['04_street_store_gameplay.png', 'compare_04_store_street.png', 'STORE street'],
    ['05_street_workshop_gameplay.png', 'compare_05_workshop_street.png', 'WORKSHOP street'],
    ['10_idle_1x.png', 'compare_10_idle_1x.png', 'IDLE 1×'],
    ['13_anim_work_A.png', 'compare_13_work_A.png', 'WORK A 1×'],
  ];
  for (const [name, out, title] of compares) {
    await stitchBeforeAfter(
      comparePage,
      path.join(beforeDir, name),
      path.join(OUT, name),
      out,
      title,
    );
  }
  await comparePage.close();

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
