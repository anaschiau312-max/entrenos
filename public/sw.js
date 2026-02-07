// RunTracker Service Worker v1
const CACHE_VERSION = 'rt-v2';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;

// Static assets to pre-cache on install
const PRECACHE_URLS = [
    '/',
    '/app.html',
    '/index.html',
    '/css/styles.css',
    '/manifest.json',
    '/img/icons/icon-192.png',
    '/img/icons/icon-512.png',
    // Core modules
    '/js/firebase-config.js',
    '/js/auth.js',
    '/js/utils.js',
    '/js/offline.js',
    '/js/db.js',
    '/js/ocr.js',
    '/js/router.js',
    // Views
    '/js/views/dashboard.js',
    '/js/views/weekly.js',
    '/js/views/calendar.js',
    '/js/views/workout-log.js',
    '/js/views/exercises.js',
    '/js/views/stats-view.js',
    '/js/views/edit-plan.js',
    '/js/views/settings.js'
];

// CDN URLs to cache on first use
const CDN_HOSTS = [
    'www.gstatic.com',
    'cdn.jsdelivr.net'
];

// Firebase API hosts — always network
const FIREBASE_HOSTS = [
    'firebaseio.com',
    'firebasedatabase.app',
    'googleapis.com',
    'cloudfunctions.net',
    'firebaseinstallations.googleapis.com'
];

// INSTALL — pre-cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting())
    );
});

// ACTIVATE — clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys
                    .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
                    .map((key) => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// FETCH — routing strategy
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip chrome-extension and other non-http
    if (!url.protocol.startsWith('http')) return;

    // Firebase API calls — Network Only (data must be fresh)
    if (FIREBASE_HOSTS.some((host) => url.hostname.includes(host))) {
        return;
    }

    // CDN resources — Cache First (versioned, immutable)
    if (CDN_HOSTS.some((host) => url.hostname.includes(host))) {
        event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
        return;
    }

    // Local static assets — Cache First with network fallback
    event.respondWith(cacheFirst(request, STATIC_CACHE));
});

// Cache First strategy
async function cacheFirst(request, cacheName) {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch (err) {
        // If offline and no cache, return a fallback for navigation requests
        if (request.mode === 'navigate') {
            const fallback = await caches.match('/app.html');
            if (fallback) return fallback;
        }
        throw err;
    }
}

// Listen for messages from the app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
