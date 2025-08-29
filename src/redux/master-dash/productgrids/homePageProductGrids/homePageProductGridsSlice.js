import { createSlice } from "@reduxjs/toolkit";
import { batchImportHomePageProductGrids } from "./homePageProductGridsActions";

const homePageProductGridsSlice = createSlice({
  name: "homePageProductGrids",
  initialState: {
    productGrids: [],
    loading: false,
    error: null,
    successMessage: null, // For success message after batch import
  },
  reducers: {
    // Optional: Clear state if needed
    clearHomePageProductGridsState: (state) => {
      state.productGrids = [];
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(batchImportHomePageProductGrids.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(batchImportHomePageProductGrids.fulfilled, (state, action) => {
        state.loading = false;
        state.productGrids = action.payload.productGrids || [];
        state.successMessage = action.payload.message || "Product grids imported successfully!";
      })
      .addCase(batchImportHomePageProductGrids.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearHomePageProductGridsState } = homePageProductGridsSlice.actions;
export default homePageProductGridsSlice.reducer;
