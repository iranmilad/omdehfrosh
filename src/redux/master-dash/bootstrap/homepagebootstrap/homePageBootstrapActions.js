import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

// Action to batch import home page bootstrap
export const batchImportHomePageBootstrap = createAsyncThunk(
  "homePageBootstrap/batchImport",
  async ({ bootstrap }, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl("/master-dash/bootstrap/batch-import"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bootstrap }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to batch import bootstrap");
      }

      const data = await response.json();
      return data; // Returns the imported bootstrap or a success message
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
