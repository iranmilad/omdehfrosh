import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

// Action to fetch fast Edit category mode table data
export const fetchFastEditCategoryModeTableData = createAsyncThunk(
  "fastEditCategoryModeTableData/fetch",
  async ({
    searchType,
    supplierId,
    uniqueIDClickedCategories,
    uniqueIDClickedSubCategories,
    uniqueIDClickedSubCategoriesBrands
  }, { rejectWithValue }) => {

    const token = localStorage.getItem("user");

    try {
      const response = await fetch(getApiUrl("/fast-edit-category-mode"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        headers: new Headers({
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        }), 
        body: JSON.stringify({
          searchType,
          uniqueIDClickedCategories,
          uniqueIDClickedSubCategories,
          uniqueIDClickedSubCategoriesBrands
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
