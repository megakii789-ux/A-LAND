import { test, expect } from '@playwright/test';
import fs from 'fs';

/**
 * Parent Coach Responsive & Viewport Validation Suite (Stage 1 Gate)
 *
 * Verifies across all 6 target viewports:
 * - Mobile-360: 360x640
 * - Mobile-390: 390x844
 * - Mobile-430: 430x932
 * - Tablet-768: 768x1024
 * - Tablet-1024: 1024x768
 * - Desktop-1440: 1440x900
 *
 * Assertions:
 * 1. Mode gate: Successfully unlocks Parent mode through PIN security modal.
 * 2. Zero horizontal overflow: document.documentElement.scrollWidth <= window.innerWidth.
 * 3. Mobile hierarchy: Active tab panel starts at boundingBox.top < 520px on 360px, 390px, 430px.
 * 4. Tab reachability: All 10 navigation tabs can be clicked, activated, and viewed without overflow or crash.
 * 5. Visual regression capture: tests/screenshots/parent-coach-{viewport}.png.
 */

async function unlockParentMode(page: any) {
  await page.goto('/');
  await expect(page.getByText('晴雨小岛', { exact: true }).first()).toBeVisible();

  // Locate and click the mode switch button in navbar
  const switchBtn = page.getByRole('button', { name: /当前处于孩子端，点击切换到家长教练端/ });
  await expect(switchBtn).toBeVisible();
  await switchBtn.click();

  // Wait for the ParentGateModal PIN gate
  const gateDialog = page.getByRole('dialog', { name: '照顾者安全验证门禁' });
  await expect(gateDialog).toBeVisible();

  // Check whether PIN already exists in localStorage
  const hasPin = await page.evaluate(() => !!localStorage.getItem('parent_security_pin_hash'));

  if (!hasPin) {
    // Initial PIN setup mode: wait for React state to show 2 password inputs
    const pinInputs = gateDialog.locator('input[type="password"]');
    await expect(pinInputs).toHaveCount(2);
    await pinInputs.nth(0).fill('246810');
    await pinInputs.nth(1).fill('246810');
    await gateDialog.getByRole('button', { name: '确认并进入' }).click();
  } else {
    // Existing PIN verification mode
    const pinInput = gateDialog.locator('input[type="password"]').first();
    await pinInput.fill('246810');
    await gateDialog.getByRole('button', { name: '校验进入' }).click();
  }

  // Ensure modal is dismissed
  await expect(gateDialog).toHaveCount(0);

  // Verify Parent Dashboard headline is loaded
  await expect(page.getByText('真正的杠杆在大人').first()).toBeVisible();
}

test.describe('Parent Coach Responsive & Viewport Verification (Stage 1 Gate)', () => {
  test('Parent Dashboard has zero horizontal overflow across current viewport', async ({ page }) => {
    await unlockParentMode(page);

    const { scrollWidth, innerWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));

    expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
  });

  test('Parent Dashboard active tab panel starts within boundingBox.top < 520px on mobile viewports', async ({
    page,
  }) => {
    await unlockParentMode(page);

    const viewport = page.viewportSize();
    expect(viewport).not.toBeNull();
    const vw = viewport!.width;

    const tabPanel = page.locator('[role="tabpanel"]').first();
    await expect(tabPanel).toBeVisible();

    const box = (await tabPanel.boundingBox())!;
    expect(box).not.toBeNull();

    // Verify top constraint on mobile devices (360px, 390px, 430px)
    if (vw <= 430) {
      expect(box.y).toBeLessThan(520);
    }

    // Zero horizontal overflow
    const { scrollWidth, innerWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
  });

  test('All 10 navigation tabs are reachable and can be switched into without overflow or error', async ({
    page,
  }) => {
    await unlockParentMode(page);

    const tabList = page.locator('[role="tablist"][aria-label="家长教练功能模块导航"]');
    await expect(tabList).toBeVisible();

    const tabs = tabList.locator('[role="tab"]');
    const tabCount = await tabs.count();
    expect(tabCount).toBe(10);

    for (let i = 0; i < tabCount; i++) {
      const tab = tabs.nth(i);
      await tab.evaluate((el) => el.scrollIntoView({ block: 'nearest', inline: 'center' }));
      await expect(tab).toBeVisible();

      // Click to switch tab
      await tab.click();
      await expect(tab).toHaveAttribute('aria-selected', 'true');

      // Verify active panel renders
      const tabPanel = page.locator('[role="tabpanel"]').first();
      await expect(tabPanel).toBeVisible();

      // Assert zero horizontal overflow in this tab view
      const { scrollWidth, innerWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
    }
  });

  test('Capture screenshot baseline for Parent Coach workspace', async ({ page }, testInfo) => {
    await unlockParentMode(page);

    const viewportName = testInfo.project.name.toLowerCase();
    const screenshotDir = 'tests/screenshots';
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const screenshotPath = `${screenshotDir}/parent-coach-${viewportName}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: false });

    // Verify file generated and non-empty
    expect(fs.existsSync(screenshotPath)).toBe(true);
    const stats = fs.statSync(screenshotPath);
    expect(stats.size).toBeGreaterThan(1000);
  });
});
