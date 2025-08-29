import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

// Action to batch import home page WideSliders
export const batchImportHomePageWideSliders = createAsyncThunk(
  "homePageWideSliders/batchImport",
  async ({ WideSliders }, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl("/master-dash/widesliders/batch-import"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify( {WideSliders} ), // Send WideSliders array as body
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to batch import WideSliders");
      }

      const data = await response.json();
      return data; // Returns the imported WideSliders or a success message
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
