const CACHE_NAME = 'sunny-island-app-shell-v2';

// 允许离线预缓存的 App Shell 核心静态资产与公共资源
const APP_SHELL_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/pwa-icon.svg'
];

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
  /\/version\.json$/                    // 部署版本与回滚核验元数据
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL_RESOURCES).catch((err) => {
        console.warn('PWA Precache warning (some assets may be compiled dynamically):', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (!event.data || typeof event.data !== 'object') return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data.type === 'CLEAR_OLD_CACHES') {
    event.waitUntil(
      caches.keys().then((keys) =>
        Promise.all(keys.map((key) => caches.delete(key)))
      )
    );
  }
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // 1. 契约安全拦截：绝对不缓存敏感 API、Auth 响应与 Cloudflare Access 端点
  const isForbidden = FORBIDDEN_CACHE_PATTERNS.some((pattern) => pattern.test(requestUrl.href));
  if (isForbidden || event.request.method !== 'GET') {
    // 强制直接走网络，不经过 Cache Storage
    return;
  }

  // 2. 抱抱即时求助或 API 请求网络失败防护
  if (requestUrl.pathname.startsWith('/api/')) {
    // API 请求网络优先 (Network Only with fail closed)
    return;
  }

  // 3. 页面导航请求（/ 或 /index.html）：Network-First + Offline Cache Fallback
  // 确保新版本发布或回滚后刷新立即加载最新 HTML 与带哈希的 bundle，离线时无缝回退缓存
  if (
    event.request.mode === 'navigate' ||
    requestUrl.pathname === '/' ||
    requestUrl.pathname === '/index.html'
  ) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, copy);
              cache.put('/', copy.clone());
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => cached || caches.match('/'));
        })
    );
    return;
  }

  // 4. App Shell 静态资源：Cache First / Network Fallback 策略
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // 后台静默刷新 (Stale-While-Revalidate for app shell)
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {
          // 离线状态静默忽略
        });
        return cachedResponse;
      }

      // 未命中缓存时回源网络
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // 只缓存同源静态脚本、样式、字体或图片，绝不缓存 API
        if (
          requestUrl.origin === location.origin &&
          (requestUrl.pathname.endsWith('.js') ||
           requestUrl.pathname.endsWith('.css') ||
           requestUrl.pathname.endsWith('.svg') ||
           requestUrl.pathname.endsWith('.png') ||
           requestUrl.pathname.endsWith('.webmanifest'))
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return networkResponse;
      }).catch((err) => {
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
        throw err;
      });
    })
  );
});
