import { test, expect } from '@playwright/test';

test.describe('Child-First Design System Viewport & Overflow Tests', () => {
  test('Child Home must not have horizontal scrollbar on any supported viewport', async ({ page }) => {
    await page.goto('/');

    // Wait for the island UI to be ready
    await expect(page.locator('text=晴雨小岛')).toBeVisible();
    await expect(page.locator('text=伴伴在身边')).toBeVisible();
    await expect(page.locator('text=绿草平静角')).toBeVisible();
    await expect(page.locator('text=找大人抱抱')).toBeVisible();

    // Assert that the page does not horizontally overflow: document.documentElement.scrollWidth <= clientWidth
    const { scrollWidth, clientWidth } = await page.evaluate(() => {
      const doc = document.documentElement;
      return {
        scrollWidth: doc.scrollWidth,
        clientWidth: doc.clientWidth,
      };
    });

    // scrollWidth must never exceed clientWidth
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  test('Create screenshot baseline for child home', async ({ page }, testInfo) => {
    await page.goto('/');
    await expect(page.locator('text=晴雨小岛')).toBeVisible();

    // Capture screenshot baseline per viewport project
    const screenshotPath = `tests/screenshots/child-home-${testInfo.project.name.toLowerCase()}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: false });

    // Verify screenshot file was generated and has non-zero size
    const fs = await import('fs');
    expect(fs.existsSync(screenshotPath)).toBe(true);
    const stats = fs.statSync(screenshotPath);
    expect(stats.size).toBeGreaterThan(1000);
  });
});
