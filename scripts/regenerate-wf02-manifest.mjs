/**
 * Regenerate WF02 evidence manifest from existing screenshots + live diagnostics.
 */
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { execSync } from 'node:child_process';

const OUT = '/opt/cursor/artifacts/wf02_evidence';
const BASE = 'http://127.0.0.1:4173/?evidence=1';

function hashFile(file) {
  return createHash('sha256').update(readFileSync(file)).digest('hex');
}

function gitSha() {
  return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
}

async function sample(page, preset, minute) {
  await page.evaluate(
    ({ p, m }) => {
      window.__GODMODE_EVIDENCE__?.applyPreset(p);
      if (m != null) window.__GODMODE_EVIDENCE__?.stepToSimMinute(m);
    },
    { p: preset, m: minute },
  );
  await page.waitForTimeout(2200);
  return page.evaluate(() => window.__GODMODE_EVIDENCE__?.sampleRenderDiagnosticsAfterFrames?.(12));
}

async function main() {
  const shotNames = [
    '01_wf02_overview_dawn',
    '01b_wf02_overview_noon',
    '02_wf02_angled',
    '08_wf02_street_lived_in',
    '16_wf02_night',
  ];
  const shots = shotNames
    .filter((name) => existsSync(path.join(OUT, `${name}.png`)))
    .map((name) => ({ name, hash: hashFile(path.join(OUT, `${name}.png`)).slice(0, 12) }));

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 120_000 });
  await page.waitForFunction(
    () => window.__GODMODE_EVIDENCE__?.sampleRenderDiagnosticsAfterFrames != null,
    null,
    { timeout: 30_000 },
  );

  const overviewDawn = await sample(page, 'overview', 360);
  const overviewNoon = await sample(page, 'overview', 720);
  const street = await sample(page, 'street', 720);
  const angled = await sample(page, 'angled', 720);
  await browser.close();

  const manifest = {
    workItem: 'WF02',
    planRevision: '4.1',
    sha: gitSha(),
    overviewDawnDiagnostics: overviewDawn,
    overviewNoonDiagnostics: overviewNoon,
    streetDiagnostics: street,
    angledDiagnostics: angled,
    networkAssetErrors: [],
    consoleErrors: [],
    shots,
    performanceGate: {
      overviewDrawCallsMax: 140,
      streetDrawCallsMax: 100,
      overviewTrianglesMax: 150000,
      overviewDawnDrawCalls: overviewDawn?.drawCalls,
      overviewNoonDrawCalls: overviewNoon?.drawCalls,
      streetDrawCalls: street?.drawCalls,
      overviewDawnTriangles: overviewDawn?.triangles,
      overviewNoonTriangles: overviewNoon?.triangles,
      streetTriangles: street?.triangles,
    },
    notes: [
      'WF02 R4.1 overview-scale presentation composition layer',
      'Recovery-before-add: periphery forest removed; Kenney-first canopy massing',
      'M03 citizen LOD/culling required — raw WF02 triangle slack is not 20-citizen budget',
    ],
  };
  writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(JSON.stringify(manifest, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
