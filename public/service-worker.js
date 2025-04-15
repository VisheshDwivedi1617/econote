
// Cache names
const STATIC_CACHE = 'econote-static-v1';
const DYNAMIC_CACHE = 'econote-dynamic-v1';
const FONT_CACHE = 'econote-fonts-v1';
const IMAGE_CACHE = 'econote-images-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/placeholder.svg'
];

// Limit for dynamic cache size
const CACHE_SIZE = 50;

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[Service Worker] Precaching App Shell');
        return cache.addAll(STATIC_ASSETS);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((keyList) => {
        return Promise.all(keyList.map((key) => {
          if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE && key !== FONT_CACHE && key !== IMAGE_CACHE) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        }));
      })
  );
  
  return self.clients.claim();
});

// Helper function to trim cache
const trimCache = (cacheName, maxItems) => {
  caches.open(cacheName)
    .then((cache) => {
      return cache.keys()
        .then((keys) => {
          if (keys.length > maxItems) {
            cache.delete(keys[0])
              .then(() => trimCache(cacheName, maxItems)); // recursively trim
          }
        });
    });
};

// Function to determine which cache to use based on request
const getCache = (request) => {
  const url = new URL(request.url);
  
  if (request.url.includes('fonts.googleapis.com') || request.url.includes('fonts.gstatic.com')) {
    return FONT_CACHE;
  } else if (url.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
    return IMAGE_CACHE;
  } else {
    return DYNAMIC_CACHE;
  }
};

// Fetch event strategy - cache then network with dynamic caching
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip for browser-sync or chrome-extension
  if (url.host.includes('browser-sync') || 
      url.protocol === 'chrome-extension:' ||
      url.pathname.includes('gtag') ||
      url.pathname.includes('analytics')) {
    return;
  }
  
  // For API calls (e.g. to Supabase) - network with cache fallback
  if (event.request.url.includes('supabase.co') || url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Only cache successful responses
          if (!response || response.status !== 200) {
            return response;
          }
          
          // Clone the response since we'll consume it when putting in cache
          const clonedResponse = response.clone();
          
          caches.open(DYNAMIC_CACHE)
            .then((cache) => {
              cache.put(event.request, clonedResponse);
            });
          
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // For all other requests - cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then((res) => {
              // Don't cache if not successful
              if (!res || res.status !== 200) {
                return res;
              }
              
              const cacheName = getCache(event.request);
              
              // Clone the response since we'll consume it when putting in cache
              const clonedRes = res.clone();
              
              caches.open(cacheName)
                .then((cache) => {
                  cache.put(event.request, clonedRes);
                  
                  // Trim cache if it's the dynamic cache
                  if (cacheName === DYNAMIC_CACHE) {
                    trimCache(DYNAMIC_CACHE, CACHE_SIZE);
                  }
                });
              
              return res;
            })
            .catch((err) => {
              console.log('[Service Worker] Fetch failed', err);
              
              // Return the offline page for navigation requests
              if (event.request.mode === 'navigate') {
                return caches.match('/');
              }
            });
        }
      })
  );
});

// Background sync for saving offline changes
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background Syncing', event);
  
  if (event.tag === 'sync-notes') {
    event.waitUntil(
      // Here would be code to sync back notes data from IndexedDB
      console.log('[Service Worker] Syncing notes')
    );
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Notification received', event);
  
  let data = {
    title: 'New message',
    content: 'Something new happened!',
    openUrl: '/'
  };
  
  if (event.data) {
    data = JSON.parse(event.data.text());
  }
  
  const options = {
    body: data.content,
    icon: '/icons/icon-96x96.png',
    badge: '/icons/icon-72x72.png',
    data: {
      url: data.openUrl
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;
  
  if (action === 'confirm') {
    console.log('[Service Worker] Notification confirmation');
    notification.close();
  } else {
    event.waitUntil(
      clients.matchAll()
        .then((clients) => {
          const client = clients.find((c) => {
            return c.visibilityState === 'visible';
          });
          
          if (client) {
            client.navigate(notification.data.url);
            client.focus();
          } else {
            clients.openWindow(notification.data.url);
          }
          
          notification.close();
        })
    );
  }
});
