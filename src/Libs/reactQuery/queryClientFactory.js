/**
 * React Query Client Factory
 *
 * Creates and configures the QueryClient with optimal defaults,
 * global error handling, and integration with the application.
 *
 * @author j2b.market
 * @version 1.0.0
 */

import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { notifications } from '@mantine/notifications';
import { CACHE_STRATEGY, RETRY_DELAY, RETRY_CONFIG } from './cacheStrategies';

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Global error handler for queries
 * @param {Error} error - The error object
 * @param {object} query - The query object
 */
const handleQueryError = (error, query) => {
  // Skip notification for 401 (auth) – only show relogin modal, no toast
  const status = error?.response?.status;
  const message = typeof error?.message === 'string' ? error.message : String(error?.message || '');
  const bodyMessage = error?.response?.data?.message || '';
  if (status === 401 || message.includes('401') || message.toLowerCase().includes('unauthorized') || String(bodyMessage).toLowerCase().includes('unauthorized')) {
    return;
  }

  if (error?.response?.status === 404) {
    // 404 errors might be expected in some cases
    console.warn(`Resource not found: ${query.queryKey}`);
    return;
  }

  // Don't show "خطا در دریافت اطلاعات" for user-initial-data when token is invalid/expired
  const queryKeyFirst = Array.isArray(query.queryKey) ? query.queryKey[0] : query.queryKey;
  if (queryKeyFirst === 'userInitialData') {
    return;
  }

  // When user is not logged in, don't show error notifications (avoids repeated "خطا در دریافت اطلاعات" / 500 toasts)
  try {
    if (typeof window !== 'undefined' && !window.localStorage.getItem('user')) {
      return;
    }
  } catch (_) {}

  // Log error for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('Query Error:', {
      queryKey: query.queryKey,
      error: error.message,
      status: error?.response?.status,
    });
  }

  // Show notification for unexpected errors (can be disabled per-query)
  if (query.meta?.showErrorNotification !== false) {
    const message = error?.response?.data?.message || error.message || 'خطایی رخ داده است';

    notifications.show({
      title: 'خطا در دریافت اطلاعات',
      message,
      color: 'red',
      autoClose: 5000,
    });
  }
};

/**
 * Global error handler for mutations
 * @param {Error} error - The error object
 * @param {*} variables - The mutation variables
 * @param {*} context - The mutation context
 * @param {object} mutation - The mutation object
 */
const handleMutationError = (error, variables, context, mutation) => {
  // Skip notification for 401 (auth) – only show relogin modal, no toast
  const status = error?.response?.status;
  const message = typeof error?.message === 'string' ? error.message : String(error?.message || '');
  if (status === 401 || message.includes('401') || message.toLowerCase().includes('unauthorized')) {
    return;
  }

  // Log error for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('Mutation Error:', {
      mutationKey: mutation.options.mutationKey,
      error: error.message,
      variables,
    });
  }

  // Show notification for unexpected errors (can be disabled per-mutation)
  if (mutation.meta?.showErrorNotification !== false) {
    const message = error?.response?.data?.message || error.message || 'خطایی رخ داده است';

    notifications.show({
      title: 'خطا در انجام عملیات',
      message,
      color: 'red',
      autoClose: 5000,
    });
  }
};

// ============================================================================
// SUCCESS HANDLING
// ============================================================================

/**
 * Global success handler for mutations (optional notifications)
 * @param {*} data - The response data
 * @param {*} variables - The mutation variables
 * @param {*} context - The mutation context
 * @param {object} mutation - The mutation object
 */
const handleMutationSuccess = (data, variables, context, mutation) => {
  // Show success notification if configured
  if (mutation.meta?.showSuccessNotification) {
    const message = mutation.meta.successMessage || data?.message || 'عملیات با موفقیت انجام شد';

    notifications.show({
      title: 'موفقیت',
      message,
      color: 'green',
      autoClose: 3000,
    });
  }
};

// ============================================================================
// QUERY CLIENT CONFIGURATION
// ============================================================================

/** Never retry on 401 so first 401 shows relogin modal immediately without request flood */
const defaultRetry = (failureCount, error) => {
  if (error?.response?.status === 401) return false;
  const max = typeof CACHE_STRATEGY.STANDARD.retry === 'number' ? CACHE_STRATEGY.STANDARD.retry : 3;
  return failureCount < max;
};

/**
 * Default query options
 * These can be overridden per-query
 */
const defaultQueryOptions = {
  // Use STANDARD strategy as default
  ...CACHE_STRATEGY.STANDARD,

  // Never retry on 401 – show relogin modal on first 401, avoid excessive refetches
  retry: defaultRetry,

  // Network mode: 'online' | 'always' | 'offlineFirst'
  networkMode: 'online',

  // Placeholder data settings
  placeholderData: undefined,

  // Error handling
  throwOnError: false,

  // Structure sharing for performance (keep enabled)
  structuralSharing: true,

  // Request deduplication: React Query automatically deduplicates requests
  // with the same queryKey that are made within a short time window
  // This prevents duplicate API calls when multiple components mount simultaneously
  // or when React StrictMode causes double renders in development
};

/**
 * Default mutation options
 */
const defaultMutationOptions = {
  retry: RETRY_CONFIG.MINIMAL,
  retryDelay: RETRY_DELAY.LINEAR,
  networkMode: 'online',
  throwOnError: false,
};

/**
 * Create a configured QueryClient instance
 * @param {object} options - Custom configuration options
 * @returns {QueryClient} Configured QueryClient instance
 */
export const createQueryClient = (options = {}) => {
  const {
    enableDevtools = process.env.NODE_ENV === 'development',
    enableErrorNotifications = true,
    customQueryDefaults = {},
    customMutationDefaults = {},
    onQueryError,
    onMutationError,
    onMutationSuccess,
  } = options;

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        ...defaultQueryOptions,
        ...customQueryDefaults,
      },
      mutations: {
        ...defaultMutationOptions,
        ...customMutationDefaults,
      },
    },
  });

  // Add comprehensive logging for query cache operations in development
  if (process.env.NODE_ENV === 'development') {
    // Log when queries are added to cache
    queryClient.getQueryCache().subscribe((event) => {
      if (event?.type === 'updated') {
        const query = event.query;
        const cacheAge = query.state.dataUpdatedAt ? Date.now() - query.state.dataUpdatedAt : null;
        const cacheAgeSeconds = cacheAge ? Math.floor(cacheAge / 1000) : null;
        
        console.log(`[QueryClient] 📦 Cache Event (${event.type}):`, {
          queryKey: query.queryKey,
          status: query.state.status,
          fetchStatus: query.state.fetchStatus,
          hasData: !!query.state.data,
          isStale: query.isStale(),
          cacheAge: cacheAgeSeconds ? `${cacheAgeSeconds}s` : 'N/A',
          staleTime: query.options.staleTime ? `${query.options.staleTime / 1000}s` : 'N/A',
        });
      } else if (event?.type === 'added') {
        console.log(`[QueryClient] ➕ Query Added to Cache:`, {
          queryKey: event.query.queryKey,
          staleTime: event.query.options.staleTime ? `${event.query.options.staleTime / 1000}s` : 'N/A',
        });
      }
    });
  }

  // Set up global query cache callbacks
  queryClient.getQueryCache().config.onError = (error, query) => {
    const status = error?.response?.status;
    const errorMessage =
      typeof error === 'string'
        ? error
        : error?.message || String(error);

    if (status === 401 || errorMessage.includes('401')) {
      // Show global relogin modal; do NOT invalidate queries (would refetch with same bad token and cause many duplicate 401 requests)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:401'));
      }
      if (process.env.NODE_ENV === 'development') {
        console.log('[QueryClient] 🔒 401 detected on', query.queryKey, '- auth:401 dispatched (no invalidation to avoid request flood)');
      }
    }

    if (enableErrorNotifications) {
      handleQueryError(error, query);
    }
    onQueryError?.(error, query);
  };

  // Set up global mutation cache callbacks
  queryClient.getMutationCache().config.onError = (error, variables, context, mutation) => {
    const status = error?.response?.status;
    const msg = typeof error?.message === 'string' ? error.message : String(error?.message || '');
    if (status === 401 || msg.includes('401') || msg.toLowerCase().includes('unauthorized')) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:401'));
      }
    }
    if (enableErrorNotifications) {
      handleMutationError(error, variables, context, mutation);
    }
    onMutationError?.(error, variables, context, mutation);
  };

  queryClient.getMutationCache().config.onSuccess = (data, variables, context, mutation) => {
    handleMutationSuccess(data, variables, context, mutation);
    onMutationSuccess?.(data, variables, context, mutation);
  };

  return queryClient;
};

// ============================================================================
// PERSISTENCE (localStorage)
// ============================================================================

const PERSISTENCE_STORAGE_KEY = 'j2b.reactQuery.cache.v1';
const PERSISTENCE_MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes

let persistenceSetupDone = false;

/**
 * Enable React Query persistence so cache survives full page refresh.
 * Runs only in the browser and only once per app load.
 *
 * Note: We keep maxAge aligned to the "no refetch within 5 minutes" requirement.
 */
const setupQueryClientPersistence = (queryClient) => {
  if (persistenceSetupDone) return;
  persistenceSetupDone = true;

  if (typeof window === 'undefined') return;
  if (!window?.localStorage) return;

  try {
    const persister = createSyncStoragePersister({
      storage: window.localStorage,
      key: PERSISTENCE_STORAGE_KEY,
    });

    persistQueryClient({
      queryClient,
      persister,
      maxAge: PERSISTENCE_MAX_AGE_MS,
      dehydrateOptions: {
        shouldDehydrateQuery: (query) =>
          query.state.status === 'success' && query.queryKey?.length > 0,
      },
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[QueryClient] 💾 Persistence enabled (localStorage, maxAge=${Math.floor(
          PERSISTENCE_MAX_AGE_MS / 1000
        )}s)`
      );
    }
  } catch (err) {
    // localStorage can throw (quota exceeded, blocked, etc.)
    if (process.env.NODE_ENV === 'development') {
      console.warn('[QueryClient] Persistence setup failed:', err);
    }
  }
};

// ============================================================================
// QUERY CLIENT INSTANCE (Singleton)
// ============================================================================

let queryClientInstance = null;

/**
 * Get or create the singleton QueryClient instance
 * @param {object} options - Configuration options (only used on first call)
 * @returns {QueryClient} The QueryClient instance
 */
export const getQueryClient = (options = {}) => {
  if (!queryClientInstance) {
    queryClientInstance = createQueryClient(options);
    setupQueryClientPersistence(queryClientInstance);
  }
  return queryClientInstance;
};

/**
 * Reset the QueryClient instance (useful for testing or logout)
 */
export const resetQueryClient = () => {
  if (queryClientInstance) {
    queryClientInstance.clear();
    queryClientInstance = null;
  }

  // Also clear persisted cache so a logout/test reset is truly clean.
  if (typeof window !== 'undefined' && window?.localStorage) {
    try {
      window.localStorage.removeItem(PERSISTENCE_STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
  }

  persistenceSetupDone = false;
};

/**
 * Clear all React Query cache and persisted cache (for logout).
 * Call this with the current queryClient (e.g. from useQueryClient()) so that
 * no user-specific data remains in memory or localStorage.
 * @param {QueryClient} queryClient - The active QueryClient instance
 */
export const clearCacheOnLogout = (queryClient) => {
  if (queryClient) {
    queryClient.clear();
  }
  if (typeof window !== 'undefined' && window?.localStorage) {
    try {
      window.localStorage.removeItem(PERSISTENCE_STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
  }
};

// ============================================================================
// QUERY CLIENT CONFIGURATION EXPORT
// ============================================================================

/**
 * Export configuration object for backward compatibility
 * Can be used with: new QueryClient(queryClientConfig)
 */
export const queryClientConfig = {
  defaultOptions: {
    queries: defaultQueryOptions,
    mutations: defaultMutationOptions,
  },
};

export default getQueryClient;
