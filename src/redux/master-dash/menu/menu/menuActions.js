import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

// Action to batch import menu data
export const batchImportMenu = createAsyncThunk(
  "menu/batchImport",
  async ({ menuData }, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl("/master-dash/menu/add-full-menu"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ menuData }), // Send menu structure as body
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to batch import menu data");
      }

      const data = await response.json();
      return data; // Returns the imported menu or a success message
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
