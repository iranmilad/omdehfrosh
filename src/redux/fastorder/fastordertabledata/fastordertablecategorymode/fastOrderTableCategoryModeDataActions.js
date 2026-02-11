import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

export const fetchFastOrderCategoryModeTableData = createAsyncThunk(
  "fastOrderCategoryModeTableData/fetch",
  async (payload, { rejectWithValue, getState }) => {


    // Get current filters from state (if needed as fallback)
    const state = getState();
    const currentFilters = state.filters || {};

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
        uniqueIDClickedCategories, 
        uniqueIDClickedSubCategories, 
        uniqueIDClickedSubCategoriesBrands,
        filters, // Check if filters are already in payload
      } = payload;
      
      requestBody = [{
        searchType: searchType || 'category', 
        uniqueIDClickedCategories: uniqueIDClickedCategories || [], 
        uniqueIDClickedSubCategories: uniqueIDClickedSubCategories || [], 
        uniqueIDClickedSubCategoriesBrands: uniqueIDClickedSubCategoriesBrands || [],
        filters: filters || currentFilters // Use payload filters or current filters
      }];
    }

    try {
      const response = await fetch(getApiUrl("/fast-order-category-mode"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });


      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to fetch category table data");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('🔥 Category Redux Action - Error:', error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);