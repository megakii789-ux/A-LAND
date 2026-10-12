# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dual-tab-lifecycle.spec.ts >> Dual-Tab Child & Parent Lifecycle E2E Hardening >> Full lifecycle: Child creates hug request -> Parent responds -> Child updates state -> Local confirmed
- Location: tests/e2e/dual-tab-lifecycle.spec.ts:22:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=提醒已送达').or(locator('text=等待大人查看'))
Expected: visible
Error: strict mode violation: locator('text=提醒已送达').or(locator('text=等待大人查看')) resolved to 2 elements:
    1) <div class="text-sm sm:text-base text-rose-50 font-medium truncate">提醒已送达 · 等待大人查看</div> aka getByRole('button', { name: '找大人抱抱与想念入口：点击打开求助与想念窗口' })
    2) <span class="text-xs font-bold text-rose-800 bg-rose-100 px-3 py-1 rounded-full">提醒已送达 · 等待大人查看</span> aka getByRole('dialog', { name: '找大人支持与想念' }).getByText('提醒已送达 · 等待大人查看')

Call log:
  - Expect "toBeVisible" locator('text=提醒已送达').or(locator('text=等待大人查看')) with timeout 5000ms
  - waiting for locator('text=提醒已送达').or(locator('text=等待大人查看'))

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - generic [ref=e7]: 🏝️
        - generic [ref=e8]:
          - generic [ref=e9]:
            - generic [ref=e10]: 晴雨小岛
            - generic [ref=e11]: 儿童思考方法成长空间
          - paragraph [ref=e12]: 退后一步，看清事实、理解他人、自己做选择
      - generic [ref=e13]:
        - button "静音" [ref=e14] [cursor=pointer]
        - button "Google 云端硬盘备份" [ref=e19] [cursor=pointer]:
          - generic [ref=e22]: 云端备份
        - button "产品框架说明" [ref=e23] [cursor=pointer]
        - button "进入家长教练端" [ref=e27] [cursor=pointer]:
          - generic [ref=e32]: 家长教练端
  - main [ref=e33]:
    - generic [ref=e34]:
      - generic [ref=e35]:
        - generic [ref=e36]:
          - generic [ref=e37]:
            - button "伴伴伙伴：点击朗读问候语" [ref=e38] [cursor=pointer]:
              - generic [ref=e39]: 🦉
            - generic [ref=e45]:
              - generic [ref=e46]:
                - heading "伴伴在身边" [level=2] [ref=e47]
                - generic [ref=e48]: 一直陪你
              - paragraph [ref=e49]: 你好呀！今天我们一起在小岛上探索新办法。
          - button "听伴伴问候" [ref=e50] [cursor=pointer]
        - button "进入绿草平静角：深呼吸，放松一会儿" [ref=e55] [cursor=pointer]:
          - generic [ref=e62]:
            - generic [ref=e63]:
              - heading "绿草平静角" [level=3] [ref=e64]
              - generic [ref=e65]: 随时可进
            - paragraph [ref=e66]: 深呼吸，吹泡泡，让身体和心情舒服一下
          - generic [ref=e67]:
            - button "听一听平静角介绍" [ref=e68]
            - generic [ref=e73]:
              - generic [ref=e74]: 去休息
              - generic [ref=e75]: 🍃
        - button "打开晴雨印记馆" [ref=e77] [cursor=pointer]:
          - generic [ref=e78]: 晴雨印记
          - generic [ref=e79]: 1☀️ 1💧
      - generic [ref=e80]:
        - generic [ref=e81]:
          - heading "你想先去哪儿玩？" [level=1] [ref=e82]
          - paragraph [ref=e83]: 动动手就能玩，没有失败，也没有对错打分
        - generic [ref=e84]:
          - button "进入情绪天气站：看今天头顶的天气与身体感觉" [ref=e85] [cursor=pointer]:
            - generic [ref=e86]:
              - generic [ref=e87]:
                - generic [ref=e88]: ⛅
                - button "听一听情绪天气站的介绍" [ref=e90]
              - heading "情绪天气站" [level=3] [ref=e95]
              - paragraph [ref=e96]: 看今天头顶的天气与身体感觉
            - generic [ref=e97]:
              - generic [ref=e98]: 进去玩
              - generic [ref=e99]: 👉
          - button "进入故事林：走一圈、想一想，探索生活小故事" [ref=e100] [cursor=pointer]:
            - generic [ref=e101]:
              - generic [ref=e102]:
                - generic [ref=e103]: 📖
                - button "听一听故事林的介绍" [ref=e105]
              - heading "故事林" [level=3] [ref=e110]
              - paragraph [ref=e111]: 走一圈、想一想，探索生活小故事
            - generic [ref=e112]:
              - generic [ref=e113]: 进去玩
              - generic [ref=e114]: 👉
          - button "进入想法侦探社：用放大镜找线索，试试新想法" [ref=e115] [cursor=pointer]:
            - generic [ref=e116]:
              - generic [ref=e117]:
                - generic [ref=e118]: 🔍
                - button "听一听想法侦探社的介绍" [ref=e120]
              - heading "想法侦探社" [level=3] [ref=e125]
              - paragraph [ref=e126]: 用放大镜找线索，试试新想法
            - generic [ref=e127]:
              - generic [ref=e128]: 进去玩
              - generic [ref=e129]: 👉
          - button "进入勇气说话屋：学会把心里话好好告诉大人" [ref=e130] [cursor=pointer]:
            - generic [ref=e131]:
              - generic [ref=e132]:
                - generic [ref=e133]: 💬
                - button "听一听勇气说话屋的介绍" [ref=e135]
              - heading "勇气说话屋" [level=3] [ref=e140]
              - paragraph [ref=e141]: 学会把心里话好好告诉大人
            - generic [ref=e142]:
              - generic [ref=e143]: 进去玩
              - generic [ref=e144]: 👉
          - button "进入两个家的桥：看交接日历、收拾小书包与想念" [ref=e145] [cursor=pointer]:
            - generic [ref=e146]:
              - generic [ref=e147]:
                - generic [ref=e148]: 🌉
                - button "听一听两个家的桥的介绍" [ref=e150]
              - heading "两个家的桥" [level=3] [ref=e155]
              - paragraph [ref=e156]: 看交接日历、收拾小书包与想念
            - generic [ref=e157]:
              - generic [ref=e158]: 进去玩
              - generic [ref=e159]: 👉
          - button "进入星光小屋：点亮你的独特爱好与强项拼图" [ref=e160] [cursor=pointer]:
            - generic [ref=e161]:
              - generic [ref=e162]:
                - generic [ref=e163]: ⭐
                - button "听一听星光小屋的介绍" [ref=e165]
              - heading "星光小屋" [level=3] [ref=e170]
              - paragraph [ref=e171]: 点亮你的独特爱好与强项拼图
            - generic [ref=e172]:
              - generic [ref=e173]: 进去玩
              - generic [ref=e174]: 👉
        - button "打开大困难变小魔法拆解台" [ref=e176] [cursor=pointer]:
          - generic [ref=e177]:
            - generic [ref=e178]: 🔨
            - generic [ref=e179]:
              - generic [ref=e180]:
                - heading "大石头变小魔法拆解台" [level=3] [ref=e181]
                - generic [ref=e182]: 小步走
              - paragraph [ref=e183]: 把沉重的大问题，拆成 3 个容易迈出的小踏脚石
          - generic [ref=e184]:
            - generic [ref=e185]: 去拆解
            - generic [ref=e186]: 👉
      - generic [ref=e187]:
        - generic [ref=e188]:
          - paragraph [ref=e189]: 🌱 随时可以停下来休息，或者找大人抱一抱！
          - paragraph [ref=e190]: 没有倒计时 · 没有分数 · 身边总有大人在
        - generic [ref=e192]:
          - button "找大人抱抱与想念入口：点击打开求助与想念窗口" [ref=e193] [cursor=pointer]:
            - generic [ref=e198]:
              - generic [ref=e199]: 找大人抱抱
              - generic [ref=e204]: 提醒已送达 · 等待大人查看
          - dialog "找大人支持与想念" [ref=e210]:
            - generic [ref=e211]:
              - button "暂时关闭窗口，回小岛自由玩" [ref=e212] [cursor=pointer]
              - generic [ref=e216]:
                - button "入口A：我现在需要大人" [ref=e217] [cursor=pointer]:
                  - generic [ref=e220]: 我现在需要大人
                - button "入口B：我想告诉 Ta 我想 Ta 了" [ref=e221] [cursor=pointer]:
                  - generic [ref=e225]: 我想告诉 Ta
              - generic [ref=e226]:
                - generic [ref=e227]: 你想告诉谁：
                - generic [ref=e228]:
                  - button "妈妈" [ref=e229] [cursor=pointer]
                  - button "爸爸" [ref=e230] [cursor=pointer]
                  - button "身边的大人" [ref=e231] [cursor=pointer]
              - generic [ref=e233]:
                - generic [ref=e234]:
                  - generic [ref=e235]:
                    - generic [ref=e236]: 提醒已送达 · 等待大人查看
                    - button "朗读当前状态" [ref=e237] [cursor=pointer]
                  - paragraph [ref=e242]: “消息已送达服务器，提醒已经发出，妈妈还没有打开看。你可以先做深呼吸。”
                  - generic [ref=e243]:
                    - generic [ref=e244]: 🌱
                    - generic [ref=e245]: 温和行动：深呼吸 3 次，或者找身边能看到的大人
                - button "有人来陪我了，结束求助" [ref=e246] [cursor=pointer]:
                  - generic [ref=e250]: 有人来陪我了（结束本次提醒）
                - generic [ref=e251]:
                  - generic [ref=e252]: 切换客观状态测试：
                  - generic [ref=e253]:
                    - button "1. 发送故障" [ref=e254] [cursor=pointer]
                    - button "2. 已达中继未看" [ref=e255] [cursor=pointer]
                    - button "3. 大人已看未指派" [ref=e256] [cursor=pointer]
                    - button "4. 承诺前来未确认" [ref=e257] [cursor=pointer]
                    - button "5. 委托他人未确认" [ref=e258] [cursor=pointer]
                    - button "6. 大人暂时抽不开身" [ref=e259] [cursor=pointer]
              - generic [ref=e260]:
                - generic [ref=e261]:
                  - button "去平静角深呼吸" [ref=e262] [cursor=pointer]
                  - button "找身边能看到的大人" [ref=e268] [cursor=pointer]:
                    - generic [ref=e274]: 找身边看得见的大人
                - button "离开屏幕，回小岛玩去（随时点我重新打开）" [ref=e275] [cursor=pointer]
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
> 49  |     await expect(childPage.locator('text=提醒已送达').or(childPage.locator('text=等待大人查看'))).toBeVisible();
      |                                                                                        ^ Error: expect(locator).toBeVisible() failed
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
  98  |     await page.goto('/');
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