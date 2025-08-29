// src/redux/fastorder/fastordertabledata/fastordertabledatacategorymodesavedfilters/fastOrderTableDataCategoryModeSavedFiltersSlice.js

import { createSlice } from "@reduxjs/toolkit";
import { fetchCheckedRowsTableData } from "./fastOrderTableDataCategoryModeSavedFiltersActions";

const fastOrderTableDataCategoryModeSavedFiltersSlice = createSlice({
  name: "fastOrderTableDataCategoryModeSavedFilters",
  initialState: {
    tableDataFromSavedFilters: null,
    loadingTableDataFromSavedFilters: false,
    errorTableDataFromSavedFilters: null,
  },
  reducers: {
    clearCategoryModeCheckedRowsTableData: (state) => {
      state.tableDataFromSavedFilters = null;
      state.loadingTableDataFromSavedFilters = false;
      state.errorTableDataFromSavedFilters = null;
    },
    resetCategoryModeTableData: (state) => {
      state.tableDataFromSavedFilters = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCheckedRowsTableData.pending, (state) => {
        state.loadingTableDataFromSavedFilters = true;
        state.errorTableDataFromSavedFilters = null;
      })
      .addCase(fetchCheckedRowsTableData.fulfilled, (state, action) => {
        state.loadingTableDataFromSavedFilters = false;
        state.tableDataFromSavedFilters = action.payload || null;
      })
      .addCase(fetchCheckedRowsTableData.rejected, (state, action) => {
        state.loadingTableDataFromSavedFilters = false;
        state.errorTableDataFromSavedFilters = action.payload;
      });
  },
});

export const { 
  clearCategoryModeCheckedRowsTableData, 
  resetCategoryModeTableData 
} = fastOrderTableDataCategoryModeSavedFiltersSlice.actions;

export default fastOrderTableDataCategoryModeSavedFiltersSlice.reducer;