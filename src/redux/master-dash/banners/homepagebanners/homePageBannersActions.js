import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

// Action to batch import home page banners
export const batchImportHomePageBanners = createAsyncThunk(
  "homePageBanners/batchImport",
  async ({ banners }, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl("/master-dash/banners/batch-import"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ banners }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to batch import banners");
      }

      const data = await response.json();
      return data; // Returns the imported banners or a success message
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
