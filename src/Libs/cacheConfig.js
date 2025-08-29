// config/cacheConfig.js

export const CACHE_CONFIG = {
  // Encoding method: 'base64', 'xor', 'compress', 'advanced'
  ENCODING_METHOD: 'advanced',
  
  // Cache expiration times (in milliseconds)
  EXPIRATION_TIMES: {
    PRODUCTS: 2 * 60 * 60 * 1000, // 2 hours
    NOTIFICATIONS: 30 * 60 * 1000, // 30 minutes
    USER_DATA: 60 * 60 * 1000, // 1 hour
  },
  
  // Key prefixes for different data types
  KEY_PREFIXES: {
    PRODUCT: 'product_',
    NOTIFICATION: 'notifications_',
    USER: 'user_',
    CART: 'cart_',
  },
  
  // XOR key for encoding (stored in environment variables)
  XOR_KEY: process.env.REACT_APP_CACHE_ENCRYPTION_KEY || 'fallbackKey2024',
  
  // Enable/disable caching
  ENABLE_CACHING: process.env.REACT_APP_ENABLE_CACHING !== 'false',
  
  // Debug mode
  DEBUG: process.env.NODE_ENV === 'development',
};

// Helper function to get cache key
export const getCacheKey = (type, identifier) => {
  const prefix = CACHE_CONFIG.KEY_PREFIXES[type.toUpperCase()];
  return `${prefix}${identifier}`;
};

// Helper function to get expiration time
export const getExpirationTime = (type) => {
  return CACHE_CONFIG.EXPIRATION_TIMES[type.toUpperCase()] || 60 * 60 * 1000; // Default 1 hour
};