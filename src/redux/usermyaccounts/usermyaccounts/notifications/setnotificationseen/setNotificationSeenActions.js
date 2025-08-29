import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../../Libs/utils/apiutils/apiutils";

// Action to mark a notification as read
export const setNotificationSeen = createAsyncThunk(
  "notificationSeen/setNotificationSeen", // Action type
  async ({ tableIndex, rowId, isRead }, { rejectWithValue }) => {
    const token = localStorage.getItem("user");

    try {
      const response = await fetch(getApiUrl("/user-myaccounts/notifications/set-seen"), {
        method: "POST",
        headers: new Headers({
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({ tableIndex, rowId, isRead })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to update notification status");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
