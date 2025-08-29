import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

// Action to batch import price list data
export const batchImportPriceList = createAsyncThunk(
  "priceList/batchImport",
  async ({ priceList }, { rejectWithValue }) => {


    try {
      const response = await fetch(getApiUrl("/master-dash/pricelist/batch-import"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ priceList }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to batch import price list");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
