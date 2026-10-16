# A-LAND V2.2 `StoryGrove::cup-size` — Gate 3R–4R 独立审计整改闭环矩阵

- **基准分支**：`ui/visual-v2-story-pilot`
- **审计基线提交**：`e3f8b1e614f5e52ff6577439083dce0b01a72ff7`
- **审计报告依据**：`A_LAND_V2_2_INDEPENDENT_REVIEW.md` & `ANTIGRAVITY_GATE3R_4R_EXECUTION.md`
- **当前状态声明**：
  - `artDirectorGate`: `ART_DIRECTOR_QA_HOLD`（保留，待补 4K Blender 绘本母版与逐音素口型）
  - `contentQaFlag`: `CONTENT_QA_REVIEW`（保留，`src/data/interactiveStoryGroveData.ts` 冻结不改）
  - `engineeringPilotGate`: `ENGINEERING_AUDIT_HOLD`（在独立复审通过前，不自称 `ENGINEERING_PILOT_PASS`）

---

## 一、P1 / P2 审计缺陷逐项闭环表

| 编号 | 级别 | 审计发现摘要 | 整改前状态（Before） | 整改后状态（After） | 涉及源码与自动化验证证据 |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **P1-01** | **P1** | 手机端 `L1..L5` 竖版 PNG (`900×1600`, 9:16) 塞入 `aspect-[21/11]` 扁平容器并使用 `object-cover`，导致底部 `L4_tabletop` 被裁切约 `70.6%`，道具悬空在树屋窗户半空 | 1. 手机端与桌面端共用固定 `viewBox="0 0 420 220"` (`aspect-[21/11]`)；<br>2. `StoryCupSceneArtV2` 使用 `object-cover` 居中裁切 9:16 竖图；<br>3. 手机端木桌台面 (`y ≈ 1180..1310 / 1600`) 落在容器可视区域之外，4 个道具与 3 个放置区悬浮在半空 | 1. 建立统一响应式舞台坐标变换矩阵 `StoryCupStageMatrix`（`STORY_CUP_STAGE_MATRIX_MOBILE`: `viewBox="0 0 420 747"`, `aspect-[9/16]`；`STORY_CUP_STAGE_MATRIX_DESKTOP`: `viewBox="0 0 420 220"`, `aspect-[21/11]`）；<br>2. `L1..L5` 改为 `object-fill` 精确等比映射，`0.0%` 裁切（`zeroObjectCoverClipping: true`）；<br>3. 手机端（`360×800`, `390×844`, `430×932`）与桌面/平板端（`768×1024`, `1024×1366`, `1440×900`）的积木、蓝水杯、大水桶、刻度树枝、3 个放置区及跳跳/噗噗角色均精准落在 `L4_tabletop` 木桌台面上 | - `src/visual-v2/story-cup-pilot/StoryCupSceneArtV2.tsx`<br>- `src/components/ChildIsland/StoryGrove/StoryGroveModal.tsx`<br>- `screenshots/v2_2_gate3_390x844_v2_cup_size.png`<br>- `screenshots/v2_2_gate3_390x844_position_NEXT_TO_BLOCK.png`<br>- `screenshots/v2_2_gate3_390x844_position_NEXT_TO_BUCKET.png` |
| **P1-02** | **P1** | 跳跳 (`tiaotiao_story_squirrel`) 与噗噗 (`pupu_story_elephant`) 共享同一个 `isSpeaking` 布尔值，任何语音播放时两只角色同时张嘴 (`talk`) | `resolveStoryCharacterVisualState()` 未区分 `characterId` 与当前台词归属，点击场景提示或任一热点时两角色同时进入 `talk` | 1. 新增 `resolveActiveStorySpeaker()` 显式解析当前发声角色：`narrator_or_multi` / `tiaotiao_story_squirrel` / `pupu_story_elephant` / `none`；<br>2. 仅当 `activeHotspotId === 'obj_wooden_block'` 时跳跳进入 `talk`（噗噗保持 `think` 倾听）；仅当 `activeHotspotId === 'obj_elephant_bucket'` 时噗噗进入 `talk`（跳跳保持 `think` 倾听）；<br>3. 旁白朗读场景提示、中立道具（蓝水杯/刻度树枝）及多角色结果叙述时，两角色均保持 `idle`/`think` 倾听态，**绝不同时张嘴**（`bothTalkingSimultaneously: false`）；<br>4. 语音 `paused` 时立即回到 `idle`，切换四位陪伴伙伴声线后继续朗读完全同步 | - `src/visual-v2/story-cup-pilot/StoryCupSceneArtV2.tsx`<br>- `src/tests/storyCupPilotV2_2.test.tsx`<br>- `GATE3R_6VIEWPORT_REPORT.json` (`speakerSeparationVerification`) |
| **P1-03** | **P1** | 儿童故事主界面顶部常驻暴露 `ART_DIRECTOR_QA_HOLD`、`CONTENT_QA_REVIEW`、语音 ID 及 `L1..L5` 工程调试条，且 `SceneBackdropV2` 顶部/底部浮动调试铭牌叠加在画面外框 | 1. `StoryCupLayerControlBarV2` 直接渲染在儿童故事标题下方首屏；<br>2. `SceneBackdropV2` 在 `story` 场景下也在弹窗外层悬浮 `z-[55]` 工程胶囊；<br>3. `StoryGroveModal` 触控高度改动影响了非 V2 模式的 `min-h-[48px]` 样式 | 1. `StoryCupLayerControlBarV2` 移至儿童主交互流最底部，重构为**默认收起**的审阅调试抽屉（`data-testid="v2-story-cup-debug-drawer-toggle"`, `aria-expanded="false"`），展开后才显示 `ART_DIRECTOR_QA_HOLD`、`CONTENT_QA_REVIEW`、发声状态与 `L1..L5` 图层开关；<br>2. `SceneBackdropV2` 在 `sceneKey === 'story'` 时隐藏外层浮动工程胶囊，确保儿童默认视口 `0` 工程调试噪音；<br>3. 恢复非 V2 模式下 `StoryGroveModal` 原有按钮高度类，确保 V1 零意外回归 | - `src/visual-v2/story-cup-pilot/StoryCupSceneArtV2.tsx`<br>- `src/visual-v2/SceneBackdropV2.tsx`<br>- `src/components/ChildIsland/StoryGrove/StoryGroveModal.tsx`<br>- `screenshots/v2_2_gate3_390x844_v2_cup_size.png`<br>- `screenshots/v2_2_gate3_layer_toggle_L1_L5_off.png` |
| **P1-04** | **P1** | SVG 放置区在手机端实测仅 `41.3×37.3 CSS px`（低于 `56×56 CSS px` 合同），且 `<svg role="img">` 屏蔽内部可交互无障碍语义 | 1. 手机端 SVG 缩放比约 `0.667`，旧放置区 `62×56` 缩放后仅 `41.3×37.3 CSS px`；<br>2. 测试脚本仅统计了 DOM `<button>`，漏测了 SVG 内部 `<rect>` / `<g>` 命中区；<br>3. `<svg role="img">` 导致辅助技术将整个舞台视为静态图片 | 1. 手机端 `STORY_CUP_STAGE_MATRIX_MOBILE` 将三处放置区设为 `84×86` SVG 单位，在最小手机视口 `360×800` 下实测渲染尺寸为 **`56.0×57.3 CSS px`**，移动水杯实测 **`58.7×59.3 CSS px`**（`390×844` 下达 `62.0×63.5 CSS px`），三处放置区互不重叠；<br>2. V2 样板下 `<svg role="group">`，3 个放置区与可移动蓝水杯均具备 `role="button"`、`tabIndex={0}`、`aria-label` 与键盘事件，并通过 Chromium CDP `Accessibility.getFullAXTree` 实测暴露为可聚焦 `button`；<br>3. `GATE3R_6VIEWPORT_REPORT.json` 分离汇报 `svgSceneHitTargets` 与 `domControlTouchTargets`，双重断言 `>= 56×56 CSS px` | - `src/visual-v2/story-cup-pilot/StoryCupSceneArtV2.tsx`<br>- `src/components/ChildIsland/StoryGrove/StoryGroveModal.tsx`<br>- `scripts/verify_v2_2_story_cup_pilot.mjs`<br>- `GATE3R_6VIEWPORT_REPORT.json` |
| **P2-01..03** | **P2** | 证据归档断链（含本地私有会话路径）、Google Drive 缺少原始截图与日志、报告自称 `ENGINEERING_PILOT_PASS` | 1. 早期交接文档引用了本地绝对路径；<br>2. 21 张六视口截图与测试原始日志未同步归档至项目 `docs/v2-story-cup-pilot/` 与 Google Drive 交接目录；<br>3. 曾自评 `ENGINEERING_PILOT_PASS` | 1. 全部 21 张 PNG 截图、`GATE3R_6VIEWPORT_REPORT.json`、`typecheck.log`、`vitest.log`、`build.log`、`playwright.log`、`LIVE_VERSION_JSON_RESPONSE.txt`、`SHA256SUMS.txt` 完整归档至仓库 `docs/v2-story-cup-pilot/` 与 Google Drive `04_ANTIGRAVITY_GATE3R_GATE4R_EVIDENCE/`；<br>2. 文档全面使用相对路径，零本地私有路径引用；<br>3. 严格保持 `ART_DIRECTOR_QA_HOLD`、`CONTENT_QA_REVIEW` 与 `ENGINEERING_AUDIT_HOLD`，等待独立复审 | - `docs/v2-story-cup-pilot/INDEX.md`<br>- `docs/v2-story-cup-pilot/SHA256SUMS.txt`<br>- `docs/v2-story-cup-pilot/LIVE_VERSION_JSON_RESPONSE.txt` |

---

## 二、红线与不变量核验

1. **业务冻结层零改动**：
   - `git diff origin/ui/visual-v2-assetlab -- src/context src/domain src/services src/utils/speech.ts src/data public/audio/tts` 输出 **0 行差异**。
2. **正式分支零触碰**：
   - `main`、`preview`、`public-live`、`public-hold` 均未修改、未推送。
3. **内容审核与家长门禁 Fail-Closed**：
   - `ContentAuditRegistry` 保持 `16/16 PENDING_REVIEW`（`approvedRenderableCount: 0`）。
   - 儿童模式直接访问 `/visual-v2-review/story-cup-pilot` 仍受家长 PIN 门禁保护，成人审阅预览会话跨窗口/关闭后自动失效。
