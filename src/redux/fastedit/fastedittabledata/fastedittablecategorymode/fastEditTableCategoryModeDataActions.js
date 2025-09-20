import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

// Action to fetch fast Edit category mode table data
export const fetchFastEditCategoryModeTableData = createAsyncThunk(
  "fastEditCategoryModeTableData/fetch",
  async (filtersArray, { rejectWithValue }) => {

    console.log('🔥 Fast Edit Category Redux Action - Received filtersArray:', filtersArray);

    const token = localStorage.getItem("user");

    try {
      const response = await fetch(getApiUrl("/fast-edit-category-mode"), {
        method: "POST",
        headers: new Headers({
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        }),
        body: JSON.stringify(filtersArray) // Send the array directly
      });

      console.log('🔥 Fast Edit Category Redux Action - Sending to API:', filtersArray);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to fetch table data");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('🔥 Fast Edit Category Redux Action - Error:', error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);