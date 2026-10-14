# A-LAND｜静态部署与儿童内容安全审查报告（DEPLOY_SECURITY_REVIEW）

- **审查日期**：`2026-10-14`
- **审查范围**：Gate D0–D5 全链路（源码、构建产物、Pages Functions、Service Worker、环境变量、内容审核门禁）
- **发布许可状态**：`ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED`

---

## 一、最高原则逐项安全核验矩阵

| 原则编号 | 最高原则要求 | 实施与技术控制点 | 实测验证结果 |
| :---: | :--- | :--- | :---: |
| **原则 1** | Google Drive 当前源码为此次同步的源头 | [`scripts/sync-gdrive-to-git.sh`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/scripts/sync-gdrive-to-git.sh) 单向从 Google Drive 挂载点 `rsync -avc --delete` 至 `/home/voga/A-LAND` | **PASS** |
| **原则 2** | GitHub 负责版本化和自动化部署触发 | 所有变更经本机门禁验证后在 `/home/voga/A-LAND` 生成可追溯 Git Commit | **PASS** |
| **原则 3** | GitHub `main` 暂时不得自动覆盖 | `main` 保持在 `f8c7401907b3fe5831c343b995b777254fdfe45d` 零改动；同步脚本内置 `main` 分支拦截器 | **PASS** |
| **原则 4** | 任何未通过审核的儿童内容不能因公网预览而被放行 | [`src/services/ContentAuditRegistry.ts`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/src/services/ContentAuditRegistry.ts) 中全部 17 项内容（`s1`–`s4`、`c1`–`c3`、`r1`–`r10`）保持 `approvalStatus: 'PENDING'`；`assertChildSafeContent()` 默认拒绝渲染任何未审内容 | **PASS** |
| **原则 5** | 当前所有远程求助与未验证云 API 必须保持 Fail Closed | [`functions/api/[[path]].ts`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/functions/api/[[path]].ts) 与 [`server.ts`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/server.ts) 对 `/api/*`（除 `/api/health`）一律返回 `HTTP 503 JSON`；前端求助文案明确声明仅限同设备大人，不发送远程通知 | **PASS** |
| **原则 6** | 正式公网预览必须有真实访问控制 | Cloudflare Access 零信任策略拦截未授权邮箱；`public-hold` 作为生产占位分支 | **PASS** |
| **原则 7** | 禁止将 API Token、OAuth 凭证、`.env` 或儿童私密数据提交到 GitHub | `.gitignore`、rsync 排除规则与 `dist/` 正则密钥扫描三重拦截；`vite.config.ts` 已移除 `GEMINI_API_KEY` 前端注入 | **PASS** |
| **原则 8** | 不能因旧测试失败而删除或跳过对应门禁，制造虚假的发布成功 | 28 个测试文件 / 264 项断言全部真实运行通过，无 `.skip` 或篡改 `ContentAuditRegistry` | **PASS** |

---

## 二、环境变量、前端 Bundle 与密钥防泄露审计（Gate D3）

### 1. [`vite.config.ts`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/vite.config.ts) 构建注入审计
- 已确认 `vite.config.ts` **不包含**任何 `define: { 'process.env.GEMINI_API_KEY': ... }` 或任何将服务端环境变量内联进浏览器 Bundle 的配置。
- `process.env.DISABLE_HMR` 仅用于本地开发热更新开关，不携带任何敏感凭据。

### 2. `dist/` 构建产物全量扫描
对 `vite build` 生成的 `dist/` 目录下所有文件（`dist/index.html`、`dist/assets/*.js`、`dist/assets/*.css`、`dist/sw.js`、`dist/version.json`）执行高危特征扫描：
- 扫描规则：`AIzaSy[0-9A-Za-z_-]{33}`、`GEMINI_API_KEY`、`BEGIN.*PRIVATE KEY`、`sk-[0-9A-Za-z]{20,}`、`firebaseConfig`、`oauth`
- **扫描结果**：**0 命中（Zero Secrets in Bundle）**。

### 3. `.gitignore` 与同步排除清单审计
- `.env`、`.env.local`、`.env.production`、`*.pem`、`*.key`、`.wrangler/`、`node_modules/`、`dist/` 均被 `.gitignore` 与 `scripts/sync-gdrive-to-git.sh` 双重排除。
- 仓库仅保留脱敏模板 [`.env.example`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/.env.example)（值为占位符 `"MY_GEMINI_API_KEY"` 与 `"https://example.com"`）。

---

## 三、Express `server.ts` 到 Cloudflare Pages Functions 的安全等价性验证

| 路由模式 | 本地 Express (`server.ts`) | Cloudflare Pages (`functions/` + `_routes.json`) | 安全性验证 |
| :--- | :--- | :--- | :--- |
| `GET /api/health` | 返回 `200 JSON`，声明 `mode: 'local-only-verified'`、`releaseApprovalStatus: 'ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED'` | [`functions/api/health.ts`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/functions/api/health.ts) 返回完全一致的 `200 JSON` 与 `Cache-Control: no-store` | **等价且 Fail-Safe** |
| `ALL /api/*` | 返回 `503 JSON` (`API_DISABLED_PENDING_VERIFIED_AUTH`) | [`functions/api/[[path]].ts`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/functions/api/[[path]].ts) + [`public/_routes.json`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/public/_routes.json) 强制拦截并返回 `503 JSON`，**绝不回退为 SPA `index.html`** | **等价且防 SPA 误回退** |

---

## 四、成人预览会话隔离与儿童求助诚实性审计

1. **儿童求助状态诚实性（Fail-Closed）**：
   - 经 [`src/tests/phase0SafetyContracts.test.ts`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/src/tests/phase0SafetyContracts.test.ts) 与 [`src/tests/adultPreviewSessionLeak.test.tsx`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/src/tests/adultPreviewSessionLeak.test.tsx) 验证，儿童触发“找大人抱抱”后，界面明确提示“这台设备会记下你的抱抱请求，请直接去找身边的大人”，绝不谎称“已通知远端家长”。
2. **成人内部预览会话防泄露（Zero Session Leak to Child Mode）**：
   - 开启成人未审内容预览必须通过双步验证：先完成照顾者自定义 PIN PBKDF2 校验，再输入口令 `ADULT-PREVIEW`。
   - 存在 5 分钟无操作自动超时、切换后台自动销毁（`visibilitychange` / `pagehide`）、切换回儿童端立即清除 `adultUnreviewedPreviewUnlocked` 状态等多重锁死机制，且状态仅存于内存 React State，绝不写入 `localStorage` / `sessionStorage`。
