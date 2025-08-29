import { createSlice } from "@reduxjs/toolkit";
import { fetchFastOrderCategoryModeTableData } from "./fastOrderTableCategoryModeDataActions";


const fastOrderCategoryModeTableDataSlice = createSlice({
  name: "fastOrderCategoryModeTableData",  // Change name to category mode
  initialState: {
    tableData: [],  // Ensure this is initialized as an empty array or a default value
    loading: false,
    error: null,
  },
  reducers: {
    clearFastOrderCategoryModeTableData: (state) => {  // Clear category mode data
      state.tableData = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFastOrderCategoryModeTableData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFastOrderCategoryModeTableData.fulfilled, (state, action) => {
        state.loading = false;
        state.tableData = action.payload || [];
      })
      .addCase(fetchFastOrderCategoryModeTableData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearFastOrderCategoryModeTableData } = fastOrderCategoryModeTableDataSlice.actions;
export default fastOrderCategoryModeTableDataSlice.reducer;
