import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

// 📌 Action to batch import trend products
export const batchImportTrendProducts = createAsyncThunk(
  "trendProducts/batchImport",
  async ({ trendProducts }, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl("/master-dash/trendproducts/batch-import"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ products: trendProducts }), // Send trendProducts array as body
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to batch import trend products");
      }

      const data = await response.json();
      return data; // Returns the imported trend products or a success message
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
