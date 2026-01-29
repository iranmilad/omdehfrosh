/**
 * Enhanced React Query Hooks
 *
 * Comprehensive hooks for data fetching with cache strategies,
 * Redux integration support, and full control over caching behavior.
 *
 * @author j2b.market
 * @version 1.0.0
 */

import { useQuery, useInfiniteQuery, keepPreviousData, useQueryClient } from '@tanstack/react-query';
import ApiCaller from '../../axiosEndpoint';
import { CACHE_STRATEGY, getStrategy, STALE_TIME, GC_TIME } from '../cacheStrategies';

// ============================================================================
// RESPONSE TRANSFORMER
// ============================================================================

/**
 * Default response transformer
 * Unwraps the data from standard API response format
 * Axios response: { data: { message: "ok", data: [...] }, status: 200, ... }
 */
const defaultTransformer = (response) => {
  // Debug in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[useApiQuery] Full Response:', response);
    console.log('[useApiQuery] Response Data:', response?.data);
  }

  // Handle null/undefined response
  if (!response) {
    console.warn('[useApiQuery] Empty response received');
    return null;
  }

  // API returns { message: "ok", data: [...] }
  // Axios wraps it in response.data
  const apiResponse = response?.data;

  // Handle null/undefined apiResponse
  if (!apiResponse) {
    console.warn('[useApiQuery] Empty apiResponse:', response);
    return null;
  }

  // If API response has a data property, return it
  if (apiResponse?.data !== undefined) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[useApiQuery] Extracted data:', apiResponse.data);
    }
    return apiResponse.data;
  }

  // Otherwise return the whole API response
  if (process.env.NODE_ENV === 'development') {
    console.log('[useApiQuery] Returning full apiResponse:', apiResponse);
  }
  return apiResponse;
};

// ============================================================================
// useApiQuery - Main Data Fetching Hook
// ============================================================================

/**
 * Enhanced data fetching hook with comprehensive caching support
 *
 * @param {Object} options - Hook configuration
 * @param {string} options.endpoint - API endpoint (without base URL)
 * @param {string} options.url - Full URL (alternative to endpoint)
 * @param {Array} options.queryKey - React Query cache key
 * @param {string} options.method - HTTP method (default: 'get')
 * @param {Object} options.params - URL query parameters
 * @param {Object} options.body - Request body (for POST/PUT)
 * @param {Object} options.headers - Custom headers
 * @param {Object} options.axiosConfig - Additional axios configuration
 *
 * @param {string} options.strategy - Predefined cache strategy name
 * @param {boolean} options.critical - Force fresh data (shorthand for CRITICAL strategy)
 * @param {number} options.staleTime - Custom stale time (overrides strategy)
 * @param {number} options.gcTime - Custom gc time (overrides strategy)
 *
 * @param {boolean} options.enabled - Enable/disable the query
 * @param {Function} options.select - Transform/select data from response
 * @param {Function} options.transformer - Custom response transformer
 * @param {boolean} options.keepPrevious - Keep previous data while fetching
 *
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @param {Function} options.onSettled - Settled callback
 *
 * @param {Object} options.meta - Query metadata
 * @param {boolean} options.meta.showErrorNotification - Show error notifications
 *
 * @param {Object} options.queryOptions - Additional React Query options
 *
 * @returns {Object} React Query result with additional helpers
 *
 * @example
 * // Basic usage with endpoint
 * const { data, isLoading } = useApiQuery({
 *   endpoint: '/products',
 *   queryKey: ['products'],
 * });
 *
 * @example
 * // Critical data - always fresh
 * const { data } = useApiQuery({
 *   endpoint: '/cart',
 *   queryKey: ['cart'],
 *   critical: true,
 * });
 *
 * @example
 * // Using predefined strategy
 * const { data } = useApiQuery({
 *   endpoint: '/categories',
 *   queryKey: ['categories'],
 *   strategy: 'STATIC',
 * });
 *
 * @example
 * // Custom cache times
 * const { data } = useApiQuery({
 *   endpoint: '/products',
 *   queryKey: ['products', { category: 'phones' }],
 *   params: { category: 'phones' },
 *   staleTime: STALE_TIME.LONG,
 *   gcTime: GC_TIME.SESSION,
 * });
 */
export function useApiQuery({
  // Request configuration
  endpoint,
  url,
  queryKey,
  method = 'get',
  params,
  body,
  headers,
  axiosConfig = {},

  // Cache strategy
  strategy = 'STANDARD',
  critical = false,
  staleTime: customStaleTime,
  gcTime: customGcTime,

  // Query control
  enabled = true,
  select,
  transformer = defaultTransformer,
  keepPrevious = false,

  // Callbacks
  onSuccess,
  onError,
  onSettled,

  // Metadata
  meta = {},

  // Additional options
  queryOptions = {},
}) {
  // Determine the final URL
  // Use endpoint directly (relative path) - axios baseURL will handle the full URL
  // If full url is provided, use it directly
  const finalUrl = url || endpoint || null;

  if (!finalUrl && enabled) {
    console.warn('useApiQuery: No endpoint or url provided');
  }

  // Determine cache strategy
  let cacheConfig;
  if (critical) {
    cacheConfig = CACHE_STRATEGY.CRITICAL;
  } else {
    cacheConfig = getStrategy(strategy);
  }

  // Apply custom overrides
  const finalStaleTime = customStaleTime ?? cacheConfig.staleTime;
  const finalGcTime = customGcTime ?? cacheConfig.gcTime;

  // Comprehensive logging for query initialization
  if (process.env.NODE_ENV === 'development') {
    console.log(`[useApiQuery] 📋 Query initialized:`, {
      queryKey,
      endpoint: finalUrl,
      strategy,
      critical,
      enabled,
      cacheConfig: {
        staleTime: `${finalStaleTime / 1000}s`,
        gcTime: `${finalGcTime / 1000}s`,
        refetchOnMount: cacheConfig.refetchOnMount,
        refetchOnWindowFocus: cacheConfig.refetchOnWindowFocus,
        refetchOnReconnect: cacheConfig.refetchOnReconnect,
      },
    });
  }

  // Get query client to check cache status
  const queryClient = useQueryClient();
  
  // Build the query
  const query = useQuery({
    queryKey,
    queryFn: async ({ signal, queryKey: qKey, meta }) => {
      // Log when query function is called (means fetching, not using cache)
      const fetchStartTime = Date.now();
      const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      if (process.env.NODE_ENV === 'development') {
        // Check if there's cached data
        const cachedQuery = queryClient.getQueryState(qKey);
        const hasCachedData = !!cachedQuery?.data;
        const cachedDataAge = cachedQuery?.dataUpdatedAt 
          ? Math.floor((Date.now() - cachedQuery.dataUpdatedAt) / 1000) 
          : null;
        
        // Check for active fetches with the same queryKey
        const allQueries = queryClient.getQueryCache().getAll();
        const activeFetches = allQueries.filter(
          q => 
            JSON.stringify(q.queryKey) === JSON.stringify(qKey) && 
            q.state.fetchStatus === 'fetching'
        );
        
        const reason = hasCachedData 
          ? `Cache expired/stale (was ${cachedDataAge}s old, staleTime: ${finalStaleTime / 1000}s) - refreshing` 
          : 'First load - no cache available';
        
        console.log(`%c[useApiQuery] 🌐 ⚠️ API CALL INITIATED`, 
          'color: orange; font-weight: bold; font-size: 14px;',
          {
            requestId,
            queryKey: qKey,
            endpoint: finalUrl,
            timestamp: new Date().toLocaleTimeString(),
            reason,
            hasCachedData,
            cachedDataAge: cachedDataAge !== null ? `${cachedDataAge}s` : 'N/A',
            willShowCachedData: hasCachedData ? 'Yes (showing cached while fetching)' : 'No',
            activeFetches: activeFetches.length,
            staleTime: `${finalStaleTime / 1000}s`,
            warning: activeFetches.length > 1 
              ? `⚠️ WARNING: ${activeFetches.length} active fetches detected! React Query should dedupe these.`
              : hasCachedData 
                ? `Cache expired after ${cachedDataAge}s (staleTime: ${finalStaleTime / 1000}s)`
                : 'First load - cache will be created after this request',
            note: hasCachedData 
              ? 'This is expected - cache expired. After this fetch, cache will be fresh for 5 minutes.'
              : 'After this fetch, cache will prevent API calls for 5 minutes.',
          }
        );
      }
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('[useApiQuery] Making request:', { finalUrl, method, params });
        }

        // Build request config
        const requestConfig = {
          params,
          headers,
          timeout: 30000, // 30 second timeout
          withCredentials: false,
          ...axiosConfig,
        };

        // Add signal only if provided (React Query provides it for cancellation)
        if (signal) {
          requestConfig.signal = signal;
        }

        if (process.env.NODE_ENV === 'development') {
          console.log('[useApiQuery] Request config:', {
            url: finalUrl,
            method: method.toLowerCase(),
            hasSignal: !!signal,
            hasParams: !!params,
            hasBody: !!body,
            baseURL: ApiCaller.defaults?.baseURL,
          });
        }

        // Make the request using axios instance's request method
        // This is more reliable than method-specific calls
        const methodLower = method.toLowerCase();
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[useApiQuery] About to call axios:', {
            url: finalUrl,
            method: methodLower,
            fullUrl: `${ApiCaller.defaults?.baseURL}${finalUrl}`,
          });
        }

        // Use fetch as a workaround for MirageJS passthrough issue with axios
        // MirageJS doesn't properly resolve axios promises when using passthrough
        // but works fine with fetch
        let response;
        try {
          if (process.env.NODE_ENV === 'development') {
            console.log('[useApiQuery] 🔄 Fetching data (cache will be used on subsequent calls within staleTime)...');
          }

          // Build full URL
          const baseURL = ApiCaller.defaults?.baseURL || '';
          const fullUrl = finalUrl.startsWith('http') 
            ? finalUrl 
            : `${baseURL}${finalUrl.startsWith('/') ? '' : '/'}${finalUrl}`;

          // Build query string from params
          let urlWithParams = fullUrl;
          if (params && Object.keys(params).length > 0) {
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                searchParams.append(key, String(value));
              }
            });
            urlWithParams = `${fullUrl}?${searchParams.toString()}`;
          }

          // Get auth token from localStorage (login stores it there)
          // Also check cookies as fallback for compatibility
          let token = null;
          if (typeof window !== 'undefined') {
            // Try localStorage first (where login stores it)
            token = localStorage.getItem("user");
            // Fallback to cookies if not in localStorage
            if (!token) {
              const getCookie = (name) => {
                const value = `; ${document.cookie}`;
                const parts = value.split(`; ${name}=`);
                if (parts.length === 2) return parts.pop().split(';').shift();
                return null;
              };
              token = getCookie("user");
            }
          }
          
          // Build headers properly
          // axios defaults.headers has structure: { common: {...}, get: {...}, post: {...} }
          // We need to extract the actual headers, not the method objects
          const axiosDefaults = ApiCaller.defaults?.headers || {};
          const commonHeaders = axiosDefaults.common || {};
          const methodHeaders = axiosDefaults[methodLower] || {};
          
          // Build headers (include Authorization if token exists)
          const fetchHeaders = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...commonHeaders,
            ...methodHeaders,
            ...headers,
          };
          
          if (token && token !== 'undefined') {
            fetchHeaders['Authorization'] = `Bearer ${token}`;
          }
          
          // Remove any undefined values
          Object.keys(fetchHeaders).forEach(key => {
            if (fetchHeaders[key] === undefined || typeof fetchHeaders[key] === 'object') {
              delete fetchHeaders[key];
            }
          });

          // Use fetch instead of axios to work around MirageJS issue
          const fetchResponse = await fetch(urlWithParams, {
            method: methodLower.toUpperCase(),
            headers: fetchHeaders,
            body: body ? JSON.stringify(body) : undefined,
            signal,
            credentials: 'omit',
          });

          if (!fetchResponse.ok) {
            throw new Error(`HTTP error! status: ${fetchResponse.status}`);
          }

          const responseData = await fetchResponse.json();

          // Transform fetch response to axios-like response format
          response = {
            data: responseData,
            status: fetchResponse.status,
            statusText: fetchResponse.statusText,
            headers: fetchResponse.headers,
            config: {
              url: finalUrl,
              method: methodLower,
            },
          };

          const fetchDuration = Date.now() - fetchStartTime;
          if (process.env.NODE_ENV === 'development') {
            console.log('[useApiQuery] ✅ API Request SUCCESS:', {
              requestId: typeof requestId !== 'undefined' ? requestId : 'N/A',
              queryKey: qKey,
              endpoint: finalUrl,
              status: response?.status,
              statusText: response?.statusText,
              fetchDuration: `${fetchDuration}ms`,
              cacheDuration: `${finalStaleTime / 1000}s`,
              dataSize: response?.data ? JSON.stringify(response.data).length : 0,
              hasData: !!response?.data,
              dataType: typeof response?.data,
              note: 'If server logs show duplicate calls, check if requestId appears twice or if there are multiple queryKeys',
              dataKeys: response?.data && typeof response.data === 'object' ? Object.keys(response.data) : null,
              timestamp: new Date().toLocaleTimeString(),
            });
          }
        } catch (axiosError) {
          const fetchDuration = Date.now() - fetchStartTime;
          if (process.env.NODE_ENV === 'development') {
            console.error('[useApiQuery] ❌ API Request FAILED:', {
              queryKey: qKey,
              endpoint: finalUrl,
              fetchDuration: `${fetchDuration}ms`,
              error: {
                message: axiosError?.message,
                code: axiosError?.code,
                response: axiosError?.response ? {
                  status: axiosError.response.status,
                  statusText: axiosError.response.statusText,
                  data: axiosError.response.data,
                } : null,
                request: axiosError?.request ? 'Request object exists' : null,
              },
              timestamp: new Date().toLocaleTimeString(),
            });
          }
          throw axiosError;
        }

        const transformed = transformer(response);
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[useApiQuery] 🔄 Data transformed:', {
            queryKey: qKey,
            originalDataType: typeof response?.data,
            transformedDataType: typeof transformed,
            transformedIsArray: Array.isArray(transformed),
            transformedLength: Array.isArray(transformed) ? transformed.length : 'N/A',
          });
        }

        return transformed;
      } catch (error) {
        const fetchDuration = Date.now() - fetchStartTime;
        if (process.env.NODE_ENV === 'development') {
          console.error('[useApiQuery] ❌ Query function ERROR:', {
            queryKey: qKey,
            endpoint: finalUrl,
            fetchDuration: `${fetchDuration}ms`,
            error: {
              message: error?.message,
              name: error?.name,
              response: error?.response,
              request: error?.request,
              config: error?.config,
              stack: error?.stack,
            },
            timestamp: new Date().toLocaleTimeString(),
          });
        }
        throw error;
      }
    },
    enabled: enabled && !!finalUrl,
    staleTime: finalStaleTime,
    gcTime: finalGcTime,
    refetchOnMount: cacheConfig.refetchOnMount,
    refetchOnWindowFocus: cacheConfig.refetchOnWindowFocus,
    refetchOnReconnect: cacheConfig.refetchOnReconnect,
    retry: cacheConfig.retry,
    retryDelay: cacheConfig.retryDelay,
    networkMode: cacheConfig.networkMode,
    placeholderData: keepPrevious ? keepPreviousData : undefined,
    select,
    meta: {
      showErrorNotification: true,
      ...meta,
    },
    ...queryOptions,
  });

  // Comprehensive cache status logging with useMemo to avoid recalculating on every render
  if (process.env.NODE_ENV === 'development') {
    // Use a ref to track last log time to avoid spam
    const cacheInfo = (() => {
      const dataUpdatedAt = query.dataUpdatedAt;
      const cacheAge = dataUpdatedAt ? Date.now() - dataUpdatedAt : null;
      const cacheAgeSeconds = cacheAge !== null ? Math.floor(cacheAge / 1000) : null;
      const isFresh = cacheAge !== null ? cacheAge < finalStaleTime : false;
      const timeUntilStale = cacheAge !== null && finalStaleTime > cacheAge 
        ? Math.floor((finalStaleTime - cacheAge) / 1000) 
        : null;

      return {
        cacheAge,
        cacheAgeSeconds,
        isFresh,
        timeUntilStale,
        dataUpdatedAt,
      };
    })();

    // Log when using cached data (not fetching, has data)
    if (query.data && !query.isFetching && !query.isLoading && query.status === 'success') {
      const cacheAgeSeconds = cacheInfo.cacheAgeSeconds !== null ? cacheInfo.cacheAgeSeconds : 0;
      const isUsingCache = cacheAgeSeconds > 0;
      const timeUntilStale = cacheInfo.timeUntilStale !== null ? cacheInfo.timeUntilStale : 0;
      
      if (isUsingCache) {
        // Using cached data - NO API CALL!
        console.log(`%c[useApiQuery] 💾 ✅ USING CACHE - NO API CALL!`, 
          'color: green; font-weight: bold; font-size: 14px;', 
          {
            queryKey,
            endpoint: finalUrl,
            source: '✅ CACHE (no network request)',
            cacheAge: `${cacheAgeSeconds}s old`,
            freshness: cacheInfo.isFresh ? '✅ Fresh' : '⚠️ Stale',
            timeUntilStale: `${timeUntilStale}s remaining before stale`,
            staleTime: `${finalStaleTime / 1000}s`,
            dataUpdatedAt: cacheInfo.dataUpdatedAt ? new Date(cacheInfo.dataUpdatedAt).toLocaleTimeString() : 'Never',
            isStale: query.isStale,
            fetchStatus: query.fetchStatus,
            status: query.status,
            dataSize: Array.isArray(query.data) ? `${query.data.length} items` : typeof query.data,
            willRefetch: query.isStale ? 'Yes (data is stale)' : `No (data is fresh for ${timeUntilStale}s more)`,
            note: '🎉 Cache is working! No API call made.',
          }
        );
      } else {
        // Just loaded - will use cache next time
        console.log(`%c[useApiQuery] ✅ DATA LOADED - Will use cache for ${finalStaleTime / 1000}s`, 
          'color: blue; font-weight: bold;', 
          {
            queryKey,
            endpoint: finalUrl,
            source: 'Just fetched from API',
            cacheAge: 'Just cached',
            staleTime: `${finalStaleTime / 1000}s`,
            note: `Next time you visit (within ${finalStaleTime / 1000}s), cache will be used - NO API CALL!`,
            warning: '⚠️ Page refresh will clear cache (this is normal - cache is in-memory only)',
          }
        );
      }
    }

    // Log when fetching starts (background refetch)
    if (query.isFetching && !query.isLoading && query.data) {
      console.log(`[useApiQuery] 🔄 BACKGROUND REFETCH (showing cached data):`, {
        queryKey,
        endpoint: finalUrl,
        reason: query.isStale ? 'Data is stale' : 'Manual/automatic refetch',
        currentCacheAge: cacheInfo.cacheAgeSeconds !== null ? `${cacheInfo.cacheAgeSeconds}s` : 'N/A',
        isStale: query.isStale,
      });
    }

    // Log initial loading state
    if (query.status === 'pending' && query.isLoading && !query.data) {
      console.log(`[useApiQuery] ⏳ INITIAL LOADING (no cache available):`, {
        queryKey,
        endpoint: finalUrl,
        hasCachedData: false,
      });
    }

    // Log when refetching while showing cached data
    if (query.status === 'success' && query.data && query.isFetching && query.isLoading === false) {
      console.log(`[useApiQuery] 🔄 REFETCHING (showing cached data while fetching fresh):`, {
        queryKey,
        endpoint: finalUrl,
        hasCachedData: true,
        cacheAge: cacheInfo.cacheAgeSeconds !== null ? `${cacheInfo.cacheAgeSeconds}s` : 'N/A',
      });
    }
  }

  // Enhanced return with additional helpers
  return {
    ...query,
    // Convenience aliases
    loading: query.isLoading,
    fetching: query.isFetching,
    success: query.isSuccess,
    error: query.error,
    // Helper to check if data is fresh
    isFresh: !query.isStale,
    // Helper to get data with fallback
    getData: (fallback = null) => query.data ?? fallback,
  };
}

// ============================================================================
// useApiInfiniteQuery - Infinite/Paginated Data Hook
// ============================================================================

/**
 * Hook for infinite/paginated data fetching
 *
 * @param {Object} options - Same as useApiQuery plus pagination options
 * @param {Function} options.getNextPageParam - Get next page parameter
 * @param {Function} options.getPreviousPageParam - Get previous page parameter
 * @param {number} options.initialPageParam - Initial page parameter
 *
 * @example
 * const { data, fetchNextPage, hasNextPage } = useApiInfiniteQuery({
 *   endpoint: '/products',
 *   queryKey: ['products', 'infinite'],
 *   params: { limit: 20 },
 *   getNextPageParam: (lastPage) => lastPage.nextCursor,
 *   initialPageParam: 0,
 * });
 */
export function useApiInfiniteQuery({
  // Request configuration
  endpoint,
  url,
  queryKey,
  method = 'get',
  params = {},
  body,
  headers,
  axiosConfig = {},

  // Pagination
  getNextPageParam,
  getPreviousPageParam,
  initialPageParam = 1,
  pageParamName = 'page',

  // Cache strategy
  strategy = 'PAGINATED',
  staleTime: customStaleTime,
  gcTime: customGcTime,

  // Query control
  enabled = true,
  select,
  transformer = defaultTransformer,

  // Metadata
  meta = {},

  // Additional options
  queryOptions = {},
}) {
  const finalUrl = url || endpoint || null;
  const cacheConfig = getStrategy(strategy);

  const finalStaleTime = customStaleTime ?? cacheConfig.staleTime;
  const finalGcTime = customGcTime ?? cacheConfig.gcTime;

  return useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam, signal }) => {
      const response = await ApiCaller.request({
        url: finalUrl,
        method,
        params: {
          ...params,
          [pageParamName]: pageParam,
        },
        data: body,
        headers,
        signal,
        withCredentials: false,
        ...axiosConfig,
      });

      return transformer(response);
    },
    enabled: enabled && !!finalUrl,
    initialPageParam,
    getNextPageParam,
    getPreviousPageParam,
    staleTime: finalStaleTime,
    gcTime: finalGcTime,
    refetchOnMount: cacheConfig.refetchOnMount,
    refetchOnWindowFocus: cacheConfig.refetchOnWindowFocus,
    refetchOnReconnect: cacheConfig.refetchOnReconnect,
    select,
    meta: {
      showErrorNotification: true,
      ...meta,
    },
    ...queryOptions,
  });
}

// ============================================================================
// Preset Hooks for Common Use Cases
// ============================================================================

/**
 * Hook for critical data that must always be fresh
 * Use for: Cart, authentication status, real-time stock
 */
export function useCriticalQuery(options) {
  return useApiQuery({
    ...options,
    critical: true,
  });
}

/**
 * Hook for session-level data (fetched once per session)
 * Use for: Bootstrap data, app config, user preferences
 */
export function useSessionQuery(options) {
  return useApiQuery({
    ...options,
    strategy: 'SESSION',
  });
}

/**
 * Hook for static/reference data
 * Use for: Countries, provinces, categories
 */
export function useStaticQuery(options) {
  return useApiQuery({
    ...options,
    strategy: 'STATIC',
  });
}

/**
 * Hook for user-specific data
 * Use for: Profile, addresses, orders
 */
export function useUserDataQuery(options) {
  return useApiQuery({
    ...options,
    strategy: 'USER_DATA',
  });
}

/**
 * Hook for real-time data with frequent updates
 * Use for: Notifications, live updates
 */
export function useRealTimeQuery(options) {
  return useApiQuery({
    ...options,
    strategy: 'REAL_TIME',
  });
}

// ============================================================================
// Export STALE_TIME and GC_TIME for custom configurations
// ============================================================================

export { STALE_TIME, GC_TIME };
