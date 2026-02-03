/**
 * React Query Cache System
 *
 * Comprehensive session-based caching system for React Query.
 * Provides fine-grained control over caching with .env configuration.
 *
 * @author j2b.market
 * @version 1.0.0
 *
 * @example
 * // Basic usage
 * import { useApiQuery, useApiMutation, STALE_TIME, GC_TIME } from '@/Libs/reactQuery';
 *
 * // Query with automatic strategy detection
 * const { data } = useApiQuery({
 *   endpoint: '/products',
 *   queryKey: ['products'],
 * });
 *
 * // Critical query (always fresh)
 * const { data: cart } = useApiQuery({
 *   endpoint: '/cart',
 *   queryKey: ['cart'],
 *   critical: true,
 * });
 *
 * // Mutation with cache invalidation
 * const { mutate } = useApiMutation({
 *   endpoint: '/cart/add',
 *   invalidateKeys: [['cart']],
 * });
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

export { CACHE_CONFIG, TIME, ENDPOINT_POLICIES, getEndpointPolicy } from './config';

// ============================================================================
// CACHE STRATEGIES
// ============================================================================

export {
  STALE_TIME,
  GC_TIME,
  RETRY_CONFIG,
  RETRY_DELAY,
  CACHE_STRATEGY,
  getStrategy,
  getStrategyForEndpoint,
  extendStrategy,
  createCustomStrategy,
  getStrategyByPriority,
  isCacheEnabled,
  getDisabledStrategy,
} from './cacheStrategies';

// ============================================================================
// QUERY CLIENT
// ============================================================================

export {
  createQueryClient,
  getQueryClient,
  resetQueryClient,
  clearCacheOnLogout,
  queryClientConfig,
} from './queryClientFactory';

// ============================================================================
// QUERY HOOKS
// ============================================================================

export {
  useApiQuery,
  useApiInfiniteQuery,
  useCriticalQuery,
  useSessionQuery,
  useStaticQuery,
  useUserDataQuery,
  useRealTimeQuery,
} from './hooks/useQuery';

// ============================================================================
// MUTATION HOOKS
// ============================================================================

export {
  useApiMutation,
  useFileUpload,
  useCreate,
  useUpdate,
  useDelete,
  useBatchMutation,
} from './hooks/useMutation';

// ============================================================================
// CACHE UTILITIES
// ============================================================================

export {
  useCacheControl,
  createCacheUtils,
  INVALIDATION_PATTERNS,
  useInvalidatePatterns,
} from './cacheUtils';

// ============================================================================
// RE-EXPORT REACT QUERY UTILITIES
// ============================================================================

export {
  useQueryClient,
  useIsFetching,
  useIsMutating,
  keepPreviousData,
  QueryClientProvider,
} from '@tanstack/react-query';
