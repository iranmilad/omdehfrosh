// utils/productRefreshUtils.js

// Function to trigger product data refresh from anywhere in the app
export const triggerProductRefresh = (slug) => {
  const event = new CustomEvent('refreshProductDetails', { detail: { slug } });
  window.dispatchEvent(event);
};