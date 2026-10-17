# A-LAND V2.2 `StoryGrove::cup-size` — Gate 3R–4R 证据包索引 (`INDEX.md`)

## 1. 分支、权威部署 SHA 与门禁状态

- **Git 分支**：`ui/visual-v2-story-pilot`
- **基线提交（初次 Gate 0–4）**：`e3f8b1e614f5e52ff6577439083dce0b01a72ff7`
- **权威源码与固定部署提交 (`CANONICAL_CODE_SHA`)**：`1330a797824c4d55a367ad04b7e7099d71cf8e6a`
- **固定不可变部署 ID (`immutableDeploymentId`)**：`a62a63cf`
- **独立预览站点（公开免登录）**：
  - **固定部署 URL（唯一发布标识）**：`https://a62a63cf.qingyu-island-v2-assetlab.pages.dev/visual-v2-review/story-cup-pilot`
  - **固定部署 `/version.json`**：`https://a62a63cf.qingyu-island-v2-assetlab.pages.dev/version.json`
  - 分支固定别名预览：`https://ui-visual-v2-story-pilot-n35m.qingyu-island-v2-assetlab.pages.dev/visual-v2-review/story-cup-pilot`
  - 分支别名 `/version.json`：`https://ui-visual-v2-story-pilot-n35m.qingyu-island-v2-assetlab.pages.dev/version.json`
- **门禁声明**：
  - `artDirectorGate`: `ART_DIRECTOR_QA_HOLD`
  - `contentQaFlag`: `CONTENT_QA_REVIEW`
  - `engineeringPilotGate`: `ENGINEERING_AUDIT_HOLD`（待独立复审确认后签发 `ENGINEERING_PILOT_PASS`）

---

## 2. 证据目录文件清单（GitHub `HEAD` 与 Google Drive 归档 100% 字节级同源）

| 文件相对路径 | 类型 | 用途说明 |
| :--- | :---: | :--- |
| `INDEX.md` | Markdown | 本证据包总索引 |
| `PROVENANCE_DELTA_AND_CANONICAL_RELEASE.md` | Markdown | Gate 4R-01 部署版本溯源、历史 Delta 说明与 Canonical 版本对照表 |
| `GATE3R_4R_ISSUE_CLOSURE_MATRIX.md` | Markdown | P1-01..P1-04、Gate3R-UX-02 键盘可见焦点及 Gate 4R 证据闭环矩阵 |
| `V2_2_STORY_CUP_PILOT_HANDOFF_REPORT.md` | Markdown | Gate 3R–4R 工程样板复审交接报告 |
| `GATE0_INPUT_FREEZE.json` | JSON | Gate 0 素材包 SHA-256 与基线冻结记录 |
| `GATE0_DIFF_BOUNDARY.md` | Markdown | Gate 0–4R 冻结业务层零改动边界说明 |
| `GATE3R_6VIEWPORT_REPORT.json` | JSON | 绑定 `gitCommitSha: 1330a797824c4d55a367ad04b7e7099d71cf8e6a` 的六视口坐标矩阵、SVG 触控命中区、DOM 触控区、说话人分离、无障碍树与键盘 `:focus-visible` 完整实测数据 |
| `GATE3_6VIEWPORT_REPORT.json` | JSON | 与 `GATE3R_6VIEWPORT_REPORT.json` 同步的六视口实测报告 |
| `npm_ci.log` | Log | 在 `1330a797824c4d55a367ad04b7e7099d71cf8e6a` 上执行 `npm ci` 的环境信息与原始输出 |
| `typecheck.log` | Log | 在 `1330a797824c4d55a367ad04b7e7099d71cf8e6a` 上执行 `npm run typecheck` (`tsc --noEmit`) 原始输出 |
| `vitest.log` | Log | 在 `1330a797824c4d55a367ad04b7e7099d71cf8e6a` 上执行 `npm test` (39 suites / 388 tests) 原始输出 |
| `build.log` | Log | 在 `1330a797824c4d55a367ad04b7e7099d71cf8e6a` 上执行 `npm run build`（生成 `commitSha=1330a797824c4d55a367ad04b7e7099d71cf8e6a`）原始输出 |
| `playwright.log` | Log | 在 `1330a797824c4d55a367ad04b7e7099d71cf8e6a` 上执行 `node scripts/verify_v2_2_story_cup_pilot.mjs` 原始输出 |
| `LIVE_VERSION_JSON_RESPONSE.txt` | Text | 固定部署 URL `https://a62a63cf.qingyu-island-v2-assetlab.pages.dev` 与分支别名 URL 的 `/version.json` 及样板路由实测 HTTP 响应头与正文 |
| `SHA256SUMS.txt` | Text | 本目录全部日志、报告、文档与 23 张截图的 SHA-256 校验和 |
| `screenshots/v2_2_gate3_360x800_original_cup_size.png` | PNG | `360×800` 原版对照截图 |
| `screenshots/v2_2_gate3_360x800_v2_cup_size.png` | PNG | `360×800` V2 样板默认态（9:16 竖版桌面对齐 + 默认无调试条） |
| `screenshots/v2_2_gate3_390x844_original_cup_size.png` | PNG | `390×844` 原版对照截图 |
| `screenshots/v2_2_gate3_390x844_v2_cup_size.png` | PNG | `390×844` V2 样板默认态（9:16 竖版桌面对齐 + 默认无调试条） |
| `screenshots/v2_2_gate3_390x844_position_NEXT_TO_BLOCK.png` | PNG | `390×844` 手机端指针拖至小积木旁 + 仅跳跳单人 `talk` |
| `screenshots/v2_2_gate3_390x844_position_NEXT_TO_BUCKET.png` | PNG | `390×844` 手机端指针拖至大水桶旁 + 仅噗噗单人 `talk` |
| `screenshots/v2_2_gate3_430x932_original_cup_size.png` | PNG | `430×932` 原版对照截图 |
| `screenshots/v2_2_gate3_430x932_v2_cup_size.png` | PNG | `430×932` V2 样板默认态 |
| `screenshots/v2_2_gate3_768x1024_original_cup_size.png` | PNG | `768×1024` 原版对照截图 |
| `screenshots/v2_2_gate3_768x1024_v2_cup_size.png` | PNG | `768×1024` V2 样板默认态 |
| `screenshots/v2_2_gate3_1024x1366_original_cup_size.png` | PNG | `1024×1366` 原版对照截图 |
| `screenshots/v2_2_gate3_1024x1366_v2_cup_size.png` | PNG | `1024×1366` V2 样板默认态 |
| `screenshots/v2_2_gate3_1440x900_original_cup_size.png` | PNG | `1440×900` 原版对照截图 |
| `screenshots/v2_2_gate3_1440x900_v2_cup_size.png` | PNG | `1440×900` V2 样板默认态 |
| `screenshots/v2_2_gate3_position_CENTER_TABLE.png` | PNG | `1440×900` 桌面端木桌中间默认对比态 |
| `screenshots/v2_2_gate3_position_NEXT_TO_BLOCK.png` | PNG | `1440×900` 桌面端小积木旁对比态 + 仅跳跳 `talk` |
| `screenshots/v2_2_gate3_position_NEXT_TO_BUCKET.png` | PNG | `1440×900` 桌面端大水桶旁对比态 + 仅噗噗 `talk` |
| `screenshots/v2_2_gate4r_keyboard_focus_dropzone.png` | PNG | **Gate 4R 新增**：真实键盘 `Tab` 聚焦至 `cup-dropzone-NEXT_TO_BLOCK` 的高对比 `:focus-visible` 焦点轮廓截图 |
| `screenshots/v2_2_gate4r_keyboard_focus_movable_cup.png` | PNG | **Gate 4R 新增**：真实键盘 `Tab` 聚焦至 `movable-blue-cup-prop` 的高对比 `:focus-visible` 焦点轮廓截图 |
| `screenshots/v2_2_gate3_layer_toggle_L1_L5_off.png` | PNG | 审阅员展开底部折叠调试抽屉并关闭 `L1` / `L5` 图层验证 |
| `screenshots/v2_2_gate3_single_side_incomplete.png` | PNG | 单侧抢下结论时“差一点点”温和引导态 |
| `screenshots/v2_2_gate3_both_sides_completed.png` | PNG | 双侧对比完成后双角色 `celebrate` 庆祝态 |
| `screenshots/v2_2_gate3_prefers_reduced_motion.png` | PNG | `prefers-reduced-motion: reduce` 静态无动画降级态 |
