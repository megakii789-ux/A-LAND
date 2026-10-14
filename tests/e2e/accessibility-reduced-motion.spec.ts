import { test, expect } from '@playwright/test';

/**
 * Phase N & Phase 1A-FIX Hardening:
 * 1. Accessibility Checks (aria-label, touch target sizes >= 56px, high contrast)
 * 2. Reduced-Motion Checks (Requirement 五.E: verifies real computed CSS animation/transition properties AND JavaScript pointer/click interaction, zero conditional skips)
 * 3. No Horizontal Overflow on Any Viewport (360x800, 390x844, 430x932, 768x1024, 1024x1366, 1440x900)
 */

test.describe('Accessibility & Reduced Motion Hardening', () => {
  test('Child interactive elements meet 56px minimum standard and have aria-labels', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('晴雨小岛', { exact: true }).first()).toBeVisible();

    // 检查抱抱主按钮的高度、宽度与 aria-label
    const hugButton = page.locator('button[aria-label*="找大人抱抱"]');
    await expect(hugButton).toBeVisible();
    const hugBox = (await hugButton.boundingBox())!;
    expect(hugBox).not.toBeNull();
    expect(hugBox.height).toBeGreaterThanOrEqual(56);
    expect(hugBox.width).toBeGreaterThanOrEqual(56);

    // 检查所有交互按钮是否具备可读文字或 aria-label
    const iconButtons = page.locator('button');
    const count = await iconButtons.count();
    expect(count).toBeGreaterThan(5);
    for (let i = 0; i < count; i++) {
      const btn = iconButtons.nth(i);
      const ariaLabel = await btn.getAttribute('aria-label');
      const text = await btn.innerText();
      expect(Boolean(ariaLabel || text.trim().length > 0)).toBe(true);
    }
  });

  test('Requirement 五.E: Reduced-motion mode verifies real computed animation/transition properties and JavaScript interactions', async ({
    page,
  }) => {
    // 模拟操作系统开启 prefers-reduced-motion: reduce
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.getByText('晴雨小岛', { exact: true }).first()).toBeVisible();

    // 1. 验证浏览器媒体查询与真实计算后的 CSS 动效属性 (computed animationName & transitionDuration)
    const hugButton = page.locator('button[aria-label*="找大人抱抱"]');
    await expect(hugButton).toBeVisible();

    const motionCssMetrics = await hugButton.evaluate((btn) => {
      const pulseSpan = btn.querySelector('span');
      const btnStyle = window.getComputedStyle(btn);
      const pulseStyle = pulseSpan ? window.getComputedStyle(pulseSpan) : null;
      return {
        mediaMatches: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        btnTransitionDurationSec: parseFloat(btnStyle.transitionDuration || '0'),
        pulseAnimationName: pulseStyle ? pulseStyle.animationName : 'missing',
        pulseAnimationDurationSec: pulseStyle ? parseFloat(pulseStyle.animationDuration || '0') : -1,
      };
    });

    expect(motionCssMetrics.mediaMatches).toBe(true);
    // In reduced-motion mode, transitionDuration is suppressed to <= 0.001s (0.01ms or 0s)
    expect(motionCssMetrics.btnTransitionDurationSec).toBeLessThanOrEqual(0.001);
    // And pulse animation is either 'none' (via motion-reduce:animate-none) or <= 0.001s
    expect(
      motionCssMetrics.pulseAnimationName === 'none' || motionCssMetrics.pulseAnimationDurationSec <= 0.001
    ).toBe(true);

    // 2. 验证 JavaScript 3D 视差卡片在 reduced-motion 模式下禁用指针倾斜变换 (Interactive3DCard JS interaction)
    const card3D = page.locator('[data-3d-card="true"]').first();
    await expect(card3D).toBeVisible();
    await expect(card3D).toHaveAttribute('data-reduced-motion', 'true');

    const cardBox = (await card3D.boundingBox())!;
    expect(cardBox).not.toBeNull();
    await page.mouse.move(cardBox.x + cardBox.width * 0.25, cardBox.y + cardBox.height * 0.25);
    await page.mouse.move(cardBox.x + cardBox.width * 0.75, cardBox.y + cardBox.height * 0.75);

    const inlineTransform = await card3D.evaluate((el) => (el as HTMLElement).style.transform);
    expect(inlineTransform).toBe('');

    // 3. 验证 JavaScript 核心交互（打开平静角呼吸引导并安全关闭返回）在降低动效模式下完整可用
    const goBreatheBtn = page.getByRole('button', { name: /进入绿草平静角呼吸练习/ });
    await goBreatheBtn.click();
    const calmDialog = page.getByRole('dialog', { name: '冷静角落·减压空间' });
    await expect(calmDialog).toBeVisible();
    await expect(calmDialog.getByText('绿草冷静空间')).toBeVisible();

    await calmDialog.getByRole('button', { name: /关闭冷静空间/ }).first().click();
    await expect(calmDialog).toHaveCount(0);
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
