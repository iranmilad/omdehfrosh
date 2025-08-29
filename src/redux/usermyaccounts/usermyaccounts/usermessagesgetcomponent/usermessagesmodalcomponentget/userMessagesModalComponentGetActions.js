// userMessagesModalComponentGetActions.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../../Libs/utils/apiutils/apiutils";

// Action to get notification details by ID (replacing tableIndex/rowId with notificationId)
export const userMessagesModalComponentGet = createAsyncThunk(
  "userMessages/userMessagesModalComponentGet",
  async ({ notificationId }, { rejectWithValue }) => {
    const token = localStorage.getItem("user");

    try {
      const response = await fetch(
        getApiUrl(`/user-myaccounts/user-messages/notification-component/modal-component?notificationId=${notificationId}`),
        {
          method: "GET",
          headers: new Headers({
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json"
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to retrieve modal component");
      }

      const data = await response.json();
      return data; // Return the notification details
    } catch (error) {
      console.error("Network error while fetching modal:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);

// Alternative action to get notification details (if you need a simpler approach)
export const getNotificationDetails = createAsyncThunk(
  "userMessages/getNotificationDetails",
  async ({ notificationId }, { rejectWithValue }) => {
    const token = localStorage.getItem("user");

    try {
      const response = await fetch(
        getApiUrl(`/user-myaccounts/user-messages/notification/${notificationId}`),
        {
          method: "GET",
          headers: new Headers({
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json"
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to retrieve notification details");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Network error while fetching notification details:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);