/**
 * Final R5 evidence — key shots only.
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
await page.getByTestId('speed-0').click();
await page.waitForTimeout(2000);

async function shot(name, camera) {
  await page.getByTestId(`camera-${camera}`).click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: join(OUT, `${name}.png`) });
}

await shot('r5_overview_daylight', 'overview');
await shot('r5_angled_daylight', 'angled');
await shot('r5_street_home', 'street');
await shot('r5_store_facade', 'street');
await shot('r5_workshop_facade', 'angled');
await shot('r5_river_periphery', 'overview');
await shot('r5_town_square_park', 'overview');
await shot('r5_facility_identity', 'overview');

await page.getByTestId('camera-angled').click();
await page.waitForTimeout(800);
await page.screenshot({ path: join(OUT, 'r5_inspector_selected.png') });

await page.getByTestId('speed-100').click();
await page.waitForTimeout(25000);
await page.getByTestId('speed-0').click();
await page.getByTestId('camera-overview').click();
await page.waitForTimeout(1500);
await page.screenshot({ path: join(OUT, 'r5_night_readability.png') });

copyFileSync(
  join(process.cwd(), 'Docs/art-direction/references/god-mode-town-north-star.jpg'),
  join(OUT, 'r5_north_star_reference.jpg'),
);

const hud = await page.getByTestId('diagnostics-hud').textContent();
console.log('HUD:\n', hud);
await browser.close();
