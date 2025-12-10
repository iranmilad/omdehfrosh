import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

// Action to fetch fast Edit category mode table data
export const fetchFastEditCategoryModeTableData = createAsyncThunk(
  "fastEditCategoryModeTableData/fetch",
  async (payload, { rejectWithValue, getState }) => {

    console.log('🔥 Fast Edit Category Redux Action - Received payload:', payload);

    const token = localStorage.getItem("user");

    // Handle both array and object formats
    let requestBody;
    
    if (Array.isArray(payload)) {
      // New array format - remove filters from each item
      requestBody = payload.map(item => {
        const { filters, ...itemWithoutFilters } = item;
        return itemWithoutFilters;
      });
    } else {
      // Old object format - convert to array and remove filters
      const {
        searchType, 
        uniqueIDClickedCategories, 
        uniqueIDClickedSubCategories, 
        uniqueIDClickedSubCategoriesBrands,
        filters, // Extract filters to exclude it
        ...rest
      } = payload;
      
      requestBody = [{
        searchType: searchType || 'category', 
        uniqueIDClickedCategories: uniqueIDClickedCategories || [], 
        uniqueIDClickedSubCategories: uniqueIDClickedSubCategories || [], 
        uniqueIDClickedSubCategoriesBrands: uniqueIDClickedSubCategoriesBrands || []
        // filters removed
      }];
    }

    try {
      const response = await fetch(getApiUrl("/fast-edit-category-mode"), {
        method: "POST",
        headers: new Headers({
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        }),
        body: JSON.stringify(requestBody) // Send the processed array without filters
      });

      console.log('🔥 Fast Edit Category Redux Action - Sending to API (without filters):', requestBody);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to fetch fast edit category table data");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('🔥 Fast Edit Category Redux Action - Error:', error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);