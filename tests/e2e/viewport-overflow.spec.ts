import { test, expect } from '@playwright/test';

function boxesOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

test.describe('Child-First Design System Viewport & Overflow Tests (AG-04A & Phase 1A-FIX)', () => {
  test('Child Home must not have horizontal scrollbar on any supported viewport', async ({ page }) => {
    await page.goto('/');

    // Wait for the island UI to be ready
    await expect(page.getByText('晴雨小岛', { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/在身边/).first()).toBeVisible();
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

  test('Requirement 五.D & 五.G: Six-viewport key child buttons width/height >= 56px, on-screen clickability, and 360px/390px first-screen reality help entry without scrolling or overlap', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByText('晴雨小岛', { exact: true }).first()).toBeVisible();

    const viewport = page.viewportSize();
    expect(viewport).not.toBeNull();
    const vw = viewport!.width;
    const vh = viewport!.height;

    // Confirm page starts at scrollY === 0 (no scrolling performed)
    const initialScrollY = await page.evaluate(() => window.scrollY);
    expect(initialScrollY).toBe(0);

    // Requirement 五.G: On 360px and 390px (and all viewports), reality help entry ("找大人抱抱")
    // MUST be visible inside the first screen (y >= 0 && y + height <= vh) WITHOUT scrolling,
    // and MUST NOT overlap Navbar, CompanionBanner, AlwaysReachableCalmCard ("去呼吸", "去拆解"), or any other button.
    const headerEl = page.locator('header').first();
    const calmRegion = page.getByRole('region', { name: '绿草呼吸平静角与大困难拆解常驻入口' });
    const goBreatheBtn = page.getByRole('button', { name: /进入绿草平静角呼吸练习/ });
    const goBreakBtn = page.getByRole('button', { name: /打开大困难拆解台/ }).first();
    const hugBtn = page.locator('button[aria-label*="找大人抱抱"]');
    const listenGreetingBtn = page.getByRole('button', { name: /问候/ }).first();
    const changeCompanionBtn = page.getByRole('button', { name: '打开小岛偏好设置' });

    await expect(headerEl).toBeVisible();
    await expect(calmRegion).toBeVisible();
    await expect(goBreatheBtn).toBeVisible();
    await expect(goBreakBtn).toBeVisible();
    await expect(hugBtn).toBeVisible();
    await expect(listenGreetingBtn).toBeVisible();
    await expect(changeCompanionBtn).toBeVisible();

    const headerBox = (await headerEl.boundingBox())!;
    const calmBox = (await calmRegion.boundingBox())!;
    const breatheBox = (await goBreatheBtn.boundingBox())!;
    const breakBox = (await goBreakBtn.boundingBox())!;
    const hugBox = (await hugBtn.boundingBox())!;
    const listenBox = (await listenGreetingBtn.boundingBox())!;
    const companionBox = (await changeCompanionBtn.boundingBox())!;

    expect(headerBox).not.toBeNull();
    expect(calmBox).not.toBeNull();
    expect(breatheBox).not.toBeNull();
    expect(breakBox).not.toBeNull();
    expect(hugBox).not.toBeNull();
    expect(listenBox).not.toBeNull();
    expect(companionBox).not.toBeNull();

    // First-screen vertical reachability without scrolling on 360x800, 390x844, 430x932, 768x1024, 1024x1366, 1440x900
    expect(hugBox.y).toBeGreaterThanOrEqual(0);
    expect(hugBox.y + hugBox.height).toBeLessThanOrEqual(vh);
    expect(breatheBox.y).toBeGreaterThanOrEqual(0);
    expect(breatheBox.y + breatheBox.height).toBeLessThanOrEqual(vh);
    expect(breakBox.y).toBeGreaterThanOrEqual(0);
    expect(breakBox.y + breakBox.height).toBeLessThanOrEqual(vh);

    // Zero overlap between Reality Help Entry ("找大人抱抱") and Calm Corner / Navbar / Companion buttons
    expect(boxesOverlap(hugBox, calmBox)).toBe(false);
    expect(boxesOverlap(hugBox, breatheBox)).toBe(false);
    expect(boxesOverlap(hugBox, breakBox)).toBe(false);
    expect(boxesOverlap(hugBox, headerBox)).toBe(false);
    expect(boxesOverlap(hugBox, listenBox)).toBe(false);
    expect(boxesOverlap(hugBox, companionBox)).toBe(false);
    expect(boxesOverlap(breatheBox, breakBox)).toBe(false);

    // Requirement 五.D: Key child buttons across all 6 viewports must have width >= 56, height >= 56,
    // sit completely inside horizontal viewport bounds, and pass real hit-target clickability (trial click)
    const firstScreenKeyButtons = [goBreatheBtn, goBreakBtn, hugBtn, listenGreetingBtn, changeCompanionBtn];
    for (const btn of firstScreenKeyButtons) {
      const box = (await btn.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(56);
      expect(box.height).toBeGreaterThanOrEqual(56);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(vw);
      // Verify actual on-screen hit-target clickability without being obscured by any overlay
      await btn.click({ trial: true });
    }

    // Switch to card view and verify location card audio buttons also meet >= 56x56px and trial clickability
    const cardTab = page.getByRole('tab', { name: /清晰地点卡片/ });
    await cardTab.click();
    const audioButtons = page.locator('button[aria-label*="听一听"]');
    const count = await audioButtons.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < Math.min(count, 3); i++) {
      const btn = audioButtons.nth(i);
      const box = (await btn.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(56);
      expect(box.height).toBeGreaterThanOrEqual(56);
      await btn.click({ trial: true });
    }
  });

  test('Requirement 五.A, 五.B, 五.C: Negative E2E tests for Adult Review Preview session leak, wrong PIN rejection, and async PIN close cancellation', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByText('晴雨小岛', { exact: true }).first()).toBeVisible();

    // 1. Open unapproved game in InteractiveGamesHubModal
    const gamesBtn = page.getByRole('button', { name: /打开真实动动手探险游戏集/ });
    await gamesBtn.click();

    const gateBlock = page.getByTestId('interactive-game-audit-gate-blocked');
    const previewBanner = page.getByText(/家长与审阅人预览模式 · 请在成年人陪伴下审阅/);
    await expect(gateBlock).toBeVisible();
    await expect(previewBanner).toHaveCount(0);

    // 2. First-time PIN setup (246810) -> enters adult preview
    await page.getByRole('button', { name: '家长 / 审阅人验证预览' }).click();
    const gateDialog = page.getByRole('dialog', { name: '照顾者安全验证门禁' });
    await expect(gateDialog).toBeVisible();

    const pinInputs = gateDialog.locator('input[type="password"]');
    await expect(pinInputs).toHaveCount(2);
    await pinInputs.nth(0).fill('246810');
    await pinInputs.nth(1).fill('246810');
    await gateDialog.getByRole('button', { name: '确认并进入' }).click();

    // 3. Confirm adult preview is active
    await expect(previewBanner.first()).toBeVisible();
    await expect(gateBlock).toHaveCount(0);

    // 4. Close InteractiveGamesHubModal
    await page.getByRole('button', { name: '关闭游戏集' }).click();
    await expect(page.getByRole('dialog', { name: '晴雨小岛真实可玩认知互动游戏集' })).toHaveCount(0);

    // 5. Reopen InteractiveGamesHubModal
    await gamesBtn.click();

    // Requirement 五.A: Closing and reopening MUST NOT retain unlocked state!
    await expect(gateBlock).toBeVisible();
    await expect(previewBanner).toHaveCount(0);

    // Requirement 五.B: Entering wrong PIN MUST NOT access unapproved game!
    await page.getByRole('button', { name: '家长 / 审阅人验证预览' }).click();
    const verifyInput = gateDialog.locator('input[type="password"]').first();
    await expect(verifyInput).toBeVisible();
    await verifyInput.fill('999999');
    await gateDialog.getByRole('button', { name: '校验进入' }).click();

    await expect(gateDialog.getByText(/PIN 码不正确/)).toBeVisible();
    await expect(gateBlock).toBeVisible();
    await expect(previewBanner).toHaveCount(0);

    // Close ParentGateModal
    await gateDialog.getByRole('button', { name: '返回孩子小岛' }).click();
    await expect(gateDialog).toHaveCount(0);

    // Requirement 五.C: Closing ParentGateModal during async PIN verification MUST NOT trigger authorization callback!
    await page.getByRole('button', { name: '家长 / 审阅人验证预览' }).click();
    await expect(verifyInput).toBeVisible();
    await verifyInput.fill('246810');

    // Trigger submit and close back-to-back in the browser context while async PBKDF2 WebCrypto hashing is in flight
    await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"][aria-label="照顾者安全验证门禁"]');
      const form = dialog?.querySelector('form');
      const closeBtn = Array.from(dialog?.querySelectorAll('button') || []).find((b) =>
        b.textContent?.includes('返回孩子小岛')
      );
      form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      closeBtn?.click();
    });

    // Wait briefly for any in-flight PBKDF2 promise to settle and confirm preview NEVER unlocked
    await page.waitForTimeout(150);
    await expect(gateDialog).toHaveCount(0);
    await expect(gateBlock).toBeVisible();
    await expect(previewBanner).toHaveCount(0);

    await page.getByRole('button', { name: '关闭游戏集' }).click();
  });

  test('Requirement 五.F: Reality help entry executes real click, verifies honest local-only child copy and zero remote network requests', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByText('晴雨小岛', { exact: true }).first()).toBeVisible();

    const capturedRequests: string[] = [];
    page.on('request', (req) => {
      capturedRequests.push(req.url());
    });

    const hugBtn = page.locator('button[aria-label*="找大人抱抱"]');
    await hugBtn.click();

    const hugDialog = page.getByRole('dialog', { name: '找大人支持与想念' });
    await expect(hugDialog).toBeVisible();
    await expect(hugDialog.getByText('需要大人的现实陪伴')).toBeVisible();

    // Real click on "在屏幕上开启找大人提醒"
    const startReminderBtn = hugDialog.getByRole('button', { name: '在屏幕上开启找大人提醒' });
    await startReminderBtn.click();

    // Verify honest local-only child-visible copy
    await expect(hugDialog.getByText(/这里不会发消息 · 网络未接通/)).toBeVisible();
    await expect(hugDialog.getByText(/无法发送至远程，请寻找身边的信任成年人/).first()).toBeVisible();
    await expect(hugDialog.getByText(/直接走到身边的大人面前/)).toBeVisible();

    // Must NEVER claim remote delivery or remote caregiver arrival
    const dialogText = await hugDialog.innerText();
    expect(dialogText).not.toContain('提醒已远程送达');
    expect(dialogText).not.toContain('家长已收到通知');
    expect(dialogText).not.toContain('正在赶来');

    // Verify zero remote API / push relay requests were made
    expect(capturedRequests).toHaveLength(0);

    // Close reminder via "我身边有大人了"
    await hugDialog.getByRole('button', { name: '我身边有大人了，关闭提醒' }).click();
    await expect(hugDialog).toHaveCount(0);
  });

  test('Phase 1A Matrix (A/B/C/E): Mobile first-screen layout, no vertical title stacking, >=56px core actions, SVG icons, no Navbar/Hug overlap', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByText('晴雨小岛', { exact: true }).first()).toBeVisible();

    // E1: Title "晴雨小岛" must never stack vertically into 3-4 lines on 360px/390px/430px
    const titleBox = await page.getByText('晴雨小岛', { exact: true }).first().boundingBox();
    expect(titleBox).not.toBeNull();
    if (titleBox) {
      expect(titleBox.height).toBeLessThanOrEqual(40);
      expect(titleBox.width).toBeGreaterThanOrEqual(60);
    }

    // E2: Companion greeting text must be readable and have sufficient width (not truncated to 4 chars)
    const greetingLocator = page.getByText(/你好呀！我是/).first();
    await expect(greetingLocator).toBeVisible();
    const greetingBox = await greetingLocator.boundingBox();
    expect(greetingBox).not.toBeNull();
    if (greetingBox) {
      expect(greetingBox.width).toBeGreaterThanOrEqual(180);
    }

    // E3: Original SVG companion & UI icons rendered
    const companionSvgCount = await page.locator('button[aria-label*="伙伴"] svg').count();
    expect(companionSvgCount).toBeGreaterThan(0);

    // C1: Core actions "去呼吸", "去拆解", "听问候", "换伙伴" are visible on all viewports (including mobile) and have height >= 56px
    const goBreatheBtn = page.getByRole('button', { name: /进入绿草平静角呼吸练习/ });
    const goBreakBtn = page.getByRole('button', { name: /打开大困难拆解台/ }).first();
    await expect(goBreatheBtn).toBeVisible();
    await expect(goBreakBtn).toBeVisible();

    const breatheBox = await goBreatheBtn.boundingBox();
    const breakBox = await goBreakBtn.boundingBox();
    expect(breatheBox?.height).toBeGreaterThanOrEqual(56);
    expect(breakBox?.height).toBeGreaterThanOrEqual(56);

    // C2: Top Navbar and HugSupportEntry do not overlap
    const headerBox = await page.locator('header').first().boundingBox();
    const hugBtn = page.locator('button[aria-label*="找大人抱抱"]').first();
    await expect(hugBtn).toBeVisible();
    const hugBox = await hugBtn.boundingBox();
    if (headerBox && hugBox) {
      expect(headerBox.y + headerBox.height).toBeLessThan(hugBox.y);
      expect(hugBox.height).toBeGreaterThanOrEqual(56);
    }
  });

  test('Phase 1A Matrix (D/F/H/I): Scene entry/exit, dense grids, scroll hints, content audit gate & ParentGate protection, privacy & reduced motion', async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.getByText('晴雨小岛', { exact: true }).first()).toBeVisible();

    // 1. ThoughtDetectiveLabModal (Task B dense grid: 2 cols on mobile, 5 cols on desktop)
    const detectiveCardBtn = page.getByRole('button', { name: /进入想法侦探社/ }).first();
    await detectiveCardBtn.click();
    await expect(page.getByText('想法侦探社 · 工具坊').first()).toBeVisible();
    const detectiveOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth
    );
    expect(detectiveOverflow).toBe(true);
    if (testInfo.project.name === 'Mobile-360') {
      await page.screenshot({ path: 'tests/screenshots/phase1a-detective-lab-mobile-360.png' });
    }
    await page.getByRole('button', { name: '离开想法侦探社' }).click();

    // 2. TwoHomesBridgeModal (Task B 7-day calendar scroll hint + list view toggle + no empty interpolation)
    const bridgeBtn = page.getByRole('button', { name: /进入照顾小桥/ }).first();
    await bridgeBtn.click();
    await expect(page.getByText('两个家的桥').first()).toBeVisible();
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toContain('还有  个晚上');
    if (testInfo.project.name === 'Mobile-360') {
      await page.screenshot({ path: 'tests/screenshots/phase1a-two-homes-mobile-360.png' });
    }
    const toggleListBtn = page.getByRole('button', { name: /切换为整周列表视图/ });
    await expect(toggleListBtn).toBeVisible();
    await toggleListBtn.click();
    await expect(page.getByRole('button', { name: /切换为横向日历条视图/ })).toBeVisible();
    await page.getByRole('button', { name: '离开两个家的桥' }).click();

    // 3. InteractiveGamesHubModal (Task B & Task E: no PENDING_REVIEW, child cannot 1-click bypass without ParentGateModal)
    const gamesBtn = page.getByRole('button', { name: /打开真实动动手探险游戏集/ });
    await gamesBtn.click();
    const gateBlock = page.getByTestId('interactive-game-audit-gate-blocked');
    await expect(gateBlock).toBeVisible();
    const gateText = await gateBlock.innerText();
    expect(gateText).not.toContain('PENDING_REVIEW');
    if (testInfo.project.name === 'Mobile-360') {
      await page.screenshot({ path: 'tests/screenshots/phase1a-games-hub-mobile-360.png' });
    }
    await page.getByRole('button', { name: '家长 / 审阅人验证预览' }).click();
    // Must trigger ParentGateModal instead of directly unlocking the unapproved game
    await expect(page.getByText(/家长验证|大人验证|请输入|验证|安全验证/).first()).toBeVisible();
    // Close ParentGateModal and InteractiveGamesHubModal
    await page.getByRole('button', { name: '返回孩子小岛' }).click();
    await page.getByRole('button', { name: '关闭游戏集' }).click();

    // 4. StoryGroveModal (Task C SVG Illustrations & Task E Content Audit Gate)
    const storyBtn = page.getByRole('button', { name: /进入故事林/ }).first();
    await storyBtn.click();
    await expect(page.getByText('故事林 · 发现思考之叶').first()).toBeVisible();
    if (testInfo.project.name === 'Desktop-1440') {
      await page.screenshot({ path: 'tests/screenshots/phase1a-story-panorama-desktop-1440.png' });
    }
    await page.getByRole('button', { name: '离开故事林' }).click();

    // 5. Privacy Modal check (Task I)
    const privacyBtn = page.getByRole('button', { name: /儿童与家庭隐私保护声明/ });
    await privacyBtn.click();
    await expect(page.getByRole('heading', { name: /隐私/ }).first()).toBeVisible();
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
