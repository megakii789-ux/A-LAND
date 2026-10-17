# A-LAND V2.2《一只杯子，是大还是小？》独立视觉换肤工程样板 · Gate 3R–4R 复审交接报告

## 0. 门禁状态与核心声明（严禁自称 `ENGINEERING_PILOT_PASS`）

| 门禁维度 | 当前状态 | 说明 |
| :--- | :--- | :--- |
| **美术总监门禁 (`artDirectorGate`)** | `ART_DIRECTOR_QA_HOLD` | 当前素材满足工程样板接入条件（5 层背景 + 4 独立道具 + 2 个 9 部件骨骼 Rig），尚未达到最终 4K Blender 3D 绘本母版与逐音素口型标准 |
| **内容校订标记 (`contentQaFlag`)** | `CONTENT_QA_REVIEW` | 冻结数据文件 `src/data/interactiveStoryGroveData.ts` 保持原样未修改，旧文案标记归入默认折叠的审阅抽屉 |
| **工程样板门禁 (`engineeringPilotGate`)** | `ENGINEERING_AUDIT_HOLD` | 已完成 Gate 3R–4R 全部四项 P1 缺陷与 Gate 4R 最小闭环三项要求（固定部署溯源统一、SVG `:focus-visible` 键盘可见焦点及截图、冻结源码提交完整重跑测试）；**在独立复审通过前，绝不自行声明 `ENGINEERING_PILOT_PASS`** |
| **内容安全门禁 (`ContentAuditRegistry`)** | `FAIL_CLOSED_PENDING_AUDIT` | `16/16 PENDING_REVIEW`，儿童模式默认拦截，仅在成人 PIN 校验会话或隔离审阅流下可进入样板预览 |

---

## 1. 权威版本溯源与固定部署标识（Gate4R-01）

- **权威源码与部署提交 (`CANONICAL_CODE_SHA`)**：`1330a797824c4d55a367ad04b7e7099d71cf8e6a`
- **固定不可变部署 ID (`immutableDeploymentId`)**：`a62a63cf`
- **固定不可变部署 URL（唯一发布标识）**：
  - 样板直达：`https://a62a63cf.qingyu-island-v2-assetlab.pages.dev/visual-v2-review/story-cup-pilot`
  - 部署元数据：`https://a62a63cf.qingyu-island-v2-assetlab.pages.dev/version.json`
- **分支固定别名 URL**：
  - 样板直达：`https://ui-visual-v2-story-pilot-n35m.qingyu-island-v2-assetlab.pages.dev/visual-v2-review/story-cup-pilot`
  - 部署元数据：`https://ui-visual-v2-story-pilot-n35m.qingyu-island-v2-assetlab.pages.dev/version.json`
- **同源证明**：`npm_ci.log`、`typecheck.log`、`vitest.log`、`build.log`、`playwright.log`、`GATE3R_6VIEWPORT_REPORT.json` 与 `LIVE_VERSION_JSON_RESPONSE.txt` 全部在 `1330a797824c4d55a367ad04b7e7099d71cf8e6a` 上生成，随后通过单次纯归档提交封存至 GitHub `HEAD` 并原样同步至 Google Drive，详见 `PROVENANCE_DELTA_AND_CANONICAL_RELEASE.md`。

---

## 2. Gate 3R–4R 工程修复摘要

### 2.1 P1-01：手机与桌面分层合成及统一坐标变换矩阵
- 在 `src/visual-v2/story-cup-pilot/StoryCupSceneArtV2.tsx` 中定义 `STORY_CUP_STAGE_MATRIX_MOBILE` (`viewBox="0 0 420 747"`, `aspect-[9/16]`) 与 `STORY_CUP_STAGE_MATRIX_DESKTOP` (`viewBox="0 0 420 220"`, `aspect-[21/11]`)，由 `StoryCupSceneArtV2` 与 `StoryGroveModal` 共享同一套 `StoryCupStageMatrix`。
- `L1..L5` 图层全部改为 `object-fill` 等比贴合对应舞台画布（`zeroObjectCoverClipping: true`），裁切率降为 **`0.0%`**。
- 在 `360×800`、`390×844`、`430×932` 下，四个可交互道具、三个虚线放置区及跳跳/噗噗角色均精准落在 `L4_tabletop` 木桌台面上，并在 `390×844` 下通过真实 `page.mouse` 指针拖拽测试。

### 2.2 P1-02：故事角色口型与说话人归属分离
- 新增 `resolveActiveStorySpeaker({ playbackStatus, activeHotspotId, selectedSceneActionId })` 与按 `characterId` 区分的 `resolveStoryCharacterVisualState()`。
- **跳跳单人台词**（`activeHotspotId === 'obj_wooden_block'`）：仅 `tiaotiao_story_squirrel` 进入 `talk`，`pupu_story_elephant` 保持 `think` 倾听态。
- **噗噗单人台词**（`activeHotspotId === 'obj_elephant_bucket'`）：仅 `pupu_story_elephant` 进入 `talk`，`tiaotiao_story_squirrel` 保持 `think` 倾听态。
- **旁白提示/中立道具/多角色总结**：`activeStorySpeaker = 'narrator_or_multi'`，跳跳与噗噗均处于安静倾听/观察态（`idle` 或 `think`），**任何时刻绝不出现两角色同时张嘴**（`bothTalkingSimultaneously: false`）。

### 2.3 P1-03：儿童主界面去工程噪音与 V1 零意外回归
- 将 `StoryCupLayerControlBarV2` 移至 `interactive-leaf-view-cup-size` 底部，重构为**默认收起**的审阅调试抽屉（`data-testid="v2-story-cup-debug-drawer-toggle"`, `aria-expanded="false"`），并在 `SceneBackdropV2.tsx` 中隐藏 `story` 场景外围悬浮胶囊。
- 在 `StoryGroveModal.tsx` 中恢复非 V2 样板（`!isV2CupPilot`）下的原有按钮高度类（`min-h-[48px]`）。

### 2.4 P1-04 & Gate3R-UX-02：SVG 触控命中区 `>= 56×56 CSS px`、真实无障碍树与键盘可见焦点（`:focus-visible`）
- 在最窄手机视口 `360×800`（缩放比 `0.6667`）下，三个放置区实测渲染尺寸为 **`56.0×57.3 CSS px`**，可移动蓝水杯实测 **`58.7×59.3 CSS px`**，且三处放置区互不重叠（`dropzonesNonOverlapping: true`）。
- V2 样板下 `<svg role="group">`，三个放置区与 `movable-blue-cup-prop` 均具备 `role="button"`、`tabIndex={0}`、`aria-label` 与键盘事件，并通过 Chromium CDP `Accessibility.getFullAXTree` 实测确认暴露在无障碍树中。
- **移除内联 `outline: none`**，通过 `.v2-story-svg-focusable:focus-visible` 提供高对比度 `#0284C7` `3.5px` 实线外框与描边高亮；Playwright 实测按 `Tab` 聚焦至放置区与蓝水杯并执行 `Enter` / `Space` / `ArrowLeft` / `ArrowRight`，保存两张焦点截图：`screenshots/v2_2_gate4r_keyboard_focus_dropzone.png` 与 `screenshots/v2_2_gate4r_keyboard_focus_movable_cup.png`。

---

## 3. 六视口真实浏览器实测汇总（Playwright Chromium @ `1330a797824c4d55a367ad04b7e7099d71cf8e6a`）

| 视口 | 舞台模式 | SVG `viewBox` | 舞台渲染尺寸 (CSS px) | CTM 缩放比 | 水杯底边 `Y` / 台面区间 | SVG 放置区实测尺寸 (CSS px) | 水杯命中区尺寸 (CSS px) | DOM 按钮 `>=56px` | 默认隐藏调试条 | 横向溢出 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `360×800` | `mobile` | `0 0 420 747` | `280.0×500.9` | `0.6667` | `602.2` ∈ `[555, 618]` | `56.0×57.3` | `58.7×59.3` | `true` | `true` | `false` (`360/360`) |
| `390×844` | `mobile` | `0 0 420 747` | `310.0×554.2` | `0.7381` | `601.9` ∈ `[555, 618]` | `62.0×63.5` | `65.0×66.0` | `true` | `true` | `false` (`390/390`) |
| `430×932` | `mobile` | `0 0 420 747` | `350.0×625.3` | `0.8333` | `601.7` ∈ `[555, 618]` | `70.0×71.7` | `73.3×73.7` | `true` | `true` | `false` (`430/430`) |
| `768×1024` | `desktop` | `0 0 420 220` | `576.0×299.8` | `1.3627` | `190.0` ∈ `[164, 187]` (±8) | `98.1×84.5` | `114.5×114.5` | `true` | `true` | `false` (`768/768`) |
| `1024×1366` | `desktop` | `0 0 420 220` | `576.0×299.8` | `1.3627` | `190.0` ∈ `[164, 187]` (±8) | `98.1×84.5` | `114.5×114.5` | `true` | `true` | `false` (`1024/1024`) |
| `1440×900` | `desktop` | `0 0 420 220` | `576.0×299.8` | `1.3627` | `190.0` ∈ `[164, 187]` (±8) | `98.1×84.5` | `114.5×114.5` | `true` | `true` | `false` (`1440/1440`) |
