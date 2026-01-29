/**
 * React Query Cache Strategies
 *
 * Comprehensive cache configuration system for session-based caching
 * with support for critical APIs, persistent data, and fine-grained control.
 * All values are configurable via .env file.
 *
 * @author j2b.market
 * @version 1.0.0
 */

import { CACHE_CONFIG, TIME, getEndpointPolicy } from './config';

// ============================================================================
// RE-EXPORT TIME CONSTANTS
// ============================================================================

export { TIME };

// ============================================================================
// STALE TIME PRESETS
// Determines how long data is considered "fresh" before background refetch
// Values loaded from .env via CACHE_CONFIG
// ============================================================================

export const STALE_TIME = {
  /** Always stale - refetch on every mount/focus (critical real-time data) */
  NONE: CACHE_CONFIG.staleTime.none,

  /** Near real-time data (notifications, live updates) */
  INSTANT: CACHE_CONFIG.staleTime.instant,

  /** Frequently changing data (cart, stock levels) */
  SHORT: CACHE_CONFIG.staleTime.short,

  /** Moderately changing data (product lists, search results) */
  MEDIUM: CACHE_CONFIG.staleTime.medium,

  /** Slowly changing data (categories, filters) */
  LONG: CACHE_CONFIG.staleTime.long,

  /** Rarely changing data (user profile, settings) */
  EXTENDED: CACHE_CONFIG.staleTime.extended,

  /** Session-level data (bootstrap, config) */
  SESSION: CACHE_CONFIG.staleTime.session,

  /** Static reference data (countries, provinces) */
  STATIC: CACHE_CONFIG.staleTime.static,

  /** Infinite - Never becomes stale (immutable data) */
  INFINITE: Infinity,
};

// ============================================================================
// GARBAGE COLLECTION TIME PRESETS (gcTime, formerly cacheTime)
// Determines how long inactive data stays in memory
// Values loaded from .env via CACHE_CONFIG
// ============================================================================

export const GC_TIME = {
  /** No caching - remove immediately when unused */
  NONE: CACHE_CONFIG.gcTime.none,

  /** Short-lived cache */
  SHORT: CACHE_CONFIG.gcTime.short,

  /** Standard cache duration */
  MEDIUM: CACHE_CONFIG.gcTime.medium,

  /** Extended cache */
  LONG: CACHE_CONFIG.gcTime.long,

  /** Session-like cache */
  SESSION: CACHE_CONFIG.gcTime.session,

  /** Long-lived cache */
  EXTENDED: CACHE_CONFIG.gcTime.extended,

  /** Persistent cache (for static data) */
  PERSISTENT: CACHE_CONFIG.gcTime.persistent,

  /** Infinite - Never garbage collected */
  INFINITE: Infinity,
};

// ============================================================================
// RETRY CONFIGURATION
// Values loaded from .env via CACHE_CONFIG
// ============================================================================

export const RETRY_CONFIG = {
  /** No retries */
  NONE: CACHE_CONFIG.retry.none,

  /** Single retry for quick failures */
  MINIMAL: CACHE_CONFIG.retry.minimal,

  /** Standard retry count */
  STANDARD: CACHE_CONFIG.retry.standard,

  /** Extended retries for critical operations */
  EXTENDED: CACHE_CONFIG.retry.extended,
};

export const RETRY_DELAY = {
  /** Exponential backoff: attempt => Math.min(1000 * 2 ** attempt, 30000) */
  EXPONENTIAL: (attempt) => Math.min(1000 * 2 ** attempt, 30000),

  /** Linear delay: 1 second between retries */
  LINEAR: () => 1000,

  /** Immediate retry */
  IMMEDIATE: () => 0,

  /** Custom delay with jitter to prevent thundering herd */
  JITTERED: (attempt) => {
    const base = Math.min(1000 * 2 ** attempt, 30000);
    const jitter = Math.random() * 1000;
    return base + jitter;
  },
};

// ============================================================================
// PREDEFINED CACHE STRATEGIES
// Use these for consistent caching behavior across the application
// ============================================================================

export const CACHE_STRATEGY = {
  /**
   * CRITICAL - Always fetch fresh data
   * Use for: Cart, checkout, real-time stock, payment status
   */
  CRITICAL: {
    staleTime: STALE_TIME.NONE,
    gcTime: GC_TIME.SHORT,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: RETRY_CONFIG.MINIMAL,
    retryDelay: RETRY_DELAY.EXPONENTIAL,
  },

  /**
   * REAL_TIME - Near real-time with short cache
   * Use for: Notifications, messages, live updates
   */
  REAL_TIME: {
    staleTime: STALE_TIME.INSTANT,
    gcTime: GC_TIME.SHORT,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: RETRY_CONFIG.MINIMAL,
    retryDelay: RETRY_DELAY.LINEAR,
  },

  /**
   * DYNAMIC - Frequently changing data with moderate cache
   * Use for: Product lists, search results, filtered data
   */
  DYNAMIC: {
    staleTime: STALE_TIME.SHORT,
    gcTime: GC_TIME.MEDIUM,
    refetchOnMount: true,
    refetchOnWindowFocus: CACHE_CONFIG.network.refetchOnWindowFocus,
    refetchOnReconnect: CACHE_CONFIG.network.refetchOnReconnect,
    retry: RETRY_CONFIG.STANDARD,
    retryDelay: RETRY_DELAY.EXPONENTIAL,
  },

  /**
   * STANDARD - Default caching strategy
   * Use for: Most API calls, general data fetching
   */
  STANDARD: {
    staleTime: STALE_TIME.MEDIUM,
    gcTime: GC_TIME.MEDIUM,
    refetchOnMount: false,
    refetchOnWindowFocus: CACHE_CONFIG.network.refetchOnWindowFocus,
    refetchOnReconnect: CACHE_CONFIG.network.refetchOnReconnect,
    retry: RETRY_CONFIG.STANDARD,
    retryDelay: RETRY_DELAY.EXPONENTIAL,
  },

  /**
   * CACHED - Longer cache for slower-changing data
   * Use for: Categories, brands, product details
   */
  CACHED: {
    staleTime: STALE_TIME.LONG,
    gcTime: GC_TIME.LONG,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: RETRY_CONFIG.STANDARD,
    retryDelay: RETRY_DELAY.EXPONENTIAL,
  },

  /**
   * SESSION - Cache for entire session
   * Use for: Bootstrap data, user preferences, app config
   */
  SESSION: {
    staleTime: STALE_TIME.SESSION,
    gcTime: GC_TIME.SESSION,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: RETRY_CONFIG.EXTENDED,
    retryDelay: RETRY_DELAY.JITTERED,
  },

  /**
   * STATIC - Long-term cache for rarely changing data
   * Use for: Countries, provinces, static configurations
   */
  STATIC: {
    staleTime: STALE_TIME.STATIC,
    gcTime: GC_TIME.EXTENDED,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: RETRY_CONFIG.EXTENDED,
    retryDelay: RETRY_DELAY.EXPONENTIAL,
  },

  /**
   * IMMUTABLE - Data that never changes
   * Use for: Historical data, archived content, version-specific assets
   */
  IMMUTABLE: {
    staleTime: STALE_TIME.INFINITE,
    gcTime: GC_TIME.PERSISTENT,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: RETRY_CONFIG.MINIMAL,
    retryDelay: RETRY_DELAY.LINEAR,
  },

  /**
   * USER_DATA - User-specific data with balanced caching
   * Use for: User profile, addresses, saved items
   */
  USER_DATA: {
    staleTime: STALE_TIME.EXTENDED,
    gcTime: GC_TIME.SESSION,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: CACHE_CONFIG.network.refetchOnReconnect,
    retry: RETRY_CONFIG.STANDARD,
    retryDelay: RETRY_DELAY.EXPONENTIAL,
  },

  /**
   * PAGINATED - Optimized for paginated/infinite queries
   * Use for: Product listings with pagination, infinite scroll
   */
  PAGINATED: {
    staleTime: STALE_TIME.MEDIUM,
    gcTime: GC_TIME.LONG,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: RETRY_CONFIG.STANDARD,
    retryDelay: RETRY_DELAY.EXPONENTIAL,
    keepPreviousData: true,
  },

  /**
   * BACKGROUND_SYNC - Data that syncs in background
   * Use for: Analytics, non-critical updates
   */
  BACKGROUND_SYNC: {
    staleTime: STALE_TIME.LONG,
    gcTime: GC_TIME.MEDIUM,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: CACHE_CONFIG.network.refetchOnReconnect,
    retry: RETRY_CONFIG.EXTENDED,
    retryDelay: RETRY_DELAY.JITTERED,
    networkMode: 'offlineFirst',
  },
};

// ============================================================================
// POLICY TO STRATEGY MAPPING
// Maps endpoint policies to cache strategies
// ============================================================================

const POLICY_STRATEGY_MAP = {
  critical: 'CRITICAL',
  realTime: 'REAL_TIME',
  static: 'STATIC',
  session: 'SESSION',
  userData: 'USER_DATA',
  standard: 'STANDARD',
};

// ============================================================================
// STRATEGY HELPER FUNCTIONS
// ============================================================================

/**
 * Get a cache strategy by name
 * @param {keyof typeof CACHE_STRATEGY} strategyName
 * @returns {object} Cache strategy configuration
 */
export const getStrategy = (strategyName) => {
  const strategy = CACHE_STRATEGY[strategyName];
  if (!strategy) {
    if (CACHE_CONFIG.debug) {
      console.warn(`Unknown cache strategy: ${strategyName}, falling back to STANDARD`);
    }
    return { ...CACHE_STRATEGY.STANDARD };
  }
  return { ...strategy };
};

/**
 * Get a cache strategy based on endpoint
 * Uses ENDPOINT_POLICIES from config to determine the best strategy
 * @param {string} endpoint - API endpoint
 * @returns {object} Cache strategy configuration
 */
export const getStrategyForEndpoint = (endpoint) => {
  const policy = getEndpointPolicy(endpoint);
  const strategyName = POLICY_STRATEGY_MAP[policy] || 'STANDARD';
  return getStrategy(strategyName);
};

/**
 * Create a custom strategy by extending an existing one
 * @param {keyof typeof CACHE_STRATEGY} baseStrategy - Base strategy name
 * @param {object} overrides - Custom overrides
 * @returns {object} Combined strategy
 */
export const extendStrategy = (baseStrategy, overrides = {}) => {
  const base = getStrategy(baseStrategy);
  return { ...base, ...overrides };
};

/**
 * Create a strategy with custom stale and gc times
 * @param {number} staleTime - Stale time in milliseconds
 * @param {number} gcTime - Garbage collection time in milliseconds
 * @param {object} options - Additional options
 * @returns {object} Custom strategy
 */
export const createCustomStrategy = (staleTime, gcTime, options = {}) => {
  return {
    ...CACHE_STRATEGY.STANDARD,
    staleTime,
    gcTime,
    ...options,
  };
};

/**
 * Get strategy based on data criticality level
 * @param {'critical' | 'high' | 'medium' | 'low' | 'static'} level
 * @returns {object} Appropriate cache strategy
 */
export const getStrategyByPriority = (level) => {
  const mapping = {
    critical: CACHE_STRATEGY.CRITICAL,
    high: CACHE_STRATEGY.REAL_TIME,
    medium: CACHE_STRATEGY.STANDARD,
    low: CACHE_STRATEGY.CACHED,
    static: CACHE_STRATEGY.STATIC,
  };
  return { ...(mapping[level] || CACHE_STRATEGY.STANDARD) };
};

/**
 * Check if caching is enabled globally
 * @returns {boolean}
 */
export const isCacheEnabled = () => CACHE_CONFIG.enabled;

/**
 * Get a disabled cache strategy (for when caching is disabled)
 * @returns {object}
 */
export const getDisabledStrategy = () => ({
  staleTime: 0,
  gcTime: 0,
  refetchOnMount: 'always',
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  retry: RETRY_CONFIG.MINIMAL,
});

export default CACHE_STRATEGY;
