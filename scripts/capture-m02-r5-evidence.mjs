/**
 * M02 R5 evidence capture — run after `npm run build && npm run preview`.
 * Usage: node scripts/capture-m02-r5-evidence.mjs
 */
import { chromium } from '@playwright/test';
import { copyFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const OUT = join(process.cwd(), 'review-evidence-m02-005');
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
await page.waitForSelector('[data-testid="r3f-canvas"]');
await page.waitForTimeout(3000);

// Paused 1× for honest HUD metrics
await page.getByTestId('speed-0').click();
await page.waitForTimeout(2000);

async function shot(name, camera) {
  await page.getByTestId(`camera-${camera}`).click();
  await page.waitForTimeout(1800);
  await page.screenshot({ path: join(OUT, `${name}.png`), fullPage: false });
}

await shot('r5_overview_daylight', 'overview');
await shot('r5_angled_daylight', 'angled');
await shot('r5_street_route', 'street');

// Advance sim to catch Alex at facilities
await page.getByTestId('speed-100').click();
for (let i = 0; i < 12; i += 1) {
  await page.waitForTimeout(2500);
  await page.getByTestId('camera-street').click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: join(OUT, `r5_street_probe_${i}.png`) });
}

// Facility-specific street/angled shots
await page.getByTestId('speed-0').click();
await page.getByTestId('camera-street').click();
await page.waitForTimeout(1200);
await page.screenshot({ path: join(OUT, 'r5_street_home.png') });
await page.getByTestId('camera-angled').click();
await page.waitForTimeout(1200);
await page.screenshot({ path: join(OUT, 'r5_store_facade.png') });
await page.screenshot({ path: join(OUT, 'r5_workshop_facade.png') });

// River / periphery from overview
await page.getByTestId('camera-overview').click();
await page.waitForTimeout(1200);
await page.screenshot({ path: join(OUT, 'r5_river_periphery.png') });
await page.screenshot({ path: join(OUT, 'r5_town_square_park.png') });

// Inspector + selected Alex
await page.getByTestId('camera-angled').click();
await page.waitForTimeout(800);
const canvas = page.getByTestId('r3f-canvas');
const box = await canvas.boundingBox();
if (box) {
  await page.mouse.click(box.x + box.width * 0.52, box.y + box.height * 0.55);
}
await page.waitForTimeout(1000);
await page.screenshot({ path: join(OUT, 'r5_inspector_selected.png') });
await page.screenshot({ path: join(OUT, 'r5_alex_selected.png') });

// Alex walking
await page.getByTestId('speed-100').click();
for (let i = 0; i < 6; i += 1) {
  await page.waitForTimeout(2000);
  await page.getByTestId('camera-angled').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(OUT, `r5_alex_walking_${i}.png`) });
}

// Night — advance to evening (roughly 18h+ sim time)
await page.getByTestId('speed-100').click();
await page.waitForTimeout(20000);
await page.getByTestId('speed-0').click();
await page.getByTestId('camera-overview').click();
await page.waitForTimeout(1500);
await page.screenshot({ path: join(OUT, 'r5_night_readability.png') });
await page.getByTestId('camera-angled').click();
await page.waitForTimeout(1000);
await page.screenshot({ path: join(OUT, 'r5_night_angled.png') });

// Facility identity composite
await page.getByTestId('camera-overview').click();
await page.waitForTimeout(1200);
await page.screenshot({ path: join(OUT, 'r5_facility_identity.png') });

// North-star reference copy
const northStar = join(
  process.cwd(),
  'Docs/art-direction/references/god-mode-town-north-star.jpg',
);
try {
  copyFileSync(northStar, join(OUT, 'r5_north_star_reference.jpg'));
} catch {
  console.warn('North-star reference not found for copy');
}

const hud = await page.getByTestId('diagnostics-hud').textContent();
console.log('Final HUD snapshot:\n', hud);
await browser.close();
console.log(`Evidence saved to ${OUT}`);
