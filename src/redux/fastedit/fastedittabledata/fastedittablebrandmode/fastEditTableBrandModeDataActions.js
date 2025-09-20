import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

// Action to fetch fast Edit brand mode table data
export const fetchFastEditBrandModeTableData = createAsyncThunk(
  "fastEditBrandModeTableData/fetch",
  async (filtersArray, { rejectWithValue }) => {
    
    console.log('🔥 Fast Edit Redux Action - Received filtersArray:', filtersArray);

    const token = localStorage.getItem("user");

    try {
      const response = await fetch(getApiUrl("/fast-edit-brand-mode"), {
        method: "POST",
        headers: new Headers({
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        }),
        body: JSON.stringify(filtersArray) // Send the array directly
      });

      console.log('🔥 Fast Edit Redux Action - Sending to API:', filtersArray);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to fetch table data");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('🔥 Fast Edit Redux Action - Error:', error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);