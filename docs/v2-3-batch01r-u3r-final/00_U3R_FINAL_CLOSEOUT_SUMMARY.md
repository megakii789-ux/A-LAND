# A-LAND V2.3 Batch01R · Gate U3R 最终工程收尾报告 (`00_U3R_FINAL_CLOSEOUT_SUMMARY.md`)

## 1. 版本与部署溯源 (Canonical Source & Live Deployment Provenance)

| 字段 | 值 |
| :--- | :--- |
| **整改分支 (Isolated Remediation Branch)** | `ui/visual-v2-batch01r-u3r-final` |
| **输入审核基线 (Input Baseline)** | `ui/visual-v2-batch01r-ux-closeout @ 1d10eaf77675216feecba2437de81f3e10f9a0e4` (`CANONICAL_CODE_SHA = c4d8542813d4de212a8efe3a6f830dbea050233f`) |
| **`CANONICAL_CODE_SHA`（测试、构建与线上部署源码提交）** | `6a5ae8d186850ac6ddb30823bf9c87134c10c320` |
| **`ARCHIVE_HEAD_SHA`（含本报告与证据归档的最终分支 HEAD）** | 见 `04_LIVE_VERSION_PROOF/github_branch_head.txt`（仅追加文档与测试证据，源码树与 `6a5ae8d186850ac6ddb30823bf9c87134c10c320` 100% 一致） |
| **Cloudflare Pages Project** | `qingyu-island-v2-assetlab` |
| **Cloudflare Deployment ID (U3R Branch Alias)** | `3bb103aa` (`https://3bb103aa.qingyu-island-v2-assetlab.pages.dev` / `https://ui-visual-v2-batch01r-u3r-fi.qingyu-island-v2-assetlab.pages.dev`) |
| **Cloudflare Deployment ID (Fixed Pilot Alias)** | `9a8b2b87` (`https://9a8b2b87.qingyu-island-v2-assetlab.pages.dev` / `https://ui-visual-v2-story-pilot.qingyu-island-v2-assetlab.pages.dev`) |
| **情绪天气站 V2 预览路由** | `https://3bb103aa.qingyu-island-v2-assetlab.pages.dev/visual-v2-review/weather-station-pilot` |
| **绿草冷静空间 V2 预览路由** | `https://3bb103aa.qingyu-island-v2-assetlab.pages.dev/visual-v2-review/calm-corner-pilot` |
| **绿草平静角弹窗 V2 预览路由** | `https://3bb103aa.qingyu-island-v2-assetlab.pages.dev/visual-v2-review/calm-corner-modal-pilot` |
| **Live `/version.json` URL** | `https://3bb103aa.qingyu-island-v2-assetlab.pages.dev/version.json` / `https://ui-visual-v2-story-pilot.qingyu-island-v2-assetlab.pages.dev/version.json` |

---

## 2. Gate U1 / Gate U2 / 业务与正式分支冻结验证

- **Gate U1（天气站唯一主选择器）**：保持 **PASS**，零返工。
- **Gate U2（移动端 3:4 竖版舞台 0% 裁切与呼吸光球同轴对齐）**：保持 **PASS**，零返工。
- **业务与认知/语音目录冻结检查**：`git diff --name-only src/context src/domain src/services src/data src/utils/speech.ts public/audio/tts` 输出 **0 行变更**。
- **正式与历史分支隔离**：`main`、`preview`、`public-live`、`public-hold`、`ui/visual-v2-story-pilot`、`ui/visual-v2-batch01r-art-remediation`、`ui/visual-v2-batch01r-ux-closeout` 均未修改。

---

## 3. U3R-01：`360×800` 下「绿草冷静空间」标题与语音按钮重叠根因与修复方案

### 3.1 根因分析 (Root Cause)
1. **横向像素预算超支 (`16px`)**：在 `360px` 视口下，原头部内宽为 `274px`（外层 `p-2.5` 扣 `20px` + 卡片 `border-4` 扣 `8px` + `p-3` 扣 `24px` + 头部 `border-3` 扣 `6px` + `px-3.5` 扣 `28px`）。右侧两个 `56×56px` 按钮加间距占 `120px`，中间 `gap-2` 占 `8px`，左侧仅剩 `146px`；而左侧地标图标（`44px`）+ `gap-2.5`（`10px`）+ 六字标题 `绿草冷静空间`（`108px`）共需 `162px`，超出 `16px`。
2. **Flex `min-w-0` + `whitespace-nowrap` 溢出遮挡与测试假阳性**：左侧容器设置了 `min-w-0`（未设 `shrink-0`），浏览器将左侧 Flex 项压缩为 `146px`，而内部 `<h2 class="whitespace-nowrap">` 保持 `108px` 宽度并向右溢出父容器 `16px`，越过 `8px` 间距后有 `8px`（最后一个字「间」右半部分，`x = 223..231px`）探入右侧静音按钮下方被遮挡。同时 `titleEl.scrollWidth === titleEl.clientWidth === 108` 导致旧版 Playwright 断言产生假通过。

### 3.2 修复方案 (`CalmSpace.tsx`、`WeatherStationModal.tsx`、`CalmCornerModal.tsx`)
1. **解除 `min-w-0` Flex 溢出陷阱**：将头部第一行左侧图标+标题容器与标题 `<h2>`/`<h3>` 均设为 `shrink-0`，并在外层行启用 `flex-wrap items-center justify-between gap-x-2 gap-y-2`，彻底杜绝子元素溢出父容器钻入右侧按钮下方的可能。
2. **优化窄屏头部横向空间分配（不缩小 `56×56px` 触控目标、不使用 `truncate` 或 `overflow-hidden`）**：
   - 小屏外层与卡片内边距收紧为 `p-2 sm:p-6`、`p-2.5 sm:p-6`、头部 `px-2.5 py-2 sm:px-3.5 sm:py-2.5`（头部内宽由 `274px` 提升至 `290px`）。
   - 小屏头部地标图标尺寸设为 `w-8 h-8 sm:w-11 sm:h-9`（`32×32px`），标题字号设为 `text-[17px] min-[380px]:text-lg sm:text-2xl tracking-tight`，右侧语音与关闭按钮严格保持 **`56×56 CSS px`**（`w-14 h-14 min-w-[56px] min-h-[56px]`）。
   - 将徽章胶囊（`非竞争 · 随时可离开` / `海湾木屋观景台` / `无压力 · 随时可停`）与副标题统一放置在头部第二行（`border-t` 分隔行），与第一行操作按钮完全上下分离。

---

## 4. U3R-02：Playwright 2D 矩形碰撞面积 (`0px²`) 与 `elementFromPoint` 实机检测结果

详见 `01_HEADER_COLLISION_EVIDENCE/HEADER_COLLISION_AUDIT_U3R.json` 与 `EVIDENCE_U3R_360x800_BEFORE_AFTER.png`。

### 4.1 `CalmSpace`（`绿草冷静空间`）窄屏实测几何数据

| 视口 | `titleRect` (`left..right`, `w×h`) | `audioBtnRect` (`left..right`, `w×h`) | `closeBtnRect` (`left..right`, `w×h`) | 标题-语音按钮水平净距 (`horizontalGapPx`) | 成对矩形交集面积 (`intersectionArea`) | `elementFromPoint` 左/中/右三点命中 `H2[v2-calm-header-title]` | 结果 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`360×800`** | `x: 73.0..172.5` (`99.5×25.5`) | `x: 207.0..263.0` (`56×56`) | `x: 269.0..325.0` (`56×56`) | **`+34.5 px`** (`>= 8px`) | **`0 px²`** (全 8 对均为 `0`) | `(79,77)` / `(122.7,77)` / **`(166.5,77)`** -> **`H2` (100% 命中)** | **PASS** |
| **`390×844`** | `x: 73.0..178.3` (`105.3×28.0`) | `x: 237.0..293.0` (`56×56`) | `x: 299.0..355.0` (`56×56`) | **`+58.7 px`** (`>= 8px`) | **`0 px²`** (全 8 对均为 `0`) | `(79,78.3)` / `(125.6,78.3)` / **`(172.3,78.3)`** -> **`H2` (100% 命中)** | **PASS** |
| **`430×932`** | `x: 73.0..178.3` (`105.3×28.0`) | `x: 277.0..333.0` (`56×56`) | `x: 339.0..395.0` (`56×56`) | **`+98.7 px`** (`>= 8px`) | **`0 px²`** (全 8 对均为 `0`) | `(79,78.3)` / `(125.6,78.3)` / **`(172.3,78.3)`** -> **`H2` (100% 命中)** | **PASS** |

### 4.2 `WeatherStationModal`（`情绪天气站`）窄屏实测几何数据

| 视口 | `titleRect` (`left..right`, `w×h`) | `audioBtnRect` (`left..right`, `w×h`) | `closeBtnRect` (`left..right`, `w×h`) | 标题-语音按钮水平净距 (`horizontalGapPx`) | 成对矩形交集面积 (`intersectionArea`) | `elementFromPoint` 左/中/右三点命中 `H2[v2-weather-header-title]` | 结果 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`360×800`** | `x: 77.0..159.9` (`82.9×25.5`) | `x: 203.0..259.0` (`56×56`) | `x: 265.0..321.0` (`56×56`) | **`+43.1 px`** (`>= 8px`) | **`0 px²`** (全 8 对均为 `0`) | `(83,87)` / `(118.4,87)` / **`(153.9,87)`** -> **`H2` (100% 命中)** | **PASS** |
| **`390×844`** | `x: 77.0..164.7` (`87.7×28.0`) | `x: 233.0..289.0` (`56×56`) | `x: 295.0..351.0` (`56×56`) | **`+68.3 px`** (`>= 8px`) | **`0 px²`** (全 8 对均为 `0`) | `(83,88.3)` / `(120.9,88.3)` / **`(158.7,88.3)`** -> **`H2` (100% 命中)** | **PASS** |
| **`430×932`** | `x: 77.0..164.7` (`87.7×28.0`) | `x: 273.0..329.0` (`56×56`) | `x: 335.0..391.0` (`56×56`) | **`+108.3 px`** (`>= 8px`) | **`0 px²`** (全 8 对均为 `0`) | `(83,88.3)` / `(120.9,88.3)` / **`(158.7,88.3)`** -> **`H2` (100% 命中)** | **PASS** |

---

## 5. 全套验证门禁与强制保留标志 (Quality Gates & Hold Flags)

- `npm run typecheck` (`tsc --noEmit`): **0 errors** (`03_TEST_AND_BUILD_LOGS/typecheck.log`)
- `npm test` (`vitest run`): **40 passed suites / 405 passed tests** (`03_TEST_AND_BUILD_LOGS/vitest.log`)
- `npm run build` (`vite build` + `generate-version-json.mjs`): **PASS** (`03_TEST_AND_BUILD_LOGS/build.log`)
- `node scripts/verify_v2_3_batch01r_art_remediation.mjs`: **6/6 viewports (`360×800`, `390×844`, `430×932`, `768×1024`, `1024×1366`, `1440×900`) PASS**, `consoleErrors = 0`, `pageErrors = 0`, `http404s = 0` (`03_TEST_AND_BUILD_LOGS/playwright_u3r_report.json`)
- **强制保留门禁标志**：
  - `ASSET_ARTWORK_BLOCKED = true` (`productionQualityApproved = 0`)
  - `ART_DIRECTOR_QA_HOLD = true`
  - `CONTENT_QA_REVIEW = true` (`16/16 PENDING_REVIEW`, `renderableInChildModeCount = 0`)
  - `PRODUCTION_RELEASE_HOLD = true`
