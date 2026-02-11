// searchActions.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../Libs/utils/apiutils/apiutils";

// In-memory store to track last fetch timestamps (throttling)
const lastFetchTimes = new Map();
const THROTTLE_DURATION = 2000; // 2 seconds for search

// Helper function to check if we can make an API call (throttling check)
export const canFetchSearch = (query, forceRefresh = false) => {
  if (!query || query.length < 3 || forceRefresh) return true;
  
  const now = Date.now();
  const lastFetchTime = lastFetchTimes.get(query);
  
  if (!lastFetchTime) return true;
  
  const timeSinceLastFetch = now - lastFetchTime;
  return timeSinceLastFetch >= THROTTLE_DURATION;
};

// Helper function to get remaining throttle time
export const getRemainingThrottleTime = (query) => {
  const lastFetchTime = lastFetchTimes.get(query);
  if (!lastFetchTime) return 0;
  
  const now = Date.now();
  const timeSinceLastFetch = now - lastFetchTime;
  const remaining = THROTTLE_DURATION - timeSinceLastFetch;
  
  return remaining > 0 ? remaining : 0;
};

export const getSearchResults = createAsyncThunk(
  "search/getSearchResults",
  async (options = {}, { rejectWithValue }) => {
    const { query, forceRefresh = false } = options;


    // Validate query length
    if (!query || query.length < 3) {
      return rejectWithValue("Query must be at least 3 characters");
    }

    // Check throttling
    if (!forceRefresh && !canFetchSearch(query)) {
      const remainingTime = getRemainingThrottleTime(query);
      return rejectWithValue(`Please wait ${Math.ceil(remainingTime / 1000)} seconds before searching again`);
    }

    try {
      // Record the fetch time
      lastFetchTimes.set(query, Date.now());

      // Build the URL with the correct parameter name
      const url = getApiUrl(`/search?query=${encodeURIComponent(query)}`);
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
        // credentials: "include"
      });


      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      
      const payload = {
        query,
        results: data,
        timestamp: Date.now()
      };
      
      
      return payload;
    } catch (error) {
      return rejectWithValue(error.message || "Network error or server not responding");
    }
  }
);

// Utility function to clear throttle for specific query
export const clearSearchThrottle = (query) => {
  if (query) {
    lastFetchTimes.delete(query);
  }
};

// Utility function to clear all throttles
export const clearAllSearchThrottles = () => {
  lastFetchTimes.clear();
};

// Utility function to clean expired throttle entries (for memory management)
export const cleanExpiredThrottles = () => {
  const now = Date.now();
  for (const [query, timestamp] of lastFetchTimes.entries()) {
    if (now - timestamp >= THROTTLE_DURATION) {
      lastFetchTimes.delete(query);
    }
  }
};

// Helper function to force refresh search results
export const refreshSearchResults = (query) => {
  return getSearchResults({ query, forceRefresh: true });
};