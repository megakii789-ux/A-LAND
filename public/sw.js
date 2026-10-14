const CACHE_NAME = 'sunny-island-preview-no-html-cache-v3';
const PRECACHE_DISABLED_IN_PRIVATE_PREVIEW = true;

// D6-03: 在 Cloudflare Access 保护的私有工程预览环境中，严禁离线预缓存 '/' 或 '/index.html'，
// 防止在 Access 会话失效后通过已有离线缓存恢复完整应用页面。
const APP_SHELL_RESOURCES = [];

// 绝对禁止缓存的安全与敏感路由规则（含 Cloudflare Access /cdn-cgi/ 与实时版本元数据）
const FORBIDDEN_CACHE_PATTERNS = [
  /\/api\/family\/.*\/caregiver-notes/, // 家长私密自省笔记
  /\/api\/family\/.*\/caregivers/,      // 家长配置
  /\/api\/research\//,                  // 研究员数据导出
  /\/identitytoolkit/,                  // Google Auth / OAuth 令牌
  /securetoken\.googleapis\.com/,       // Firebase Refresh Token
  /google-analytics/,                   // 追踪类
  /\/api\/parent\//,                    // 家长敏感数据
  /\/cdn-cgi\//,                        // Cloudflare Access 访问控制与认证挑战端点
  /\/version\.json$/,                   // 部署版本与回滚核验元数据
  /^\/$/,                               // 私有预览首页 HTML 严禁离线缓存 (D6-03)
  /\/index\.html$/                      // 私有预览入口 HTML 严禁离线缓存 (D6-03)
];

function purgeAllCaches() {
  return caches.keys().then((keys) =>
    Promise.all(keys.map((key) => caches.delete(key)))
  );
}

function buildOfflineAccessGateResponse() {
  const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-release-gate-status" content="ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED" />
  <title>需重新验证访问权限 · 晴雨小岛工程预览</title>
</head>
<body style="font-family: system-ui, sans-serif; background: #fafaf9; color: #1c1917; padding: 2rem; text-align: center;">
  <main data-testid="sw-offline-reauth-required" style="max-width: 32rem; margin: 4rem auto; background: #ffffff; border: 2px solid #e7e5e4; border-radius: 1.5rem; padding: 2rem;">
    <h1 style="font-size: 1.25rem; margin-bottom: 0.75rem;">🔒 需重新验证访问权限（工程预览已锁定）</h1>
    <p style="font-size: 0.95rem; line-height: 1.6; color: #44403c;">
      PRIVATE_PREVIEW_REAUTH_REQUIRED：当前处于私有工程预览环境（ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED）。
      由于网络连接断开或 Cloudflare Access 会话需重新授权，系统已禁止从本地离线缓存恢复应用页面。
    </p>
    <p style="font-size: 0.85rem; color: #78716c; margin-top: 1rem;">
      请恢复网络连接并完成 Cloudflare Access 身份验证后重新进入。
    </p>
  </main>
</body>
</html>`;

  return new Response(html, {
    status: 503,
    statusText: 'Service Unavailable (Private Preview Re-Auth Required)',
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-Release-Gate-Status': 'ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED',
      'X-A-Land-SW-Gate': 'PRIVATE_PREVIEW_REAUTH_REQUIRED',
      'X-Preview-Offline-Cache': 'DISABLED_BY_GATE_D6'
    }
  });
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    purgeAllCaches().then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    purgeAllCaches().then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (!event.data || typeof event.data !== 'object') return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data.type === 'CLEAR_OLD_CACHES' || event.data.type === 'PURGE_ALL_PREVIEW_CACHES') {
    event.waitUntil(purgeAllCaches());
  }
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // 1. 契约安全拦截：非 GET 请求、敏感 API、Auth 响应与 Cloudflare Access 端点直接走网络
  const isForbidden = FORBIDDEN_CACHE_PATTERNS.some((pattern) =>
    pattern.test(requestUrl.href) || pattern.test(requestUrl.pathname)
  );
  if (event.request.method !== 'GET') {
    return;
  }

  // 2. API 请求直接走网络 (Network Only with Fail-Closed 503 Function)
  if (requestUrl.pathname.startsWith('/api/') || requestUrl.pathname.startsWith('/cdn-cgi/')) {
    return;
  }

  // 3. D6-03: 页面导航与 HTML 请求（/ 或 /index.html）：
  // 强制 Network-Only (cache: 'no-store')，绝对不写入 CacheStorage，绝对不在离线或未授权时回退本地缓存 HTML！
  if (
    event.request.mode === 'navigate' ||
    event.request.destination === 'document' ||
    requestUrl.pathname === '/' ||
    requestUrl.pathname === '/index.html'
  ) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then((networkResponse) => {
          // 若触发 Cloudflare Access 登录重定向或 401/403，立即清空任何本地缓存
          if (
            !networkResponse ||
            networkResponse.type === 'opaqueredirect' ||
            networkResponse.status === 302 ||
            networkResponse.status === 401 ||
            networkResponse.status === 403 ||
            (networkResponse.url &&
              (networkResponse.url.includes('/cdn-cgi/access/login') ||
               networkResponse.url.includes('cloudflareaccess.com')))
          ) {
            purgeAllCaches();
          }
          return networkResponse;
        })
        .catch(() => {
          // 离线或网络阻断时：清空缓存并返回 503 重新授权提示页，严禁返回缓存中的完整应用页面
          return purgeAllCaches().then(() => buildOfflineAccessGateResponse());
        })
    );
    return;
  }

  // 4. 私有预览模式下禁用静态资产离线回退，确保未授权或离线状态下不从旧缓存拼装应用
  if (PRECACHE_DISABLED_IN_PRIVATE_PREVIEW || isForbidden) {
    return;
  }
});
