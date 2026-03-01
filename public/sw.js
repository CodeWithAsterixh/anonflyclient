const CACHE_NAME = 'anonfly-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.svg',
  '/app.css',
  '/favicon.ico'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Caching static assets
      return cache.addAll(STATIC_ASSETS);
    })
  );
  globalThis.self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cache) => cache !== CACHE_NAME)
          .map((cache) => caches.delete(cache).catch(() => {
            console.warn(`Failed to delete old cache: ${cache}`);
          }))
      );
    })
  );
  globalThis.self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) return;

  // Skip API requests and WebSocket
  if (url.pathname.includes('/api/') || url.pathname.includes('socket')) {
    return;
  }

  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then((response) => {
        // If it's a redirect, we need to handle it properly for navigation
        if (response.type === 'opaqueredirect' || (response.status >= 300 && response.status < 400)) {
          // Returning the redirect response directly might cause "redirect mode not follow"
          // We can try to fetch the destination if we have it, or just let the browser handle it
          // by not calling respondWith, but since we already did, we return it.
          // However, a better way is to fetch with follow.
          return fetch(event.request.url);
        }
        return response;
      }).catch(() => {
        return caches.match('/');
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        // Cache new static assets
        if (event.request.method === 'GET' && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      });
    })
  );
});

// Listen for update message
self.addEventListener('message', (event) => {
  // 1. Verify origin immediately
  if (event.origin !== self.location.origin) {
    return;
  }

  // 2. Validate message data
  if (!event.data || event.data.type !== 'SKIP_WAITING') {
    return;
  }

  globalThis.self.skipWaiting();
});

