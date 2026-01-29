/**
 * React Query Configuration
 *
 * Centralized configuration loaded from environment variables.
 * All cache times and settings can be customized via .env file.
 *
 * @author j2b.market
 * @version 1.0.0
 */

// ============================================================================
// ENVIRONMENT HELPERS
// ============================================================================

/**
 * Get environment variable with fallback
 * @param {string} key - Environment variable key
 * @param {*} defaultValue - Default value if not set
 * @returns {string|number|boolean} Environment value
 */
const getEnv = (key, defaultValue) => {
  const value = process.env[key] ?? import.meta.env?.[key];
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  return value;
};

/**
 * Get environment variable as number
 */
const getEnvNumber = (key, defaultValue) => {
  const value = getEnv(key, defaultValue);
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Get environment variable as boolean
 */
const getEnvBoolean = (key, defaultValue) => {
  const value = getEnv(key, defaultValue);
  if (typeof value === 'boolean') return value;
  return value === 'true' || value === '1';
};

// ============================================================================
// TIME CONSTANTS
// ============================================================================

export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
};

// ============================================================================
// CACHE CONFIGURATION FROM .ENV
// ============================================================================

/**
 * Cache configuration loaded from environment variables
 * Override any value by setting the corresponding REACT_APP_CACHE_* variable
 */
export const CACHE_CONFIG = {
  // Global enable/disable
  enabled: getEnvBoolean('REACT_APP_CACHE_ENABLED', true),

  // Debug mode
  debug: getEnvBoolean('REACT_APP_CACHE_DEBUG', process.env.NODE_ENV === 'development'),

  // Show error notifications globally
  showErrorNotifications: getEnvBoolean('REACT_APP_CACHE_SHOW_ERROR_NOTIFICATIONS', true),

  // ============================================================================
  // STALE TIME SETTINGS (in milliseconds)
  // How long data is considered "fresh" before background refetch
  // ============================================================================
  staleTime: {
    none: 0,
    instant: getEnvNumber('REACT_APP_CACHE_STALE_INSTANT', 10 * TIME.SECOND),
    short: getEnvNumber('REACT_APP_CACHE_STALE_SHORT', 30 * TIME.SECOND),
    medium: getEnvNumber('REACT_APP_CACHE_STALE_MEDIUM', 2 * TIME.MINUTE),
    long: getEnvNumber('REACT_APP_CACHE_STALE_LONG', 5 * TIME.MINUTE),
    extended: getEnvNumber('REACT_APP_CACHE_STALE_EXTENDED', 15 * TIME.MINUTE),
    session: getEnvNumber('REACT_APP_CACHE_STALE_SESSION', 30 * TIME.MINUTE),
    static: getEnvNumber('REACT_APP_CACHE_STALE_STATIC', TIME.HOUR),
  },

  // ============================================================================
  // GARBAGE COLLECTION TIME SETTINGS (in milliseconds)
  // How long inactive data stays in memory
  // ============================================================================
  gcTime: {
    none: 0,
    short: getEnvNumber('REACT_APP_CACHE_GC_SHORT', TIME.MINUTE),
    medium: getEnvNumber('REACT_APP_CACHE_GC_MEDIUM', 5 * TIME.MINUTE),
    long: getEnvNumber('REACT_APP_CACHE_GC_LONG', 15 * TIME.MINUTE),
    session: getEnvNumber('REACT_APP_CACHE_GC_SESSION', 30 * TIME.MINUTE),
    extended: getEnvNumber('REACT_APP_CACHE_GC_EXTENDED', TIME.HOUR),
    persistent: getEnvNumber('REACT_APP_CACHE_GC_PERSISTENT', TIME.DAY),
  },

  // ============================================================================
  // RETRY SETTINGS
  // ============================================================================
  retry: {
    none: 0,
    minimal: getEnvNumber('REACT_APP_CACHE_RETRY_MINIMAL', 1),
    standard: getEnvNumber('REACT_APP_CACHE_RETRY_STANDARD', 2),
    extended: getEnvNumber('REACT_APP_CACHE_RETRY_EXTENDED', 3),
  },

  // ============================================================================
  // NETWORK SETTINGS
  // ============================================================================
  network: {
    refetchOnWindowFocus: getEnvBoolean('REACT_APP_CACHE_REFETCH_ON_FOCUS', false),
    refetchOnReconnect: getEnvBoolean('REACT_APP_CACHE_REFETCH_ON_RECONNECT', true),
    refetchInterval: getEnvNumber('REACT_APP_CACHE_REFETCH_INTERVAL', 0), // 0 = disabled
  },
};

// ============================================================================
// ENDPOINT-SPECIFIC CACHE POLICIES
// Define custom cache behavior for specific API endpoints
// ============================================================================

export const ENDPOINT_POLICIES = {
  // ============================================================================
  // CRITICAL ENDPOINTS - Always fetch fresh
  // ============================================================================
  critical: [
    '/cart',
    '/cart/*',
    '/checkout',
    '/checkout/*',
    '/payment',
    '/payment/*',
    '/auth/user-initial-data',
    '/auth/verify',
  ],

  // ============================================================================
  // REAL-TIME ENDPOINTS - Near real-time with short cache
  // ============================================================================
  realTime: [
    '/notifications',
    '/notifications/*',
    '/messages',
    '/messages/*',
  ],

  // ============================================================================
  // STATIC ENDPOINTS - Long-term cache
  // ============================================================================
  static: [
    '/bootstrap',
    '/categories',
    '/categories/*',
    '/provinces',
    '/countries',
    '/config',
  ],

  // ============================================================================
  // SESSION ENDPOINTS - Cache for entire session
  // ============================================================================
  session: [
    '/auth/user-profile',
    '/user/preferences',
    '/user/settings',
  ],

  // ============================================================================
  // USER DATA ENDPOINTS - User-specific with balanced caching
  // ============================================================================
  userData: [
    '/user/*',
    '/orders',
    '/orders/*',
    '/addresses',
    '/addresses/*',
    '/favorites',
    '/favorites/*',
  ],
};

// ============================================================================
// HELPER: Match endpoint against policy patterns
// ============================================================================

/**
 * Check if an endpoint matches a pattern (supports * wildcard)
 * @param {string} endpoint - API endpoint
 * @param {string} pattern - Pattern to match against
 * @returns {boolean}
 */
const matchEndpoint = (endpoint, pattern) => {
  if (pattern.endsWith('/*')) {
    const prefix = pattern.slice(0, -2);
    return endpoint === prefix || endpoint.startsWith(prefix + '/');
  }
  return endpoint === pattern;
};

/**
 * Get the cache policy for an endpoint
 * @param {string} endpoint - API endpoint
 * @returns {string} Policy name: 'critical' | 'realTime' | 'static' | 'session' | 'userData' | 'standard'
 */
export const getEndpointPolicy = (endpoint) => {
  for (const [policy, patterns] of Object.entries(ENDPOINT_POLICIES)) {
    if (patterns.some((pattern) => matchEndpoint(endpoint, pattern))) {
      return policy;
    }
  }
  return 'standard';
};

// ============================================================================
// ENVIRONMENT VARIABLE DOCUMENTATION
// ============================================================================

/**
 * Add these to your .env file to customize cache behavior:
 *
 * # Enable/Disable caching globally
 * REACT_APP_CACHE_ENABLED=true
 *
 * # Debug mode (logs cache operations)
 * REACT_APP_CACHE_DEBUG=false
 *
 * # Show error notifications
 * REACT_APP_CACHE_SHOW_ERROR_NOTIFICATIONS=true
 *
 * # Stale time settings (in milliseconds)
 * REACT_APP_CACHE_STALE_INSTANT=10000        # 10 seconds
 * REACT_APP_CACHE_STALE_SHORT=30000          # 30 seconds
 * REACT_APP_CACHE_STALE_MEDIUM=120000        # 2 minutes
 * REACT_APP_CACHE_STALE_LONG=300000          # 5 minutes
 * REACT_APP_CACHE_STALE_EXTENDED=900000      # 15 minutes
 * REACT_APP_CACHE_STALE_SESSION=1800000      # 30 minutes
 * REACT_APP_CACHE_STALE_STATIC=3600000       # 1 hour
 *
 * # Garbage collection time settings (in milliseconds)
 * REACT_APP_CACHE_GC_SHORT=60000             # 1 minute
 * REACT_APP_CACHE_GC_MEDIUM=300000           # 5 minutes
 * REACT_APP_CACHE_GC_LONG=900000             # 15 minutes
 * REACT_APP_CACHE_GC_SESSION=1800000         # 30 minutes
 * REACT_APP_CACHE_GC_EXTENDED=3600000        # 1 hour
 * REACT_APP_CACHE_GC_PERSISTENT=86400000     # 24 hours
 *
 * # Retry settings
 * REACT_APP_CACHE_RETRY_MINIMAL=1
 * REACT_APP_CACHE_RETRY_STANDARD=2
 * REACT_APP_CACHE_RETRY_EXTENDED=3
 *
 * # Network settings
 * REACT_APP_CACHE_REFETCH_ON_FOCUS=false
 * REACT_APP_CACHE_REFETCH_ON_RECONNECT=true
 * REACT_APP_CACHE_REFETCH_INTERVAL=0
 */

export default CACHE_CONFIG;
