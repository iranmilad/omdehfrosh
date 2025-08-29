import { createSlice } from "@reduxjs/toolkit";
import { fetchFastEditCategoryModeTableData } from "./fastEditTableCategoryModeDataActions";


const fastEditCategoryModeTableDataSlice = createSlice({
  name: "fastEditCategoryModeTableData",  // Change name to category mode
  initialState: {
    tableData: [],  // Ensure this is initialized as an empty array or a default value
    loading: false,
    error: null,
  },
  reducers: {
    clearFastEditCategoryModeTableData: (state) => {  // Clear category mode data
      state.tableData = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFastEditCategoryModeTableData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFastEditCategoryModeTableData.fulfilled, (state, action) => {
        state.loading = false;
        state.tableData = action.payload || [];
      })
      .addCase(fetchFastEditCategoryModeTableData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearFastEditCategoryModeTableData } = fastEditCategoryModeTableDataSlice.actions;
export default fastEditCategoryModeTableDataSlice.reducer;
