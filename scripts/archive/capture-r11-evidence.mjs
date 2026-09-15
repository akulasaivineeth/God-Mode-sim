/**
 * R11 evidence capture — portrait framing, strict meta, GitHub-release-ready output.
 *
 * Usage: node scripts/capture-r11-evidence.mjs
 */
import { chromium } from '@playwright/test';
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const OUT = '/opt/cursor/artifacts/r11_evidence';
const R10_OUT = '/opt/cursor/artifacts/r10_evidence';
const BASE = 'http://127.0.0.1:4173';
const RELEASE_TAG = 'review-evidence-m02-013-builder-r11';

const DUAL_FRAME_GAP_MS = 400;
const CROSSFADE_SETTLE_MS = 380;

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
      typeof window.__GODMODE_EVIDENCE__?.frameCitizenPortrait === 'function',
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
  return { ...storeMeta, activity: activityDom, hudClock, isDaylight: /day/.test(hudClock) };
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
  await page.evaluate((o) => {
    const api = window.__GODMODE_EVIDENCE__;
    api.frameCitizenPortrait(o);
    const cam = api.getCameraState();
    if (cam) api.setCamera(cam.position, cam.target);
  }, opts);
  await page.waitForFunction(
    () => {
      const cam = window.__GODMODE_EVIDENCE__?.getCameraState();
      return cam != null && cam.position[1] < 2.6 && cam.position[1] > 1.4;
    },
    null,
    { timeout: 8000 },
  );
  await page.waitForTimeout(350);
}

function metaRecord(meta) {
  return {
    activity: meta.activity,
    pose: meta.pose,
    clip: meta.clip,
    speed: meta.speed,
    simMinute: meta.simMinute,
    citizenPosition: meta.citizenPosition,
    animationsSuppressed: meta.animationsSuppressed,
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

async function shot(page, name, meta = null) {
  await waitRenderFrames(page);
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false, timeout: 60_000 });
  const h = hashFile(file);
  const log = meta
    ? ` activity="${meta.activity}" pose=${meta.pose} clip=${meta.clip} speed=${meta.speed} simMinute=${meta.simMinute} pos=${JSON.stringify(meta.citizenPosition)}`
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
    timeoutMs = 180_000,
  } = config;
  await applyPreset(page, preset, advanceSpeed, { settleMs: advanceSpeed >= 100 ? 400 : 2200 });

  const activitySource = activityPattern.source;
  const activityFlags = activityPattern.flags;
  const start = Date.now();
  let switchedTo1x = false;

  while (Date.now() - start < timeoutMs) {
    if (!switchedTo1x) {
      const hit = await page.evaluate(
        ({
          activitySource,
          activityFlags,
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
          const activityOk = re.test(meta.activity ?? '');
          const poseOk = !requirePoseBeforeSwitch || meta.pose === expectedPose;
          if (activityOk && poseOk && (!requireDaylight || isDaylight)) {
            api.setSpeed(1);
            return true;
          }
          return false;
        },
        {
          activitySource,
          activityFlags,
          expectedPose,
          requirePoseBeforeSwitch,
          requireDaylight,
        },
      );
      if (hit) {
        switchedTo1x = true;
        await page.waitForTimeout(CROSSFADE_SETTLE_MS);
      }
    }

    if (switchedTo1x) {
      const meta = await getMeta(page);
      const settled =
        meta.speed === 1 &&
        meta.pose === expectedPose &&
        activityPattern.test(meta.activity ?? '') &&
        expectedClip.test(meta.clip ?? '') &&
        meta.animationsSuppressed === false &&
        (!requireDaylight || meta.isDaylight);
      if (settled) {
        const finalMeta = await getMeta(page);
        assertMeta(finalMeta, 'acquireAndSettleAt1x', {
          pose: expectedPose,
          activity: activityPattern,
          clip: expectedClip,
          speed: 1,
          animationsSuppressed: false,
          daylight: requireDaylight,
        });
        return finalMeta;
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
  const { portraitOpts, dualGapMs = DUAL_FRAME_GAP_MS, requireDaylight = true } = config;
  const meta = await acquireAndSettleAt1x(page, config);
  console.log(`${baseName} settled at 1×:`, meta.activity, meta.pose, meta.clip);

  await frameCitizenPortrait(page, portraitOpts);
  await page.waitForTimeout(200);
  const metaA = await getMeta(page);
  assertMeta(metaA, `${baseName}_A`, {
    pose: config.expectedPose,
    activity: config.activityPattern,
    clip: config.expectedClip,
    speed: 1,
    animationsSuppressed: false,
    daylight: requireDaylight,
  });
  const shotA = await saveUnique(`${baseName}_A`, metaRecord(metaA));

  let capturedB = false;
  for (let attempt = 0; attempt < 15; attempt += 1) {
    await page.waitForTimeout(Math.min(dualGapMs, 180 + attempt * 20));
    await frameCitizenPortrait(page, portraitOpts);
    await page.waitForTimeout(60);
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
      const shotB = await saveUnique(`${baseName}_B`, metaRecord(metaB));
      if (shotB.hash === shotA.hash) {
        throw new Error(`${baseName}_B: duplicate hash vs A — no visible motion delta`);
      }
      capturedB = true;
      break;
    } catch (err) {
      if (attempt === 9) throw err;
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

async function publishRelease() {
  const repo = 'akulasaivineeth/God-Mode-sim';
  const files = [
    '00_r10_before_river.png',
    '01_overview_daylight_diagnostics.png',
    '02_angled_daylight.png',
    '07_river_bridge_forest.png',
    '11_anim_walk_A.png',
    '11_anim_walk_B.png',
    '12_anim_sit_A.png',
    '12_anim_sit_B.png',
    '13_anim_work_A.png',
    '13_anim_work_B.png',
    '15_canonical_north_star.png',
    'capture_metadata.json',
  ].filter((f) => existsSync(path.join(OUT, f)));

  try {
    execSync(`gh release view ${RELEASE_TAG} --repo ${repo}`, { stdio: 'ignore' });
    execSync(`gh release delete ${RELEASE_TAG} --repo ${repo} --yes`, { stdio: 'inherit' });
  } catch {
    /* first publish */
  }

  const fileArgs = files.map((f) => `${path.join(OUT, f)}#${f}`).join(' ');
  execSync(
    `gh release create ${RELEASE_TAG} --repo ${repo} --title "M02 R11 builder evidence" --notes "R11 builder evidence for M02-012 FIX_REQUIRED" ${fileArgs}`,
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

  const saveUnique = async (name, meta = null) => {
    const result = await shot(page, name, meta);
    if (hashes.has(result.hash)) throw new Error(`Duplicate screenshot hash for ${name}`);
    hashes.add(result.hash);
    if (meta) metadata[name] = meta;
    return result;
  };

  const r10River = path.join(R10_OUT, '07_river_bridge_forest.png');
  const r10BeforeOut = path.join(OUT, '00_r10_before_river.png');
  if (existsSync(r10River)) {
    await copyFile(r10River, r10BeforeOut);
    console.log('copied R10-before river');
  } else {
    try {
      execSync(
        `curl -fsSL -o ${r10BeforeOut} https://github.com/akulasaivineeth/God-Mode-sim/releases/download/review-evidence-m02-012-grok/r10_river_preset.png`,
        { stdio: 'inherit' },
      );
      console.log('downloaded R10-before river from GitHub release');
    } catch {
      console.warn('R10-before river unavailable');
    }
  }

  await waitScene(page);

  await applyPreset(page, 'overview', 0);
  const overviewClock = await page.getByTestId('hud-clock').textContent();
  if (!/day/.test(overviewClock ?? '')) throw new Error('Overview must be daylight');
  await saveUnique('01_overview_daylight_diagnostics');

  await applyPreset(page, 'angled', 0);
  await saveUnique('02_angled_daylight');

  await applyPreset(page, 'river', 0);
  await saveUnique('07_river_bridge_forest');

  await applyPreset(page, 'store-street', 1000);
  await setSpeed(page, 0);
  await page.waitForTimeout(500);
  await saveUnique('05_street_store_citizen');

  await applyPreset(page, 'workshop-street', 1000);
  await setSpeed(page, 0);
  await page.waitForTimeout(500);
  await saveUnique('06_workshop_citizen_working');

  // Animation block — fresh sim
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
    portraitOpts: { distance: 1.35, sideOffset: 0.45, eyeHeight: 1.95, chestHeight: 1.25, worldFixed: true },
    dualGapMs: 280,
  }, 8);

  await captureWithRetry(page, saveUnique, '12_anim_sit', {
    preset: 'store-street',
    advanceSpeed: 100,
    activityPattern: /Eating at the Store/i,
    expectedPose: 'sit',
    expectedClip: /^sit$/i,
    portraitOpts: { distance: 1.4, sideOffset: 0.4, eyeHeight: 1.9, chestHeight: 1.2, worldFixed: true },
    dualGapMs: 400,
  });

  await captureWithRetry(page, saveUnique, '13_anim_work', {
    preset: 'workshop-street',
    advanceSpeed: 100,
    activityPattern: /^Working$/i,
    expectedPose: 'work',
    expectedClip: /interact-right|pick-up/i,
    portraitOpts: { distance: 1.4, sideOffset: 0.4, eyeHeight: 1.9, chestHeight: 1.2, worldFixed: true },
    dualGapMs: 420,
  });

  await browser.close();

  const northStar = path.join(
    process.cwd(),
    'Docs/art-direction/references/god-mode-town-north-star.png',
  );
  await copyFile(northStar, path.join(OUT, '15_canonical_north_star.png'));
  await writeFile(path.join(OUT, 'capture_metadata.json'), JSON.stringify(metadata, null, 2));
  console.log('R11 evidence complete', OUT, 'unique shots', hashes.size);

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
