import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

// Action to fetch fast Edit brand mode table data
export const fetchFastEditBrandModeTableData = createAsyncThunk(
  "fastEditBrandModeTableData/fetch",
  async ({
    searchType, 
    uniqueIDClickedBrands, 
    uniqueIDClickedBrandsCategories, 
    filterBrandsCategorySubCategoryStorage,
    // supplierId
  }, { rejectWithValue }) => {

    const token = localStorage.getItem("user");

    try {
      const response = await fetch(getApiUrl("/fast-edit-brand-mode"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // credentials: "include",
        headers: new Headers({
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        }), 
        body: JSON.stringify({
          searchType: searchType, 
          uniqueIDClickedBrands: uniqueIDClickedBrands, 
          uniqueIDClickedBrandsCategories: uniqueIDClickedBrandsCategories, 
          filterBrandsCategorySubCategoryStorage: filterBrandsCategorySubCategoryStorage,
          // supplierId: supplierId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to fetch table data");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
