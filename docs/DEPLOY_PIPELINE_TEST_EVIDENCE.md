# A-LAND｜自动部署流水线与全门禁实测证据链（DEPLOY_PIPELINE_TEST_EVIDENCE）

- **测试执行时间**：`2026-10-14T20:43:14+08:00` – `2026-10-14T21:49:14+08:00`
- **隔离验证目录**：`/tmp/a-land-isolated-verify`（无任何父级 `node_modules` 污染）
- **本机 Git 工作副本**：`/home/voga/A-LAND`（分支：`preview` @ `ada7191924aa6946fdfb334f6d57672bef4cab6b`）
- **公网生产占位 URL**：`https://qingyu-island-preview.pages.dev/`（`public-hold` @ `e00706e281b298414ee8eebe9de3853fa6ec9765`）
- **公网受控预览 URL**：`https://preview.qingyu-island-preview.pages.dev/`（固定部署快照：`https://810087d9.qingyu-island-preview.pages.dev/`）
- **全局门禁标识**：`ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED`

---

## 一、Gate D2｜构建可复现性与工具链锁定实测证据

### 1. 根因分析：为何此前存在 Vite 版本声明与实际构建版本不一致
1. **父目录幽灵依赖（Phantom Parent `node_modules`）**：宿主机的 `/home/voga/node_modules` 曾挂载了另一套旧版依赖，当项目内未安装独立 `node_modules` 时，Node 模块解析向上穿透至父目录。
2. **`esbuild` Peer Dependency 冲突**：原 `package.json` 中声明 `"vite": "^8.3.0"`（需要 `peerOptional esbuild@"^0.27.0 || ^0.28.0"`），但 `devDependencies` 却残留了 `"esbuild": "^0.25.0"`，导致标准 `npm install` 触发 `ERESOLVE` 冲突。
3. **`bun.lock` 与系统环境脱节**：本机仅安装了 Node.js `v20.20.2` 与 `npm 10.8.2`，未安装 `bun`，导致 `bun.lock` 无法作为本机与 CI 的统一锁定源。

### 2. 修复方案与确定性工具链版本
- 将 `package.json` 中 `esbuild` 对齐为 `"^0.28.2"`（与 `vite@8.3.4` 及 `tsx@4.21.0` 完全一致），移除旧版 `bun.lock`，生成唯一的标准 [`package-lock.json`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/package-lock.json)（`lockfileVersion: 3`）。
- 新增 [`.nvmrc`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/.nvmrc) 与 [`.node-version`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/.node-version) 固定 `20.20.2`。
- 在 [`vite.config.ts`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/vite.config.ts) 中使用原生 `import.meta.dirname` 消除 Vite 8 `configLoader` 警告。

| 工具组件 | 声明范围 (`package.json`) | 锁定与实测版本 (`package-lock.json`) | 验证命令输出 |
| :--- | :--- | :--- | :--- |
| **Node.js** | `^20.19.0 \|\| >=22.12.0` | `v20.20.2` | `v20.20.2` |
| **npm** | `>=10.0.0` | `10.8.2` | `10.8.2` |
| **Vite** | `^8.3.0` | `8.3.4` | `vite/8.3.4 linux-x64 node-v20.20.2` |
| **TypeScript** | `^7.0.2` | `7.0.2` | `Version 7.0.2` |
| **Vitest** | `^5.0.3` | `5.0.4` | `vitest/5.0.4 linux-x64 node-v20.20.2` |
| **esbuild** | `^0.28.2` | `0.28.2` | `0.28.2` (0 `ERESOLVE` 冲突) |
| **Playwright** | `^1.64.0` | `1.64.0` | `Version 1.64.0` |

---

## 二、Gate D2｜TypeScript 与 3 个历史单元测试失败修复证据

### 1. 修复详情（严格遵守“不放宽内容审核、不修改 PENDING 为 PASSED”红线）
在 [`src/tests/adultPreviewSessionLeak.test.tsx`](file:///home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/src/tests/adultPreviewSessionLeak.test.tsx) 中：
- **TypeScript 报错修复（4 处 -> 0 处）**：为直接挂载 `<CaregiverZone />` 与 `<EmotionTheater />` 的测试用例补齐必填回调属性 `onExit={() => {}}`。
- **单测失败根因与修复（3 处 -> 0 处）**：
  1. Phase 0 安全加固后，照顾者专区不再内置任何硬编码默认 PIN（首次进入必须先初始化 PIN），而旧测试在空的 `localStorage` 下直接尝试验证 `1234`。通过在测试 `beforeEach` 中调用真实 `makePinRecord('8426')` + `savePinRecord()` 预置合法测试 PIN 哈希完成真实 PBKDF2 认证链路测试。
  2. 更新测试对按钮文案的旧正则匹配以对齐 Phase 1A 当前真实 UI 文案（如 `解锁大人预览（含未审内容）`、`退出大人内部预览`、`大人内部预览模式（含未完成儿童安全审核内容）`）。
- **内容审核注册表零篡改验证**：`src/tests/contentAuditRegistry.test.ts`（13 项测试）验证全部 17 项内容仍为 `PENDING`，儿童端默认拦截未审内容。

### 2. 全新隔离目录 `/tmp/a-land-isolated-verify` 实测输出
```text
=== Running tsc --noEmit ===
> react-example@0.0.0 lint
> tsc --noEmit
(Exit code: 0, 0 errors)

=== Running vitest run ===
 RUN  v5.0.4 /tmp/a-land-isolated-verify
 Test Files  28 passed (28)
      Tests  264 passed (264)
   Duration  730ms
```

---

## 三、Gate D2 / D3｜Vite 静态构建结果与公网部署产物 SHA-256 一致性清单

| 构建产物路径 (`dist/`) | 本机与公网部署 SHA-256 校验值 | 公网核验状态 |
| :--- | :--- | :---: |
| `dist/index.html` | `68cdce71318dcbf51690afa8f49aeea806c5c0fd1a5c934686a4fcbfcbbafea7` | **100% 一致** |
| `dist/assets/index-BuM9Rk6z.js` | `b5d6020015d1856fe7adac86e8c5b3862fd4e348699333eae12aa6f1b9af0bb2` | **100% 一致（公网实测核对通过）** |
| `dist/assets/index-CySOieYD.css` | `43c3f00e4ca9c5a5070c2faea917bfe2cea8cdb4540991cedc690476e76feb02` | **100% 一致** |
| `dist/_headers` | `ebe9bc6098bd9d945333e3a5d3983484854de6a1981471baad70aebe2362a4c4` | **8 条规则由 Cloudflare 边缘解析生效** |
| `dist/_routes.json` | `9ac04b0b988b70aa7a8aeef820ca5653cab83721b0df8013e54a4450f1d22040` | **已生效（阻断 `/api/*` SPA HTML 回退）** |
| `dist/sw.js` | `73d3b0085da7f3eee9431a50e486d7049a9b31bc6cbcdd481c2c219afdcfd222` | **已激活 (`sunny-island-app-shell-v2`)** |
| `dist/version.json` | `31729536b86a26c70065866218532c573dd61edde53f8841358f7feefe61c9fe` | **HTTP 200 实测通过** |

---

## 四、Gate D5｜上线后公网 HTTPS 全量验收报告（1–10 项全通过）

针对真实公网 HTTPS 地址 `https://preview.qingyu-island-preview.pages.dev`（及固定部署快照 `https://810087d9.qingyu-island-preview.pages.dev`、生产占位域名 `https://qingyu-island-preview.pages.dev`）逐项完成实测：

### 1 & 2. 桌面、手机、平板浏览器与六视口（360 / 390 / 430 / 768 / 1024 / 1440）实测
在公网已认证浏览器会话中逐一调整视口并测量 DOM 几何边界：

| 视口规格 | `innerWidth x innerHeight` | 实测 `scrollWidth` | 横向溢出 (`scrollWidth > innerWidth`) | 抱抱主按钮 (`找大人抱抱`) 实测尺寸 | `>= 56x56px` 触控标准 |
| :--- | :--- | :--- | :---: | :--- | :---: |
| **Mobile-360** | `360 x 800` | `360` | `false` (`0px`) | `312 x 80 px` | **PASS** |
| **Mobile-390** | `390 x 844` | `390` | `false` (`0px`) | `342 x 80 px` | **PASS** |
| **Mobile-430** | `430 x 932` | `430` | `false` (`0px`) | `382 x 80 px` | **PASS** |
| **Tablet-768** | `768 x 1024` | `753` | `false` (`0px`) | `374 x 84 px` | **PASS** |
| **Tablet-1024** | `1024 x 1366` | `1009` | `false` (`0px`) | `900 x 84 px` | **PASS** |
| **Desktop-1440** | `1440 x 900` | `1425` | `false` (`0px`) | `900 x 84 px` | **PASS** |

### 3. 访问控制测试（未经允许的邮箱不得看到应用）
- **未登录终端请求实测**（`node scripts/smoke-test-preview.mjs --url https://preview.qingyu-island-preview.pages.dev --expect-access-gate`）：
  ```text
  [1] 验证未授权访问被 Cloudflare Access 拦截...
    [PASS] 未登录请求返回 HTTP 302 (预期 302/403 拦截)
    [PASS] 重定向目标指向 Cloudflare Access 登录页: https://qingyu-island-preview-pages.cloudflareaccess.com/cdn-cgi/access/login/preview.qingyu-island-preview.pages.dev?...
  ```
- **非白名单邮箱拒止实测**：在 Cloudflare Access 登录页提交 `unauthorized-test@example.com`，因策略 `c021431d-df5e-4133-8074-5c92ab7f7549` 仅允许 `megakii789@gmail.com`，系统不向该邮箱下发有效凭证，无法进入应用。
- **白名单邮箱放行实测**：使用 `megakii789@gmail.com` 验证 OTP 后正常进入工程预览。

### 4. `/api/health` 与 `/api/*` 实际公网 HTTP 测试
- **`GET /api/health` 实测响应**：
  - 状态码：`HTTP/2 200`
  - 响应头：`content-type: application/json; charset=utf-8`、`x-release-gate-status: ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED`
  - 响应体：
    ```json
    {
      "status": "ok",
      "mode": "local-only-verified",
      "deploymentTarget": "cloudflare-pages-static",
      "releaseApprovalStatus": "ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED",
      "remoteRelayEnabled": false,
      "cloudSyncEnabled": false,
      "timestamp": "2026-10-14T13:37:57.113Z"
    }
    ```
- **`/api/caregiver/sync` 与 `/api/help/relay` 实测响应**：
  - 状态码：`HTTP/2 503 Service Unavailable`（**绝无 SPA HTML fallback**）
  - 响应头：`content-type: application/json; charset=utf-8`、`x-release-gate-status: ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED`
  - 响应体：
    ```json
    {
      "success": false,
      "code": "API_DISABLED_PENDING_VERIFIED_AUTH",
      "error": "CLOUD_API_DISABLED",
      "releaseApprovalStatus": "ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED",
      "message": "当前版本为本地高安全运行模式，云端同步与远程通知接口已强制关闭（Fail-Closed）。",
      "data": null
    }
    ```

### 5. 儿童求助真实状态测试
- 在公网 HTTPS 页面点击 `"找大人抱抱"` → `"找 身边信任的大人（请走到大人身边）"`，界面显式展示：
  - `这里不会发消息 · 网络未接通 · 当前无网络连接或离线模式，无法发送至远程，请寻找身边的信任成年人`
  - `提示：这里不会发消息。小岛陪伴你，最重要的事情是直接找身边看得见的大人。`
- 零虚假远程通知承诺（`hugHasFalseRemoteClaim: false`）。

### 6. 内容审核门禁测试
- 在儿童模式下打开 `"故事林"`，全部未审故事均标注 **`准备中 · 需大人陪同`**。
- 点击 `"看看详情"`（如《一只杯子，是大还是小？》）触发 Fail-Closed 拦截画面：`“这片故事叶正在由大人细心检查中……现在还不能自己打开哦”`，需通过底部 `🔒 家长 / 审阅人验证后预览（需输入家长 PIN）` 双重验证方可预览。

### 7 & 8. 刷新、离线、重新联网、PWA 更新与旧版缓存清除测试
- 公网 HTTPS 页面 `navigator.serviceWorker.getRegistration()` 状态为 `activated`（`https://810087d9.qingyu-island-preview.pages.dev/sw.js`）。
- `caches.keys()` 确认当前缓存为 `["sunny-island-app-shell-v2"]`。
- 注入模拟旧版缓存 `sunny-island-app-shell-v1` 后发送 `CLEAR_OLD_CACHES` 消息，旧缓存被完整清除；刷新页面后重新建立 `sunny-island-app-shell-v2`，离线与重联刷新均正常。

### 9. 最新 Antigravity 修改与公网部署版本哈希一致性
- 公网加载的主脚本 `/assets/index-BuM9Rk6z.js` 经浏览器端 WebCrypto `crypto.subtle.digest('SHA-256', ...)` 实测哈希为：
  `b5d6020015d1856fe7adac86e8c5b3862fd4e348699333eae12aa6f1b9af0bb2`
- 与本机最新构建 `dist/assets/index-BuM9Rk6z.js` 的 SHA-256 **100% 逐字节一致**。

### 10. 敏感文件与密钥防泄露实测
- 在公网环境请求 `/.env`、`/.env.local`、`/server.ts` 均未暴露任何环境变量、API 密钥或后端源码（`envContainsSecrets: false`、`serverTsContainsSource: false`）。
