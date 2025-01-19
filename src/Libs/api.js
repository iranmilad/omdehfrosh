import { useState } from "react";
import { useMutation, useQuery,keepPreviousData } from "@tanstack/react-query";
import ApiCaller from "./axiosEndpoint";

export function useData({ url, params,queryKey,method = "get",bodyData, axiosOption, queryOptions }) {
	return useQuery({
		queryKey,
		queryFn: async () => {
			let { data } = await ApiCaller.request({
				params,
				method,
				url,
				data: bodyData,
				...axiosOption
			});
			return data?.data;
		},
		staleTime: false,
		refetchInterval: false,
		retry: false,
		retryOnMount: false,
		refetchOnWindowFocus: false,
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
			retry: 2,
			staleTime: false, // 30seconds
			cacheTime: false, //30 seconds
			refetchOnMount: "always",
			refetchOnWindowFocus: "always",
			refetchOnReconnect: "always",
			refetchInterval: false, //30 seconds
			refetchIntervalInBackground: false,
			suspense: false,
		},
		mutations: {
			retry: 2,
		},
	},
};