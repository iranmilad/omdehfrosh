import { useState } from "react";
import { useMutation, useQuery, keepPreviousData } from "@tanstack/react-query";
import ApiCaller from "./axiosEndpoint";

// Cache time presets (in milliseconds)
export const CACHE_TIME = {
	NONE: 0,                    // No cache - always fetch (critical APIs)
	SHORT: 30 * 1000,           // 30 seconds
	MEDIUM: 2 * 60 * 1000,      // 2 minutes
	LONG: 5 * 60 * 1000,        // 5 minutes
	SESSION: 30 * 60 * 1000,    // 30 minutes (session-like)
};

// Stale time presets - how long data is considered fresh
export const STALE_TIME = {
	NONE: 0,                    // Always stale - refetch on every mount
	SHORT: 15 * 1000,           // 15 seconds
	MEDIUM: 1 * 60 * 1000,      // 1 minute
	LONG: 5 * 60 * 1000,        // 5 minutes
	SESSION: 15 * 60 * 1000,    // 15 minutes
};

/**
 * useData hook with caching support
 *
 * @param {Object} options
 * @param {string} options.url - API endpoint
 * @param {Object} options.params - Query params
 * @param {Array} options.queryKey - React Query key
 * @param {string} options.method - HTTP method (default: "get")
 * @param {Object} options.bodyData - Request body
 * @param {Object} options.axiosOption - Axios options
 * @param {Object} options.queryOptions - React Query options
 * @param {boolean} options.critical - If true, always fetch fresh data (no cache)
 * @param {number} options.staleTime - Custom stale time (use STALE_TIME presets)
 * @param {number} options.cacheTime - Custom cache time (use CACHE_TIME presets)
 *
 * @example
 * // Critical API - always fresh
 * useData({ url: '/cart', queryKey: ['cart'], critical: true })
 *
 * // Non-critical with medium cache
 * useData({ url: '/products', queryKey: ['products'], staleTime: STALE_TIME.MEDIUM })
 *
 * // Long cache for static data
 * useData({ url: '/categories', queryKey: ['categories'], staleTime: STALE_TIME.LONG, cacheTime: CACHE_TIME.SESSION })
 */
export function useData({
	url,
	params,
	queryKey,
	method = "get",
	bodyData,
	axiosOption,
	queryOptions,
	critical = false,
	staleTime: customStaleTime,
	cacheTime: customCacheTime,
}) {
	// Determine cache settings based on critical flag or custom values
	const staleTime = critical ? STALE_TIME.NONE : (customStaleTime ?? STALE_TIME.MEDIUM);
	const gcTime = critical ? CACHE_TIME.NONE : (customCacheTime ?? CACHE_TIME.MEDIUM);

	return useQuery({
		queryKey,
		queryFn: async () => {

			let { data } = await ApiCaller.request({
				params,
				method,
				url,
				withCredentials: false,
				data: bodyData,
				...axiosOption
			});

			if(data?.data) return data?.data;

			else {
				return data
			}

		},
		staleTime,
		gcTime, // gcTime replaced cacheTime in React Query v5
		refetchInterval: false,
		retry: critical ? 1 : false,
		retryOnMount: critical,
		refetchOnWindowFocus: critical,
		refetchOnMount: critical ? 'always' : false,
		placeholderData: keepPreviousData,
		throwOnError: false,
		...queryOptions,
	});
}

export function useSend({ url, params, method = "post", axiosOption }) {
	return useMutation({
		mutationKey: `${url}_${method}`,
		mutationFn: async (bodyData) => {
			let { data } = await ApiCaller.request({
				url,
				data: bodyData,
				method: method,
				params,
				withCredentials: false,
				...axiosOption,
			});
			if(data?.data) return data?.data;
			else {
				return data
			}

		},
		retry: false,
	});
}

export const useFileUploadMutation = (url) => {
	const [progress, setProgress] = useState(0);

	const mutation = useMutation({
		mutationKey: url,
		mutationFn: async (bodyData) => {
			let { data } = await ApiCaller.post(url, bodyData, {
				onUploadProgress: (ev) => {
					setProgress(Math.round((ev.loaded / ev.total) * 100));
				},
				headers: {
					"Content-type": "multipart/form-data",
					"Access-Control-Allow-Origin": "*",
				},
			});
			return data;
		},
	});

	return { ...mutation, progress };
};

export const queryClientConfig = {
	defaultOptions: {
		queries: {
			retry: 1,
			staleTime: STALE_TIME.MEDIUM,      // Default: 1 minute before data is stale
			gcTime: CACHE_TIME.MEDIUM,          // Default: 2 minutes cache (gcTime = cacheTime in v5)
			refetchOnMount: false,              // Don't refetch if data is fresh
			refetchOnWindowFocus: false,        // Don't refetch on tab focus
			refetchOnReconnect: true,           // Refetch when internet reconnects
			refetchInterval: false,
			refetchIntervalInBackground: false,
			suspense: false,
		},
		mutations: {
			retry: 1,
		},
	},
};