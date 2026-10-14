# 晴雨小岛｜Phase 1A 六视口与核心场景视觉对照报告 (`UX_PHASE1A_VISUAL_COMPARISON.md`)

**执行日期**：2026-10-14  
**工程目录**：`/home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间`  
**Gate 0 原始截图备份目录**：`/home/voga/.gemini/antigravity/brain/14e51dfc-628e-475c-bb64-37e80b5c7d73/scratch/gate0_baseline/tests/screenshots/`  
**Phase 1A 最新截图目录**：`/home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/tests/screenshots/`

---

## 一、六视口首屏截图 SHA-256 与视觉改进对照总表

| 视口名称 | 分辨率 | Gate 0 基线截图 SHA-256 | Phase 1A 修复后截图 SHA-256 | 核心视觉与交互改进验证 |
| :--- | :--- | :--- | :--- | :--- |
| **Mobile-360** | `360 × 800` | `c8502e3a60e0e7477df755d35c1d7e2518426f13054b196ebec8d0681f478791` | `9e934e26fc9ac51b5f8865ee9036e4a9d646fd6514869d00ec99eb40113ce54a` | 1. 消除“晴雨小岛”四字竖排（标题高度 `160px` → `36px`）；<br>2. 消除问候语 `truncate` 截断（完整显示奇奇问候语）；<br>3. 手机端首屏直接可见“去找奇奇玩”(`60px`)、“去呼吸”(`56px`)、“去拆解”(`56px`)；<br>4. 动物伙伴与地点切换图标替换为原创矢量 SVG，彻底消除 `▯` 缺字方块。 |
| **Mobile-390** | `390 × 844` | `018bb6cfab38c2bc09b0d174be2bcffbe91ee7fd220f2459bb9ef66bb22ee83a` | `cb768125aee38acef828ab598c130c7d3460344a36cc3fceabb1b10adda36092` | 1. 顶部导航栏与首页副标题两段式换行排版，不挤压右侧“设置小伙伴”按钮；<br>2. 伙伴横幅与常驻平静卡在 `390px` 下双列/全宽大按钮触控区清晰可点（`>= 56px`）；<br>3. 地图气泡标签与底部求助入口无重叠。 |
| **Mobile-430** | `430 × 932` | `a2ab7f3be48cf55110cb193c4fc607c99d4be7ff4bd519dc5fc41139c4c2fb4b` | `ec026e37d33f0216e15b2fe9a4f21ed4e4b97949a55ae79596b11505d4dde40a` | 1. 大屏手机视口下卡片间距、圆角与字号符合 `tokens.ts` 规范；<br>2. 四位动物伙伴原创 SVG 头像色彩柔和、边缘清晰；<br>3. 无横向溢出 (`430 <= 430`)。 |
| **Tablet-768** | `768 × 1024` | `07b09fb7000ee2f2b574896a3925128031d219449144a0ba1507ca397471bb2f` | `9b8c3c7bcf56d4c178f735d9d86f570da914f1068f82b5572a95a77694a9bbdd` | 1. 平板竖屏视口下 `CompanionBanner` 与 `AlwaysReachableCalmCard` 切換为横向舒展布局；<br>2. 岛屿地图与下方 6 张快捷卡片双列排布均衡。 |
| **Tablet-1024** | `1024 × 1366` | `6ae69128ff4b8681dd70b0f6b97409f4c451ff98fc047ccae85bc36fb2740c70` | `c5799279624c8315575b47a5a324ed25f5e24912827780c6fbe3be8018825a39` | 1. 平板横屏/大屏视口下 3 列快捷卡片与中央地图比例协调；<br>2. 顶部导航、音频条与底部抱抱求助卡视觉层级分明。 |
| **Desktop-1440** | `1440 × 900` | `fa3821c078ff1fd29c76933fb9560be581410b9fc3a55f23414fa87da24cb1c2` | `beb8051ec4455265780269720c6b51c9d0acd8f0f3bdda89c669600dc8680dde` | 1. 桌面宽屏视口下无两侧断崖式留白；<br>2. 全部原创 SVG 角色与图标高精度渲染，按钮高度 `>= 56px`。 |

---

## 二、Phase 1A 新增专项场景验证截图清单

除 6 个视口的首屏对照截图外，Phase 1A 针对任务 B（移动端密集网格）、任务 C（SVG 插画显示）与任务 E（内容审核门禁保护）新增了 4 张专项实测截图：

| 专项场景 | 视口规格 | 截图路径 | Phase 1A 截图 SHA-256 | 视觉验证结论 |
| :--- | :--- | :--- | :--- | :--- |
| **念头侦探实验室（任务 B）** | `360 × 800` | `tests/screenshots/phase1a-detective-lab-mobile-360.png` | `94feda50a6cb25dc4b050bdf52513bed817230edbdb267631c2d791b0c0273d8` | 5 个情境卡片由拥挤 5 列改为移动端 2 列 (`grid-cols-2 sm:grid-cols-3 md:grid-cols-5`)；情绪强度圆点支持 `flex-wrap` 且按钮 `min-h-[56px]`。 |
| **两家彩虹桥（任务 B）** | `360 × 800` | `tests/screenshots/phase1a-two-homes-mobile-360.png` | `a07acc19c095453c3c4d31c03c99e7adb5047f86d3a967726f54c37e88e11881` | 7 天日历在 `360px` 下具备独立水平滚动容器 (`min-w-[532px]`) 与顶部显式提示 `"← 左右滑动查看整周 7 天 →"`，每日卡片宽度充足，汉字横向正常排布。 |
| **互动游戏中心与审核门禁（任务 B & E）** | `360 × 800` | `tests/screenshots/phase1a-games-hub-mobile-360.png` | `b84a4a529c059637f1fdc9d0e2f4d38e59c1f3cb5c1c63dbab244c3a6be30ad0` | 顶部栏与筛选按钮支持自适应换行 (`flex-wrap`)；待审核游戏显示温和真实的《小游戏正在准备中》卡片，完全隐藏 `"PENDING_REVIEW"`，预览入口受 `<ParentGateModal>` 保护。 |
| **小岛故事林全景画布（任务 C）** | `1440 × 900` | `tests/screenshots/phase1a-story-panorama-desktop-1440.png` | `a3a9aa9fac1d1874c67ae04cc9e22a23903add479086e1fd4977911692779e80` | 故事插画 `StoryIllustrations.tsx` 采用 `preserveAspectRatio="xMidYMid slice"` 充满宽屏画布，两侧无空白断层；修正了 5 处 SVG 内部遮挡，且顶部“故事画布”徽章移至左上角不再遮挡插画内置标题。 |

---

## 三、分维度像素级对比详述

### 3.1 移动端首屏（`360×800` / `390×844` / `430×932`）——任务 A & 决策 3
- **修复前（Gate 0 基线）**：
  - `IslandHome.tsx` 头部在 `360px` 下由于左侧图标 + 标题 + 右侧“设置小伙伴”按钮擠在同一水平 `flex` 行，导致“晴雨小岛”四字被挤压成 4 行单字竖排（高度达 `160px`）。
  - `CompanionBanner.tsx` 中的问候语使用了单行 `truncate`，在 `360px` 下仅能看到 `“今天想...”` 三个字；且“去找奇奇玩”主操作按钮使用了 `hidden sm:flex`，导致手机端儿童完全看不到该主入口。
  - `AlwaysReachableCalmCard.tsx` 中的“去呼吸”与“去拆解”两个核心平复操作使用了 `hidden md:flex`，手机端只剩一个微小文字徽章。
  - 动物伙伴头像（🐿️、🦦、🦝、🦌）使用原生 Unicode Emoji，在 Linux / 无彩色字体环境下渲染为 `▯` 豆腐块。
- **修复后（Phase 1A）**：
  - `IslandHome.tsx` 头部在小屏采用上下两段式/弹性布局，“晴雨小岛”在 `360px` 下单行完整展示（高度 `36px`）。
  - `CompanionBanner.tsx` 移除 `truncate`，改为最多 2–3 行自然折行，完整展示 `“奇奇：今天想先去哪个角落看看？我会一直陪着你。”`；手机端底部直接展示全宽 `min-h-[56px]`（实测 `60px`）的“去找奇奇玩”大按钮。
  - `AlwaysReachableCalmCard.tsx` 在手机端底部以 `grid-cols-2` 并排展示“去呼吸”与“去拆解”两个 `min-h-[56px]` 按钮，触控面积充裕。
  - 全部四位动物伙伴及核心小岛图标均由 [`CompanionIcons.tsx`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/src/components/ChildIsland/CompanionIcons.tsx) 提供原创温暖绘本风 SVG 渲染，跨平台 100% 一致。

### 3.2 移动端密集网格与卡片弹窗（`360×800`）——任务 B
- **念头侦探实验室 (`ThoughtDetectiveLabModal.tsx`)**：5 个情境入口从固定 `grid-cols-5` 改为 `grid-cols-2 sm:grid-cols-3 md:grid-cols-5`，每个按钮具备充足的水平宽度与 `>=56px` 触控高度。
- **两家彩虹桥 (`TwoHomesBridgeModal.tsx`)**：7 天日历网格增加 `overflow-x-auto` 滚动容器与 `min-w-[532px]` 保底宽度，并在上方提供醒目的琥珀色胶囊提示 `"← 左右滑动查看整周 7 天 →"`，兼顾信息完整性与可读性。
- **勋章解锁提示 (`MedalUnlockedToast.tsx`)**：宽度改用 `w-[calc(100vw-1.5rem)] max-w-md`，在 `360px` 视口下左右留出安全边距，消除紧贴屏幕边缘的压迫感。

### 3.3 故事林宽屏 SVG 画布与防遮挡（`1440×900`）——任务 C
- **画布比例与填充**：`StoryGroveModal.tsx` 全景画布改为响应式 `aspect-[16/10] sm:aspect-[16/9]`，`StoryIllustrations.tsx` 全部 8 幅插画将 `preserveAspectRatio` 升级为 `"xMidYMid slice"`，核心角色与安全区集中在 `y=70..380`，消除两侧留白且无主体裁切。
- **内部遮挡修复**：逐一修正了乌云挡字、念头云重叠、传声筒穿模、人物与徽章重叠及底部文字贴边问题。

### 3.4 儿童内容审核门禁与求助契约视觉核验——任务 E
- **儿童端零技术术语泄露**：待审核内容在儿童端统一呈现为温暖、真实的提示（如 `"这个故事的语音和画面还在由老师们做最后检查，检查完成后就会向你开放啦！"` 或 `"这个小游戏正在由大人们做最后的安全检查，今天可以先去小岛的其他角落玩耍哦！"`）。
- **家长门禁严密保护**：成人开发/审阅预览按钮改为 `"请爸爸妈妈帮忙开启预览"`，未解锁家长权限时点击必定弹出 `<ParentGateModal>` 数学验证门禁，杜绝儿童一键绕过。
