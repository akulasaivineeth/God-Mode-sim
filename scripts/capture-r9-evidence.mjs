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
    await page.getByTestId(`speed-${speed}`).dispatchEvent('click');
    await page.waitForTimeout(speed === 0 ? 400 : 800);
  }
}

async function setSpeed(page, speed) {
  await page.getByTestId(`speed-${speed}`).dispatchEvent('click');
  await page.waitForTimeout(speed <= 1 ? 500 : 800);
}

async function getMeta(page) {
  return page.evaluate(() => window.__GODMODE_EVIDENCE__?.getCaptureMeta());
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
  await page.waitForTimeout(450);
}

function assertMeta(meta, label, expectations) {
  if (expectations.activity && !expectations.activity.test(meta.activity ?? '')) {
    throw new Error(`${label}: activity expected ${expectations.activity}, got "${meta.activity}"`);
  }
  if (expectations.pose && meta.pose !== expectations.pose) {
    throw new Error(`${label}: pose expected ${expectations.pose}, got "${meta.pose}"`);
  }
  if (expectations.clip && !expectations.clip.test(meta.clip ?? '')) {
    throw new Error(`${label}: clip expected ${expectations.clip}, got "${meta.clip}"`);
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
  await page.screenshot({ path: file, fullPage: false });
  const h = hashFile(file);
  const log = meta
    ? ` activity="${meta.activity}" pose=${meta.pose} clip=${meta.clip} speed=${meta.speed} simMinute=${meta.simMinute}`
    : '';
  console.log('saved', file, h, log);
  return { file, hash: h };
}

async function waitActivity(page, pattern, timeoutMs = 120_000) {
  const el = page.getByTestId('inspector-activity');
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const text = (await el.textContent()) ?? '';
    if (pattern.test(text)) return text;
    await page.waitForTimeout(200);
  }
  throw new Error(`Timed out for activity ${pattern}`);
}

async function getSimMinute(page) {
  const meta = await getMeta(page);
  return meta?.simMinute ?? 0;
}

async function captureAnimation(page, saveUnique, name, config) {
  const { preset, advanceSpeed, activityPattern, expectedPose, expectedClip, frameOpts } = config;
  await applyPreset(page, preset, advanceSpeed);
  const acquired = await waitActivity(page, activityPattern);
  console.log(`${name} acquired:`, acquired);
  await setSpeed(page, 1);
  await page.waitForTimeout(650);
  await frameCitizenClose(page, frameOpts);
  const meta = await getMeta(page);
  assertMeta(meta, name, {
    activity: activityPattern,
    pose: expectedPose,
    clip: expectedClip,
    speed: 1,
    animationsSuppressed: false,
  });
  return saveUnique(name, meta);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
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

  // Night practical lighting
  await applyPreset(page, 'street', 100);
  for (let i = 0; i < 400; i++) {
    const sim = await getSimMinute(page);
    if (sim >= 960 && sim < 1200) {
      await setSpeed(page, 0);
      break;
    }
    await page.waitForTimeout(80);
  }
  const nightClock = await page.getByTestId('hud-clock').textContent();
  if (!/night/.test(nightClock ?? '')) throw new Error(`Expected night, got ${nightClock}`);
  await saveUnique('09_night_practical_lighting');

  // Inspector
  await applyPreset(page, 'street', 0);
  await saveUnique('10_selected_citizen_inspector');

  // Idle at 1× (fresh session on same page — no reload)
  await applyPreset(page, 'street', 0);
  await setSpeed(page, 0);
  const idleMeta = await getMeta(page);
  await saveUnique('14_anim_idle_standing', idleMeta);

  // WALK — in-place reframe, no navigation after Walking acquired
  await captureAnimation(page, saveUnique, '11_anim_walk_outdoor', {
    preset: 'street',
    advanceSpeed: 20,
    activityPattern: /Walking/i,
    expectedPose: 'walk',
    expectedClip: /^walk$/i,
    frameOpts: { distance: 5.2, height: 3.4, sideAngle: 0.5 },
  });

  // SIT — Sleeping or Eating, close full-body
  await captureAnimation(page, saveUnique, '12_anim_sit_action', {
    preset: 'street',
    advanceSpeed: 20,
    activityPattern: /Sleeping|Eating/i,
    expectedPose: 'sit',
    expectedClip: /^sit$/i,
    frameOpts: { distance: 4.2, height: 3.0, lookHeight: 1.6, sideAngle: 0.45 },
  });

  // WORK — stay in workshop context, never reload after Working acquired
  await captureAnimation(page, saveUnique, '13_anim_work_interact', {
    preset: 'workshop-street',
    advanceSpeed: 1000,
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
