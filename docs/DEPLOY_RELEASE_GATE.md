# A-LAND｜发布门禁与工程预览准入规范（DEPLOY_RELEASE_GATE）

- **当前全局门禁状态**：`ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED`
- **儿童正式使用授权状态**：**未授权（NOT APPROVED FOR CHILD PRODUCTION USE）**
- **生产分支策略**：`public-hold`（仅静态安全占位，禁止公开部署 `main` 或儿童业务前端）
- **工程预览分支策略**：`preview`（强制 Cloudflare Access 邮箱白名单保护）

---

## 一、双重门禁判定结论（Gate D0–D5）

| 门禁阶段 | 门禁名称 | 准入标准 | 当前状态 | 判定说明 |
| :---: | :--- | :--- | :---: | :--- |
| **Gate D0** | 本机源码与 GitHub 同步门禁 | 独立 Git 工作副本 `/home/voga/A-LAND`、`preview` 分支隔离、`rsync --dry-run` 校验、零密钥追踪、禁止覆盖 `main` | **PASS (本地完成)** | 已完成 `preview` 与 `public-hold` 分支提交，待人工完成 GitHub 账号认证后执行 `git push` |
| **Gate D1** | Cloudflare Pages 基础设施门禁 | 静态构建 `dist`、`preview` 自动部署、`public-hold` 生产占位、Cloudflare Access 访问控制 | **READY (待账号授权)** | 已交付完整 `functions/`、`_routes.json`、`_headers` 与 `public-hold` 分支，待人工登录 Cloudflare 绑定 |
| **Gate D2** | 构建可复现性门禁 | 锁定 `npm` + `package-lock.json` (`node 20.20.2`, `vite 8.3.4`, `esbuild 0.28.2`)，全新隔离目录通过 `tsc --noEmit`、28 套件单测、`vite build` | **PASS** | 全新隔离目录 `/tmp/a-land-isolated-verify` 100% 复现通过，未放宽任何内容审核标准 |
| **Gate D3** | 静态部署安全适配门禁 | `/api/health` 200 JSON Local-Only、`/api/*` 503 JSON Fail-Closed、禁止 SPA HTML 回退、Bundle 零密钥、SW 离线与更新适配 | **PASS** | `cloudflarePagesAdapter.test.ts` 与 `smoke-test-preview.mjs` 全部实测通过 |
| **Gate D4** | 安全自动部署流水线门禁 | 失败即停止（Fail-Fast）、透出 `ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED`、版本与回滚记录完备 | **PASS** | `scripts/sync-gdrive-to-git.sh` 与 `scripts/rollback-preview.sh` 已实测验证 |
| **Gate D5** | 上线后全量验收门禁 | 6 视口（360/390/430/768/1024/1440）E2E、`/api/*` HTTP 实测、求助诚实性、内容审核门禁、SW 缓存更新与回退、公网 Access 实测 | **LOCAL PASS / PUBLIC PENDING AUTH** | 本机全栈环境已完成 1-10 项中全部本地可测项；公网 HTTPS 与 Access 邮箱拦截待账号授权推送后执行最终确认 |

---

## 二、为什么当前状态必须标注为 `ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED`

尽管全部工程门禁（TypeScript `0 errors`、Vitest `28/28` 测试套件、Playwright 6 视口 E2E 测试、静态构建与 API Fail-Closed 拦截）均已通过，本项目仍**严禁标注为生产级 PASS 或开放给真实 6 岁儿童正式使用**，原因如下：

1. **儿童内容临床与发展心理学审核尚未签发（Content Audit Gate: `PENDING`）**：
   - [`src/services/ContentAuditRegistry.ts`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/src/services/ContentAuditRegistry.ts) 中的 4 个故事（`s1`–`s4`）、3 张认知卡（`c1`–`c3`）和 10 个修复方案（`r1`–`r10`）均处于 `approvalStatus: 'PENDING'`（`reviewer: null`）。
   - 根据最高原则第 4 条与第 8 条，在持证儿童发展心理学顾问完成 AG-R6 五维独立审核并签字前，所有内容在儿童端默认 Fail-Closed 拦截。
2. **远程求助通道尚未开通（Remote Help Relay: `FAIL_CLOSED_503`）**：
   - 当前应用运行在 `local-only-verified` 模式，不具备跨设备实时推送能力，仅允许在同一设备且有照顾者现场陪同的受控环境下进行工程预览。

---

## 三、部署版本台账与回滚记录（Deployment & Rollback Ledger）

| 版本角色 | 分支名称 | Git Commit SHA | 构建时间 (UTC+8) | 构建状态 | 预览/访问地址 | 发布门禁标识 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **历史回滚基线 (Rollback Baseline)** | `main` (Frozen) | `f8c7401907b3fe5831c343b995b777254fdfe45d` | `2026-10-14` | Baseline | 禁止公开部署 | `BASELINE_FROZEN` |
| **生产安全占位 (Production Hold)** | `public-hold` | *(见提交记录)* | `2026-10-14` | `READY` | `https://qingyu-island-preview.pages.dev` | `PUBLIC_HOLD_PLACEHOLDER` |
| **受控工程预览 (Engineering Preview)** | `preview` | *(见提交记录)* | `2026-10-14` | `VERIFIED_LOCAL` | `https://preview.qingyu-island-preview.pages.dev` | `ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED` |

### 标准回滚操作指令
如需将 `preview` 分支安全回退至历史基线 `f8c7401907b3fe5831c343b995b777254fdfe45d`（或任意已验证 SHA），**严禁使用 `git push --force`**，请执行：
```bash
# 1. 先执行 dry-run 预览回退差异
bash scripts/rollback-preview.sh --target f8c7401907b3fe5831c343b995b777254fdfe45d --dry-run

# 2. 确认无误后生成前向回滚提交并推送
bash scripts/rollback-preview.sh --target f8c7401907b3fe5831c343b995b777254fdfe45d --apply --push
```

---

## 四、明确停止条件（Section 9 强制红线）

在获得仓库所有者与独立审计明确书面确认前，以下操作处于**硬性锁定禁止状态**：
1. 禁止移除 Cloudflare Access 访问控制或将儿童业务端暴露于公网匿名访问；
2. 禁止修改任何生产环境 Firebase 数据库或开启未经验证的云端同步；
3. 禁止自动将 `preview` 合并入 `main` 或对任何分支执行 `git push --force`；
4. 禁止将 `ContentAuditRegistry.ts` 中任何未由人工专家签署的 `PENDING` 条目批量改为 `PASSED`。
