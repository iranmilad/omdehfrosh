import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

// Action to batch import single products
export const batchImportSingleProducts = createAsyncThunk(
  "singleProducts/batchImport",
  async ({ singleProducts }, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl("/master-dash/singleproducts/batch-import"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ singleProducts }), // Send products array as body
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to batch import single products");
      }

      const data = await response.json();
      return data; // Returns the imported products or a success message
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
