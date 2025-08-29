import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

// Action to batch import user account data
export const batchImportUserMyAccounts = createAsyncThunk(
  "userMyAccounts/batchImport",
  async ({ myAccountData }, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl("/user-myaccounts/batch-import"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({myAccountData} ), // Send user accounts data as body
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to batch import user account data");
      }

      const data = await response.json();
      return data; // Returns the imported user accounts or a success message
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
