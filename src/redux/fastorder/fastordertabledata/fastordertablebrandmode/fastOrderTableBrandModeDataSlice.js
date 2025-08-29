import { createSlice } from "@reduxjs/toolkit";
import { fetchFastOrderBrandModeTableData } from "./fastOrderTableBrandModeDataActions";



const fastOrderBrandModeTableDataSlice = createSlice({
  name: "fastOrderBrandModeTableData",
  initialState: {
    tableData: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearFastOrderBrandModeTableData: (state) => {
      state.tableData = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFastOrderBrandModeTableData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFastOrderBrandModeTableData.fulfilled, (state, action) => {
        state.loading = false;

        state.tableData = action.payload || [];
      })
      .addCase(fetchFastOrderBrandModeTableData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearFastOrderBrandModeTableData } = fastOrderBrandModeTableDataSlice.actions;
export default fastOrderBrandModeTableDataSlice.reducer;
