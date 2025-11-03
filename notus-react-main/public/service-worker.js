/* Service Worker pour PWA Sagemcom Technicien Mobile */

const CACHE_NAME = 'sagemcom-mobile-v1';
const RUNTIME_CACHE = 'sagemcom-runtime-v1';

// Ressources à mettre en cache lors de l'installation
const PRECACHE_URLS = [
  '/',
  '/mobile/technicien',
  '/mobile/notifications',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
  '/favicon.ico',
  '/apple-icon.png'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installation...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Mise en cache des ressources');
        return cache.addAll(PRECACHE_URLS.map(url => new Request(url, {credentials: 'same-origin'})))
          .catch(err => {
            console.warn('[SW] Erreur lors de la mise en cache:', err);
            // Continue même si certaines ressources échouent
          });
      })
      .then(() => self.skipWaiting())
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[SW] Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Stratégie de cache: Network First, fallback to Cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ne pas cacher les appels API (toujours fetch réseau)
  if (url.pathname.startsWith('/PI/') || url.hostname === 'localhost' && url.port === '8089') {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'Mode hors ligne - API indisponible' }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
    );
    return;
  }

  // Pour les autres ressources: Cache First avec Network Fallback
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Retourner la réponse en cache et mettre à jour en arrière-plan
          fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, networkResponse);
              });
            }
          }).catch(() => {
            // Ignorer les erreurs réseau en mode cache
          });
          return cachedResponse;
        }

        // Si pas en cache, aller sur le réseau
        return fetch(request)
          .then((networkResponse) => {
            // Ne mettre en cache que les réponses valides
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
              return networkResponse;
            }

            // Cloner la réponse car elle ne peut être consommée qu'une fois
            const responseToCache = networkResponse.clone();

            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                cache.put(request, responseToCache);
              });

            return networkResponse;
          })
          .catch(() => {
            // Si offline et pas en cache, retourner page offline basique
            if (request.destination === 'document') {
              return caches.match('/');
            }
            return new Response('Ressource indisponible hors ligne', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Gestion des notifications push (optionnel)
self.addEventListener('push', (event) => {
  console.log('[SW] Push reçu:', event);
  const options = {
    body: event.data ? event.data.text() : 'Nouvelle notification',
    icon: '/apple-icon.png',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    tag: 'sagemcom-notification',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification('Sagemcom Technicien', options)
  );
});

// Gestion des clics sur notifications
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification cliquée:', event);
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/mobile/notifications')
  );
});

// Gestion de la synchronisation en arrière-plan (optionnel)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  if (event.tag === 'sync-interventions') {
    event.waitUntil(syncInterventions());
  }
});

// Fonction de synchronisation des interventions
async function syncInterventions() {
  try {
    console.log('[SW] Synchronisation des interventions...');
    // Logique de sync à implémenter selon vos besoins
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Erreur sync:', error);
    return Promise.reject(error);
  }
}

console.log('[SW] Service Worker chargé');
