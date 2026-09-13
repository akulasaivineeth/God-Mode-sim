import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
await page.getByTestId('speed-0').click();
await page.waitForTimeout(2000);

for (const camera of ['overview', 'angled', 'street']) {
  await page.getByTestId(`camera-${camera}`).click();
  await page.waitForTimeout(2000);
  const hud = await page.getByTestId('diagnostics-hud').textContent();
  const fps = hud?.match(/FPS: ([\d.]+)/)?.[1];
  const draws = hud?.match(/Draw calls: (\d+)/)?.[1];
  const tris = hud?.match(/Tris: ([\d,]+)/)?.[1];
  console.log(`${camera}: FPS=${fps} draws=${draws} tris=${tris}`);
}
await browser.close();
