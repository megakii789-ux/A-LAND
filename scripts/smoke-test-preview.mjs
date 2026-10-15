#!/usr/bin/env node
/**
 * A-LAND｜Gate D4 / Gate D5 / Gate D6 预览站点全链路 HTTP 与安全门禁 Smoke Test 脚本
 *
 * D6-01 核心加固：
 *   1. 禁止仅靠 --expect-access-gate 提前返回冒充完整 Smoke Test 通过。
 *   2. 针对公网 Cloudflare Access 保护域名，同时验证：
 *      - 未认证 (Unauthenticated) GET 与 POST 请求 -> 必须被 Cloudflare Access 拦截 (HTTP 302/403)
 *      - 已认证 (Authenticated) GET 与 POST 请求 -> 完整验证 /, /version.json, GET/POST /api/health, GET/POST /api/* (HTTP 503 JSON + mode='local-only-verified')
 *   3. 支持 --cdp-authenticated 通过本机已登录 Chrome CDP 会话在浏览器沙箱内执行已认证请求，
 *      全程不提取、不打印、不落盘任何 Cookie、Access Token 或验证码。
 *
 * 用法:
 *   node scripts/smoke-test-preview.mjs --url https://preview.qingyu-island-preview.pages.dev --cdp-authenticated
 *   node scripts/smoke-test-preview.mjs --url http://127.0.0.1:3000
 */

import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const args = process.argv.slice(2);

let baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:3000';
let expectAccessRedirect = false;
let useCdpAuthenticated = false;
let onlyAccessGate = false;
const cfAccessClientId = process.env.CF_ACCESS_CLIENT_ID || '';
const cfAccessClientSecret = process.env.CF_ACCESS_CLIENT_SECRET || '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--url' && args[i + 1]) {
    baseUrl = args[++i].replace(/\/+$/, '');
  } else if (args[i] === '--expect-access-gate') {
    expectAccessRedirect = true;
  } else if (args[i] === '--cdp-authenticated') {
    useCdpAuthenticated = true;
    expectAccessRedirect = true;
  } else if (args[i] === '--only-access-gate') {
    expectAccessRedirect = true;
    onlyAccessGate = true;
  }
}

function buildAuthHeaders(extra = {}) {
  const headers = {
    Accept: 'application/json, text/html;q=0.9',
    ...extra,
  };
  if (cfAccessClientId && cfAccessClientSecret) {
    headers['CF-Access-Client-Id'] = cfAccessClientId;
    headers['CF-Access-Client-Secret'] = cfAccessClientSecret;
  }
  return headers;
}

async function assertCondition(condition, message) {
  if (!condition) {
    throw new Error(`[SMOKE_TEST_FAILED] ${message}`);
  }
  console.log(`  [PASS] ${message}`);
}

/**
 * Creates an authenticated HTTP requester:
 * - If --cdp-authenticated is enabled, executes fetch() inside the local authorized Chrome page context
 *   via CDP (zero cookies or tokens ever leave the browser process).
 * - Otherwise uses Node fetch() with optional CF-Access-Client-Id/Secret headers.
 */
async function createAuthenticatedRequester(targetBaseUrl) {
  if (!useCdpAuthenticated) {
    return {
      async request(path, options = {}) {
        const method = options.method || 'GET';
        const headers = buildAuthHeaders(
          method === 'POST' ? { 'Content-Type': 'application/json' } : {},
        );
        const res = await fetch(`${targetBaseUrl}${path}`, {
          method,
          headers,
          body: options.body ? JSON.stringify(options.body) : undefined,
          redirect: 'manual',
        });
        const text = await res.text();
        return {
          status: res.status,
          contentType: res.headers.get('content-type') || '',
          releaseGateHeader: res.headers.get('x-release-gate-status') || '',
          cacheControl: res.headers.get('cache-control') || '',
          bodyText: text,
        };
      },
      async close() {},
    };
  }

  let playwrightPkg;
  try {
    playwrightPkg = require('/tmp/qingyu_deps/node_modules/playwright');
  } catch {
    playwrightPkg = require('playwright');
  }
  const activePortFile = '/home/voga/.config/google-chrome/DevToolsActivePort';
  const [port, wsPath] = fs.readFileSync(activePortFile, 'utf8').trim().split('\n');
  const browser = await playwrightPkg.chromium.connectOverCDP(`ws://127.0.0.1:${port}${wsPath}`);
  const context = browser.contexts()[0];
  const page = await context.newPage();

  // Navigate to the target base URL so same-origin authenticated fetch() runs in its security context
  await page.goto(`${targetBaseUrl}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });

  return {
    async request(path, options = {}) {
      const method = options.method || 'GET';
      const bodyStr = options.body ? JSON.stringify(options.body) : null;
      return await page.evaluate(
        async ({ reqPath, reqMethod, reqBody }) => {
          const res = await fetch(reqPath, {
            method: reqMethod,
            headers: reqMethod === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
            body: reqBody || undefined,
            cache: 'no-store',
          });
          const text = await res.text();
          return {
            status: res.status,
            contentType: res.headers.get('content-type') || '',
            releaseGateHeader: res.headers.get('x-release-gate-status') || '',
            cacheControl: res.headers.get('cache-control') || '',
            bodyText: text,
          };
        },
        { reqPath: path, reqMethod: method, reqBody: bodyStr },
      );
    },
    async close() {
      await page.close().catch(() => {});
      await browser.close().catch(() => {});
    },
  };
}

async function runSmokeTests() {
  console.log('==================================================================');
  console.log(' A-LAND Gate D6 Full HTTP & Security Contract Smoke Test Suite');
  console.log(` Target URL        : ${baseUrl}`);
  console.log(` Access Gate Check : ${expectAccessRedirect}`);
  console.log(` Auth Mode         : ${useCdpAuthenticated ? 'CDP Authorized Browser Session' : cfAccessClientId ? 'CF Service Token' : 'Direct HTTP'}`);
  console.log('==================================================================');

  // 1. 未认证请求验证（GET 与 POST 均必须被 Cloudflare Access 拦截）
  if (expectAccessRedirect) {
    console.log('\n[Phase 1] 验证未认证 (Unauthenticated) GET 与 POST 请求被 Cloudflare Access 拦截...');
    const unauthTargets = [
      { path: '/', method: 'GET' },
      { path: '/version.json', method: 'GET' },
      { path: '/api/health', method: 'GET' },
      { path: '/api/health', method: 'POST' },
      { path: '/api/caregiver/sync', method: 'GET' },
      { path: '/api/caregiver/sync', method: 'POST' },
      { path: '/api/help/relay', method: 'POST' },
    ];

    for (const item of unauthTargets) {
      const res = await fetch(`${baseUrl}${item.path}`, {
        method: item.method,
        headers: item.method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
        body: item.method === 'POST' ? JSON.stringify({ probe: 'unauth' }) : undefined,
        redirect: 'manual',
      });
      const location = res.headers.get('location') || '';
      const sanitizedLocation = location ? location.split('?')[0] : '';
      const ct = res.headers.get('content-type') || '';
      console.log(
        `  [UNAUTH ${item.method} ${item.path}] status=${res.status} content-type="${ct}" redirect="${sanitizedLocation}"`,
      );
      await assertCondition(
        res.status === 302 || res.status === 403,
        `未认证 ${item.method} ${item.path} 返回 HTTP ${res.status} (预期 302/403 拦截)`,
      );
      if (res.status === 302) {
        await assertCondition(
          sanitizedLocation.includes('/cdn-cgi/access/login') ||
            sanitizedLocation.includes('cloudflareaccess.com'),
          `未认证 ${item.method} ${item.path} 重定向至 Cloudflare Access 登录页: ${sanitizedLocation}`,
        );
      }
    }

    if (onlyAccessGate) {
      console.log('\n[ONLY-ACCESS-GATE] 仅执行未认证门禁检查完毕。');
      return;
    }
  }

  // 2. 已认证全链路验证（禁止提前返回！）
  const authClient = await createAuthenticatedRequester(baseUrl);
  try {
    console.log('\n[Phase 2 - 1/5] 验证已认证 GET / 首页 HTML 与 ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED 标识...');
    const homeRes = await authClient.request('/', { method: 'GET' });
    console.log(
      `  [AUTH GET /] status=${homeRes.status} content-type="${homeRes.contentType}" x-release-gate-status="${homeRes.releaseGateHeader}"`,
    );
    await assertCondition(homeRes.status === 200, `已认证 GET / 返回 HTTP 200 (实际: ${homeRes.status})`);
    await assertCondition(
      homeRes.contentType.includes('text/html'),
      `已认证 GET / Content-Type 包含 text/html (${homeRes.contentType})`,
    );
    await assertCondition(
      homeRes.bodyText.includes('ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED'),
      '首页包含 ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED 元数据标识',
    );
    await assertCondition(
      !homeRes.bodyText.includes('AIzaSy') && !homeRes.bodyText.includes('GEMINI_API_KEY='),
      '首页 HTML 不包含任何明文 API 密钥',
    );

    console.log('\n[Phase 2 - 2/5] 验证已认证 GET /version.json 动态构建溯源与审核门禁元数据...');
    const versionRes = await authClient.request('/version.json', { method: 'GET' });
    console.log(
      `  [AUTH GET /version.json] status=${versionRes.status} content-type="${versionRes.contentType}"`,
    );
    await assertCondition(versionRes.status === 200, `已认证 GET /version.json 返回 HTTP 200`);
    const versionJson = JSON.parse(versionRes.bodyText);
    console.log(
      `  [VERSION META] metadataKind=${versionJson.metadataKind} commitSha=${versionJson.commitSha} source=${versionJson.commitIdentitySource} deploymentTimestamp=${versionJson.deploymentTimestamp} buildStatus=${versionJson.buildStatus} contentAuditGate=${versionJson.contentAuditGate}`,
    );
    await assertCondition(
      versionJson.metadataKind === 'RUNTIME_DEPLOYMENT_METADATA',
      `/version.json metadataKind === 'RUNTIME_DEPLOYMENT_METADATA' (实际部署运行态元数据)`,
    );
    await assertCondition(
      versionJson.buildStatus === 'VERIFIED_QUALITY_GATE_PASSED',
      `/version.json buildStatus === 'VERIFIED_QUALITY_GATE_PASSED'`,
    );
    await assertCondition(
      versionJson.contentAuditSummary?.evaluationMethod === 'RUNTIME_REGISTRY_EXECUTION',
      `/version.json contentAuditSummary.evaluationMethod === 'RUNTIME_REGISTRY_EXECUTION' (来自真实运行逻辑)`,
    );
    await assertCondition(
      versionJson.releaseApprovalStatus === 'ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED',
      `/version.json releaseApprovalStatus === 'ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED'`,
    );
    await assertCondition(
      versionJson.contentAuditGate === 'FAIL_CLOSED_PENDING_AUDIT',
      `/version.json contentAuditGate === 'FAIL_CLOSED_PENDING_AUDIT'`,
    );
    await assertCondition(
      versionJson.remoteHelpRelayStatus === 'FAIL_CLOSED_503',
      `/version.json remoteHelpRelayStatus === 'FAIL_CLOSED_503'`,
    );
    await assertCondition(
      typeof versionJson.commitSha === 'string' && /^[0-9a-f]{40}$/i.test(versionJson.commitSha),
      `/version.json 包含真实 40 位 commitSha (${versionJson.commitSha})`,
    );
    await assertCondition(
      versionJson.rollbackTargetSha !== 'f8c7401907b3fe5831c343b995b777254fdfe45d',
      `/version.json 已取消不安全历史版本 f8c74019 作为回滚目标 (当前: ${versionJson.rollbackTargetSha})`,
    );

    console.log('\n[Phase 2 - 3/5] 验证已认证 GET /api/health (200) 与 POST /api/health (405)...');
    const healthGet = await authClient.request('/api/health', { method: 'GET' });
    console.log(
      `  [AUTH GET /api/health] status=${healthGet.status} content-type="${healthGet.contentType}" body=${healthGet.bodyText}`,
    );
    await assertCondition(healthGet.status === 200, `已认证 GET /api/health 返回 HTTP 200`);
    await assertCondition(
      healthGet.contentType.includes('application/json'),
      `GET /api/health Content-Type 为 application/json (${healthGet.contentType})`,
    );
    const healthJson = JSON.parse(healthGet.bodyText);
    await assertCondition(
      healthJson.status === 'ok' && healthJson.mode === 'local-only-verified',
      `GET /api/health status='ok' 且 mode='local-only-verified'`,
    );
    await assertCondition(
      healthJson.remoteRelayEnabled === false && healthJson.cloudSyncEnabled === false,
      `GET /api/health remoteRelayEnabled=false 且 cloudSyncEnabled=false`,
    );
    await assertCondition(
      healthJson.releaseApprovalStatus === 'ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED',
      `GET /api/health releaseApprovalStatus === 'ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED'`,
    );

    const healthPost = await authClient.request('/api/health', {
      method: 'POST',
      body: { ping: true },
    });
    console.log(
      `  [AUTH POST /api/health] status=${healthPost.status} content-type="${healthPost.contentType}" body=${healthPost.bodyText}`,
    );
    await assertCondition(
      healthPost.status === 405,
      `已认证 POST /api/health 返回 HTTP 405 (实际: ${healthPost.status})`,
    );
    await assertCondition(
      healthPost.contentType.includes('application/json'),
      `POST /api/health Content-Type 为 application/json (${healthPost.contentType})`,
    );
    const healthPostJson = JSON.parse(healthPost.bodyText);
    await assertCondition(
      healthPostJson.code === 'METHOD_NOT_ALLOWED',
      `POST /api/health code === 'METHOD_NOT_ALLOWED'`,
    );

    console.log(
      '\n[Phase 2 - 4/5] 验证已认证 GET 与 POST /api/* 业务接口统一 Fail-Closed 503 JSON 契约 (含 mode 字段)...',
    );
    const failClosedEndpoints = [
      '/api/caregiver/sync',
      '/api/help/relay',
      '/api/unknown-cloud-endpoint',
    ];
    for (const endpoint of failClosedEndpoints) {
      for (const method of ['GET', 'POST']) {
        const apiRes = await authClient.request(endpoint, {
          method,
          body: method === 'POST' ? { test: 'fail-closed-probe' } : undefined,
        });
        console.log(
          `  [AUTH ${method} ${endpoint}] status=${apiRes.status} content-type="${apiRes.contentType}" body=${apiRes.bodyText}`,
        );
        await assertCondition(
          apiRes.status === 503,
          `已认证 ${method} ${endpoint} 返回 HTTP 503 (实际: ${apiRes.status})`,
        );
        await assertCondition(
          apiRes.contentType.includes('application/json'),
          `已认证 ${method} ${endpoint} 返回 JSON Content-Type (${apiRes.contentType})`,
        );
        await assertCondition(
          !apiRes.bodyText.trim().toLowerCase().startsWith('<!doctype html'),
          `已认证 ${method} ${endpoint} 未被 SPA fallback 误响应为首页 HTML`,
        );
        const parsed = JSON.parse(apiRes.bodyText);
        await assertCondition(
          parsed.success === false &&
            parsed.code === 'API_DISABLED_PENDING_VERIFIED_AUTH' &&
            parsed.error === 'CLOUD_API_DISABLED' &&
            parsed.mode === 'local-only-verified' &&
            parsed.releaseApprovalStatus === 'ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED' &&
            parsed.remoteRelayEnabled === false &&
            parsed.cloudSyncEnabled === false &&
            parsed.data === null,
          `已认证 ${method} ${endpoint} 完整符合统一 503 JSON 契约 (mode='${parsed.mode}', code='${parsed.code}', releaseApprovalStatus='${parsed.releaseApprovalStatus}')`,
        );
      }
    }

    console.log('\n[Phase 2 - 5/5] 验证敏感路径防泄露 (/.env, /.env.local, /server.ts)...');
    for (const forbiddenPath of ['/.env', '/.env.local', '/server.ts']) {
      const fRes = await authClient.request(forbiddenPath, { method: 'GET' });
      await assertCondition(
        !fRes.bodyText.includes('GEMINI_API_KEY=') &&
          !fRes.bodyText.includes('createApiApp()'),
        `GET ${forbiddenPath} 未泄露环境变量或后端源码 (HTTP ${fRes.status})`,
      );
    }
  } finally {
    await authClient.close();
  }

  console.log('\n==================================================================');
  console.log(' [ALL SMOKE TESTS PASSED] 未认证拦截 + 已认证 GET/POST 503 统一契约全部通过！');
  console.log(' EXIT_CODE=0');
  console.log('==================================================================');
}

runSmokeTests().catch((err) => {
  console.error('\n[FATAL]', err.message || err);
  process.exit(1);
});
