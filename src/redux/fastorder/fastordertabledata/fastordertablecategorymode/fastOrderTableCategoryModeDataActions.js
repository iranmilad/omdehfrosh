import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

// Action to fetch fast Order category mode table data
export const fetchFastOrderCategoryModeTableData = createAsyncThunk(
  "fastOrderCategoryModeTableData/fetch",
  async ({
    searchType,
    uniqueIDClickedCategories,
    uniqueIDClickedSubCategories,
    uniqueIDClickedSubCategoriesBrands
  }, { rejectWithValue }) => {


    try {
      const response = await fetch(getApiUrl("/fast-order-category-mode"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // credentials: "include",
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
