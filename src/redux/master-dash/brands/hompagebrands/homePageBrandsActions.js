import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

export const batchImportHomePageBrands = createAsyncThunk(
    "homePageBrands/batchImport",
    async ({ brands }, { rejectWithValue }) => {
  
      try {
        const response = await fetch(getApiUrl("/master-dash/brands/batch-import"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // If needed for authentication
          body: JSON.stringify({ brands }), // Wrap brands in an array
        });
  
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          return rejectWithValue(errorData?.message || "Failed to batch import brands");
        }
  
        const data = await response.json();
        return data; // Success response
      } catch (error) {
        console.error("Network error:", error);
        return rejectWithValue("Network error or server not responding");
      }
    }
  );
  