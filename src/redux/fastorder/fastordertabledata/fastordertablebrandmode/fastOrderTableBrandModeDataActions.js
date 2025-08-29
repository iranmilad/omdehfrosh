import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

// Action to fetch fast Order brand mode table data
export const fetchFastOrderBrandModeTableData = createAsyncThunk(
  "fastOrderBrandModeTableData/fetch",
  async ({
    searchType, 
    uniqueIDClickedBrands, 
    uniqueIDClickedBrandsCategories, 
    filterBrandsCategorySubCategoryStorage,
  }, { rejectWithValue }) => {


    try {
      const response = await fetch(getApiUrl("/fast-order-brand-mode"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // credentials: "include",
        body: JSON.stringify({
          searchType: searchType, 
          uniqueIDClickedBrands: uniqueIDClickedBrands, 
          uniqueIDClickedBrandsCategories: uniqueIDClickedBrandsCategories, 
          filterBrandsCategorySubCategoryStorage: filterBrandsCategorySubCategoryStorage,
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to fetch table data");
      }


      const data = await response.json();

      return data;
    } catch (error) {
      return rejectWithValue("Network error or server not responding");
    }
  }
);
