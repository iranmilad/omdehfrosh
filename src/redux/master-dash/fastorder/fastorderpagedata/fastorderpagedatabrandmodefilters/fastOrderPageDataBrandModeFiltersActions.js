import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../../Libs/utils/apiutils/apiutils";

// Action to batch import filters for fast order brand mode page
export const batchImportFastOrderBrandModeFilters = createAsyncThunk(
  "fastOrderBrandModeFilters/batchImport",
  async ({ filters }, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl("/master-dash/fast-order-brand-mode-page-data-filters/batch-import"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ filters }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to batch import filters");
      }

      const data = await response.json();
      return data; // Returns the imported filters or a success message
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
