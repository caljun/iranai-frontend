self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('iranai-cache-v1').then((cache) => {
        return cache.addAll([
          '/frontend/index.html',
          '/frontend/post.html',
          '/frontend/notification.html',
          '/frontend/styles.css',
          '/frontend/scripts/modal.js',
          '/frontend/scripts/notification.js',
          '/frontend/scripts/post.js',
          '/frontend/scripts/profile.js'
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  });
  