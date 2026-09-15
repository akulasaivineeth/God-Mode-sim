/**
 * Measure render budget at canonical camera presets — Foundation Hardening proof.
 *
 * Usage: npm run build && npm run preview -- --host 127.0.0.1 --port 4173 &
 *        node scripts/measure-render-budget.mjs
 */
import { chromium } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const BASE = 'http://127.0.0.1:4173/?evidence=1';
const OUT = '/opt/cursor/artifacts/foundation_render_budget.json';

async function measurePreset(page, preset) {
  await page.evaluate((view) => window.__GODMODE_EVIDENCE__?.applyPreset(view), preset);
  await page.waitForTimeout(1200);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  return page.evaluate(() => window.__GODMODE_EVIDENCE__?.getRenderDiagnostics());
}

async function main() {
  mkdirSync(path.dirname(OUT), { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 120_000 });
  await page.waitForFunction(
    () => {
      const api = window.__GODMODE_EVIDENCE__;
      return typeof api?.getRenderDiagnostics === 'function' && api.getCaptureMeta()?.citizenPosition != null;
    },
    null,
    { timeout: 60_000 },
  );
  await page.waitForTimeout(1500);

  const results = {
    measuredAt: new Date().toISOString(),
    baselineM02: { overviewDrawCalls: 136, overviewTriangles: 126241, homeStreetDrawCalls: 64, homeStreetTriangles: 119039 },
    after: {
      overview: await measurePreset(page, 'overview'),
      homeStreet: await measurePreset(page, 'home-street'),
      storeStreet: await measurePreset(page, 'store-street'),
      workshopStreet: await measurePreset(page, 'workshop-street'),
    },
  };

  writeFileSync(OUT, JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
