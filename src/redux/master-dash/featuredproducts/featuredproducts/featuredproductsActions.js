import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

// Action to batch import home page FeaturedProducts
export const batchImportHomePageFeaturedProducts = createAsyncThunk(
  "homePageFeaturedProducts/batchImport",
  async ({ featuredproducts }, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl("/master-dash/featuredproducts/batch-import"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify( {featuredproducts} ), // Send FeaturedProducts array as body
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to batch import FeaturedProducts");
      }

      const data = await response.json();
      return data; // Returns the imported FeaturedProducts or a success message
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
