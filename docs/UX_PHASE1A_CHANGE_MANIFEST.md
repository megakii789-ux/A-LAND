# Phase 1A 独立变更清单与缺陷修复追踪 (`UX_PHASE1A_CHANGE_MANIFEST.md`)

- **执行对象**：`/home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间`
- **授权范围**：Gate 0 + Phase 1A（界面与可访问性修复、原创 SVG 动物伙伴与关键图标、内容审核与求助契约保护）
- **记录格式**：遵循授权指令要求，逐条记录 **「原始位置 → 修复位置 → 修改内容 → 运行验证 → 截图 → 残余风险」**。

---

## 一、新增与修改文件总览

| 序号 | 操作类型 | 文件路径 | 所属任务 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **新增** | `src/components/ChildIsland/CompanionIcons.tsx` | 决策 3 / 任务 A | 原创 SVG 四位动物伙伴（果果、贝贝、天天、奇奇）、兴趣徽章与关键交互矢量图标库 |
| 2 | **修改** | `src/design-system/tokens.ts` | 任务 D | 补充统一标题防竖排、儿童正文行宽及卡片内边距规范 Token |
| 3 | **修改** | `src/components/Navbar.tsx` | 任务 A | 修复 360px/390px 下「晴雨小岛」标题单字竖排挤压，紧凑化移动端导航按钮并保证 `min-h-[48px]` 触控高度 |
| 4 | **修改** | `src/components/ChildIsland/CompanionBanner.tsx` | 任务 A / 决策 3 | 替换伙伴与兴趣缺字 Emoji 为原创 SVG；修复移动端问候语被截断为 4 个字；保证「听问候」「换伙伴」按钮始终可见且满足 `56×56px` |
| 5 | **修改** | `src/components/ChildIsland/AlwaysReachableCalmCard.tsx` | 任务 A / 任务 D | 移除 `hidden sm:inline` 使手机端始终显示「去呼吸」「去拆解」文字标签；修复无效类 `text-teal-850` 为 `text-teal-900`；接入 `tokens.touchTarget.childMin` |
| 6 | **修改** | `src/components/ChildIsland/IslandHome.tsx` | 任务 A / 决策 3 | 替换天气丝带、视图切换、勋章与拆解台关键缺字 Emoji 为原创 SVG；增加底部 `pb-28 sm:pb-16` 安全内边距防止底部「找大人抱抱」遮挡内容；保证不含全局 `overflow-x:hidden` |
| 7 | **修改** | `src/components/ChildIsland/FairytaleIslandMap.tsx` | 任务 A / 决策 3 | 替换地图顶栏伙伴 Emoji 为 `<CompanionAvatarSvg>`；优化移动端底栏图例折行与内边距 |
| 8 | **修改** | `src/components/ChildIsland/ChildAudioBar.tsx` | 任务 A | 修复 360px 下 3 个固定宽度音频按钮撑破视口的问题，改为响应式宽度并满足 `min-h-[56px]` |
| 9 | **修改** | `src/components/ChildIsland/Personalization/PersonalizationSettingsModal.tsx` | 决策 3 | 替换伙伴与兴趣选择卡片中的缺字 Emoji 为 `<CompanionAvatarSvg>` 与 `<InterestBadgeSvg>` |
| 10 | **修改** | `src/components/ChildIsland/ThoughtDetectiveLab/ThoughtDetectiveLabModal.tsx` | 任务 B | 将 5 列密集工具栏改为 `grid-cols-2 sm:grid-cols-5`（第 5 项在移动端 `col-span-2`）；将 3 列分类盒与责任圈改为移动端单列；提升触控热区至 `min-h-[56px]` |
| 11 | **修改** | `src/components/ChildIsland/TwoHomesBridge/TwoHomesBridgeModal.tsx` | 任务 B / 决策 3 | 修复未设置日程时「还有  个晚上」空插值；为 7 日日历条增加横向滚动、明确滑动提示及等效「切换列表视图」按钮；替换妈妈家/爸爸家缺字 Emoji 为原创 SVG |
| 12 | **修改** | `src/components/InteractiveGames/InteractiveGamesHubModal.tsx` | 任务 B / 任务 E | 修复 360px 顶栏 5 按钮挤压为自动换行；将无效类 `py-0.2` 改为 `py-0.5`；移除儿童端 `PENDING_REVIEW` 与技术术语，改为温暖等待说明 + 家长 PIN 验证门禁 |
| 13 | **修改** | `src/components/InteractiveGames/CrayonDetectiveGame/CrayonDetectiveGame.tsx` | 任务 B / 任务 E | 移除儿童端 `PENDING_REVIEW`，接入 `<ParentGateModal>` 成人验证门禁；兴趣皮肤栏接入 `<InterestBadgeSvg>` |
| 14 | **修改** | `src/components/InteractiveGames/FriendAsksHomeGame/FriendAsksHomeGame.tsx` | 任务 E | 移除儿童端 `PENDING_REVIEW`，接入 `<ParentGateModal>` 成人验证门禁与适龄等待说明 |
| 15 | **修改** | `src/components/InteractiveGames/ToyBoatNegotiationGame/ToyBoatNegotiationGame.tsx` | 任务 E | 移除儿童端 `PENDING_REVIEW`，接入 `<ParentGateModal>` 成人验证门禁与适龄等待说明 |
| 16 | **修改** | `src/components/InteractiveGames/TransferLab/TransferScenariosModal.tsx` | 任务 B / 任务 E | 情境切换标签增加 `flex-wrap`；移除儿童端 `PENDING_REVIEW`，接入 `<ParentGateModal>` 成人验证门禁 |
| 17 | **修改** | `src/components/ParentCoach/CognitiveDimension3DArtifact.tsx` | 任务 B | 将固定宽度 `w-[290px]` 改为响应式 `w-full max-w-[360px] px-2`，消除 360px 容器内横向挤压 |
| 18 | **修改** | `src/components/ChildIsland/Medals/MedalUnlockedToast.tsx` | 任务 B / 任务 D | 将 `fixed bottom-6 right-6 max-w-sm w-full` 改为移动端 `bottom-24 left-3 right-3`，避免 360px 溢出及遮挡底部求助条；修复无效类 `py-0.2` 为 `py-0.5` |
| 19 | **修改** | `src/components/ChildIsland/StoryGrove/StoryIllustrations.tsx` | 任务 C | 为 `IslandPanoramaIllustration` 配置 `preserveAspectRatio="xMidYMid slice"` 并收敛关键地标坐标；修复 `CupScale`、`RainWeather`、`CourageShield`、`StarlightPuzzle` 的 SVG 缩放偏移、气泡尾巴悬空与底部标签遮挡 |
| 20 | **修改** | `src/components/ChildIsland/StoryGrove/StoryGroveModal.tsx` | 任务 C / 任务 E | 移除儿童端未审故事叶的内部技术警告与 3 扇门透出，改为适龄等待说明并强制通过 `<ParentGateModal>` 验证后才可进入成人审阅预览 |
| 21 | **修改** | `tests/e2e/viewport-overflow.spec.ts` | 第五节验收矩阵 | 扩展六视口全矩阵 E2E 自动化验证（覆盖 A–I 全部检查项与关键弹窗截图） |

---

## 二、逐项缺陷修复追踪记录

### 缺陷 01：移动端 360px/390px 顶部导航栏「晴雨小岛」标题单字竖排挤压
- **原始位置**：`src/components/Navbar.tsx:16-31`
- **修复位置**：`src/components/Navbar.tsx:16-102`
- **修改内容**：
  1. 为品牌标题「晴雨小岛」增加 `whitespace-nowrap shrink-0`，严禁在窄屏下被右侧 4 个按钮挤压成 4 行单字竖排；
  2. 在 `< 640px` 手机视口下精简右侧次要功能按钮文案（「隐私」与「云端」采用图标 + 完整 `aria-label`，「孩子小岛 / 家长教练」采用紧凑双字文案），确保全宽度在 360px 内单行舒适排布且按钮高度 `min-h-[48px]`。
- **运行验证**：Playwright 六视口测试断言 `page.getByText('晴雨小岛').first().boundingBox()` 在 `360×800`、`390×844`、`430×932` 下 `height <= 40px` 且 `width >= 60px`。
- **截图**：`tests/screenshots/child-home-mobile-360.png`、`tests/screenshots/child-home-mobile-390.png`
- **残余风险**：无。

### 缺陷 02：伙伴问候横幅在手机端问候语被截断为 4 个字，且动物头像依赖跨平台缺字 Emoji
- **原始位置**：`src/components/ChildIsland/CompanionBanner.tsx:31-79`
- **修复位置**：`src/components/ChildIsland/CompanionBanner.tsx:33-98` 及 `src/components/ChildIsland/CompanionIcons.tsx:14-120`
- **修改内容**：
  1. 构建原创 SVG 四位动物伙伴组件 `<CompanionAvatarSvg>`（松鼠果果、水獭贝贝、小浣熊天天、小鹿奇奇）与兴趣徽章 `<InterestBadgeSvg>`，彻底替换原 `🐿️ / 🦦 / 🦝 / 🦌` Unicode Emoji；
  2. 将横幅容器改为 `flex-col sm:flex-row`，移除问候语段落上的 `truncate`，让完整问候语在 360px/390px/430px 下自然折行完整展示；
  3. 移除「听问候」「换伙伴」按钮上的 `hidden sm:inline`，并使用 `tokens.touchTarget.childMin`（`min-w-[56px] min-h-[56px]`）保证手机端核心按钮文字与触控面积。
- **运行验证**：Playwright 断言 `你好呀！我是果果` 文本框在 360px 下 `width >= 180px`，且 `<svg aria-label*="小动物伙伴">` 真实渲染。
- **截图**：`tests/screenshots/child-home-mobile-360.png`、`tests/screenshots/child-home-desktop-1440.png`
- **残余风险**：无。

### 缺陷 03：常驻平静卡片在手机端隐藏了「去呼吸」「去拆解」文字标签，且使用了无效类名 `text-teal-850`
- **原始位置**：`src/components/ChildIsland/AlwaysReachableCalmCard.tsx:30-75`
- **修复位置**：`src/components/ChildIsland/AlwaysReachableCalmCard.tsx:26-84`
- **修改内容**：
  1. 移除「去呼吸」「去拆解」按钮内的 `hidden sm:inline`，改为移动端双列等宽大按钮（`grid-cols-2 sm:flex`，高度 `min-h-[56px]`），确保 6 岁儿童在手机端无需猜测纯图标含义；
  2. 将生产 CSS 中不存在的 `text-teal-850` 替换为标准高对比度 `text-teal-900`；
  3. 将原 `🌿`、`🪨` Emoji 替换为 `<IslandUiIconSvg name="calm_leaf" | "small_step_stone" />`。
- **运行验证**：Playwright 在全部 6 个视口验证 `立即进入呼吸角练习深呼吸` 与 `进入困难拆解器，找一件能做的小事` 按钮可见且 `boundingBox.height >= 56px`。
- **截图**：`tests/screenshots/child-home-mobile-360.png`、`tests/screenshots/child-home-mobile-430.png`
- **残余风险**：无。

### 缺陷 04：小岛首页音频控制条在 360px 下超出容器宽度，且底部求助入口与内容间距紧凑
- **原始位置**：`src/components/ChildIsland/ChildAudioBar.tsx:23-62`、`src/components/ChildIsland/IslandHome.tsx:107-425`
- **修复位置**：`src/components/ChildIsland/ChildAudioBar.tsx:23-66`、`src/components/ChildIsland/IslandHome.tsx:108-435`
- **修改内容**：
  1. 将 `ChildAudioBar.tsx` 的按钮从固定 `min-w-[110px]` 改为移动端紧凑自适应排布（`min-h-[56px] px-2.5 sm:px-3.5`），消除 360px 横向撑破风险；
  2. 在 `IslandHome.tsx` 外层容器设置 `pb-28 sm:pb-16`，确保顶部导航与底部「找大人抱抱」支持区互不遮挡，且全站不使用全局 `overflow-x:hidden` 掩盖溢出。
- **运行验证**：Playwright 在 6 个视口验证 `document.documentElement.scrollWidth <= document.documentElement.clientWidth` 且 `headerBox.y + headerBox.height < hugBox.y`。
- **截图**：`tests/screenshots/child-home-mobile-360.png`
- **残余风险**：无。

### 缺陷 05：想法侦探社弹窗在 360px 下强制使用 5 列工具栏与 3 列分类盒，导致文字挤压成单字列
- **原始位置**：`src/components/ChildIsland/ThoughtDetectiveLab/ThoughtDetectiveLabModal.tsx:148-167, 250-310, 480-540`
- **修复位置**：`src/components/ChildIsland/ThoughtDetectiveLab/ThoughtDetectiveLabModal.tsx:148-175, 255-315, 485-545`
- **修改内容**：
  1. 将顶部 5 个工具切换按钮从 `grid-cols-5` 改为 `grid-cols-2 sm:grid-cols-5`（第 5 个按钮在手机端 `col-span-2 sm:col-span-1`），按钮高度设为 `min-h-[56px]`；
  2. 将「三个分类盒子」与「责任圈拼图」的 3 列网格从 `grid-cols-3` 改为 `grid-cols-1 sm:grid-cols-3`。
- **运行验证**：Playwright 在 `Mobile-360` 下打开想法侦探社，验证 `scrollWidth <= clientWidth` 且无横向溢出。
- **截图**：`tests/screenshots/phase1a-detective-lab-mobile-360.png`
- **残余风险**：无。

### 缺陷 06：两个家的桥弹窗在未设置日程时显示「还有  个晚上」空插值，且 7 列日历在 360px 下极其拥挤
- **原始位置**：`src/components/ChildIsland/TwoHomesBridge/TwoHomesBridgeModal.tsx:41-52, 165-225`
- **修复位置**：`src/components/ChildIsland/TwoHomesBridge/TwoHomesBridgeModal.tsx:41-68, 170-298`
- **修改内容**：
  1. 增加 `isScheduleConfigured = tonightAt === '妈妈家' || tonightAt === '爸爸家'` 守卫，未配置日程时显示温和真实的引导文案（「等待大人设置日程」），彻底消除「还有  个晚上」空值拼接；
  2. 为 7 日日历条增加移动端横向平滑滚动（`overflow-x-auto snap-x`）、醒目的移动端滑动提示（「↔ 左右滑动查看整周 7 天日程」），并提供一键「切换列表视图 / 切换日历条视图」无障碍等效访问方式；
  3. 将妈妈家/爸爸家缺字 Emoji（`👩`/`👨`）替换为原创 `<IslandUiIconSvg name="mom_home" | "dad_home" />`。
- **运行验证**：Playwright 断言页面文本不含 `'还有  个晚上'`，且点击「切换列表视图」可正常切换为纵向列表。
- **截图**：`tests/screenshots/phase1a-two-homes-mobile-360.png`
- **残余风险**：无。

### 缺陷 07：真实动动手探险岛（游戏集）在 360px 下顶栏标签挤压，且未审内容向儿童暴露 `PENDING_REVIEW` 与一键绕过按钮
- **原始位置**：
  - `src/components/InteractiveGames/InteractiveGamesHubModal.tsx:59-183`
  - `src/components/InteractiveGames/CrayonDetectiveGame/CrayonDetectiveGame.tsx:208-245`
  - `src/components/InteractiveGames/FriendAsksHomeGame/FriendAsksHomeGame.tsx:81-118`
  - `src/components/InteractiveGames/ToyBoatNegotiationGame/ToyBoatNegotiationGame.tsx:91-128`
  - `src/components/InteractiveGames/TransferLab/TransferScenariosModal.tsx:83-134`
- **修复位置**：上述 5 个文件的顶栏与门禁拦截区
- **修改内容**：
  1. **不修改 `ContentAuditRegistry.ts` 的任何审批逻辑**，所有未审游戏在儿童正式模式下依然严格拦截；
  2. 移除所有面向儿童界面的 `PENDING_REVIEW`、内部审核术语，替换为 6 岁儿童适龄、中性、真实的等待说明（「这个小游戏正在做最后准备……现在你可以先回小岛去呼吸角、晴雨气象台或做一件找回勇气的小事哦！」）与 `min-h-[56px]` 的「回小岛玩其他活动」主按钮；
  3. 将「成人专家审查预览」改为必须经过 `hasParentAccess()` 校验或弹出 `<ParentGateModal>` 输入家长 PIN 码验证通过后才可解锁预览，彻底禁止儿童一键点击绕过内容限制；
  4. 将 `InteractiveGamesHubModal.tsx` 顶栏改为上下两层响应式 `flex-wrap` 布局，并将无效类名 `py-0.2` 修复为 `py-0.5`。
- **运行验证**：Playwright 断言 `interactive-game-audit-gate-blocked` 可见、不含 `PENDING_REVIEW`，且点击「家长 / 审阅人验证预览」会弹出家长 PIN 校验框而非直接进入游戏。
- **截图**：`tests/screenshots/phase1a-games-hub-mobile-360.png`
- **残余风险**：无。

### 缺陷 08：故事林与小岛全景 SVG 插画宽屏留白、CSS `scale` 破坏 SVG `translate` 定位、气泡尾巴悬空及底部标签遮挡拼图
- **原始位置**：
  - `src/components/ChildIsland/StoryGrove/StoryIllustrations.tsx:16-95` (`IslandPanoramaIllustration`)
  - `src/components/ChildIsland/StoryGrove/StoryIllustrations.tsx:108-190` (`CupScaleInteractiveIllustration`)
  - `src/components/ChildIsland/StoryGrove/StoryIllustrations.tsx:196-265` (`RainWeatherIllustration`)
  - `src/components/ChildIsland/StoryGrove/StoryIllustrations.tsx:310-370` (`CourageShieldIllustration`)
  - `src/components/ChildIsland/StoryGrove/StoryIllustrations.tsx:440-520` (`StarlightPuzzleIllustration`)
  - `src/components/ChildIsland/StoryGrove/StoryGroveModal.tsx:198-285`
- **修复位置**：上述文件对应行段
- **修改内容**：
  1. `IslandPanoramaIllustration`：设置 `preserveAspectRatio="xMidYMid slice"`，并将太阳、彩虹、左右两座小屋、故事林、木拱桥、小帆船全部收敛在安全视区内（`x ∈ [150, 679]`，`y ∈ [62, 213]`），既消除 1440px 宽屏两侧留白，又保证 360px 窄屏不裁切任何核心地标；
  2. `CupScaleInteractiveIllustration` 与 `RainWeatherIllustration`：将 `scale-105` 移入内部 `<g className="... [transform-box:fill-box] origin-center">`，避免覆盖外层 `<g transform="translate(...)">` 导致坐标归零重叠；
  3. `CourageShieldIllustration`：将左右对话气泡的三角形尾巴从悬空的 `y=72..80` 修正为 `y=26..40`，紧贴 `height="52"` 的气泡边缘；
  4. `StarlightPuzzleIllustration`：将四块拼图整体上移至 `translate(130, 12)`（`y=12..128`），消除底部文字胶囊（`y=142..168`）对下方两块拼图的遮挡；
  5. `StoryGroveModal.tsx`：当故事叶处于未审状态时，隐藏下方的三扇思考门，展示温暖适龄等待说明，并将成人审阅预览置于 `<ParentGateModal>` 保护之下。
- **运行验证**：Playwright 在 `1440×900` 与 `360×800` 下验证全景与故事林正常渲染且无裁切或溢出。
- **截图**：`tests/screenshots/child-home-desktop-1440.png`、`tests/screenshots/phase1a-story-panorama-desktop-1440.png`
- **残余风险**：无。

### 缺陷 09：家长端 3D 认知沙盘固定宽度 `w-[290px]` 与勋章解锁提示框移动端定位遮挡
- **原始位置**：
  - `src/components/ParentCoach/CognitiveDimension3DArtifact.tsx:96-135`
  - `src/components/ChildIsland/Medals/MedalUnlockedToast.tsx:26-48`
- **修复位置**：上述文件对应行段
- **修改内容**：
  1. 将 `CognitiveDimension3DArtifact.tsx` 中 3D 沙盘容器的固定 `w-[290px] sm:w-[360px]` 改为 `w-full max-w-[360px] px-2`，内部三座岛屿卡片增加 `shrink-0` 与自适应间距；
  2. 将 `MedalUnlockedToast.tsx` 从 `fixed bottom-6 right-6 z-60 max-w-sm w-full` 改为 `fixed bottom-24 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 z-60 sm:max-w-sm sm:w-full`，并将无效类 `py-0.2` 修复为 `py-0.5`。
- **运行验证**：`tsc --noEmit` 与 `vite build` 零错误通过，移动端不再越界或遮挡底部求助栏。
- **截图**：`tests/screenshots/child-home-mobile-360.png`
- **残余风险**：无。
