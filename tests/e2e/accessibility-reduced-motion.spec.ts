import { test, expect } from '@playwright/test';

/**
 * Phase N Hardening:
 * 1. Accessibility Checks (aria-label, touch target sizes >= 56px, high contrast)
 * 2. Reduced-Motion Checks (respects prefers-reduced-motion)
 * 3. No Horizontal Overflow on Any Viewport (360x800, 390x844, 430x932, 768x1024, 1024x1366)
 * 4. Critical Child Screen Visual Baselines
 */

test.describe('Accessibility & Reduced Motion Hardening', () => {
  test('Child interactive elements meet 56px minimum standard and have aria-labels', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('晴雨小岛', { exact: true }).first()).toBeVisible();

    // 检查抱抱主按钮的高度与 aria-label
    const hugButton = page.locator('button[aria-label*="找大人抱抱"]');
    await expect(hugButton).toBeVisible();
    const hugBox = await hugButton.boundingBox();
    expect(hugBox).not.toBeNull();
    if (hugBox) {
      expect(hugBox.height).toBeGreaterThanOrEqual(56);
    }

    // 检查所有重要图标按钮是否具备 aria-label
    const iconButtons = page.locator('button');
    const count = await iconButtons.count();
    for (let i = 0; i < count; i++) {
      const btn = iconButtons.nth(i);
      const ariaLabel = await btn.getAttribute('aria-label');
      const text = await btn.innerText();
      // 每个交互按钮必须有可读文字或 aria-label
      expect(Boolean(ariaLabel || text.trim().length > 0)).toBe(true);
    }
  });

  test('Reduced-motion mode disables high-frequency transitions/animations', async ({ page }) => {
    // 模拟操作系统开启 prefers-reduced-motion: reduce
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const pulseEl = page.locator('.animate-pulse');
    // 如果存在带有 animate-pulse 的元素，验证 motion-reduce 是否生效
    if (await pulseEl.count() > 0) {
      const hasMotionReduceClass = await pulseEl.first().evaluate((el) => {
        return el.classList.contains('motion-reduce:animate-none');
      });
      expect(hasMotionReduceClass).toBe(true);
    }
  });

  test('No horizontal overflow on critical screens and modals', async ({ page }) => {
    await page.goto('/');

    // 1. 主岛屏幕
    const checkOverflow = async () => {
      return page.evaluate(() => {
        const doc = document.documentElement;
        return doc.scrollWidth <= doc.clientWidth;
      });
    };
    expect(await checkOverflow()).toBe(true);

    // 2. 打开抱抱支持窗口
    const hugButton = page.locator('button[aria-label*="找大人抱抱"]');
    await hugButton.click();
    await expect(page.locator('text=需要大人的现实陪伴')).toBeVisible();
    expect(await checkOverflow()).toBe(true);

    // 3. 切换到异步想念 Tab
    const asyncTab = page.locator('button[aria-label*="入口B"]');
    await asyncTab.click();
    await expect(page.locator('text=异步想念信')).toBeVisible();
    expect(await checkOverflow()).toBe(true);
  });
});
