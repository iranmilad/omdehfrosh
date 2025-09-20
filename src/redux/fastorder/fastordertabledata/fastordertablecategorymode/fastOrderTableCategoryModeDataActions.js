import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";


// Action to fetch fast Order category mode table data
export const fetchFastOrderCategoryModeTableData = createAsyncThunk(
  "fastOrderCategoryModeTableData/fetch",
  async (filtersArray, { rejectWithValue }) => {

    console.log('🔥 Category Redux Action - Received filtersArray:', filtersArray);

    try {
      const response = await fetch(getApiUrl("/fast-order-category-mode"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // credentials: "include",
        body: JSON.stringify(filtersArray) // Send the array directly
      });

      console.log('🔥 Category Redux Action - Sending to API:', filtersArray);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to fetch table data");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('🔥 Category Redux Action - Error:', error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);