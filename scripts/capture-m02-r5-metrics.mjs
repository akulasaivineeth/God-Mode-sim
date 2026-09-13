/**
 * Paused HUD metrics per camera — run after preview is up.
 */
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
await page.waitForSelector('[data-testid="r3f-canvas"]');
await page.waitForTimeout(2500);
await page.getByTestId('speed-0').click();
await page.waitForTimeout(1500);

for (const camera of ['overview', 'angled', 'street']) {
  await page.getByTestId(`camera-${camera}`).click();
  await page.waitForTimeout(2000);
  const draws = await page.getByTestId('hud-drawcalls').textContent();
  const hud = await page.getByTestId('diagnostics-hud').textContent();
  const fps = hud?.match(/FPS:\s*([\d.]+)/)?.[1] ?? '?';
  const tris = hud?.match(/Tris:\s*([\d,]+)/)?.[1] ?? '?';
  console.log(`${camera}: ${draws} draws · ${tris} tris · ${fps} FPS`);
}

await browser.close();
