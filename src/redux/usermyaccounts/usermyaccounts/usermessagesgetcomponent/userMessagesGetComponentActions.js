// userMessagesGetComponentActions.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

// Action to get user notifications component (updated for simple notifications)
export const userMessagesGetComponent = createAsyncThunk(
  "userMessages/userMessagesGetComponent",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("user");

    try {
      const response = await fetch(getApiUrl('/user-myaccounts/user-messages/notification-component'), {
        method: "GET",
        headers: new Headers({
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json"
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to retrieve user messages component");
      }

      const data = await response.json();
      return data; // Returns { component, notificationIds, count }
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);

// Action to mark notification as read
// Action to mark notification as read using the existing setNotificationSeen endpoint
// Action to mark notification as read using the simplified setNotificationSeen endpoint
export const markNotificationAsRead = createAsyncThunk(
  "userMessages/markNotificationAsRead",
  async ({ notificationId, index }, { rejectWithValue }) => {
    const token = localStorage.getItem("user");

    try {
      const response = await fetch(getApiUrl('/user-myaccounts/notifications/set-seen'), {
        method: "POST",
        headers: new Headers({
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({ 
          notificationId: notificationId, // Direct _id of the notification
          isRead: true                    // Always set to true when marking as read
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to mark notification as read");
      }

      const data = await response.json();
      return { notificationId, index, ...data };
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);