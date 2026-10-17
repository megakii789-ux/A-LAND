# A-LAND V2.2 `StoryGrove::cup-size` — Gate 3R–4R 独立审计整改闭环矩阵

- **基准分支**：`ui/visual-v2-story-pilot`
- **初次审计基线提交**：`e3f8b1e614f5e52ff6577439083dce0b01a72ff7`
- **权威源码与固定部署提交 (`CANONICAL_CODE_SHA`)**：`1330a797824c4d55a367ad04b7e7099d71cf8e6a`
- **固定不可变部署 URL**：`https://a62a63cf.qingyu-island-v2-assetlab.pages.dev/visual-v2-review/story-cup-pilot`
- **当前状态声明**：
  - `artDirectorGate`: `ART_DIRECTOR_QA_HOLD`（保留，待补 4K Blender 绘本母版与逐音素口型）
  - `contentQaFlag`: `CONTENT_QA_REVIEW`（保留，`src/data/interactiveStoryGroveData.ts` 冻结不改）
  - `engineeringPilotGate`: `ENGINEERING_AUDIT_HOLD`（在独立复审通过前，不自称 `ENGINEERING_PILOT_PASS`）

---

## 一、P1 / P2 及 Gate 4R 最小闭环逐项核销表

| 编号 | 级别 | 审计发现摘要 | 整改前状态（Before） | 整改后状态（After） | 涉及源码与自动化验证证据 |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **P1-01** | **P1** | 手机端 `L1..L5` 竖版 PNG (`900×1600`, 9:16) 塞入 `aspect-[21/11]` 扁平容器并使用 `object-cover`，导致底部 `L4_tabletop` 被裁切约 `70.6%`，道具悬空在树屋窗户半空 | 1. 手机端与桌面端共用固定 `viewBox="0 0 420 220"` (`aspect-[21/11]`)；<br>2. `StoryCupSceneArtV2` 使用 `object-cover` 居中裁切 9:16 竖图；<br>3. 手机端木桌台面落在容器可视区域之外 | 1. 建立统一响应式舞台坐标变换矩阵 `StoryCupStageMatrix`（`STORY_CUP_STAGE_MATRIX_MOBILE`: `viewBox="0 0 420 747"`, `aspect-[9/16]`；`STORY_CUP_STAGE_MATRIX_DESKTOP`: `viewBox="0 0 420 220"`, `aspect-[21/11]`）；<br>2. `L1..L5` 改为 `object-fill` 精确等比映射，`0.0%` 裁切（`zeroObjectCoverClipping: true`）；<br>3. 手机端与桌面端的积木、蓝水杯、大水桶、刻度树枝、3 个放置区及跳跳/噗噗角色均精准落在 `L4_tabletop` 木桌台面上 | - `src/visual-v2/story-cup-pilot/StoryCupSceneArtV2.tsx`<br>- `src/components/ChildIsland/StoryGrove/StoryGroveModal.tsx`<br>- `screenshots/v2_2_gate3_390x844_v2_cup_size.png`<br>- `screenshots/v2_2_gate3_390x844_position_NEXT_TO_BLOCK.png` |
| **P1-02** | **P1** | 跳跳 (`tiaotiao_story_squirrel`) 与噗噗 (`pupu_story_elephant`) 共享同一个 `isSpeaking` 布尔值，任何语音播放时两只角色同时张嘴 (`talk`) | `resolveStoryCharacterVisualState()` 未区分 `characterId` 与当前台词归属，点击场景提示或任一热点时两角色同时进入 `talk` | 1. 新增 `resolveActiveStorySpeaker()` 显式解析当前发声角色：`narrator_or_multi` / `tiaotiao_story_squirrel` / `pupu_story_elephant` / `none`；<br>2. 仅当 `activeHotspotId === 'obj_wooden_block'` 时跳跳进入 `talk`（噗噗保持 `think` 倾听）；仅当 `activeHotspotId === 'obj_elephant_bucket'` 时噗噗进入 `talk`（跳跳保持 `think` 倾听）；<br>3. 旁白朗读场景提示、中立道具及多角色结果叙述时，两角色均保持 `idle`/`think` 倾听态，**绝不同时张嘴**（`bothTalkingSimultaneously: false`） | - `src/visual-v2/story-cup-pilot/StoryCupSceneArtV2.tsx`<br>- `src/tests/storyCupPilotV2_2.test.tsx`<br>- `GATE3R_6VIEWPORT_REPORT.json` (`speakerSeparationVerification`) |
| **P1-03** | **P1** | 儿童故事主界面顶部常驻暴露 `ART_DIRECTOR_QA_HOLD`、`CONTENT_QA_REVIEW`、语音 ID 及 `L1..L5` 工程调试条 | 1. `StoryCupLayerControlBarV2` 直接渲染在儿童故事标题下方首屏；<br>2. `SceneBackdropV2` 在 `story` 场景下也在弹窗外层悬浮 `z-[55]` 工程胶囊 | 1. `StoryCupLayerControlBarV2` 移至儿童主交互流最底部，重构为**默认收起**的审阅调试抽屉（`data-testid="v2-story-cup-debug-drawer-toggle"`, `aria-expanded="false"`）；<br>2. `SceneBackdropV2` 在 `sceneKey === 'story'` 时隐藏外层浮动工程胶囊，确保儿童默认视口 `0` 工程调试噪音；<br>3. 恢复非 V2 模式下 `StoryGroveModal` 原有按钮高度类 | - `src/visual-v2/story-cup-pilot/StoryCupSceneArtV2.tsx`<br>- `src/visual-v2/SceneBackdropV2.tsx`<br>- `screenshots/v2_2_gate3_390x844_v2_cup_size.png`<br>- `screenshots/v2_2_gate3_layer_toggle_L1_L5_off.png` |
| **P1-04 & Gate3R-UX-02** | **P1** | SVG 放置区在手机端小于 `56×56 CSS px`、`<svg role="img">` 屏蔽无障碍语义，且内联 `outline: none` 消除了键盘可见焦点 | 1. 手机端放置区仅 `41.3×37.3 CSS px`；<br>2. `<svg role="img">` 屏蔽内部按钮；<br>3. 上轮添加了内联 `outline: none` 导致键盘 `Tab` 聚焦缺少可见轮廓 | 1. 手机端 `360×800` 下放置区实测 **`56.0×57.3 CSS px`**，移动水杯实测 **`58.7×59.3 CSS px`**，互不重叠；<br>2. `<svg role="group">`，4 个 SVG 交互目标暴露在 AXTree 中；<br>3. **移除内联 `outline: none`**，绑定 `.v2-story-svg-focusable` 并在 `:focus-visible` 下提供 `#0284C7` `3.5px` 高对比度实线外框与描边高亮（鼠标点击 `:focus:not(:focus-visible)` 仍保持干净）；<br>4. Playwright 实测执行 `Tab` / `Enter` / `Space` / `ArrowLeft` / `ArrowRight`，校验 `matches(':focus-visible') === true` 且 `outlineStyle === 'solid'`，并保存 2 张键盘焦点实测截图 | - `src/visual-v2/motion/asset_interaction_motion.css`<br>- `src/components/ChildIsland/StoryGrove/StoryGroveModal.tsx`<br>- `screenshots/v2_2_gate4r_keyboard_focus_dropzone.png`<br>- `screenshots/v2_2_gate4r_keyboard_focus_movable_cup.png`<br>- `GATE3R_6VIEWPORT_REPORT.json` (`keyboardVisibleFocusVerification`) |
| **Gate4R-01 & Task 3** | **P1** | GitHub 与 Google Drive 的 `LIVE_VERSION_JSON_RESPONSE.txt` / `SHA256SUMS.txt` 存在提交时间差，且 `build.log` 需绑定明确源码提交 SHA | 1. 上轮在提交 `6e115fd…` 后仅更新了 Drive ZIP 中的响应与校验和；<br>2. 上轮 `build.log` 是在提交前运行的，记录了旧 `e3f8b1e…` SHA | 1. 锚定唯一源码与部署提交 `1330a797824c4d55a367ad04b7e7099d71cf8e6a`；<br>2. 在 `1330a797824c4d55a367ad04b7e7099d71cf8e6a` 上完整运行 `npm ci`、`typecheck`、`vitest`、`build`、`verify_v2_2_story_cup_pilot.mjs`，所有日志与报告均内嵌 `1330a797824c4d55a367ad04b7e7099d71cf8e6a`；<br>3. 部署至固定 URL `https://a62a63cf.qingyu-island-v2-assetlab.pages.dev`（`/version.json` `commitSha = 1330a797824c4d55a367ad04b7e7099d71cf8e6a`）；<br>4. 编写 `PROVENANCE_DELTA_AND_CANONICAL_RELEASE.md` 并一次性提交证据归档，此后绝不修改任何文件，确保 GitHub `HEAD` 与 Google Drive 归档包 **36/36 文件 SHA-256 与 Git Blob SHA-1 100% 一致** | - `PROVENANCE_DELTA_AND_CANONICAL_RELEASE.md`<br>- `LIVE_VERSION_JSON_RESPONSE.txt`<br>- `npm_ci.log`, `build.log`, `vitest.log`, `typecheck.log`, `playwright.log`<br>- `SHA256SUMS.txt` |

---

## 二、红线与不变量核验

1. **业务冻结层零改动**：
   - `git diff origin/ui/visual-v2-assetlab -- src/context src/domain src/services src/utils/speech.ts src/data public/audio/tts` 输出 **0 行差异**。
2. **正式分支零触碰**：
   - `main`、`preview`、`public-live`、`public-hold` 均未修改、未推送。
3. **内容审核与家长门禁 Fail-Closed**：
   - `ContentAuditRegistry` 保持 `16/16 PENDING_REVIEW`（`approvedRenderableCount: 0`）。
   - 儿童模式直接访问 `/visual-v2-review/story-cup-pilot` 仍受家长 PIN 门禁保护，成人审阅预览会话跨窗口/关闭后自动失效。
