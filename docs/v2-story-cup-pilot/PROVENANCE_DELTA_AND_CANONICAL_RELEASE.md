# A-LAND V2.2 (`StoryGrove::cup-size`) — 部署溯源与唯一归档声明 (`PROVENANCE_DELTA_AND_CANONICAL_RELEASE.md`)

## 1. 为什么上一轮出现了 `be636b4…` 与 `6e115fd…` 的归档差异（Delta 说明）

在上一轮（Gate 3R–4R 初次提交）中，由于 Git 提交哈希包含仓库内所有文件的树哈希，尝试将“部署后的 `/version.json` 响应”再次写入仓库并重部署时产生了两步提交：
1. **`e3f8b1e614f5e52ff6577439083dce0b01a72ff7`**：Gate 0–4 初版基线提交。上轮 `build.log` 是在创建新提交之前运行的，因此日志内记录了当时的 `HEAD`（`e3f8b1e…`）。
2. **`be636b4baaac8656668a174e0b2fa3372ef26a8a`**：上一轮 Gate 3R 代码修复提交。部署该提交后抓取了 `LIVE_VERSION_JSON_RESPONSE.txt`（内容为 `be636b4…`）并生成了 `SHA256SUMS.txt`。
3. **`6e115fd471dca2af6d2c8313d1ded7d838b33300`**：将上述 `LIVE_VERSION_JSON_RESPONSE.txt` 与 `SHA256SUMS.txt` 提交进 GitHub 后产生的新文档提交。随后又基于 `6e115fd…` 重新部署了 Cloudflare Pages，并仅在上传 Google Drive 的 `/tmp` 副本中更新了 `LIVE_VERSION_JSON_RESPONSE.txt`（记录为 `6e115fd…`）和 `SHA256SUMS.txt`，而未再次改动 GitHub，导致 GitHub `HEAD` 与 Google Drive ZIP 中这两个文件的 Blob 出现分叉。

---

## 2. 本轮（Gate 4R 最小闭环）的唯一权威溯源锚点（Canonical Release Provenance）

为彻底消除“追逐自身文档提交 SHA”导致的循环悖论，并保证 **GitHub `HEAD` 与 Google Drive 归档包内 100% 文件字节级一致（36/36 文件 SHA-256 与 Git Blob SHA-1 完全相同）**，本轮采用严格的两阶段冻结协议：

### 2.1 权威源码与部署提交（Canonical Code & Deployment Commit）
- **Canonical Code Commit SHA (`CANONICAL_CODE_SHA`)**：
  `1330a797824c4d55a367ad04b7e7099d71cf8e6a`
  （位于 GitHub `megakii789-ux/A-LAND` 分支 `ui/visual-v2-story-pilot` 的 `HEAD~1`，包含本轮全部源码、测试与验证脚本变更；`HEAD` 与 `1330a797824c4d55a367ad04b7e7099d71cf8e6a` 之间在 `src/`、`scripts/`、`public/` 下为 **0 行差异**）。
- **固定不可变部署标识（Immutable Deployment Identifier）**：
  `a62a63cf`
- **固定不可变部署 URL（Immutable Deployment URL）**：
  - 样板直达预览：`https://a62a63cf.qingyu-island-v2-assetlab.pages.dev/visual-v2-review/story-cup-pilot`
  - 部署元数据：`https://a62a63cf.qingyu-island-v2-assetlab.pages.dev/version.json`
- **分支别名 URL（Branch Alias URL）**：
  - 样板直达预览：`https://ui-visual-v2-story-pilot-n35m.qingyu-island-v2-assetlab.pages.dev/visual-v2-review/story-cup-pilot`
  - 部署元数据：`https://ui-visual-v2-story-pilot-n35m.qingyu-island-v2-assetlab.pages.dev/version.json`
- **`/version.json` 与 `build.log` 实测绑定字段**：
  - `metadataKind`: `"RUNTIME_DEPLOYMENT_METADATA"`
  - `branch`: `"ui/visual-v2-story-pilot"`
  - `commitSha`: `"1330a797824c4d55a367ad04b7e7099d71cf8e6a"`
  - `commitIdentitySource`: `"GIT_HEAD"`
  - `deploymentTimestamp`: `"2026-10-17T00:14:50.603Z"`
  - 构建产物 Hash（与线上 HTML `<script>` / `<link>` 及 `build.log` 完全一致）：
    - JS Bundle: `/assets/index-CtLocKiX.js`
    - CSS Bundle: `/assets/index-BIquANf2.css`
  - 门禁标志：
    - `artDirectorQaGate`: `"ART_DIRECTOR_QA_HOLD"`
    - `engineeringPilotGate`: `"ENGINEERING_AUDIT_HOLD"`
    - `contentQaReviewFlag`: `"CONTENT_QA_REVIEW"`
    - `contentAuditGate`: `"FAIL_CLOSED_PENDING_AUDIT"`（`16/16 PENDING_REVIEW, renderableInChildModeCount: 0`）

### 2.2 在冻结源码提交 `1330a797824c4d55a367ad04b7e7099d71cf8e6a` 上执行的完整测试链路
所有测试与构建均在工作区 `HEAD == 1330a797824c4d55a367ad04b7e7099d71cf8e6a` 提交完成后运行，原始输出全部保存在同目录日志中：
1. `npm ci` -> `npm_ci.log`（记录 `git_head_sha: 1330a797824c4d55a367ad04b7e7099d71cf8e6a`、Node `v20.20.2`、npm `10.8.2`、Linux `x86_64`）
2. `npm run typecheck` -> `typecheck.log`（记录 `# git_head_sha=1330a797824c4d55a367ad04b7e7099d71cf8e6a`，0 errors）
3. `npm test` -> `vitest.log`（记录 `# git_head_sha=1330a797824c4d55a367ad04b7e7099d71cf8e6a`，39 suites / 388 tests passed）
4. `npm run build` -> `build.log`（记录 `# git_head_sha=1330a797824c4d55a367ad04b7e7099d71cf8e6a`，生成 `dist/version.json` `commitSha=1330a797824c4d55a367ad04b7e7099d71cf8e6a`）
5. `node scripts/verify_v2_2_story_cup_pilot.mjs` -> `playwright.log` & `GATE3R_6VIEWPORT_REPORT.json`（内含 `"gitCommitSha": "1330a797824c4d55a367ad04b7e7099d71cf8e6a"`，覆盖 6 视口 + 键盘 `Tab`/`Enter`/`Space`/`ArrowLeft`/`ArrowRight` 可见焦点验证 + 23 张原始截图）

### 2.3 证据归档提交（Evidence Archive Commit = 当前 GitHub `HEAD`）
- 在 `1330a797824c4d55a367ad04b7e7099d71cf8e6a` 之上，仅追加 **1 次** 纯证据归档提交（即当前分支 `HEAD`），将 `docs/v2-story-cup-pilot/` 下的全部日志、报告、23 张截图、`LIVE_VERSION_JSON_RESPONSE.txt`、本文档及 `SHA256SUMS.txt` 原样写入 Git。
- **字节级一致性承诺**：该证据归档提交完成后，**不再对任何文件做任何事后修改**，直接将 Git 工作树中的 `docs/v2-story-cup-pilot/` 原样打包上传至 Google Drive。因此 GitHub `HEAD` 中的 `docs/v2-story-cup-pilot/**` 与 Google Drive 归档包中的每一个文件（含 `LIVE_VERSION_JSON_RESPONSE.txt` 与 `SHA256SUMS.txt`）均 **100% 字节级一致**。

---

## 3. 历史与当前提交时间线对照表

| 阶段 | Git Commit SHA | 角色说明 | 对应线上部署状态 |
| :--- | :--- | :--- | :--- |
| Gate 0–4 初版 | `e3f8b1e614f5e52ff6577439083dce0b01a72ff7` | 初次样板接入基线 | 已被后续整改替代 |
| Gate 3R 代码提交 | `be636b4baaac8656668a174e0b2fa3372ef26a8a` | 修复 P1-01..P1-04 原始症状 | 曾部署至 `f7011578` |
| Gate 4R 初次文档提交 | `6e115fd471dca2af6d2c8313d1ded7d838b33300` | 上轮归档提交（存在 GitHub/Drive 双重归档时间差） | 曾部署至 `aff02c84` |
| **Gate 4R 最小闭环源码与部署锚点（Canonical）** | **`1330a797824c4d55a367ad04b7e7099d71cf8e6a`** | **补齐 SVG `:focus-visible` 键盘可见焦点 + 完整同源测试 + 线上固定部署锚点** | **当前固定部署：`https://a62a63cf.qingyu-island-v2-assetlab.pages.dev`（及别名 `ui-visual-v2-story-pilot-n35m`）** |
| **Gate 4R 最终证据封存（Archive HEAD）** | 见 `git rev-parse HEAD`（`1330a797…` 的直接子提交） | **封存 `1330a797…` 的全部原始日志、23 张截图、`LIVE_VERSION_JSON_RESPONSE.txt` 与 `SHA256SUMS.txt`；GitHub 与 Google Drive 100% 同源同哈希** | 不再重部署以保持线上 `/version.json` 恒定指向 `1330a797824c4d55a367ad04b7e7099d71cf8e6a` |
