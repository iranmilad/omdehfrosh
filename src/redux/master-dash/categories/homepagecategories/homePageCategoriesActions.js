import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

// Action to batch import home page categories
export const batchImportHomePageCategories = createAsyncThunk(
  "homePageCategories/batchImport",
  async ({ categories }, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl("/master-dash/categories/batch-import"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ categories }), // Send categories array as body
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to batch import categories");
      }

      const data = await response.json();
      return data; // Returns the imported categories or a success message
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
