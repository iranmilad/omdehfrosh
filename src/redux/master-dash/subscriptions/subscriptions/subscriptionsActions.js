import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

// Action to batch import subscription plans
export const batchImportSubscriptions = createAsyncThunk(
  "subscriptions/batchImport",
  async ({ subscriptions }, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl("/master-dash/subscriptions/batch-import"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ subscriptions: subscriptions }), // Wrap inside an object
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to batch import subscriptions");
      }

      const data = await response.json();
      return data; // Returns the imported subscriptions or a success message
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
