/**
 * M02 R6 evidence capture — distinct camera per shot + SHA-256 uniqueness guard.
 * Usage: node scripts/capture-m02-r6-evidence.mjs (preview on :4173)
 */
import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = join(process.cwd(), 'review-evidence-m02-006');
mkdirSync(OUT, { recursive: true });

const SHOTS = [
  { name: 'r6_overview_daylight', camera: 'overview', wait: 2500 },
  { name: 'r6_angled_daylight', camera: 'angled', wait: 2500 },
  { name: 'r6_street_home_alex', camera: 'street_home', wait: 3000 },
  { name: 'r6_street_store_facade', camera: 'street_store', wait: 3000 },
  { name: 'r6_workshop_alex_working', camera: 'workshop_work', wait: 3000 },
  { name: 'r6_river_bank_forest', camera: 'river_forest', wait: 2500 },
  { name: 'r6_town_square_park', camera: 'square_park', wait: 2500 },
  { name: 'r6_facility_identity', camera: 'facility_identity', wait: 2500 },
  { name: 'r6_inspector_selected', camera: 'inspector', wait: 2000 },
];

const hashes = new Map();

function sha256File(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function assertUnique(name, path) {
  const hash = sha256File(path);
  if (hashes.has(hash)) {
    throw new Error(`Duplicate evidence: ${name} matches ${hashes.get(hash)} (sha256 ${hash.slice(0, 12)})`);
  }
  hashes.set(hash, name);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

const consoleErrors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});
page.on('pageerror', (err) => consoleErrors.push(err.message));

await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
await page.waitForSelector('[data-testid="r3f-canvas"]');
await page.waitForTimeout(3000);
await page.getByTestId('speed-0').click();
await page.waitForTimeout(1500);

for (const shot of SHOTS) {
  await page.evaluate((cameraName) => {
    window.__GODMODE_SET_EVIDENCE_CAMERA__?.(cameraName);
  }, shot.camera);
  await page.waitForTimeout(shot.wait);
  const outPath = join(OUT, `${shot.name}.png`);
  await page.screenshot({ path: outPath });
  assertUnique(shot.name, outPath);
  console.log(`Captured ${shot.name} (${shot.camera})`);
}

// Night shot
await page.getByTestId('speed-100').click();
await page.waitForTimeout(22000);
await page.getByTestId('speed-0').click();
await page.evaluate(() => window.__GODMODE_SET_EVIDENCE_CAMERA__?.('night'));
await page.waitForTimeout(2500);
const nightPath = join(OUT, 'r6_night_practical_lights.png');
await page.screenshot({ path: nightPath });
assertUnique('r6_night_practical_lights', nightPath);

// Alex walking for workshop proof — advance sim then recapture workshop
await page.getByTestId('speed-100').click();
for (let i = 0; i < 6; i += 1) {
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.__GODMODE_SET_EVIDENCE_CAMERA__?.('workshop_work'));
  await page.waitForTimeout(800);
  const walkPath = join(OUT, `r6_workshop_probe_${i}.png`);
  await page.screenshot({ path: walkPath });
}
await page.getByTestId('speed-0').click();

// North star reference
copyFileSync(
  join(process.cwd(), 'Docs/art-direction/references/god-mode-town-north-star.png'),
  join(OUT, 'r6_north_star_reference.png'),
);

// R5 before reference (from prior release)
const r5Before = join(OUT, 'r5_before_overview.png');
try {
  const r5Url = 'https://github.com/akulasaivineeth/God-Mode-sim/releases/download/review-evidence-m02-005/r5_overview_daylight.png';
  const res = await fetch(r5Url);
  if (res.ok) {
    const buf = Buffer.from(await res.arrayBuffer());
    const { writeFileSync } = await import('node:fs');
    writeFileSync(r5Before, buf);
  }
} catch {
  console.warn('Could not fetch R5 before image');
}

// HUD metrics per camera
const metrics = [];
for (const cam of ['overview', 'angled', 'street_home']) {
  await page.evaluate((cameraName) => {
    window.__GODMODE_SET_EVIDENCE_CAMERA__?.(cameraName);
  }, cam);
  await page.waitForTimeout(2000);
  const draws = await page.getByTestId('hud-drawcalls').textContent();
  const hud = await page.getByTestId('diagnostics-hud').textContent();
  const fps = hud?.match(/FPS:\s*([\d.]+)/)?.[1] ?? '?';
  const tris = hud?.match(/Tris:\s*([\d,]+)/)?.[1] ?? '?';
  metrics.push(`${cam}: ${draws} draws · ${tris} tris · ${fps} FPS`);
}

const textureErrors = consoleErrors.filter(
  (e) => e.includes('texture') || e.includes('404') || e.includes('GLTFLoader') || e.includes('colormap'),
);

console.log('\n=== HUD Metrics ===');
metrics.forEach((m) => console.log(m));
console.log('\n=== Console texture/asset errors ===');
if (textureErrors.length === 0) console.log('NONE');
else textureErrors.forEach((e) => console.log(e));
console.log(`\nEvidence saved to ${OUT} (${hashes.size} unique shots)`);

await browser.close();

if (textureErrors.length > 0) {
  process.exitCode = 1;
}
