# 晴雨小岛｜Phase 1A-FIX 真实测试与工具链一致性证据 (`UX_PHASE1A_FIX_TEST_EVIDENCE.md`)

- **执行日期**：2026-10-14
- **执行模式**：`Phase 1A-FIX`
- **正式工作目录**：`/home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间`
- **测试执行副本**：`/tmp/qingyu_deps/work`（每次运行测试前通过 `rsync` 同步并经 `sha256sum` 全量比对确认 `diff = 0`）

---

## 一、工具链版本核验与可复现环境（Section 四）

所有构建、类型检查、单元测试与 Playwright E2E 测试均在**同一个工具链环境**（`/tmp/qingyu_deps`）中完成，未合并任何不同版本环境的结果：

```text
$ node -v
v20.20.2

$ npm -v
10.8.2

$ npm ls vite typescript vitest @playwright/test
qingyu-deps@1.0.0 /tmp/qingyu_deps
├── @playwright/test@1.64.0
├── typescript@7.0.2
├── vite@8.3.4
└── vitest@5.0.4

$ ../node_modules/.bin/vite --version
vite/8.3.4 linux-x64 node-v20.20.2

$ ../node_modules/.bin/tsc --version
Version 7.0.2
```

- **依赖锁定文件**：`/tmp/qingyu_deps/package-lock.json`（已生成并锁定全部依赖树，`vite@8.3.4` 严格满足正式目录 `package.json` 声明的 `"vite": "^8.3.0"`）。
- **可复现安装命令**（针对 Google Drive FUSE 挂载目录不支持 `.bin` 软链接的隔离安装方案）：
  ```bash
  mkdir -p /tmp/qingyu_deps/work
  cp "/home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/package.json" /tmp/qingyu_deps/package.json
  cd /tmp/qingyu_deps && npm install --no-audit --no-fund
  ```

---

## 二、正式工作目录与测试副本 SHA-256 一致性核验（Section 六）

在执行最终测试之前与测试截图回写之后，对正式工作目录与 `/tmp/qingyu_deps/work` 下全部受测文件（`src/`、`tests/`、`package.json`、`playwright.config.ts`、`tsconfig.json`、`vite.config.ts`、`index.html`）执行逐文件 SHA-256 比对：

```text
$ (cd "$FORMAL" && find src tests package.json playwright.config.ts tsconfig.json vite.config.ts index.html -type f | sort | xargs sha256sum) > "$SCRATCH/pre_test_formal_sha256.txt"
$ (cd "$WORK" && find src tests package.json playwright.config.ts tsconfig.json vite.config.ts index.html -type f | sort | xargs sha256sum) > "$SCRATCH/pre_test_work_sha256.txt"
$ diff -u "$SCRATCH/pre_test_formal_sha256.txt" "$SCRATCH/pre_test_work_sha256.txt"
PRE_TEST_SHA256_DIFF_EXIT=0

# 测试完成并同步六视口截图后再次校验：
$ diff -u "$SCRATCH/post_test_formal_sha256.txt" "$SCRATCH/post_test_work_sha256.txt"
POST_TEST_SHA256_DIFF_EXIT=0
```

- 核验清单存档路径：
  - `/home/voga/.gemini/antigravity/brain/14e51dfc-628e-475c-bb64-37e80b5c7d73/scratch/pre_test_formal_sha256.txt`
  - `/home/voga/.gemini/antigravity/brain/14e51dfc-628e-475c-bb64-37e80b5c7d73/scratch/post_test_formal_sha256.txt`

---

## 三、TypeScript 全项目编译检查 (`tsc --noEmit`)（Section 三）

- **执行命令**：`../node_modules/.bin/tsc --noEmit`
- **退出码**：`0`
- **原始日志**（`/home/voga/.gemini/antigravity/brain/14e51dfc-628e-475c-bb64-37e80b5c7d73/scratch/final_tsc.log`）：
  ```text
  (0 bytes output — 0 errors, TSC_EXIT=0)
  ```

---

## 四、Vitest 全量单元与真实 React 组件测试 (`vitest run`)（Section 二 & 三）

- **执行命令**：`../node_modules/.bin/vitest run`
- **退出码**：`0`
- **原始日志**（`/home/voga/.gemini/antigravity/brain/14e51dfc-628e-475c-bb64-37e80b5c7d73/scratch/final_vitest.log`）：

```text
 RUN  v5.0.4 /tmp/qingyu_deps/work

 ✓ tests/domain/hugContract.test.ts (4 tests) 3ms
 ✓ src/tests/weather.test.ts (4 tests) 5ms
 ✓ src/tests/interactive3D.test.ts (5 tests) 3ms
 ✓ tests/domain/pwaOffline.test.ts (14 tests) 10ms
 ✓ tests/domain/hug.test.ts (10 tests) 17ms
 ✓ tests/domain/weeklyReportService.test.ts (4 tests) 16ms
 ✓ src/tests/speechSystem.test.ts (27 tests) 20ms
 ✓ tests/domain/firestoreRules.test.ts (10 tests) 4ms
 ✓ tests/domain/weather.test.ts (6 tests) 5ms
 ✓ tests/domain/caregiver.test.ts (9 tests) 6ms
 ✓ tests/domain/interactiveGamesE2E.test.ts (4 tests) 5ms
 ✓ tests/domain/interactiveGamesState.test.ts (13 tests) 10ms
 ✓ src/tests/contentAuditRegistry.test.ts (13 tests) 7ms
 ✓ tests/domain/safety.test.ts (12 tests) 6ms
 ✓ tests/domain/scaffolding.test.ts (4 tests) 5ms
 ✓ tests/domain/transfer.test.ts (17 tests) 13ms
 ✓ tests/domain/personalizationEngine.test.ts (17 tests) 12ms
 ✓ tests/domain/research.test.ts (9 tests) 10ms
 ✓ tests/domain/cognitiveKernel.test.ts (18 tests) 14ms
 ✓ tests/domain/cloudflarePagesAdapter.test.ts (6 tests) 27ms
 ✓ src/tests/parentingPocketTips.test.ts (6 tests) 4ms
 ✓ src/tests/calmSpace.test.ts (7 tests) 20ms
 ✓ src/tests/cognitiveEncyclopedia.test.ts (5 tests) 4ms
 ✓ src/tests/growthObservationLog.test.ts (2 tests) 3ms
 ✓ src/tests/parentMedals.test.ts (5 tests) 6ms
 ✓ tests/domain/backendAuthData.test.ts (12 tests) 143ms
 ✓ tests/domain/p0SecurityRemediation.test.ts (18 tests) 167ms
 ✓ src/tests/adultPreviewSessionLeak.test.tsx (3 tests) 199ms

 Test Files  28 passed (28)
      Tests  264 passed (264)
   Start at  20:43:52
   Duration  470ms (transform 38%, import 32%, tests 26%, worker 4%)
```

---

## 五、Vite 生产构建验证 (`vite build`)（Section 四）

- **执行命令**：`../node_modules/.bin/vite build`
- **退出码**：`0`
- **原始日志**（`/home/voga/.gemini/antigravity/brain/14e51dfc-628e-475c-bb64-37e80b5c7d73/scratch/final_vite_build.log`）：

```text
vite v8.3.4 building client environment for production...
✓ 1723 modules transformed.
dist/index.html                   0.52 kB │ gzip:   0.37 kB
dist/assets/index-CA4f2Nst.css   84.42 kB │ gzip:  13.56 kB
dist/assets/index-D16t9b1F.js   594.94 kB │ gzip: 169.39 kB
✓ built in 686ms
```

---

## 六、Playwright 六视口全矩阵与负向安全 E2E 测试（Section 五 A–H）

- **执行命令**：`../node_modules/.bin/playwright test --reporter=list`
- **退出码**：`0`
- **通过率**：**78 passed (78)**（6 个视口 × 13 个 E2E 测试用例 = 78 项，0 失败，0 跳过）
- **原始日志**（`/home/voga/.gemini/antigravity/brain/14e51dfc-628e-475c-bb64-37e80b5c7d73/scratch/final_playwright.log`）：

```text
Running 78 tests using 1 worker

  ✓   1 [Mobile-360] › tests/e2e/accessibility-reduced-motion.spec.ts:11:3 › Accessibility & Reduced Motion Hardening › Child interactive elements meet 56px minimum standard and have aria-labels (319ms)
  ✓   2 [Mobile-360] › tests/e2e/accessibility-reduced-motion.spec.ts:36:3 › Accessibility & Reduced Motion Hardening › Requirement 五.E: Reduced-motion mode verifies real computed animation/transition properties and JavaScript interactions (344ms)
  ✓   3 [Mobile-360] › tests/e2e/accessibility-reduced-motion.spec.ts:92:3 › Accessibility & Reduced Motion Hardening › No horizontal overflow on critical screens and modals (296ms)
  ✓   4 [Mobile-360] › tests/e2e/dual-tab-lifecycle.spec.ts:14:3 › Dual-Tab Child & Parent Lifecycle E2E Hardening › Full lifecycle: Child triggers local hug reminder & local miss note -> Parent authenticates via PIN gate -> Returning to child mode locks parent session (998ms)
  ✓   5 [Mobile-360] › tests/e2e/dual-tab-lifecycle.spec.ts:102:3 › Dual-Tab Child & Parent Lifecycle E2E Hardening › Duplicate click guard on local hug reminder keeps state deterministic without crash (270ms)
  ✓   6 [Mobile-360] › tests/e2e/viewport-overflow.spec.ts:11:3 › Child-First Design System Viewport & Overflow Tests (AG-04A & Phase 1A-FIX) › Child Home must not have horizontal scrollbar on any supported viewport (195ms)
  ✓   7 [Mobile-360] › tests/e2e/viewport-overflow.spec.ts:33:3 › Child-First Design System Viewport & Overflow Tests (AG-04A & Phase 1A-FIX) › Both Fairytale Island Map and Card views must render without horizontal overflow (220ms)
  ✓   8 [Mobile-360] › tests/e2e/viewport-overflow.spec.ts:58:3 › Child-First Design System Viewport & Overflow Tests (AG-04A & Phase 1A-FIX) › Requirement 五.D & 五.G: Six-viewport key child buttons width/height >= 56px, on-screen clickability, and 360px/390px first-screen reality help entry without scrolling or overlap (543ms)
  ✓   9 [Mobile-360] › tests/e2e/viewport-overflow.spec.ts:154:3 › Child-First Design System Viewport & Overflow Tests (AG-04A & Phase 1A-FIX) › Requirement 五.A, 五.B, 五.C: Negative E2E tests for Adult Review Preview session leak, wrong PIN rejection, and async PIN close cancellation (851ms)
  ✓  10 [Mobile-360] › tests/e2e/viewport-overflow.spec.ts:235:3 › Child-First Design System Viewport & Overflow Tests (AG-04A & Phase 1A-FIX) › Requirement 五.F: Reality help entry executes real click, verifies honest local-only child copy and zero remote network requests (345ms)
  ✓  11 [Mobile-360] › tests/e2e/viewport-overflow.spec.ts:276:3 › Child-First Design System Viewport & Overflow Tests (AG-04A & Phase 1A-FIX) › Phase 1A Matrix (A/B/C/E): Mobile first-screen layout, no vertical title stacking, >=56px core actions, SVG icons, no Navbar/Hug overlap (226ms)
  ✓  12 [Mobile-360] › tests/e2e/viewport-overflow.spec.ts:325:3 › Child-First Design System Viewport & Overflow Tests (AG-04A & Phase 1A-FIX) › Phase 1A Matrix (D/F/H/I): Scene entry/exit, dense grids, scroll hints, content audit gate & ParentGate protection, privacy & reduced motion (862ms)
  ✓  13 [Mobile-360] › tests/e2e/viewport-overflow.spec.ts:392:3 › Child-First Design System Viewport & Overflow Tests (AG-04A & Phase 1A-FIX) › Create screenshot baseline for child home across all 6 viewports (238ms)
  ...
  (Mobile-390 [14..26], Mobile-430 [27..39], Tablet-768 [40..52], Tablet-1024 [53..65] 全部通过)
  ...
  ✓  66 [Desktop-1440] › tests/e2e/accessibility-reduced-motion.spec.ts:11:3 › Accessibility & Reduced Motion Hardening › Child interactive elements meet 56px minimum standard and have aria-labels (498ms)
  ✓  67 [Desktop-1440] › tests/e2e/accessibility-reduced-motion.spec.ts:36:3 › Accessibility & Reduced Motion Hardening › Requirement 五.E: Reduced-motion mode verifies real computed animation/transition properties and JavaScript interactions (398ms)
  ✓  68 [Desktop-1440] › tests/e2e/accessibility-reduced-motion.spec.ts:92:3 › Accessibility & Reduced Motion Hardening › No horizontal overflow on critical screens and modals (342ms)
  ✓  69 [Desktop-1440] › tests/e2e/dual-tab-lifecycle.spec.ts:14:3 › Dual-Tab Child & Parent Lifecycle E2E Hardening › Full lifecycle: Child triggers local hug reminder & local miss note -> Parent authenticates via PIN gate -> Returning to child mode locks parent session (1.2s)
  ✓  70 [Desktop-1440] › tests/e2e/dual-tab-lifecycle.spec.ts:102:3 › Dual-Tab Child & Parent Lifecycle E2E Hardening › Duplicate click guard on local hug reminder keeps state deterministic without crash (367ms)
  ✓  71 [Desktop-1440] › tests/e2e/viewport-overflow.spec.ts:11:3 › Child-First Design System Viewport & Overflow Tests (AG-04A & Phase 1A-FIX) › Child Home must not have horizontal scrollbar on any supported viewport (224ms)
  ✓  72 [Desktop-1440] › tests/e2e/viewport-overflow.spec.ts:33:3 › Child-First Design System Viewport & Overflow Tests (AG-04A & Phase 1A-FIX) › Both Fairytale Island Map and Card views must render without horizontal overflow (275ms)
  ✓  73 [Desktop-1440] › tests/e2e/viewport-overflow.spec.ts:58:3 › Child-First Design System Viewport & Overflow Tests (AG-04A & Phase 1A-FIX) › Requirement 五.D & 五.G: Six-viewport key child buttons width/height >= 56px, on-screen clickability, and 360px/390px first-screen reality help entry without scrolling or overlap (574ms)
  ✓  74 [Desktop-1440] › tests/e2e/viewport-overflow.spec.ts:154:3 › Child-First Design System Viewport & Overflow Tests (AG-04A & Phase 1A-FIX) › Requirement 五.A, 五.B, 五.C: Negative E2E tests for Adult Review Preview session leak, wrong PIN rejection, and async PIN close cancellation (1.3s)
  ✓  75 [Desktop-1440] › tests/e2e/viewport-overflow.spec.ts:235:3 › Child-First Design System Viewport & Overflow Tests (AG-04A & Phase 1A-FIX) › Requirement 五.F: Reality help entry executes real click, verifies honest local-only child copy and zero remote network requests (488ms)
  ✓  76 [Desktop-1440] › tests/e2e/viewport-overflow.spec.ts:276:3 › Child-First Design System Viewport & Overflow Tests (AG-04A & Phase 1A-FIX) › Phase 1A Matrix (A/B/C/E): Mobile first-screen layout, no vertical title stacking, >=56px core actions, SVG icons, no Navbar/Hug overlap (235ms)
  ✓  77 [Desktop-1440] › tests/e2e/viewport-overflow.spec.ts:325:3 › Child-First Design System Viewport & Overflow Tests (AG-04A & Phase 1A-FIX) › Phase 1A Matrix (D/F/H/I): Scene entry/exit, dense grids, scroll hints, content audit gate & ParentGate protection, privacy & reduced motion (1.1s)
  ✓  78 [Desktop-1440] › tests/e2e/viewport-overflow.spec.ts:392:3 › Child-First Design System Viewport & Overflow Tests (AG-04A & Phase 1A-FIX) › Create screenshot baseline for child home across all 6 viewports (299ms)

  78 passed (41.4s)
```
