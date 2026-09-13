/**
 * One-off evidence capture for M02 R4 review — run after build.
 * Usage: node scripts/capture-m02-r4-evidence.mjs
 */
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const OUT = join(process.cwd(), 'review-evidence-m02-004');
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
await page.waitForSelector('[data-testid="r3f-canvas"]');
// Paused 1× for honest HUD metrics
await page.getByTestId('speed-0').click();
await page.waitForTimeout(1500);

const shots = [
  { name: 'r4_overview_daylight', camera: 'overview' },
  { name: 'r4_angled_daylight', camera: 'angled' },
  { name: 'r4_street_route', camera: 'street' },
];

for (const shot of shots) {
  await page.getByTestId(`camera-${shot.camera}`).click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: join(OUT, `${shot.name}.png`), fullPage: false });
}

// Select Alex for inspector + closeup views
await page.getByTestId('camera-angled').click();
await page.waitForTimeout(800);
const canvas = page.getByTestId('r3f-canvas');
const box = await canvas.boundingBox();
if (box) {
  await page.mouse.click(box.x + box.width * 0.52, box.y + box.height * 0.55);
}
await page.waitForTimeout(800);
await page.screenshot({ path: join(OUT, 'r4_inspector_selected.png') });
await page.screenshot({ path: join(OUT, 'r4_alex_selected.png') });

// Advance sim to catch walking / facility interactions
await page.getByTestId('speed-100').click();
for (let i = 0; i < 8; i += 1) {
  await page.waitForTimeout(2000);
  await page.getByTestId('camera-angled').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(OUT, `r4_alex_walking_${i}.png`) });
}

// Night/dusk — if time control exists, otherwise capture current
await page.getByTestId('speed-0').click();
await page.getByTestId('camera-overview').click();
await page.waitForTimeout(500);
await page.screenshot({ path: join(OUT, 'r4_night_dusk.png') });

const hud = await page.getByTestId('diagnostics-hud').textContent();
console.log('HUD snapshot:\n', hud);
await browser.close();
console.log(`Evidence saved to ${OUT}`);
