// getSingleProductDetailsActions.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";

// In-memory store to track last fetch timestamps (no caching, just throttling)
const lastFetchTimes = new Map();
const THROTTLE_DURATION = 10000; // 10 seconds in milliseconds

// Helper function to check if we can make an API call (throttling check)
export const canFetchProduct = (slug, forceRefresh = false) => {
  if (!slug || forceRefresh) return true;
  
  const now = Date.now();
  const lastFetchTime = lastFetchTimes.get(slug);
  
  if (!lastFetchTime) return true;
  
  const timeSinceLastFetch = now - lastFetchTime;
  return timeSinceLastFetch >= THROTTLE_DURATION;
};

// Helper function to get remaining throttle time
export const getRemainingThrottleTime = (slug) => {
  const lastFetchTime = lastFetchTimes.get(slug);
  if (!lastFetchTime) return 0;
  
  const now = Date.now();
  const timeSinceLastFetch = now - lastFetchTime;
  const remaining = THROTTLE_DURATION - timeSinceLastFetch;
  
  return remaining > 0 ? remaining : 0;
};

export const getSingleProductDetails = createAsyncThunk(
  "singleProduct/getSingleProductDetails",
  async (options = {}, { rejectWithValue }) => {
    const { slug } = options;
    


    try {
      const response = await fetch(getApiUrl(`/singleproduct/${slug}`), {
        method: "GET",
        headers: new Headers({
          "Content-Type": "application/json"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to retrieve product details");
      }

      const data = await response.json();
      
      // No caching - just return fresh data
      return data;
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);

// Utility function to clear throttle for specific product
export const clearProductThrottle = (slug) => {
  if (slug) {
    lastFetchTimes.delete(slug);
  }
};

// Utility function to clear all throttles
export const clearAllProductThrottles = () => {
  lastFetchTimes.clear();
};

// Utility function to clean expired throttle entries (optional - for memory management)
export const cleanExpiredThrottles = () => {
  const now = Date.now();
  for (const [slug, timestamp] of lastFetchTimes.entries()) {
    if (now - timestamp >= THROTTLE_DURATION) {
      lastFetchTimes.delete(slug);
    }
  }
};

// Helper function to force refresh product data
export const refreshProductDetails = (slug) => {
  return getSingleProductDetails({ slug, forceRefresh: true });
};