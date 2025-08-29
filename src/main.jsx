import { createRoot } from "react-dom/client";
import { CookiesProvider } from "react-cookie"; // Import CookiesProvider
import App from "./App.jsx";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        // Service Worker registered successfully
      })
      .catch(error => {
        // Service Worker registration failed
      });
  });
}


createRoot(document.getElementById("root")).render(
  <CookiesProvider>
    <App />
  </CookiesProvider>
);

serviceWorkerRegistration.register();