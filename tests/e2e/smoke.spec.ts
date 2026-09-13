import { expect, test } from '@playwright/test';

test('M02 app boots with citizen, inspector, and diagnostics', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('r3f-canvas')).toBeVisible();
  await expect(page.getByTestId('diagnostics-hud')).toBeVisible();
  await expect(page.getByText('GOD MODE — M02 Diagnostics')).toBeVisible();
  await expect(page.getByTestId('citizen-inspector')).toBeVisible();
  await expect(page.getByTestId('time-controls')).toBeVisible();
});

test('SIM-TIME-002/003 — speed advances simulated time and pause halts it', async ({ page }) => {
  await page.goto('/');
  const clock = page.getByTestId('hud-clock');
  await expect(clock).toBeVisible();

  await page.getByTestId('speed-1000').click();
  const before = await clock.textContent();
  await expect
    .poll(async () => clock.textContent(), { timeout: 8000 })
    .not.toBe(before);

  await page.getByTestId('speed-0').click();
  await expect(page.getByTestId('hud-speed')).toHaveText('Paused');
  await page.waitForTimeout(300);
  const paused = await clock.textContent();
  await page.waitForTimeout(700);
  expect(await clock.textContent()).toBe(paused);
});

test('M02-GATE — citizen inspector shows utility breakdown after simulation advances', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('citizen-inspector')).toBeVisible();
  await page.getByTestId('speed-100').click();
  await expect
    .poll(async () => page.getByTestId('utility-breakdown').count(), { timeout: 10000 })
    .toBeGreaterThan(0);
});
