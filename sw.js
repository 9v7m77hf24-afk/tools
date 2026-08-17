// Cronologia / Lexicon — offline app-shell service worker.
//
// Strategy:
//  - The page itself: network-first, falling back to cache when offline.
//    This means you always get your latest pushed edits when online, and
//    the last-cached version when you don't have a connection.
//  - Google Fonts (CSS + font files): cache-first. Fonts don't change, so
//    once they've been fetched once online, always serve them from cache —
//    this is what lets the page keep its real typography offline instead
//    of silently falling back to a system font.
//  - api.github.com and translation.googleapis.com: never intercepted.
//    Both GitHub sync and word translation have their own app-level
//    online/offline handling (pending/ok/err states, retry queues) — piping
//    them through this cache layer would risk silently serving a stale
//    cached response instead of letting the app's own logic see the real
//    network result.
//  - Everything else: normal network, falling back to cache if present.
//
// Bump CACHE_VERSION only if you want to force every client to drop old
// cached assets (e.g. after a Google Fonts URL change) — normal HTML edits
// don't need this, since the network-first strategy already fetches fresh
// copies whenever you're online.
const CACHE_VERSION = 'cronologia-shell-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  let url;
  try { url = new URL(req.url); } catch(e) { return; }

  // Don't intercept API calls with their own online/offline handling
  // (GitHub sync, Google Translate). Google Translate uses POST, so this
  // also needs to skip on method alone, not just hostname.
  if(url.hostname === 'api.github.com') return;
  if(url.hostname === 'translation.googleapis.com') return;
  if(req.method !== 'GET') return;

  if(req.mode === 'navigate'){
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then(c => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  if(url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com'){
    event.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then(c => c.put(req, copy));
        return res;
      }))
    );
    return;
  }

  event.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then(c => c.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req))
  );
});
