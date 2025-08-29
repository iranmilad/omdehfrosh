import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

// Action to batch import My Account tickets
export const batchImportMyAccountTickets = createAsyncThunk(
  "myAccountTickets/batchImport",
  async ({ tickets }, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl("/master-dash/tickets/batch-import"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tickets }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to batch import tickets");
      }

      const data = await response.json();
      return data; // Returns imported tickets or success message
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
