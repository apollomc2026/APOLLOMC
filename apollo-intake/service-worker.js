/* Apollo PWA service worker — shell caching only.
   - Caches the app shell on install so "Add to Home Screen" renders offline.
   - API requests to portal.apollomc.ai bypass the cache (network-only) so
     auth state and generated outputs are never stale. */

const CACHE = 'apollo-shell-v1'
const ASSETS = [
  '/apollo/',
  '/apollo/index.html',
  '/apollo/manifest.json',
  '/apollo/logo.png',
  '/apollo/icons/icon-192.png',
  '/apollo/icons/icon-512.png',
]

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)))
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)
  if (url.origin.includes('portal.apollomc.ai')) return // always network for API
  if (url.pathname.startsWith('/apollo/')) {
    e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)))
  }
})
