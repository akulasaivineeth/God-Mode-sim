/**
 * R8 evidence capture with subject assertions (production preview).
 * Usage: node scripts/capture-r8-evidence.mjs
 */
import { chromium } from '@playwright/test';
import { readFileSync, statSync } from 'node:fs';
import { copyFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const OUT = '/opt/cursor/artifacts/r8_evidence';
const BASE = 'http://127.0.0.1:4173';

function hashFile(file) {
  return createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 12);
}

async function waitScene(page) {
  await page.goto(BASE);
  await page.getByTestId('r3f-canvas').waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(3500);
}

async function gotoCam(page, cam, speed = 0) {
  await page.goto(`${BASE}/?cam=${cam}`);
  await page.getByTestId('r3f-canvas').waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(2500);
  if (speed !== null) {
    await page.getByTestId(`speed-${speed}`).dispatchEvent('click');
    await page.waitForTimeout(speed === 0 ? 400 : 800);
  }
}

async function shot(page, name) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log('saved', file, hashFile(file));
  return file;
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
  return page.evaluate(() => {
    const el = [...document.querySelectorAll('div')].find((n) =>
      n.textContent?.startsWith('Sim minute:'),
    );
    return Number(el?.textContent?.replace('Sim minute: ', '') ?? 0);
  });
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const hashes = new Set();

  const saveUnique = async (name) => {
    const file = await shot(page, name);
    const h = hashFile(file);
    if (hashes.has(h)) throw new Error(`Duplicate screenshot hash for ${name}`);
    hashes.add(h);
  };

  // Daylight geography + diagnostics
  await gotoCam(page, 'overview', 0);
  const overviewClock = await page.getByTestId('hud-clock').textContent();
  if (!/day/.test(overviewClock ?? '')) throw new Error('Overview must be daylight');
  await saveUnique('01_overview_daylight_diagnostics');

  await gotoCam(page, 'angled', 0);
  await saveUnique('02_angled_daylight');

  await gotoCam(page, 'river', 0);
  await saveUnique('07_river_bridge_forest');

  await gotoCam(page, 'square', 0);
  await saveUnique('08_town_square_park');

  // Facility street identity
  await gotoCam(page, 'home-street', 0);
  const homeAct = await waitActivity(page, /Sleep|Home|Walking/i);
  console.log('home', homeAct);
  await saveUnique('04_street_home_citizen');

  await gotoCam(page, 'store-street', 1000);
  const storeAct = await waitActivity(page, /Store|Eating/i);
  console.log('store', storeAct);
  await page.getByTestId('speed-0').dispatchEvent('click');
  await page.waitForTimeout(500);
  await saveUnique('05_street_store_citizen');

  await gotoCam(page, 'workshop-street', 1000);
  const workAct = await waitActivity(page, /Working|Workshop/i);
  console.log('work', workAct);
  await page.getByTestId('speed-0').dispatchEvent('click');
  await page.waitForTimeout(500);
  await saveUnique('06_workshop_citizen_working');

  // Night practical lighting
  await gotoCam(page, 'street', 100);
  for (let i = 0; i < 400; i++) {
    const sim = await getSimMinute(page);
    if (sim >= 960 && sim < 1200) {
      await page.getByTestId('speed-0').dispatchEvent('click');
      break;
    }
    await page.waitForTimeout(80);
  }
  const nightClock = await page.getByTestId('hud-clock').textContent();
  if (!/night/.test(nightClock ?? '')) throw new Error(`Expected night, got ${nightClock}`);
  await saveUnique('09_night_practical_lighting');

  // Inspector (street framing — distinct from angled overview)
  await gotoCam(page, 'street', 0);
  await saveUnique('10_selected_citizen_inspector');

  // Animation at 1× — idle (fresh), walk, sit, work
  await page.goto(`${BASE}/?cam=street`);
  await page.getByTestId('r3f-canvas').waitFor({ timeout: 30_000 });
  await page.waitForTimeout(1500);
  await page.getByTestId('speed-0').dispatchEvent('click');
  await saveUnique('14_anim_idle_standing');

  await page.getByTestId('speed-20').dispatchEvent('click');
  const walkAct = await waitActivity(page, /Walking/i, 120_000);
  if (!/Walking/i.test(walkAct)) throw new Error('Walk shot requires Walking activity');
  await page.getByTestId('speed-1').dispatchEvent('click');
  await page.waitForTimeout(1500);
  await saveUnique('11_anim_walk_outdoor');

  await page.getByTestId('speed-20').dispatchEvent('click');
  await waitActivity(page, /Sleeping|Eating/i, 120_000);
  await page.getByTestId('speed-1').dispatchEvent('click');
  await page.waitForTimeout(1200);
  const sitAct = await page.getByTestId('inspector-activity').textContent();
  console.log('sit/rest', sitAct);
  await saveUnique('12_anim_sit_action');

  await page.getByTestId('speed-1000').dispatchEvent('click');
  await waitActivity(page, /Working/i, 120_000);
  await page.getByTestId('speed-1').dispatchEvent('click');
  await page.goto(`${BASE}/?cam=workshop-street`);
  await page.getByTestId('r3f-canvas').waitFor({ timeout: 30_000 });
  await page.waitForTimeout(4500);
  const canvasBox = await page.getByTestId('r3f-canvas').boundingBox();
  if (!canvasBox || canvasBox.width < 100) throw new Error('Canvas not visible for work interact shot');
  await saveUnique('13_anim_work_interact');

  await browser.close();

  const northStar = path.join(
    process.cwd(),
    'Docs/art-direction/references/god-mode-town-north-star.png',
  );
  await copyFile(northStar, path.join(OUT, '15_canonical_north_star.png'));
  console.log('R8 evidence complete', OUT, 'files', statSync(OUT).size);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
