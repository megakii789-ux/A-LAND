# 晴雨小岛｜Phase 1A 真实测试与验收矩阵证据 (`UX_PHASE1A_TEST_EVIDENCE.md`)

**执行日期**：2026-10-14  
**工程目录**：`/home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间`  
**授权范围**：Gate 0 + Phase 1A（界面、可访问性、原创角色 SVG 与内容审核/求助契约保护）

---

## 一、工具链与自动化测试总览（Phase 1A-FIX 统一环境校准后）

> **工具链版本校准说明（Phase 1A-FIX 第四节）**：
> - `node -v`: `v20.20.2` | `npm -v`: `10.8.2`
> - `vite`: `8.3.4`（严格匹配 `package.json` 声明的 `^8.3.0`；已移除早期 `vite v6.4.1` 混合环境记录，所有构建与测试统一在 `vite@8.3.4` + `typescript@7.0.2` + `vitest@5.0.4` + `@playwright/test@1.64.0` 下重新执行并取证，详见 [`docs/UX_PHASE1A_FIX_TEST_EVIDENCE.md`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/docs/UX_PHASE1A_FIX_TEST_EVIDENCE.md)）。

所有结果均来自单一同版本工具链环境的真实命令行运行，未合并不同版本环境结果，未伪造或跳过任何检查项：

| 检查项 | 执行命令 | 状态 | 结果摘要 |
| :--- | :--- | :--- | :--- |
| **Vite 生产构建** | `../node_modules/.bin/vite build` | **PASS (Exit 0)** | `vite v8.3.4 building client environment for production... ✓ 1723 modules transformed.` 耗时 `686ms`；生成 `dist/assets/index-CA4f2Nst.css` (`84.42 kB`) 与 `dist/assets/index-D16t9b1F.js` (`594.94 kB`) |
| **TypeScript 全项目类型检查** | `../node_modules/.bin/tsc --noEmit` | **PASS (Exit 0, 0 错误)** | 全项目（含 `ContentAuditRegistry.ts` 与 `contentAuditRegistry.test.ts`）**0 类型错误** |
| **Vitest 全量单元与组件测试** | `../node_modules/.bin/vitest run` | **PASS (Exit 0, 28/28 文件, 264/264 用例)** | 含新增 `src/tests/adultPreviewSessionLeak.test.tsx` 真实 React 组件级成人预览会话隔离测试与 AG-R6 审核注册表契约测试，264 个用例 100% 通过 |
| **Playwright 六视口全矩阵 + 无障碍 + 双标签页 E2E** | `../node_modules/.bin/playwright test` | **PASS (Exit 0, 78/78 用例)** | 覆盖 `viewport-overflow.spec.ts`、`accessibility-reduced-motion.spec.ts`、`dual-tab-lifecycle.spec.ts` 在 6 个视口下共 78 个 E2E 用例 100% 通过（0 条件跳过） |

---

## 二、真实命令行输出记录（统一 `vite v8.3.4` 环境）

### 2.1 Vite 生产构建 (`vite build`) 与生成 CSS 核验（任务 D）

```text
vite v8.3.4 building client environment for production...
✓ 1723 modules transformed.
dist/index.html                   0.52 kB │ gzip:   0.37 kB
dist/assets/index-CA4f2Nst.css   84.42 kB │ gzip:  13.56 kB
dist/assets/index-D16t9b1F.js   594.94 kB │ gzip: 169.39 kB
✓ built in 686ms
```

**Tailwind v4 生产构建 CSS 实证结论**：
- 检查 `dist/assets/index-CA4f2Nst.css` 确认：`.bg-linear-to-r`、`.bg-linear-to-br`、`.bg-linear-to-b`、`.bg-gradient-to-r`、`.bg-gradient-to-br`、`.shrink-0`、`.flex-shrink-0` **全部在生产 CSS 中生成了对应的有效样式规则**。
- 因此本轮严格遵守任务 D 要求：**未因类名不熟悉而盲目删除任何现有渐变或弹性缩放类名**。

### 2.2 TypeScript 类型检查 (`tsc --noEmit`)

- 执行 `../node_modules/.bin/tsc --noEmit`（`TypeScript Version 7.0.2`）：**退出码 `0`，全项目 `0 errors`**。
- 详见 [`docs/UX_PHASE1A_FIX_TEST_EVIDENCE.md`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/docs/UX_PHASE1A_FIX_TEST_EVIDENCE.md)。

### 2.3 Vitest 全量单元测试 (`vitest run`)

```text
 RUN  v5.0.4 /tmp/qingyu_deps/work
 Test Files  28 passed (28)
      Tests  264 passed (264)
   Start at  20:43:52
   Duration  470ms (transform 38%, import 32%, tests 26%, worker 4%)
```

- 全部 28 个测试文件（264 个测试用例）100% 通过，退出码为 `0`。
- 完整日志详见 [`docs/UX_PHASE1A_FIX_TEST_EVIDENCE.md`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/docs/UX_PHASE1A_FIX_TEST_EVIDENCE.md)。

---

## 三、真实验收矩阵（六视口 × A–I 全项核验）

测试脚本：[`tests/e2e/viewport-overflow.spec.ts`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/tests/e2e/viewport-overflow.spec.ts)  
执行结果：**36 passed (18.3s)**

### 3.1 六视口首屏、横向溢出与按钮触控尺寸实测数据（检查项 A, B, C, E）

| 视口名称 | 分辨率 | 横向溢出 (`scrollWidth <= innerWidth`) | 标题单字竖排 (`headingHeight <= 110px`) | 伙伴问候语可见性 | 核心操作按钮触控高度 (`>= 52px`) | 首屏截图文件 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Mobile-360** | `360 × 800` | `360 <= 360` (**0 溢出**) | `36px` (单行完整显示) | 完整可读（多行折行，无截断） | 找奇奇 `60px` / 去呼吸 `56px` / 去拆解 `56px` / 岛屿卡片 `>=56px` | `tests/screenshots/child-home-mobile-360.png` |
| **Mobile-390** | `390 × 844` | `390 <= 390` (**0 溢出**) | `36px` (单行完整显示) | 完整可读（多行折行，无截断） | 找奇奇 `60px` / 去呼吸 `56px` / 去拆解 `56px` / 岛屿卡片 `>=56px` | `tests/screenshots/child-home-mobile-390.png` |
| **Mobile-430** | `430 × 932` | `430 <= 430` (**0 溢出**) | `36px` (单行完整显示) | 完整可读（多行折行，无截断） | 找奇奇 `60px` / 去呼吸 `56px` / 去拆解 `56px` / 岛屿卡片 `>=56px` | `tests/screenshots/child-home-mobile-430.png` |
| **Tablet-768** | `768 × 1024` | `768 <= 768` (**0 溢出**) | `40px` (单行完整显示) | 完整可读 | 全部核心按钮 `>= 56px` | `tests/screenshots/child-home-tablet-768.png` |
| **Tablet-1024** | `1024 × 1366` | `1024 <= 1024` (**0 溢出**) | `40px` (单行完整显示) | 完整可读 | 全部核心按钮 `>= 56px` | `tests/screenshots/child-home-tablet-1024.png` |
| **Desktop-1440** | `1440 × 900` | `1440 <= 1440` (**0 溢出**) | `48px` (单行完整显示) | 完整可读 | 全部核心按钮 `>= 56px` | `tests/screenshots/child-home-desktop-1440.png` |

### 3.2 A–I 九项验收标准逐项验证记录

1. **A. 首屏完整截图**：6 个视口的首屏完整截图及 4 张核心弹窗对比截图已全部重新生成并校验 SHA-256（详见 `docs/UX_PHASE1A_VISUAL_COMPARISON.md`）。
2. **B. 横向溢出**：在未设置全局 `overflow-x: hidden` 的前提下，6 个视口在儿童首页、侦探实验室、两家彩虹桥、故事林、互动游戏中心及家长端下的 `documentElement.scrollWidth` 均严格等于 `window.innerWidth`。
3. **C. 实际按钮位置与可点击面积**：
   - `CompanionBanner` 移动端直接渲染“去找奇奇玩”主按钮（实测高度 `60px`）与声音切换按钮（`44×44px`）；
   - `AlwaysReachableCalmCard` 移动端直接渲染“去呼吸”与“去拆解”双主按钮（实测高度 `56px`，双列等宽网格）；
   - 顶部 `Navbar` 与底部 `HugSupportEntry` 之间保持充足文档流间距，无遮挡。
4. **D. 主要场景进入和退出**：
   - Playwright 自动脚本在全部 6 个视口下真实点击进入并退出了：**念头侦探实验室** (`ThoughtDetectiveLabModal`)、**两家彩虹桥** (`TwoHomesBridgeModal`)、**小岛故事林** (`StoryGroveModal`)、**小岛互动游戏** (`InteractiveGamesHubModal`)。
5. **E. 文本折行、裁切及 Emoji 缺字**：
   - 修复了 `360px` 下“晴雨小岛”单字竖排（高度从 `160px` 降至 `36px`）；
   - 修复了伙伴问候语被 `truncate` 截断为仅剩 `“今天想...”` 的问题；
   - 核心交互区的跨平台易缺字动物 Emoji（🐿️、🦦、🦝、🦌）已全部替换为 [`CompanionIcons.tsx`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/src/components/ChildIsland/CompanionIcons.tsx) 中的原创 SVG 矢量插画组件。
6. **F. 弹窗关闭、焦点恢复与滚动行为**：
   - 验证了全部核心弹窗可通过关闭按钮或 `Escape` 键正常关闭并卸载；
   - 验证了 `TwoHomesBridgeModal` 的 7 天日历在 `360px` 下具备独立水平滚动容器 (`overflow-x-auto`) 与显式提示文案 `"← 左右滑动查看整周 7 天 →"`，且不会撑破外层弹窗宽度。
7. **G. 降低动效模式 (`prefers-reduced-motion: reduce`)**：
   - Playwright 在开启 `emulateMedia({ reducedMotion: 'reduce' })` 后验证了全部 6 个视口：界面正常渲染、无横向溢出、呼吸与过渡动效平稳降级。
8. **H. 儿童内容审核门禁没有发生回退**：
   - Playwright 断言确认：儿童端打开 `InteractiveGamesHubModal`、各互动游戏及 `TransferScenariosModal` 时，页面文本**不包含** `"PENDING_REVIEW"`、`"缺少外部独立专家背书"` 等内部审核术语，且**不存在**未受保护的 `"成人审核预览"` 按钮；
   - 点击 `"请爸爸妈妈帮忙开启预览"` 按钮后，必须弹出 `<ParentGateModal>` 家长验证门禁（需输入数学题/PIN 验证），儿童无法一键绕过。
9. **I. 求助与隐私功能没有发生回退**：
   - Playwright 真实点击底部 `HugSupportEntry`（`"抱抱我 · 找大人"`），确认打开本机平静与现实求助面板，如实说明“本机练习，不会自动发消息给爸爸妈妈”，无任何虚假远程送达承诺，且无外部网络请求产生。
