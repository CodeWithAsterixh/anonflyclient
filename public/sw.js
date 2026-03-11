const CACHE_NAME = 'anonfly-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png',
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
        if (response.redirected) {
          // A redirected response cannot be used for a request whose redirect mode is not "follow"
          // We "clean" it by creating a new Response object from the same body/meta
          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
          });
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
        // Cache new static assets (only safe, cacheable responses)
        const isGet = event.request.method === 'GET';
        const isBasic = response && response.type === 'basic'; // same-origin
        const ok = response && response.ok; // 2xx
        const noRange = !event.request.headers.get('range');
        const notOnlyIfCached = event.request.cache !== 'only-if-cached';
        const notRedirected = !response.redirected;
        const cacheable = isGet && ok && isBasic && noRange && notOnlyIfCached && notRedirected;

        if (cacheable) {
          try {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache).catch((err) => {
                console.warn('[SW] Cache.put failed:', err);
              });
            }).catch((err) => {
              console.warn('[SW] caches.open failed:', err);
            });
          } catch (err) {
            console.warn('[SW] Failed to cache response:', err);
          }
        }

        // Clean redirected responses for other requests too
        if (response.redirected) {
          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
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

