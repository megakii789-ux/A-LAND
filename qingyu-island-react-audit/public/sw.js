/* Generated static path list is injected by scripts/build-pwa.mjs after vite build. */
const CACHE_NAME = '__QY_CACHE_NAME__';
const STATIC_PATHS = __QY_STATIC_PATHS__;
const OWN_PREFIXES = ['qingyu-static-', 'sunny-island-app-shell-'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_PATHS)));
  // Do not skip waiting during a child's active session.
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => OWN_PREFIXES.some(p=>name.startsWith(p)) && name!==CACHE_NAME)
      .map(name=>caches.delete(name)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method!=='GET' || url.origin!==self.location.origin || url.pathname.startsWith('/api/')
      || url.pathname==='/healthz' || url.search) return;
  if (request.mode==='navigate') {
    event.respondWith(fetch(request).catch(async () => {
      const response = await caches.open(CACHE_NAME).then(cache=>cache.match('/index.html'));
      return response || new Response('Offline shell unavailable', {status:503});
    }));
    return;
  }
  if (!STATIC_PATHS.includes(url.pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    return (await cache.match(request)) || fetch(request);
  })());
});
