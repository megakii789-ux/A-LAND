# A-LAND V2.3 Batch 01（情绪天气站 + 绿草平静角）独立视觉换肤工程交接清单 (`GATE_A_TO_E_DELIVERY_MANIFEST.md`)

## 0. 唯一源码身份与同源可复算声明（Gate E）

| 字段 | 权威值 |
| :--- | :--- |
| **仓库** | `megakii789-ux/A-LAND` |
| **基线分支与冻结提交** | `origin/ui/visual-v2-story-pilot` @ `21fadb75822860f6a76e272ecf7be345a8769949`（对应源码提交 `1330a797824c4d55a367ad04b7e7099d71cf8e6a`） |
| **V2.3 Batch 01 独立工作分支** | `ui/visual-v2-batch01-weather-calm` |
| **唯一权威源码提交 (`CANONICAL_CODE_SHA`)** | `ed63f8382ac29e18234d85ebc65dae17ce19383d` |
| **输入素材包与 SHA-256** | `A_LAND_V2_3_TECH_VECTOR_LAYER_FACTORY_20261017.zip` (`359,075` bytes, SHA-256: `f98f3d84f87e0a358e522d0566acf3628c1c66234d3181f59bd00fae07637a74`) |
| **固定部署 URL（Deployment Permalink）** | `https://6ef5d637.qingyu-island-v2-assetlab.pages.dev` |
| **分支别名预览 URL（Branch Alias）** | `https://ui-visual-v2-batch01-weather.qingyu-island-v2-assetlab.pages.dev` |
| **天气站样板直达预览路由** | `https://6ef5d637.qingyu-island-v2-assetlab.pages.dev/visual-v2-review/weather-station-pilot` |
| **平静角样板直达预览路由** | `https://6ef5d637.qingyu-island-v2-assetlab.pages.dev/visual-v2-review/calm-corner-pilot` |
| **平静角弹窗直达预览路由** | `https://6ef5d637.qingyu-island-v2-assetlab.pages.dev/visual-v2-review/calm-corner-modal-pilot` |
| **V2.2《一只杯子》回归验证路由** | `https://6ef5d637.qingyu-island-v2-assetlab.pages.dev/visual-v2-review/story-cup-pilot` |
| **原版网站对照链接（未改动）** | `https://qingyu-island-preview.pages.dev/` |
| **线上 `/version.json` 实测 `commitSha`** | `ed63f8382ac29e18234d85ebc65dae17ce19383d`（HTTP `200`） |

> **两阶段同源提交闭环说明**：
> 1. **Commit 1 (`CANONICAL_CODE_SHA = ed63f8382ac29e18234d85ebc65dae17ce19383d`)**：冻结全部源码、V2.3 静态资源、测试与验证脚本。
> 2. 在干净的 `HEAD == ed63f8382ac29e18234d85ebc65dae17ce19383d` 上执行 `npm ci`、`npm run typecheck`、`npm test`、`npm run build`、`node scripts/verify_v2_3_batch01_weather_calm.mjs` 及 Cloudflare Pages 部署，确保构建产物、`dist/version.json`、测试日志、Playwright 报告与线上 `/version.json` 100% 指向 `ed63f8382ac29e18234d85ebc65dae17ce19383d`。
> 3. **Commit 2 (`ARCHIVE_HEAD_SHA`)**：仅提交 `docs/v2-3-batch01-weather-calm/**` 证据归档目录，`git diff ed63f8382ac29e18234d85ebc65dae17ce19383d HEAD -- src/ public/ scripts/` 为 **0 行差异**。

---

## 1. 强制门禁与诚实披露状态

- `artDirectorQaGate`: `ART_DIRECTOR_QA_HOLD`
- `techPreviewGate`: `TECH_PREVIEW_NOT_ART_APPROVED`
- `engineeringPilotGate`: `ENGINEERING_PILOT_AUDIT_PASS_STORY_CUP_ONLY`
- `v2_3Batch01Gate`: `V2_3_BATCH01_TECH_INTEGRATION_AUTHORIZED`
- `productionReleaseGate`: `PRODUCTION_RELEASE_HOLD`
- `contentQaReviewFlag`: `CONTENT_QA_REVIEW`
- `productionQualityApprovedCount`: `0`（318 个分层 SVG 对应 94 个唯一字节体，全部仅作为工程分层适配与视觉验证资源，不宣传为最终生产级 3D 美术）
- **正式分支零触碰**：`main`、`preview`、`public-live`、`public-hold` 及 `ui/visual-v2-story-pilot` 均未发生任何修改。
- **冻结业务层零触碰**：`src/context/AppContext.tsx`、`src/domain/**`、`src/services/**`、`src/utils/speech.ts`、`src/data/**`、`public/audio/tts/**` 均保持 0 行改动。

---

## 2. Gate A–E 完成矩阵

| Gate | 核心交付内容 | 源码文件 / 证据归档 | 结果 |
| :--- | :--- | :--- | :--- |
| **Gate 0 / Baseline** | 验证 V2.3 ZIP SHA-256 (`f98f3d84...`)、335 条 `SHA256SUMS.txt`、318 个 SVG（94 个唯一字节体），并从 `21fadb75...` 切出独立 worktree `ui/visual-v2-batch01-weather-calm` | `public/visual-v2/v2-3-layer-factory/**` | **PASS** |
| **Gate A** | 强类型资源清单与几何复用披露 (`v2_3Batch01Manifest.ts`)、带 SVG Data-URI 自动降级的图层组件 (`V2_3ResilientSvgLayer`)、4 伙伴 7 部件角色 (`V2_3CompanionRigActor`，口型严格受 `speechNarrator` 播放状态与 `prefers-reduced-motion` 双重门控)、媒体加载耗时追踪器 (`useV2_3MediaLoadTracker`)、默认折叠的审阅/工程调试抽屉 (`V2_3ReviewerDebugDrawer`) | `src/visual-v2/manifest/v2_3Batch01Manifest.ts`, `src/visual-v2/adapters/V2_3LayerStageAdapter.tsx` | **PASS** |
| **Gate B** | 情绪天气站 V2 真实场景换肤 (`WeatherStationSceneArtV2.tsx` + `WeatherStationModal.tsx`)：完整保留 Step 1 天上的眼睛、Step 2 六种天气（晴/阴/雨/雷/雾/我不想选）、双重天气并存、定性强度三档（轻微/明显/强烈）、身体感觉地图、Step 3 高负荷天气接住与直达平静角入口；桌面 `16:9` / 手机 `420×340` 双坐标矩阵，SVG 快捷天气热区全部 `>= 56×56 CSS px` 且支持键盘 `:focus-visible` 高对比度焦点环 | `src/visual-v2/batch01/WeatherStationSceneArtV2.tsx`, `src/components/ChildIsland/WeatherStationModal.tsx` | **PASS** |
| **Gate C** | 绿草平静角 V2 真实场景换肤 (`CalmCornerSceneArtV2.tsx` + `CalmSpace.tsx` + `CalmCornerModal.tsx`)：完整保留 4-2-4-2 非竞争呼吸节律、暂停/继续立即冻结（切换至独立 `paused` 图层并停止缩放）、静音开关、三种颜色接地练习（红/黄/蓝 及 红/黄/绿）、给身旁大人的共同调节卡、现实拥抱请求与安全返回小岛；桌面 `16:9` / 手机 `420×340` 双坐标矩阵，SVG 呼吸球与颜色接地石全部 `>= 56×56 CSS px` 且支持键盘 `:focus-visible` | `src/visual-v2/batch01/CalmCornerSceneArtV2.tsx`, `src/components/ChildIsland/CalmSpace.tsx`, `src/components/ChildIsland/CalmCornerModal.tsx` | **PASS** |
| **Gate D** | 在唯一源码提交 `ed63f8382ac29e18234d85ebc65dae17ce19383d` 上执行 `npm ci`、`npm run typecheck`（0 错误）、`npm test`（40 个测试文件 / 400 条用例全部通过）、`npm run build` 及 Playwright 六视口真实浏览器验证（`360x800`, `390x844`, `430x932`, `768x1024`, `1024x1366`, `1440x900` 原版/V2 成对截图 24 张 + 深度状态流转、键盘焦点、`prefers-reduced-motion` 与 `StoryCup` 回归截图 14 张 = 共 38 张真实浏览器截图，0 console error，0 page error，0 HTTP 404，0 横向溢出） | `RAW_NPM_CI.log`, `RAW_TYPECHECK.log`, `RAW_VITEST.log`, `RAW_BUILD.log`, `RAW_PLAYWRIGHT_6VIEWPORT.log`, `GATE_D_6VIEWPORT_AND_E2E_REPORT.json`, `screenshots/*.png` | **PASS** |
| **Gate E** | 部署至 Cloudflare Pages (`qingyu-island-v2-assetlab`)，实测 `/version.json` HTTP 200 且 `commitSha === ed63f8382ac29e18234d85ebc65dae17ce19383d`；生成 `SHA256SUMS.txt` 并与 Google Drive V2.3 交接目录完成 100% 字节级同步 | `RAW_WRANGLER_DEPLOY.log`, `LIVE_VERSION_JSON_RESPONSE.txt`, `SHA256SUMS.txt` | **PASS** |
