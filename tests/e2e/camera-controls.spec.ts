import { expect, test } from '@playwright/test';
import { CAMERA_PRESETS } from '../../src/rendering/cameraPresets';

test.describe.configure({ mode: 'serial' });

async function readCamera(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const api = (globalThis as unknown as { __GODMODE_PLAYER_CAMERA__?: { getState: () => unknown } })
      .__GODMODE_PLAYER_CAMERA__;
    return api?.getState() ?? null;
  }) as Promise<{
    distance: number;
    minDistance: number;
    maxDistance: number;
    position: [number, number, number];
    target: [number, number, number];
  } | null>;
}

async function waitForPlayerCamera(page: import('@playwright/test').Page) {
  await page.waitForFunction(() => {
    const api = (globalThis as unknown as { __GODMODE_PLAYER_CAMERA__?: { getState: () => { distance: number } | null } })
      .__GODMODE_PLAYER_CAMERA__;
    const state = api?.getState();
    return state != null && state.distance > 0;
  });
  await page.waitForFunction(() => {
    const api = (globalThis as unknown as {
      __GODMODE_EVIDENCE__?: { getCaptureMeta: () => { citizenPosition?: unknown } | null };
    }).__GODMODE_EVIDENCE__;
    return api?.getCaptureMeta()?.citizenPosition != null;
  });
}

test('VIS-002 — zoom buttons and wheel change distance within bounds', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('/');
  await expect(page.getByTestId('r3f-canvas')).toBeVisible();
  await expect(page.getByTestId('camera-zoom-in')).toBeVisible();
  await waitForPlayerCamera(page);
  await page.getByTestId('camera-angled').click();
  await page.waitForTimeout(400);

  const before = await readCamera(page);
  expect(before).not.toBeNull();
  const startDist = before!.distance;

  await page.getByTestId('camera-zoom-in').click();
  await page.waitForTimeout(300);
  const zoomedIn = await readCamera(page);
  expect(zoomedIn!.distance).toBeLessThan(startDist);
  expect(zoomedIn!.distance).toBeGreaterThanOrEqual(zoomedIn!.minDistance);

  const canvas = page.getByTestId('r3f-canvas');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.wheel(0, 160);
  await page.waitForTimeout(400);
  const afterWheel = await readCamera(page);
  expect(afterWheel!.distance).toBeGreaterThan(zoomedIn!.distance);

  await page.evaluate(() => {
    const api = (globalThis as unknown as { __GODMODE_PLAYER_CAMERA__?: { zoomOut: () => boolean } })
      .__GODMODE_PLAYER_CAMERA__;
    for (let i = 0; i < 12; i += 1) api?.zoomOut();
  });
  await page.waitForTimeout(300);
  const maxed = await readCamera(page);
  expect(maxed!.distance).toBeLessThanOrEqual(maxed!.maxDistance + 0.5);
});

test('VIS-002 — drag rotates and reset returns to Overview framing', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('/');
  await expect(page.getByTestId('r3f-canvas')).toBeVisible();
  await waitForPlayerCamera(page);
  await page.getByTestId('camera-angled').click();
  await page.waitForTimeout(400);
  const angled = await readCamera(page);
  expect(angled).not.toBeNull();

  const canvas = page.getByTestId('r3f-canvas');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  const cx = box!.x + box!.width / 2;
  const cy = box!.y + box!.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down({ button: 'left' });
  await page.mouse.move(cx + 140, cy + 50, { steps: 10 });
  await page.mouse.up({ button: 'left' });
  await page.waitForTimeout(900);
  const rotated = await readCamera(page);
  expect(
    rotated!.position.some(
      (v: number, i: number) => Math.abs(v - angled!.position[i]) > 0.05,
    ),
  ).toBe(true);

  await page.getByTestId('camera-reset').click();
  await page.waitForTimeout(500);
  const reset = await readCamera(page);
  const overviewPosition = CAMERA_PRESETS.overview.position;
  const overviewTarget = CAMERA_PRESETS.overview.target;
  expect(
    reset!.position.every((v, i) => Math.abs(v - overviewPosition[i]) < 3),
  ).toBe(true);
  expect(
    reset!.target.every((v, i) => Math.abs(v - overviewTarget[i]) < 2),
  ).toBe(true);
});

test('VIS-002 — manual camera works while simulation is paused', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('/');
  await expect(page.getByTestId('r3f-canvas')).toBeVisible();
  await waitForPlayerCamera(page);
  await page.getByTestId('speed-0').click();
  await expect(page.getByTestId('hud-speed')).toHaveText('Paused');
  await page.getByTestId('camera-street').click();
  await page.waitForTimeout(400);
  const before = await readCamera(page);
  expect(before).not.toBeNull();
  await page.evaluate(() => {
    (globalThis as unknown as { __GODMODE_PLAYER_CAMERA__?: { zoomIn: () => boolean } })
      .__GODMODE_PLAYER_CAMERA__?.zoomIn();
  });
  await page.waitForTimeout(300);
  const after = await readCamera(page);
  expect(after!.distance).toBeLessThan(before!.distance);
});
