/* Apollo PWA service worker — shell caching only.
   - Caches the app shell on install so "Add to Home Screen" renders
     offline. The shell now includes three pages (index/launch/mission)
     and the shared/ ES modules + theme.css.
   - API requests to portal.apollomc.ai bypass the cache (network-only)
     so auth state and generated outputs are never stale.
   - On activate, every cache whose key isn't CACHE_NAME is deleted —
     this is what flushes returning users off the old monolith bundle.
     Cache version was bumped to apollo-v3-modular for that reason; do
     not reuse a previous CACHE_NAME without remembering this property.
*/

const CACHE_NAME = 'apollo-v5-mission-log'
const PRECACHE_URLS = [
  '/apollo/',
  '/apollo/index.html',
  '/apollo/launch.html',
  '/apollo/mission.html',
  '/apollo/manifest.json',
  '/apollo/mars.png',
  '/apollo/logo.png',
  '/apollo/icons/icon-192.png',
  '/apollo/icons/icon-512.png',
  '/apollo/shared/theme.css',
  '/apollo/shared/api.js',
  '/apollo/shared/auth.js',
  '/apollo/shared/auth-modal.js',
  '/apollo/shared/catalog.js',
  '/apollo/shared/command-bar.js',
  '/apollo/shared/drafts.js',
  '/apollo/shared/hero.js',
  '/apollo/shared/submissions.js',
  '/apollo/shared/ui.js',
  '/apollo/shared/uploads.js',
]

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((c) => {
      // addAll fails atomically — if any single asset 404s the whole
      // install errors. Use individual puts with .catch so a single
      // missing icon won't keep the whole shell uncached.
      return Promise.all(
        PRECACHE_URLS.map((url) =>
          fetch(url, { credentials: 'same-origin' })
            .then((res) => (res.ok ? c.put(url, res.clone()) : null))
            .catch(() => null)
        )
      )
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)
  // Never cache API traffic.
  if (url.origin.includes('portal.apollomc.ai')) return
  if (url.pathname.startsWith('/apollo/')) {
    e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)))
  }
})
