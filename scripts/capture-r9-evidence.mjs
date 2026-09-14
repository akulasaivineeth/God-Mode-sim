/**
 * R9 evidence capture — in-place reframing + semantic assertions (presentation only).
 * Never reload/navigate after acquiring a target activity state.
 *
 * Usage: node scripts/capture-r9-evidence.mjs
 */
import { chromium } from '@playwright/test';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const OUT = '/opt/cursor/artifacts/r9_evidence';
const R8_OUT = '/opt/cursor/artifacts/r8_evidence';
const BASE = 'http://127.0.0.1:4173';

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

async function applyPreset(page, cam, speed = 0) {
  await page.evaluate((view) => {
    window.__GODMODE_EVIDENCE__?.applyPreset(view);
  }, cam);
  await page.waitForTimeout(2200);
  if (speed !== null) {
    await setSpeed(page, speed);
  }
}

async function setSpeed(page, speed) {
  await page.evaluate((s) => window.__GODMODE_EVIDENCE__?.setSpeed(s), speed);
  await page.waitForTimeout(speed <= 1 ? 250 : 800);
}

async function getMeta(page) {
  const storeMeta = await page.evaluate(() => window.__GODMODE_EVIDENCE__?.getCaptureMeta());
  const activityDom = (await page.getByTestId('inspector-activity').textContent()) ?? '';
  return { ...storeMeta, activity: activityDom };
}

async function frameCitizenClose(page, opts = {}) {
  const { distance = 5.5, height = 3.6, lookHeight = 2.0, sideAngle = 0.55 } = opts;
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
  await page.waitForTimeout(150);
}

function assertMeta(meta, label, expectations) {
  const poseOk = !expectations.pose || meta.pose === expectations.pose;
  const activityOk =
    !expectations.activity || expectations.activity.test(meta.activity ?? '');
  const clipOk = !expectations.clip || expectations.clip.test(meta.clip ?? '');
  if (!poseOk && !activityOk) {
    throw new Error(
      `${label}: expected pose ${expectations.pose} or matching activity, got pose="${meta.pose}" activity="${meta.activity}"`,
    );
  }
  if (!clipOk) {
    console.warn(`${label}: clip expected ${expectations.clip}, got "${meta.clip}" (pose/activity verified)`);
  }
  if (expectations.speed !== undefined && meta.speed !== expectations.speed) {
    throw new Error(`${label}: speed expected ${expectations.speed}, got ${meta.speed}`);
  }
  if (
    expectations.animationsSuppressed !== undefined &&
    meta.animationsSuppressed !== expectations.animationsSuppressed
  ) {
    throw new Error(
      `${label}: animationsSuppressed expected ${expectations.animationsSuppressed}, got ${meta.animationsSuppressed}`,
    );
  }
}

async function shot(page, name, meta = null) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false, timeout: 60_000 });
  const h = hashFile(file);
  const log = meta
    ? ` activity="${meta.activity}" pose=${meta.pose} clip=${meta.clip} speed=${meta.speed} simMinute=${meta.simMinute}`
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

/** Pause only once snapshot activity AND presentation pose agree (avoids freezing on stale pose). */
async function waitSnapshotAndPause(page, activityPattern, expectedPose, timeoutMs = 180_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const meta = await page.evaluate(() => window.__GODMODE_EVIDENCE__?.getCaptureMeta());
    if (meta?.pose === expectedPose && activityPattern.test(meta.activity ?? '')) {
      await page.evaluate(() => window.__GODMODE_EVIDENCE__?.setSpeed(0));
      await page.waitForTimeout(500);
      return meta;
    }
    await page.waitForTimeout(16);
  }
  throw new Error(`Timed out for pose ${expectedPose} + activity ${activityPattern}`);
}

async function getSimMinute(page) {
  const meta = await getMeta(page);
  return meta?.simMinute ?? 0;
}

async function captureAnimation(page, saveUnique, name, config) {
  const { preset, advanceSpeed, activityPattern, expectedPose, expectedClip, frameOpts } = config;
  await applyPreset(page, preset, advanceSpeed);
  const acquired = await waitSnapshotAndPause(page, activityPattern, expectedPose);
  console.log(`${name} acquired + paused:`, acquired.activity, acquired.pose, acquired.clip);
  await frameCitizenClose(page, frameOpts);
  await page.waitForTimeout(900);
  const meta = await getMeta(page);
  if (meta.speed !== 0) {
    throw new Error(`${name}: sim not paused (speed=${meta.speed})`);
  }
  assertMeta(meta, name, {
    activity: activityPattern,
    pose: expectedPose,
    clip: expectedClip,
    speed: 0,
    animationsSuppressed: false,
  });
  return saveUnique(name, meta);
}

async function captureAnimationWithRetry(page, saveUnique, name, config, maxAttempts = 5) {
  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await captureAnimation(page, saveUnique, name, config);
    } catch (err) {
      lastErr = err;
      console.warn(`${name} attempt ${attempt}/${maxAttempts} failed:`, err.message);
      await page.evaluate(() => window.__GODMODE_EVIDENCE__?.applyPreset('street'));
      await page.waitForTimeout(800);
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

  // R8-before reference (copy if available)
  const r8Overview = path.join(R8_OUT, '01_overview_daylight_diagnostics.png');
  if (existsSync(r8Overview)) {
    await copyFile(r8Overview, path.join(OUT, '00_r8_before_overview.png'));
    console.log('copied R8-before overview');
  }

  await waitScene(page);

  // Daylight geography + diagnostics
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

  // Facility street identity — preset only, no reload after activity
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

  // Inspector (daylight street — distinct from night framing)
  await applyPreset(page, 'street', 0);
  await saveUnique('10_selected_citizen_inspector');

  // Night practical lighting — advance at 1000× until HUD reports night (any day)
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

  // Animation block — fresh dawn sim for predictable walk/sit/work (reload allowed before acquire)
  await page.goto(BASE);
  await page.getByTestId('r3f-canvas').waitFor({ state: 'visible', timeout: 30_000 });
  await waitForEvidenceApi(page);
  await page.waitForTimeout(3500);
  await applyPreset(page, 'street', 0);
  await frameCitizenClose(page, { distance: 5.5, height: 3.5, sideAngle: 0.65 });
  const idleMeta = await getMeta(page);
  await saveUnique('14_anim_idle_standing', idleMeta);

  // WALK — advance quickly, pause on first Walking frame (no reload after acquire)
  await captureAnimationWithRetry(page, saveUnique, '11_anim_walk_outdoor', {
    preset: 'street',
    advanceSpeed: 1000,
    activityPattern: /Walking/i,
    expectedPose: 'walk',
    expectedClip: /^walk$/i,
    frameOpts: { distance: 5.2, height: 3.4, sideAngle: 0.5 },
  });

  // SIT — perform phase at 20× then close full-body at 1×
  await captureAnimationWithRetry(page, saveUnique, '12_anim_sit_action', {
    preset: 'street',
    advanceSpeed: 20,
    activityPattern: /Sleeping|Eating/i,
    expectedPose: 'sit',
    expectedClip: /^sit$/i,
    frameOpts: { distance: 4.2, height: 3.0, lookHeight: 1.6, sideAngle: 0.45 },
  });

  // WORK — workshop context at 100× until Working, then 1× in-place (no reload)
  await captureAnimationWithRetry(page, saveUnique, '13_anim_work_interact', {
    preset: 'workshop-street',
    advanceSpeed: 100,
    activityPattern: /^Working$/i,
    expectedPose: 'work',
    expectedClip: /interact-right|pick-up/i,
    frameOpts: { distance: 4.8, height: 3.2, lookHeight: 1.8, sideAngle: 0.35 },
  });

  await browser.close();

  const northStar = path.join(
    process.cwd(),
    'Docs/art-direction/references/god-mode-town-north-star.png',
  );
  await copyFile(northStar, path.join(OUT, '15_canonical_north_star.png'));

  await writeFile(path.join(OUT, 'capture_metadata.json'), JSON.stringify(metadata, null, 2));
  console.log('R9 evidence complete', OUT, 'unique shots', hashes.size);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
