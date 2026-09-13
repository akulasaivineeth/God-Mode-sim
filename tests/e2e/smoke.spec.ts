import { expect, test } from '@playwright/test';

test('M01 app boots with 3D town, time controls, and diagnostics', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('r3f-canvas')).toBeVisible();
  await expect(page.getByTestId('diagnostics-hud')).toBeVisible();
  await expect(page.getByText('GOD MODE — M01 Diagnostics')).toBeVisible();
  await expect(page.getByTestId('time-controls')).toBeVisible();
  await expect(page.getByTestId('camera-controls')).toBeVisible();
});

test('SIM-TIME-002/003 — speed advances simulated time and pause halts it', async ({ page }) => {
  await page.goto('/');
  const clock = page.getByTestId('hud-clock');
  await expect(clock).toBeVisible();

  // Run fast so simulated time advances quickly, then confirm the clock moved.
  await page.getByTestId('speed-1000').click();
  const before = await clock.textContent();
  await expect
    .poll(async () => clock.textContent(), { timeout: 8000 })
    .not.toBe(before);

  // Pause and confirm the clock stops changing.
  await page.getByTestId('speed-0').click();
  await expect(page.getByTestId('hud-speed')).toHaveText('Paused');
  await page.waitForTimeout(300);
  const paused = await clock.textContent();
  await page.waitForTimeout(700);
  expect(await clock.textContent()).toBe(paused);
});

test('VIS-002 — camera preset buttons are selectable', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('camera-overview').click();
  await page.getByTestId('camera-street').click();
  await page.getByTestId('camera-angled').click();
  // Switching presets must not break the scene.
  await expect(page.getByTestId('r3f-canvas')).toBeVisible();
});
