/**
 * Measure render budget at canonical camera presets — Foundation Hardening proof.
 *
 * Uses the same evidence preset settling as capture-m02-closure-evidence.mjs and samples
 * renderer counters after render frames via sampleRenderDiagnosticsAfterFrames().
 * Also reads HUD-store counters for reconciliation (FpsTracker updates ~1 Hz).
 *
 * Usage: npm run build && npm run preview -- --host 127.0.0.1 --port 4173 &
 *        npm run measure:render-budget
 */
import { chromium } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const BASE = 'http://127.0.0.1:4173/?evidence=1';
const OUT = '/opt/cursor/artifacts/foundation_render_budget.json';
const PRESET_SETTLE_MS = 1800;
const RENDER_FRAME_WAITS = 10;
const HUD_STORE_SYNC_MS = 1100;
const STABLE_TOLERANCE = { drawCalls: 0, triangles: 0 };

async function waitRenderFrames(page, count = RENDER_FRAME_WAITS) {
  for (let i = 0; i < count; i += 1) {
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(r)));
  }
  await page.waitForTimeout(250);
}

async function applyPreset(page, view) {
  await page.evaluate((preset) => window.__GODMODE_EVIDENCE__?.applyPreset(preset), view);
  await page.waitForTimeout(PRESET_SETTLE_MS);
  await waitRenderFrames(page);
}

async function sampleLiveDiagnostics(page) {
  return page.evaluate(async () => {
    const api = window.__GODMODE_EVIDENCE__;
    if (!api?.sampleRenderDiagnosticsAfterFrames) {
      throw new Error('sampleRenderDiagnosticsAfterFrames unavailable');
    }
    return api.sampleRenderDiagnosticsAfterFrames(12);
  });
}

async function sampleHudDiagnostics(page) {
  await page.waitForTimeout(HUD_STORE_SYNC_MS);
  return page.evaluate(() => window.__GODMODE_EVIDENCE__?.getRenderDiagnostics());
}

async function measurePreset(page, preset) {
  await applyPreset(page, preset);
  const live = await sampleLiveDiagnostics(page);
  const hud = await sampleHudDiagnostics(page);
  const reconciled =
    Math.abs(live.drawCalls - hud.drawCalls) <= STABLE_TOLERANCE.drawCalls &&
    Math.abs(live.triangles - hud.triangles) <= STABLE_TOLERANCE.triangles;
  return {
    preset,
    liveAfterFrames: live,
    hudStore: hud,
    reconciled,
    authoritative: live,
  };
}

async function main() {
  mkdirSync(path.dirname(OUT), { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 120_000 });
  await page.waitForFunction(
    () => {
      const api = window.__GODMODE_EVIDENCE__;
      return (
        typeof api?.sampleRenderDiagnosticsAfterFrames === 'function' &&
        typeof api?.getRenderDiagnostics === 'function' &&
        api.getCaptureMeta()?.citizenPosition != null
      );
    },
    null,
    { timeout: 60_000 },
  );
  await page.evaluate(() => window.__GODMODE_EVIDENCE__?.setSpeed(0));
  await page.waitForTimeout(1500);

  const overview = await measurePreset(page, 'overview');
  const homeStreet = await measurePreset(page, 'home-street');
  const storeStreet = await measurePreset(page, 'store-street');
  const workshopStreet = await measurePreset(page, 'workshop-street');

  const results = {
    measuredAt: new Date().toISOString(),
    methodology: {
      presetSettleMs: PRESET_SETTLE_MS,
      renderFrameWaits: RENDER_FRAME_WAITS,
      hudStoreSyncMs: HUD_STORE_SYNC_MS,
      liveSampleFrames: 12,
      note:
        'Authoritative counters use post-frame live GL renderer info. Prior 119 Overview artifact came from sampling before FpsTracker/HUD sync and before full scene settle.',
    },
    m02AcceptedBaseline: {
      overview: { drawCalls: 136, triangles: 126241 },
      homeStreet: { drawCalls: 64, triangles: 119039 },
    },
    reconciliation: {
      overview,
      homeStreet,
      storeStreet,
      workshopStreet,
    },
    summary: {
      overviewDrawCalls: overview.authoritative.drawCalls,
      overviewTriangles: overview.authoritative.triangles,
      homeStreetDrawCalls: homeStreet.authoritative.drawCalls,
      homeStreetTriangles: homeStreet.authoritative.triangles,
      materialPoolingEffect:
        'Allocation/lifecycle hardening only — identical material refs do not batch separate meshes into fewer draw calls.',
      softTarget110to120: 'Not achieved; remains future instancing/batching work without visual redesign.',
    },
  };

  if (!overview.reconciled) {
    throw new Error(
      `Overview live/HUD mismatch: live=${overview.liveAfterFrames.drawCalls} hud=${overview.hudStore.drawCalls}`,
    );
  }

  writeFileSync(OUT, JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
