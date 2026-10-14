# A-LAND｜Gate D6 公网预览最终安全封印独立修复与验收报告（DEPLOY_GATE_D6_INDEPENDENT_FIX）

- **唯一开发源头（Source of Truth）**：`/home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间`
- **本机 Git 工作副本**：`/home/voga/A-LAND`（软链接至 `/home/voga/extend_200g/system_offload/projects/A-LAND`）
- **GitHub 远端仓库**：`megakii789-ux/A-LAND`
- **修复前预览分支 HEAD（Gate D5）**：`dd4fd193808ab857a846f79fc05e4101aa97c290`（Cloudflare Deployment ID: `bff16fbd-c78a-4f8c-8b90-fb7cd6f6ca11`）
- **修复后已验证安全基线提交（Gate D6）**：
  - 核心安全封印提交：`6e6a381b46fe15e087b7dafec4481a9965657468`
  - 回滚白名单与溯源登记提交：`04a18efe5ed996c3969ff4b584883a1116bc80a7`（Cloudflare Deployment ID: `24d313e9-d67b-4396-99c3-057965a410dc`）
- **生产占位分支（`public-hold`）HEAD**：`e00706e281b298414ee8eebe9de3853fa6ec9765`（Cloudflare Deployment ID: `ad78b30e-4930-4c90-b06b-f2d3f5c90014`）
- **历史归档分支（`main`）HEAD**：`f8c7401907b3fe5831c343b995b777254fdfe45d`（零覆盖，且已正式吊销回滚目标资格）
- **当前发布门禁状态**：`ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED`
- **本轮最终判定结论**：`PASS_PRIVATE_ENGINEERING_PREVIEW`

---

## 一、D6-01｜修正 API 契约与全链路 HTTP Smoke Test

### 1. 统一 503 Fail-Closed 响应 JSON 契约
对 [`functions/api/[[path]].ts`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/functions/api/[[path]].ts)、[`server.ts`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/server.ts)、[`scripts/smoke-test-preview.mjs`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/scripts/smoke-test-preview.mjs) 及 [`tests/domain/cloudflarePagesAdapter.test.ts`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/tests/domain/cloudflarePagesAdapter.test.ts) 进行了契约对齐，彻底消除了测试要求 `mode` 字段而 Pages Function 未返回的矛盾。统一后的 `/api/*` 503 响应 JSON 结构如下：

```json
{
  "success": false,
  "code": "API_DISABLED_PENDING_VERIFIED_AUTH",
  "error": "CLOUD_API_DISABLED",
  "mode": "local-only-verified",
  "releaseApprovalStatus": "ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED",
  "remoteRelayEnabled": false,
  "cloudSyncEnabled": false,
  "message": "当前版本为本地高安全运行模式，云端同步与远程通知接口已强制关闭（Fail-Closed）。",
  "data": null
}
```

### 2. 真实 Cloudflare Access 授权环境下的完整 HTTP Smoke Test 实测结果
废除了原脚本在 `--expect-access-gate` 下检测到 302 即提前返回退出码 0 的缺陷。升级后的 [`scripts/smoke-test-preview.mjs`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/scripts/smoke-test-preview.mjs) 同时执行 **Phase 1（未认证 GET/POST 拦截验证）** 与 **Phase 2（已认证 GET/POST 全契约验证，通过本机已授权浏览器沙箱内执行同源 `fetch`，零 Cookie/Token 提取或落盘）**。

#### 实测接口状态码、Content-Type、响应字段与退出码汇总表
（实测目标：`https://preview.qingyu-island-preview.pages.dev` 与 `https://24d313e9.qingyu-island-preview.pages.dev`，测试退出码：`0`）

| 认证状态 | 请求方法与路径 | 实际状态码 | 实际 `Content-Type` | 关键响应头 / JSON 字段校验结果 | 判定 |
| :--- | :--- | :---: | :--- | :--- | :---: |
| **未认证 (Unauthenticated)** | `GET /` | `302` | `text/html; charset=UTF-8` | `Location: https://qingyu-island-preview-pages.cloudflareaccess.com/cdn-cgi/access/login/...` | **PASS** |
| **未认证 (Unauthenticated)** | `GET /version.json` | `302` | `text/html; charset=UTF-8` | `Location: https://qingyu-island-preview-pages.cloudflareaccess.com/cdn-cgi/access/login/...` | **PASS** |
| **未认证 (Unauthenticated)** | `GET /api/health` | `302` | `text/html; charset=UTF-8` | `Location: https://qingyu-island-preview-pages.cloudflareaccess.com/cdn-cgi/access/login/...` | **PASS** |
| **未认证 (Unauthenticated)** | `POST /api/health` | `302` | `text/html; charset=UTF-8` | `Location: https://qingyu-island-preview-pages.cloudflareaccess.com/cdn-cgi/access/login/...` | **PASS** |
| **未认证 (Unauthenticated)** | `GET /api/caregiver/sync` | `302` | `text/html; charset=UTF-8` | `Location: https://qingyu-island-preview-pages.cloudflareaccess.com/cdn-cgi/access/login/...` | **PASS** |
| **未认证 (Unauthenticated)** | `POST /api/caregiver/sync` | `302` | `text/html; charset=UTF-8` | `Location: https://qingyu-island-preview-pages.cloudflareaccess.com/cdn-cgi/access/login/...` | **PASS** |
| **未认证 (Unauthenticated)** | `POST /api/help/relay` | `302` | `text/html; charset=UTF-8` | `Location: https://qingyu-island-preview-pages.cloudflareaccess.com/cdn-cgi/access/login/...` | **PASS** |
| **已认证 (Authenticated)** | `GET /` | `200` | `text/html; charset=utf-8` | `X-Release-Gate-Status: ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED`，零明文 API 密钥 | **PASS** |
| **已认证 (Authenticated)** | `GET /version.json` | `200` | `application/json` | `commitSha: "04a18efe5ed996c3969ff4b584883a1116bc80a7"`, `buildStatus: "VERIFIED_QUALITY_GATE_PASSED"`, `contentAuditGate: "FAIL_CLOSED_PENDING_AUDIT"`, `rollbackTargetSha: "6e6a381b46fe15e087b7dafec4481a9965657468"` | **PASS** |
| **已认证 (Authenticated)** | `GET /api/health` | `200` | `application/json; charset=utf-8` | `status: "ok"`, `mode: "local-only-verified"`, `remoteRelayEnabled: false`, `cloudSyncEnabled: false`, `releaseApprovalStatus: "ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED"` | **PASS** |
| **已认证 (Authenticated)** | `POST /api/health` | `405` | `application/json; charset=utf-8` | `success: false`, `code: "METHOD_NOT_ALLOWED"`, `error: "ONLY_GET_ALLOWED_ON_HEALTH"` | **PASS** |
| **已认证 (Authenticated)** | `GET /api/caregiver/sync` | `503` | `application/json; charset=utf-8` | `success: false`, `code: "API_DISABLED_PENDING_VERIFIED_AUTH"`, `error: "CLOUD_API_DISABLED"`, `mode: "local-only-verified"`, `remoteRelayEnabled: false`, `cloudSyncEnabled: false`, `releaseApprovalStatus: "ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED"` | **PASS** |
| **已认证 (Authenticated)** | `POST /api/caregiver/sync` | `503` | `application/json; charset=utf-8` | 同上（统一 503 JSON 契约，未落入 SPA HTML 回退） | **PASS** |
| **已认证 (Authenticated)** | `GET /api/help/relay` | `503` | `application/json; charset=utf-8` | 同上（统一 503 JSON 契约，未落入 SPA HTML 回退） | **PASS** |
| **已认证 (Authenticated)** | `POST /api/help/relay` | `503` | `application/json; charset=utf-8` | 同上（统一 503 JSON 契约，未落入 SPA HTML 回退） | **PASS** |
| **已认证 (Authenticated)** | `GET /api/unknown-cloud-endpoint` | `503` | `application/json; charset=utf-8` | 同上（统一 503 JSON 契约，未落入 SPA HTML 回退） | **PASS** |
| **已认证 (Authenticated)** | `POST /api/unknown-cloud-endpoint` | `503` | `application/json; charset=utf-8` | 同上（统一 503 JSON 契约，未落入 SPA HTML 回退） | **PASS** |

#### 实测命令行原始输出摘要
```text
$ node scripts/smoke-test-preview.mjs --url https://preview.qingyu-island-preview.pages.dev --cdp-authenticated
[Phase 1] 验证未认证 (Unauthenticated) GET 与 POST 请求被 Cloudflare Access 拦截...
  [UNAUTH GET /] status=302 content-type="text/html; charset=UTF-8" redirect="https://qingyu-island-preview-pages.cloudflareaccess.com/cdn-cgi/access/login/preview.qingyu-island-preview.pages.dev"
  [UNAUTH GET /api/health] status=302 content-type="text/html; charset=UTF-8" redirect="https://qingyu-island-preview-pages.cloudflareaccess.com/cdn-cgi/access/login/preview.qingyu-island-preview.pages.dev"
  [UNAUTH POST /api/health] status=302 content-type="text/html; charset=UTF-8" redirect="https://qingyu-island-preview-pages.cloudflareaccess.com/cdn-cgi/access/login/preview.qingyu-island-preview.pages.dev"
  [UNAUTH GET /api/caregiver/sync] status=302 content-type="text/html; charset=UTF-8" redirect="https://qingyu-island-preview-pages.cloudflareaccess.com/cdn-cgi/access/login/preview.qingyu-island-preview.pages.dev"
  [UNAUTH POST /api/caregiver/sync] status=302 content-type="text/html; charset=UTF-8" redirect="https://qingyu-island-preview-pages.cloudflareaccess.com/cdn-cgi/access/login/preview.qingyu-island-preview.pages.dev"
  [UNAUTH POST /api/help/relay] status=302 content-type="text/html; charset=UTF-8" redirect="https://qingyu-island-preview-pages.cloudflareaccess.com/cdn-cgi/access/login/preview.qingyu-island-preview.pages.dev"
[Phase 2 - 2/5] 验证已认证 GET /version.json 动态构建溯源与审核门禁元数据...
  [VERSION META] commitSha=04a18efe5ed996c3969ff4b584883a1116bc80a7 deploymentTimestamp=2026-10-14T14:38:24.093Z buildStatus=VERIFIED_QUALITY_GATE_PASSED contentAuditGate=FAIL_CLOSED_PENDING_AUDIT
[Phase 2 - 3/5] 验证已认证 GET /api/health (200) 与 POST /api/health (405)...
  [AUTH GET /api/health] status=200 content-type="application/json; charset=utf-8" body={"status":"ok","mode":"local-only-verified","deploymentTarget":"cloudflare-pages-static","releaseApprovalStatus":"ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED","remoteRelayEnabled":false,"cloudSyncEnabled":false,"timestamp":"2026-10-14T14:41:06.357Z"}
  [AUTH POST /api/health] status=405 content-type="application/json; charset=utf-8" body={"success":false,"code":"METHOD_NOT_ALLOWED","error":"ONLY_GET_ALLOWED_ON_HEALTH","message":"健康检查端点仅支持 GET 请求。","data":null}
[Phase 2 - 4/5] 验证已认证 GET 与 POST /api/* 业务接口统一 Fail-Closed 503 JSON 契约 (含 mode 字段)...
  [AUTH GET /api/caregiver/sync] status=503 content-type="application/json; charset=utf-8" body={"success":false,"code":"API_DISABLED_PENDING_VERIFIED_AUTH","error":"CLOUD_API_DISABLED","mode":"local-only-verified","releaseApprovalStatus":"ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED","remoteRelayEnabled":false,"cloudSyncEnabled":false,"message":"当前版本为本地高安全运行模式，云端同步与远程通知接口已强制关闭（Fail-Closed）。","data":null}
  [AUTH POST /api/caregiver/sync] status=503 content-type="application/json; charset=utf-8" body={"success":false,"code":"API_DISABLED_PENDING_VERIFIED_AUTH","error":"CLOUD_API_DISABLED","mode":"local-only-verified","releaseApprovalStatus":"ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED","remoteRelayEnabled":false,"cloudSyncEnabled":false,"message":"当前版本为本地高安全运行模式，云端同步与远程通知接口已强制关闭（Fail-Closed）。","data":null}
  [AUTH GET /api/help/relay] status=503 content-type="application/json; charset=utf-8" body={"success":false,"code":"API_DISABLED_PENDING_VERIFIED_AUTH","error":"CLOUD_API_DISABLED","mode":"local-only-verified","releaseApprovalStatus":"ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED","remoteRelayEnabled":false,"cloudSyncEnabled":false,"message":"当前版本为本地高安全运行模式，云端同步与远程通知接口已强制关闭（Fail-Closed）。","data":null}
  [AUTH POST /api/help/relay] status=503 content-type="application/json; charset=utf-8" body={"success":false,"code":"API_DISABLED_PENDING_VERIFIED_AUTH","error":"CLOUD_API_DISABLED","mode":"local-only-verified","releaseApprovalStatus":"ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED","remoteRelayEnabled":false,"cloudSyncEnabled":false,"message":"当前版本为本地高安全运行模式，云端同步与远程通知接口已强制关闭（Fail-Closed）。","data":null}
==================================================================
 [ALL SMOKE TESTS PASSED] 未认证拦截 + 已认证 GET/POST 503 统一契约全部通过！
 EXIT_CODE=0
==================================================================
```

---

## 二、D6-02｜禁止回滚至不安全历史版本与回滚脚本加固

### 1. 取消 `f8c74019` 回滚资格与建立白名单机制
- 新增 [`scripts/rollback-whitelist.json`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/scripts/rollback-whitelist.json)：
  - 将 `f8c7401907b3fe5831c343b995b777254fdfe45d`（缺少 Cloudflare Pages Functions、`public/_routes.json`、Phase 1A-FIX 会话纪元隔离及 D6 安全封印）以及 D6 前的早期预览提交（`8a1eb34...`、`ada7191...`、`dd4fd19...`）列入 `revokedUnsafeTargets` 黑名单。
  - 仅将通过 Gate D6 全量验证的提交（`6e6a381b46fe15e087b7dafec4481a9965657468` 等）列入 `approvedSafeTargets` 白名单。
- 重构 [`scripts/rollback-preview.sh`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/scripts/rollback-preview.sh)：
  1. 移除默认 `TARGET_SHA="f8c74019..."`，强制要求显式传入 `--target <VERIFIED_SAFE_GIT_SHA>`。
  2. **工作区干净检查**：执行前运行 `git status --porcelain --untracked-files=normal`，存在任何未提交或未追踪文件时立即报错退出（Exit Code `1`），严禁无提示覆盖本地改动。
  3. **白名单与 Git Tree 安全契约核验**：校验目标提交不在黑名单内且位于 `approvedSafeTargets` 白名单中，并直接检查目标 Git Tree 中包含 `functions/api/[[path]].ts`（含 `status: 503` 与 `mode: 'local-only-verified'`）、`public/_routes.json`（含 `"/api/*"`）、`public/sw.js`（含 `PRECACHE_DISABLED_IN_PRIVATE_PREVIEW`）、`ContentAuditRegistry.ts`、`offlineHugService.ts` 与 `parentAccess.ts`。
  4. **回滚后强制质量门禁**：生成前向回滚提交后，立即执行 `tsc --noEmit`、`vitest run`（全量 28 套件 / 265 项测试）、`vitest run tests/domain/cloudflarePagesAdapter.test.ts`（专项验证回滚后 `/api/*` 仍然 Fail-Closed 503）及 `vite build`。任一环节失败立即自动 `git reset --hard` 撤销回滚提交并拒绝推送。

### 2. 回滚拦截与安全回滚实测日志
```text
=== D6-02 NEGATIVE TEST 1: 尝试回滚至已吊销的 f8c74019 ===
$ bash scripts/rollback-preview.sh --target f8c7401907b3fe5831c343b995b777254fdfe45d --dry-run
[FATAL] 安全回滚白名单拦截：
[REJECT] f8c74019 已被永久取消回滚资格：缺少 Cloudflare Pages Functions、_routes.json 及 D6 安全封印。
EXIT_CODE=1

=== D6-02 NEGATIVE TEST 2: 尝试回滚至 D6 前版本 dd4fd19 ===
$ bash scripts/rollback-preview.sh --target dd4fd193808ab857a846f79fc05e4101aa97c290 --dry-run
[FATAL] 安全回滚白名单拦截：
[REJECT] 目标版本 dd4fd193808ab857a846f79fc05e4101aa97c290 位于已吊销不安全列表: Gate D5 文档提交：尚未包含 Gate D6 503 mode 字段统一契约、回滚白名单守卫与私有预览 PWA HTML 缓存禁用。
EXIT_CODE=1

=== D6-02 NEGATIVE TEST 3: 工作区存在未提交文件时尝试回滚 ===
$ echo "dirty" > dirty-uncommitted.txt && bash scripts/rollback-preview.sh --target 6e6a381b46fe15e087b7dafec4481a9965657468 --apply
[FATAL] Git 工作区不干净！检测到未提交或未追踪的文件变更，禁止无提示覆盖：
?? dirty-uncommitted.txt
EXIT_CODE=1

=== D6-02 POSITIVE TEST 4: 干净工作区回滚至白名单版本 6e6a381b46fe15e087b7dafec4481a9965657468 ===
$ bash scripts/rollback-preview.sh --target 6e6a381b46fe15e087b7dafec4481a9965657468 --apply
[Quality Gate] 回滚提交 76ab3dae3809 已生成，正在执行强制质量门禁验证...
  -> [1/4] TypeScript 类型检查 (tsc --noEmit)...
  -> [2/4] Vitest 全量安全与领域测试 (vitest run)... (28 passed, 265 tests passed)
  -> [3/4] 专项验证回滚后 /api/* 仍然 Fail-Closed 503 (cloudflarePagesAdapter.test.ts)... (7 passed)
  -> [4/4] Vite 生产构建与零密钥扫描 (vite build)... (built in 293ms)
[PASS] 回滚提交 a83e3b7437e7e2240f8e24af4793c4c108e2cea9 已通过全部质量门禁（TypeScript + Vitest + Vite Build + /api/* Fail-Closed 503）！
EXIT_CODE=0
```

---

## 三、D6-03｜关闭私有预览的 PWA 缓存隐患

### 1. Service Worker (`public/sw.js`) 加固实现
将 [`public/sw.js`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/public/sw.js) 升级为 `sunny-island-preview-no-html-cache-v3`：
- 设置 `PRECACHE_DISABLED_IN_PRIVATE_PREVIEW = true` 与 `APP_SHELL_RESOURCES = []`，在 `install` 与 `activate` 阶段调用 `purgeAllCaches()` 清空任何历史缓存（如 `v1`、`v2`）。
- 针对所有页面导航与 HTML 请求（`request.mode === 'navigate'`、`request.destination === 'document'`、`/`、`/index.html`），强制使用 `fetch(event.request, { cache: 'no-store' })`，**绝不将 HTML 写入 CacheStorage**。
- 当网络响应为 Cloudflare Access 登录重定向（`302`、`401`、`403`、`opaqueredirect` 或包含 `/cdn-cgi/access/login`）时，立即调用 `purgeAllCaches()` 清空本地缓存。
- 当浏览器离线或网络中断导致导航请求失败时，清空缓存并返回 `HTTP 503` 重新授权门禁页（携带响应头 `X-A-Land-SW-Gate: PRIVATE_PREVIEW_REAUTH_REQUIRED`、`Cache-Control: no-store` 与 `data-testid="sw-offline-reauth-required"`），严禁从本地缓存恢复完整儿童应用界面。

### 2. 自动化测试验证（Vitest 单测 + Playwright E2E + 公网实测）
1. **Vitest 单元测试（[`tests/domain/cloudflarePagesAdapter.test.ts`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/tests/domain/cloudflarePagesAdapter.test.ts)）**：
   - 模拟 `已认证访问 -> 页面加载 (验证 cache.put 从未调用) -> Access 会话失效 (302 重定向触发缓存清除) -> 浏览器离线 -> 重新进入`，断言返回 `HTTP 503` 与 `X-A-Land-SW-Gate: PRIVATE_PREVIEW_REAUTH_REQUIRED`，不包含已授权应用 HTML。
2. **Playwright 真实浏览器 E2E 测试（[`tests/e2e/dual-tab-lifecycle.spec.ts`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/tests/e2e/dual-tab-lifecycle.spec.ts)）**：
   - 执行 `npx playwright test tests/e2e/dual-tab-lifecycle.spec.ts --project="Desktop-1440"`（`3 passed (5.1s)`）：
   - 完整跑通：`已认证访问 / -> Service Worker 注册并接管 controller -> 验证 CacheStorage 中无 / 或 /index.html 缓存 -> context.clearCookies() 模拟会话失效 + context.setOffline(true) 模拟离线 -> page.reload() 重新进入 -> 返回 HTTP 503 需重新验证访问权限提示，页面上不存在“去呼吸”等应用按钮`。
3. **公网已授权浏览器实测**：
   - 访问 `https://24d313e9.qingyu-island-preview.pages.dev/` 后检查 `navigator.serviceWorker.getRegistration()` 与 `caches.keys()`，确认活跃 SW 为 `https://24d313e9.qingyu-island-preview.pages.dev/sw.js` 且 `cacheKeys: []`。

---

## 四、D6-04｜强制质量门禁、独立 CI 与动态部署溯源

### 1. 分支防意外推送保护与独立 GitHub Actions CI
- **本地 Git `pre-push` 强制钩子（[`scripts/install-git-hooks.sh`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/scripts/install-git-hooks.sh)）**：
  - 自动安装至 `/home/voga/A-LAND/.git/hooks/pre-push`。
  - 实测拦截向 `main` 与 `public-hold` 的推送（Exit Code `1`），拦截任何非快进 `--force` 推送，并在推送到 `preview` 前核验目标 Commit Tree 的安全契约文件。
- **GitHub 独立 CI 工作流（[`.github/workflows/ci-quality-gate.yml`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/.github/workflows/ci-quality-gate.yml)）**：
  - 在 GitHub Actions 云端独立运行：`node scripts/generate-version-json.mjs`、`tsc --noEmit`、`vitest run`、`vitest run tests/domain/cloudflarePagesAdapter.test.ts src/tests/contentAuditRegistry.test.ts src/tests/adultPreviewSessionLeak.test.tsx`、`vite build` 及产物零密钥扫描。
  - **GitHub Actions 实测记录**：Workflow `A-LAND Gate D6 Security & Quality CI #1`（针对提交 `04a18efe5ed996c3969ff4b584883a1116bc80a7`）已执行完毕，状态：`completed successfully`（耗时 `34s`）。

### 2. Cloudflare Pages 真实 Build Command 与构建日志核验
- 修改 [`package.json`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/package.json) 中的 `"build"` 脚本为：
  ```json
  "build": "node scripts/generate-version-json.mjs && tsc --noEmit && vitest run && vite build"
  ```
- **Cloudflare Pages 构建容器真实日志核验（Deployment ID: `24d313e9-d67b-4396-99c3-057965a410dc`）**：
  ```text
  2026-10-14T14:37:59.73187Z HEAD is now at 04a18ef chore(deploy): register verified Gate D6 commit 6e6a381 in rollback whitelist
  2026-10-14T14:38:23.615461Z Executing user command: npm run build
  2026-10-14T14:38:24.033235Z > react-example@0.0.0 build
  2026-10-14T14:38:24.033343Z > node scripts/generate-version-json.mjs && tsc --noEmit && vitest run && vite build
  2026-10-14T14:38:24.097263Z [generate-version-json] Updated public/version.json -> commitSha=04a18efe5ed9 branch=preview audit=FAIL_CLOSED_PENDING_AUDIT (16 PENDING_REVIEW)
  2026-10-14T14:38:26.116145Z  RUN  v5.0.4 /opt/buildhome/repo
  ...
  2026-10-14T14:38:31.102871Z  Test Files  28 passed (28)
  2026-10-14T14:38:31.103366Z       Tests  265 passed (265)
  2026-10-14T14:38:31.698729Z vite v8.3.4 building client environment for production...
  2026-10-14T14:38:32.116074Z ✓ 1728 modules transformed.
  2026-10-14T14:38:32.419117Z dist/index.html                   1.81 kB │ gzip:   0.83 kB
  2026-10-14T14:38:32.419446Z dist/assets/index-CySOieYD.css  154.05 kB │ gzip:  19.26 kB
  2026-10-14T14:38:32.419595Z dist/assets/index-BuM9Rk6z.js   940.02 kB │ gzip: 257.37 kB
  2026-10-14T14:38:33.321854Z Found Functions directory at /functions. Uploading.
  2026-10-14T14:38:34.299492Z Found _routes.json in output directory. Uploading.
  2026-10-14T14:38:45.780203Z Success: Your site was deployed!
  ```

### 3. 动态版本溯源元数据（`/version.json`）实测结果
通过 [`scripts/generate-version-json.mjs`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/scripts/generate-version-json.mjs) 在每次构建时读取 `CF_PAGES_COMMIT_SHA` / `git rev-parse HEAD` 与 `ContentAuditRegistry.ts` 实时状态生成 [`public/version.json`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/public/version.json)。公网已部署 `/version.json` 实测返回：
- `commitSha`: `"04a18efe5ed996c3969ff4b584883a1116bc80a7"`
- `deploymentTimestamp`: `"2026-10-14T14:38:24.093Z"`
- `buildStatus`: `"VERIFIED_QUALITY_GATE_PASSED"`
- `contentAuditGate`: `"FAIL_CLOSED_PENDING_AUDIT"`（`pendingReviewCount: 16`, `passedCount: 0`）
- `rollbackPolicy`: `"WHITELIST_ONLY_F8C74019_REVOKED"`
- `rollbackTargetSha`: `"6e6a381b46fe15e087b7dafec4481a9965657468"`

---

## 五、D6-05｜全部预览域名及 Cloudflare Access 访问保护核验

### 1. Cloudflare Dashboard Access 应用配置核实
- **Access Application ID**：`39f088b0-9197-4921-93af-8ccbae7651ee`
- **应用名称**：`qingyu-island-preview - Cloudflare Pages`
- **保护域名范围（Wildcard 子域全覆盖）**：`*.qingyu-island-preview.pages.dev`
- **访问策略（Policy ID: `c021431d-df5e-4133-8074-5c92ab7f7549`）**：
  - `decision`: `"allow"`（默认拒绝一切未匹配请求）
  - `include`: 仅限白名单邮箱 `megakii789@gmail.com`
  - `session_duration`: `"24h"`

### 2. 全域名、静态资源、API 路径、无痕访问与已授权访问实测矩阵

| 验证维度 | 实测目标 URL / 操作 | 测试环境 | 实测结果 | 判定 |
| :--- | :--- | :--- | :--- | :---: |
| **固定 `preview` 分支别名** | `GET https://preview.qingyu-island-preview.pages.dev/` | 无痕未登录 | `HTTP 302` 重定向至 `cloudflareaccess.com/cdn-cgi/access/login/...` | **PASS** |
| **当前 Gate D6 哈希部署域名** | `GET https://24d313e9.qingyu-island-preview.pages.dev/` | 无痕未登录 | `HTTP 302` 重定向至 `cloudflareaccess.com/cdn-cgi/access/login/...` | **PASS** |
| **历史 Gate D5 哈希部署域名** | `GET https://bff16fbd.qingyu-island-preview.pages.dev/` | 无痕未登录 | `HTTP 302` 重定向至 `cloudflareaccess.com/cdn-cgi/access/login/...` | **PASS** |
| **历史 Gate D4 哈希部署域名** | `GET https://273e1104.qingyu-island-preview.pages.dev/` | 无痕未登录 | `HTTP 302` 重定向至 `cloudflareaccess.com/cdn-cgi/access/login/...` | **PASS** |
| **历史 Gate D1 哈希部署域名** | `GET https://810087d9.qingyu-island-preview.pages.dev/` | 无痕未登录 | `HTTP 302` 重定向至 `cloudflareaccess.com/cdn-cgi/access/login/...` | **PASS** |
| **受保护静态资源（JS/CSS/SW/Meta）** | `GET /assets/index-BuM9Rk6z.js`、`/assets/index-CySOieYD.css`、`/sw.js`、`/version.json` | 无痕未登录 | 全部返回 `HTTP 302` 重定向至 Cloudflare Access 登录页，零静态源码泄露 | **PASS** |
| **预览 API 路径（GET & POST）** | `GET/POST /api/health`、`GET/POST /api/caregiver/sync`、`POST /api/help/relay` | 无痕未登录 | 全部返回 `HTTP 302` 重定向至 Cloudflare Access 登录页 | **PASS** |
| **非白名单邮箱访问拦截** | 在 Access 登录页输入 `unauthorized-auditor@example.com` 并提交 | 无痕浏览器 | 阻断于 `cloudflareaccess.com/cdn-cgi/access/verify-code/...`，未下发任何授权 Cookie，未泄露任何应用内容（`appLeaked=false`） | **PASS** |
| **生产根域安全占位** | `GET https://qingyu-island-preview.pages.dev/` | 无痕浏览器 | 返回 `public-hold` 静态安全占位页（含 `ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED`），不含任何儿童业务前端（`hasChildApp=false`） | **PASS** |
| **已授权浏览器完整应用验证** | 访问 `https://preview.qingyu-island-preview.pages.dev/` 与 `https://24d313e9.qingyu-island-preview.pages.dev/` | 已授权浏览器 (`megakii789@gmail.com`) | 完整加载《晴雨小岛 · 6岁儿童思考方法成长空间》，核心按钮（“去呼吸”、“去拆解”、“找大人抱抱”）可见可用，未审内容 Fail-Closed 门禁与离线求助诚实提示正常工作 | **PASS** |

> **凭证零泄露审计声明**：本报告、构建产物及 Git 仓库提交均已经过正则扫描核验，**未写入任何 Cookie、Cloudflare Access Token（`CF_Authorization`）或邮箱一次性验证码（OTP）**。

---

## 六、遗留风险与未决事项（Unresolved Risks & Release Blockers）

尽管公网受控工程预览环境的部署安全封印（Gate D6）已全部闭环通过，以下非部署层面的产品级上线阻断项仍按最高原则保持锁定，**严禁将当前工程预览当作正式儿童生产发布**：

1. **儿童内容临床与发展心理学专家独立签署尚未完成（`ContentAuditGate: FAIL_CLOSED_PENDING_AUDIT`）**：
   - `ContentAuditRegistry.ts` 中的全部 16 项受控儿童认知内容仍处于 `auditStatus: 'PENDING'`，在获得真实外部持证专家独立审核签署前，儿童正式模式下默认拦截。
2. **跨设备远程求助通道尚未开通（`RemoteHelpRelayStatus: FAIL_CLOSED_503`）**：
   - `/api/*` 云端同步与求助转发接口均处于强制 `HTTP 503` Fail-Closed 状态，应用仅限在照顾者同设备现场陪同的受控预览环境中使用。

---

`PASS_PRIVATE_ENGINEERING_PREVIEW`
