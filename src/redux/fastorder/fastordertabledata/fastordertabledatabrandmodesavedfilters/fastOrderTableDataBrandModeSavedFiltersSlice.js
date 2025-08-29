// src/redux/features/checkedRowsTableData/checkedRowsTableDataSlice.js

import { createSlice } from "@reduxjs/toolkit";
import { fetchCheckedRowsTableData } from "./fastOrderTableDataBrandModeSavedFiltersActions";

const checkedRowsTableDataSlice = createSlice({
  name: "checkedRowsTableData",
  initialState: {
    tableDataFromSavedFilters: [],
    loadingTableDataFromSavedFilters: false,
    errorTableDataFromSavedFilters: null,
  },
  reducers: {
    clearCheckedRowsTableData: (state) => {
      state.tableDataFromSavedFilters = [];
      state.loadingTableDataFromSavedFilters = false;
      state.errorTableDataFromSavedFilters = null;
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
        state.tableDataFromSavedFilters = action.payload || [];
      })
      .addCase(fetchCheckedRowsTableData.rejected, (state, action) => {
        state.loadingTableDataFromSavedFilters = false;
        state.errorTableDataFromSavedFilters = action.payload;
      });
  },
});

export const { clearCheckedRowsTableData } = checkedRowsTableDataSlice.actions;
export default checkedRowsTableDataSlice.reducer;
