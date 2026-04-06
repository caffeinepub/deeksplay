// Deeksplay Service Worker v39
// Handles background audio keepalive and PWA caching

const CACHE_NAME = 'deeksplay-v39';
const STATIC_ASSETS = [
  '/',
  '/silence.wav',
  '/manifest.json'
];

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Activate: clear old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: serve silence.wav from cache always (critical for bg audio)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Always serve silence.wav from cache for reliable background audio
  if (url.pathname === '/silence.wav') {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request);
      })
    );
    return;
  }

  // For everything else: network first, fallback to cache
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Message handler: keep SW alive when audio is playing
self.addEventListener('message', (event) => {
  if (event.data?.type === 'AUDIO_PLAYING') {
    // Respond to keep SW alive
    event.ports?.[0]?.postMessage({ alive: true });
  }
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
