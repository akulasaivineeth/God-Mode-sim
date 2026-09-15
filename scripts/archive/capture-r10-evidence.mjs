/**
 * R10 evidence capture — strict pose+activity+clip assertions, 1× mixer proof (presentation only).
 * Never reload/navigate after acquiring a target activity state.
 *
 * Usage: node scripts/capture-r10-evidence.mjs
 */
import { chromium } from '@playwright/test';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const OUT = '/opt/cursor/artifacts/r10_evidence';
const R9_OUT = '/opt/cursor/artifacts/r9_evidence';
const BASE = 'http://127.0.0.1:4173';

const DUAL_FRAME_GAP_MS = 300;
const CROSSFADE_SETTLE_MS = 450;

function hashFile(file) {
  return createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 12);
}

async function waitScene(page) {
  await page.goto(BASE);
  await page.getByTestId('r3f-canvas').waitFor({ state: 'visible', timeout: 30_000 });
  await waitForEvidenceApi(page);
  await page.waitForTimeout(3500);
}

async function waitForEvidenceApi(page) {
  await page.waitForFunction(() => typeof window.__GODMODE_EVIDENCE__?.getCaptureMeta === 'function', null, {
    timeout: 30_000,
  });
}

async function applyPreset(page, cam, speed = 0, { settleMs = 2200 } = {}) {
  await page.evaluate((view) => {
    window.__GODMODE_EVIDENCE__?.applyPreset(view);
  }, cam);
  await page.waitForTimeout(settleMs);
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
  return { ...storeMeta, activity: activityDom };
}

/** R10: front/3-quarter close framing — Alex ~180px tall, 3.0–4.0 m from subject. */
async function frameCitizenClose(page, opts = {}) {
  const { distance = 3.4, height = 2.8, lookHeight = 1.45, sideAngle = 0.42 } = opts;
  await page.evaluate(
    ({ distance, height, lookHeight, sideAngle }) => {
      const api = window.__GODMODE_EVIDENCE__;
      const meta = api.getCaptureMeta();
      if (!meta.citizenPosition) throw new Error('No citizen position for in-place framing');
      const { x, z, facingRadians } = meta.citizenPosition;
      const camX = x - Math.sin(facingRadians + sideAngle) * distance;
      const camZ = z - Math.cos(facingRadians + sideAngle) * distance;
      api.setCamera([camX, height, camZ], [x, lookHeight, z]);
    },
    { distance, height, lookHeight, sideAngle },
  );
  await page.waitForTimeout(200);
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

/** R10: pose AND activity AND clip must all match — any mismatch throws. */
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

async function shot(page, name, meta = null) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false, timeout: 60_000 });
  const h = hashFile(file);
  const log = meta
    ? ` activity="${meta.activity}" pose=${meta.pose} clip=${meta.clip} speed=${meta.speed} simMinute=${meta.simMinute} pos=${JSON.stringify(meta.citizenPosition)}`
    : '';
  console.log('saved', file, h, log);
  return { file, hash: h };
}

async function waitActivity(page, pattern, timeoutMs = 180_000) {
  const el = page.getByTestId('inspector-activity');
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const text = (await el.textContent()) ?? '';
    if (pattern.test(text)) return text;
    await page.waitForTimeout(200);
  }
  throw new Error(`Timed out for activity ${pattern}`);
}

/**
 * Phase 1 — poll at accelerated speed; switch to 1× synchronously in-page on first
 * activity match (minimises overshoot at 1000×). Phase 2 — at 1× wait for
 * pose+activity+clip + crossfade settle.
 */
async function acquireAndSettleAt1x(page, config) {
  const { preset, advanceSpeed, activityPattern, expectedPose, expectedClip, timeoutMs = 180_000 } =
    config;
  // Minimal camera settle when advancing fast — long waits overshoot travel windows at 1000×.
  await applyPreset(page, preset, advanceSpeed, { settleMs: advanceSpeed >= 100 ? 400 : 2200 });

  const activitySource = activityPattern.source;
  const activityFlags = activityPattern.flags;

  const start = Date.now();
  let switchedTo1x = false;
  while (Date.now() - start < timeoutMs) {
    if (!switchedTo1x) {
      const hit = await page.evaluate(
        ({ activitySource, activityFlags }) => {
          const api = window.__GODMODE_EVIDENCE__;
          const meta = api.getCaptureMeta();
          const re = new RegExp(activitySource, activityFlags);
          if (re.test(meta.activity ?? '')) {
            api.setSpeed(1);
            return true;
          }
          return false;
        },
        { activitySource, activityFlags },
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
        meta.animationsSuppressed === false;
      if (settled) {
        const finalMeta = await getMeta(page);
        assertMeta(finalMeta, 'acquireAndSettleAt1x', {
          pose: expectedPose,
          activity: activityPattern,
          clip: expectedClip,
          speed: 1,
          animationsSuppressed: false,
        });
        return finalMeta;
      }
    }
    await page.waitForTimeout(8);
  }
  const last = await getMeta(page);
  throw new Error(
    `Timed out settling at 1× for pose=${expectedPose}: last pose="${last.pose}" activity="${last.activity}" clip="${last.clip}" speed=${last.speed}`,
  );
}

async function captureAnimationProof(page, saveUnique, baseName, config) {
  const { dualFrames = false, frameOpts } = config;
  const meta = await acquireAndSettleAt1x(page, config);
  console.log(`${baseName} settled at 1×:`, meta.activity, meta.pose, meta.clip);

  await frameCitizenClose(page, frameOpts);
  await page.waitForTimeout(150);

  const metaA = await getMeta(page);
  assertMeta(metaA, `${baseName}_A`, {
    pose: config.expectedPose,
    activity: config.activityPattern,
    clip: config.expectedClip,
    speed: 1,
    animationsSuppressed: false,
  });
  await saveUnique(`${baseName}_A`, metaRecord(metaA));

  if (!dualFrames) {
    return;
  }

  let capturedB = false;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    await page.waitForTimeout(DUAL_FRAME_GAP_MS);
    const metaB = await getMeta(page);
    try {
      assertMeta(metaB, `${baseName}_B`, {
        pose: config.expectedPose,
        activity: config.activityPattern,
        clip: config.expectedClip,
        speed: 1,
        animationsSuppressed: false,
      });
      await saveUnique(`${baseName}_B`, metaRecord(metaB));
      capturedB = true;
      break;
    } catch (err) {
      if (attempt === 7) throw err;
    }
  }
  if (!capturedB) {
    throw new Error(`${baseName}_B: failed to capture second frame while action remained valid`);
  }
}

async function captureAnimationWithRetry(page, saveUnique, baseName, config, maxAttempts = 6) {
  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await captureAnimationProof(page, saveUnique, baseName, config);
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

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.setDefaultTimeout(60_000);
  const hashes = new Set();
  const metadata = {};

  const saveUnique = async (name, meta = null) => {
    const { file, hash } = await shot(page, name, meta);
    if (hashes.has(hash)) throw new Error(`Duplicate screenshot hash for ${name}`);
    hashes.add(hash);
    if (meta) metadata[name] = meta;
    return file;
  };

  const r9River = path.join(R9_OUT, '07_river_bridge_forest.png');
  if (existsSync(r9River)) {
    await copyFile(r9River, path.join(OUT, '00_r9_before_river.png'));
    console.log('copied R9-before river');
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

  await applyPreset(page, 'square', 0);
  await saveUnique('08_town_square_park');

  await applyPreset(page, 'home-street', 0);
  const homeAct = await waitActivity(page, /Sleep|Home|Walking/i);
  console.log('home', homeAct);
  await saveUnique('04_street_home_citizen');

  await applyPreset(page, 'store-street', 1000);
  const storeAct = await waitActivity(page, /Store|Eating/i);
  console.log('store', storeAct);
  if (!/Store|Eating/i.test(storeAct)) throw new Error('Store shot requires store context activity');
  await setSpeed(page, 0);
  await page.waitForTimeout(500);
  await saveUnique('05_street_store_citizen');

  await applyPreset(page, 'workshop-street', 1000);
  const workshopAct = await waitActivity(page, /Working|Workshop/i);
  console.log('workshop', workshopAct);
  await setSpeed(page, 0);
  await page.waitForTimeout(500);
  await saveUnique('06_workshop_citizen_working');

  await applyPreset(page, 'street', 0);
  await saveUnique('10_selected_citizen_inspector');

  await applyPreset(page, 'street', 1000);
  let nightClock = '';
  for (let i = 0; i < 1200; i++) {
    nightClock = (await page.getByTestId('hud-clock').textContent()) ?? '';
    if (/night/.test(nightClock)) {
      await setSpeed(page, 0);
      break;
    }
    await page.waitForTimeout(40);
  }
  if (!/night/.test(nightClock)) throw new Error(`Expected night, got ${nightClock}`);
  await saveUnique('09_night_practical_lighting');

  // Animation block — fresh sim (reload allowed before acquire only)
  await page.goto(BASE);
  await page.getByTestId('r3f-canvas').waitFor({ state: 'visible', timeout: 30_000 });
  await waitForEvidenceApi(page);
  await page.waitForTimeout(3500);

  await captureAnimationWithRetry(page, saveUnique, '11_anim_walk', {
    preset: 'street',
    advanceSpeed: 1000,
    activityPattern: /Walking/i,
    expectedPose: 'walk',
    expectedClip: /^walk$/i,
    dualFrames: true,
    frameOpts: { distance: 3.2, height: 2.7, lookHeight: 1.4, sideAngle: 0.38 },
  });

  await captureAnimationWithRetry(page, saveUnique, '12_anim_sit', {
    preset: 'street',
    advanceSpeed: 20,
    activityPattern: /Sleeping|Eating/i,
    expectedPose: 'sit',
    expectedClip: /^sit$/i,
    dualFrames: false,
    frameOpts: { distance: 3.0, height: 2.5, lookHeight: 1.35, sideAngle: 0.4 },
  });

  await captureAnimationWithRetry(page, saveUnique, '13_anim_work', {
    preset: 'workshop-street',
    advanceSpeed: 100,
    activityPattern: /^Working$/i,
    expectedPose: 'work',
    expectedClip: /interact-right|pick-up/i,
    dualFrames: true,
    frameOpts: { distance: 3.3, height: 2.6, lookHeight: 1.45, sideAngle: 0.32 },
  });

  await browser.close();

  const northStar = path.join(
    process.cwd(),
    'Docs/art-direction/references/god-mode-town-north-star.png',
  );
  await copyFile(northStar, path.join(OUT, '15_canonical_north_star.png'));

  await writeFile(path.join(OUT, 'capture_metadata.json'), JSON.stringify(metadata, null, 2));
  console.log('R10 evidence complete', OUT, 'unique shots', hashes.size);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
