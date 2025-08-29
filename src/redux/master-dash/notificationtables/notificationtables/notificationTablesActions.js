import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

// Action to batch import notification tables
export const batchImportNotificationTables = createAsyncThunk(
  "notificationTables/batchImport",
  async ({ notificationData }, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl("/master-dash/notification-tables/batch-import"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify( notificationData ), // Wrap in object
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to batch import notification tables");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
