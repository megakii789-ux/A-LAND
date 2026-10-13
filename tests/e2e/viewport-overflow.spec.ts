import { test, expect } from '@playwright/test';

test.describe('Child-First Design System Viewport & Overflow Tests (AG-04A)', () => {
  test('Child Home must not have horizontal scrollbar on any supported viewport', async ({ page }) => {
    await page.goto('/');

    // Wait for the island UI to be ready
    await expect(page.getByText('晴雨小岛', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('伴伴在身边').first()).toBeVisible();
    await expect(page.getByText('绿草呼吸平静角').first()).toBeVisible();
    await expect(page.getByText('找大人抱抱').first()).toBeVisible();

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

  test('Both Fairytale Island Map and Card views must render without horizontal overflow', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('晴雨小岛', { exact: true }).first()).toBeVisible();

    // Verify map view is active and responsive
    await expect(page.getByText('童话小岛探索地图').first()).toBeVisible();
    const mapMetrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(mapMetrics.scrollWidth).toBeLessThanOrEqual(mapMetrics.clientWidth);

    // Switch to Card view
    const cardTab = page.getByRole('tab', { name: /清晰地点卡片/ });
    await cardTab.click();

    // Verify card view rendered and has zero horizontal overflow
    await expect(page.getByText('想先去哪儿玩').first()).toBeVisible();
    const cardMetrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(cardMetrics.scrollWidth).toBeLessThanOrEqual(cardMetrics.clientWidth);
  });

  test('Touch targets meet >= 56x56 CSS px standard for child interaction', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('晴雨小岛', { exact: true }).first()).toBeVisible();

    // Switch to card view to inspect location card touch targets
    const cardTab = page.getByRole('tab', { name: /清晰地点卡片/ });
    await cardTab.click();

    // Audio narrator buttons on location cards must be >= 56x56px
    const audioButtons = page.locator('button[aria-label*="听一听"]');
    const count = await audioButtons.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < Math.min(count, 3); i++) {
      const box = await audioButtons.nth(i).boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(56);
        expect(box.height).toBeGreaterThanOrEqual(56);
      }
    }
  });

  test('Create screenshot baseline for child home across all 6 viewports', async ({ page }, testInfo) => {
    await page.goto('/');
    await expect(page.getByText('晴雨小岛', { exact: true }).first()).toBeVisible();

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
