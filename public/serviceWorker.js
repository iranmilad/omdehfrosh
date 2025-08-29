// Activate service worker immediately on install
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// Take control of all clients right away
self.addEventListener("activate", (event) => {
  self.clients.claim();
});

// Allow all fetch requests to go through without caching
self.addEventListener("fetch", (event) => {
  // No caching or interception
  return;
});

// ✅ Handle notification click and route user
self.addEventListener("notificationclick", function (event) {
  const urlToOpen = event.notification.data?.url || '/';
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
