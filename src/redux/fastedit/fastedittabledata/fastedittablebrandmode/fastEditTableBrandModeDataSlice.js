import { createSlice } from "@reduxjs/toolkit";
import { fetchFastEditBrandModeTableData } from "./fastEditTableBrandModeDataActions";



const fastEditBrandModeTableDataSlice = createSlice({
  name: "fastEditBrandModeTableData",
  initialState: {
    tableData: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearFastEditBrandModeTableData: (state) => {
      state.tableData = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFastEditBrandModeTableData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFastEditBrandModeTableData.fulfilled, (state, action) => {
        state.loading = false;

        state.tableData = action.payload || [];
      })
      .addCase(fetchFastEditBrandModeTableData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearFastEditBrandModeTableData } = fastEditBrandModeTableDataSlice.actions;
export default fastEditBrandModeTableDataSlice.reducer;
