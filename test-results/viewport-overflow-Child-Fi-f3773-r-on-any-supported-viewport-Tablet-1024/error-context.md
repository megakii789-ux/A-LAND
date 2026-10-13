# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: viewport-overflow.spec.ts >> Child-First Design System Viewport & Overflow Tests (AG-04A) >> Child Home must not have horizontal scrollbar on any supported viewport
- Location: tests/e2e/viewport-overflow.spec.ts:4:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('伴伴在身边').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('伴伴在身边').first() with timeout 5000ms
  - waiting for getByText('伴伴在身边').first()

```

```yaml
- banner:
  - img "晴雨小岛 标志": 🏝️
  - text: 晴雨小岛 儿童思考方法成长空间
  - paragraph: 退后一步，看清事实、理解他人、自己做选择
  - navigation "快捷工具栏及端切换":
    - button "伴伴声音正在播放，点击静音"
    - button "数据安全与备份说明，打开数据隐私说明弹窗": 数据说明
    - button "产品设计理念，打开产品核心根叶框架介绍弹窗"
    - button "当前处于孩子端，点击切换到家长教练端": 家长教练端
- main:
  - button "果果伙伴：点击朗读问候语"
  - heading "果果在身边" [level=2]
  - text: 小松鼠 · 一直陪你
  - paragraph: 你好呀！我是果果。我是小松鼠果果，我喜欢收捡森林里的每一片小树叶和秘密线索！
  - button "听果果问候"
  - button "打开小岛偏好设置"
  - text: 伴伴听你说
  - paragraph: 点击任意地点卡片，听伴伴为你朗读
  - button "重新朗读上一段话" [disabled]: 重听
  - button "环境音效已开启，点击静音": 音效开
  - text: 🏝️ 晴雨小岛 · 今天也是安心探索的一天
  - button "进入绿草平静角呼吸练习：跟随圆圈节律呼吸，调节情绪与放松身体":
    - heading "绿草呼吸平静角" [level=3]
    - text: 呼吸引导
    - paragraph: 跟随圆圈慢慢吸气与呼气，给心情留一个安静的角落
    - button "听一听平静角介绍"
    - text: 去呼吸 🌬️
  - tablist "选择小岛展示方式":
    - tab "🗺️ 童话小岛地图" [selected]
    - tab "📋 清晰地点卡片"
  - button "打开小岛偏好与无障碍设置": 🌿 偏好
  - button "打开晴雨印记馆": 晴雨印记 1☀️ 1💧
  - heading "你想先去哪儿玩？" [level=1]
  - paragraph: 动动手就能玩，没有失败，也没有对错打分
  - text: 🎮
  - heading "真实动动手探险游戏" [level=2]
  - text: 真实交互
  - paragraph: 《蜡笔侦探》(放大镜探索) · 《问起我的家》(边界防护) · 《小船协商》(利弊权衡)
  - button "立刻开始玩 ✨"
  - region "可探索的童话小岛地图":
    - heading "童话小岛探索地图" [level=2]
    - text: 点击建筑直接去玩
    - paragraph: 在小岛上漫步，每个地方都有专属的小秘密
    - button "听一听小岛地图语音介绍": 听小岛介绍
    - button "进入情绪天气站：看看今天头顶的天气与身体里的感觉":
      - text: 天空观测
      - button "朗读情绪天气站介绍"
      - heading "情绪天气站" [level=3]
      - paragraph: 头顶有晴天、阴天和小雨，心里也有不同的感觉
      - text: ⛅ 今天天气：晴天有微风 · 身体暖暖的 观测今天的天气 👉
    - button "进入故事林：在绿树丛中漫步，打开生活故事绘本":
      - text: 绘本树丛
      - button "朗读故事林介绍"
      - heading "故事林" [level=3]
      - paragraph: 树林里住着小动物，每棵树下都有一本生活故事
      - text: 📖 走一圈、读一读，发现不同视角的生活叶片 打开树丛故事 👉
    - button "进入想法侦探社：用放大镜寻找真实线索，区分看到的事实与脑子里的猜测":
      - text: 线索机关
      - button "朗读想法侦探社介绍"
      - heading "想法侦探社" [level=3]
      - paragraph: 拿起放大镜动动手，看看哪些是事实，哪些只是猜测
      - text: 🔍 动手找线索 · 不凭感觉随便给别人贴标签 拿起放大镜调查 👉
    - button "进入勇气说话屋：练习把心里话说出来，有权说不，找可信任的大人":
      - text: 安全表达
      - button "朗读勇气说话屋介绍"
      - heading "勇气说话屋" [level=3]
      - paragraph: 在这里练习把心事好好告诉大人，也学会说坚定的“不”
      - text: 🛡️ 保护身体与心 · 遇到不舒服随时找可信大人求助 进屋倾听与练习 👉
    - button "进入照顾小桥：两个温暖的家，看交接日历、收拾小书包与安心想念":
      - text: 温暖两家
      - button "朗读照顾小桥介绍"
      - heading "照顾小桥" [level=3]
      - paragraph: 桥的两头都是温暖的港湾，看日程安排、装好自己的小书包
      - text: 🎒 中性家庭称谓 · 日程清清楚楚 · 想念随时安心说 踏上照顾小桥 👉
    - button "进入星光小屋：点亮你的爱好拼图，家庭只是其中一片，你本身无比丰富":
      - text: 多面自我
      - button "朗读星光小屋介绍"
      - heading "星光小屋" [level=3]
      - paragraph: 点亮你的爱好与强项，家庭只是大拼图里的一片
      - text: ⭐ 爱好、朋友与成长 · 你是一个无比丰富独立的孩子 点亮我的星光 👉
    - button "进入绿草呼吸平静角：慢慢深呼吸，放松身体，平复情绪":
      - text: 绿草呼吸平静角 随时可退回
      - paragraph: 跟着小光圈一起吸气、呼气，身体松松的
      - text: 去休息 👉
    - text: 安心玩耍约定
    - paragraph: 没有倒计时 · 没有对错打分 · 任何时候都能找身边的大人抱抱
  - paragraph: 🌱 随时可以停下来休息，或者找大人抱一抱！
  - paragraph: 没有倒计时 · 没有分数 · 身边总有大人在
  - button "找大人抱抱与想念入口：点击打开求助与想念窗口": 找大人抱抱 身边有人在 · 随时可以找大人
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Child-First Design System Viewport & Overflow Tests (AG-04A)', () => {
  4  |   test('Child Home must not have horizontal scrollbar on any supported viewport', async ({ page }) => {
  5  |     await page.goto('/');
  6  | 
  7  |     // Wait for the island UI to be ready
  8  |     await expect(page.getByText('晴雨小岛', { exact: true }).first()).toBeVisible();
> 9  |     await expect(page.getByText('伴伴在身边').first()).toBeVisible();
     |                                                   ^ Error: expect(locator).toBeVisible() failed
  10 |     await expect(page.getByText('绿草呼吸平静角').first()).toBeVisible();
  11 |     await expect(page.getByText('找大人抱抱').first()).toBeVisible();
  12 | 
  13 |     // Assert that the page does not horizontally overflow: document.documentElement.scrollWidth <= clientWidth
  14 |     const { scrollWidth, clientWidth } = await page.evaluate(() => {
  15 |       const doc = document.documentElement;
  16 |       return {
  17 |         scrollWidth: doc.scrollWidth,
  18 |         clientWidth: doc.clientWidth,
  19 |       };
  20 |     });
  21 | 
  22 |     // scrollWidth must never exceed clientWidth
  23 |     expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  24 |   });
  25 | 
  26 |   test('Both Fairytale Island Map and Card views must render without horizontal overflow', async ({ page }) => {
  27 |     await page.goto('/');
  28 |     await expect(page.getByText('晴雨小岛', { exact: true }).first()).toBeVisible();
  29 | 
  30 |     // Verify map view is active and responsive
  31 |     await expect(page.getByText('童话小岛探索地图').first()).toBeVisible();
  32 |     const mapMetrics = await page.evaluate(() => ({
  33 |       scrollWidth: document.documentElement.scrollWidth,
  34 |       clientWidth: document.documentElement.clientWidth,
  35 |     }));
  36 |     expect(mapMetrics.scrollWidth).toBeLessThanOrEqual(mapMetrics.clientWidth);
  37 | 
  38 |     // Switch to Card view
  39 |     const cardTab = page.getByRole('tab', { name: /清晰地点卡片/ });
  40 |     await cardTab.click();
  41 | 
  42 |     // Verify card view rendered and has zero horizontal overflow
  43 |     await expect(page.getByText('想先去哪儿玩').first()).toBeVisible();
  44 |     const cardMetrics = await page.evaluate(() => ({
  45 |       scrollWidth: document.documentElement.scrollWidth,
  46 |       clientWidth: document.documentElement.clientWidth,
  47 |     }));
  48 |     expect(cardMetrics.scrollWidth).toBeLessThanOrEqual(cardMetrics.clientWidth);
  49 |   });
  50 | 
  51 |   test('Touch targets meet >= 56x56 CSS px standard for child interaction', async ({ page }) => {
  52 |     await page.goto('/');
  53 |     await expect(page.getByText('晴雨小岛', { exact: true }).first()).toBeVisible();
  54 | 
  55 |     // Switch to card view to inspect location card touch targets
  56 |     const cardTab = page.getByRole('tab', { name: /清晰地点卡片/ });
  57 |     await cardTab.click();
  58 | 
  59 |     // Audio narrator buttons on location cards must be >= 56x56px
  60 |     const audioButtons = page.locator('button[aria-label*="听一听"]');
  61 |     const count = await audioButtons.count();
  62 |     expect(count).toBeGreaterThan(0);
  63 | 
  64 |     for (let i = 0; i < Math.min(count, 3); i++) {
  65 |       const box = await audioButtons.nth(i).boundingBox();
  66 |       expect(box).not.toBeNull();
  67 |       if (box) {
  68 |         expect(box.width).toBeGreaterThanOrEqual(56);
  69 |         expect(box.height).toBeGreaterThanOrEqual(56);
  70 |       }
  71 |     }
  72 |   });
  73 | 
  74 |   test('Create screenshot baseline for child home across all 6 viewports', async ({ page }, testInfo) => {
  75 |     await page.goto('/');
  76 |     await expect(page.getByText('晴雨小岛', { exact: true }).first()).toBeVisible();
  77 | 
  78 |     // Capture screenshot baseline per viewport project
  79 |     const screenshotPath = `tests/screenshots/child-home-${testInfo.project.name.toLowerCase()}.png`;
  80 |     await page.screenshot({ path: screenshotPath, fullPage: false });
  81 | 
  82 |     // Verify screenshot file was generated and has non-zero size
  83 |     const fs = await import('fs');
  84 |     expect(fs.existsSync(screenshotPath)).toBe(true);
  85 |     const stats = fs.statSync(screenshotPath);
  86 |     expect(stats.size).toBeGreaterThan(1000);
  87 |   });
  88 | });
  89 | 
```