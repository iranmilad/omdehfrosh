import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../../../Libs/utils/apiutils/apiutils";

// Action to batch import brands data for fast order page
export const batchImportFastOrderPageBrands = createAsyncThunk(
  "fastOrderPageBrands/batchImport",
  async ({ brands }, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl("/master-dash/fast-order-brand-mode-page-data/batch-import"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ brands }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to batch import brands");
      }

      const data = await response.json();
      return data; // Returns the imported brands or a success message
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
