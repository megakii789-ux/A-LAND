# A-LAND V2.2《一只杯子，是大还是小？》独立视觉换肤工程样板 · Gate 3R–4R 复审交接报告

## 0. 门禁状态与核心声明（严禁自称 `ENGINEERING_PILOT_PASS`）

| 门禁维度 | 当前状态 | 说明 |
| :--- | :--- | :--- |
| **美术总监门禁 (`artDirectorGate`)** | `ART_DIRECTOR_QA_HOLD` | 当前素材满足工程样板接入条件（5 层背景 + 4 独立道具 + 2 个 9 部件骨骼 Rig），尚未达到最终 4K Blender 3D 绘本母版与逐音素口型标准 |
| **内容校订标记 (`contentQaFlag`)** | `CONTENT_QA_REVIEW` | 冻结数据文件 `src/data/interactiveStoryGroveData.ts` 保持原样未修改，旧文案标记归入默认折叠的审阅抽屉 |
| **工程样板门禁 (`engineeringPilotGate`)** | `ENGINEERING_AUDIT_HOLD` | 已完成 Gate 3R–4R 全部四项 P1 缺陷与三项 P2 证据项整改；**在 ChatGPT 独立复审通过前，绝不自行声明 `ENGINEERING_PILOT_PASS`** |
| **内容安全门禁 (`ContentAuditRegistry`)** | `FAIL_CLOSED_PENDING_AUDIT` | `16/16 PENDING_REVIEW`，儿童模式默认拦截，仅在成人 PIN 校验会话或隔离审阅流下可进入样板预览 |

---

## 1. Gate 3R 四项 P1 缺陷整改摘要

### 1.1 P1-01：手机与桌面分层合成及统一坐标变换矩阵
- **根因**：此前手机端 (`900×1600`, `9:16`) 与桌面端 (`1600×900`, `16:9`) 均被强制放入 `aspect-[21/11]` 扁平容器并使用 `object-cover`，导致手机端 `L4_tabletop` 木桌台面（位于竖图下部 `y ≈ 1180..1310`）被裁切掉 `70.6%`，积木、水杯、水桶、树枝与三个放置区悬空在树屋窗户半空。
- **修复**：
  - 在 `src/visual-v2/story-cup-pilot/StoryCupSceneArtV2.tsx` 中定义 `STORY_CUP_STAGE_MATRIX_MOBILE` (`viewBox="0 0 420 747"`, `aspect-[9/16]`) 与 `STORY_CUP_STAGE_MATRIX_DESKTOP` (`viewBox="0 0 420 220"`, `aspect-[21/11]`)，由 `StoryCupSceneArtV2` 与 `StoryGroveModal` 共享同一套 `StoryCupStageMatrix`。
  - `L1..L5` 图层全部改为 `object-fill` 等比贴合对应舞台画布（`zeroObjectCoverClipping: true`），裁切率降为 **`0.0%`**。
  - 在 `360×800`、`390×844`、`430×932` 下，四个可交互道具、三个虚线放置区及跳跳/噗噗角色均精准落在 `L4_tabletop` 木桌台面上，并在 `390×844` 下通过真实 `page.mouse` 指针拖拽测试（`NEXT_TO_BLOCK` / `NEXT_TO_BUCKET` 吸附命中）。

### 1.2 P1-02：故事角色口型与说话人归属分离
- **根因**：此前 `tiaotiao_story_squirrel` 与 `pupu_story_elephant` 直接共用 `isSpeaking` 布尔值，导致播放任何语音时两只角色同时张嘴 (`talk`)。
- **修复**：
  - 新增 `resolveActiveStorySpeaker({ voicePlaybackState, activeHotspotId, selectedSceneActionId })` 与按 `characterId` 区分的 `resolveStoryCharacterVisualState()`。
  - **跳跳单人台词**（`activeHotspotId === 'obj_wooden_block'`）：仅 `tiaotiao_story_squirrel` 进入 `talk`，`pupu_story_elephant` 保持 `think` 倾听态。
  - **噗噗单人台词**（`activeHotspotId === 'obj_elephant_bucket'`）：仅 `pupu_story_elephant` 进入 `talk`，`tiaotiao_story_squirrel` 保持 `think` 倾听态。
  - **旁白提示/中立道具/多角色总结**（点击“朗读场景提示”按钮、`obj_blue_cup`、`obj_twig_ruler` 或触发行动结果）：`activeStorySpeaker = 'narrator_or_multi'`，跳跳与噗噗均处于安静倾听/观察态（`idle` 或 `think`），**任何时刻绝不出现两角色同时张嘴**（`bothTalkingSimultaneously: false`）。
  - 语音暂停 (`paused`) 时立即切回 `idle`；切换四位陪伴伙伴（果果/贝贝/天天/奇奇）后恢复朗读完全同步。

### 1.3 P1-03：儿童主界面去工程噪音与 V1 零意外回归
- **根因**：此前 `StoryCupLayerControlBarV2` 直接展示在儿童故事主界面顶部，且 `SceneBackdropV2` 在弹窗外围悬浮 `ART_DIRECTOR_QA_HOLD` 工程条。
- **修复**：
  - 将 `StoryCupLayerControlBarV2` 移至 `interactive-leaf-view-cup-size` 底部，重构为**默认收起**的审阅调试抽屉（`data-testid="v2-story-cup-debug-drawer-toggle"`, `aria-expanded="false"`）。儿童默认阅读与操作视口中不出现 `ART_DIRECTOR_QA_HOLD`、`CONTENT_QA_REVIEW`、语音 ID 或 `L1..L5` 工程按钮；审阅员点击抽屉按钮即可展开查看并切换 `L1..L5`。
  - 在 `SceneBackdropV2.tsx` 中，当 `sceneKey === 'story'` 时隐藏外围浮动胶囊，避免遮挡或污染儿童故事弹窗。
  - 在 `StoryGroveModal.tsx` 中恢复非 V2 样板（`!isV2CupPilot`）下的原有按钮高度类（`min-h-[48px]`），消除对 V1 的非预期样式影响。

### 1.4 P1-04：SVG 触控命中区 `>= 56×56 CSS px` 与真实无障碍树暴露
- **根因**：此前手机端 SVG 缩放后放置区仅 `41.3×37.3 CSS px`（小于 `56×56 CSS px` 合同），且 `<svg role="img">` 屏蔽了内部可交互节点。
- **修复**：
  - 手机端 `STORY_CUP_STAGE_MATRIX_MOBILE` 将三个放置区尺寸设为 `84×86` SVG 单位，可移动水杯命中框设为 `88×88` SVG 单位。在最窄手机视口 `360×800`（缩放比 `0.6667`）下，三个放置区实测渲染尺寸为 **`56.0×57.3 CSS px`**，可移动蓝水杯实测 **`58.7×59.3 CSS px`**，且三处放置区互不重叠（`dropzonesNonOverlapping: true`）。
  - V2 样板下将 `<svg>` 的 `role` 设为 `"group"`，并为三个放置区与 `movable-blue-cup-prop` 赋予 `role="button"`、`tabIndex={0}`、`aria-label` 与键盘事件（`Enter`/`Space`/`ArrowLeft`/`ArrowRight`）。通过 Chromium CDP `Accessibility.getFullAXTree` 实测确认 4 个 SVG 交互节点均作为 `button` 暴露在浏览器无障碍树中。
  - `GATE3R_6VIEWPORT_REPORT.json` 现分别独立统计 `svgSceneHitTargets` 与 `domControlTouchTargets`。

---

## 2. 六视口真实浏览器实测汇总（Playwright Chromium）

| 视口 | 舞台模式 | SVG `viewBox` | 舞台渲染尺寸 (CSS px) | CTM 缩放比 | 水杯底边 `Y` / 台面区间 | SVG 放置区实测尺寸 (CSS px) | 水杯命中区尺寸 (CSS px) | DOM 按钮 `>=56px` | 默认隐藏调试条 | 横向溢出 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `360×800` | `mobile` | `0 0 420 747` | `280.0×500.9` | `0.6667` | `602.2` ∈ `[555, 618]` | `56.0×57.3` | `58.7×59.3` | `true` | `true` | `false` (`360/360`) |
| `390×844` | `mobile` | `0 0 420 747` | `310.0×554.2` | `0.7381` | `601.9` ∈ `[555, 618]` | `62.0×63.5` | `65.0×66.0` | `true` | `true` | `false` (`390/390`) |
| `430×932` | `mobile` | `0 0 420 747` | `350.0×625.3` | `0.8333` | `601.7` ∈ `[555, 618]` | `70.0×71.7` | `73.3×73.7` | `true` | `true` | `false` (`430/430`) |
| `768×1024` | `desktop` | `0 0 420 220` | `576.0×299.8` | `1.3627` | `190.0` ∈ `[164, 187]` (±8) | `98.1×84.5` | `114.5×114.5` | `true` | `true` | `false` (`768/768`) |
| `1024×1366` | `desktop` | `0 0 420 220` | `576.0×299.8` | `1.3627` | `190.0` ∈ `[164, 187]` (±8) | `98.1×84.5` | `114.5×114.5` | `true` | `true` | `false` (`1024/1024`) |
| `1440×900` | `desktop` | `0 0 420 220` | `576.0×299.8` | `1.3627` | `190.0` ∈ `[164, 187]` (±8) | `98.1×84.5` | `114.5×114.5` | `true` | `true` | `false` (`1440/1440`) |

---

## 3. 证据文件索引（均使用仓库与归档包相对路径）

- 缺陷闭环矩阵：`GATE3R_4R_ISSUE_CLOSURE_MATRIX.md`
- 归档总索引：`INDEX.md`
- 六视口实测 JSON 报告：`GATE3R_6VIEWPORT_REPORT.json`（及兼容同名 `GATE3_6VIEWPORT_REPORT.json`）
- 原始测试与构建日志：
  - `typecheck.log`
  - `vitest.log`
  - `build.log`
  - `playwright.log`
- 线上部署实测响应：`LIVE_VERSION_JSON_RESPONSE.txt`
- 校验和清单：`SHA256SUMS.txt`
- 21 张真实浏览器截图（位于 `screenshots/`）：
  - 六视口原版对照：`screenshots/v2_2_gate3_<viewport>_original_cup_size.png`（6 张）
  - 六视口 V2 样板默认态：`screenshots/v2_2_gate3_<viewport>_v2_cup_size.png`（6 张）
  - 手机 `390×844` 积木旁/水桶旁拖拽对比与单人说话态：`screenshots/v2_2_gate3_390x844_position_NEXT_TO_BLOCK.png`、`screenshots/v2_2_gate3_390x844_position_NEXT_TO_BUCKET.png`（2 张）
  - 桌面 `1440×900` 三位置对比态：`screenshots/v2_2_gate3_position_CENTER_TABLE.png`、`screenshots/v2_2_gate3_position_NEXT_TO_BLOCK.png`、`screenshots/v2_2_gate3_position_NEXT_TO_BUCKET.png`（3 张）
  - 展开审阅调试抽屉并关闭 `L1`/`L5`：`screenshots/v2_2_gate3_layer_toggle_L1_L5_off.png`（1 张）
  - 单侧抢下结论未完成引导态：`screenshots/v2_2_gate3_single_side_incomplete.png`（1 张）
  - 双侧对比完成庆祝态：`screenshots/v2_2_gate3_both_sides_completed.png`（1 张）
  - `prefers-reduced-motion: reduce` 静态降级态：`screenshots/v2_2_gate3_prefers_reduced_motion.png`（1 张）
