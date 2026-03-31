const CACHE_NAME = 'zero-tracker-cache-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Pre-cache de base (le minimum vital)
      // En App Router, la page racine '/' est dynamique, donc on ne cache pas agressivement
      return cache.addAll(['/'])
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name)
          }
        })
      )
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  
  // Exclure les appels API Supabase ou Next.js internes du cache agressif
  const url = new URL(event.request.url)
  if (url.pathname.startsWith('/_next/') || url.hostname.includes('supabase')) {
    return
  }

  // Stale-while-revalidate ou Network-first
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Mettre en cache la nouvelle version
        const resClone = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          if (response.status === 200) {
            cache.put(event.request, resClone)
          }
        })
        return response
      })
      .catch(() => {
        // En cas de perte réseau, on tente le cache
        return caches.match(event.request)
      })
  )
})
