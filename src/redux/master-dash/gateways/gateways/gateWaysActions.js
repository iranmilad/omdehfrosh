import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

// Action to batch import gateways
export const batchImportGateways = createAsyncThunk(
  "gateways/batchImport", 
  async ({ gateways }, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl("/master-dash/gateways/batch-import"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({gateways}), // Send gateways array as body
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to batch import gateways");
      }

      const data = await response.json();
      return data; // Returns the imported gateways or a success message
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
