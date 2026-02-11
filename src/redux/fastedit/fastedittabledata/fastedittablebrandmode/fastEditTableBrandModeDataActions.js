import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

// Action to fetch fast Edit brand mode table data
export const fetchFastEditBrandModeTableData = createAsyncThunk(
  "fastEditBrandModeTableData/fetch",
  async (payload, { rejectWithValue, getState }) => {
    

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
        uniqueIDClickedBrands, 
        uniqueIDClickedBrandsCategories, 
        filterBrandsCategorySubCategoryStorage,
        uniqueIDClickedCategories, 
        uniqueIDClickedSubCategories, 
        uniqueIDClickedSubCategoriesBrands,
        filters, // Extract filters to exclude it
        ...rest
      } = payload;
      
      // Handle both brand and category modes
      if (searchType === 'brand') {
        requestBody = [{
          searchType: searchType || 'brand', 
          uniqueIDClickedBrands: uniqueIDClickedBrands || [], 
          uniqueIDClickedBrandsCategories: uniqueIDClickedBrandsCategories || [], 
          filterBrandsCategorySubCategoryStorage: filterBrandsCategorySubCategoryStorage || []
          // filters removed
        }];
      } else {
        requestBody = [{
          searchType: searchType || 'category', 
          uniqueIDClickedCategories: uniqueIDClickedCategories || [], 
          uniqueIDClickedSubCategories: uniqueIDClickedSubCategories || [], 
          uniqueIDClickedSubCategoriesBrands: uniqueIDClickedSubCategoriesBrands || []
          // filters removed
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
        body: JSON.stringify(requestBody) // Send the processed array without filters
      });


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