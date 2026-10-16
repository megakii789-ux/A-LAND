# A-LAND V2.2 `StoryGrove::cup-size` — Gate 3R–4R 证据包索引 (`INDEX.md`)

## 1. 分支与门禁状态

- **Git 分支**：`ui/visual-v2-story-pilot`
- **基线提交（整改前）**：`e3f8b1e614f5e52ff6577439083dce0b01a72ff7`
- **Gate 3R–4R 代码整改提交**：`be636b4baaac8656668a174e0b2fa3372ef26a8a`
- **独立预览站点（公开免登录）**：
  - 分支固定别名预览：`https://ui-visual-v2-story-pilot-n35m.qingyu-island-v2-assetlab.pages.dev/visual-v2-review/story-cup-pilot`
  - 分支部署元数据：`https://ui-visual-v2-story-pilot-n35m.qingyu-island-v2-assetlab.pages.dev/version.json`
- **门禁声明**：
  - `artDirectorGate`: `ART_DIRECTOR_QA_HOLD`
  - `contentQaFlag`: `CONTENT_QA_REVIEW`
  - `engineeringPilotGate`: `ENGINEERING_AUDIT_HOLD`（待独立复审确认）

---

## 2. 证据目录文件清单（全部相对路径，无本地私有路径）

| 文件相对路径 | 类型 | 用途说明 |
| :--- | :---: | :--- |
| `INDEX.md` | Markdown | 本证据包总索引 |
| `GATE3R_4R_ISSUE_CLOSURE_MATRIX.md` | Markdown | P1-01..P1-04 及 P2 证据项逐条前后对比与闭环矩阵 |
| `V2_2_STORY_CUP_PILOT_HANDOFF_REPORT.md` | Markdown | Gate 3R–4R 工程样板复审交接报告 |
| `GATE0_INPUT_FREEZE.json` | JSON | Gate 0 素材包 SHA-256 与基线冻结记录 |
| `GATE0_DIFF_BOUNDARY.md` | Markdown | Gate 0–4R 冻结业务层零改动边界说明 |
| `GATE3R_6VIEWPORT_REPORT.json` | JSON | 六视口坐标矩阵、SVG 触控命中区、DOM 触控区、说话人分离、无障碍树与 E2E 完整实测数据 |
| `GATE3_6VIEWPORT_REPORT.json` | JSON | 与 `GATE3R_6VIEWPORT_REPORT.json` 同步的六视口实测报告 |
| `typecheck.log` | Log | `npm run typecheck` (`tsc --noEmit`) 原始输出 |
| `vitest.log` | Log | `npm test` (39 suites / 388 tests) 原始输出 |
| `build.log` | Log | `npm run build` (`vite build` + `generate-version-json.mjs`) 原始输出 |
| `playwright.log` | Log | `node scripts/verify_v2_2_story_cup_pilot.mjs` 六视口与深度交互实测原始输出 |
| `LIVE_VERSION_JSON_RESPONSE.txt` | Text | Cloudflare Pages 公开预览域名 `/version.json` 与 `/visual-v2-review/story-cup-pilot` 实测 HTTP 响应头及正文 |
| `SHA256SUMS.txt` | Text | 本目录全部日志、报告、文档与 21 张截图的 SHA-256 校验和 |
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
| `screenshots/v2_2_gate3_layer_toggle_L1_L5_off.png` | PNG | 审阅员展开底部折叠调试抽屉并关闭 `L1` / `L5` 图层验证 |
| `screenshots/v2_2_gate3_single_side_incomplete.png` | PNG | 单侧抢下结论时“差一点点”温和引导态 |
| `screenshots/v2_2_gate3_both_sides_completed.png` | PNG | 双侧对比完成后双角色 `celebrate` 庆祝态 |
| `screenshots/v2_2_gate3_prefers_reduced_motion.png` | PNG | `prefers-reduced-motion: reduce` 静态无动画降级态 |
