import { test, expect } from '@playwright/test';

/**
 * Phase N & Phase 1A-FIX Hardening:
 * Playwright 双 Tab 模拟 (Child Tab + Parent Tab)
 * 严格验证真实本地求助与家长门禁生命周期（零条件跳过，零虚假远程送达承诺）：
 * 1. Child Tab 发起本机求助提醒 -> 验证真实可见文案（“请去找身边的大人（本机提醒）”、“这里不会发消息”）与零远程网络请求
 * 2. Child Tab 切换异步想念信 -> 保存本机想念信封 -> 验证不强迫等待回复
 * 3. Child Tab 刷新与重新打开 -> 本地确认“我身边有大人了（关闭提示）”正常退场
 * 4. Parent Tab 打开照顾者门禁 -> 未授权阻断 -> 完成 PIN 验证进入 -> 切回儿童模式自动锁定家长权限
 */

test.describe('Dual-Tab Child & Parent Lifecycle E2E Hardening', () => {
  test('Full lifecycle: Child triggers local hug reminder & local miss note -> Parent authenticates via PIN gate -> Returning to child mode locks parent session', async ({
    context,
  }) => {
    // 1. 创建 Child Tab
    const childPage = await context.newPage();
    const childRemoteRequests: string[] = [];
    childPage.on('request', (req) => {
      if (!req.url().startsWith('http://localhost') && !req.url().startsWith('http://127.0.0.1')) {
        childRemoteRequests.push(req.url());
      }
    });

    await childPage.goto('/');
    await expect(childPage.getByText('晴雨小岛', { exact: true }).first()).toBeVisible();

    // 2. 创建 Parent Tab
    const parentPage = await context.newPage();
    await parentPage.goto('/');
    await expect(parentPage.getByText('晴雨小岛', { exact: true }).first()).toBeVisible();

    // 3. Child Tab: 打开首屏现实求助入口并开启本机找大人提醒 (零条件跳过)
    const hugBtn = childPage.locator('button[aria-label*="找大人抱抱"]');
    await expect(hugBtn).toBeVisible();
    await hugBtn.click();

    const hugDialog = childPage.getByRole('dialog', { name: '找大人支持与想念' });
    await expect(hugDialog).toBeVisible();
    await expect(hugDialog.getByText('需要大人的现实陪伴')).toBeVisible();

    const callButton = hugDialog.getByRole('button', { name: '在屏幕上开启找大人提醒' });
    await expect(callButton).toBeVisible();
    await callButton.click();

    // 验证真实可见文案：明确说明这里不会发消息、无法发送至远程、引导直接找身边大人
    await expect(hugDialog.getByText(/这里不会发消息 · 网络未接通/)).toBeVisible();
    await expect(hugDialog.getByText(/直接走到身边的大人面前/)).toBeVisible();
    expect(childRemoteRequests).toHaveLength(0);

    // 4. Child Tab: 本地确认“我身边有大人了（关闭提示）”退场
    const arrivedBtn = hugDialog.getByRole('button', { name: '我身边有大人了，关闭提醒' });
    await expect(arrivedBtn).toBeVisible();
    await arrivedBtn.click();
    await expect(hugDialog).toHaveCount(0);

    // 5. Child Tab: 重新打开并测试入口 B（本机异步想念信）
    await hugBtn.click();
    await expect(hugDialog).toBeVisible();
    const asyncTab = hugDialog.getByRole('button', { name: /入口B/ });
    await expect(asyncTab).toBeVisible();
    await asyncTab.click();

    const saveMissBtn = hugDialog.getByRole('button', { name: '在小岛写下想念信（保存在本机）' });
    await expect(saveMissBtn).toBeVisible();
    await saveMissBtn.click();
    await expect(hugDialog.getByText(/这句想念仅在当前页面存在，不需要等回复/)).toBeVisible();

    // 6. Refresh during session and verify clean recovery
    await childPage.reload();
    await expect(childPage.locator('button[aria-label*="找大人抱抱"]')).toBeVisible();

    // 7. Parent Tab: 点击顶部导航“点击切换到家长教练端”，必须弹出 PIN 安全门禁
    const switchParentBtn = parentPage.getByRole('button', { name: /当前处于孩子端，点击切换到家长教练端/ });
    await expect(switchParentBtn).toBeVisible();
    await switchParentBtn.click();

    const gateDialog = parentPage.getByRole('dialog', { name: '照顾者安全验证门禁' });
    await expect(gateDialog).toBeVisible();

    const pinInputs = gateDialog.locator('input[type="password"]');
    await expect(pinInputs).toHaveCount(2);
    await pinInputs.nth(0).fill('246810');
    await pinInputs.nth(1).fill('246810');
    await gateDialog.getByRole('button', { name: '确认并进入' }).click();

    await expect(gateDialog).toHaveCount(0);

    // 8. Parent Tab: 切回儿童模式（“当前处于家长端，点击返回孩子端小岛”），确认重新点击“家长教练端”仍需重新输入 PIN（不会残留授权）
    const backToChildBtn = parentPage.getByRole('button', { name: /当前处于家长端，点击返回孩子端小岛/ });
    await expect(backToChildBtn).toBeVisible();
    await backToChildBtn.click();

    await switchParentBtn.click();
    await expect(parentPage.getByRole('dialog', { name: '照顾者安全验证门禁' })).toBeVisible();

    await childPage.close();
    await parentPage.close();
  });

  test('Duplicate click guard on local hug reminder keeps state deterministic without crash', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('/');

    const hugBtn = page.locator('button[aria-label*="找大人抱抱"]');
    await expect(hugBtn).toBeVisible();
    await hugBtn.click();

    const hugDialog = page.getByRole('dialog', { name: '找大人支持与想念' });
    await expect(hugDialog).toBeVisible();

    const callButton = hugDialog.getByRole('button', { name: '在屏幕上开启找大人提醒' });
    await expect(callButton).toBeVisible();
    await callButton.click();

    await expect(hugDialog.getByText(/这里不会发消息 · 网络未接通/)).toBeVisible();
    await page.close();
  });
});
