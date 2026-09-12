import { expect, test } from '@playwright/test';

test('M00 app boots with 3D canvas and diagnostics', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('r3f-canvas')).toBeVisible();
  await expect(page.getByTestId('diagnostics-hud')).toBeVisible();
  await expect(page.getByText('GOD MODE — M00 Diagnostics')).toBeVisible();
});
