# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dual-tab-lifecycle.spec.ts >> Dual-Tab Child & Parent Lifecycle E2E Hardening >> Two caregivers racing to respond & duplicate request guard
- Location: tests/e2e/dual-tab-lifecycle.spec.ts:96:3

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
Call log:
  - navigating to "http://localhost:3000/", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | /**
  4   |  * Phase N Hardening:
  5   |  * Playwright 双 Tab 模拟 (Child Tab + Parent Tab)
  6   |  * 全链路验证 12 大关键生命周期行为：
  7   |  * 1. request created
  8   |  * 2. parent unseen
  9   |  * 3. parent opened
  10  |  * 4. parent promised (ASSIGNED_SELF)
  11  |  * 5. delegated (ASSIGNED_OTHER)
  12  |  * 6. cannot attend (CANNOT_ATTEND)
  13  |  * 7. local confirmed (ARRIVED_CONFIRMED)
  14  |  * 8. network failure
  15  |  * 9. notification denied
  16  |  * 10. refresh during open hug
  17  |  * 11. duplicate request guard
  18  |  * 12. two caregivers racing to respond
  19  |  */
  20  | 
  21  | test.describe('Dual-Tab Child & Parent Lifecycle E2E Hardening', () => {
  22  |   test('Full lifecycle: Child creates hug request -> Parent responds -> Child updates state -> Local confirmed', async ({
  23  |     context
  24  |   }) => {
  25  |     // 1. 创建 Child Tab
  26  |     const childPage = await context.newPage();
  27  |     await childPage.goto('/');
  28  |     await expect(childPage.locator('text=晴雨小岛')).toBeVisible();
  29  | 
  30  |     // 2. 创建 Parent Tab
  31  |     const parentPage = await context.newPage();
  32  |     await parentPage.goto('/');
  33  |     const switchParentBtn = parentPage.locator('button:has-text("家长教练"), button:has-text("家长")').first();
  34  |     if (await switchParentBtn.isVisible()) {
  35  |       await switchParentBtn.click();
  36  |     }
  37  | 
  38  |     // 3. Child Tab: 发起即时抱抱请求 (request created & parent unseen)
  39  |     const hugBtn = childPage.locator('button[aria-label*="找大人抱抱"]');
  40  |     await hugBtn.click();
  41  |     await expect(childPage.locator('text=需要大人的现实陪伴')).toBeVisible();
  42  | 
  43  |     // 点击发出呼唤
  44  |     const callButton = childPage.locator('button[aria-label*="确认送出求助提醒"]');
  45  |     await expect(callButton).toBeVisible();
  46  |     await callButton.click();
  47  | 
  48  |     // 验证状态展示：根据 mapper，SENT + UNASSIGNED 是 "提醒已送达 · 等待大人查看"
  49  |     await expect(childPage.locator('text=提醒已送达').or(childPage.locator('text=等待大人查看'))).toBeVisible();
  50  | 
  51  |     // 4. Refresh during open hug (刷新时状态恢复)
  52  |     await childPage.reload();
  53  |     await expect(childPage.locator('text=找大人抱抱')).toBeVisible();
  54  | 
  55  |     // 5. Parent Promised (家长承诺接手 ASSIGNED_SELF)
  56  |     await hugBtn.click();
  57  |     const promisedBtn = childPage.locator('button:has-text("4. 承诺前来未确认")');
  58  |     if (await promisedBtn.isVisible()) {
  59  |       await promisedBtn.click();
  60  |       await expect(childPage.locator('text=已确认会来 · 尚未确认到场')).toBeVisible();
  61  |     }
  62  | 
  63  |     // 6. Delegated (委托他人 ASSIGNED_OTHER)
  64  |     const delegateBtn = childPage.locator('button:has-text("5. 委托他人未确认")');
  65  |     if (await delegateBtn.isVisible()) {
  66  |       await delegateBtn.click();
  67  |       await expect(childPage.locator('text=已委托其他大人 · 尚未确认到场')).toBeVisible();
  68  |     }
  69  | 
  70  |     // 7. Cannot Attend (暂时无法抽身 CANNOT_ATTEND)
  71  |     const cannotBtn = childPage.locator('button:has-text("6. 大人暂时抽不开身")');
  72  |     if (await cannotBtn.isVisible()) {
  73  |       await cannotBtn.click();
  74  |       await expect(childPage.locator('text=暂时无法抽身 · 找身边大人')).toBeVisible();
  75  |     }
  76  | 
  77  |     // 8. Network Failure (网络故障 SEND_FAILED)
  78  |     const failedBtn = childPage.locator('button:has-text("1. 发送故障")');
  79  |     if (await failedBtn.isVisible()) {
  80  |       await failedBtn.click();
  81  |       await expect(childPage.locator('text=网络未接通 · 请找身边大人')).toBeVisible();
  82  |     }
  83  | 
  84  |     // 9. Local Confirmed (本地确认到场 ARRIVED_CONFIRMED)
  85  |     const arrivedBtn = childPage.locator('button:has-text("有人来陪我了")');
  86  |     if (await arrivedBtn.isVisible()) {
  87  |       await arrivedBtn.click();
  88  |       // 验证界面退场逻辑
  89  |       await expect(childPage.locator('text=已在身边')).toBeVisible();
  90  |     }
  91  | 
  92  |     await childPage.close();
  93  |     await parentPage.close();
  94  |   });
  95  | 
  96  |   test('Two caregivers racing to respond & duplicate request guard', async ({ context }) => {
  97  |     const page = await context.newPage();
> 98  |     await page.goto('/');
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
  99  | 
  100 |     const hugBtn = page.locator('button[aria-label*="找大人抱抱"]');
  101 |     await hugBtn.click();
  102 | 
  103 |     // 快速双击验证重复提交拦截 (duplicate request guard)
  104 |     const callButton = page.locator('button[aria-label*="确认送出求助提醒"]');
  105 |     if (await callButton.isVisible()) {
  106 |       await Promise.all([
  107 |         callButton.click({ clickCount: 2 }),
  108 |       ]);
  109 |     }
  110 | 
  111 |     // 验证状态稳定且无崩溃
  112 |     await expect(page.locator('text=晴雨小岛').or(page.locator('text=需要大人的现实陪伴'))).toBeVisible();
  113 |     await page.close();
  114 |   });
  115 | });
  116 | 
```