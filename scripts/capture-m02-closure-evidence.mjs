/**
 * M02 closure evidence (R13) — asset-first vertical slice: obvious human + prefab route.
 *
 * Usage: npm run build && npm run preview &  node scripts/capture-m02-closure-evidence.mjs
 */
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const OUT = '/opt/cursor/artifacts/m02_closure_evidence';
const BASE = 'http://127.0.0.1:4173';
const RELEASE_TAG = 'review-evidence-m02-014-builder-r13';
const CROSSFADE_SETTLE_MS = 450;

function hashFile(file) {
  return createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 12);
}

async function waitScene(page) {
  await page.goto(BASE);
  await page.getByTestId('r3f-canvas').waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForFunction(
    () =>
      typeof window.__GODMODE_EVIDENCE__?.getCaptureMeta === 'function' &&
      typeof window.__GODMODE_EVIDENCE__?.frameCitizenSimPortrait === 'function',
    null,
    { timeout: 30_000 },
  );
  await page.waitForFunction(
    () => window.__GODMODE_EVIDENCE__?.getCaptureMeta()?.citizenPosition != null,
    null,
    { timeout: 30_000 },
  );
  await page.waitForTimeout(2000);
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
  const hudClock = (await page.getByTestId('hud-clock').textContent().catch(() => null)) ?? storeMeta?.simMinute ?? '';
  const isDaylight = storeMeta?.isDaylight ?? /day/.test(String(hudClock));
  return { ...storeMeta, hudClock, isDaylight };
}

function metaRecord(meta) {
  return {
    citizenId: meta.citizenId,
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
  if (expectations.animationsSuppressed !== undefined && meta.animationsSuppressed !== expectations.animationsSuppressed) {
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
    await setSpeed(page, 500);
    await page.waitForTimeout(120);
  }
  throw new Error('Timed out waiting for daylight');
}

async function frameCitizenSim(page, opts = {}) {
  await page.evaluate((o) => {
    window.__GODMODE_EVIDENCE__?.frameCitizenSimPortrait(o);
  }, opts);
  await waitRenderFrames(page, 20);
  await page.waitForTimeout(700);
}

async function shot(page, name, meta = null) {
  await waitRenderFrames(page);
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false, timeout: 60_000 });
  const h = hashFile(file);
  const log = meta
    ? ` id=${meta.citizenId} activity="${meta.activity}" pose=${meta.pose} clip=${meta.clip} speed=${meta.speed} min=${meta.simMinute}`
    : '';
  console.log('saved', file, h, log);
  return { file, hash: h };
}

/** Advance sim until predicate; pause immediately on match (prevents overshoot). */
async function pauseWhen(page, predicate, { advanceSpeed = 1000, timeoutMs = 240_000 } = {}) {
  await setSpeed(page, advanceSpeed);
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const meta = await getMeta(page);
    if (predicate(meta)) {
      await setSpeed(page, 0);
      await page.waitForTimeout(CROSSFADE_SETTLE_MS);
      return meta;
    }
    await page.waitForTimeout(12);
  }
  const last = await getMeta(page);
  throw new Error(`Timed out pauseWhen: last activity="${last.activity}" pose="${last.pose}" min=${last.simMinute}`);
}

async function acquireAt1x(page, config) {
  const {
    preset,
    advanceSpeed = 1000,
    activityPattern,
    expectedPose,
    expectedClip,
    requireDaylight = true,
    timeoutMs = 240_000,
  } = config;

  await applyPreset(page, preset, advanceSpeed, { settleMs: 400 });
  await setSpeed(page, advanceSpeed);

  const start = Date.now();
  let switchedTo1x = false;

  while (Date.now() - start < timeoutMs) {
    const meta = await getMeta(page);
    const daylightOk = !requireDaylight || meta.isDaylight;
    const activityOk = activityPattern.test(meta.activity ?? '');
    const poseOk = meta.pose === expectedPose;

    if (!switchedTo1x && activityOk && poseOk && daylightOk) {
      await setSpeed(page, 1);
      switchedTo1x = true;
      await page.waitForTimeout(CROSSFADE_SETTLE_MS);
    }

    if (switchedTo1x) {
      const settled =
        meta.speed === 1 &&
        meta.pose === expectedPose &&
        activityPattern.test(meta.activity ?? '') &&
        expectedClip.test(meta.clip ?? '') &&
        meta.animationsSuppressed === false &&
        daylightOk;
      if (settled) {
        assertMeta(meta, 'acquireAt1x', {
          pose: expectedPose,
          activity: activityPattern,
          clip: expectedClip,
          speed: 1,
          animationsSuppressed: false,
          daylight: requireDaylight,
        });
        return meta;
      }
    }
    await page.waitForTimeout(10);
  }

  const last = await getMeta(page);
  throw new Error(
    `Timed out at 1× pose=${expectedPose}: activity="${last.activity}" pose="${last.pose}" clip="${last.clip}"`,
  );
}

async function publishRelease() {
  const repo = 'akulasaivineeth/God-Mode-sim';
  const files = [
    'A_street_idle.png',
    'B_street_walk_1x.png',
    'C_store_sit_eat_1x.png',
    'D_workshop_work_1x.png',
    'E_home_citizen_facility.png',
    'F_store_citizen_facility.png',
    'G_workshop_citizen_facility.png',
    'H_overview_route.png',
    'I_inspector.png',
    'J_review_clip.webm',
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
    `gh release create ${RELEASE_TAG} --repo ${repo} --title "M02 R13 closure evidence" --notes "M02 asset-first closure — obvious citizen + prefab route" ${fileArgs}`,
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

  const saveShot = async (name, meta = null) => {
    const result = await shot(page, name, meta);
    if (meta) metadata[name] = meta;
    return result;
  };

  await waitScene(page);
  await waitForDaylight(page);
  await setUiChrome(page, { inspector: false, diagnostics: false });

  // H — overview corridor
  await applyPreset(page, 'overview', 0);
  metadata.H_overview_route = {
    ...(await page.evaluate(() => window.__GODMODE_EVIDENCE__?.getRenderDiagnostics())),
    view: 'overview',
  };
  await saveShot('H_overview_route');

  // A–D animation evidence (fresh sim segment — walk/sit/work first while schedule is predictable)
  await page.goto(BASE);
  await page.getByTestId('r3f-canvas').waitFor({ state: 'visible' });
  await page.waitForTimeout(2500);
  await waitForDaylight(page);

  const walkMeta = await pauseWhen(
    page,
    (m) => m.isDaylight && m.pose === 'walk' && /Walking/i.test(m.activity ?? ''),
    { advanceSpeed: 500, timeoutMs: 180_000 },
  );
  await setSpeed(page, 1);
  await page.waitForTimeout(CROSSFADE_SETTLE_MS);
  await applyPreset(page, 'street', 1, { settleMs: 600 });
  await frameCitizenSim(page, { distance: 2.5, cameraY: 1.3, targetY: 0.9 });
  assertMeta({ ...walkMeta, speed: 1 }, 'B_street_walk_1x', {
    pose: 'walk',
    speed: 1,
    daylight: true,
  });
  await saveShot('B_street_walk_1x', metaRecord({ ...walkMeta, speed: 1 }));

  const sitMeta = await pauseWhen(
    page,
    (m) => m.isDaylight && m.pose === 'sit' && /Eating at the Store/i.test(m.activity ?? ''),
    { advanceSpeed: 100, timeoutMs: 360_000 },
  );
  await setSpeed(page, 1);
  await page.waitForTimeout(CROSSFADE_SETTLE_MS);
  await applyPreset(page, 'store-street', 1, { settleMs: 600 });
  await frameCitizenSim(page, { distance: 2.5, cameraY: 1.3, targetY: 0.9 });
  await saveShot('C_store_sit_eat_1x', metaRecord({ ...sitMeta, speed: 1 }));

  const workMeta = await pauseWhen(
    page,
    (m) => m.isDaylight && m.pose === 'work' && /^Working$/i.test(m.activity ?? ''),
    { advanceSpeed: 100, timeoutMs: 360_000 },
  );
  await setSpeed(page, 1);
  await page.waitForTimeout(CROSSFADE_SETTLE_MS);
  await applyPreset(page, 'workshop-street', 1, { settleMs: 600 });
  await frameCitizenSim(page, { distance: 2.5, cameraY: 1.3, targetY: 0.9 });
  await saveShot('D_workshop_work_1x', metaRecord({ ...workMeta, speed: 1 }));

  // A — idle (fresh segment)
  await page.goto(BASE);
  await page.getByTestId('r3f-canvas').waitFor({ state: 'visible' });
  await page.waitForTimeout(2500);
  await waitForDaylight(page);

  const idleMeta = await pauseWhen(
    page,
    (m) => m.isDaylight && m.pose === 'idle',
    { advanceSpeed: 20, timeoutMs: 360_000 },
  );
  await applyPreset(page, 'street', 0, { settleMs: 800 });
  await frameCitizenSim(page, { distance: 2.6, cameraY: 1.35, targetY: 0.95 });
  assertMeta({ ...idleMeta, speed: 0 }, 'A_street_idle', { pose: 'idle', speed: 0, daylight: true });
  await saveShot('A_street_idle', metaRecord({ ...idleMeta, speed: 0 }));

  // E–G facility + citizen (fresh segment)
  await page.goto(BASE);
  await page.getByTestId('r3f-canvas').waitFor({ state: 'visible' });
  await page.waitForTimeout(2500);
  await waitForDaylight(page);

  const homeMeta = await pauseWhen(
    page,
    (m) => m.isDaylight && /Sleeping|Drinking at Home|Showering/i.test(m.activity ?? ''),
    { advanceSpeed: 20 },
  );
  await applyPreset(page, 'home-street', 0);
  await frameCitizenSim(page, { distance: 4.8, cameraY: 1.8, targetY: 1.0 });
  await saveShot('E_home_citizen_facility', metaRecord(homeMeta));

  const storeMeta = await pauseWhen(
    page,
    (m) => m.isDaylight && /Eating at the Store/i.test(m.activity ?? '') && m.pose === 'sit',
    { advanceSpeed: 20 },
  );
  await applyPreset(page, 'store-street', 0);
  await frameCitizenSim(page, { distance: 4.5, cameraY: 1.75, targetY: 0.95 });
  await saveShot('F_store_citizen_facility', metaRecord(storeMeta));

  const workshopMeta = await pauseWhen(
    page,
    (m) => m.isDaylight && /^Working$/i.test(m.activity ?? '') && m.pose === 'work',
    { advanceSpeed: 20 },
  );
  await applyPreset(page, 'workshop-street', 0);
  await frameCitizenSim(page, { distance: 4.5, cameraY: 1.75, targetY: 0.95 });
  await saveShot('G_workshop_citizen_facility', metaRecord(workshopMeta));

  // I — inspector
  await setUiChrome(page, { inspector: true, diagnostics: true });
  await applyPreset(page, 'store-street', 0);
  await page.getByTestId('citizen-inspector').waitFor({ state: 'visible' });
  const inspectorMeta = metaRecord(await getMeta(page));
  await saveShot('I_inspector', inspectorMeta);

  // J — review clip
  await setUiChrome(page, { inspector: false, diagnostics: true });
  await applyPreset(page, 'overview', 20);
  await page.waitForTimeout(14_000);

  await context.close();
  const video = page.video();
  if (video) await video.saveAs(path.join(OUT, 'J_review_clip.webm'));
  await browser.close();

  await writeFile(path.join(OUT, 'capture_metadata.json'), JSON.stringify(metadata, null, 2));
  console.log('M02 closure evidence complete', OUT);

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
