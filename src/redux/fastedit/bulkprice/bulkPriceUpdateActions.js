import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";
import getHttpCodeMessage from "../../../Libs/httpcodes/httpcodes";

export const bulkUpdatePrices = createAsyncThunk(
  "bulkPriceUpdate/bulkUpdatePrices",
  async ({ searchType, filters, percentage }, { rejectWithValue }) => {
    const token = localStorage.getItem("user");

    try {
      const response = await fetch(getApiUrl("/fastedit/bulk-price-update"), {
        method: "POST",
        headers: new Headers({
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          searchType,
          filters,
          percentage
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        const error = {
          status: response.status,
          message: errorData?.message || getHttpCodeMessage(response.status),
        };

        return rejectWithValue(error);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue({
        status: 500,
        message: "Network error or server not responding"
      });
    }
  }
);

// Action to clear state
export const clearBulkPriceUpdateState = () => ({
  type: "bulkPriceUpdate/clearState"
});