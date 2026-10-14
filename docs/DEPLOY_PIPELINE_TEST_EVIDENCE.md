# A-LAND｜自动部署流水线与全门禁实测证据链（DEPLOY_PIPELINE_TEST_EVIDENCE）

- **测试执行时间**：`2026-10-14T20:43:14+08:00` – `2026-10-14T20:45:29+08:00`
- **隔离验证目录**：`/tmp/a-land-isolated-verify`（无任何父级 `node_modules` 污染）
- **本机 Git 工作副本**：`/home/voga/A-LAND`（分支：`preview`）
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
- **内容审核注册表零篡改验证**：`src/tests/contentAuditRegistry.test.ts`（13 项测试）与 `src/tests/phase0SafetyContracts.test.ts` 验证全部 17 项内容仍为 `PENDING`，儿童端默认拦截未审内容。

### 2. 全新隔离目录 `/tmp/a-land-isolated-verify` 实测输出
```text
=== Running tsc --noEmit ===
> react-example@0.0.0 lint
> tsc --noEmit
(Exit code: 0, 0 errors)

=== Running vitest run ===
 RUN  v5.0.4 /tmp/a-land-isolated-verify
 ✓ tests/domain/firestoreRules.test.ts (10 tests)
 ✓ tests/domain/weather.test.ts (6 tests)
 ✓ src/tests/weather.test.ts (4 tests)
 ✓ src/tests/interactive3D.test.ts (5 tests)
 ✓ tests/domain/weeklyReportService.test.ts (4 tests)
 ✓ src/tests/speechSystem.test.ts (27 tests)
 ✓ tests/domain/hugContract.test.ts (4 tests)
 ✓ tests/domain/scaffolding.test.ts (4 tests)
 ✓ tests/domain/cloudflarePagesAdapter.test.ts (6 tests)
 ✓ tests/domain/hug.test.ts (10 tests)
 ✓ tests/domain/caregiver.test.ts (9 tests)
 ✓ tests/domain/safety.test.ts (12 tests)
 ✓ tests/domain/pwaOffline.test.ts (14 tests)
 ✓ tests/domain/interactiveGamesE2E.test.ts (4 tests)
 ✓ tests/domain/interactiveGamesState.test.ts (13 tests)
 ✓ src/tests/contentAuditRegistry.test.ts (13 tests)
 ✓ tests/domain/cognitiveKernel.test.ts (18 tests)
 ✓ tests/domain/research.test.ts (9 tests)
 ✓ tests/domain/transfer.test.ts (17 tests)
 ✓ src/tests/cognitiveEncyclopedia.test.ts (5 tests)
 ✓ src/tests/growthObservationLog.test.ts (2 tests)
 ✓ tests/domain/personalizationEngine.test.ts (17 tests)
 ✓ src/tests/parentingPocketTips.test.ts (6 tests)
 ✓ src/tests/parentMedals.test.ts (5 tests)
 ✓ src/tests/calmSpace.test.ts (7 tests)
 ✓ tests/domain/backendAuthData.test.ts (12 tests)
 ✓ tests/domain/p0SecurityRemediation.test.ts (18 tests)
 ✓ src/tests/adultPreviewSessionLeak.test.tsx (3 tests)

 Test Files  28 passed (28)
      Tests  264 passed (264)
   Duration  730ms
```

---

## 三、Gate D2 / D3｜Vite 静态构建结果与产物 SHA-256 清单

```text
> vite build
vite v8.3.4 building client environment for production...
✓ 1728 modules transformed.
dist/index.html                   1.81 kB │ gzip:   0.83 kB
dist/assets/index-CySOieYD.css  154.05 kB │ gzip:  19.26 kB
dist/assets/index-BuM9Rk6z.js   940.02 kB │ gzip: 257.37 kB
✓ built in 213ms
```

| 构建产物路径 (`dist/`) | SHA-256 校验值 | 用途与安全属性 |
| :--- | :--- | :--- |
| `dist/index.html` | `68cdce71318dcbf51690afa8f49aeea806c5c0fd1a5c934686a4fcbfcbbafea7` | 含 `release-gate-status="ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED"` 与 `noindex` |
| `dist/assets/index-BuM9Rk6z.js` | `b5d6020015d1856fe7adac86e8c5b3862fd4e348699333eae12aa6f1b9af0bb2` | 主应用 Bundle（经扫描确认 0 密钥泄露） |
| `dist/assets/index-CySOieYD.css` | `43c3f00e4ca9c5a5070c2faea917bfe2cea8cdb4540991cedc690476e76feb02` | Tailwind CSS v4 样式表 |
| `dist/_headers` | `ebe9bc6098bd9d945333e3a5d3983484854de6a1981471baad70aebe2362a4c4` | Cloudflare Pages 安全响应头与缓存策略 |
| `dist/_routes.json` | `9ac04b0b988b70aa7a8aeef820ca5653cab83721b0df8013e54a4450f1d22040` | 强制 `/api/*` 路由至 Pages Functions，阻断 SPA HTML 回退 |
| `dist/sw.js` | `73d3b0085da7f3eee9431a50e486d7049a9b31bc6cbcdd481c2c219afdcfd222` | `sunny-island-app-shell-v2` 离线缓存与旧缓存自动清除 |
| `dist/version.json` | `31729536b86a26c70065866218532c573dd61edde53f8841358f7feefe61c9fe` | 部署版本、回滚基线与门禁状态元数据 |

---

## 四、Gate D4 / D5｜HTTP Smoke Test 与 6 视口浏览器验收证据

### 1. `scripts/smoke-test-preview.mjs` 实测输出
```text
[1/5] 验证首页 HTML 与 ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED 标识...
  [PASS] GET / 返回 HTTP 200 (实际: 200)
  [PASS] 首页包含 ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED 元数据标识
  [PASS] 首页 HTML 不包含任何明文 API 密钥

[2/5] 验证 /version.json 构建溯源与门禁状态...
  [PASS] GET /version.json 返回 HTTP 200
  [PASS] /version.json releaseApprovalStatus === ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED
  [PASS] /version.json contentAuditGate === FAIL_CLOSED_PENDING_AUDIT
  [PASS] /version.json remoteHelpRelayStatus === FAIL_CLOSED_503

[3/5] 验证 /api/health 本地优先模式响应...
  [PASS] GET /api/health 返回 HTTP 200
  [PASS] /api/health Content-Type 为 application/json (application/json; charset=utf-8)
  [PASS] /api/health mode === 'local-only-verified'
  [PASS] /api/health remoteRelayEnabled=false 且 cloudSyncEnabled=false
  [PASS] /api/health releaseApprovalStatus === 'ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED'

[4/5] 验证 /api/* 未验证云端业务 API Fail-Closed (HTTP 503 JSON, 非 HTML fallback)...
  [PASS] GET /api/caregiver/sync 返回 HTTP 503 (实际: 503)
  [PASS] GET /api/caregiver/sync 返回 JSON Content-Type (application/json; charset=utf-8)
  [PASS] GET /api/caregiver/sync 未被 SPA fallback 误响应为首页 HTML
  [PASS] GET /api/help/relay 返回 HTTP 503 (实际: 503)
  [PASS] GET /api/unknown-cloud-endpoint 返回 HTTP 503 (实际: 503)

[5/5] 验证敏感文件不暴露 (/.env, /server.ts)...
  [PASS] GET /.env 未泄露环境变量内容
  [PASS] GET /.env.local 未泄露环境变量内容
```

### 2. 六视口（360 / 390 / 430 / 768 / 1024 / 1440）Playwright 浏览器实测结果
在隔离构建环境中执行 `npx playwright test`：
- `Mobile-360` (`360x800`)：触控目标 >= 56px、Reduced Motion 物理 CSS/JS 抑制、零横向溢出 — **PASS**
- `Mobile-390` (`390x844`)：触控目标 >= 56px、Reduced Motion 物理 CSS/JS 抑制、零横向溢出 — **PASS**
- `Mobile-430` (`430x932`)：触控目标 >= 56px、Reduced Motion 物理 CSS/JS 抑制、零横向溢出 — **PASS**
- `Tablet-768` (`768x1024`)：触控目标 >= 56px、Reduced Motion 物理 CSS/JS 抑制、零横向溢出 — **PASS**
- `Tablet-1024` (`1024x1366`)：触控目标 >= 56px、Reduced Motion 物理 CSS/JS 抑制、零横向溢出 — **PASS**
- `Desktop-1440` (`1440x900`)：触控目标 >= 56px、Reduced Motion 物理 CSS/JS 抑制、零横向溢出 — **PASS**
- **总计**：`18 passed (6.7s)`。
