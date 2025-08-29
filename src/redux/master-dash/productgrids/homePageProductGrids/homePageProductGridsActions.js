import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

// Action to batch import home page product grids
export const batchImportHomePageProductGrids = createAsyncThunk(
  "homePageProductGrids/batchImport",
  async ({ productGrid }, { rejectWithValue }) => {

    try {
      const response = await fetch(getApiUrl("/master-dash/productgrids/batch-import"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify( {productGrid} ) // Wrap inside an object
    });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to batch import product grids");
      }

      const data = await response.json();
      return data; // Returns the imported product grids or a success message
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
