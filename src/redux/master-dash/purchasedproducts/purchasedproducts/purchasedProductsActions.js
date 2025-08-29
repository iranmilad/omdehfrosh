import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

// Action to batch import purchased products
export const batchImportPurchasedProducts = createAsyncThunk(
  "purchasedProducts/batchImport", 
  async ({ purchasedProducts }, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl("/master-dash/purchasedproducts/batch-import"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ purchasedProducts }), // Send purchased products array as body
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to batch import purchased products");
      }

      const data = await response.json();
      return data; // Returns the imported purchased products or a success message
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
