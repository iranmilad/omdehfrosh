import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

// 📌 Action to batch import archives
export const batchImportArchives = createAsyncThunk(
  "archives/batchImport",
  async ({ archives }, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl("/master-dash/archives/batch-import"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(archives), // Send archives array as body
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to batch import archives");
      }

      const data = await response.json();
      return data; // Returns the imported archives or a success message
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
