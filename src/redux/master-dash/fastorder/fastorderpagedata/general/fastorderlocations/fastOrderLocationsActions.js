import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../../../Libs/utils/apiutils/apiutils";

// Action to batch import locations data for fast order page
export const batchImportFastOrderLocations = createAsyncThunk(
  "fastOrderLocations/batchImport",
  async ({ availableLocations }, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl("/master-dash/fast-order-locations/batch-import"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ availableLocations }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to batch import locations");
      }

      const data = await response.json();
      return data; // Returns the imported locations or a success message
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
