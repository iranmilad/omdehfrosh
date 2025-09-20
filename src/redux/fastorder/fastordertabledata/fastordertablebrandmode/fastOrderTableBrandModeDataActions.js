import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";


export const fetchFastOrderBrandModeTableData = createAsyncThunk(
  "fastOrderBrandModeTableData/fetch",
  async (payload, { rejectWithValue }) => {

    console.log('🔥 Redux Action - Received payload:', payload);

    // Handle both array and object formats
    let requestBody;
    
    if (Array.isArray(payload)) {
      // New array format
      requestBody = payload;
    } else {
      // Old object format - convert to array
      const {
        searchType, 
        uniqueIDClickedBrands, 
        uniqueIDClickedBrandsCategories, 
        filterBrandsCategorySubCategoryStorage,
      } = payload;
      
      requestBody = [{
        searchType: searchType, 
        uniqueIDClickedBrands: uniqueIDClickedBrands, 
        uniqueIDClickedBrandsCategories: uniqueIDClickedBrandsCategories, 
        filterBrandsCategorySubCategoryStorage: filterBrandsCategorySubCategoryStorage,
      }];
    }

    try {
      const response = await fetch(getApiUrl("/fast-order-brand-mode"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });

      console.log('🔥 Redux Action - Sending to API:', requestBody);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to fetch table data");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('🔥 Redux Action - Error:', error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);