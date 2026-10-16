# GATE 0 — 差异边界与业务冻结声明 (`GATE0_DIFF_BOUNDARY.md`)

- **Gate 0 状态**：`GATE0_PASS`
- **基线分支与 Commit SHA**：`origin/ui/visual-v2-assetlab` @ `f27438146cb9bc6a4b841f6745f63165173106c4`（远端实测一致，无偏差）
- **新隔离分支与 Worktree**：`ui/visual-v2-story-pilot` @ `/home/voga/A-LAND-visual-v2-story-pilot`
- **ZIP 包校验**：
  - 文件名：`A_LAND_V2_2_STORY_CUP_ENGINEERING_ASSETS_AND_STAGE_COMMANDS_20261016.zip`
  - 字节数：`5,904,211`
  - SHA-256：`375ccc095ef56bcb496d3f06d413ba27b14953b2d7c020185b9b74b33bb17b1e`
  - `python3 08_QA/verify_assets.py`：`verified_count: 131, fail_count: 0`
  - `sha256sum -c 08_QA/SHA256SUMS.txt`：`131 / 131` 通过

## 1. 严禁修改的冻结业务文件边界

以下目录与文件在本轮 Gate 1–Gate 4 中严禁修改（保持 `0` diff）：
- `src/context/AppContext.tsx`
- `src/domain/**`（含 `src/domain/storyGrove/interactiveStoryLeaves.ts`、`src/domain/cognitive/ContentAuditRegistry.ts`、`src/domain/privacy/**` 等）
- `src/services/**`
- `src/utils/speech.ts`
- `src/data/**`
- `public/audio/tts/**`

## 2. 允许修改/新增的换肤与测试范围

1. **静态资产目录**：`public/visual-v2/story-cup-pilot/**`（放入 `01_SCENE_LAYERS`、`02_STORY_CHARACTERS`、`03_INTERACTIVE_PROPS`、`04_EFFECTS`、`05_MOTION_AND_DEMO/motion_spec.json` 及 `exports/webp`、`exports/png`）。
2. **V2 视觉组件目录**：
   - `src/visual-v2/story-cup-pilot/StoryCupSceneArtV2.tsx`（5 层桌面/移动自适应 SVG 背板、逐层开关调试器、4 互动道具、跳跳/噗噗分部件原生 SVG 角色与五态动效、视觉反馈特效、与 `speechNarrator` 真实会话及 `prefers-reduced-motion` 联动）
   - `src/visual-v2/VisualV2Shell.tsx` & `src/App.tsx`（支持 `/visual-v2-review` 及 `/visual-v2-review/story-cup-pilot` 快捷直达入口）
3. **`StoryGroveModal.tsx` 最小条件渲染挂钩**：
   - 仅在 V2 视觉评审路由下，于 `interactiveLeafDef.id === 'cup-size'` 的场景容器与 SVG 中挂载 `StoryCupSceneArtV2` 图层、透明 SVG/WebP 道具图像与跳跳/噗噗角色视觉层；
   - **100% 保留**原版 `svgCupRef`、`viewBox="0 0 420 220"`、三个 `cup-dropzone-*`、`movable-blue-cup-prop`、`cup-constant-size-gauge`、`handleCupPointerDown/Move/Up/Cancel`、键盘左右方向键移动支持、下方热区按钮与动作判据；
   - 原版 `/` 路由下 `StoryGroveModal` 渲染与行为 100% 保持原样。
4. **测试与 QA 归档**：
   - `src/tests/storyCupPilotV2_2.test.tsx`
   - `docs/v2-story-cup-pilot/**`（归档 Gate 0–Gate 4 证据）
