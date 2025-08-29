export function register() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/serviceWorker.js")
          .then((registration) => {
            
          })
          .catch((error) => {
            
          });
      });
    }
  }
  