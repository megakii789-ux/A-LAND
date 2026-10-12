const CACHE_NAME = 'sunny-island-app-shell-v1';

// 允许离线预缓存的 App Shell 核心静态资产与公共资源
const APP_SHELL_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/pwa-icon.svg'
];

// 绝对禁止缓存的安全与敏感路由规则
const FORBIDDEN_CACHE_PATTERNS = [
  /\/api\/family\/.*\/caregiver-notes/, // 家长私密自省笔记
  /\/api\/family\/.*\/caregivers/,      // 家长配置
  /\/api\/research\//,                  // 研究员数据导出
  /\/identitytoolkit/,                  // Google Auth / OAuth 令牌
  /securetoken.googleapis.com/,         // Firebase Refresh Token
  /google-analytics/,                   // 追踪类
  /\/api\/parent\//                     // 家长敏感数据
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

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // 1. 契约安全拦截：绝对不缓存敏感 API 与 Auth 响应
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

  // 3. App Shell 静态资源：Cache First / Network Fallback 策略
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

        // 只缓存同源静态静态脚本、字体或图片，绝不缓存 API
        if (
          requestUrl.origin === location.origin &&
          (requestUrl.pathname.endsWith('.js') ||
           requestUrl.pathname.endsWith('.css') ||
           requestUrl.pathname.endsWith('.svg') ||
           requestUrl.pathname.endsWith('.png') ||
           requestUrl.pathname.endsWith('.html') ||
           requestUrl.pathname === '/')
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return networkResponse;
      }).catch((err) => {
        // 离线备用回退到根 index.html
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
        throw err;
      });
    })
  );
});
