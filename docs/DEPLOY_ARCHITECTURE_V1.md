# A-LAND｜Antigravity + Google Drive + GitHub + Cloudflare Pages 自动部署架构规范 V1.0

- **文档版本**：V1.0 (`2026-10-14`)
- **唯一开发执行工具**：Antigravity
- **唯一当前开发源码（Source of Truth）**：`/home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间`
- **本机独立 Git 工作副本**：`/home/voga/A-LAND`（物理存储于 `/home/voga/extend_200g/system_offload/projects/A-LAND`）
- **GitHub 远端仓库**：`megakii789-ux/A-LAND`（`https://github.com/megakii789-ux/A-LAND.git`）
- **目标部署平台**：Cloudflare Pages Free + Cloudflare Zero Trust Access（项目建议名：`qingyu-island-preview`）
- **当前发布门禁状态**：`ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED`

---

## 一、系统拓扑与单向数据流

为解决 Google Drive FUSE 挂载目录不适合直接承载重型 `.git` 对象库与 `node_modules` 构建 I/O 的工程矛盾，同时严格保障儿童产品内容安全与分支隔离，系统采用**“Google Drive 源码源头 → 本机隔离 Git 工作副本门禁 → GitHub 版本化 → Cloudflare Pages 静态托管 + Access 零信任门禁”**的单向流水线架构：

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. 唯一开发源码源头 (Google Drive Mount)                                │
│    /home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间             │
│    (Antigravity 直接在此目录编辑源码、测试与文档)                        │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │ scripts/sync-gdrive-to-git.sh
                                    │ Step 1: rsync --dry-run --checksum
                                    │ Step 2: 排除 .git/node_modules/.env/dist
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 2. 本机独立 Git 工作副本与本地 CI 门禁 (/home/voga/A-LAND)              │
│    - 分支守卫：锁定在 preview 分支，严禁在 main / public-hold 上自动覆写│
│    - Gate D2 类型门禁：tsc --noEmit (0 errors)                          │
│    - Gate D2 单测门禁：vitest run (28 suites / 264 tests 全绿)          │
│    - Gate D2 构建门禁：vite build (复现性锁定 package-lock.json)        │
│    - Gate D3 密钥扫描：扫描 dist/ 确保零 API Token / 私钥 / .env 泄露   │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │ git commit & git push origin preview
                                    │ (严禁 git push --force，严禁覆盖 main)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 3. GitHub 版本控制与触发中心 (megakii789-ux/A-LAND)                     │
│    ├── main 分支        : 历史冻结保护 (f8c74019...)，禁止自动覆盖      │
│    ├── public-hold 分支 : Cloudflare Pages "Production" 占位分支        │
│    │                      (仅输出静态安全占位页，不含儿童业务前端)      │
│    └── preview 分支     : 经本地门禁验证的工程预览分支 (自动触发构建)   │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │ Git-integrated Cloudflare Pages
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 4. Cloudflare Pages + Cloudflare Access (qingyu-island-preview)         │
│    - 访问控制：Cloudflare Access 零信任策略拦截未授权邮箱               │
│    - 静态资源：dist/ (含 _headers 安全头、_routes.json、version.json)   │
│    - Pages Functions：                                                  │
│      * GET /api/health  -> HTTP 200 JSON (mode: local-only-verified)    │
│      * ANY /api/[[path]]-> HTTP 503 JSON (Fail-Closed, 禁止 HTML 回退)  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 二、分支隔离与最高安全边界

| 分支名称 | 角色定位 | 自动覆盖策略 | Cloudflare Pages 映射 | 访问控制要求 |
| :--- | :--- | :--- | :--- | :--- |
| `main` | 历史基线归档（当前 HEAD: `f8c7401907b3fe5831c343b995b777254fdfe45d`） | **严禁自动覆盖、严禁合并、严禁 `--force`** | **禁止直接部署为公开站点** | 不对外公开暴露 |
| `public-hold` | 生产分支安全占位（Production Hold） | 仅包含静态安全占位 HTML 与 503 API 拦截 | 绑定为 Pages **Production Branch** | 返回 `ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED` 静态占位页，无任何儿童端业务代码 |
| `preview` | 工程预览分支（Engineering Preview） | 仅允许通过 `sync-gdrive-to-git.sh --apply` 全门禁通过后前向提交 | 绑定为 Pages **Preview Branch** (`preview.qingyu-island-preview.pages.dev`) | **强制启用 Cloudflare Access**（白名单邮箱 OTP / Google OAuth 验证） |

---

## 三、静态部署适配架构（Express `server.ts` → Cloudflare Pages Functions）

### 1. 前端与 Express 依赖审计结论
经全量扫描 `src/` 与根目录代码：
- React 前端业务运行在纯浏览器端（Local-First `localStorage` 状态存储 + 浏览器原生音频/动画 API），**没有任何运行时代码强依赖 Express 动态会话或服务端渲染**。
- 原 `server.ts` 仅承担两项职责：
  1. `GET /api/health`：返回本地优先模式健康检查 JSON；
  2. `ALL /api/*`：对所有尚未完成真实身份验证与端到端加密验证的云端 API 返回 `HTTP 503`（Fail-Closed）。

### 2. Cloudflare Pages Functions 最小安全适配
为防止 Cloudflare Pages 默认 SPA 路由将 `/api/*` 错误回退（Fallback）为 `index.html`（HTTP 200 HTML），架构引入三层防护：
1. [`public/_routes.json`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/public/_routes.json)：显式声明 `"include": ["/api/*"]`，仅将 `/api/*` 路由交由 Pages Functions 处理，静态资产直接由边缘 CDN 响应，既杜绝 `/api/*` 落入 SPA HTML fallback，又将免费 Functions 调用额度消耗降至最低。
2. [`functions/api/health.ts`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/functions/api/health.ts)：响应 `GET /api/health`，返回 `HTTP 200` 与 `application/json`，明确标注：
   - `mode: "local-only-verified"`
   - `remoteRelayEnabled: false`
   - `cloudSyncEnabled: false`
   - `releaseApprovalStatus: "ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED"`
3. [`functions/api/[[path]].ts`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/functions/api/[[path]].ts)：捕获其余全部 `/api/*` 请求（如 `/api/caregiver/sync`、`/api/help/relay` 等），一律返回 `HTTP 503 Service Unavailable`（`Content-Type: application/json; charset=utf-8`），携带 `X-A-Land-Fail-Closed: true` 与 `X-Release-Gate-Status: ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED` 响应头。

---

## 四、PWA 与 Service Worker 缓存及回退架构

在 [`public/sw.js`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/public/sw.js) 中实施了针对公网预览与版本回退的专门加固：
1. **缓存版本升级**：升级为 `sunny-island-app-shell-v2`，激活（`activate`）时自动清理所有旧版本缓存（如 `sunny-island-app-shell-v1`）。
2. **零信任与动态探针旁路**：
   - 严禁拦截 `/cdn-cgi/*`（Cloudflare Access 认证回调与令牌刷新端点）；
   - 严禁拦截 `/api/*` 与 `/version.json`（确保版本探针与 Fail-Closed 503 状态实时穿透）。
3. **导航请求 Network-First + 离线回退**：
   - HTML 导航请求（`request.mode === 'navigate'`）优先请求网络最新构建，确保版本更新或回滚后浏览器刷新即可获取最新 `index.html`；仅在断网离线时回退至缓存的 App Shell。
4. **主动控制通道**：支持 `SKIP_WAITING` 与 `CLEAR_OLD_CACHES` `postMessage` 指令，便于运维或自动化测试强制刷新旧缓存。

---

## 五、失败处理与非破坏性回滚机制

1. **失败即停止（Fail-Fast）**：
   - 在 [`scripts/sync-gdrive-to-git.sh`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/scripts/sync-gdrive-to-git.sh) 中开启 `set -euo pipefail`。
   - `rsync dry-run`、敏感文件检查、`tsc --noEmit`、`vitest run`、`vite build`、`dist/` 密钥扫描任一环节失败，脚本立即非零退出，**绝不生成 Git Commit，绝不触发推送**。
2. **双层安全回滚方案**：
   - **Git 前向回滚（推荐，可审计）**：运行 [`scripts/rollback-preview.sh`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/scripts/rollback-preview.sh) `--target <VERIFIED_SHA> --apply`，基于历史已验证 Commit 的 Git Tree 创建新的前向回滚提交（Forward Rollback Commit），无需 `--force` 推送即可触发 Cloudflare Pages 自动重新部署。
   - **Cloudflare 控制台/CLI 秒级回滚**：通过 Cloudflare Dashboard → Pages → `qingyu-island-preview` → Deployments 选择上一健康版本点击 **Rollback to this deployment**，或执行 `npx wrangler pages deployment tail / rollback`。

---

## 六、最小成本估算（Cloudflare Pages Free 架构）

| 资源项 | 选用规格 / 计划 | 配额上限 | 本项目预计消耗 | 月度费用估算 |
| :--- | :--- | :--- | :--- | :--- |
| **GitHub 仓库与存储** | GitHub Free | 无限公开/私有仓库 | 1 个仓库（< 20 MB） | **$0.00 / 月** |
| **Cloudflare Pages 托管与构建** | Cloudflare Pages Free | 每月 500 次构建、无限静态带宽 | 约 10–50 次构建/月 | **$0.00 / 月** |
| **Cloudflare Pages Functions** | Pages Functions Free | 每日 100,000 次请求（通过 `_routes.json` 仅拦截 `/api/*`） | < 500 次/日 | **$0.00 / 月** |
| **Cloudflare Zero Trust Access** | Zero Trust Free Plan | 最多 50 名受保护用户（Email OTP / OAuth） | 1–5 名内部审计/开发人员 | **$0.00 / 月** |
| **SSL/TLS 证书与边缘 CDN** | Cloudflare Universal SSL | 自动签发与续期 HTTPS | 标准预览子域名 | **$0.00 / 月** |
| **总计（Total）** | — | — | — | **$0.00 / 月** |
