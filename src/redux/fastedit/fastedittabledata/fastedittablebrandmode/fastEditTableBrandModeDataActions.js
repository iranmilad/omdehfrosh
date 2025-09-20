import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

// Action to fetch fast Edit brand mode table data
export const fetchFastEditBrandModeTableData = createAsyncThunk(
  "fastEditBrandModeTableData/fetch",
  async (payload, { rejectWithValue, getState }) => {
    
    console.log('🔥 Fast Edit Redux Action - Received payload:', payload);

    // Get current filters from state (if needed as fallback)
    const state = getState();
    const currentFilters = state.filters || {};

    const token = localStorage.getItem("user");

    // Handle both array and object formats
    let requestBody;
    
    if (Array.isArray(payload)) {
      // New array format - ensure each item has filters
      requestBody = payload.map(item => ({
        ...item,
        filters: item.filters || currentFilters // Use item filters if provided, otherwise use current filters
      }));
    } else {
      // Old object format - convert to array and add filters
      const {
        searchType, 
        uniqueIDClickedBrands, 
        uniqueIDClickedBrandsCategories, 
        filterBrandsCategorySubCategoryStorage,
        uniqueIDClickedCategories, 
        uniqueIDClickedSubCategories, 
        uniqueIDClickedSubCategoriesBrands,
        filters, // Check if filters are already in payload
      } = payload;
      
      // Handle both brand and category modes
      if (searchType === 'brand') {
        requestBody = [{
          searchType: searchType || 'brand', 
          uniqueIDClickedBrands: uniqueIDClickedBrands || [], 
          uniqueIDClickedBrandsCategories: uniqueIDClickedBrandsCategories || [], 
          filterBrandsCategorySubCategoryStorage: filterBrandsCategorySubCategoryStorage || [],
          filters: filters || currentFilters // Use payload filters or current filters
        }];
      } else {
        requestBody = [{
          searchType: searchType || 'category', 
          uniqueIDClickedCategories: uniqueIDClickedCategories || [], 
          uniqueIDClickedSubCategories: uniqueIDClickedSubCategories || [], 
          uniqueIDClickedSubCategoriesBrands: uniqueIDClickedSubCategoriesBrands || [],
          filters: filters || currentFilters // Use payload filters or current filters
        }];
      }
    }

    try {
      const response = await fetch(getApiUrl("/fast-edit-brand-mode"), {
        method: "POST",
        headers: new Headers({
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        }),
        body: JSON.stringify(requestBody) // Send the processed array
      });

      console.log('🔥 Fast Edit Redux Action - Sending to API:', requestBody);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to fetch fast edit table data");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('🔥 Fast Edit Redux Action - Error:', error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);