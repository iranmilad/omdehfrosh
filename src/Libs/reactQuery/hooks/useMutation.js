/**
 * Enhanced React Query Mutation Hooks
 *
 * Comprehensive hooks for data mutations with automatic cache invalidation,
 * optimistic updates, and Redux integration support.
 *
 * @author j2b.market
 * @version 1.0.0
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import ApiCaller from '../../axiosEndpoint';
import { getApiUrl } from '../../utils/apiutils/apiutils';
import { RETRY_CONFIG, RETRY_DELAY } from '../cacheStrategies';

// ============================================================================
// RESPONSE TRANSFORMER
// ============================================================================

/**
 * Default response transformer
 */
const defaultTransformer = (response) => {
  if (response?.data?.data !== undefined) {
    return response.data.data;
  }
  if (response?.data !== undefined) {
    return response.data;
  }
  return response;
};

// ============================================================================
// useApiMutation - Main Mutation Hook
// ============================================================================

/**
 * Enhanced mutation hook with cache invalidation and optimistic updates
 *
 * @param {Object} options - Hook configuration
 * @param {string} options.endpoint - API endpoint (without base URL)
 * @param {string} options.url - Full URL (alternative to endpoint)
 * @param {string} options.method - HTTP method (default: 'post')
 * @param {Object} options.params - URL query parameters
 * @param {Object} options.headers - Custom headers
 * @param {Object} options.axiosConfig - Additional axios configuration
 *
 * @param {Array|Array[]} options.invalidateKeys - Query keys to invalidate on success
 * @param {Array|Array[]} options.removeKeys - Query keys to remove from cache on success
 * @param {Object} options.optimisticUpdate - Optimistic update configuration
 * @param {Array} options.optimisticUpdate.queryKey - Query key to update optimistically
 * @param {Function} options.optimisticUpdate.updater - Function to update cache (oldData, variables) => newData
 *
 * @param {Function} options.transformer - Custom response transformer
 * @param {Function} options.onSuccess - Success callback (data, variables, context) => void
 * @param {Function} options.onError - Error callback (error, variables, context) => void
 * @param {Function} options.onSettled - Settled callback (data, error, variables, context) => void
 * @param {Function} options.onMutate - Mutate callback for optimistic updates
 *
 * @param {number} options.retry - Retry count
 * @param {Function} options.retryDelay - Retry delay function
 *
 * @param {Object} options.meta - Mutation metadata
 * @param {boolean} options.meta.showSuccessNotification - Show success notification
 * @param {string} options.meta.successMessage - Custom success message
 * @param {boolean} options.meta.showErrorNotification - Show error notification
 *
 * @param {Object} options.mutationOptions - Additional React Query options
 *
 * @returns {Object} React Query mutation result with additional helpers
 *
 * @example
 * // Basic mutation
 * const { mutate, isLoading } = useApiMutation({
 *   endpoint: '/products',
 *   method: 'post',
 *   invalidateKeys: [['products']],
 * });
 *
 * @example
 * // With optimistic update
 * const { mutate } = useApiMutation({
 *   endpoint: '/cart/add',
 *   method: 'post',
 *   invalidateKeys: [['cart']],
 *   optimisticUpdate: {
 *     queryKey: ['cart'],
 *     updater: (oldCart, newItem) => ({
 *       ...oldCart,
 *       items: [...oldCart.items, newItem],
 *     }),
 *   },
 * });
 *
 * @example
 * // With success notification
 * const { mutate } = useApiMutation({
 *   endpoint: '/products',
 *   method: 'post',
 *   meta: {
 *     showSuccessNotification: true,
 *     successMessage: 'محصول با موفقیت اضافه شد',
 *   },
 * });
 */
export function useApiMutation({
  // Request configuration
  endpoint,
  url,
  method = 'post',
  params,
  headers,
  axiosConfig = {},

  // Cache management
  invalidateKeys = [],
  removeKeys = [],
  optimisticUpdate,

  // Transformation
  transformer = defaultTransformer,

  // Callbacks
  onSuccess,
  onError,
  onSettled,
  onMutate,

  // Retry configuration
  retry = RETRY_CONFIG.MINIMAL,
  retryDelay = RETRY_DELAY.LINEAR,

  // Metadata
  meta = {},

  // Additional options
  mutationOptions = {},
}) {
  const queryClient = useQueryClient();
  const finalUrl = url || (endpoint ? getApiUrl(endpoint) : null);

  const mutation = useMutation({
    mutationKey: finalUrl ? [finalUrl, method] : undefined,
    mutationFn: async (bodyData) => {
      if (!finalUrl) {
        throw new Error('useApiMutation: No endpoint or url provided');
      }

      const response = await ApiCaller.request({
        url: finalUrl,
        method,
        params,
        data: bodyData,
        headers,
        withCredentials: false,
        ...axiosConfig,
      });

      return transformer(response);
    },
    onMutate: async (variables) => {
      // Call custom onMutate if provided
      const customContext = await onMutate?.(variables);

      // Handle optimistic updates
      if (optimisticUpdate) {
        const { queryKey, updater } = optimisticUpdate;

        // Cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey });

        // Snapshot previous value
        const previousData = queryClient.getQueryData(queryKey);

        // Optimistically update
        if (previousData !== undefined) {
          queryClient.setQueryData(queryKey, (old) => updater(old, variables));
        }

        return { previousData, queryKey, ...customContext };
      }

      return customContext;
    },
    onSuccess: (data, variables, context) => {
      // Invalidate specified queries
      if (invalidateKeys.length > 0) {
        invalidateKeys.forEach((key) => {
          const queryKey = Array.isArray(key) ? key : [key];
          queryClient.invalidateQueries({ queryKey });
        });
      }

      // Remove specified queries from cache
      if (removeKeys.length > 0) {
        removeKeys.forEach((key) => {
          const queryKey = Array.isArray(key) ? key : [key];
          queryClient.removeQueries({ queryKey });
        });
      }

      // Call custom onSuccess
      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousData !== undefined && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }

      // Call custom onError
      onError?.(error, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      // Refetch after optimistic update settles
      if (optimisticUpdate) {
        queryClient.invalidateQueries({ queryKey: optimisticUpdate.queryKey });
      }

      // Call custom onSettled
      onSettled?.(data, error, variables, context);
    },
    retry,
    retryDelay,
    meta: {
      showErrorNotification: true,
      showSuccessNotification: false,
      ...meta,
    },
    ...mutationOptions,
  });

  // Enhanced return with additional helpers
  return {
    ...mutation,
    // Convenience aliases
    loading: mutation.isPending,
    success: mutation.isSuccess,
    // Helper to execute with async/await
    mutateAsync: mutation.mutateAsync,
    // Reset helper
    clear: mutation.reset,
  };
}

// ============================================================================
// useFileUpload - File Upload Mutation with Progress
// ============================================================================

/**
 * File upload mutation with progress tracking
 *
 * @param {Object} options - Same as useApiMutation plus upload options
 * @param {Function} options.onProgress - Progress callback (percent) => void
 *
 * @example
 * const { mutate, progress, isUploading } = useFileUpload({
 *   endpoint: '/upload/image',
 *   invalidateKeys: [['images']],
 *   onProgress: (percent) => console.log(`Upload: ${percent}%`),
 * });
 *
 * // Upload file
 * const formData = new FormData();
 * formData.append('file', file);
 * mutate(formData);
 */
export function useFileUpload({
  endpoint,
  url,
  method = 'post',
  params,
  headers: customHeaders,
  axiosConfig = {},

  invalidateKeys = [],
  removeKeys = [],

  transformer = defaultTransformer,
  onProgress,
  onSuccess,
  onError,
  onSettled,

  meta = {},
  mutationOptions = {},
}) {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();
  const finalUrl = url || (endpoint ? getApiUrl(endpoint) : null);

  const handleProgress = useCallback(
    (progressEvent) => {
      const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
      setProgress(percent);
      onProgress?.(percent);
    },
    [onProgress]
  );

  const mutation = useMutation({
    mutationKey: finalUrl ? [finalUrl, 'upload'] : undefined,
    mutationFn: async (formData) => {
      if (!finalUrl) {
        throw new Error('useFileUpload: No endpoint or url provided');
      }

      setIsUploading(true);
      setProgress(0);

      try {
        const response = await ApiCaller.request({
          url: finalUrl,
          method,
          params,
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
            ...customHeaders,
          },
          onUploadProgress: handleProgress,
          withCredentials: false,
          ...axiosConfig,
        });

        return transformer(response);
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: (data, variables, context) => {
      setProgress(100);

      if (invalidateKeys.length > 0) {
        invalidateKeys.forEach((key) => {
          const queryKey = Array.isArray(key) ? key : [key];
          queryClient.invalidateQueries({ queryKey });
        });
      }

      if (removeKeys.length > 0) {
        removeKeys.forEach((key) => {
          const queryKey = Array.isArray(key) ? key : [key];
          queryClient.removeQueries({ queryKey });
        });
      }

      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      setProgress(0);
      onError?.(error, variables, context);
    },
    onSettled,
    retry: 0, // No retry for uploads
    meta: {
      showErrorNotification: true,
      showSuccessNotification: false,
      ...meta,
    },
    ...mutationOptions,
  });

  return {
    ...mutation,
    progress,
    isUploading,
    loading: mutation.isPending,
    resetProgress: () => setProgress(0),
  };
}

// ============================================================================
// Preset Mutation Hooks for Common Operations
// ============================================================================

/**
 * POST mutation with cache invalidation
 */
export function useCreate(options) {
  return useApiMutation({
    ...options,
    method: 'post',
  });
}

/**
 * PUT/PATCH mutation with cache invalidation
 */
export function useUpdate(options) {
  return useApiMutation({
    ...options,
    method: options.method || 'put',
  });
}

/**
 * DELETE mutation with cache invalidation
 */
export function useDelete(options) {
  return useApiMutation({
    ...options,
    method: 'delete',
  });
}

// ============================================================================
// Batch Mutations
// ============================================================================

/**
 * Hook for executing multiple mutations in sequence
 *
 * @param {Object} options
 * @param {Array} options.mutations - Array of mutation configs
 * @param {Function} options.onAllSuccess - Called when all mutations succeed
 * @param {Function} options.onAnyError - Called when any mutation fails
 *
 * @example
 * const { execute, isLoading, results } = useBatchMutation({
 *   mutations: [
 *     { endpoint: '/item/1', method: 'delete' },
 *     { endpoint: '/item/2', method: 'delete' },
 *   ],
 *   onAllSuccess: () => console.log('All deleted'),
 * });
 */
export function useBatchMutation({
  mutations = [],
  onAllSuccess,
  onAnyError,
  invalidateKeys = [],
}) {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const execute = useCallback(
    async (dataArray = []) => {
      setIsLoading(true);
      setError(null);
      const executionResults = [];

      try {
        for (let i = 0; i < mutations.length; i++) {
          const config = mutations[i];
          const data = dataArray[i];
          const finalUrl = config.url || (config.endpoint ? getApiUrl(config.endpoint) : null);

          const response = await ApiCaller.request({
            url: finalUrl,
            method: config.method || 'post',
            params: config.params,
            data,
            headers: config.headers,
            withCredentials: false,
            ...config.axiosConfig,
          });

          executionResults.push({
            success: true,
            data: response.data?.data || response.data,
            index: i,
          });
        }

        setResults(executionResults);

        // Invalidate queries on success
        if (invalidateKeys.length > 0) {
          invalidateKeys.forEach((key) => {
            const queryKey = Array.isArray(key) ? key : [key];
            queryClient.invalidateQueries({ queryKey });
          });
        }

        onAllSuccess?.(executionResults);
        return executionResults;
      } catch (err) {
        const failedResult = {
          success: false,
          error: err,
          results: executionResults,
        };
        setError(err);
        onAnyError?.(err, executionResults);
        throw failedResult;
      } finally {
        setIsLoading(false);
      }
    },
    [mutations, onAllSuccess, onAnyError, invalidateKeys, queryClient]
  );

  return {
    execute,
    results,
    isLoading,
    error,
    reset: () => {
      setResults([]);
      setError(null);
    },
  };
}
