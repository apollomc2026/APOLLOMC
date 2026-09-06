// Apollo Mission Control — Service Worker v2
// Only immutable public assets are cached. Authenticated data is network-only.

const STATIC_CACHE = 'apollo-static-v2';

// Assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// ── Install: pre-cache shell assets ─────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: clean stale caches ────────────────────────
self.addEventListener('activate', event => {
  const validCaches = [STATIC_CACHE];
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => !validCaches.includes(key))
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch: routing strategy ──────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and chrome-extension requests
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // API and page requests may contain private mission data and are never cached.
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  // Supabase / external API — network only, no cache
  if (url.hostname.includes('supabase.co') || url.hostname.includes('anthropic.com')) {
    return; // let browser handle it
  }

  // Google Fonts — cache first (long TTL)
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Static assets (_next/static) — cache first forever
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Next.js image optimization — cache first
  if (url.pathname.startsWith('/_next/image')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Never persist authenticated or user-specific HTML.
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(fetch(request));
    return;
  }

  // Everything else — cache first
  event.respondWith(cacheFirst(request, STATIC_CACHE));
});

// ── Strategies ───────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

// ── Background Sync (mission status polling) ─────────────
self.addEventListener('sync', event => {
  if (event.tag === 'sync-missions') {
    event.waitUntil(syncMissionStatus());
  }
});

async function syncMissionStatus() {
  // Notify all open clients to refresh mission data
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach(client => {
    client.postMessage({ type: 'SYNC_MISSIONS' });
  });
}

// ── Push Notifications (mission complete) ────────────────
self.addEventListener('push', event => {
  if (!event.data) return;

  let data;
  try { data = event.data.json(); }
  catch { data = { title: 'Apollo Mission Control', body: event.data.text() }; }

  const options = {
    body: data.body || 'Mission status update',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: data.missionId || 'apollo-notification',
    renotify: true,
    requireInteraction: data.requireInteraction || false,
    data: { url: data.url || '/dashboard', missionId: data.missionId },
    actions: [
      { action: 'view', title: 'View Mission' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    vibrate: [100, 50, 100],
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'Apollo Mission Control',
      options
    )
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/dashboard';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      const existing = clients.find(c => c.url === url && 'focus' in c);
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    })
  );
});
