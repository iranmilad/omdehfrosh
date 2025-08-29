import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../../Libs/utils/apiutils/apiutils";

export const getNotificationNumber = createAsyncThunk(
  "notificationNumber/getNotificationNumber",
  async (options = {}, { rejectWithValue }) => {
    const { forceRefresh = false } = options;
    const token = localStorage.getItem("user");
    
    if (!token) {
      return rejectWithValue("No authentication token found");
    }

    // Create a session key based on the token
    const sessionKey = `notifications_fetched_${btoa(token).slice(0, 16)}`;
    
    if (!forceRefresh) {
      const alreadyFetched = sessionStorage.getItem(sessionKey);
      const cachedData = sessionStorage.getItem(`${sessionKey}_data`);
      
      if (alreadyFetched && cachedData) {
        try {
          return JSON.parse(cachedData);
        } catch (error) {
          sessionStorage.removeItem(sessionKey);
          sessionStorage.removeItem(`${sessionKey}_data`);
        }
      }
    } else {
    }

    try {
      const response = await fetch(getApiUrl("/user-myaccounts/notifications/number"), {
        method: "GET",
        headers: new Headers({
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to retrieve notification count");
      }

      const data = await response.json();
      
      // Cache the result in sessionStorage
      sessionStorage.setItem(sessionKey, 'true');
      sessionStorage.setItem(`${sessionKey}_data`, JSON.stringify(data));
      
      return data;
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);

// Utility function to clear notification cache (call on logout)
export const clearNotificationCache = () => {
  // Clear all notification cache entries
  for (let i = sessionStorage.length - 1; i >= 0; i--) {
    const key = sessionStorage.key(i);
    if (key && key.startsWith('notifications_fetched_')) {
      sessionStorage.removeItem(key);
      sessionStorage.removeItem(`${key}_data`);
    }
  }
};

// Helper function to force refresh notification count
export const refreshNotificationCount = () => {
  return getNotificationNumber({ forceRefresh: true });
};