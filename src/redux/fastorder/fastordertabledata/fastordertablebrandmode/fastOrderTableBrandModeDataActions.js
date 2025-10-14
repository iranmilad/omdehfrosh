import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

export const fetchFastOrderBrandModeTableData = createAsyncThunk(
  "fastOrderBrandModeTableData/fetch",
  async (payload, { rejectWithValue, getState }) => {

    console.log('🔥 Redux Action - Received payload:', payload);

    // Get current filters from state (assuming they're stored in Redux)
    const state = getState();
    const currentFilters = state.filters || {};

    // Handle both array and object formats
    let requestBody;
    
    if (Array.isArray(payload)) {
      // New array format - add filters to each item
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
        filters, // Check if filters are already in payload
      } = payload;
      
      requestBody = [{
        searchType: searchType, 
        uniqueIDClickedBrands: uniqueIDClickedBrands, 
        uniqueIDClickedBrandsCategories: uniqueIDClickedBrandsCategories, 
        filterBrandsCategorySubCategoryStorage: filterBrandsCategorySubCategoryStorage,
        filters: filters || currentFilters // Use payload filters or current filters
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