// Activate service worker immediately on install
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// Take control of all clients right away
self.addEventListener("activate", (event) => {
  self.clients.claim();
});

// No fetch handler - letting the browser handle all requests avoids no-op overhead during navigation.
// If you need to intercept fetches later, add a real handler here.

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
