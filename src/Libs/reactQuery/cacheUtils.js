/**
 * React Query Cache Utilities
 *
 * Provides manual cache control, prefetching, and cache management
 * utilities for fine-grained control over the query cache.
 *
 * @author j2b.market
 * @version 1.0.0
 */

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import ApiCaller from '../axiosEndpoint';
import { getApiUrl } from '../utils/apiutils/apiutils';
import { CACHE_STRATEGY, getStrategy } from './cacheStrategies';

// ============================================================================
// CACHE CONTROL HOOK
// ============================================================================

/**
 * Hook for manual cache control operations
 *
 * @returns {Object} Cache control methods
 *
 * @example
 * const cache = useCacheControl();
 *
 * // Invalidate specific query
 * cache.invalidate(['products']);
 *
 * // Invalidate all queries matching prefix
 * cache.invalidatePrefix('product');
 *
 * // Clear entire cache on logout
 * cache.clearAll();
 *
 * // Prefetch data
 * await cache.prefetch({
 *   queryKey: ['products'],
 *   endpoint: '/products',
 * });
 */
export function useCacheControl() {
  const queryClient = useQueryClient();

  // ============================================================================
  // INVALIDATION METHODS
  // ============================================================================

  /**
   * Invalidate specific query by key
   * @param {Array} queryKey - Query key to invalidate
   * @param {Object} options - Invalidation options
   */
  const invalidate = useCallback(
    (queryKey, options = {}) => {
      return queryClient.invalidateQueries({
        queryKey,
        ...options,
      });
    },
    [queryClient]
  );

  /**
   * Invalidate all queries matching a prefix
   * @param {string} prefix - Query key prefix
   */
  const invalidatePrefix = useCallback(
    (prefix) => {
      return queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          if (Array.isArray(key) && typeof key[0] === 'string') {
            return key[0].startsWith(prefix);
          }
          return false;
        },
      });
    },
    [queryClient]
  );

  /**
   * Invalidate multiple queries
   * @param {Array} queryKeys - Array of query keys
   */
  const invalidateMultiple = useCallback(
    (queryKeys) => {
      return Promise.all(
        queryKeys.map((key) =>
          queryClient.invalidateQueries({
            queryKey: Array.isArray(key) ? key : [key],
          })
        )
      );
    },
    [queryClient]
  );

  /**
   * Invalidate all queries
   */
  const invalidateAll = useCallback(() => {
    return queryClient.invalidateQueries();
  }, [queryClient]);

  // ============================================================================
  // REMOVAL METHODS
  // ============================================================================

  /**
   * Remove specific query from cache
   * @param {Array} queryKey - Query key to remove
   */
  const remove = useCallback(
    (queryKey) => {
      return queryClient.removeQueries({ queryKey });
    },
    [queryClient]
  );

  /**
   * Remove queries matching a prefix
   * @param {string} prefix - Query key prefix
   */
  const removePrefix = useCallback(
    (prefix) => {
      return queryClient.removeQueries({
        predicate: (query) => {
          const key = query.queryKey;
          if (Array.isArray(key) && typeof key[0] === 'string') {
            return key[0].startsWith(prefix);
          }
          return false;
        },
      });
    },
    [queryClient]
  );

  /**
   * Clear entire cache
   */
  const clearAll = useCallback(() => {
    return queryClient.clear();
  }, [queryClient]);

  // ============================================================================
  // DATA ACCESS METHODS
  // ============================================================================

  /**
   * Get cached data for a query
   * @param {Array} queryKey - Query key
   * @returns {*} Cached data or undefined
   */
  const getData = useCallback(
    (queryKey) => {
      return queryClient.getQueryData(queryKey);
    },
    [queryClient]
  );

  /**
   * Set data in cache manually
   * @param {Array} queryKey - Query key
   * @param {*} data - Data to cache
   * @param {Object} options - Set options
   */
  const setData = useCallback(
    (queryKey, data, options = {}) => {
      return queryClient.setQueryData(queryKey, data, options);
    },
    [queryClient]
  );

  /**
   * Update cached data using an updater function
   * @param {Array} queryKey - Query key
   * @param {Function} updater - (oldData) => newData
   */
  const updateData = useCallback(
    (queryKey, updater) => {
      return queryClient.setQueryData(queryKey, updater);
    },
    [queryClient]
  );

  /**
   * Get query state
   * @param {Array} queryKey - Query key
   * @returns {Object} Query state
   */
  const getState = useCallback(
    (queryKey) => {
      return queryClient.getQueryState(queryKey);
    },
    [queryClient]
  );

  // ============================================================================
  // PREFETCH METHODS
  // ============================================================================

  /**
   * Prefetch query data
   * @param {Object} options - Prefetch options
   * @param {Array} options.queryKey - Query key
   * @param {string} options.endpoint - API endpoint
   * @param {string} options.url - Full URL (alternative to endpoint)
   * @param {string} options.method - HTTP method
   * @param {Object} options.params - Query params
   * @param {string} options.strategy - Cache strategy
   */
  const prefetch = useCallback(
    async ({ queryKey, endpoint, url, method = 'get', params, strategy = 'STANDARD' }) => {
      const finalUrl = url || (endpoint ? getApiUrl(endpoint) : null);
      const cacheConfig = getStrategy(strategy);

      return queryClient.prefetchQuery({
        queryKey,
        queryFn: async () => {
          const response = await ApiCaller.request({
            url: finalUrl,
            method,
            params,
            withCredentials: false,
          });
          return response.data?.data || response.data;
        },
        staleTime: cacheConfig.staleTime,
        gcTime: cacheConfig.gcTime,
      });
    },
    [queryClient]
  );

  /**
   * Prefetch multiple queries in parallel
   * @param {Array} queries - Array of prefetch options
   */
  const prefetchMultiple = useCallback(
    (queries) => {
      return Promise.all(queries.map((q) => prefetch(q)));
    },
    [prefetch]
  );

  // ============================================================================
  // REFETCH METHODS
  // ============================================================================

  /**
   * Refetch specific query
   * @param {Array} queryKey - Query key
   */
  const refetch = useCallback(
    (queryKey) => {
      return queryClient.refetchQueries({ queryKey });
    },
    [queryClient]
  );

  /**
   * Refetch all queries
   */
  const refetchAll = useCallback(() => {
    return queryClient.refetchQueries();
  }, [queryClient]);

  /**
   * Refetch all active queries
   */
  const refetchActive = useCallback(() => {
    return queryClient.refetchQueries({ type: 'active' });
  }, [queryClient]);

  // ============================================================================
  // CANCEL METHODS
  // ============================================================================

  /**
   * Cancel ongoing query
   * @param {Array} queryKey - Query key
   */
  const cancel = useCallback(
    (queryKey) => {
      return queryClient.cancelQueries({ queryKey });
    },
    [queryClient]
  );

  /**
   * Cancel all ongoing queries
   */
  const cancelAll = useCallback(() => {
    return queryClient.cancelQueries();
  }, [queryClient]);

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Check if query is fetching
   * @param {Array} queryKey - Query key
   * @returns {boolean}
   */
  const isFetching = useCallback(
    (queryKey) => {
      const state = queryClient.getQueryState(queryKey);
      return state?.fetchStatus === 'fetching';
    },
    [queryClient]
  );

  /**
   * Check if query data is stale
   * @param {Array} queryKey - Query key
   * @returns {boolean}
   */
  const isStale = useCallback(
    (queryKey) => {
      const state = queryClient.getQueryState(queryKey);
      return state?.isStale ?? true;
    },
    [queryClient]
  );

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  const getStats = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();

    return {
      totalQueries: queries.length,
      activeQueries: queries.filter((q) => q.getObserversCount() > 0).length,
      staleQueries: queries.filter((q) => q.isStale()).length,
      fetchingQueries: queries.filter((q) => q.state.fetchStatus === 'fetching').length,
      errorQueries: queries.filter((q) => q.state.status === 'error').length,
    };
  }, [queryClient]);

  return useMemo(
    () => ({
      // Invalidation
      invalidate,
      invalidatePrefix,
      invalidateMultiple,
      invalidateAll,

      // Removal
      remove,
      removePrefix,
      clearAll,

      // Data access
      getData,
      setData,
      updateData,
      getState,

      // Prefetch
      prefetch,
      prefetchMultiple,

      // Refetch
      refetch,
      refetchAll,
      refetchActive,

      // Cancel
      cancel,
      cancelAll,

      // Utilities
      isFetching,
      isStale,
      getStats,

      // Direct access to query client
      queryClient,
    }),
    [
      invalidate,
      invalidatePrefix,
      invalidateMultiple,
      invalidateAll,
      remove,
      removePrefix,
      clearAll,
      getData,
      setData,
      updateData,
      getState,
      prefetch,
      prefetchMultiple,
      refetch,
      refetchAll,
      refetchActive,
      cancel,
      cancelAll,
      isFetching,
      isStale,
      getStats,
      queryClient,
    ]
  );
}

// ============================================================================
// STANDALONE CACHE UTILITIES (for use outside React components)
// ============================================================================

/**
 * Create cache utilities for use outside React components
 * @param {QueryClient} queryClient - Query client instance
 * @returns {Object} Cache utility functions
 */
export function createCacheUtils(queryClient) {
  return {
    invalidate: (queryKey) => queryClient.invalidateQueries({ queryKey }),
    remove: (queryKey) => queryClient.removeQueries({ queryKey }),
    clearAll: () => queryClient.clear(),
    getData: (queryKey) => queryClient.getQueryData(queryKey),
    setData: (queryKey, data) => queryClient.setQueryData(queryKey, data),
    prefetch: async ({ queryKey, queryFn, staleTime, gcTime }) => {
      return queryClient.prefetchQuery({ queryKey, queryFn, staleTime, gcTime });
    },
    refetch: (queryKey) => queryClient.refetchQueries({ queryKey }),
    cancel: (queryKey) => queryClient.cancelQueries({ queryKey }),
  };
}

// ============================================================================
// PREDEFINED INVALIDATION HELPERS
// ============================================================================

/**
 * Common invalidation patterns
 */
export const INVALIDATION_PATTERNS = {
  /** Invalidate all cart-related queries */
  CART: ['cart'],

  /** Invalidate all product-related queries */
  PRODUCTS: ['products'],

  /** Invalidate all user-related queries */
  USER: ['user'],

  /** Invalidate all order-related queries */
  ORDERS: ['orders'],

  /** Invalidate all notification-related queries */
  NOTIFICATIONS: ['notifications'],

  /** Invalidate all category-related queries */
  CATEGORIES: ['categories'],

  /** Invalidate all brand-related queries */
  BRANDS: ['brands'],

  /** Invalidate bootstrap/config data */
  BOOTSTRAP: ['bootstrap'],
};

/**
 * Hook to invalidate common patterns
 */
export function useInvalidatePatterns() {
  const { invalidate } = useCacheControl();

  return useMemo(
    () => ({
      invalidateCart: () => invalidate(INVALIDATION_PATTERNS.CART),
      invalidateProducts: () => invalidate(INVALIDATION_PATTERNS.PRODUCTS),
      invalidateUser: () => invalidate(INVALIDATION_PATTERNS.USER),
      invalidateOrders: () => invalidate(INVALIDATION_PATTERNS.ORDERS),
      invalidateNotifications: () => invalidate(INVALIDATION_PATTERNS.NOTIFICATIONS),
      invalidateCategories: () => invalidate(INVALIDATION_PATTERNS.CATEGORIES),
      invalidateBrands: () => invalidate(INVALIDATION_PATTERNS.BRANDS),
      invalidateBootstrap: () => invalidate(INVALIDATION_PATTERNS.BOOTSTRAP),
    }),
    [invalidate]
  );
}

export default useCacheControl;
