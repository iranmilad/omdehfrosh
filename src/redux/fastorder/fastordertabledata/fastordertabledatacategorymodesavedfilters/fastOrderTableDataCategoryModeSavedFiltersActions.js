// src/redux/fastorder/fastordertabledata/fastordertabledatacategorymodesavedfilters/fastOrderTableDataCategoryModeSavedFiltersActions.js

import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

export const fetchCheckedRowsTableData = createAsyncThunk(
  "fastOrderTableDataCategoryModeSavedFilters/fetch",
  async ({ checkedRowIds, searchType }, { rejectWithValue }) => {
    try {

const response = await fetch(
  getApiUrl(`/fast-order-category-mode/fetch-table-by-ids?searchType=${searchType}`),
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ ids: Array.from(checkedRowIds) }),
  }
);
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