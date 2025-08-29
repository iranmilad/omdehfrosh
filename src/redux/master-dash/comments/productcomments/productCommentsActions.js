import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

// Action to batch import product comments
export const batchImportProductComments = createAsyncThunk(
  "productComments/batchImport",
  async ({ productComments }, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl("/master-dash/product-comments/batch-import"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productComments }), // Send productComments array as body
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to batch import product comments");
      }

      const data = await response.json();
      return data; // Returns the imported comments or a success message
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
