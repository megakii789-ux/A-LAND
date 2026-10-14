#!/usr/bin/env node
/**
 * A-LAND｜Gate D4 / Gate D5 预览站点 HTTP 与安全门禁 Smoke Test 脚本
 *
 * 用法:
 *   node scripts/smoke-test-preview.mjs --url https://preview.qingyu-island-preview.pages.dev
 *   node scripts/smoke-test-preview.mjs --url http://127.0.0.1:3000 --expect-authenticated
 */

const args = process.argv.slice(2);
let baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:3000';
let expectAccessRedirect = false;
let cfAccessClientId = process.env.CF_ACCESS_CLIENT_ID || '';
let cfAccessClientSecret = process.env.CF_ACCESS_CLIENT_SECRET || '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--url' && args[i + 1]) {
    baseUrl = args[++i].replace(/\/+$/, '');
  } else if (args[i] === '--expect-access-gate') {
    expectAccessRedirect = true;
  }
}

function buildHeaders() {
  const headers = { Accept: 'application/json, text/html;q=0.9' };
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

async function runSmokeTests() {
  console.log('==================================================================');
  console.log(` A-LAND Gate D4/D5 Smoke Test Suite`);
  console.log(` Target URL: ${baseUrl}`);
  console.log('==================================================================');

  // 1. Cloudflare Access 门禁验证（当指定 --expect-access-gate 且未携带凭证时）
  if (expectAccessRedirect) {
    console.log('\n[1] 验证未授权访问被 Cloudflare Access 拦截...');
    const res = await fetch(`${baseUrl}/`, { redirect: 'manual' });
    const location = res.headers.get('location') || '';
    await assertCondition(
      res.status === 302 || res.status === 403,
      `未登录请求返回 HTTP ${res.status} (预期 302/403 拦截)`,
    );
    if (res.status === 302) {
      await assertCondition(
        location.includes('/cdn-cgi/access/login') || location.includes('cloudflareaccess.com'),
        `重定向目标指向 Cloudflare Access 登录页: ${location}`,
      );
    }
    return;
  }

  // 2. 首页与 ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED 标识核验
  console.log('\n[1/5] 验证首页 HTML 与 ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED 标识...');
  const homeRes = await fetch(`${baseUrl}/`, { headers: buildHeaders() });
  await assertCondition(homeRes.status === 200, `GET / 返回 HTTP 200 (实际: ${homeRes.status})`);
  const homeHtml = await homeRes.text();
  await assertCondition(
    homeHtml.includes('ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED'),
    '首页包含 ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED 元数据标识',
  );
  await assertCondition(
    !homeHtml.includes('AIzaSy') && !homeHtml.includes('GEMINI_API_KEY='),
    '首页 HTML 不包含任何明文 API 密钥',
  );

  // 3. /version.json 构建元数据核验
  console.log('\n[2/5] 验证 /version.json 构建溯源与门禁状态...');
  const versionRes = await fetch(`${baseUrl}/version.json`, { headers: buildHeaders() });
  await assertCondition(versionRes.status === 200, `GET /version.json 返回 HTTP 200`);
  const versionJson = await versionRes.json();
  await assertCondition(
    versionJson.releaseApprovalStatus === 'ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED',
    `/version.json releaseApprovalStatus === ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED`,
  );
  await assertCondition(
    versionJson.contentAuditGate === 'FAIL_CLOSED_PENDING_AUDIT',
    `/version.json contentAuditGate === FAIL_CLOSED_PENDING_AUDIT`,
  );
  await assertCondition(
    versionJson.remoteHelpRelayStatus === 'FAIL_CLOSED_503',
    `/version.json remoteHelpRelayStatus === FAIL_CLOSED_503`,
  );

  // 4. /api/health 本地优先运行模式核验
  console.log('\n[3/5] 验证 /api/health 本地优先模式响应...');
  const healthRes = await fetch(`${baseUrl}/api/health`, { headers: buildHeaders() });
  await assertCondition(healthRes.status === 200, `GET /api/health 返回 HTTP 200`);
  const healthContentType = healthRes.headers.get('content-type') || '';
  await assertCondition(
    healthContentType.includes('application/json'),
    `/api/health Content-Type 为 application/json (${healthContentType})`,
  );
  const healthJson = await healthRes.json();
  await assertCondition(
    healthJson.mode === 'local-only-verified',
    `/api/health mode === 'local-only-verified'`,
  );
  await assertCondition(
    healthJson.remoteRelayEnabled === false && healthJson.cloudSyncEnabled === false,
    `/api/health remoteRelayEnabled=false 且 cloudSyncEnabled=false`,
  );
  await assertCondition(
    healthJson.releaseApprovalStatus === 'ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED',
    `/api/health releaseApprovalStatus === 'ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED'`,
  );

  // 5. /api/* Fail-Closed 503 拦截与禁止 SPA HTML Fallback 核验
  console.log('\n[4/5] 验证 /api/* 未验证云端业务 API Fail-Closed (HTTP 503 JSON, 非 HTML fallback)...');
  for (const endpoint of ['/api/caregiver/sync', '/api/help/relay', '/api/unknown-cloud-endpoint']) {
    const apiRes = await fetch(`${baseUrl}${endpoint}`, { headers: buildHeaders() });
    const contentType = apiRes.headers.get('content-type') || '';
    const bodyText = await apiRes.text();
    await assertCondition(
      apiRes.status === 503,
      `GET ${endpoint} 返回 HTTP 503 (实际: ${apiRes.status})`,
    );
    await assertCondition(
      contentType.includes('application/json'),
      `GET ${endpoint} 返回 JSON Content-Type (${contentType})`,
    );
    await assertCondition(
      !bodyText.trim().toLowerCase().startsWith('<!doctype html'),
      `GET ${endpoint} 未被 SPA fallback 误响应为首页 HTML`,
    );
    const parsed = JSON.parse(bodyText);
    await assertCondition(
      parsed.mode === 'local-only-verified',
      `GET ${endpoint} JSON 明确声明 mode='local-only-verified'`,
    );
  }

  // 6. 敏感路径防泄露核验
  console.log('\n[5/5] 验证敏感文件不暴露 (/.env, /server.ts)...');
  for (const forbiddenPath of ['/.env', '/.env.local']) {
    const fRes = await fetch(`${baseUrl}${forbiddenPath}`, { headers: buildHeaders() });
    const fText = await fRes.text();
    await assertCondition(
      !fText.includes('GEMINI_API_KEY='),
      `GET ${forbiddenPath} 未泄露环境变量内容`,
    );
  }

  console.log('\n==================================================================');
  console.log(' [ALL SMOKE TESTS PASSED] 全部 HTTP、API Fail-Closed 与门禁检查通过！');
  console.log('==================================================================');
}

runSmokeTests().catch((err) => {
  console.error('\n[FATAL]', err.message || err);
  process.exit(1);
});
