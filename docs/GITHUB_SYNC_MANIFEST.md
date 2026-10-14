# A-LAND｜本机源码与 GitHub 同步清单及差异审计（GITHUB_SYNC_MANIFEST）

- **同步审计时间**：`2026-10-14T20:46:00+08:00`
- **唯一源头目录（Google Drive）**：`/home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间`
- **本机独立 Git 工作副本**：`/home/voga/A-LAND`（软链至 `/home/voga/extend_200g/system_offload/projects/A-LAND`）
- **远端仓库地址**：`https://github.com/megakii789-ux/A-LAND.git`
- **远端 `origin/main` 最新 HEAD**：`f8c7401907b3fe5831c343b995b777254fdfe45d`（`feat(cognitive): upgrade content audit to AG-R6`）
- **同步目标分支**：`preview`（严禁自动覆盖 `main`，严禁使用 `git push --force`）

---

## 一、本地 Git 环境与权限预检结果（Gate D0）

| 检查项 | 实测结果 | 说明 |
| :--- | :--- | :--- |
| **Git 版本** | `git version 2.43.0` | 运行正常 |
| **源目录 `.git` 状态** | Google Drive 源目录无 `.git` | 避免 FUSE 挂载层产生 Git 对象锁死或文件损坏 |
| **工作副本位置** | `/home/voga/A-LAND` | 独立于 Google Drive 挂载点的本机 ext4 文件系统 |
| **`origin/main` HEAD** | `f8c7401907b3fe5831c343b995b777254fdfe45d` | 保持完整冻结，未做任何改写 |
| **当前推送权限** | 本地未配置 GitHub PAT / SSH 私钥 | 遵循 Gate D1 原则，已完成本地 `preview` 与 `public-hold` 提交，等待仓库所有者认证后推送 |

---

## 二、严格排除规则（Exclusions）

同步脚本 [`scripts/sync-gdrive-to-git.sh`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/scripts/sync-gdrive-to-git.sh) 强制排除以下路径与文件类型：
- 版本控制与构建缓存：`.git/`、`node_modules/`、`dist/`、`server.js`、`.wrangler/`、`coverage/`、`playwright-report/`、`test-results/`
- 密钥与环境配置：`.env`、`.env.local`、`.env.development*`、`.env.test*`、`.env.production*`、`*.pem`、`*.key`、`*.p12`（仅保留脱敏模板 `.env.example`）
- 历史废弃单文件ロック：`bun.lock`（已统一替换为标准 `package-lock.json`）
- 临时与系统文件：`.DS_Store`、`*.log`、`*.sqlite*`

---

## 三、关键文件 SHA-256 完整性校验表

| 文件路径 | SHA-256 哈希值 | 状态说明 |
| :--- | :--- | :--- |
| [`src/domain/cognitive/ContentAuditRegistry.ts`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/src/domain/cognitive/ContentAuditRegistry.ts) | `fbc825550bdfa597bb140b8ca51b461f8595f484bf0ce6a55e2f07fe11864eb2` | **未篡改**：全部 17 项内容保持 `PENDING` |
| [`src/App.tsx`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/src/App.tsx) | `7e24f1b324ddcabcdb05f0e7ac24cba8f1873a09b0c57788b3aa0feda6cfa802` | 核心前端入口，保持原有业务逻辑 |
| [`package.json`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/package.json) | `bc52dd72325d7a61eecd379539adfe2c5954c9f9d44111bcbf14a5b05ac2537c` | 锁定 `engines`、对齐 `esbuild@^0.28.2`、补充门禁脚本 |
| [`package-lock.json`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/package-lock.json) | `7e33734cd280332269589bdee355ec0cd40bf9a4b58944b293b2e62c83290180` | 正式 npm lockfile v3（替代原 `bun.lock`） |
| [`vite.config.ts`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/vite.config.ts) | `78e6d6e0756adcdc59ff492fd00c809188c9aab7fe52a55449b14a4fdc953862` | 适配 Vite 8 `import.meta.dirname`，零密钥内联 |
| [`server.ts`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/server.ts) | `fea064addbec400dd00b845a47998b8d5d49baa4a6aac422b93afe007e03d0d1` | 本地 `/api/health` 与 `/api/*` 503 Fail-Closed |
| [`functions/api/health.ts`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/functions/api/health.ts) | `c3707d72b65f0c517ed5c11288d8740d674285f5b5ba6f41c6072af177a567bc` | Cloudflare Pages Functions 健康探针 |
| [`functions/api/[[path]].ts`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/functions/api/[[path]].ts) | `6ca9be5fb9fbd865a35d19e3add830afc915d995855ffde0505571885d6927bf` | Cloudflare Pages Functions `/api/*` 503 拦截器 |
| [`public/_routes.json`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/public/_routes.json) | `9ac04b0b988b70aa7a8aeef820ca5653cab83721b0df8013e54a4450f1d22040` | 阻止 `/api/*` 落入 SPA HTML fallback |
| [`public/_headers`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/public/_headers) | `ebe9bc6098bd9d945333e3a5d3983484854de6a1981471baad70aebe2362a4c4` | 边缘安全响应头与缓存控制策略 |
| [`public/sw.js`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/public/sw.js) | `73d3b0085da7f3eee9431a50e486d7049a9b31bc6cbcdd481c2c219afdcfd222` | `sunny-island-app-shell-v2` 离线与回滚安全缓存 |
| [`public/version.json`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/public/version.json) | `31729536b86a26c70065866218532c573dd61edde53f8841358f7feefe61c9fe` | 工程预览版本与回滚基线元数据 |
| [`src/tests/adultPreviewSessionLeak.test.tsx`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/src/tests/adultPreviewSessionLeak.test.tsx) | `e1419640e5e1ec97bc1d4f3808f5bd5bcbe282f178f315e2253f5f3010967a2c` | 修复 4 处 TS 类型错误与 3 处历史单测失败 |
| [`tests/domain/cloudflarePagesAdapter.test.ts`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/tests/domain/cloudflarePagesAdapter.test.ts) | `4f799d17d3c9a0d7b1aad5eab6d33a033edf382d8809461497f9a21fac09a15a` | Pages Functions 与 `_routes.json` 契约单测 |

---

## 四、相对于 `origin/main` (`f8c74019`) 的完整文件变更分类清单

### 1. 删除（Deleted）
- `bun.lock`（移除与本机 Node/npm 环境不一致的旧锁文件，由 `package-lock.json` 正式接管）
- `qingyu-island-react-audit/.env.example`（移除历史空壳子目录残留文件）

### 2. 修改（Modified）
- `package.json`：声明 `engines`、对齐 `esbuild@^0.28.2`、新增 `verify:ci` / `sync:dry-run` / `sync:apply` 脚本
- `vite.config.ts`：兼容 Vite 8 原生 `import.meta.dirname`
- `playwright.config.ts`：支持通过 `PLAYWRIGHT_BASE_URL` 对公网预览 HTTPS 地址执行 6 视口验收
- `server.ts`：在 `/api/health` 与 `/api/*` 503 JSON 中补充 `releaseApprovalStatus: 'ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED'`
- `index.html`：新增 `meta[name="release-gate-status"]` 与 `meta[name="robots" content="noindex, nofollow, noarchive"]`
- `public/sw.js`：升级至 `sunny-island-app-shell-v2`，绕过 `/cdn-cgi/`、`/api/`、`/version.json`，支持导航 Network-First 与旧缓存清除
- `src/App.tsx`、`src/index.css`、`src/components/*`、`src/domain/*`、`tests/*`：同步 Google Drive 当前最新 Phase 1A 无障碍、自适应视口与修复后的 `adultPreviewSessionLeak.test.tsx`

### 3. 新增（Added）
- 锁文件与版本钉死：`package-lock.json`、`.nvmrc`、`.node-version`
- Cloudflare Pages 静态适配：`functions/api/health.ts`、`functions/api/[[path]].ts`、`public/_routes.json`、`public/_headers`、`public/version.json`
- 自动化同步、回滚与验收脚本：`scripts/sync-gdrive-to-git.sh`、`scripts/rollback-preview.sh`、`scripts/smoke-test-preview.mjs`
- 新增测试套件：`tests/domain/cloudflarePagesAdapter.test.ts`、`tests/e2e/accessibility-reduced-motion.spec.ts`、`tests/e2e/dual-tab-lifecycle.spec.ts`、`tests/e2e/viewport-overflow.spec.ts`
- 交付架构与审计文档（`docs/`）：
  - `docs/DEPLOY_ARCHITECTURE_V1.md`
  - `docs/GITHUB_SYNC_MANIFEST.md`
  - `docs/CLOUDFLARE_PREVIEW_SETUP.md`
  - `docs/DEPLOY_PIPELINE_TEST_EVIDENCE.md`
  - `docs/DEPLOY_SECURITY_REVIEW.md`
  - `docs/DEPLOY_RELEASE_GATE.md`
