# A-LAND｜Gate D7 独立审计定向收尾与全链路部署验收报告（DEPLOY_GATE_D7_FINAL_AUDIT）

- **唯一开发源头（Source of Truth）**：`/home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间`
- **本机 Git 工作副本**：`/home/voga/A-LAND`（软链接至 `/home/voga/extend_200g/system_offload/projects/A-LAND`）
- **GitHub 远端仓库**：`megakii789-ux/A-LAND`
- **修复前预览分支基线 HEAD**：`55ef145ab5fe9cd9a55363e450320834943cf7e3`
- **本轮同步与全量门禁验证提交 HEAD**：`ae22f7ab8b124829196370cdce5a5bfc430c8e9c`
- **GitHub Actions CI 运行记录**：Run ID `38687658186` / Job ID `116266101800`（`TypeScript, Vitest, Build & Security Contracts`：`conclusion = success`）
- **Cloudflare Pages 部署记录**：Deployment ID `2623079f-2874-407c-a7ac-3a73e7152717`（`https://2623079f.qingyu-island-preview.pages.dev` 与 `https://preview.qingyu-island-preview.pages.dev`：`conclusion = success`）
- **生产占位分支（`public-hold`）HEAD**：`e00706e281b298414ee8eebe9de3853fa6ec9765`（受 GitHub Ruleset `25141429` 服务端冻结保护）
- **历史归档分支（`main`）HEAD**：`f8c7401907b3fe5831c343b995b777254fdfe45d`（受 GitHub Ruleset `25141429` 服务端冻结保护，且已永久吊销回滚资格）
- **当前发布门禁状态**：`ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED`
- **本轮最终判定结论**：`PASS_GATE_D7_GOVERNANCE_AND_PREVIEW`

---

## 一、D7-01｜修复 Bash 回滚门禁失效与 4 项负向故障注入测试

### 1. 缺陷根因与修复实现（[`scripts/rollback-preview.sh`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/scripts/rollback-preview.sh)）
- **原缺陷**：Bash 规范中，当函数通过 `if ! run_post_rollback_gate; then` 被调用时，函数体内部命令的 `set -e` 自动退出行为会被全部抑制，只有函数最后一条命令的退出码会作为函数返回值，导致前序步骤（如 `tsc` 或 `vitest`）失败时无法阻断回滚。
- **修复方案**：重构 `run_post_rollback_gate()`，引入 `run_gate_step()` 辅助函数，在不使用 `if !` 吞没状态码的前提下，对每一步命令显式捕获 `step_rc=$?`，只要 `step_rc -ne 0` 立即 `return "$step_rc"`，触发外层 `git reset --hard "$CURRENT_HEAD"` 恢复工作区与 HEAD，并拒绝执行 `git push`。

### 2. 独立负向故障注入测试（[`tests/domain/rollbackPreviewGate.test.ts`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/tests/domain/rollbackPreviewGate.test.ts)）
通过环境变量 `A_LAND_ROLLBACK_TEST_INJECT_FAIL` 在临时克隆的真实 Git 仓库与 bare remote 中注入四类真实失败，逐项断言退出码非零、HEAD 与工作区 100% 恢复、远端 bare 仓库未发生任何推送：

| 测试编号 | 注入故障阶段 | 注入变量值 | 脚本退出码 | 本地 HEAD 与工作区恢复 | 远端 `origin/preview` 是否被推送 | 判定 |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **Negative 1** | TypeScript 类型检查失败 | `A_LAND_ROLLBACK_TEST_INJECT_FAIL=tsc` | `1` | 100% 恢复至回滚前 HEAD，工作区干净 | 否（远端 SHA 未变） | **PASS** |
| **Negative 2** | Vitest 全量单测失败 | `A_LAND_ROLLBACK_TEST_INJECT_FAIL=vitest` | `1` | 100% 恢复至回滚前 HEAD，工作区干净 | 否（远端 SHA 未变） | **PASS** |
| **Negative 3** | Pages `/api/*` 503 契约失败 | `A_LAND_ROLLBACK_TEST_INJECT_FAIL=cloudflare_503` | `1` | 100% 恢复至回滚前 HEAD，工作区干净 | 否（远端 SHA 未变） | **PASS** |
| **Negative 4** | Vite 生产构建失败 | `A_LAND_ROLLBACK_TEST_INJECT_FAIL=vite_build` | `1` | 100% 恢复至回滚前 HEAD，工作区干净 | 否（远端 SHA 未变） | **PASS** |
| **Positive 5** | 全部 4 项门禁正常通过 | 无故障注入 | `0` | 生成合法前向回滚提交，门禁全绿 | 允许受控前向提交 | **PASS** |

---

## 二、D7-02｜建立真实 GitHub 服务端分支保护（Repository Rulesets）

### 1. 服务端 Rulesets 配置概览
在 GitHub 远端仓库 `megakii789-ux/A-LAND` 创建并激活了两条服务端 Repository Rulesets（不依赖本地 `.git/hooks/pre-push`）：

1. **`Freeze-Main-And-PublicHold`（Ruleset ID: `25141429`）**：
   - **状态**：`enforcement: "active"`
   - **目标分支**：`refs/heads/main`、`refs/heads/public-hold`
   - **服务端强制规则**：`creation`（禁止创建）、`update`（禁止更新/推送）、`deletion`（禁止删除）、`non_fast_forward`（禁止强制推送）
   - **绕过白名单（`bypass_actors`）**：`[]`（零绕过，彻底冻结 `main` 与 `public-hold` 的非授权修改）
2. **`Controlled-Preview-Quality-Gate`（Ruleset ID: `25141218`）**：
   - **状态**：`enforcement: "active"`
   - **目标分支**：`refs/heads/preview`
   - **服务端强制规则**：
     - `deletion`（禁止删除 `preview` 分支）
     - `non_fast_forward`（禁止对 `preview` 执行 `--force` 非快进覆盖）
     - `required_linear_history`（要求线性提交历史）
     - `required_status_checks`：强制要求 CI 检查项 `"TypeScript, Vitest, Build & Security Contracts"` 通过

### 2. GitHub REST API 重新读取核验原始响应
通过 `GET https://api.github.com/repos/megakii789-ux/A-LAND/rulesets` 与 `GET https://api.github.com/repos/megakii789-ux/A-LAND/rules/branches/{main,public-hold,preview}` 实时回读确认：

```json
{
  "rulesets": [
    {
      "id": 25141218,
      "name": "Controlled-Preview-Quality-Gate",
      "target": "branch",
      "enforcement": "active",
      "conditions": {
        "ref_name": {
          "include": ["refs/heads/preview"],
          "exclude": []
        }
      },
      "rules": [
        { "type": "deletion" },
        { "type": "non_fast_forward" },
        { "type": "required_linear_history" },
        {
          "type": "required_status_checks",
          "parameters": {
            "strict_required_status_checks_policy": false,
            "do_not_enforce_on_create": true,
            "required_status_checks": [
              { "context": "TypeScript, Vitest, Build & Security Contracts" }
            ]
          }
        }
      ]
    },
    {
      "id": 25141429,
      "name": "Freeze-Main-And-PublicHold",
      "target": "branch",
      "enforcement": "active",
      "conditions": {
        "ref_name": {
          "include": ["refs/heads/main", "refs/heads/public-hold"],
          "exclude": []
        }
      },
      "rules": [
        { "type": "creation" },
        { "type": "update" },
        { "type": "deletion" },
        { "type": "non_fast_forward" }
      ]
    }
  ]
}
```

---

## 三、D7-03｜修复真实版本溯源（[`scripts/generate-version-json.mjs`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/scripts/generate-version-json.mjs)）

1. **区分 Git 跟踪模板与构建后运行产物**：
   - Git 仓库内的 [`public/version.json`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/public/version.json) 固定为静态模板（`commitSha: "TEMPLATE_RESOLVED_AT_BUILD_TIME"`，`buildStatus: "PENDING_BUILD_VERIFICATION"`），彻底杜绝将包含自身 SHA 的 `version.json` 反复 `git commit --amend` 的循环悖论。
   - 在 [`package.json`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/package.json) 的 `"build"` 流程中：
     ```json
     "build": "tsc --noEmit && vitest run && vite build && node scripts/generate-version-json.mjs --mark-verified --out dist/version.json"
     ```
     仅当 `tsc --noEmit`、`vitest run` 与 `vite build` 全部通过后，才向 `dist/version.json` 写入 `buildStatus: "VERIFIED_QUALITY_GATE_PASSED"` 与当前构建提交身份（优先读取 `CF_PAGES_COMMIT_SHA` -> `GITHUB_SHA` -> `git rev-parse HEAD`）。
2. **真实运行时内容审核统计**：
   - `generate-version-json.mjs` 直接动态导入 [`src/domain/cognitive/ContentAuditRegistry.ts`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/src/domain/cognitive/ContentAuditRegistry.ts)，调用 `AUDIT_REGISTRY` 与 `getContentGateDecision()` 计算 `totalAuditedItems: 16`、`pendingReviewCount: 16`、`passedCount: 0`，不依赖源码正则字符串计数。
3. **公网已部署 `/version.json` 实测核验**：
   - 线上 `GET https://preview.qingyu-island-preview.pages.dev/version.json` 返回 `commitSha: "ae22f7ab8b124829196370cdce5a5bfc430c8e9c"`，与本次 Git 提交 SHA 100% 一致。

---

## 四、D7-04｜Google Drive → GitHub 受控单命令同步与防抖守护

1. **单命令受控同步与部署脚本（[`scripts/sync-gdrive-to-git.sh`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/scripts/sync-gdrive-to-git.sh)）**：
   - 自动将唯一源头 `/home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间` 同步至本机 Git 工作副本 `/home/voga/A-LAND`。
   - 强制执行 4 道本地门禁（`tsc --noEmit` -> `vitest run` -> `vite build` -> `generate-version-json.mjs --mark-verified --out dist/version.json`），全部通过后方才允许 `git commit` 与 `git push origin preview`。
2. **防抖文件监听守护脚本（[`scripts/watch-gdrive-sync.mjs`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/scripts/watch-gdrive-sync.mjs)）**：
   - 提供可配置的防抖窗口（默认 `--debounce-ms 5000`）与单实例互斥锁，支持持续监听 Google Drive 工作区并在门禁全绿后自动触发同步。
3. **本轮实际调用与全链路部署记录**：
   - 执行命令：
     ```bash
     bash scripts/sync-gdrive-to-git.sh --apply --commit "feat(preview): complete Stage 1/2 UI, neural voice karaoke, tactile audio & D7 gates" --push
     ```
   - 生成提交：`ae22f7ab8b124829196370cdce5a5bfc430c8e9c`（`55ef145..ae22f7a preview -> preview`）
   - GitHub Actions CI：Run `38687658186`（Job `116266101800`，`conclusion = success`）
   - Cloudflare Pages 部署：Deployment ID `2623079f-2874-407c-a7ac-3a73e7152717`（`conclusion = success`）
   - 线上全链路 HTTP Smoke Test：
     ```bash
     node scripts/smoke-test-preview.mjs --url https://preview.qingyu-island-preview.pages.dev --cdp-authenticated
     # [ALL SMOKE TESTS PASSED] 未认证拦截 + 已认证 GET/POST 503 统一契约全部通过！ EXIT_CODE=0
     ```

---

## 五、Stage 1 / Stage 2 视觉交互重构与神经语音/触觉音效深度升级验收汇总

在保持 `src/domain/` 认知引擎与儿童安全/隐私边界 100% 零改动的前提下，同步完成了：

1. **Stage 1（移动端首屏层级 + 家长端多视口适配 + 家长端 100% 静音）**：
   - 6 大视口（`360×640`、`390×844`、`430×932`、`768×1024`、`1024×768`、`1440×900`）零水平溢出（`scrollWidth <= innerWidth`），首屏直接呈现伙伴问候、平静角与现实抱抱入口及小岛探索区。
   - `ParentDashboard` 及全部子模块移除所有 `sounds.*`、`speechNarrator.speak` 与声音试听入口，切换至家长模式时立即停止儿童端正在播放的语音与环境音（由 `tests/unit/parentAudioSilence.test.ts` 验证）。
2. **Stage 2（四位原创 SVG 动物伙伴 + 2.5D 绘本小岛地图 + 低文字触觉游戏）**：
   - 构建果果、贝贝、天天、奇奇原创 SVG 形象体系（`CompanionIcons.tsx`），升级 2.5D `FairytaleIslandMap.tsx` 并保留无障碍清晰卡片视图切换，重构互动游戏为低文字大触控 SVG 交互（保持未审内容默认拦截与成人预览会话纪元隔离）。
3. **神经语音卡拉 OK 声文同步与零泄漏触觉音效合成引擎**：
   - 预生成 54 条 `zh-CN-XiaoxiaoNeural` 真实温柔童书神经语音 MP3（`public/audio/tts/`）与毫秒级 `WordBoundary` 时间轴清单（`src/data/ttsManifest.ts`），修复 `src/utils/speech.ts` 全部 7 项播放与生命周期缺陷，并在 `ChildAudioBar.tsx` 与 `CompanionBanner.tsx` 实现逐词高亮跟读。
   - 重构 `src/utils/sound.ts` 主控压缩/混响总线与 8 种木质/水滴/竖琴语义触觉音效，每次触发零节点泄漏（由 `tests/unit/audioSpeechOptimization.test.ts` 16 项单测与 `tests/e2e/stage1-2-multi-viewport.spec.ts` 24 项多视口 E2E 测试验证通过）。

---

`PASS_GATE_D7_GOVERNANCE_AND_PREVIEW`
