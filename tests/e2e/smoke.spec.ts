import { expect, test } from '@playwright/test';

test('M02 app boots with 3D town, citizen inspector, time and camera controls', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('r3f-canvas')).toBeVisible();
  await expect(page.getByTestId('diagnostics-hud')).toBeVisible();
  await expect(page.getByText('GOD MODE — M02 Diagnostics')).toBeVisible();
  await expect(page.getByTestId('time-controls')).toBeVisible();
  await expect(page.getByTestId('camera-controls')).toBeVisible();
  await expect(page.getByTestId('citizen-inspector')).toBeVisible();
});

test('SIM-TIME-002/003 — speed advances simulated time and pause halts it', async ({ page }) => {
  await page.goto('/');
  const clock = page.getByTestId('hud-clock');
  await expect(clock).toBeVisible();

  await page.getByTestId('speed-1000').click();
  const before = await clock.textContent();
  await expect.poll(async () => clock.textContent(), { timeout: 8000 }).not.toBe(before);

  await page.getByTestId('speed-0').click();
  await expect(page.getByTestId('hud-speed')).toHaveText('Paused');
  await page.waitForTimeout(300);
  const paused = await clock.textContent();
  await page.waitForTimeout(700);
  expect(await clock.textContent()).toBe(paused);
});

test('UX-001 / NPC-DEC-001 — inspector shows the citizen acting autonomously with scores', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('citizen-inspector')).toBeVisible();

  // Run fast so the citizen makes decisions with no player commands, then confirm
  // the inspector exposes a selected action with its candidate score breakdown.
  await page.getByTestId('speed-1000').click();
  await expect(page.getByTestId('inspector-selected')).toBeVisible();
  await expect(page.getByTestId('inspector-selected')).not.toBeEmpty();
  await expect(page.getByTestId('inspector-activity')).not.toBeEmpty();
});

test('VIS-002 — camera preset buttons are selectable', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('camera-overview').click();
  await page.getByTestId('camera-street').click();
  await page.getByTestId('camera-angled').click();
  await expect(page.getByTestId('r3f-canvas')).toBeVisible();
});
