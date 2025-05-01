self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('quidditch-timer-cache-v1').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/styles.css',
        '/script.js',
        '/icons/icon-72.png',
        '/icons/icon-144.png',
        '/icons/icon-192.png',
        '/icons/icon-512.png',
        '/logos/griffindel-logo.png',
        '/logos/mardekar-logo.png',
        '/logos/hollóhát-logo.png',
        '/logos/hugrabug-logo.png'
      ]);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== 'quidditch-timer-cache-v1')
          .map(name => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});