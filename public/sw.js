const CACHE_NAME = 'caretaker-v2'
const RUNTIME_CACHE = 'runtime-v1'
const API_CACHE = 'api-v1'
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/auth/login',
  '/auth/register',
  '/manifest.json'
]

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
  )
  self.skipWaiting() // Activate immediately
})

// Fetch event - optimized caching strategies
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) return

  // Cache-first strategy for static assets (CSS, JS, images)
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    url.pathname.includes('/_next/static/')
  ) {
    event.respondWith(
      caches.match(request).then(response => {
        return response || fetch(request).then(fetchResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(request, fetchResponse.clone())
            return fetchResponse
          })
        })
      })
    )
    return
  }

  // Network-first strategy for API calls
  if (url.pathname.startsWith('/api/') || url.pathname.includes('supabase')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseClone = response.clone()
          caches.open(API_CACHE).then(cache => {
            cache.put(request, responseClone)
          })
          return response
        })
        .catch(() => caches.match(request))
    )
    return
  }

  // Stale-while-revalidate for HTML pages
  if (request.destination === 'document') {
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        const fetchPromise = fetch(request).then(networkResponse => {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, networkResponse.clone())
          })
          return networkResponse
        }).catch(() => cachedResponse)
        
        return cachedResponse || fetchPromise
      })
    )
    return
  }

  // Default: network-first with cache fallback
  event.respondWith(
    fetch(request)
      .then(response => {
        const responseClone = response.clone()
        caches.open(RUNTIME_CACHE).then(cache => {
          cache.put(request, responseClone)
        })
        return response
      })
      .catch(() => caches.match(request))
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const expectedCacheNames = [CACHE_NAME, RUNTIME_CACHE, API_CACHE]
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!expectedCacheNames.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      self.clients.claim() // Take control of all clients immediately
    })
  )
})

// Background sync for offline form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages())
  }
})

async function syncMessages() {
  // Implementation for background sync
  console.log('Syncing messages...')
}
