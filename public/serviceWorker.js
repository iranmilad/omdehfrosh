self.addEventListener("install", (event) => {
    self.skipWaiting(); // Activate the SW immediately
  });
  
  self.addEventListener("activate", (event) => {
    self.clients.claim(); // Take control of the page immediately
  });
  
  self.addEventListener("fetch", (event) => {
    // Just let network requests go through, no caching
    return;
  });
  